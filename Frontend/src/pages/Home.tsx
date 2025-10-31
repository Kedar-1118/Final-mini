import { useState } from 'react';
import { Youtube, Instagram, ArrowRight, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const { username } = useAuth();
  const navigate = useNavigate();
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [instagramUsername, setInstagramUsername] = useState('');

  const handleYoutubeConnect = () => {
    window.location.href = '/api/youtube-auth';
  };

  const handleInstagramConnect = async () => {
    if (instagramUsername.trim()) {
      setInstagramConnected(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome back, <span className="bg-gradient-to-r from-pink-600 to-yellow-400 bg-clip-text text-transparent">{username}</span>!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Connect your social media accounts to unlock powerful analytics
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border-2 border-gray-200 dark:border-gray-800 hover:border-pink-500 dark:hover:border-pink-500 transition-all">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl mb-6">
              <Youtube className="text-white" size={32} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">YouTube Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Track your channel's performance, video analytics, and audience engagement
            </p>

            {youtubeConnected ? (
              <button
                onClick={() => navigate('/youtube')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-yellow-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-pink-500/50 transform hover:scale-105 transition-all"
              >
                View Dashboard
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleYoutubeConnect}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all"
              >
                <LinkIcon size={20} />
                Connect with YouTube
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border-2 border-gray-200 dark:border-gray-800 hover:border-pink-500 dark:hover:border-pink-500 transition-all">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-600 to-purple-700 rounded-2xl mb-6">
              <Instagram className="text-white" size={32} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Instagram Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Analyze your profile metrics, post performance, and follower insights
            </p>

            {instagramConnected ? (
              <button
                onClick={() => navigate('/instagram')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-yellow-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-pink-500/50 transform hover:scale-105 transition-all"
              >
                View Dashboard
                <ArrowRight size={20} />
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={instagramUsername}
                  onChange={(e) => setInstagramUsername(e.target.value)}
                  placeholder="Enter Instagram username"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button
                  onClick={handleInstagramConnect}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  <LinkIcon size={20} />
                  Connect Instagram
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-600/10 to-yellow-400/10 rounded-full border border-pink-500/20">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              AI-powered insights ready for connected accounts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
