export interface ChargingLog {
  id: string;
  created_at: string;
  started_at: string;
  stopped_at: string | null;
  sync_at: string;
  external_id: string;
  status: 'charging' | 'finished';
  consumption: number;
  battery_level: number | null;
  license_plate_number: string | null;
  car_model: string | null;
  session_id: string;
  connector_status: 'charging' | 'finishing';
  output_power: number | null;
  raw_connector_status: string | null;
  raw_status: string | null;
}

export interface ProcessedLogData {
  duration: number; // in minutes
  consumptionRate: number; // consumption per minute
  powerStability: number; // normalized power stability
  sessionStatus: 'normal' | 'anomaly';
  hasTimeSync: boolean;
}