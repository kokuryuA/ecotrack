import React from 'react';
import { useEnergyStore } from '../store/energyStore';
import { 
  Lightbulb, 
  Tv, 
  Computer, 
  Fan, 
  Refrigerator, 
  WashingMachine, 
  Coffee, 
  Smartphone,
  Plus,
  Minus
} from 'lucide-react';

// Types
interface Appliance {
  id: string;
  name: string;
  icon: React.ReactNode;
  powerUsage: string;
  defaultCount: number;
}

// Constants
const appliances: Appliance[] = [
  { 
    id: 'lightbulbs', 
    name: 'Light Bulbs', 
    icon: <Lightbulb className="w-6 h-6" />, 
    powerUsage: '60W/h',
    defaultCount: 8
  },
  { 
    id: 'tvs', 
    name: 'TVs', 
    icon: <Tv className="w-6 h-6" />, 
    powerUsage: '100-200W/h',
    defaultCount: 1
  },
  { 
    id: 'computers', 
    name: 'Computers', 
    icon: <Computer className="w-6 h-6" />, 
    powerUsage: '150-300W/h',
    defaultCount: 2
  },
  { 
    id: 'fans', 
    name: 'Fans', 
    icon: <Fan className="w-6 h-6" />, 
    powerUsage: '50-100W/h',
    defaultCount: 2
  },
  { 
    id: 'refrigerators', 
    name: 'Refrigerators', 
    icon: <Refrigerator className="w-6 h-6" />, 
    powerUsage: '150-400W/h',
    defaultCount: 1
  },
  { 
    id: 'washingMachines', 
    name: 'Washing Machines', 
    icon: <WashingMachine className="w-6 h-6" />, 
    powerUsage: '500-1000W/h',
    defaultCount: 1
  },
  { 
    id: 'coffeeMakers', 
    name: 'Coffee Makers', 
    icon: <Coffee className="w-6 h-6" />, 
    powerUsage: '900-1200W/h',
    defaultCount: 1
  },
  { 
    id: 'smartphones', 
    name: 'Smartphones', 
    icon: <Smartphone className="w-6 h-6" />, 
    powerUsage: '5-10W/h',
    defaultCount: 3
  }
];

// Component
const ApplianceSelector: React.FC = () => {
  // Hooks
  const { appliances: applianceCounts, updateAppliance } = useEnergyStore();

  // Handlers
  const handleIncrement = (type: string) => {
    updateAppliance(type, (applianceCounts[type] || 0) + 1);
  };

  const handleDecrement = (type: string) => {
    if (applianceCounts[type] > 0) {
      updateAppliance(type, applianceCounts[type] - 1);
    }
  };

  // Render
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
        <Lightbulb className="w-6 h-6 mr-2 text-purple-600" />
        Household Appliances
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appliances.map(({ id, name, icon, powerUsage }) => (
          <div 
            key={id}
            className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                {icon}
              </div>
              <div className="flex flex-col">
                <p className="font-medium text-gray-900">{name}</p>
                <span className="text-sm text-gray-600">{powerUsage}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDecrement(id)}
                className="bg-purple-100 text-purple-600 rounded-full p-2 hover:bg-purple-200 transition-colors"
                aria-label={`Decrease ${name} count`}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-medium text-gray-900">
                {applianceCounts[id] || 0}
              </span>
              <button
                onClick={() => handleIncrement(id)}
                className="bg-purple-100 text-purple-600 rounded-full p-2 hover:bg-purple-200 transition-colors"
                aria-label={`Increase ${name} count`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplianceSelector; 