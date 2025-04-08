import React, { useEffect, useMemo, useState } from "react";
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

function App() {
  const { isAuthenticated, checkUser } = useAuthStore();
  const { prediction } = useEnergyStore();
  const [weatherData, setWeatherData] = useState({
    temp: 14,
    condition: 'Clear',
    humidity: 35,
    wind: 3,
    cloud: 0,
    rain: 0,
    location: 'Paris'
  });

  // Fetch weather data based on location
  useEffect(() => {
    const fetchWeatherData = async (latitude: number, longitude: number) => {
      try {
        // This would normally be an API call to a weather service
        // For demo purposes, we're simulating weather data based on location
        const cities = [
          { name: 'Paris', temp: 14, condition: 'Clear', humidity: 35, wind: 3, cloud: 0, rain: 0 },
          { name: 'London', temp: 12, condition: 'Cloudy', humidity: 65, wind: 5, cloud: 40, rain: 10 },
          { name: 'New York', temp: 18, condition: 'Sunny', humidity: 30, wind: 4, cloud: 5, rain: 0 },
          { name: 'Tokyo', temp: 21, condition: 'Partly Cloudy', humidity: 45, wind: 2, cloud: 30, rain: 5 },
          { name: 'Sydney', temp: 25, condition: 'Sunny', humidity: 40, wind: 3, cloud: 10, rain: 0 }
        ];
        
        // Choose a "city" based on the coordinates (just for demonstration)
        const cityIndex = Math.floor(Math.random() * cities.length);
        setWeatherData(cities[cityIndex]);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        // Keep default data if fetch fails
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Use default data if geolocation fails
        }
      );
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  // Calendar widget
  const CalendarWidget = useMemo(() => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-2">
      <div className="p-2">
        <h3 className="text-purple-700 font-medium mb-1 text-sm flex items-center">
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
          <div className="text-gray-600 text-[10px] font-medium py-0.5">L</div>
          <div className="text-gray-600 text-[10px] font-medium py-0.5">M</div>
          <div className="text-gray-600 text-[10px] font-medium py-0.5">M</div>
          <div className="text-gray-600 text-[10px] font-medium py-0.5">J</div>
          <div className="text-gray-600 text-[10px] font-medium py-0.5">V</div>
          <div className="text-red-500 text-[10px] font-medium py-0.5">S</div>
          <div className="text-red-500 text-[10px] font-medium py-0.5">D</div>
          
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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-2">
      <div className="p-2">
        <h3 className="text-purple-700 font-medium mb-1 text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          {weatherData.location}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold text-gray-800">{weatherData.temp}°C</div>
          <div className="text-gray-600 text-xs">{weatherData.condition}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-1 bg-white rounded-lg text-xs mt-1">
          <div className="text-gray-600">Humidity: {weatherData.humidity}%</div>
          <div className="text-gray-600">Wind: {weatherData.wind} m/s</div>
          <div className="text-gray-600">Cloud: {weatherData.cloud}%</div>
          <div className="text-gray-600">Rain: {weatherData.rain}%</div>
        </div>
      </div>
    </div>
  ), [weatherData]);

  // Energy Metrics Widget
  const EnergyMetricsWidget = useMemo(() => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-2">
      <div className="p-2">
        <h3 className="text-purple-700 font-medium mb-1 text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Energy Metrics
        </h3>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center p-1.5 rounded-lg bg-green-50">
            <span className="text-green-700 text-xs">Carbon:</span>
            <span className="font-medium text-green-800 text-xs">Medium</span>
          </div>
          
          <div className="flex justify-between items-center p-1.5 rounded-lg bg-blue-50">
            <span className="text-blue-700 text-xs">Usage:</span>
            <span className="font-medium text-blue-800 text-xs">325 kWh</span>
          </div>
          
          <div className="flex justify-between items-center p-1.5 rounded-lg bg-yellow-50">
            <span className="text-yellow-700 text-xs">Grade:</span>
            <span className="font-medium text-yellow-800 text-xs">B+</span>
          </div>
        </div>
      </div>
    </div>
  ), []);

  // Consumption Overview component
  const ConsumptionOverview = useMemo(() => {
    if (!prediction?.historical_values || prediction.historical_values.length < 2) return null;

    const todayConsumption = prediction.historical_values[prediction.historical_values.length - 1];
    const yesterdayConsumption = prediction.historical_values[prediction.historical_values.length - 2];
    const percentageChange = ((todayConsumption - yesterdayConsumption) / yesterdayConsumption) * 100;

    return (
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-xl overflow-hidden shadow-lg mb-4">
        <div className="p-4">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Consumption Overview
          </h2>
          <div className="text-white text-opacity-80 mb-3 text-sm">
            Period: {prediction.start_date} to {prediction.end_date} ({prediction.days} days)
          </div>
          
          <div className="grid grid-cols-3 gap-2">
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

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <Header />
        <main className="container mx-auto px-2 py-2">
          <Navigation />
          
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={
                <div className="mt-3">
                  {/* Main content area with left sidebar */}
                  <div className="flex flex-col md:flex-row md:justify-center gap-4">
                    {/* Left sidebar with widgets - now explicitly positioned on the left */}
                    <div className="md:w-56 w-full order-first">
                      {WeatherWidget}
                      {CalendarWidget}
                      {EnergyMetricsWidget}
                    </div>
                    
                    {/* Main content - with reduced width */}
                    <div className="md:w-[400px] flex-shrink">
                      {/* Main purple container */}
                      <div className="bg-purple-600 rounded-xl overflow-hidden shadow-lg transform scale-90 origin-top">
                        <div className="flex items-center px-2 pt-1.5">
                          <div className="bg-white/20 p-0.5 rounded-full mr-1.5">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="text-white h-3 w-3"
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
                          <h1 className="text-sm font-bold text-white">
                            Energy Consumption Predictor
                          </h1>
                        </div>
                        
                        <div className="px-2 pb-0.5">
                          <p className="text-white/80 text-xs">
                            Predict your energy consumption based on your household appliances and usage patterns. 
                          </p>
                        </div>
                        
                        <div className="px-2 py-1.5">
                          {/* Configure Your Prediction section */}
                          <div className="mb-1.5">
                            <div className="flex items-center mb-1">
                              <div className="bg-white/20 p-0.5 rounded-lg mr-1">
                                <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </div>
                              <h2 className="text-xs font-bold text-white">Configure Your Prediction</h2>
                            </div>
                          
                            {/* Input Form */}
                            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                              <div className="p-1.5">
                                <InputForm />
                              </div>
                            </div>
                          </div>
                        
                          {/* Prediction Results */}
                          {prediction && (
                            <div className="mt-1.5">
                              {ConsumptionOverview}
                              <ResultsDisplay />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Empty space on right side for balance */}
                    <div className="md:w-56 hidden md:block"></div>
                  </div>
                </div>
              } />
              <Route path="/history" element={<PredictionHistory />} />
              <Route path="/about" element={
                <div className="mt-2 bg-white rounded-xl shadow-lg p-2">
                  <h2 className="text-lg font-bold text-purple-800 mb-2">About Energy Consumption Predictor</h2>
                  <p className="text-gray-700 text-xs">
                    This application helps you predict your energy consumption based on your household appliances and usage patterns.
                    Our advanced algorithm analyzes your inputs to provide accurate forecasts.
                  </p>
                </div>
              } />
              <Route path="/contact" element={
                <div className="mt-2 bg-white rounded-xl shadow-lg p-2">
                  <h2 className="text-lg font-bold text-purple-800 mb-2">Contact Us</h2>
                  <p className="text-gray-700 text-xs">
                    Have questions or feedback? Reach out to us at support@energypredictor.com
                  </p>
                </div>
              } />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
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