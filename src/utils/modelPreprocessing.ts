import { ChargingLog } from '../types/ChargingLogTypes';
import { parseISO, differenceInMinutes } from 'date-fns';

export function preprocessLogForModel(log: ChargingLog) {
  const startTime = parseISO(log.started_at);
  const endTime = log.stopped_at ? parseISO(log.stopped_at) : new Date();
  const syncTime = parseISO(log.sync_at);
  
  const duration = differenceInMinutes(endTime, startTime);
  const consumptionRate = duration > 0 ? log.consumption / duration : 0;
  const powerNormalized = log.output_power ? log.output_power / 10000 : 0;
  const syncDelay = differenceInMinutes(syncTime, startTime);
  
  return {
    consumptionRate: normalizeValue(consumptionRate, 0, 100),
    powerNormalized,
    duration: normalizeValue(duration, 0, 240), // normalize to 4 hours max
    syncDelay: normalizeValue(syncDelay, 0, 60), // normalize to 1 hour max
    batteryLevel: log.battery_level ? log.battery_level / 100 : 0.5
  };
}

function normalizeValue(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}