import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { FaultAnalysis } from "@/lib/ml/fault-analysis";

interface FaultAlertsProps {
  faults: FaultAnalysis[];
}

export function FaultAlerts({ faults }: FaultAlertsProps) {
  return (
    <div className="mb-6 space-y-4">
      {faults.map((fault, index) => (
        <Alert
          key={index}
          variant={
            fault.severity === "high"
              ? "destructive"
              : fault.severity === "medium"
              ? "default"
              : "secondary"
          }
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{fault.reason}</AlertTitle>
          <AlertDescription>
            <div className="mb-2">
              {fault.description}
              <div className="mt-1 text-sm text-muted-foreground">
                Confidence: {fault.confidence.toFixed(1)}%
              </div>
            </div>
            <ul className="mt-2 list-disc list-inside">
              {fault.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}