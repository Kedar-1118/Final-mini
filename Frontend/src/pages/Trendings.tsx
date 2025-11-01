import { useState } from 'react';
import { TrendingUp, Hash, Clock, Sparkles } from 'lucide-react';
// import API from '../utils/api'; // Removed this line as the file is missing

// This interface now matches the JSON response from your backend route
interface TrendingData {
  hashtags: string[];
  bestTimes: string[]; // <-- Changed from bestTimeToPost (string)
  sampleCaption: string; // <-- Changed from captions (string[])
}

// Define the backend URL
const BACKEND_URL = 'http://localhost:5000/api/ai';

export function Trendings() {
  const [contentType, setContentType] = useState('');
  const [trendingData, setTrendingData] = useState<TrendingData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentType.trim()) return;

    setLoading(true);
    setTrendingData(null); // Clear previous results
    try {
      // Replaced the 'API.post' call with a standard 'fetch'
      const response = await fetch(`${BACKEND_URL}/trending`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contentType }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TrendingData = await response.json();
      setTrendingData(data);
    } catch (error) {
      console.error('Error fetching trending data:', error);
      // Set mock data on error so the UI can be tested
      setTrendingData({
        hashtags: ['#ErrorHashtag', '#MockData', '#PleaseCheckConsole'],
        bestTimes: ['Error', 'N/A'],
        sampleCaption: 'Could not fetch data. Please check the console for errors.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-600 to-yellow-400 rounded-2xl mb-4">
            <TrendingUp className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Trending Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Discover what's hot and get AI-powered content suggestions
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800 mb-8">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What type of content are you creating?
                </label>
                <input
                  type="text"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  placeholder="e.g., travel, fitness, tech, cooking, fashion"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-pink-600 to-yellow-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-pink-500/50 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Analyzing Trends...' : 'Get Trending Insights'}
              </button>
            </div>
          </form>
        </div>

        {/* Loading spinner overlay */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading recommendations...</p>
          </div>
        )}

        {/* Results */}
        {!loading && trendingData && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-gradient-to-br from-pink-600 to-yellow-400 rounded-2xl shadow-2xl p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <Hash size={32} />
                <h2 className="text-3xl font-bold">Trending Hashtags</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {trendingData.hashtags.map((tag, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-white/20 backdrop-blur-lg rounded-full font-semibold hover:bg-white/30 transition-colors cursor-pointer"
                  >
                    {/* Render tag directly, as backend provides it with '#' */}
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="text-pink-600" size={32} />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Best Times to Post
                </h2>
              </div>
              <div className="bg-gradient-to-r from-pink-100 to-yellow-100 dark:from-pink-900/30 dark:to-yellow-900/30 rounded-xl p-6 border border-pink-200 dark:border-pink-800">
                <p className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                  {/* Join the array of times from the backend */}
                  {trendingData.bestTimes.join('  |  ')}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="text-yellow-500" size={32} />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  AI-Generated Caption
                </h2>
              </div>
              <div className="space-y-4">
                {/* Render the single sampleCaption string */}
                <div
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-pink-600 to-yellow-400 rounded-lg flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <p className="flex-1 text-gray-900 dark:text-white leading-relaxed">
                      {trendingData.sampleCaption}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Initial prompt */}
        {!trendingData && !loading && (
          <div className="text-center py-12">
            <div className="inline-block p-6 bg-gradient-to-r from-pink-600/10 to-yellow-400/10 rounded-2xl mb-4">
              <Sparkles className="text-pink-600" size={48} />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Enter a content type to discover trending insights
            </p>
          </div>
        )}
      </div>
      {/* Simple CSS for fade-in animation */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

