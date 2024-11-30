import * as tf from '@tensorflow/tfjs';
import { ChargingLog } from '../types/ChargingLogTypes';
import { ChargingError, ErrorPrediction } from '../types/ErrorTypes';
import { preprocessLogForModel } from '../utils/modelPreprocessing';
import { ModelTrainer } from './ModelTraining';
import { ModelEvaluator } from './ModelEvaluation';

export class ErrorDetectionModel {
  private model: tf.LayersModel | null = null;
  private trainer: ModelTrainer;
  private evaluator: ModelEvaluator;

  constructor() {
    this.trainer = new ModelTrainer();
    this.evaluator = new ModelEvaluator();
  }

  async initialize(): Promise<void> {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ 
          inputShape: [5], 
          units: 12, 
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }) // L2 regularization
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ 
          units: 8, 
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.dense({ units: 4, activation: 'softmax' })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
  }

  async train(trainingLogs: ChargingLog[]): Promise<void> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    await this.trainer.trainModel(this.model, trainingLogs);
  }

  async evaluate(testLogs: ChargingLog[]) {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    return await this.evaluator.evaluateModel(this.model, testLogs);
  }

  async detectErrors(log: ChargingLog): Promise<ChargingError[]> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    const processedData = preprocessLogForModel(log);
    const input = tf.tensor2d([[
      processedData.consumptionRate,
      processedData.powerNormalized,
      processedData.duration,
      processedData.syncDelay,
      processedData.batteryLevel
    ]]);

    try {
      const prediction = this.model.predict(input) as tf.Tensor;
      const probabilities = await prediction.array();
      return this.interpretPredictions(probabilities[0], log);
    } finally {
      input.dispose();
    }
  }

  private interpretPredictions(probabilities: number[], log: ChargingLog): ChargingError[] {
    const errors: ChargingError[] = [];
    const errorThreshold = 0.7;

    const predictions: ErrorPrediction[] = [
      { errorType: 'consumption_anomaly', probability: probabilities[0] },
      { errorType: 'power_instability', probability: probabilities[1] },
      { errorType: 'sync_delay', probability: probabilities[2] },
      { errorType: 'session_interruption', probability: probabilities[3] }
    ];

    predictions.forEach(({ errorType, probability }) => {
      if (probability > errorThreshold) {
        errors.push({
          type: errorType,
          severity: this.determineSeverity(probability),
          timestamp: new Date(),
          message: this.generateErrorMessage(errorType, log),
          sessionId: log.session_id
        });
      }
    });

    return errors;
  }

  private determineSeverity(probability: number): 'low' | 'medium' | 'high' {
    if (probability > 0.9) return 'high';
    if (probability > 0.8) return 'medium';
    return 'low';
  }

  private generateErrorMessage(type: ChargingError['type'], log: ChargingLog): string {
    const messages = {
      consumption_anomaly: `Unusual consumption pattern detected: ${log.consumption}kWh`,
      power_instability: `Power instability detected: ${log.output_power}W`,
      sync_delay: 'Significant delay in session synchronization',
      session_interruption: 'Unexpected session interruption detected'
    };
    return messages[type];
  }

  async saveModel(path: string): Promise<void> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }
    await this.model.save(`localstorage://${path}`);
  }

  async loadModel(path: string): Promise<void> {
    this.model = await tf.loadLayersModel(`localstorage://${path}`);
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
  }
}