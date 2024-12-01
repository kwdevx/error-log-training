import { CsmsChargingSession, CsmsChargingSessionLog } from "../types/charging";

export async function trainModelWithData(
  sessions: CsmsChargingSession[],
  logs: CsmsChargingSessionLog[]
): Promise<any> {
  try {
    const response = await fetch('/api/train', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessions, logs }),
    });

    if (!response.ok) {
      throw new Error('Training request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Training error:', error);
    throw new Error('Failed to train model');
  }
}