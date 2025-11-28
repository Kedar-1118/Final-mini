import { useState } from 'react';
import { TrendingUp, Sparkles, Lightbulb, Copy, Check, Flame, ArrowRight } from 'lucide-react';
import API from '../utils/api';

interface TrendingIdea {
  title: string;
  description: string;
  reason: string;
}

const POPULAR_NICHES = [
  "Tech & Gadgets",
  "Street Food",
  "Travel India",
  "Cricket",
  "Bollywood",
  "Fitness",
  "Personal Finance",
  "Startups"
];

export function Trendings() {
  const [contentType, setContentType] = useState('');
  const [trendingIdeas, setTrendingIdeas] = useState<TrendingIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrends(contentType);
  };

  const fetchTrends = async (topic: string) => {
    if (!topic.trim()) return;

    setLoading(true);
    setTrendingIdeas([]);
    try {
      const response = await API.post('/ai/trending', { contentType: topic });
      if (response.data && response.data.ideas) {
        setTrendingIdeas(response.data.ideas);
      }
    } catch (error) {
      console.error('Error fetching trending data:', error);
      setTrendingIdeas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-12 transition-colors duration-300">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/10 to-yellow-500/10 rounded-full blur-3xl -z-10"></div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
            What's <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-yellow-500">Trending</span> Now?
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Get AI-curated content ideas tailored for the Indian audience.
            <br className="hidden md:block" />
            Spot the next big wave before it breaks.
          </p>
        </div>

        {/* Input Section */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-pink-500/5 p-2 border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-2 transition-all hover:shadow-2xl hover:shadow-pink-500/10 hover:border-pink-500/30">
            <div className="relative flex-grow">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                <Sparkles size={24} />
              </div>
              <input
                type="text"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                placeholder="Enter a niche (e.g., 'Sustainable Fashion')"
                className="w-full h-16 pl-16 pr-6 bg-transparent text-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none rounded-2xl"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="h-16 px-10 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-lg rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Generate <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>

          {/* Popular Niches */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 py-2 mr-2">Popular:</span>
            {POPULAR_NICHES.map((niche) => (
              <button
                key={niche}
                onClick={() => {
                  setContentType(niche);
                  fetchTrends(niche);
                }}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-pink-500 hover:text-pink-600 dark:hover:text-pink-400 hover:shadow-md transition-all"
              >
                {niche}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        {trendingIdeas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fadeIn pb-20">
            {trendingIdeas.map((idea, index) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-900 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 hover:border-pink-500/30 dark:hover:border-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 flex flex-col h-full overflow-hidden"
              >
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-pink-500 transition-colors duration-300 shadow-sm">
                      <Lightbulb size={28} />
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={() => handleCopy(`${idea.title}\n\n${idea.description}`, index)}
                        className="p-2 bg-white dark:bg-gray-800 rounded-xl text-gray-400 hover:text-pink-600 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-pink-200"
                        title="Copy Idea"
                      >
                        {copiedIndex === index ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-4 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                    {idea.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8 flex-grow text-sm">
                    {idea.description}
                  </p>

                  <div className="pt-5 border-t border-gray-100 dark:border-gray-800 mt-auto">
                    <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg w-fit">
                      <Flame size={14} className="fill-current animate-pulse" />
                      {idea.reason}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && trendingIdeas.length === 0 && (
          <div className="text-center py-20 opacity-40">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp size={40} className="text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-xl text-gray-400 dark:text-gray-600 font-medium">
              Ready to find your next viral hit?
            </p>
          </div>
        )}
      </div>

      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
