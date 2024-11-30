export interface ChargingSession {
  sessionId: string;
  startTime: Date;
  endTime: Date;
  totalEnergy: number;
  voltage: number;
  current: number;
  temperature: number;
  stationId: string;
  userId: string;
}

export interface ChargingError {
  type: 'voltage_anomaly' | 'current_spike' | 'temperature_warning' | 'connection_issue';
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  message: string;
  sessionId: string;
}

export interface ProcessedChargingData {
  voltageNormalized: number;
  currentNormalized: number;
  temperatureNormalized: number;
  duration: number;
  energyRate: number;
}