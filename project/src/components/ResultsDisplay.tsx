import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEnergyStore } from '../store/energyStore';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import { AlertCircle } from 'lucide-react';

const ResultsDisplay: React.FC = () => {
  const { prediction } = useEnergyStore();

  if (!prediction) return null;

  // Generate daily data points between start and end date
  const dateRange = eachDayOfInterval({
    start: parseISO(prediction.start_date),
    end: parseISO(prediction.end_date)
  });

  // Calculate daily consumption (total consumption divided by number of days)
  const dailyConsumption = prediction.consumption / prediction.days;

  // Create data points for each day
  const data = dateRange.map(date => ({
    date: format(date, 'MMM dd'),
    consumption: dailyConsumption + (Math.random() * 0.4 - 0.2) * dailyConsumption // Add small random variation
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-8">
      <h2 className="text-xl font-semibold text-gray-900">Energy Consumption Forecast</h2>
      
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#666' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fill: '#666' }}
              label={{ 
                value: 'kWh', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: '#666' }
              }}
            />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="consumption" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">Total Consumption</p>
          <p className="text-2xl font-bold text-purple-700">
            {prediction.consumption.toFixed(1)} kWh
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Daily Average</p>
          <p className="text-2xl font-bold text-blue-700">
            {dailyConsumption.toFixed(1)} kWh
          </p>
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
  );
};

export default ResultsDisplay;