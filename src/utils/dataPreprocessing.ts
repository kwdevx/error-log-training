import { ChargingSession, ProcessedChargingData } from '../types/ChargingData';

export function normalizeValue(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}

export function preprocessChargingData(session: ChargingSession): ProcessedChargingData {
  // Normalize values based on typical EV charging ranges
  const voltageNormalized = normalizeValue(session.voltage, 0, 1000); // Assuming max 1000V
  const currentNormalized = normalizeValue(session.current, 0, 400); // Assuming max 400A
  const temperatureNormalized = normalizeValue(session.temperature, -20, 80); // Assuming range -20°C to 80°C

  const duration = (session.endTime.getTime() - session.startTime.getTime()) / 3600000; // Hours
  const energyRate = session.totalEnergy / duration; // kWh/h

  return {
    voltageNormalized,
    currentNormalized,
    temperatureNormalized,
    duration,
    energyRate,
  };
}