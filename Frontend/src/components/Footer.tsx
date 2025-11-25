import { Heart, Instagram, Youtube, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function Footer() {
  const location = useLocation();
  const hideFooter = location.pathname === '/login' || location.pathname === '/signup';

  if (hideFooter) return null;

  return (
    <footer className="bg-gray-700 dark:bg-black border-t border-gray-800 py-16 mt-auto transition-colors duration-300">
      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">

          {/* Left: Branding */}
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Social<span className="text-pink-500">Pulse</span>
            </h2>
            <p className="text-sm text-gray-400 mt-4 max-w-xs mx-auto md:mx-0 leading-relaxed">
              Empowering creators with AI-driven insights and real-time trends.
              <br />
              Build your audience, smarter.
            </p>
          </div>

          {/* Center: Navigation */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-8">
            <a href="/trendings" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Trendings
            </a>
            <a href="/recommendations" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Recommendations
            </a>
            <a href="/youtube" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Dashboards
            </a>
          </div>

          {/* Right: Social icons */}
          <div className="flex justify-center md:justify-end space-x-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-gray-800 text-gray-400 hover:bg-pink-600 hover:text-white transition-all duration-300"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-gray-800 text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-300"
              aria-label="YouTube"
            >
              <Youtube size={20} />
            </a>
            <a
              href="#ai"
              className="p-3 rounded-full bg-gray-800 text-gray-400 hover:bg-yellow-500 hover:text-white transition-all duration-300"
              aria-label="AI Features"
            >
              <Sparkles size={20} />
            </a>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col items-center">
          <p className="flex items-center gap-2 text-sm text-gray-500">
            Made with <Heart size={14} className="text-pink-500 fill-pink-500 animate-pulse" /> by
            <span className="font-semibold text-gray-300">SocialPulse Team</span>
          </p>
          <p className="mt-2 text-xs text-gray-600">
            © {new Date().getFullYear()} SocialPulse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
