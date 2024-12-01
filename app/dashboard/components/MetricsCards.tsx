import { Battery, Bolt, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CsmsChargingSession } from "@/lib/types/charging";

interface MetricsCardsProps {
  session: CsmsChargingSession;
}

export function MetricsCards({ session }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Battery className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold">Final Battery Level</h3>
        </div>
        <p className="text-2xl font-bold mt-2">
          {session.battery_level || 0}%
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Bolt className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold">Total Consumption</h3>
        </div>
        <p className="text-2xl font-bold mt-2">
          {(session.consumption || 0) / 1000} kWh
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-green-500" />
          <h3 className="font-semibold">Duration</h3>
        </div>
        <p className="text-2xl font-bold mt-2">
          {Math.round(session.duration / 60000)} min
        </p>
      </Card>
    </div>
  );
}