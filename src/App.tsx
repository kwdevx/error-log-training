import React, { useState, useEffect } from 'react';
import { Battery, Zap } from 'lucide-react';
import { ChargingLog } from './types/ChargingLogTypes';
import { LogAnalytics } from './components/LogAnalytics';
import { sampleData } from './data/sampleData';

function App() {
  const [logs, setLogs] = useState<ChargingLog[]>([]);

  useEffect(() => {
    // In a real application, you would fetch this data from an API
    setLogs(sampleData);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              EV Charging Analytics Dashboard
            </h1>
            <div className="flex items-center space-x-2">
              <Battery className="w-6 h-6 text-green-500" />
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="mt-2 text-gray-600">
            Real-time monitoring and anomaly detection for EV charging sessions
          </p>
        </div>

        <LogAnalytics logs={logs} />
      </div>
    </div>
  );
}

export default App;