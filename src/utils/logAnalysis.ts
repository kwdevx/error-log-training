import { ChargingLog, ProcessedLogData } from '../types/ChargingLogTypes';
import { parseISO, differenceInMinutes } from 'date-fns';

export function processLogData(log: ChargingLog): ProcessedLogData {
  // Calculate duration
  const startTime = parseISO(log.started_at);
  const endTime = log.stopped_at ? parseISO(log.stopped_at) : new Date();
  const duration = differenceInMinutes(endTime, startTime);

  // Calculate consumption rate
  const consumptionRate = duration > 0 ? log.consumption / duration : 0;

  // Check power stability
  const powerStability = calculatePowerStability(log);

  // Check time synchronization
  const syncTime = parseISO(log.sync_at);
  const createdTime = parseISO(log.created_at);
  const hasTimeSync = Math.abs(differenceInMinutes(syncTime, createdTime)) < 5;

  // Determine session status
  const sessionStatus = determineSessionStatus(log, consumptionRate, powerStability);

  return {
    duration,
    consumptionRate,
    powerStability,
    sessionStatus,
    hasTimeSync
  };
}

function calculatePowerStability(log: ChargingLog): number {
  if (!log.output_power) return 0;

  // Normalize power stability (7000 seems to be the standard power output)
  const standardPower = 7000;
  const powerDifference = Math.abs(log.output_power - standardPower);
  const maxAllowedDifference = 3000;

  return Math.max(0, 1 - powerDifference / maxAllowedDifference);
}

function determineSessionStatus(
  log: ChargingLog,
  consumptionRate: number,
  powerStability: number
): 'normal' | 'anomaly' {
  // Detect anomalies based on multiple factors
  const anomalyConditions = [
    consumptionRate === 0 && log.status === 'charging',
    powerStability < 0.5,
    log.output_power !== null && log.output_power > 10000, // Unusually high power
    log.consumption === 0 && log.status === 'finished'
  ];

  return anomalyConditions.some(condition => condition) ? 'anomaly' : 'normal';
}