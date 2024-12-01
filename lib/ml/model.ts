import * as tf from "@tensorflow/tfjs";

export async function createModel() {
  const model = tf.sequential();

  // LSTM layer for sequence processing
  model.add(tf.layers.lstm({
    units: 64,
    returnSequences: true,
    inputShape: [5, 5] // [timesteps, features]
  }));

  // Dense layers for feature extraction
  model.add(tf.layers.dense({ units: 32, activation: "relu" }));
  model.add(tf.layers.dropout({ rate: 0.2 }));
  model.add(tf.layers.dense({ units: 16, activation: "relu" }));
  
  // Output layer for anomaly detection
  model.add(tf.layers.dense({ units: 5 })); // Match feature dimensions

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: "meanSquaredError",
  });

  return model;
}

export async function trainModel(
  model: tf.Sequential,
  sequences: tf.Tensor3D,
  targets: tf.Tensor3D,
  epochs: number = 50
) {
  return await model.fit(sequences, targets, {
    epochs,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss.toFixed(4)}`);
      },
    },
  });
}

export function detectAnomalies(
  model: tf.Sequential,
  input: tf.Tensor3D,
  threshold: number = 0.1
): number[] {
  const predictions = model.predict(input) as tf.Tensor;
  const actual = input.slice([0, input.shape[1] - 1], [-1, 1]);
  
  const mse = tf.metrics.meanSquaredError(actual, predictions);
  const anomalyScores = Array.from(mse.dataSync());
  
  return anomalyScores.map(score => score > threshold ? 1 : 0);
}