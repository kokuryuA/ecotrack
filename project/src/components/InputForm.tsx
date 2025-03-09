import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useEnergyStore } from '../store/energyStore';
import { Lightbulb, Tv, Computer, Fan, Refrigerator, WashingMachine, Coffee, Smartphone } from 'lucide-react';

interface Appliance {
  id: string;
  name: string;
  icon: React.ReactNode;
  defaultCount: number;
}

const appliances: Appliance[] = [
  { id: 'lightbulbs', name: 'Light Bulbs', icon: <Lightbulb className="h-5 w-5" />, defaultCount: 8 },
  { id: 'tvs', name: 'TVs', icon: <Tv className="h-5 w-5" />, defaultCount: 1 },
  { id: 'computers', name: 'Computers', icon: <Computer className="h-5 w-5" />, defaultCount: 2 },
  { id: 'fans', name: 'Fans', icon: <Fan className="h-5 w-5" />, defaultCount: 2 },
  { id: 'refrigerators', name: 'Refrigerators', icon: <Refrigerator className="h-5 w-5" />, defaultCount: 1 },
  { id: 'washingMachines', name: 'Washing Machines', icon: <WashingMachine className="h-5 w-5" />, defaultCount: 1 },
  { id: 'coffeeMakers', name: 'Coffee Makers', icon: <Coffee className="h-5 w-5" />, defaultCount: 1 },
  { id: 'smartphones', name: 'Smartphones', icon: <Smartphone className="h-5 w-5" />, defaultCount: 3 },
];

const InputForm: React.FC = () => {
  const { fetchPrediction, fetchForecast, setLoading } = useEnergyStore();
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  });
  const [applianceCounts, setApplianceCounts] = useState<Record<string, number>>(
    appliances.reduce((acc, appliance) => ({
      ...acc,
      [appliance.id]: appliance.defaultCount,
    }), {})
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (startDate >= endDate) {
      toast.error('End date must be after start date');
      return;
    }

    const totalAppliances = Object.values(applianceCounts).reduce((sum, count) => sum + count, 0);
    if (totalAppliances <= 0) {
      toast.error('Please add at least one appliance');
      return;
    }

    setLoading(true);
    
    try {
      const data = {
        appliances: applianceCounts,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd')
      };
      
      await fetchPrediction(data);
      await fetchForecast();
      
      toast.success('Prediction generated successfully!');
    } catch (error) {
      console.error('Error generating prediction:', error);
      toast.error('Failed to generate prediction. Please try again.');
    }
  };

  const handleApplianceChange = (id: string, value: number) => {
    setApplianceCounts(prev => ({
      ...prev,
      [id]: Math.max(0, value)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Household Appliances</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {appliances.map((appliance) => (
            <div key={appliance.id} className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-colors duration-200">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 text-purple-600 mr-4">
                {appliance.icon}
              </div>
              <div className="flex-grow">
                <label htmlFor={appliance.id} className="block text-base font-medium text-gray-700">
                  {appliance.name}
                </label>
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  className="h-9 w-9 rounded-full bg-gray-200 hover:bg-purple-200 flex items-center justify-center transition-colors duration-200"
                  onClick={() => handleApplianceChange(appliance.id, applianceCounts[appliance.id] - 1)}
                  aria-label={`Decrease ${appliance.name}`}
                >
                  <span className="text-gray-600 text-lg font-medium">-</span>
                </button>
                <input
                  type="number"
                  id={appliance.id}
                  value={applianceCounts[appliance.id]}
                  onChange={(e) => handleApplianceChange(appliance.id, parseInt(e.target.value) || 0)}
                  className="mx-3 w-14 h-9 text-center border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  min="0"
                  aria-label={`Number of ${appliance.name}`}
                />
                <button
                  type="button"
                  className="h-9 w-9 rounded-full bg-gray-200 hover:bg-purple-200 flex items-center justify-center transition-colors duration-200"
                  onClick={() => handleApplianceChange(appliance.id, applianceCounts[appliance.id] + 1)}
                  aria-label={`Increase ${appliance.name}`}
                >
                  <span className="text-gray-600 text-lg font-medium">+</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-purple-50 p-5 rounded-xl">
          <label htmlFor="startDate" className="block text-base font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <DatePicker
            id="startDate"
            selected={startDate}
            onChange={(date: Date) => setStartDate(date)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            dateFormat="MMMM d, yyyy"
            wrapperClassName="w-full"
          />
        </div>
        <div className="bg-purple-50 p-5 rounded-xl">
          <label htmlFor="endDate" className="block text-base font-medium text-gray-700 mb-2">
            End Date
          </label>
          <DatePicker
            id="endDate"
            selected={endDate}
            onChange={(date: Date) => setEndDate(date)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            dateFormat="MMMM d, yyyy"
            minDate={new Date(startDate.getTime() + 86400000)} // +1 day from start date
            wrapperClassName="w-full"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Generate Prediction
        </button>
      </div>
    </form>
  );
};

export default InputForm;