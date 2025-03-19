import React, { useEffect, useState } from 'react';
import { useEnergyStore } from '../stores/energyStore';
import { LightBulbIcon, TvIcon, ComputerIcon, FanIcon, RefrigeratorIcon, WashingMachineIcon, CoffeeIcon, SmartphoneIcon } from '@heroicons/react/24/outline';

const ApplianceSelector: React.FC = () => {
  const { appliances, updateAppliance } = useEnergyStore();

  const handleIncrement = (type: string) => {
    updateAppliance(type, (appliances[type] || 0) + 1);
  };

  const handleDecrement = (type: string) => {
    if (appliances[type] > 0) {
      updateAppliance(type, appliances[type] - 1);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Household Appliances</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <LightBulbIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex flex-col">
              <p className="font-medium">Light Bulbs</p>
              <span className="text-sm text-gray-600">60W/h</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDecrement("lightbulbs")}
              className="bg-gray-200 rounded-full p-2"
            >
              -
            </button>
            <span className="w-8 text-center">{appliances.lightbulbs || 0}</span>
            <button
              onClick={() => handleIncrement("lightbulbs")}
              className="bg-gray-200 rounded-full p-2"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <TvIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex flex-col">
              <p className="font-medium">TVs</p>
              <span className="text-sm text-gray-600">100-200W/h</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDecrement("tvs")}
              className="bg-gray-200 rounded-full p-2"
            >
              -
            </button>
            <span className="w-8 text-center">{appliances.tvs || 0}</span>
            <button
              onClick={() => handleIncrement("tvs")}
              className="bg-gray-200 rounded-full p-2"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <ComputerIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex flex-col">
              <p className="font-medium">Computers</p>
              <span className="text-sm text-gray-600">150-300W/h</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDecrement("computers")}
              className="bg-gray-200 rounded-full p-2"
            >
              -
            </button>
            <span className="w-8 text-center">{appliances.computers || 0}</span>
            <button
              onClick={() => handleIncrement("computers")}
              className="bg-gray-200 rounded-full p-2"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <FanIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex flex-col">
              <p className="font-medium">Fans</p>
              <span className="text-sm text-gray-600">50-100W/h</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDecrement("fans")}
              className="bg-gray-200 rounded-full p-2"
            >
              -
            </button>
            <span className="w-8 text-center">{appliances.fans || 0}</span>
            <button
              onClick={() => handleIncrement("fans")}
              className="bg-gray-200 rounded-full p-2"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <RefrigeratorIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex flex-col">
              <p className="font-medium">Refrigerators</p>
              <span className="text-sm text-gray-600">150-400W/h</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDecrement("refrigerators")}
              className="bg-gray-200 rounded-full p-2"
            >
              -
            </button>
            <span className="w-8 text-center">{appliances.refrigerators || 0}</span>
            <button
              onClick={() => handleIncrement("refrigerators")}
              className="bg-gray-200 rounded-full p-2"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <WashingMachineIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex flex-col">
              <p className="font-medium">Washing Machines</p>
              <span className="text-sm text-gray-600">500-1000W/h</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDecrement("washingMachines")}
              className="bg-gray-200 rounded-full p-2"
            >
              -
            </button>
            <span className="w-8 text-center">{appliances.washingMachines || 0}</span>
            <button
              onClick={() => handleIncrement("washingMachines")}
              className="bg-gray-200 rounded-full p-2"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <CoffeeIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex flex-col">
              <p className="font-medium">Coffee Makers</p>
              <span className="text-sm text-gray-600">900-1200W/h</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDecrement("coffeeMakers")}
              className="bg-gray-200 rounded-full p-2"
            >
              -
            </button>
            <span className="w-8 text-center">{appliances.coffeeMakers || 0}</span>
            <button
              onClick={() => handleIncrement("coffeeMakers")}
              className="bg-gray-200 rounded-full p-2"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <SmartphoneIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex flex-col">
              <p className="font-medium">Smartphones</p>
              <span className="text-sm text-gray-600">5-10W/h</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDecrement("smartphones")}
              className="bg-gray-200 rounded-full p-2"
            >
              -
            </button>
            <span className="w-8 text-center">{appliances.smartphones || 0}</span>
            <button
              onClick={() => handleIncrement("smartphones")}
              className="bg-gray-200 rounded-full p-2"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplianceSelector; 