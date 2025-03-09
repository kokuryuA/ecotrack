import React, { useEffect } from 'react';
import { useEnergyStore } from '../store/energyStore';
import { format } from 'date-fns';
import { History, Calendar, Zap } from 'lucide-react';

const PredictionHistory: React.FC = () => {
  const { predictionHistory, fetchPredictionHistory, loading } = useEnergyStore();
  
  useEffect(() => {
    fetchPredictionHistory();
  }, [fetchPredictionHistory]);
  
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <History className="mr-3 h-6 w-6" />
          Your Prediction History
        </h2>
      </div>
      
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appliances
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consumption
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {predictionHistory.map((prediction) => (
                <tr key={prediction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(prediction.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-purple-500 mr-2" />
                      <span className="text-sm text-gray-900">
                        {format(new Date(prediction.start_date), 'MMM d')} - {format(new Date(prediction.end_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {prediction.days} days
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prediction.total_appliances} appliances
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {prediction.consumption.toFixed(2)} kWh
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PredictionHistory;