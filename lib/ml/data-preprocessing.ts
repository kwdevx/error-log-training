import { CsmsChargingSessionLog } from "../types/charging";
import * as tf from "@tensorflow/tfjs";

export function preprocessSessionData(logs: CsmsChargingSessionLog[]) {
  // Extract relevant features
  const features = logs.map(log => ([
    log.output_power || 0,
    log.battery_level || 0,
    log.consumption || 0,
    log.status === "Error" ? 1 : 0,
    log.connector_status === "Connected" ? 1 : 0
  ]));

  // Convert to tensor
  return tf.tensor2d(features);
}

export function normalizeData(tensor: tf.Tensor2D) {
  const min = tensor.min(0);
  const max = tensor.max(0);
  const normalizedTensor = tensor.sub(min).div(max.sub(min));
  return { normalizedTensor, min, max };
}

export function createSequences(data: tf.Tensor2D, sequenceLength: number = 5) {
  const sequences = [];
  const targets = [];

  for (let i = 0; i <= data.shape[0] - sequenceLength; i++) {
    const sequence = data.slice([i], [sequenceLength]);
    const target = i + sequenceLength < data.shape[0] ? 
      data.slice([i + sequenceLength], [1]) :
      data.slice([data.shape[0] - 1], [1]);
    
    sequences.push(sequence);
    targets.push(target);
  }

  return {
    sequences: tf.stack(sequences),
    targets: tf.stack(targets)
  };
}