import * as tf from '@tensorflow/tfjs';
import { ChargingLog } from '../types/ChargingLogTypes';
import { preprocessLogForModel } from '../utils/modelPreprocessing';

export interface TrainingConfig {
  epochs: number;
  batchSize: number;
  validationSplit: number;
}

export class ModelTrainer {
  private defaultConfig: TrainingConfig = {
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2
  };

  async prepareTrainingData(logs: ChargingLog[]) {
    // Process all logs
    const processedData = logs.map(log => preprocessLogForModel(log));
    
    // Convert to tensors
    const inputFeatures = tf.tensor2d(processedData.map(data => [
      data.consumptionRate,
      data.powerNormalized,
      data.duration,
      data.syncDelay,
      data.batteryLevel
    ]));

    // Generate labels based on anomaly detection rules
    const labels = tf.tensor2d(logs.map(log => this.generateLabel(log)));

    return { inputFeatures, labels };
  }

  private generateLabel(log: ChargingLog): number[] {
    // One-hot encoded labels for each error type
    const isConsumptionAnomaly = this.detectConsumptionAnomaly(log);
    const isPowerInstability = this.detectPowerInstability(log);
    const isSyncDelay = this.detectSyncDelay(log);
    const isSessionInterruption = this.detectSessionInterruption(log);

    return [
      Number(isConsumptionAnomaly),
      Number(isPowerInstability),
      Number(isSyncDelay),
      Number(isSessionInterruption)
    ];
  }

  private detectConsumptionAnomaly(log: ChargingLog): boolean {
    return (
      (log.status === 'charging' && log.consumption === 0) ||
      (log.consumption > 5000) || // Unusually high consumption
      (log.status === 'finished' && log.consumption < 10) // Too low for finished session
    );
  }

  private detectPowerInstability(log: ChargingLog): boolean {
    const normalPowerRange = 7000;
    const tolerance = 1000;
    
    return (
      log.output_power !== null &&
      Math.abs(log.output_power - normalPowerRange) > tolerance
    );
  }

  private detectSyncDelay(log: ChargingLog): boolean {
    const syncTime = new Date(log.sync_at);
    const startTime = new Date(log.started_at);
    const syncDelayMinutes = (syncTime.getTime() - startTime.getTime()) / (1000 * 60);
    
    return syncDelayMinutes > 30; // More than 30 minutes sync delay
  }

  private detectSessionInterruption(log: ChargingLog): boolean {
    return (
      log.status === 'charging' &&
      log.stopped_at !== null &&
      log.consumption === 0
    );
  }

  async trainModel(model: tf.LayersModel, logs: ChargingLog[], config?: Partial<TrainingConfig>) {
    const finalConfig = { ...this.defaultConfig, ...config };
    const { inputFeatures, labels } = await this.prepareTrainingData(logs);

    try {
      const history = await model.fit(inputFeatures, labels, {
        epochs: finalConfig.epochs,
        batchSize: finalConfig.batchSize,
        validationSplit: finalConfig.validationSplit,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss.toFixed(4)}, accuracy = ${logs?.acc.toFixed(4)}`);
          }
        }
      });

      return history;
    } finally {
      // Clean up tensors
      inputFeatures.dispose();
      labels.dispose();
    }
  }
}