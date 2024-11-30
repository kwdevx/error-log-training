import { useState, useEffect } from 'react';
import { ChargingLog } from '../types/ChargingLogTypes';
import { ChargingError } from '../types/ErrorTypes';
import { ErrorDetectionModel } from '../ml/ErrorDetectionModel';

export function useErrorDetection(logs: ChargingLog[]) {
  const [errors, setErrors] = useState<ChargingError[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const analyzeErrors = async () => {
      setIsAnalyzing(true);
      const model = new ErrorDetectionModel();
      await model.initialize();

      const allErrors = await Promise.all(
        logs.map(log => model.detectErrors(log))
      );

      setErrors(allErrors.flat());
      setIsAnalyzing(false);
    };

    if (logs.length > 0) {
      analyzeErrors();
    }
  }, [logs]);

  return { errors, isAnalyzing };
}