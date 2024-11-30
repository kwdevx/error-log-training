import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChargingLog } from '../types/ChargingLogTypes';
import { processLogData } from '../utils/logAnalysis';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface LogAnalyticsProps {
  logs: ChargingLog[];
}

export function LogAnalytics({ logs }: LogAnalyticsProps) {
  const processedLogs = logs.map(log => ({
    ...processLogData(log),
    id: log.id,
    sessionId: log.session_id
  }));

  const anomalies = processedLogs.filter(log => log.sessionStatus === 'anomaly');
  const anomalyRate = (anomalies.length / processedLogs.length) * 100;

  const chartData = processedLogs.map(log => ({
    sessionId: log.sessionId.slice(0, 8),
    consumptionRate: log.consumptionRate,
    powerStability: log.powerStability * 100,
    status: log.sessionStatus
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Sessions</h3>
          <p className="text-3xl font-bold">{logs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Anomaly Rate</h3>
          <p className="text-3xl font-bold text-orange-600">{anomalyRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Active Sessions</h3>
          <p className="text-3xl font-bold text-green-600">
            {logs.filter(log => log.status === 'charging').length}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Session Analysis</h3>
        <div className="w-full overflow-x-auto">
          <BarChart width={800} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sessionId" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="consumptionRate" fill="#4f46e5" name="Consumption Rate" />
            <Bar dataKey="powerStability" fill="#059669" name="Power Stability %" />
          </BarChart>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Anomaly Detection</h3>
        <div className="space-y-3">
          {anomalies.map(anomaly => (
            <div
              key={anomaly.id}
              className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg"
            >
              <AlertTriangle className="w-5 h-5 text-red-500 mt-1" />
              <div>
                <p className="font-medium text-red-800">
                  Anomaly detected in session {anomaly.sessionId.slice(0, 8)}
                </p>
                <p className="text-sm text-red-600">
                  Consumption Rate: {anomaly.consumptionRate.toFixed(2)} |
                  Power Stability: {(anomaly.powerStability * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
          {anomalies.length === 0 && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>No anomalies detected in current dataset</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}