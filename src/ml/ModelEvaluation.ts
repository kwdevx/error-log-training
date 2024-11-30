import * as tf from '@tensorflow/tfjs';
import { ChargingLog } from '../types/ChargingLogTypes';
import { preprocessLogForModel } from '../utils/modelPreprocessing';

export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export class ModelEvaluator {
  async evaluateModel(model: tf.LayersModel, testLogs: ChargingLog[]): Promise<EvaluationMetrics> {
    const processedData = testLogs.map(log => preprocessLogForModel(log));
    
    const testFeatures = tf.tensor2d(processedData.map(data => [
      data.consumptionRate,
      data.powerNormalized,
      data.duration,
      data.syncDelay,
      data.batteryLevel
    ]));

    try {
      const predictions = model.predict(testFeatures) as tf.Tensor;
      const predictedClasses = predictions.argMax(-1);
      
      // Calculate actual classes
      const actualClasses = tf.tensor1d(testLogs.map(log => this.determineActualClass(log)));
      
      // Calculate metrics
      const accuracy = this.calculateAccuracy(predictedClasses, actualClasses);
      const { precision, recall } = this.calculatePrecisionRecall(predictedClasses, actualClasses);
      const f1Score = 2 * (precision * recall) / (precision + recall);

      return {
        accuracy,
        precision,
        recall,
        f1Score
      };
    } finally {
      testFeatures.dispose();
    }
  }

  private determineActualClass(log: ChargingLog): number {
    // Determine the primary error class based on log data
    if (log.status === 'charging' && log.consumption === 0) return 0; // Consumption anomaly
    if (log.output_power && Math.abs(log.output_power - 7000) > 1000) return 1; // Power instability
    if (new Date(log.sync_at).getTime() - new Date(log.started_at).getTime() > 30 * 60 * 1000) return 2; // Sync delay
    if (log.status === 'charging' && log.stopped_at !== null) return 3; // Session interruption
    return 0; // No anomaly
  }

  private calculateAccuracy(predicted: tf.Tensor, actual: tf.Tensor): number {
    const correct = predicted.equal(actual);
    return correct.mean().dataSync()[0];
  }

  private calculatePrecisionRecall(predicted: tf.Tensor, actual: tf.Tensor) {
    const truePositives = predicted.equal(actual).sum().dataSync()[0];
    const totalPredicted = predicted.size;
    const totalActual = actual.size;

    const precision = truePositives / totalPredicted;
    const recall = truePositives / totalActual;

    return { precision, recall };
  }
}