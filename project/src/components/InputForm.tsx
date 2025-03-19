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
  powerUsage: string;
}

const appliances: Appliance[] = [
  { id: 'lightbulbs', name: 'Light Bulbs', icon: <Lightbulb className="h-5 w-5" />, defaultCount: 8, powerUsage: '60W/h' },
  { id: 'tvs', name: 'TVs', icon: <Tv className="h-5 w-5" />, defaultCount: 1, powerUsage: '100-200W/h' },
  { id: 'computers', name: 'Computers', icon: <Computer className="h-5 w-5" />, defaultCount: 2, powerUsage: '150-300W/h' },
  { id: 'fans', name: 'Fans', icon: <Fan className="h-5 w-5" />, defaultCount: 2, powerUsage: '50-100W/h' },
  { id: 'refrigerators', name: 'Refrigerators', icon: <Refrigerator className="h-5 w-5" />, defaultCount: 1, powerUsage: '150-400W/h' },
  { id: 'washingMachines', name: 'Washing Machines', icon: <WashingMachine className="h-5 w-5" />, defaultCount: 1, powerUsage: '500-1000W/h' },
  { id: 'coffeeMakers', name: 'Coffee Makers', icon: <Coffee className="h-5 w-5" />, defaultCount: 1, powerUsage: '900-1200W/h' },
  { id: 'smartphones', name: 'Smartphones', icon: <Smartphone className="h-5 w-5" />, defaultCount: 3, powerUsage: '5-10W/h' },
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
    try {
      await fetchPrediction({
        appliances: applianceCounts,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd')
      });
      toast.success('Prediction generated successfully!');
    } catch (error) {
      console.error('Error generating prediction:', error);
      toast.error('Failed to generate prediction');
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
        <h2 className="text-2xl font-bold mb-6">Household Appliances</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appliances.map((appliance) => (
            <div key={appliance.id} className="border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-50 p-3 rounded-full">
                    <div className="text-purple-600">
                      {appliance.icon}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <p className="font-medium">{appliance.name}</p>
                    <span className="text-sm text-gray-600">{appliance.powerUsage}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplianceChange(appliance.id, Math.max(0, applianceCounts[appliance.id] - 1))}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{applianceCounts[appliance.id]}</span>
                  <button
                    type="button"
                    onClick={() => handleApplianceChange(appliance.id, applianceCounts[appliance.id] + 1)}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-purple-50 p-5 rounded-xl">
          <label className="block text-base font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date: Date) => setStartDate(date)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            dateFormat="MMMM d, yyyy"
            wrapperClassName="w-full"
          />
        </div>
        <div className="bg-purple-50 p-5 rounded-xl">
          <label className="block text-base font-medium text-gray-700 mb-2">
            End Date
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date: Date) => setEndDate(date)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            dateFormat="MMMM d, yyyy"
            minDate={new Date(startDate.getTime() + 86400000)}
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