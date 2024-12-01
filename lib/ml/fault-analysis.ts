import { CsmsChargingSession, CsmsChargingSessionLog } from "../types/charging";

export interface FaultAnalysis {
  severity: 'low' | 'medium' | 'high';
  reason: string;
  description: string;
  recommendations: string[];
  confidence: number;
}

export async function analyzeFaults(
  session: CsmsChargingSession,
  logs: CsmsChargingSessionLog[]
): Promise<FaultAnalysis[]> {
  const faults: FaultAnalysis[] = [];
  
  // Analyze charging interruptions
  const hasInterruptions = logs.some((log, index) => {
    if (index === 0) return false;
    return log.status !== logs[index - 1].status && log.status !== 'Charging';
  });

  if (hasInterruptions) {
    faults.push({
      severity: 'medium',
      reason: 'Charging Interruptions',
      description: 'Multiple charging status changes detected during session',
      recommendations: [
        'Inspect charging equipment for malfunctions',
        'Check vehicle charging system',
        'Review power supply stability'
      ],
      confidence: 85
    });
  }

  // Analyze power output anomalies
  const powerReadings = logs
    .map(log => log.output_power)
    .filter((power): power is number => power !== null);
  
  if (powerReadings.length > 0) {
    const avgPower = powerReadings.reduce((a, b) => a + b, 0) / powerReadings.length;
    const hasLowPower = avgPower < 3.0; // Example threshold in kW

    if (hasLowPower) {
      faults.push({
        severity: 'high',
        reason: 'Low Power Output',
        description: `Average power output (${avgPower.toFixed(2)} kW) is below expected threshold`,
        recommendations: [
          'Check charger specifications',
          'Verify grid connection capacity',
          'Inspect for voltage drops'
        ],
        confidence: 90
      });
    }
  }

  // Analyze battery charging pattern
  const batteryReadings = logs
    .map(log => log.battery_level)
    .filter((level): level is number => level !== null);

  if (batteryReadings.length > 1) {
    const batteryDelta = batteryReadings[batteryReadings.length - 1] - batteryReadings[0];
    const timeSpent = new Date(session.stopped_at || '').getTime() - 
                     new Date(session.started_at || '').getTime();
    const chargingRate = (batteryDelta / (timeSpent / 3600000)); // % per hour

    if (chargingRate < 10) { // Example threshold
      faults.push({
        severity: 'medium',
        reason: 'Slow Charging Rate',
        description: `Battery charging rate (${chargingRate.toFixed(2)}% per hour) is unusually slow`,
        recommendations: [
          'Check vehicle charging settings',
          'Verify charger-vehicle compatibility',
          'Inspect for thermal throttling'
        ],
        confidence: 75
      });
    }
  }

  return faults;
}