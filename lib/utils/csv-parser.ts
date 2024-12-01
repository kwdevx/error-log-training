import { parse } from "papaparse";
import { z } from "zod";
import {
  CsmsChargingSession,
  CsmsChargingSessionLog,
  ChargingSessionSchema,
  ChargingSessionLogSchema,
} from "../types/charging";

export async function parseSessionsFile(csvContent: string): Promise<CsmsChargingSession[]> {
  const { data } = parse(csvContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Invalid sessions CSV format or empty file");
  }

  try {
    return data.map(session => ChargingSessionSchema.parse(session));
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Sessions validation failed: ${error.message}`);
    }
    throw error;
  }
}

export async function parseLogsFile(csvContent: string): Promise<CsmsChargingSessionLog[]> {
  const { data } = parse(csvContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Invalid logs CSV format or empty file");
  }

  try {
    return data.map(log => ChargingSessionLogSchema.parse(log));
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Logs validation failed: ${error.message}`);
    }
    throw error;
  }
}