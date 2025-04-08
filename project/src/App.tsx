import React, { useEffect, useMemo } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import InputForm from "./components/InputForm";
import ResultsDisplay from "./components/ResultsDisplay";
import Footer from "./components/Footer";
import { useAuthStore } from "./store/authStore";
import Login from "./pages/Login";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PredictionHistory from './components/PredictionHistory';
import { useEnergyStore } from "./store/energyStore";
import Navigation from './components/Navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import PredictionResults from './components/PredictionResults';

function App() {
  const { isAuthenticated, checkUser } = useAuthStore();
  const { prediction } = useEnergyStore();

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  // Memoize the ConsumptionOverview component to prevent unnecessary re-renders
  const ConsumptionOverview = useMemo(() => {
    if (!prediction?.historical_values || prediction.historical_values.length < 2) return null;

    const todayConsumption = prediction.historical_values[prediction.historical_values.length - 1];
    const yesterdayConsumption = prediction.historical_values[prediction.historical_values.length - 2];
    const percentageChange = ((todayConsumption - yesterdayConsumption) / yesterdayConsumption) * 100;

    return (
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-xl overflow-hidden shadow-lg mb-5">
        <div className="p-5">
          <h2 className="text-xl font-bold text-white mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Consumption Overview
          </h2>
          <div className="text-white text-opacity-80 mb-4 text-sm">
            Period: {prediction.start_date} to {prediction.end_date} ({prediction.days} days)
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="flex justify-between items-center bg-pink-950/30 p-2 rounded-lg border border-pink-700/20">
                <span className="text-pink-200 text-xs">Total Appliances:</span>
                <span className="font-semibold text-white">{prediction.total_appliances}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center bg-pink-950/30 p-2 rounded-lg border border-pink-700/20">
                <span className="text-pink-200 text-xs">Total Days:</span>
                <span className="font-semibold text-white">{prediction.days}</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center bg-pink-950/30 p-2 rounded-lg border border-pink-700/20">
                <span className="text-pink-200 text-xs">Total Consumption:</span>
                <span className="font-semibold text-white">{prediction.consumption.toFixed(2)} kWh</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [prediction]);

  // Energy Metrics Widget
  const EnergyMetricsWidget = useMemo(() => (
    <div className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
      <div className="p-3">
        <h3 className="text-purple-700 font-medium mb-2 text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Energy Metrics
        </h3>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 rounded-lg" style={{ backgroundColor: "#f0f9f0" }}>
            <span className="text-green-700 text-xs">Carbon:</span>
            <span className="font-medium text-green-800 text-xs">Medium</span>
          </div>
          
          <div className="flex justify-between items-center p-2 rounded-lg" style={{ backgroundColor: "#f0f5ff" }}>
            <span className="text-blue-700 text-xs">Usage:</span>
            <span className="font-medium text-blue-800 text-xs">325 kWh</span>
          </div>
          
          <div className="flex justify-between items-center p-2 rounded-lg" style={{ backgroundColor: "#fffbeb" }}>
            <span className="text-yellow-700 text-xs">Grade:</span>
            <span className="font-medium text-yellow-800 text-xs">B+</span>
          </div>
        </div>
      </div>
    </div>
  ), []);

  // Calendar widget
  const CalendarWidget = useMemo(() => (
    <div className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
      <div className="p-3">
        <h3 className="text-purple-700 font-medium mb-2 text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Calendar
        </h3>
        
        <div className="flex justify-between items-center mb-1 text-xs">
          <button className="text-gray-700 hover:bg-gray-200 px-1.5 rounded">«</button>
          <div className="text-gray-800 font-medium">avril 2025</div>
          <button className="text-gray-700 hover:bg-gray-200 px-1.5 rounded">»</button>
        </div>
        
        <div className="grid grid-cols-7 gap-0 text-center">
          <div className="text-gray-600 text-[10px] font-medium py-0.5">LUN</div>
          <div className="text-gray-600 text-[10px] font-medium py-0.5">MAR</div>
          <div className="text-gray-600 text-[10px] font-medium py-0.5">MER</div>
          <div className="text-gray-600 text-[10px] font-medium py-0.5">JEU</div>
          <div className="text-gray-600 text-[10px] font-medium py-0.5">VEN</div>
          <div className="text-red-500 text-[10px] font-medium py-0.5">SAM</div>
          <div className="text-red-500 text-[10px] font-medium py-0.5">DIM</div>
          
          <div className="text-gray-400 py-0.5 text-[10px]">31</div>
          <div className="text-gray-700 py-0.5 text-[10px]">1</div>
          <div className="text-gray-700 py-0.5 text-[10px]">2</div>
          <div className="text-gray-700 py-0.5 text-[10px]">3</div>
          <div className="text-gray-700 py-0.5 text-[10px]">4</div>
          <div className="text-red-500 py-0.5 text-[10px]">5</div>
          <div className="text-red-500 py-0.5 text-[10px]">6</div>
          
          <div className="text-gray-700 py-0.5 text-[10px]">7</div>
          <div className="text-gray-700 py-0.5 text-[10px]">8</div>
          <div className="text-gray-700 py-0.5 text-[10px]">9</div>
          <div className="text-gray-700 py-0.5 text-[10px]">10</div>
          <div className="text-gray-700 py-0.5 text-[10px]">11</div>
          <div className="text-red-500 py-0.5 text-[10px]">12</div>
          <div className="text-red-500 py-0.5 text-[10px]">13</div>
          
          <div className="text-gray-700 py-0.5 text-[10px]">14</div>
          <div className="text-gray-700 py-0.5 text-[10px]">15</div>
          <div className="text-gray-700 py-0.5 text-[10px]">16</div>
          <div className="text-gray-700 py-0.5 text-[10px]">17</div>
          <div className="text-gray-700 py-0.5 text-[10px]">18</div>
          <div className="text-red-500 py-0.5 text-[10px]">19</div>
          <div className="text-red-500 py-0.5 text-[10px]">20</div>
          
          <div className="text-gray-700 py-0.5 text-[10px]">21</div>
          <div className="text-gray-700 py-0.5 text-[10px]">22</div>
          <div className="text-gray-700 py-0.5 text-[10px]">23</div>
          <div className="text-gray-700 py-0.5 text-[10px]">24</div>
          <div className="text-gray-700 py-0.5 text-[10px]">25</div>
          <div className="text-red-500 py-0.5 text-[10px]">26</div>
          <div className="text-red-500 py-0.5 text-[10px]">27</div>
          
          <div className="text-gray-700 py-0.5 text-[10px]">28</div>
          <div className="text-gray-700 py-0.5 text-[10px]">29</div>
          <div className="text-gray-700 py-0.5 text-[10px]">30</div>
          <div className="text-gray-400 py-0.5 text-[10px]">1</div>
          <div className="text-gray-400 py-0.5 text-[10px]">2</div>
          <div className="text-red-500 opacity-50 py-0.5 text-[10px]">3</div>
          <div className="text-red-500 opacity-50 py-0.5 text-[10px]">4</div>
        </div>
      </div>
    </div>
  ), []);

  // Weather widget
  const WeatherWidget = useMemo(() => (
    <div className="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
      <div className="p-3">
        <h3 className="text-purple-700 font-medium mb-2 text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          Weather
        </h3>
        
        <div className="text-center mb-2">
          <div className="text-3xl font-bold text-gray-800">14°C</div>
          <div className="text-gray-600 mt-0.5 text-xs">Clear</div>
        </div>
        
        <div className="grid grid-cols-2 gap-1 bg-white p-2 rounded-lg text-xs">
          <div>
            <div className="text-gray-600">Humidity: 35%</div>
          </div>
          <div>
            <div className="text-gray-600">Wind: 3 m/s</div>
          </div>
          <div>
            <div className="text-gray-600">Cloud: 0%</div>
          </div>
          <div>
            <div className="text-gray-600">Rain: 0%</div>
          </div>
        </div>
      </div>
    </div>
  ), []);

  // Memoize the HomeContent component to prevent unnecessary re-renders
  const HomeContent = useMemo(() => (
    <div className="mt-4">
      {/* Main purple container */}
      <div className="w-full bg-purple-600 rounded-xl overflow-hidden">
        <div className="flex items-center px-6 pt-6">
          <div className="bg-white/20 p-2.5 rounded-full mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="text-white h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Energy Consumption Predictor
          </h1>
        </div>
        
        <div className="px-6 pb-3">
          <p className="text-white/80 text-sm">
            Predict your energy consumption based on your household appliances and usage patterns. 
            Our advanced algorithm analyzes your inputs to provide accurate forecasts.
          </p>
        </div>
        
        <div className="px-6 py-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left side - Prediction Form */}
            <div className="w-full">
              {/* Configure Your Prediction section */}
              <div className="mb-5">
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-1.5 rounded-lg mr-2">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">Configure Your Prediction</h2>
                </div>
              
                {/* Input Form and Widgets integrated in one container */}
                <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                  <div className="p-5 flex flex-col md:flex-row gap-4">
                    {/* Left side with Input Form */}
                    <div className="md:w-3/4">
                      <InputForm />
                    </div>
                    
                    {/* Right side with widgets - now integrated inside the prediction box */}
                    <div className="md:w-1/4 border-l pl-4">
                      <div className="space-y-3">
                        {CalendarWidget}
                        {WeatherWidget}
                        {EnergyMetricsWidget}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          
              {/* Prediction Results */}
              {prediction && (
                <div className="mt-6">
                  {ConsumptionOverview}
                  <ResultsDisplay />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  ), [prediction, ConsumptionOverview, CalendarWidget, WeatherWidget, EnergyMetricsWidget]);

  // Memoize the background pattern to prevent unnecessary re-renders
  const backgroundPattern = useMemo(() => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div 
        className="absolute inset-0 opacity-15 bg-pattern"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
          backgroundRepeat: 'repeat',
          transform: 'rotate(-15deg) scale(1.5)',
          animation: 'subtle-drift 60s linear infinite',
        }}
      />
      <div 
        className="absolute inset-0 opacity-10 bg-pattern"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
          backgroundRepeat: 'repeat',
          transform: 'rotate(15deg) scale(1.2)',
          animation: 'subtle-drift-reverse 50s linear infinite',
        }}
      />
    </div>
  ), []);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {backgroundPattern}
        <div className="relative z-10 flex-grow">
          <Header />
          <main className="container mx-auto px-4 py-4">
            <Navigation />
            
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={HomeContent} />
                <Route path="/history" element={<PredictionHistory />} />
                <Route path="/about" element={
                  <div className="transform-gpu">
                    <div className="bg-white rounded-xl shadow-lg p-4">
                      <h2 className="text-xl font-bold text-purple-800 mb-3">About Energy Consumption Predictor</h2>
                      <p className="text-gray-700 text-sm">
                        This application helps you predict your energy consumption based on your household appliances and usage patterns.
                        Our advanced algorithm analyzes your inputs to provide accurate forecasts.
                      </p>
                    </div>
                  </div>
                } />
                <Route path="/faq" element={
                  <div className="transform-gpu">
                    <div className="bg-white rounded-xl shadow-lg p-4">
                      <h2 className="text-xl font-bold text-purple-800 mb-3">Frequently Asked Questions</h2>
                      <div className="space-y-3">
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <h3 className="text-base font-semibold text-purple-700">How accurate are the predictions?</h3>
                          <p className="text-gray-700 text-sm">Our predictions are based on statistical models and historical data, providing estimates with a reasonable margin of error.</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <h3 className="text-base font-semibold text-purple-700">What factors are considered?</h3>
                          <p className="text-gray-700 text-sm">We consider the number and type of appliances, usage duration, and historical consumption patterns.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                } />
                <Route path="/contact" element={
                  <div className="transform-gpu">
                    <div className="bg-white rounded-xl shadow-lg p-4">
                      <h2 className="text-xl font-bold text-purple-800 mb-3">Contact Us</h2>
                      <p className="text-gray-700 text-sm">
                        Have questions or feedback? Reach out to us at support@energypredictor.com
                      </p>
                    </div>
                  </div>
                } />
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
        </div>
        <ToastContainer 
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </Router>
  );
}

export default App;
