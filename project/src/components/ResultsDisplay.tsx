import React, { useEffect, useState } from "react";
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
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ComparisonData {
  energy_prediction: number[];
  ts_predictions: number[];
  dates: string[];
}

const ResultsDisplay: React.FC = () => {
  const { prediction, loading } = useEnergyStore();
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(
    null
  );

  useEffect(() => {
    if (prediction) {
      // Use the time series predictions directly from the prediction
      const dailyConsumption = prediction.consumption / prediction.days;
      const energyPrediction = Array(prediction.days).fill(dailyConsumption);
      const dates = Array.from({ length: prediction.days }, (_, i) => {
        const date = new Date(prediction.start_date);
        date.setDate(date.getDate() + i);
        return date.toLocaleDateString();
      });

      setComparisonData({
        energy_prediction: energyPrediction,
        ts_predictions: prediction.time_series_predictions,
        dates,
      });
    }
  }, [prediction]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!prediction || !comparisonData) {
    return null;
  }

  const chartData: ChartData<"line"> = {
    labels: comparisonData.dates,
    datasets: [
      {
        label: "Energy Consumption",
        data: comparisonData.energy_prediction,
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        tension: 0.1,
      },
      {
        label: "Time Series Prediction",
        data: comparisonData.ts_predictions,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderDash: [5, 5],
        tension: 0.1,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Energy Consumption Predictions",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Energy Consumption (kWh)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
    },
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Prediction Results</h2>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            Total Energy Consumption
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {prediction.consumption.toFixed(2)} kWh
          </p>
        </div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Daily Average</h3>
          <p className="text-2xl font-bold text-blue-600">
            {(prediction.consumption / prediction.days).toFixed(2)} kWh/day
          </p>
        </div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Number of Days</h3>
          <p className="text-2xl font-bold text-green-600">
            {prediction.days} days
          </p>
        </div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Total Appliances</h3>
          <p className="text-2xl font-bold text-orange-600">
            {prediction.total_appliances}
          </p>
        </div>
        <div className="mt-8">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
