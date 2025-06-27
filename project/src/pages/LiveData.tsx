import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DeviceData {
  temperature: number;
  humidity: number;
  voltage: number;
  current: number;
  power: number;
  energy: number;
  timestamp: string;
  device_id?: string;
}

function parseTimestamp(ts: string) {
  // If it's a number or a string of digits, treat as epoch seconds
  if (!isNaN(Number(ts)) && String(Number(ts)).length <= 12) {
    return new Date(Number(ts) * 1000);
  }
  // Otherwise, try to parse as ISO
  return new Date(ts);
}

const LiveData: React.FC = () => {
  const [data, setData] = useState<DeviceData[]>([]);
  const [notConnected, setNotConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAllDeviceData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('device_data')
      .select('*')
      .order('timestamp', { ascending: true });
    setLoading(false);
    if (error || !data || data.length === 0) {
      setNotConnected(true);
      setData([]);
      return;
    }
    setData(data);
    // Check if the latest data is older than 2 minutes
    const last = data[data.length - 1];
    if (new Date().getTime() - parseTimestamp(last.timestamp).getTime() > 2 * 60 * 1000) {
      setNotConnected(true);
    } else {
      setNotConnected(false);
    }
  };

  useEffect(() => {
    fetchAllDeviceData();
    const interval = setInterval(fetchAllDeviceData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter out rows with missing or invalid timestamp
  const filteredData = data.filter(d => {
    if (!d.timestamp) return false;
    const date = parseTimestamp(d.timestamp);
    return date instanceof Date && !isNaN(date.getTime());
  });

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (notConnected) return <div className="p-8 text-center text-red-600 font-bold text-lg">Device not connected</div>;
  if (!filteredData || filteredData.length === 0) return <div className="p-8 text-center">No data available</div>;

  // Latest value
  const latest = filteredData[filteredData.length - 1];

  // For the graph, show oldest on the left, latest on the right
  const graphData = [...filteredData];
  graphData.sort((a, b) => parseTimestamp(a.timestamp).getTime() - parseTimestamp(b.timestamp).getTime());
  const labels = graphData.map(d => parseTimestamp(d.timestamp).toLocaleString());
  const powerData = graphData.map(d => d.power);
  const energyData = graphData.map(d => d.energy);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Power (W)',
        data: powerData,
        borderColor: 'rgb(168,85,247)',
        backgroundColor: 'rgba(168,85,247,0.2)',
        yAxisID: 'y',
      },
      {
        label: 'Energy (Wh)',
        data: energyData,
        borderColor: 'rgb(34,197,94)',
        backgroundColor: 'rgba(34,197,94,0.2)',
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: 'white' }
      },
      title: {
        display: true,
        text: 'Power and Energy Over Time',
        color: 'white',
        font: { size: 20 }
      },
    },
    scales: {
      x: {
        ticks: { color: 'white' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: 'Power (W)', color: 'white' },
        ticks: { color: 'white' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: { display: true, text: 'Energy (Wh)', color: 'white' },
        ticks: { color: 'white' },
        grid: { drawOnChartArea: false }
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-gray-900 rounded-xl shadow-lg p-8 border border-purple-700">
      {/* Live values card */}
      <div className="mb-8 bg-purple-800 rounded-lg p-6 flex flex-col md:flex-row justify-between items-center text-white shadow-md">
        <div className="mb-4 md:mb-0 text-center md:text-left">
          <h2 className="text-2xl font-extrabold mb-2">Live Device Values</h2>
          <div className="flex flex-wrap gap-6 justify-center md:justify-start">
            <div><span className="font-bold text-purple-200">Temperature:</span> {latest.temperature} °C</div>
            <div><span className="font-bold text-purple-200">Humidity:</span> {latest.humidity} %</div>
            <div><span className="font-bold text-purple-200">Voltage:</span> {latest.voltage} V</div>
            <div><span className="font-bold text-purple-200">Current:</span> {latest.current} A</div>
            <div><span className="font-bold text-purple-200">Power:</span> {latest.power} W</div>
            <div><span className="font-bold text-purple-200">Energy:</span> {latest.energy} Wh</div>
          </div>
        </div>
        <div className="text-sm text-gray-200 mt-4 md:mt-0">
          Last updated: {parseTimestamp(latest.timestamp).toLocaleString()}
        </div>
      </div>
      {/* Graph */}
      <div className="mb-8 bg-gray-800 rounded-lg p-4 min-h-[400px] h-[450px]">
        <Line data={chartData} options={chartOptions} height={400} />
      </div>
      {/* History Table */}
      <div className="overflow-x-auto">
        <h3 className="text-xl font-bold text-white mb-4">History</h3>
        <table className="min-w-full bg-gray-800 rounded-lg text-white">
          <thead>
            <tr>
              <th className="px-3 py-2">Timestamp</th>
              <th className="px-3 py-2">Temperature (°C)</th>
              <th className="px-3 py-2">Humidity (%)</th>
              <th className="px-3 py-2">Voltage (V)</th>
              <th className="px-3 py-2">Current (A)</th>
              <th className="px-3 py-2">Power (W)</th>
              <th className="px-3 py-2">Energy (Wh)</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((d, i) => (
              <tr key={i} className="odd:bg-gray-900 even:bg-gray-800">
                <td className="px-3 py-2">{parseTimestamp(d.timestamp).toLocaleString()}</td>
                <td className="px-3 py-2">{d.temperature}</td>
                <td className="px-3 py-2">{d.humidity}</td>
                <td className="px-3 py-2">{d.voltage}</td>
                <td className="px-3 py-2">{d.current}</td>
                <td className="px-3 py-2">{d.power}</td>
                <td className="px-3 py-2">{d.energy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LiveData; 