import React, { useEffect, useState, useRef } from "react";
import { useEnergyStore } from "../store/energyStore";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  Scale,
  ScaleOptionsByType,
  Chart,
} from "chart.js";
import annotationPlugin from 'chartjs-plugin-annotation';
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

interface ComparisonData {
  energy_prediction: number[];
  ts_predictions: number[];
  dates: string[];
  splitIndex: number;
  historical_values: number[];
}

const ResultsDisplay: React.FC = () => {
  const { prediction, loading } = useEnergyStore();
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<ChartJS | null>(null);
  const [stats, setStats] = useState<{
    historical: { total: number; daily: number };
    predicted: { total: number; daily: number };
  } | null>(null);

  // Cleanup function to destroy chart instance
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    try {
      if (prediction) {
        const dailyConsumption = prediction.consumption / prediction.days;
        const energyPrediction = Array(prediction.days).fill(dailyConsumption);
        const dates = Array.from({ length: prediction.days }, (_, i) => {
          const date = new Date(prediction.start_date);
          date.setDate(date.getDate() + i);
          return date.toLocaleDateString();
        });

        const splitIndex = Math.floor(dates.length / 2);
        
        // Use fixed historical values
        const historicalValues = Array.from({ length: splitIndex }, (_, i) => {
          // Fixed values based on the daily consumption
          const baseValue = dailyConsumption;
          // Fixed array of multipliers for each day
          const fixedMultipliers = [
            1.0, 0.95, 1.05, 1.1, 0.9, 1.15, 1.0,  // Week 1
            0.95, 1.05, 1.1, 0.9, 1.15, 1.0, 0.95, // Week 2
            1.05, 1.1, 0.9, 1.15, 1.0, 0.95, 1.05, // Week 3
            1.1, 0.9, 1.15, 1.0, 0.95, 1.05, 1.1,  // Week 4
            0.9, 1.15, 1.0, 0.95, 1.05, 1.1, 0.9,  // Week 5
            1.15, 1.0, 0.95, 1.05, 1.1, 0.9, 1.15  // Week 6
          ];
          // Use the multiplier at the current index, or 1.0 if we're beyond the array
          const multiplier = fixedMultipliers[i % fixedMultipliers.length] || 1.0;
          return baseValue * multiplier;
        });

        if (!Array.isArray(energyPrediction) || !Array.isArray(dates) || 
            !Array.isArray(prediction.time_series_predictions) ||
            splitIndex < 0 || splitIndex >= dates.length) {
          throw new Error('Invalid data format for chart');
        }

        setComparisonData({
          energy_prediction: energyPrediction,
          ts_predictions: prediction.time_series_predictions,
          dates,
          splitIndex,
          historical_values: historicalValues
        });
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the data');
      console.error('Error in ResultsDisplay:', err);
    }
  }, [prediction]);

  // Calculate statistics when comparison data changes
  useEffect(() => {
    if (comparisonData) {
      const historicalValues = comparisonData.historical_values.slice(0, comparisonData.splitIndex);
      const predictedValues = comparisonData.energy_prediction.slice(comparisonData.splitIndex);
      
      const historicalTotal = historicalValues.reduce((sum, val) => sum + val, 0);
      const predictedTotal = predictedValues.reduce((sum, val) => sum + val, 0);
      
      setStats({
        historical: {
          total: Number(historicalTotal.toFixed(2)),
          daily: Number((historicalTotal / historicalValues.length).toFixed(2))
        },
        predicted: {
          total: Number(predictedTotal.toFixed(2)),
          daily: Number((predictedTotal / predictedValues.length).toFixed(2))
        }
      });
    }
  }, [comparisonData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  if (!prediction || !comparisonData) {
    return null;
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Energy Consumption Over Time'
      },
      annotation: {
        annotations: {
          line1: {
            type: 'line',
            xMin: comparisonData?.splitIndex,
            xMax: comparisonData?.splitIndex,
            borderColor: 'rgb(169, 169, 169)',
            borderWidth: 2,
            label: {
              display: true,
              content: 'Prediction Start',
              position: 'start'
            }
          }
        }
      }
    },
    scales: {
      x: {
        type: 'category' as const,
        display: true,
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Energy Consumption (kWh)'
        }
      }
    }
  };

  const chartData: ChartData<'line'> = {
    labels: comparisonData?.dates || [],
    datasets: [
      {
        label: 'Historical Consumption',
        data: comparisonData?.historical_values.map((value, index) => 
          index < (comparisonData?.splitIndex || 0) ? value : null) || [],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.5)',
        borderWidth: 2,
        pointRadius: 2,
        spanGaps: false
      },
      {
        label: 'Predicted Consumption',
        data: comparisonData?.energy_prediction.map((value, index) => 
          index >= (comparisonData?.splitIndex || 0) ? value : null) || [],
        borderColor: 'rgb(219, 39, 119)',
        backgroundColor: 'rgba(219, 39, 119, 0.5)',
        borderWidth: 2,
        pointRadius: 2,
        spanGaps: false
      },
      {
        label: 'Time Series Prediction',
        data: comparisonData?.ts_predictions.map((value, index) => 
          index >= (comparisonData?.splitIndex || 0) ? value : null) || [],
        borderColor: 'rgb(45, 212, 191)',
        backgroundColor: 'rgba(45, 212, 191, 0.5)',
        borderWidth: 2,
        pointRadius: 2,
        borderDash: [5, 5],
        spanGaps: false
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Energy Consumption Prediction</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-purple-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-purple-800 mb-3">Historical Consumption</h3>
            <div className="space-y-2">
              <p className="text-gray-600">
                Total: <span className="font-semibold text-purple-700">{stats?.historical.total} kWh</span>
              </p>
              <p className="text-gray-600">
                Daily Average: <span className="font-semibold text-purple-700">{stats?.historical.daily} kWh</span>
              </p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Predicted Period</h3>
            <div className="space-y-2">
              <p className="text-gray-600">
                Total: <span className="font-semibold text-blue-700">{stats?.predicted.total} kWh</span>
              </p>
              <p className="text-gray-600">
                Daily Average: <span className="font-semibold text-blue-700">{stats?.predicted.daily} kWh</span>
              </p>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Total Prediction</h3>
            <div className="space-y-2">
              <p className="text-gray-600">
                Total: <span className="font-semibold text-green-700">{prediction.consumption.toFixed(2)} kWh</span>
              </p>
              <p className="text-gray-600">
                Days: <span className="font-semibold text-green-700">{prediction.days}</span>
              </p>
              <p className="text-gray-600">
                Daily Average: <span className="font-semibold text-green-700">
                  {(prediction.consumption / prediction.days).toFixed(2)} kWh
                </span>
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="relative" style={{ height: "400px" }}>
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              comparisonData && <Line ref={chartRef} options={options} data={chartData} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;
