import React from 'react';
import { useEnergyStore } from '../store/energyStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Zap, TrendingUp, AlertCircle, Info } from 'lucide-react';

const ResultsDisplay: React.FC = () => {
  const { prediction, forecast, loading } = useEnergyStore();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 flex justify-center items-center h-80">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Generating your energy prediction...</p>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return null;
  }

  // Prepare chart data
  const chartData = [
    {
      name: 'Current Period',
      consumption: prediction.consumption,
    },
  ];

  if (forecast) {
    chartData.push({
      name: 'Next Period',
      consumption: forecast.consumption,
    });
  }

  // Calculate percentage change
  const percentageChange = forecast 
    ? ((forecast.consumption - prediction.consumption) / prediction.consumption) * 100
    : 0;
  
  const isIncrease = percentageChange > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Zap className="mr-3 h-7 w-7" />
          Energy Consumption Results
        </h2>
      </div>
      
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Current Period Consumption</h3>
            <p className="text-4xl font-bold text-purple-600">{prediction.consumption.toFixed(2)} kWh</p>
            <div className="flex items-center mt-3 text-gray-600">
              <Info className="h-4 w-4 mr-2" />
              <p className="text-sm">
                Based on {prediction.total_appliances} appliances over {prediction.days} days
              </p>
            </div>
          </div>
          
          {forecast && (
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 hover:shadow-md transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Next Period Forecast</h3>
              <p className="text-4xl font-bold text-purple-600">{forecast.consumption.toFixed(2)} kWh</p>
              <div className={`flex items-center mt-3 ${isIncrease ? 'text-red-500' : 'text-green-500'}`}>
                {isIncrease ? (
                  <TrendingUp className="h-5 w-5 mr-2" />
                ) : (
                  <TrendingUp className="h-5 w-5 mr-2 transform rotate-180" />
                )}
                <span className="font-medium">
                  {isIncrease ? '+' : ''}{percentageChange.toFixed(2)}% 
                  {isIncrease ? ' increase' : ' decrease'} expected
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Consumption Comparison</h3>
          <div className="h-96 bg-purple-50 p-4 rounded-xl">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fill: '#4b5563' }} />
                <YAxis unit=" kWh" tick={{ fill: '#4b5563' }} />
                <Tooltip 
                  formatter={(value) => [`${value.toFixed(2)} kWh`, 'Consumption']}
                  contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="consumption" 
                  stroke="#8b5cf6" 
                  fillOpacity={1}
                  fill="url(#colorConsumption)"
                  strokeWidth={3}
                  activeDot={{ r: 8, strokeWidth: 0, fill: '#7c3aed' }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-xl flex items-start">
          <AlertCircle className="h-6 w-6 text-purple-600 mt-0.5 mr-4 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-lg text-purple-800 mb-2">Energy Saving Tips</h4>
            <ul className="mt-2 text-purple-700 space-y-2">
              <li className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-600 mr-2"></span>
                Consider upgrading to energy-efficient appliances
              </li>
              <li className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-600 mr-2"></span>
                Turn off lights and electronics when not in use
              </li>
              <li className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-600 mr-2"></span>
                Use programmable thermostats to optimize heating and cooling
              </li>
              <li className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-600 mr-2"></span>
                Wash clothes in cold water when possible
              </li>
              <li className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-600 mr-2"></span>
                Unplug chargers and devices when fully charged
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;