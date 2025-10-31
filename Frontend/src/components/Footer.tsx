import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-2">
          <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
            Made with <Heart size={16} className="text-pink-500 fill-pink-500" /> by SocialPulse Team
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-xs">
            © 2025 SocialPulse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
