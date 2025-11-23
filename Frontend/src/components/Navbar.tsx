import { useState, useRef, useEffect } from 'react';
import { Link, redirect, useLocation } from 'react-router-dom';
import { Menu, X, BarChart3, Home, TrendingUp, Lightbulb, User, LogOut, ChevronDown, Youtube, Instagram } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.svg';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, username, logout } = useAuth();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dashboardRef.current && !dashboardRef.current.contains(event.target as Node)) {
        setIsDashboardOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ✅ Hide navbar on specific routes
  const hiddenRoutes = ['/', '/login', '/signup'];
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }



  const isActive = (path: string) => location.pathname === path;
  const isDashboardActive = location.pathname === '/youtube' || location.pathname === '/instagram';

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <div className="flex items-center">
            <Link to="/home" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-600 to-yellow-400 rounded-lg flex items-center justify-center">
                <img src={logo} alt="Logo" className="h-8 w-auto" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Social<span className="text-pink-600">Pulse</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/home"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isActive('/home')
                ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <Home size={18} />
              <span className="font-medium">Home</span>
            </Link>

            {/* Dashboards Dropdown */}
            <div className="relative" ref={dashboardRef}>
              <button
                onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isDashboardActive
                  ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <BarChart3 size={18} />
                <span className="font-medium">Dashboards</span>
                <ChevronDown size={16} className={`transition-transform ${isDashboardOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDashboardOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-2 animate-in fade-in zoom-in-95 duration-200">
                  <Link
                    to="/youtube"
                    onClick={() => setIsDashboardOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                      <Youtube size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">YouTube</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Channel Analytics</p>
                    </div>
                  </Link>
                  <Link
                    to="/instagram"
                    onClick={() => setIsDashboardOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg text-pink-600 dark:text-pink-400">
                      <Instagram size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Instagram</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Profile Insights</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/trendings"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isActive('/trendings')
                ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <TrendingUp size={18} />
              <span className="font-medium">Trendings</span>
            </Link>

            <Link
              to="/recommendations"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isActive('/recommendations')
                ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <Lightbulb size={18} />
              <span className="font-medium">Recommendations</span>
            </Link>
          </div>

          {/* Desktop User + Theme */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{username}</p>
                </div>
                <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  <User size={20} />
                </div>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-1 animate-in fade-in zoom-in-95 duration-200">
                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
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
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            <Link
              to="/home"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/home')
                ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <Home size={20} />
              <span className="font-medium">Home</span>
            </Link>

            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Dashboards</p>
              <div className="space-y-1 pl-2 border-l-2 border-gray-100 dark:border-gray-800">
                <Link
                  to="/youtube"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${isActive('/youtube')
                    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <Youtube size={18} />
                  <span className="font-medium">YouTube</span>
                </Link>
                <Link
                  to="/instagram"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${isActive('/instagram')
                    ? 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/10'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <Instagram size={18} />
                  <span className="font-medium">Instagram</span>
                </Link>
              </div>
            </div>

            <Link
              to="/trendings"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/trendings')
                ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <TrendingUp size={20} />
              <span className="font-medium">Trendings</span>
            </Link>

            <Link
              to="/recommendations"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/recommendations')
                ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <Lightbulb size={20} />
              <span className="font-medium">Recommendations</span>
            </Link>

            <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-2">
              <button
                onClick={() => {
                  logout();
                  redirect('/');
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
