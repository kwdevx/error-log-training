"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CsmsChargingSessionLog } from "@/lib/types/charging";
import { useMemo } from "react";

interface ChartConfig {
  dataKey: string;
  stroke: string;
  label: string;
  unit: string;
}

const CHART_CONFIGS: Record<string, ChartConfig> = {
  power: {
    dataKey: "power",
    stroke: "#2563eb",
    label: "Power Output",
    unit: "kW"
  },
  battery: {
    dataKey: "battery",
    stroke: "#16a34a",
    label: "Battery Level",
    unit: "%"
  },
  consumption: {
    dataKey: "consumption",
    stroke: "#9333ea",
    label: "Consumption",
    unit: "kWh"
  }
};

interface ChargingChartsProps {
  logs: CsmsChargingSessionLog[];
}

export function ChargingCharts({ logs }: ChargingChartsProps) {
  const chartData = useMemo(() => 
    logs.map((log) => ({
      time: new Date(log.created_at).toLocaleTimeString(),
      power: log.output_power || 0,
      battery: log.battery_level || 0,
      consumption: (log.consumption || 0) / 1000, // Convert to kWh
    })),
    [logs]
  );

  const renderChart = ({ dataKey, stroke, label, unit }: ChartConfig) => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          padding={{ left: 30, right: 30 }}
        >
          <label value="Time" position="bottom" offset={0} />
        </XAxis>
        <YAxis
          padding={{ top: 20, bottom: 20 }}
        >
          <label
            value={unit}
            position="insideLeft"
            angle={-90}
            style={{ textAnchor: 'middle' }}
          />
        </YAxis>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)"
          }}
          labelStyle={{ color: "var(--foreground)" }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={stroke}
          name={label}
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <Tabs defaultValue="power" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        {Object.entries(CHART_CONFIGS).map(([key, config]) => (
          <TabsTrigger key={key} value={key}>
            {config.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {Object.entries(CHART_CONFIGS).map(([key, config]) => (
        <TabsContent key={key} value={key}>
          <Card className="p-6">
            <h3 className="font-semibold mb-4">{config.label} Over Time</h3>
            {renderChart(config)}
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}