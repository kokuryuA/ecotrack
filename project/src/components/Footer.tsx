import React from 'react';
import { Zap, Mail, Phone, MapPin, Facebook, Twitter, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

// Types
interface QuickLink {
  label: string;
  path: string;
}

interface ContactInfo {
  icon: React.ReactNode;
  text: string;
}

interface SocialLink {
  name: string;
  icon: React.ReactNode;
  url: string;
}

// Constants
const quickLinks: QuickLink[] = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Contact', path: '/contact' }
];

const contactInfo: ContactInfo[] = [
  { icon: <Mail className="h-5 w-5 mr-3 text-purple-400" />, text: 'boumazaabdelnour56@gmail.com' },
  { icon: <Phone className="h-5 w-5 mr-3 text-purple-400" />, text: '(+213) 542156828' },
  { icon: <MapPin className="h-5 w-5 mr-3 text-purple-400" />, text: 'bab daya, sidi bel abbes' }
];

const socialLinks: SocialLink[] = [
  { 
    name: 'Facebook',
    icon: <Facebook className="h-5 w-5" />,
    url: '#'
  },
  { 
    name: 'Twitter',
    icon: <Twitter className="h-5 w-5" />,
    url: '#'
  },
  { 
    name: 'GitHub',
    icon: <Github className="h-5 w-5" />,
    url: '#'
  }
];

// Component
const Footer: React.FC = () => {
  // Render
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand Section */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg mr-3">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Energy Consumption Predictor</h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Helping you understand and predict your energy usage patterns for a more sustainable future.
            </p>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-lg font-semibold mb-5 border-b border-gray-700 pb-2">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map(({ label, path }) => (
                <li key={path}>
                  <Link 
                    to={path}
                    className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mr-2" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold mb-5 border-b border-gray-700 pb-2">Contact Us</h3>
            <ul className="space-y-3">
              {contactInfo.map(({ icon, text }) => (
                <li key={text} className="flex items-center text-gray-400">
                  {icon}
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              {socialLinks.map(({ name, icon, url }) => (
                <a
                  key={name}
                  href={url}
                  className="bg-gray-800 hover:bg-purple-600 h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-300"
                  aria-label={name}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Energy Consumption Predictor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;