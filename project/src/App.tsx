import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import InputForm from "./components/InputForm";
import ResultsDisplay from "./components/ResultsDisplay";
import Footer from "./components/Footer";
import { useAuthStore } from "./store/authStore";
import Login from "./pages/Login";

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <AnimatePresence mode="wait">
        {isAuthenticated ? (
          <main className="flex-grow container mx-auto px-4 py-10">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-10">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 flex items-center">
                  <div className="bg-white/20 p-3 rounded-full mr-5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white h-8 w-8"
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
                  <h1 className="text-3xl font-bold text-white">
                    Energy Consumption Predictor
                  </h1>
                </div>
                <div className="p-8">
                  <p className="text-gray-600 mb-8 text-lg max-w-3xl">
                    Predict your energy consumption based on your household
                    appliances and usage patterns. Our advanced algorithm
                    analyzes your inputs to provide accurate forecasts.
                  </p>
                  <InputForm />
                </div>
              </div>
              <ResultsDisplay />
            </div>
          </main>
        ) : (
          <Login />
        )}
      </AnimatePresence>
      <Footer />
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </div>
  );
}

export default App;
