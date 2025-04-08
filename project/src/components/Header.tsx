import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import UserMenu from './UserMenu';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

// Types
interface NavItem {
  path: string;
  label: string;
  isActive?: boolean;
}

// Constants
const HEADER_ANIMATION = {
  initial: { y: -100 },
  animate: { y: 0 },
  transition: { type: "spring", stiffness: 100 }
};

const LOGO_ANIMATION = {
  whileHover: { scale: 1.1 },
  whileTap: { scale: 0.95 }
};

const navItems: NavItem[] = [
  { path: '/', label: 'Home', isActive: true },
  { path: '/about', label: 'About' },
  { path: '/faq', label: 'FAQ' },
  { path: '/contact', label: 'Contact' }
];

// Component
const Header: React.FC = () => {
  // Hooks
  const { isAuthenticated } = useAuthStore();

  // Render
  return (
    <motion.header 
      className="bg-white shadow-md sticky top-0 z-10"
      {...HEADER_ANIMATION}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <motion.div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg"
                {...LOGO_ANIMATION}
              >
                <Zap className="h-6 w-6 text-white" />
              </motion.div>
              <span className="ml-3 text-xl font-semibold text-gray-900">Energy Predictor</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map(({ path, label, isActive }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-gray-900 bg-purple-50 hover:bg-purple-100'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div>
            {isAuthenticated && <UserMenu />}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;