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
  ChartType,
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

// Set Chart.js defaults for better performance
ChartJS.defaults.responsive = true;
ChartJS.defaults.maintainAspectRatio = false;
ChartJS.defaults.animation = false; // Disable animations completely

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
  const chartRef = useRef<ChartJS<"line">>(null);
  const [stats, setStats] = useState<{
    historical: { total: number; daily: number };
    predicted: { total: number; daily: number };
  } | null>(null);

  // Add new state for initial view
  const [isInitialView, setIsInitialView] = useState(true);

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

        // Calculate split index based on historical values length
        const splitIndex = prediction.historical_values.length;
        
        // Use the exact historical values and time series predictions from the backend
        const historicalValues = prediction.historical_values || [];
        const timeSeriesPredictions = prediction.time_series_predictions || [];

        if (!Array.isArray(energyPrediction) || !Array.isArray(dates) || 
            !Array.isArray(historicalValues) || !Array.isArray(timeSeriesPredictions) ||
            splitIndex < 0 || splitIndex >= dates.length) {
          throw new Error('Invalid data format for chart');
        }

        setComparisonData({
          energy_prediction: energyPrediction,
          ts_predictions: timeSeriesPredictions,
          dates,
          splitIndex,
          historical_values: historicalValues
        });
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the data');
    }
  }, [prediction]);

  useEffect(() => {
    if (prediction) {
      setIsInitialView(false);
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
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Analyzing your energy consumption...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[200px] flex items-center justify-center bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 mx-auto mb-4 w-fit">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!prediction || !comparisonData) {
    return null;
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        position: 'top',
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
        type: 'category',
        display: true,
        title: {
          display: true,
          text: 'Date'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
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
        borderWidth: 1.5,
        pointRadius: 1,
        spanGaps: false
      },
      {
        label: 'Predicted Consumption',
        data: comparisonData?.energy_prediction.map((value, index) => 
          index >= (comparisonData?.splitIndex || 0) ? value : null) || [],
        borderColor: 'rgb(219, 39, 119)',
        backgroundColor: 'rgba(219, 39, 119, 0.5)',
        borderWidth: 1.5,
        pointRadius: 1,
        spanGaps: false
      },
      {
        label: 'Time Series Prediction',
        data: Array(comparisonData?.splitIndex || 0).fill(null).concat(comparisonData?.ts_predictions || []),
        borderColor: 'rgb(45, 212, 191)',
        backgroundColor: 'rgba(45, 212, 191, 0.5)',
        borderWidth: 1.5,
        pointRadius: 1,
        borderDash: [5, 5],
        spanGaps: false
      }
    ]
  };

  // Simplified background chart options
  const backgroundChartOptions = {
    ...options,
    plugins: {
      ...options.plugins,
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      x: { display: false },
      y: { display: false }
    }
  };

  return (
    <div className="space-y-8 px-4 py-6 max-w-[1400px] mx-auto">
      <div className="bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 border-b border-white/10">
          <h2 className="text-3xl font-bold text-white flex items-center">
            <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Energy Consumption Analysis
          </h2>
        </div>
        
        <div className="p-8">
          {/* Show either initial view or prediction results */}
          {isInitialView ? (
            <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white transform hover:scale-[1.02] transition-transform duration-300 shadow-lg hover:shadow-2xl">
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMjAgMCBMIDAgMCAwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
              </div>
              
              <div className="relative p-8">
                <div className="grid grid-cols-2 gap-12">
                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <h3 className="text-xl font-medium text-purple-100">Today's Consumption</h3>
                    <div className="mt-4 flex items-baseline">
                      <p className="text-6xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">0.0</p>
                      <span className="ml-2 text-2xl text-purple-200">kWh</span>
            </div>
          </div>

                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <h3 className="text-xl font-medium text-purple-100">Yesterday's Consumption</h3>
                    <div className="mt-4 flex items-baseline">
                      <p className="text-6xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">0.0</p>
                      <span className="ml-2 text-2xl text-purple-200">kWh</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-center">
                    <span className="text-xl text-white">Configure appliances and dates to start prediction</span>
                  </div>
                </div>
              </div>
            </div>
          ) :
            comparisonData && (
              <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white transform hover:scale-[1.02] transition-transform duration-300 shadow-lg hover:shadow-2xl">
                <div className="absolute inset-0 opacity-30">
                  {!loading && <Line ref={chartRef} options={backgroundChartOptions} data={chartData} />}
          </div>

                <div className="relative p-8">
                  <div className="grid grid-cols-2 gap-12">
                    <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                      <h3 className="text-xl font-medium text-purple-100">Today's Consumption</h3>
                      <div className="mt-4 flex items-baseline">
                        <p className="text-6xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                          {comparisonData.energy_prediction[comparisonData.energy_prediction.length - 1]?.toFixed(1)}
                        </p>
                        <span className="ml-2 text-2xl text-purple-200">kWh</span>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                      <h3 className="text-xl font-medium text-purple-100">Yesterday's Consumption</h3>
                      <div className="mt-4 flex items-baseline">
                        <p className="text-6xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                          {comparisonData.energy_prediction[comparisonData.energy_prediction.length - 2]?.toFixed(1)}
                        </p>
                        <span className="ml-2 text-2xl text-purple-200">kWh</span>
            </div>
          </div>
        </div>

                  <div className="mt-8 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center">
                      <span className="text-xl text-white">Trend:</span>
                      {comparisonData.energy_prediction[comparisonData.energy_prediction.length - 1] >
                       comparisonData.energy_prediction[comparisonData.energy_prediction.length - 2] ? (
                        <div className="ml-4 flex items-center text-red-300">
                          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          <span className="text-lg font-medium">Increased consumption</span>
                        </div>
                      ) : (
                        <div className="ml-4 flex items-center text-green-300">
                          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                          </svg>
                          <span className="text-lg font-medium">Decreased consumption</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          {/* Only show statistics cards and main chart when there's prediction data */}
          {!isInitialView && comparisonData && (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-purple-700/30">
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-500/20 rounded-full p-3 mr-4">
                      <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-purple-100">Historical Usage</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-purple-950/30 p-3 rounded-xl border border-purple-700/20">
                      <span className="text-purple-200">Total Consumption:</span>
                      <span className="font-semibold text-white text-lg">{stats?.historical.total} kWh</span>
                    </div>
                    <div className="flex justify-between items-center bg-purple-950/30 p-3 rounded-xl border border-purple-700/20">
                      <span className="text-purple-200">Daily Average:</span>
                      <span className="font-semibold text-white text-lg">{stats?.historical.daily} kWh</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-900/50 to-indigo-800/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-indigo-700/30">
                  <div className="flex items-center mb-4">
                    <div className="bg-indigo-500/20 rounded-full p-3 mr-4">
                      <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-indigo-100">Predicted Usage</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-indigo-950/30 p-3 rounded-xl border border-indigo-700/20">
                      <span className="text-indigo-200">Total Consumption:</span>
                      <span className="font-semibold text-white text-lg">{stats?.predicted.total} kWh</span>
                    </div>
                    <div className="flex justify-between items-center bg-indigo-950/30 p-3 rounded-xl border border-indigo-700/20">
                      <span className="text-indigo-200">Daily Average:</span>
                      <span className="font-semibold text-white text-lg">{stats?.predicted.daily} kWh</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-pink-900/50 to-pink-800/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-pink-700/30">
                  <div className="flex items-center mb-4">
                    <div className="bg-pink-500/20 rounded-full p-3 mr-4">
                      <svg className="w-6 h-6 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-pink-100">Overall Analysis</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-pink-950/30 p-3 rounded-xl border border-pink-700/20">
                      <span className="text-pink-200">Total Days:</span>
                      <span className="font-semibold text-white text-lg">{prediction?.days}</span>
                    </div>
                    <div className="flex justify-between items-center bg-pink-950/30 p-3 rounded-xl border border-pink-700/20">
                      <span className="text-pink-200">Total Consumption:</span>
                      <span className="font-semibold text-white text-lg">{prediction?.consumption.toFixed(2)} kWh</span>
                    </div>
                    <div className="flex justify-between items-center bg-pink-950/30 p-3 rounded-xl border border-pink-700/20">
                      <span className="text-pink-200">Daily Average:</span>
                      <span className="font-semibold text-white text-lg">
                        {prediction ? (prediction.consumption / prediction.days).toFixed(2) : 0} kWh
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Chart */}
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl p-8 shadow-xl border border-gray-700/30">
                <div className="relative" style={{ height: "500px" }}>
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
              </div>
            ) : (
              comparisonData && <Line ref={chartRef} options={options} data={chartData} />
            )}
          </div>
              </div>
            </>
        )}
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
