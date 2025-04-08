import React, { useEffect } from 'react';
import { useEnergyStore } from '../store/energyStore';
import { format } from 'date-fns';
import { History, Calendar, Zap, Loader2 } from 'lucide-react';

// Types
interface Prediction {
  id: string;
  start_date: string;
  end_date: string;
  consumption: number;
  days: number;
  total_appliances: number;
}

// Component
const PredictionHistory: React.FC = () => {
  // Hooks
  const { predictionHistory, fetchPredictionHistory, loading } = useEnergyStore();
  
  // Effects
  useEffect(() => {
    fetchPredictionHistory();
  }, [fetchPredictionHistory]);
  
  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 flex justify-center items-center h-60">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-6" />
          <p className="text-gray-600 text-lg">Loading prediction history...</p>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (!predictionHistory.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <History className="h-16 w-16 text-purple-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No prediction history</h3>
        <p className="text-gray-500">
          Generate your first prediction to see it here.
        </p>
      </div>
    );
  }
  
  // Render prediction cards
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
        <History className="w-6 h-6 mr-2 text-purple-600" />
        Prediction History
      </h2>
      <div className="grid gap-4">
        {predictionHistory.map((prediction: Prediction) => (
          <div 
            key={prediction.id} 
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Date Range
                </p>
                <p className="font-medium">
                  {format(new Date(prediction.start_date), 'MMM d, yyyy')} - {format(new Date(prediction.end_date), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center">
                  <Zap className="w-4 h-4 mr-1" />
                  Total Consumption
                </p>
                <p className="font-medium">{prediction.consumption.toFixed(1)} kWh</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Appliances</p>
                <p className="font-medium">{prediction.total_appliances}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Daily Average</p>
                <p className="font-medium">{(prediction.consumption / prediction.days).toFixed(1)} kWh</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PredictionHistory;