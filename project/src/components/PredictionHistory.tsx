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
          <p className="text-gray-800 text-lg font-medium">Loading prediction history...</p>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (!predictionHistory.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <History className="h-16 w-16 text-purple-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No prediction history</h3>
        <p className="text-gray-600 font-medium">
          Generate your first prediction to see it here.
        </p>
      </div>
    );
  }
  
  // Render prediction cards
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white flex items-center bg-purple-900/50 p-4 rounded-lg backdrop-blur-sm">
        <History className="w-6 h-6 mr-2 text-purple-300" />
        Prediction History
      </h2>
      <div className="grid gap-4">
        {predictionHistory.map((prediction: Prediction) => (
          <div 
            key={prediction.id} 
            className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-500/20"
          >
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/20">
                <p className="text-sm text-purple-200 font-medium flex items-center mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date Range
                </p>
                <p className="text-white font-semibold">
                  {format(new Date(prediction.start_date), 'MMM d, yyyy')} - {format(new Date(prediction.end_date), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/20">
                <p className="text-sm text-purple-200 font-medium flex items-center mb-2">
                  <Zap className="w-4 h-4 mr-2" />
                  Total Consumption
                </p>
                <p className="text-white font-semibold">{prediction.consumption.toFixed(1)} kWh</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/20">
                <p className="text-sm text-purple-200 font-medium mb-2">Total Appliances</p>
                <p className="text-white font-semibold">{prediction.total_appliances}</p>
              </div>
              <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/20">
                <p className="text-sm text-purple-200 font-medium mb-2">Daily Average</p>
                <p className="text-white font-semibold">{(prediction.consumption / prediction.days).toFixed(1)} kWh</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PredictionHistory;