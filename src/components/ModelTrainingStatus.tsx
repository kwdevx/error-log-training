import React, { useState, useEffect } from 'react';
import { ChargingLog } from '../types/ChargingLogTypes';
import { ErrorDetectionModel } from '../ml/ErrorDetectionModel';
import { Loader2 } from 'lucide-react';

interface ModelTrainingStatusProps {
  trainingData: ChargingLog[];
  onTrainingComplete: () => void;
}

export function ModelTrainingStatus({ trainingData, onTrainingComplete }: ModelTrainingStatusProps) {
  const [status, setStatus] = useState<string>('Initializing...');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const trainModel = async () => {
      const model = new ErrorDetectionModel();
      
      try {
        setStatus('Initializing model...');
        await model.initialize();

        setStatus('Training model...');
        // Split data into training (80%) and validation (20%)
        const splitIndex = Math.floor(trainingData.length * 0.8);
        const trainingSet = trainingData.slice(0, splitIndex);
        const validationSet = trainingData.slice(splitIndex);

        await model.train(trainingSet);
        
        setStatus('Evaluating model...');
        const metrics = await model.evaluate(validationSet);
        
        setStatus(`Training complete! Accuracy: ${(metrics.accuracy * 100).toFixed(2)}%`);
        setProgress(100);
        
        // Save the trained model
        await model.saveModel('ev-charging-model');
        onTrainingComplete();
      } catch (error) {
        setStatus(`Error: ${error.message}`);
      }
    };

    trainModel();
  }, [trainingData, onTrainingComplete]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center space-x-3">
        <Loader2 className={`w-5 h-5 ${progress < 100 ? 'animate-spin' : ''}`} />
        <span className="font-medium">{status}</span>
      </div>
      <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}