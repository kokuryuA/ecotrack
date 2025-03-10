import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import UserMenu from './UserMenu';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <motion.header 
      className="bg-white shadow-md sticky top-0 z-10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <motion.div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </motion.div>
              <span className="ml-3 text-xl font-semibold text-gray-900">Energy Predictor</span>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-1">
            <Link to="/" className="text-gray-900 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
              Home
            </Link>
            <Link to="/about" className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
              About
            </Link>
            <Link to="/faq" className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
              FAQ
            </Link>
            <Link to="/contact" className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
              Contact
            </Link>
          </nav>
          <div>
            {isAuthenticated ? (
              <UserMenu />
            ) : null}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;