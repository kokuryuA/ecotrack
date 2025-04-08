import React from 'react';
import { Link } from 'react-router-dom';
import { Home, History } from 'lucide-react';

// Types
interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

// Constants
const navItems: NavItem[] = [
  {
    path: '/',
    label: 'New Prediction',
    icon: <Home className="w-5 h-5" />
  },
  {
    path: '/history',
    label: 'History',
    icon: <History className="w-5 h-5" />
  }
];

// Component
const Navigation: React.FC = () => {
  return (
    <nav className="mb-8">
      <ul className="flex space-x-6">
        {navItems.map(({ path, label, icon }) => (
          <li key={path}>
            <Link 
              to={path} 
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors"
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation; 