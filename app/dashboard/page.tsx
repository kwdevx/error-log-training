"use client";

import { useState } from "react";
import { CsmsChargingSession, CsmsChargingSessionLog } from "@/lib/types/charging";
import { FaultAnalysis, analyzeFaults } from "@/lib/ml/fault-analysis";
import { MetricsCards } from "./components/MetricsCards";
import { FaultAlerts } from "./components/FaultAlerts";
import { ChargingCharts } from "./components/ChargingCharts";
import { DataInput } from "./components/DataInput";

// Mock data for initial state
const mockSession: CsmsChargingSession = {
  id: "1",
  created_at: "2024-03-20T10:00:00Z",
  updated_at: "2024-03-20T12:00:00Z",
  started_at: "2024-03-20T10:00:00Z",
  stopped_at: "2024-03-20T12:00:00Z",
  sync_at: "2024-03-20T12:00:00Z",
  external_id: "EXT001",
  status: "Completed",
  connector_status: "Available",
  status_changed_at: "2024-03-20T12:00:00Z",
  connector_status_changed_at: "2024-03-20T12:00:00Z",
  consumption: 25000,
  output_power: 7.4,
  battery_level: 80,
  license_plate_number: "ABC123",
  car_model: "Tesla Model 3",
  stop_by: "user",
  has_started_charging: true,
  inbox_battery_high_sent: false,
  inbox_battery_full_sent: false,
  inbox_overstay_sent_time: 0,
  overstay_seconds: 0,
  integration_id: "int1",
  connector_id: "conn1",
  user_id: "user1",
  api_connector_id: "api_conn1",
  api_charging_session_id: "api_session1",
  duration: 7200000,
};

const mockLogs: CsmsChargingSessionLog[] = [
  ...Array(12).fill(0).map((_, i) => ({
    id: `log${i}`,
    created_at: new Date(Date.now() - (11-i) * 600000).toISOString(),
    started_at: mockSession.started_at,
    stopped_at: i === 11 ? mockSession.stopped_at : null,
    sync_at: new Date(Date.now() - (11-i) * 600000).toISOString(),
    external_id: mockSession.external_id,
    status: i === 5 ? "Error" : "Charging",
    raw_status: i === 5 ? "Error" : "Charging",
    connector_status: "Connected",
    raw_connector_status: "Connected",
    consumption: 2000 + (i * 2000),
    output_power: i === 5 ? 0 : 7.4,
    battery_level: 20 + (i * 5),
    license_plate_number: mockSession.license_plate_number,
    car_model: mockSession.car_model,
    session_id: mockSession.id,
  })),
];

export default function Dashboard() {
  const [selectedSession, setSelectedSession] = useState<CsmsChargingSession>(mockSession);
  const [sessionLogs, setSessionLogs] = useState<CsmsChargingSessionLog[]>(mockLogs);
  const [faults, setFaults] = useState<FaultAnalysis[]>([]);

  const handleDataLoaded = async (
    newSession: CsmsChargingSession,
    newLogs: CsmsChargingSessionLog[]
  ) => {
    setSelectedSession(newSession);
    setSessionLogs(newLogs);
    const detectedFaults = await analyzeFaults(newSession, newLogs);
    setFaults(detectedFaults);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Charging Session Analysis</h1>
      <DataInput onDataLoaded={handleDataLoaded} />
      <MetricsCards session={selectedSession} />
      {faults.length > 0 && <FaultAlerts faults={faults} />}
      <ChargingCharts logs={sessionLogs} />
    </div>
  );
}