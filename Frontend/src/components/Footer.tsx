import { Heart, Instagram, Youtube, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-pink-600/20 text-gray-400 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          {/* Left: Branding */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-yellow-400">
              SocialPulse
            </h2>
            <p className="text-sm text-gray-500 mt-2 max-w-sm">
              Empowering creators with insights, trends, and AI-driven recommendations.
            </p>
          </div>

          {/* Center: Links */}
          <div className="flex space-x-6">
            <a
              href="/trendings"
              className="hover:text-pink-400 transition-colors text-sm font-medium"
            >
              Trendings
            </a>
            <a
              href="/recommendations"
              className="hover:text-yellow-400 transition-colors text-sm font-medium"
            >
              Recommendations
            </a>
            <a
              href="/youtube"
              className="hover:text-pink-400 transition-colors text-sm font-medium"
            >
              Dashboards
            </a>
          </div>

          {/* Right: Social icons */}
          <div className="flex items-center space-x-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-pink-600/10 hover:bg-pink-600/30 transition"
            >
              <Instagram size={18} className="text-pink-500" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-yellow-500/10 hover:bg-yellow-500/30 transition"
            >
              <Youtube size={18} className="text-yellow-400" />
            </a>
            <a
              href="#ai"
              className="p-2 rounded-full bg-pink-600/10 hover:bg-pink-600/30 transition"
            >
              <Sparkles size={18} className="text-pink-500" />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-pink-600/20 mt-8 pt-6 text-center text-sm text-gray-500">
          <p className="flex items-center justify-center gap-2">
            Made with{" "}
            <Heart size={14} className="text-pink-500 fill-pink-500 animate-pulse" />{" "}
            by <span className="text-yellow-400 font-semibold">SocialPulse Team</span>
          </p>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-500">
            © {new Date().getFullYear()} SocialPulse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
