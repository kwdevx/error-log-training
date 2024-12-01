import { NextResponse } from 'next/server';
import { CsmsChargingSession, CsmsChargingSessionLog } from '@/lib/types/charging';
import { writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { sessions, logs } = await request.json();

    // Validate input data
    if (!Array.isArray(sessions) || !Array.isArray(logs)) {
      return NextResponse.json(
        { error: 'Invalid input data format' },
        { status: 400 }
      );
    }

    // Save data to temporary files
    const tempDir = '/tmp';
    const sessionFile = `${tempDir}/sessions.json`;
    const logsFile = `${tempDir}/logs.json`;

    await writeFile(sessionFile, JSON.stringify(sessions));
    await writeFile(logsFile, JSON.stringify(logs));

    // Execute Python training script
    const { stdout, stderr } = await execAsync(
      `python3 scripts/train_model.py ${sessionFile} ${logsFile}`
    );

    if (stderr) {
      console.error('Training stderr:', stderr);
    }

    // Parse and return results
    const results = JSON.parse(stdout);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Training error:', error);
    return NextResponse.json(
      { error: 'Training process failed' },
      { status: 500 }
    );
  }
}