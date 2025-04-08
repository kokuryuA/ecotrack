import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useEnergyStore } from '../store/energyStore';
import { useAuthStore } from '../store/authStore';
import { Lightbulb, Tv, Computer, Fan, Refrigerator, WashingMachine, Coffee, Smartphone } from 'lucide-react';

// Add custom styles for the date picker
const customStyles = `
  .react-datepicker {
    font-family: 'Inter', sans-serif;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background-color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    z-index: 50;
  }
  .react-datepicker-wrapper {
    width: 100%;
  }
  .react-datepicker__header {
    background-color: #f3f4f6;
    border-bottom: 1px solid #e5e7eb;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    padding-top: 0.5rem;
  }
  .react-datepicker__current-month {
    color: #1f2937;
    font-weight: 600;
    font-size: 0.875rem;
  }
  .react-datepicker__day-name {
    color: #4b5563;
    font-weight: 500;
    width: 2rem;
  }
  .react-datepicker__day {
    color: #1f2937;
    width: 2rem;
    line-height: 2rem;
    font-size: 0.875rem;
    margin: 0.2rem;
  }
  .react-datepicker__day:hover {
    background-color: #f3f4f6;
    border-radius: 0.375rem;
  }
  .react-datepicker__day--selected {
    background-color: #8b5cf6 !important;
    color: white !important;
    border-radius: 0.375rem;
    font-weight: 600;
  }
  .react-datepicker__day--keyboard-selected {
    background-color: #c4b5fd;
    border-radius: 0.375rem;
  }
  .react-datepicker__day--disabled {
    color: #9ca3af;
  }
  .react-datepicker__navigation {
    top: 0.75rem;
  }
  .react-datepicker__navigation-icon::before {
    border-color: #6b7280;
    border-width: 2px 2px 0 0;
  }
  .react-datepicker__triangle {
    display: none;
  }
  .react-datepicker-popper {
    z-index: 40 !important;
  }
`;

interface Appliance {
  id: string;
  name: string;
  icon: React.ReactNode;
  defaultCount: number;
  powerUsage: string;
}

const appliances: Appliance[] = [
  { id: 'lightbulbs', name: 'Light Bulbs', icon: <Lightbulb className="h-7 w-7 text-white" />, defaultCount: 8, powerUsage: '60W/h' },
  { id: 'tvs', name: 'TVs', icon: <Tv className="h-7 w-7 text-white" />, defaultCount: 1, powerUsage: '100-200W/h' },
  { id: 'computers', name: 'Computers', icon: <Computer className="h-7 w-7 text-white" />, defaultCount: 2, powerUsage: '150-300W/h' },
  { id: 'fans', name: 'Fans', icon: <Fan className="h-7 w-7 text-white" />, defaultCount: 2, powerUsage: '50-100W/h' },
  { id: 'refrigerators', name: 'Refrigerators', icon: <Refrigerator className="h-7 w-7 text-white" />, defaultCount: 1, powerUsage: '150-400W/h' },
  { id: 'washingMachines', name: 'Washing Machines', icon: <WashingMachine className="h-7 w-7 text-white" />, defaultCount: 1, powerUsage: '500-1000W/h' },
  { id: 'coffeeMakers', name: 'Coffee Makers', icon: <Coffee className="h-7 w-7 text-white" />, defaultCount: 1, powerUsage: '900-1200W/h' },
  { id: 'smartphones', name: 'Smartphones', icon: <Smartphone className="h-7 w-7 text-white" />, defaultCount: 3, powerUsage: '5-10W/h' },
];

const InputForm: React.FC = () => {
  const { fetchPrediction, fetchForecast, setLoading } = useEnergyStore();
  const { isAuthenticated } = useAuthStore();
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
    
    if (!isAuthenticated) {
      toast.error('Please log in to generate predictions');
      return;
    }

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
    <>
      <style>{customStyles}</style>
      <form onSubmit={handleSubmit} className="space-y-8 relative z-0">
        <div className="bg-white rounded-xl overflow-hidden relative z-10">
          <div className="p-6">
            <div className="mb-8 relative z-20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Select Date Range
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative bg-purple-50 p-5 rounded-xl shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date: Date) => setStartDate(date)}
                    className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white text-gray-900"
                    dateFormat="MMMM d, yyyy"
                    placeholderText="Select start date"
                  />
                </div>
                <div className="relative bg-purple-50 p-5 rounded-xl shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date: Date) => setEndDate(date)}
                    className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white text-gray-900"
                    dateFormat="MMMM d, yyyy"
                    minDate={new Date(startDate.getTime() + 86400000)}
                    placeholderText="Select end date"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8 relative z-10">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Configure Appliances
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {appliances.map((appliance) => (
                  <div
                    key={appliance.id}
                    className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-800 p-3 rounded-lg shadow-md">
                          <div className="text-white">
                            {appliance.icon}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900">
                            {appliance.name}
                          </label>
                          <span className="text-xs text-gray-600">{appliance.powerUsage}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-purple-50 rounded-lg p-2">
                      <button
                        type="button"
                        onClick={() => handleApplianceChange(appliance.id, Math.max(0, applianceCounts[appliance.id] - 1))}
                        className="p-2 rounded-lg bg-white text-purple-600 hover:bg-purple-100 transition-colors shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="number"
                        value={applianceCounts[appliance.id]}
                        onChange={(e) => handleApplianceChange(appliance.id, Math.max(0, parseInt(e.target.value) || 0))}
                        className="mx-2 w-16 text-center p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium"
                        min="0"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplianceChange(appliance.id, applianceCounts[appliance.id] + 1)}
                        className="p-2 rounded-lg bg-white text-purple-600 hover:bg-purple-100 transition-colors shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m6-6H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl 
                  hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 
                  focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5
                  flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Generate Prediction
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default InputForm;