import tensorflow as tf
import numpy as np
import json
import sys
from pathlib import Path
from datetime import datetime

def load_data(sessions_file: str, logs_file: str):
    with open(sessions_file, 'r') as f:
        sessions = json.load(f)
    with open(logs_file, 'r') as f:
        logs = json.load(f)
    return sessions, logs

def preprocess_data(sessions, logs):
    # Group logs by session
    session_logs = {}
    for log in logs:
        session_id = log['session_id']
        if session_id not in session_logs:
            session_logs[session_id] = []
        session_logs[session_id].append(log)
    
    # Extract features
    features = []
    for session in sessions:
        session_id = session['id']
        if session_id in session_logs:
            session_data = session_logs[session_id]
            session_data.sort(key=lambda x: datetime.fromisoformat(x['created_at'].replace('Z', '+00:00')))
            
            for log in session_data:
                feature = [
                    float(log.get('output_power', 0) or 0),
                    float(log.get('battery_level', 0) or 0),
                    float(log.get('consumption', 0) or 0),
                    1.0 if log.get('status') == 'Error' else 0.0,
                    1.0 if log.get('connector_status') == 'Connected' else 0.0
                ]
                features.append(feature)
    
    return np.array(features)

def create_model(input_shape):
    model = tf.keras.Sequential([
        tf.keras.layers.LSTM(64, return_sequences=True, input_shape=input_shape),
        tf.keras.layers.LSTM(32),
        tf.keras.layers.Dense(16, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(5)
    ])
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='mse',
        metrics=['mae']
    )
    
    return model

def main():
    if len(sys.argv) != 3:
        print('Usage: train_model.py <sessions_file> <logs_file>')
        sys.exit(1)

    sessions_file = sys.argv[1]
    logs_file = sys.argv[2]
    
    # Load and preprocess data
    sessions, logs = load_data(sessions_file, logs_file)
    features = preprocess_data(sessions, logs)
    
    # Normalize data
    scaler = tf.keras.preprocessing.StandardScaler()
    normalized_features = scaler.fit_transform(features)
    
    # Create sequences
    seq_length = 5
    X, y = [], []
    for i in range(len(normalized_features) - seq_length):
        X.append(normalized_features[i:i + seq_length])
        y.append(normalized_features[i + seq_length])
    
    X = np.array(X)
    y = np.array(y)
    
    # Split data
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    # Create and train model
    model = create_model((seq_length, X.shape[2]))
    
    history = model.fit(
        X_train, y_train,
        epochs=50,
        batch_size=32,
        validation_data=(X_test, y_test),
        callbacks=[
            tf.keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=5,
                restore_best_weights=True
            )
        ]
    )
    
    # Save model and scaler
    models_dir = Path('models')
    models_dir.mkdir(exist_ok=True)
    
    model.save(models_dir / 'ev_charging_model')
    np.save(models_dir / 'scaler_params.npy', {
        'mean': scaler.mean_,
        'scale': scaler.scale_
    })
    
    # Output results
    results = {
        'training_loss': float(history.history['loss'][-1]),
        'validation_loss': float(history.history['val_loss'][-1]),
        'training_mae': float(history.history['mae'][-1]),
        'validation_mae': float(history.history['val_mae'][-1])
    }
    print(json.dumps(results))

if __name__ == '__main__':
    main()