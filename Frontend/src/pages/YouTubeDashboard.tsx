import { useState, useEffect } from 'react';
import { Eye, ThumbsUp, MessageSquare, Clock, Users, Upload, Edit2, X, LayoutGrid, List, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
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
    totalComments: 0,
    watchTime: 0,
    subscribers: 0,
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
    }
  };

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const { data } = await API.get('/youtube/analytics');

      if (!data.rows || data.rows.length === 0) {
        setAnalytics({
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          watchTime: 0,
          subscribers: 0,
        });
        return;
      }

      const totals: any = {};
      const headers = data.columnHeaders.map((h: any) => h.name);

      data.rows.forEach((row: any[]) => {
        headers.forEach((header: string, index: number) => {
          if (header === 'day') return;
          if (!totals[header]) totals[header] = 0;
          totals[header] += parseFloat(row[index]) || 0;
        });
      });

      const netSubscribers = (totals.subscribersGained || 0) - (totals.subscribersLost || 0);

      setAnalytics({
        totalViews: Math.round(totals.views || 0),
        totalLikes: Math.round(totals.likes || 0),
        totalComments: Math.round(totals.comments || 0),
        watchTime: Math.round((totals.estimatedMinutesWatched || 0) / 60),
        subscribers: Math.round(netSubscribers),
      });
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      setError(error.response?.data?.error || 'Failed to load YouTube analytics.');
    }
  };

  const fetchVideos = async () => {
    try {
      setVideosLoading(true);
      const { data } = await API.get('/youtube/videos');
      setVideos(data.items || []);
    } catch (error: any) {
      console.error('Error fetching videos:', error);
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
    } catch (error: any) {
      setUploadStatus('Upload failed: ' + (error.response?.data?.error || error.message));
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
    } catch (error: any) {
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
                <MetricCard title="Total Views (28d)" value={analytics.totalViews.toLocaleString()} icon={Eye} color="pink" trend="+12.5%" />
                <MetricCard title="Total Likes" value={analytics.totalLikes.toLocaleString()} icon={ThumbsUp} color="blue" trend="+8.3%" />
                <MetricCard title="Comments" value={analytics.totalComments.toLocaleString()} icon={MessageSquare} color="purple" trend="+15.2%" />
                <MetricCard title="Watch Time (hrs)" value={analytics.watchTime.toLocaleString()} icon={Clock} color="green" trend="+10.1%" />
                <MetricCard title="Subscribers Gained" value={analytics.subscribers.toLocaleString()} icon={Users} color="yellow" trend="+5.7%" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Videos Preview */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Videos</h2>
                    <button onClick={() => setActiveTab('videos')} className="text-red-600 dark:text-red-500 text-sm font-medium hover:underline">View All</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videos.slice(0, 4).map((video) => (
                      <div key={video.id} className="group relative rounded-xl overflow-hidden cursor-pointer">
                        <img src={video.snippet.thumbnails.medium.url} alt={video.snippet.title} className="w-full h-48 object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                          <p className="text-white font-medium line-clamp-2">{video.snippet.title}</p>
                          <p className="text-gray-300 text-xs mt-1">{new Date(video.snippet.publishedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Comments Preview */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Comments</h2>
                    <button onClick={() => setActiveTab('comments')} className="text-red-600 dark:text-red-500 text-sm font-medium hover:underline">View All</button>
                  </div>
                  <div className="space-y-4">
                    {comments.slice(0, 5).map((comment) => (
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
              </div>
            </>
          )}

          {/* VIDEOS TAB */}
          {activeTab === 'videos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => {
                const videoId = video.snippet.resourceId?.videoId || video.contentDetails?.videoId;
                return (
                  <div key={videoId} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden group hover:border-red-500/50 transition-all">
                    <div className="relative aspect-video">
                      <img src={video.snippet.thumbnails.medium.url} alt={video.snippet.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button onClick={() => openEditModal(video)} className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100"><Edit2 size={18} /></button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2" title={video.snippet.title}>{video.snippet.title}</h3>
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>{new Date(video.snippet.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
      {showEditModal && selectedVideo && (
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
      )}
    </div>
  );
}

