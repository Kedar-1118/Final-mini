import { useState, useEffect } from 'react';
import { Lightbulb, Copy, CheckCircle } from 'lucide-react';
// Assuming API is configured to point to your backend (e.g., http://localhost:5000/api/ai)
// import API from '../utils/api'; // Removed this line as the file is missing

// This interface now matches the backend response: { "ideas": [ ... ] }
interface Idea {
  title: string;
  caption: string;
  concept: string;
  hashtags: string[];
}

// Define the backend URL
const BACKEND_URL = 'http://localhost:5000/api/ai';

export function Recommendations() {
  const [recommendations, setRecommendations] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // A default placeholder image since the backend provides a "concept" string, not an image URL
  const placeholderImage = (concept: string) => 
    `https://placehold.co/600x400/EAD9F7/703290?text=${encodeURIComponent(concept)}`;

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      // Replaced the 'API.post' call with a standard 'fetch'
      const response = await fetch(`http://localhost:5000/api/ai/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: 'general content creation'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // The backend returns { "ideas": [...] }, so we set the 'ideas' array
      setRecommendations(data.ideas);

    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Mock data updated to match the new 'Idea' interface
      setRecommendations([
        {
          title: 'Productivity Hacks',
          caption: 'Top 10 Productivity Hacks That Changed My Life | Time Management Tips',
          concept: 'Fast-paced montage of productivity tips',
          hashtags: ['#productivity', '#timemanagement', '#lifehacks'],
        },
        {
          title: 'Morning Routine',
          caption: 'Morning routine that sets you up for success ✨ Starting the day with intention and energy!',
          concept: 'Aesthetic "get ready with me" video',
          hashtags: ['#morningroutine', '#wellness', '#selfcare'],
        },
        {
          title: 'Content Creation Guide',
          caption: "Beginner's Guide to Content Creation | Camera Setup, Editing & More",
          concept: 'Talking-head video with B-roll of gear',
          hashtags: ['#contentcreation', '#tutorial', '#beginner'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyCaption = (id: string, caption: string) => {
    // Using document.execCommand for iFrame compatibility
    const textArea = document.createElement('textarea');
    textArea.value = caption;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
    document.body.removeChild(textArea);
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
              // Using rec.title as key since 'id' is not provided
              key={rec.title}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="relative">
                <img
                  // Using placeholder image generated from the 'concept'
                  src={placeholderImage(rec.concept)}
                  // Using 'concept' for alt text
                  alt={rec.concept}
                  className="w-full h-64 object-cover"
                />
                {/* Platform badge removed as it's not in the backend response */}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {rec.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-4 leading-relaxed">
                  {rec.caption}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {/* Using rec.hashtags and rendering the tag directly (assuming it includes '#') */}
                  {rec.hashtags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-sm font-medium"
                    >
                      {/* Render tag directly, as backend provides it with '#' */}
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  // Using rec.title to track copied state
                  onClick={() => copyCaption(rec.title, rec.caption)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-600 to-yellow-400 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  {copiedId === rec.title ? (
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

