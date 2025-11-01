import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BarChart3, Home, TrendingUp, Lightbulb, User } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.svg';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, username, logout } = useAuth();

  // ✅ Hide navbar on specific routes
  const hiddenRoutes = ['/', '/login', '/signup'];
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  const navLinks = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Dashboards', path: '/youtube', icon: BarChart3 },
    { name: 'Trendings', path: '/trendings', icon: TrendingUp },
    { name: 'Recommendations', path: '/recommendations', icon: Lightbulb },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <div className="flex items-center">
            <Link to="/home" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-600 to-yellow-400 rounded-lg flex items-center justify-center">
                <img src={logo} alt="Logo" className="h-8 w-auto" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-yellow-400 bg-clip-text text-transparent">
                SocialPulse
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive(link.path)
                    ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <link.icon size={18} />
                <span className="font-medium">{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Desktop User + Theme */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{username}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <User size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(link.path)
                    ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <link.icon size={20} />
                <span className="font-medium">{link.name}</span>
              </Link>
            ))}
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <User size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
