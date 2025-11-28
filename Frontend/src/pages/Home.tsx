import { useState, useEffect } from "react";
import { Youtube, Instagram, ArrowRight, Link as LinkIcon, TrendingUp, Users, Activity, Zap } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../utils/api";

interface DashboardStats {
  youtube?: {
    views: number;
    subscribersGained: number;
    subscribersLost: number;
    estimatedMinutesWatched: number;
    subscriberCount?: number;
  };
  instagram?: {
    followers: number;
    following: number;
    posts: number;
    engagementRate: string;
    username: string;
    profile_pic?: string;
  };
}

export function Home() {
  const { username } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConnectionsAndFetchData = async () => {
      try {
        setLoading(true);

        // Check YouTube connection via URL param or previous state (simplified for now)
        const youtubeStatus = searchParams.get('youtube');
        if (youtubeStatus === 'connected') {
          setYoutubeConnected(true);
          searchParams.delete('youtube');
          setSearchParams(searchParams);
        }

        // Fetch Current User for Instagram
        const userRes = await API.get("/users/current-user");
        const currentUser = userRes.data.data;

        const newStats: DashboardStats = {};

        // Fetch Instagram Data if username exists
        if (currentUser.instaUsername) {
          try {
            const instaRes = await API.get(`/instagram/user/${currentUser.instaUsername}`);
            const instaData = instaRes.data.data;

            // Calculate Engagement Rate
            let engagementRate = "0";
            if (instaData.posts && instaData.posts.length > 0) {
              const totalEngagement = instaData.posts.reduce(
                (sum: number, post: { likes: number; comments: number }) => sum + post.likes + post.comments,
                0
              );
              engagementRate = ((totalEngagement / instaData.posts.length / instaData.followers) * 100).toFixed(2);
            }

            newStats.instagram = {
              followers: instaData.followers,
              following: instaData.following,
              posts: instaData.posts.length,
              engagementRate,
              username: instaData.username,
              profile_pic: instaData.profile_pic
            };
          } catch (e) {
            console.error("Failed to fetch Instagram stats", e);
          }
        }

        // Fetch YouTube Data (Try to fetch, if fails, assume not connected or error)
        try {
          // We try to fetch analytics. If it succeeds, we are connected.
          const [ytRes, channelRes] = await Promise.all([
            API.get("/youtube/analytics"),
            API.get("/youtube/channel").catch(() => ({ data: null })) // Fail gracefully
          ]);

          if (ytRes.data && ytRes.data.rows && ytRes.data.rows.length > 0) {
            setYoutubeConnected(true);
            // Aggregating rows for simple display
            const totalViews = ytRes.data.rows.reduce((acc: number, row: (string | number)[]) => acc + Number(row[0]), 0);
            const totalSubsGained = ytRes.data.rows.reduce((acc: number, row: (string | number)[]) => acc + Number(row[3]), 0);
            const totalSubsLost = ytRes.data.rows.reduce((acc: number, row: (string | number)[]) => acc + Number(row[4]), 0);
            const totalWatchTime = ytRes.data.rows.reduce((acc: number, row: (string | number)[]) => acc + Number(row[5]), 0);

            // Get real subscriber count from channel details if available
            const realSubscriberCount = channelRes.data ? parseInt(channelRes.data.statistics.subscriberCount) : 0;

            newStats.youtube = {
              views: totalViews,
              subscribersGained: totalSubsGained,
              subscribersLost: totalSubsLost,
              estimatedMinutesWatched: totalWatchTime,
              subscriberCount: realSubscriberCount
            };
          }
        } catch (e) {
          // 401 or 500 likely means not connected or token expired
          console.log("YouTube not connected or error fetching stats");
        }

        setStats(newStats);
      } catch (error) {
        console.error("Error initializing home page:", error);
      } finally {
        setLoading(false);
      }
    };

    checkConnectionsAndFetchData();
  }, [searchParams, setSearchParams]);

  const handleYoutubeConnect = async () => {
    try {
      const res = await API.get("youtube/auth");
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error("Error connecting YouTube:", error);
    }
  };

  const totalAudience = (stats.instagram?.followers || 0) + (stats.youtube?.subscriberCount || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-12">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero Section */}
        <div className="relative mb-12 p-8 rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 text-white overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">{username}</span>
              </h1>
              <p className="text-gray-300 text-lg max-w-xl">
                Here's what's happening across your connected platforms today.
              </p>
            </div>

            {(stats.instagram || stats.youtube) && (
              <div className="flex items-center gap-8 bg-white/10 backdrop-blur-md px-8 py-6 rounded-2xl border border-white/10">
                <div>
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Audience</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {totalAudience.toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-px bg-white/20"></div>
                <div>
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Platforms</p>
                  <div className="flex gap-2 mt-2">
                    {stats.youtube && <Youtube size={20} className="text-red-500" />}
                    {stats.instagram && <Instagram size={20} className="text-pink-500" />}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">

          {/* YouTube Card */}
          <div className="group bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 hover:border-red-500/50 dark:hover:border-red-500/50 transition-all duration-300 overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl group-hover:scale-110 transition-transform">
                    <Youtube className="text-red-600 dark:text-red-500" size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">YouTube</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {youtubeConnected ? "Connected" : "Not Connected"}
                    </p>
                  </div>
                </div>
                {youtubeConnected && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
                    Active
                  </span>
                )}
              </div>

              {youtubeConnected && stats.youtube ? (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">Views (28d)</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.youtube.views.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">Watch Time</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{Math.round(stats.youtube.estimatedMinutesWatched / 60)}h</p>
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                      <Activity size={16} className="text-red-500" />
                      Track video performance & growth
                    </li>
                    <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                      <Users size={16} className="text-red-500" />
                      Analyze audience demographics
                    </li>
                    <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                      <TrendingUp size={16} className="text-red-500" />
                      Optimize content strategy
                    </li>
                  </ul>
                </div>
              )}

              {youtubeConnected ? (
                <button
                  onClick={() => navigate("/youtube")}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
                >
                  View Analytics
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleYoutubeConnect}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                  <LinkIcon size={18} />
                  Connect Channel
                </button>
              )}
            </div>
          </div>

          {/* Instagram Card */}
          <div className="group bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 hover:border-pink-500/50 dark:hover:border-pink-500/50 transition-all duration-300 overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 bg-pink-50 dark:bg-pink-900/20 rounded-2xl group-hover:scale-110 transition-transform">
                    <Instagram className="text-pink-600 dark:text-pink-500" size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Instagram</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {stats.instagram ? `@${stats.instagram.username}` : "Not Connected"}
                    </p>
                  </div>
                </div>
                {stats.instagram && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
                    Active
                  </span>
                )}
              </div>

              {stats.instagram ? (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">Followers</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.instagram.followers.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">Engagement</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.instagram.engagementRate}%</p>
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                      <Activity size={16} className="text-pink-500" />
                      Track follower growth & trends
                    </li>
                    <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                      <Users size={16} className="text-pink-500" />
                      Monitor post engagement
                    </li>
                    <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                      <Zap size={16} className="text-pink-500" />
                      Get AI-powered insights
                    </li>
                  </ul>
                </div>
              )}

              {stats.instagram ? (
                <button
                  onClick={() => navigate("/instagram")}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-pink-500/25 transition-all"
                >
                  View Analytics
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={() => navigate("/instagram")}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                  <LinkIcon size={18} />
                  Connect Account
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Insights / Tips Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-300">
                <Zap size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Pro Tip</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Posting Reels with trending audio can increase your reach by up to 2x. Check the "Trendings" tab for ideas.
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg text-purple-600 dark:text-purple-300">
                <TrendingUp size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Growth Hack</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Engage with comments within the first hour of posting to boost your content in the algorithm.
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg text-green-600 dark:text-green-300">
                <Activity size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Consistency</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Aim for 3-5 stories per day to keep your audience engaged and your profile active.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
