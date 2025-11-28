import { useState, useEffect } from 'react';
import { Eye, ThumbsUp, MessageSquare, Clock, Users, Upload, Edit2, X, Image as ImageIcon, Video as VideoIcon, BarChart3, ExternalLink, Search, Filter, Copy, Check, TrendingUp, Calendar } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import API from '../utils/api';

interface Video {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: { url: string };
      high: { url: string };
    };
    publishedAt: string;
    resourceId?: { videoId: string };
  };
  contentDetails?: {
    videoId: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

interface ChannelDetails {
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
  brandingSettings: {
    image: {
      bannerExternalUrl: string;
    };
  };
  statistics: {
    viewCount: string;
    subscriberCount: string;
    videoCount: string;
  };
}

interface Comment {
  id: string;
  snippet: {
    topLevelComment: {
      snippet: {
        textDisplay: string;
        authorDisplayName: string;
        authorProfileImageUrl: string;
        likeCount: number;
        publishedAt: string;
      };
    };
    totalReplyCount: number;
  };
}

export function YouTubeDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'comments' | 'upload'>('overview');
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalLikes: 0,
    averageViewDuration: 0, // Changed from totalComments
    watchTime: 0,
    subscribers: 0, // Changed from subscribersGained - now holds total subscriber count
  });
  const [channel, setChannel] = useState<ChannelDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsVideo, setStatsVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'date' | 'views' | 'likes'>('date');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchChannelDetails(), fetchAnalytics(), fetchVideos(), fetchComments()]);
    setLoading(false);
  };

  const fetchChannelDetails = async () => {
    try {
      const { data } = await API.get('/youtube/channel');
      setChannel(data);
    } catch (error) {
      console.error('Error fetching channel details:', error);

      // Check if requires reauth and redirect to OAuth
      if (error instanceof Error && 'response' in error && typeof (error as any).response === 'object') {
        const responseData = (error as any).response?.data;
        if (responseData?.requiresReauth) {
          try {
            const res = await API.get("youtube/auth");
            window.location.href = res.data.url;
          } catch (oauthError) {
            console.error("Error initiating YouTube OAuth:", oauthError);
          }
        }
      }
    }
  };

  const fetchAnalytics = async () => {
    try {
      setError(null);

      // Try to get analytics from API first
      const { data } = await API.get('/youtube/analytics');
      console.log('YouTube API Response:', data);

      // Calculate analytics from videos instead since API might return 0
      if (videos.length > 0) {
        const totalViews = videos.reduce((sum, video) => {
          return sum + parseInt(video.statistics?.viewCount || '0');
        }, 0);

        const totalLikes = videos.reduce((sum, video) => {
          return sum + parseInt(video.statistics?.likeCount || '0');
        }, 0);

        // Get average view duration from analytics API if available
        let averageViewDuration = 0;
        if (data.rows && data.rows.length > 0) {
          const totals: Record<string, number> = {};
          const headers = data.columnHeaders.map((h: { name: string }) => h.name);

          data.rows.forEach((row: (string | number)[]) => {
            headers.forEach((header: string, index: number) => {
              if (header === 'day') return;
              if (!totals[header]) totals[header] = 0;
              totals[header] += parseFloat(String(row[index])) || 0;
            });
          });

          averageViewDuration = Math.round((totals.averageViewDuration || 0) / 60); // Convert to minutes
        }

        // Get total subscribers from channel data
        const subscriberCount = channel?.statistics?.subscriberCount
          ? parseInt(channel.statistics.subscriberCount)
          : 0;

        const analyticsData = {
          totalViews,
          totalLikes,
          averageViewDuration,
          watchTime: 0, // Can be calculated from videos if needed
          subscribers: subscriberCount,
        };

        console.log('Calculated Analytics from Videos:', analyticsData);
        setAnalytics(analyticsData);
        return;
      }

      // Fallback to analytics API data if no videos
      if (!data.rows || data.rows.length === 0) {
        console.log('No analytics data available');
        setAnalytics({
          totalViews: 0,
          totalLikes: 0,
          averageViewDuration: 0,
          watchTime: 0,
          subscribers: channel?.statistics?.subscriberCount ? parseInt(channel.statistics.subscriberCount) : 0,
        });
        return;
      }

      const totals: Record<string, number> = {};
      const headers = data.columnHeaders.map((h: { name: string }) => h.name);

      console.log('Column Headers:', headers);
      console.log('First Row Sample:', data.rows[0]);

      data.rows.forEach((row: (string | number)[]) => {
        headers.forEach((header: string, index: number) => {
          if (header === 'day') return;
          if (!totals[header]) totals[header] = 0;
          totals[header] += parseFloat(String(row[index])) || 0;
        });
      });

      console.log('Calculated Totals:', totals);

      const analyticsData = {
        totalViews: Math.round(totals.views || 0),
        totalLikes: Math.round(totals.likes || 0),
        averageViewDuration: Math.round((totals.averageViewDuration || 0) / 60), // Convert to minutes
        watchTime: Math.round((totals.estimatedMinutesWatched || 0) / 60),
        subscribers: channel?.statistics?.subscriberCount ? parseInt(channel.statistics.subscriberCount) : 0,
      };

      console.log('Setting Analytics State:', analyticsData);
      setAnalytics(analyticsData);
    } catch (error: unknown) {
      console.error('Error fetching analytics:', error);

      // Check if requires reauth and redirect to OAuth
      if (error instanceof Error && 'response' in error && typeof (error as any).response === 'object') {
        const responseData = (error as any).response?.data;
        if (responseData?.requiresReauth) {
          // Automatically redirect to OAuth
          try {
            const res = await API.get("youtube/auth");
            window.location.href = res.data.url;
            return; // Don't show error, user is being redirected
          } catch (oauthError) {
            console.error("Error initiating YouTube OAuth:", oauthError);
            setError("Please reconnect your YouTube account.");
            return;
          }
        }
      }

      const errorMessage = error instanceof Error && 'response' in error && typeof (error as any).response === 'object' && (error as any).response?.data?.error
        ? (error as any).response.data.error
        : 'Failed to load YouTube analytics.';
      setError(errorMessage);
    }
  };

  // Prepare data for charts and widgets
  const topVideos = [...videos]
    .sort((a, b) => parseInt(b.statistics?.viewCount || '0') - parseInt(a.statistics?.viewCount || '0'))
    .slice(0, 5);

  const chartData = topVideos.map(video => ({
    name: video.snippet.title.substring(0, 20) + '...',
    views: parseInt(video.statistics?.viewCount || '0'),
    likes: parseInt(video.statistics?.likeCount || '0'),
  }));

  // Filter videos for the videos tab
  const filteredVideos = videos
    .filter(video => video.snippet.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (filterBy === 'views') {
        return parseInt(b.statistics?.viewCount || '0') - parseInt(a.statistics?.viewCount || '0');
      } else if (filterBy === 'likes') {
        return parseInt(b.statistics?.likeCount || '0') - parseInt(a.statistics?.likeCount || '0');
      } else {
        return new Date(b.snippet.publishedAt).getTime() - new Date(a.snippet.publishedAt).getTime();
      }
    });

  const handleCopyLink = (videoId: string) => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(videoId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchVideos = async () => {
    try {
      setVideosLoading(true);
      const { data } = await API.get('/youtube/videos');
      setVideos(data.items || []);

      // Recalculate analytics after videos are loaded
      setTimeout(() => fetchAnalytics(), 100);
    } catch (error: unknown) {
      console.error('Error fetching videos:', error);

      // Check if requires reauth and redirect to OAuth
      if (error instanceof Error && 'response' in error && typeof (error as any).response === 'object') {
        const responseData = (error as any).response?.data;
        if (responseData?.requiresReauth) {
          try {
            const res = await API.get("youtube/auth");
            window.location.href = res.data.url;
          } catch (oauthError) {
            console.error("Error initiating YouTube OAuth:", oauthError);
          }
        }
      }
    } finally {
      setVideosLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await API.get('/youtube/comments');
      setComments(data.items || []);
    } catch (error) {
      console.error('Error fetching comments:', error);

      // Check if requires reauth and redirect to OAuth
      if (error instanceof Error && 'response' in error && typeof (error as any).response === 'object') {
        const responseData = (error as any).response?.data;
        if (responseData?.requiresReauth) {
          try {
            const res = await API.get("youtube/auth");
            window.location.href = res.data.url;
          } catch (oauthError) {
            console.error("Error initiating YouTube OAuth:", oauthError);
          }
        }
      }
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      setUploadStatus('Uploading...');
      await API.post('/youtube/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadStatus('Upload successful!');
      e.currentTarget.reset();
      fetchVideos();
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error && typeof (error as any).response === 'object'
        ? ((error as any).response?.data?.error || (error as any).message || 'Upload failed')
        : 'Upload failed';
      setUploadStatus('Upload failed: ' + errorMessage);
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedVideo) return;

    const formData = new FormData(e.currentTarget);
    const videoId = selectedVideo.snippet.resourceId?.videoId || selectedVideo.contentDetails?.videoId;

    try {
      await API.put(`/youtube/videos/${videoId}`, {
        title: formData.get('title'),
        description: formData.get('description'),
        privacyStatus: formData.get('privacyStatus'),
      });
      setShowEditModal(false);
      fetchVideos();
    } catch (error: unknown) {
      console.error('Error updating video:', error);
    }
  };

  const openEditModal = (video: Video) => {
    setSelectedVideo(video);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-12">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Channel Header */}
        {channel && (
          <div className="mb-8 rounded-3xl overflow-hidden bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800">
            <div className="h-48 md:h-64 w-full bg-gray-200 dark:bg-gray-800 relative">
              {channel.brandingSettings?.image?.bannerExternalUrl ? (
                <img
                  src={channel.brandingSettings.image.bannerExternalUrl}
                  alt="Channel Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center">
                  <ImageIcon className="text-white/20 w-24 h-24" />
                </div>
              )}
            </div>
            <div className="px-8 pb-8 relative">
              <div className="flex flex-col md:flex-row items-end -mt-12 mb-4 gap-6">
                <img
                  src={channel.snippet.thumbnails.high.url}
                  alt={channel.snippet.title}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 shadow-lg bg-white"
                />
                <div className="flex-1 text-center md:text-left mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{channel.snippet.title}</h1>
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-1">{channel.snippet.description}</p>
                </div>
                <div className="flex gap-4 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                  <span>{parseInt(channel.statistics.subscriberCount).toLocaleString()} Subscribers</span>
                  <span>•</span>
                  <span>{parseInt(channel.statistics.videoCount).toLocaleString()} Videos</span>
                  <span>•</span>
                  <span>{parseInt(channel.statistics.viewCount).toLocaleString()} Views</span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-800">
                {['overview', 'videos', 'comments', 'upload'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === tab
                      ? 'text-red-600 dark:text-red-500'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 dark:bg-red-500 rounded-t-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="space-y-8">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <MetricCard title="Total Views (All Time)" value={analytics.totalViews.toLocaleString()} icon={Eye} color="pink" trend="+12.5%" />
                <MetricCard title="Total Likes" value={analytics.totalLikes.toLocaleString()} icon={ThumbsUp} color="blue" trend="+8.3%" />
                <MetricCard title="Avg View Duration (min)" value={analytics.averageViewDuration.toLocaleString()} icon={Clock} color="purple" trend="+15.2%" />
                <MetricCard title="Watch Time (hrs)" value={analytics.watchTime.toLocaleString()} icon={Clock} color="green" trend="+10.1%" />
                <MetricCard title="Subscribers" value={analytics.subscribers.toLocaleString()} icon={Users} color="yellow" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Channel Performance Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <BarChart3 className="text-red-600" size={24} />
                    Channel Performance
                  </h2>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                        <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                          cursor={{ fill: 'rgba(239, 68, 68, 0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="views" fill="#EF4444" radius={[4, 4, 0, 0]} name="Views" />
                        <Bar dataKey="likes" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Likes" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Performing Videos Widget */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="text-yellow-500" size={24} />
                    Top Performing
                  </h2>
                  <div className="space-y-4">
                    {topVideos.map((video, index) => (
                      <div key={video.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group" onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}>
                        <div className="relative w-24 h-14 flex-shrink-0">
                          <img src={video.snippet.thumbnails.medium.url} alt={video.snippet.title} className="w-full h-full object-cover rounded-lg shadow-sm" />
                          <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-md">
                            #{index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-red-600 transition-colors" title={video.snippet.title}>{video.snippet.title}</h3>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full"><Eye size={10} /> {parseInt(video.statistics?.viewCount || '0').toLocaleString()}</span>
                            <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full"><ThumbsUp size={10} /> {parseInt(video.statistics?.likeCount || '0').toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Comments Section */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="text-purple-500" size={24} />
                    Recent Comments
                  </h2>
                  <button onClick={() => setActiveTab('comments')} className="text-red-600 dark:text-red-500 text-sm font-medium hover:underline">View All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {comments.slice(0, 6).map((comment) => (
                    <div key={comment.id} className="flex gap-3 items-start">
                      <img src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl} alt="" className="w-8 h-8 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{comment.snippet.topLevelComment.snippet.authorDisplayName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{comment.snippet.topLevelComment.snippet.textDisplay}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </>
          )}

          {/* VIDEOS TAB */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              {/* Search and Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Filter className="text-gray-400" size={20} />
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as any)}
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-gray-900 dark:text-white cursor-pointer"
                  >
                    <option value="date">Latest First</option>
                    <option value="views">Most Viewed</option>
                    <option value="likes">Most Liked</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {videosLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredVideos.map((video) => {
                    const videoId = video.snippet.resourceId?.videoId || video.contentDetails?.videoId;
                    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
                    return (
                      <div key={videoId} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden group hover:border-red-500/50 transition-all">
                        <div className="relative aspect-video cursor-pointer" onClick={() => window.open(youtubeUrl, '_blank')}>
                          <img src={video.snippet.thumbnails.medium.url} alt={video.snippet.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <div className="p-3 bg-white/90 rounded-full text-gray-900">
                              <ExternalLink size={24} />
                            </div>
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyLink(videoId);
                              }}
                              className="p-2 bg-black/70 text-white rounded-lg hover:bg-black/90 transition-colors"
                              title="Copy Link"
                            >
                              {copiedId === videoId ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-3" title={video.snippet.title}>{video.snippet.title}</h3>

                          {/* Video Statistics */}
                          {video.statistics && (
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                <Eye size={14} />
                                <span>{parseInt(video.statistics.viewCount).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                <ThumbsUp size={14} />
                                <span>{parseInt(video.statistics.likeCount || '0').toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                <MessageSquare size={14} />
                                <span>{parseInt(video.statistics.commentCount || '0').toLocaleString()}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                            <span>{new Date(video.snippet.publishedAt).toLocaleDateString()}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStatsVideo(video);
                                  setShowStatsModal(true);
                                }}
                                className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                title="View Stats"
                              >
                                <BarChart3 size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(video);
                                }}
                                className="p-1.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Edit Video"
                              >
                                <Edit2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* COMMENTS TAB */}
          {activeTab === 'comments' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">All Comments</h2>
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <img src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl} alt="" className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{comment.snippet.topLevelComment.snippet.authorDisplayName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(comment.snippet.topLevelComment.snippet.publishedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <ThumbsUp size={14} />
                          <span>{comment.snippet.topLevelComment.snippet.likeCount}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.snippet.topLevelComment.snippet.textDisplay}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UPLOAD TAB */}
          {activeTab === 'upload' && (
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="text-red-600 dark:text-red-500" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Video</h2>
                <p className="text-gray-600 dark:text-gray-400">Share your content with the world</p>
              </div>

              <form onSubmit={handleUpload} className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-red-500 transition-colors">
                  <input type="file" name="videoFile" accept="video/*" required className="hidden" id="video-upload" />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <VideoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Click to select video file</p>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input type="text" name="title" required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none" placeholder="Video Title" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea name="description" rows={4} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none" placeholder="Tell viewers about your video"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Privacy</label>
                  <select name="privacyStatus" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none">
                    <option value="private">Private</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30">
                  Upload Video
                </button>
                {uploadStatus && <p className="text-sm text-center text-gray-600 dark:text-gray-400">{uploadStatus}</p>}
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {
        showEditModal && selectedVideo && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl p-8 border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Video</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleEdit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input type="text" name="title" defaultValue={selectedVideo.snippet.title} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea name="description" defaultValue={selectedVideo.snippet.description} rows={6} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Privacy</label>
                  <select name="privacyStatus" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none">
                    <option value="private">Private</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowEditModal(false)} className="py-3 px-6 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="py-3 px-6 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Video Stats Modal */}
      {
        showStatsModal && statsVideo && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl p-8 border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Video Statistics</h3>
                <button onClick={() => setShowStatsModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <X size={24} />
                </button>
              </div>

              {/* Video Preview */}
              <div className="mb-6">
                <img
                  src={statsVideo.snippet.thumbnails.high.url}
                  alt={statsVideo.snippet.title}
                  className="w-full rounded-lg"
                />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">{statsVideo.snippet.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Published: {new Date(statsVideo.snippet.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Statistics Grid */}
              {statsVideo.statistics && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Eye className="text-blue-600 dark:text-blue-400" size={24} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {parseInt(statsVideo.statistics.viewCount).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Views</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <ThumbsUp className="text-green-600 dark:text-green-400" size={24} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {parseInt(statsVideo.statistics.likeCount || '0').toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Likes</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <MessageSquare className="text-purple-600 dark:text-purple-400" size={24} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {parseInt(statsVideo.statistics.commentCount || '0').toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Comments</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const videoId = statsVideo.snippet.resourceId?.videoId || statsVideo.contentDetails?.videoId;
                    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
                  }}
                  className="flex-1 py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
                >
                  <ExternalLink size={18} />
                  Open on YouTube
                </button>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="py-3 px-6 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

