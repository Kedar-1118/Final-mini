import { useState, useEffect } from "react";
import { Users, UserPlus, Image, TrendingUp } from "lucide-react";
import { MetricCard } from "../components/MetricCard";
import { PostDropdown } from "../components/PostDropdown";
import API from "../utils/api";

interface InstagramData {
  username: string;
  full_name?: string;
  profile_pic?: string;
  followers: number;
  following: number;
  bio: string;
  posts: Array<{
    caption: string;
    likes: number;
    comments: number;
    image: string;
  }>;
}

export function InstagramDashboard() {
  const [data, setData] = useState<InstagramData | null>(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchInstagramData = async () => {
    if (!username.trim()) return;

    setLoading(true);
    try {
      const response = await API.get(`/instagram/user/${username}`);
      console.log("Instagram API response:", response.data.data);
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching Instagram data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEngagementRate = () => {
    if (!data || data.posts.length === 0) return 0;
    const totalEngagement = data.posts.reduce(
      (sum, post) => sum + post.likes + post.comments,
      0
    );
    const avgEngagement = totalEngagement / data.posts.length;
    return ((avgEngagement / data.followers) * 100).toFixed(2);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-600 to-purple-700 rounded-2xl mb-4">
              <Image className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Instagram Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your Instagram username to view analytics
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
            <div className="space-y-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Instagram username"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                onClick={fetchInstagramData}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-pink-600 to-yellow-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-pink-500/50 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Fetching Data..." : "Fetch Instagram Data"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Instagram Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analyze your profile metrics and post performance
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-800 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src={`http://localhost:3000/api/v1/proxy/image?url=${encodeURIComponent(data.profile_pic)}`}
              alt={data.username}
              className="w-24 h-24 rounded-full border-4 border-pink-500"
            />
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.full_name || data.username}
              </h2>
              <p className="text-pink-600 dark:text-pink-400 font-medium mb-2">
                @{data.username}
              </p>
              <p className="text-gray-600 dark:text-gray-400">{data.bio}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Followers"
            value={data.followers}
            icon={Users}
            color="pink"
          />
          <MetricCard
            title="Following"
            value={data.following}
            icon={UserPlus}
            color="blue"
          />
          <MetricCard
            title="Total Posts"
            value={data.posts.length}
            icon={Image}
            color="green"
          />
          <MetricCard
            title="Engagement Rate"
            value={`${calculateEngagementRate()}%`}
            icon={TrendingUp}
            color="yellow"
          />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-800 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Post Analytics
          </h2>
          <PostDropdown posts={data.posts} />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.posts.slice(0, 6).map((post, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <img
                  src={`http://localhost:3000/api/v1/proxy/image?url=${encodeURIComponent(post.image)}`}
                  alt={post.caption}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <p className="text-gray-900 dark:text-white font-medium mb-3 line-clamp-2">
                    {post.caption}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
