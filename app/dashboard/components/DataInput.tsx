"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload, FileUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CsmsChargingSession, CsmsChargingSessionLog } from "@/lib/types/charging";
import { parseSessionsFile, parseLogsFile } from "@/lib/utils/csv-parser";
import { trainModelWithData } from "@/lib/ml/training";

interface DataInputProps {
  onDataLoaded: (session: CsmsChargingSession, logs: CsmsChargingSessionLog[]) => void;
}

export function DataInput({ onDataLoaded }: DataInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionsFile, setSessionsFile] = useState<File | null>(null);
  const [logsFile, setLogsFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!sessionsFile || !logsFile) return;
    setError(null);
    setIsLoading(true);

    try {
      const sessionsText = await sessionsFile.text();
      const logsText = await logsFile.text();

      const sessions = await parseSessionsFile(sessionsText);
      const logs = await parseLogsFile(logsText);

      if (sessions.length === 0) {
        throw new Error("No valid sessions found in the file");
      }

      // Train model with the data
      await trainModelWithData(sessions, logs);

      // For now, we'll use the first session for display
      onDataLoaded(sessions[0], logs.filter(log => log.session_id === sessions[0].id));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to process files");
      console.error("Error processing files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Load Charging Data</h2>
          <Button variant="outline" disabled={isLoading}>
            <Upload className="h-4 w-4 mr-2" />
            Sample Data
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid w-full items-center gap-4">
          <div>
            <Label htmlFor="sessions">Sessions CSV File</Label>
            <Input
              id="sessions"
              type="file"
              accept=".csv"
              onChange={(e) => {
                setSessionsFile(e.target.files?.[0] || null);
                setError(null);
              }}
              disabled={isLoading}
              className="cursor-pointer"
            />
          </div>

          <div>
            <Label htmlFor="logs">Logs CSV File</Label>
            <Input
              id="logs"
              type="file"
              accept=".csv"
              onChange={(e) => {
                setLogsFile(e.target.files?.[0] || null);
                setError(null);
              }}
              disabled={isLoading}
              className="cursor-pointer"
            />
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={isLoading || !sessionsFile || !logsFile}
          >
            <FileUp className="h-4 w-4 mr-2" />
            {isLoading ? "Processing..." : "Upload and Train Model"}
          </Button>
        </div>
      </div>
    </Card>
  );
}