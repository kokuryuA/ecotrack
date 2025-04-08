import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { User, LogOut, Settings, ChevronDown, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

// Types
interface MenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}

// Constants
const MENU_ANIMATION = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 }
};

const BUTTON_ANIMATION = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 }
};

// Component
const UserMenu: React.FC = () => {
  // Hooks
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const handleHistoryClick = () => {
    navigate('/history');
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setIsOpen(false);
  };

  // Early return if no user
  if (!user) return null;

  // Computed values
  const displayName = user.email?.split('@')[0] || 'User';

  // Menu items
  const menuItems: MenuItem[] = [
    {
      label: 'Account settings',
      icon: <Settings className="h-4 w-4 mr-2" />,
      onClick: handleSettingsClick,
      className: 'text-gray-700 hover:bg-gray-100'
    },
    {
      label: 'Prediction history',
      icon: <History className="h-4 w-4 mr-2" />,
      onClick: handleHistoryClick,
      className: 'text-gray-700 hover:bg-gray-100'
    },
    {
      label: 'Sign out',
      icon: <LogOut className="h-4 w-4 mr-2" />,
      onClick: handleLogout,
      className: 'text-red-600 hover:bg-red-50'
    }
  ];

  // Render
  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
        {...BUTTON_ANIMATION}
      >
        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white">
          <User className="h-5 w-5" />
        </div>
        <span className="hidden md:block font-medium">{displayName}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...MENU_ANIMATION}
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            {menuItems.map(({ label, icon, onClick, className }) => (
              <motion.button
                key={label}
                whileHover={{ backgroundColor: className?.includes('red') ? "#FEE2E2" : "#F3F4F6" }}
                onClick={onClick}
                className={`block w-full text-left px-4 py-2 text-sm flex items-center ${className}`}
              >
                {icon}
                {label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;