export interface ChargingError {
  type: 'consumption_anomaly' | 'power_instability' | 'sync_delay' | 'session_interruption';
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  message: string;
  sessionId: string;
}

export interface ErrorPrediction {
  errorType: ChargingError['type'];
  probability: number;
}