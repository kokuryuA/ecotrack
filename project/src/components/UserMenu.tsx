import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { User, LogOut, Settings, ChevronDown, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  if (!user) return null;

  const displayName = user.email?.split('@')[0] || 'User';

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <motion.a
              whileHover={{ backgroundColor: "#F3F4F6" }}
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 flex items-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              Account settings
            </motion.a>
            <motion.a
              whileHover={{ backgroundColor: "#F3F4F6" }}
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 flex items-center"
            >
              <History className="h-4 w-4 mr-2" />
              Prediction history
            </motion.a>
            <motion.button
              whileHover={{ backgroundColor: "#FEE2E2" }}
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;