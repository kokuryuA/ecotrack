import React from 'react';
import { Zap } from 'lucide-react';
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
            <motion.div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="h-6 w-6 text-white" />
            </motion.div>
            <span className="ml-3 text-xl font-semibold text-gray-900">Energy Predictor</span>
          </div>
          <nav className="hidden md:flex space-x-1">
            <a href="#" className="text-gray-900 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">Home</a>
            <a href="#" className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">About</a>
            <a href="#" className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">FAQ</a>
            <a href="#" className="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">Contact</a>
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