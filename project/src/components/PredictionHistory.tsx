import React, { useEffect } from 'react';
import { useEnergyStore } from '../store/energyStore';
import { format } from 'date-fns';
import { History, Calendar, Zap } from 'lucide-react';

const PredictionHistory: React.FC = () => {
  const { predictionHistory, fetchPredictionHistory, loading } = useEnergyStore();
  
  useEffect(() => {
    console.log('PredictionHistory mounted');
    fetchPredictionHistory();
  }, []);
  
  console.log('Current prediction history:', predictionHistory);
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 flex justify-center items-center h-60">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading prediction history...</p>
        </div>
      </div>
    );
  }
  
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
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Prediction History</h2>
      <div className="grid gap-4">
        {predictionHistory.map((prediction) => (
          <div key={prediction.id} className="bg-white p-6 rounded-xl shadow-lg">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Date Range</p>
                <p className="font-medium">
                  {format(new Date(prediction.start_date), 'MMM d, yyyy')} - {format(new Date(prediction.end_date), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Consumption</p>
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