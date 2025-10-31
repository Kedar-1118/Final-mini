import { useState, useEffect } from 'react';
import { Lightbulb, Youtube, Instagram, Copy, CheckCircle } from 'lucide-react';
import API from '../utils/api';

interface Recommendation {
  id: string;
  platform: 'youtube' | 'instagram';
  image: string;
  caption: string;
  tags: string[];
}

export function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/recommendations');
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([
        {
          id: '1',
          platform: 'youtube',
          image: 'https://images.pexels.com/photos/2387418/pexels-photo-2387418.jpeg?auto=compress&cs=tinysrgb&w=800',
          caption: 'Top 10 Productivity Hacks That Changed My Life | Time Management Tips',
          tags: ['productivity', 'timemanagement', 'lifehacks'],
        },
        {
          id: '2',
          platform: 'instagram',
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
          caption: 'Morning routine that sets you up for success ✨ Starting the day with intention and energy!',
          tags: ['morningroutine', 'wellness', 'selfcare'],
        },
        {
          id: '3',
          platform: 'youtube',
          image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
          caption: 'How I Grew My Instagram to 100K Followers in 6 Months | Complete Strategy Guide',
          tags: ['instagramgrowth', 'socialmedia', 'marketing'],
        },
        {
          id: '4',
          platform: 'instagram',
          image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800',
          caption: 'Weekend vibes hitting different 🌅 Who else needs this kind of peace?',
          tags: ['weekend', 'nature', 'peaceful'],
        },
        {
          id: '5',
          platform: 'youtube',
          image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
          caption: 'Beginner\'s Guide to Content Creation | Camera Setup, Editing & More',
          tags: ['contentcreation', 'tutorial', 'beginner'],
        },
        {
          id: '6',
          platform: 'instagram',
          image: 'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=800',
          caption: 'Behind the scenes of today\'s shoot 📸 Creating magic one frame at a time',
          tags: ['bts', 'photography', 'creative'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyCaption = (id: string, caption: string) => {
    navigator.clipboard.writeText(caption);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-600 to-yellow-400 rounded-2xl mb-4">
            <Lightbulb className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI Content Recommendations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Fresh post ideas tailored to your audience and trending topics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={rec.image}
                  alt={rec.caption}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <div
                    className={`px-3 py-1 rounded-full flex items-center gap-2 ${
                      rec.platform === 'youtube'
                        ? 'bg-red-600'
                        : 'bg-gradient-to-r from-pink-600 to-purple-600'
                    } text-white font-semibold shadow-lg`}
                  >
                    {rec.platform === 'youtube' ? (
                      <Youtube size={16} />
                    ) : (
                      <Instagram size={16} />
                    )}
                    {rec.platform === 'youtube' ? 'YouTube' : 'Instagram'}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-900 dark:text-white font-medium mb-4 leading-relaxed">
                  {rec.caption}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {rec.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => copyCaption(rec.id, rec.caption)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-600 to-yellow-400 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  {copiedId === rec.id ? (
                    <>
                      <CheckCircle size={20} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={20} />
                      Copy Caption
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={fetchRecommendations}
            className="px-8 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-semibold rounded-lg border-2 border-gray-300 dark:border-gray-700 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-lg transition-all"
          >
            Generate New Ideas
          </button>
        </div>
      </div>
    </div>
  );
}
