import { useState, useEffect } from 'react';
import { Eye, ThumbsUp, MessageSquare, Clock, Users, Upload, Edit2, X } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import API from '../utils/api';

interface Video {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
    };
    publishedAt: string;
    resourceId?: { videoId: string };
  };
  contentDetails?: {
    videoId: string;
  };
}

export function YouTubeDashboard() {
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    watchTime: 0,
    subscribers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    fetchAnalytics();
    fetchVideos();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
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
        setLoading(false);
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
      setError(error.response?.data?.error || 'Failed to load YouTube analytics. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-12">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">YouTube Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your channel performance and video metrics</p>
        </div>

        {loading && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-12 border border-gray-200 dark:border-gray-800 mb-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading YouTube analytics...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-xl p-8 border border-red-200 dark:border-red-800 mb-8">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 font-semibold mb-4">{error}</p>
              <button onClick={fetchAnalytics} className="px-6 py-2 bg-gradient-to-r from-pink-600 to-yellow-400 text-white font-semibold rounded-lg hover:shadow-lg transition-all">
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <MetricCard title="Total Views" value={analytics.totalViews.toLocaleString()} icon={Eye} color="pink" trend="+12.5%" />
              <MetricCard title="Total Likes" value={analytics.totalLikes.toLocaleString()} icon={ThumbsUp} color="blue" trend="+8.3%" />
              <MetricCard title="Comments" value={analytics.totalComments.toLocaleString()} icon={MessageSquare} color="purple" trend="+15.2%" />
              <MetricCard title="Watch Time (hrs)" value={analytics.watchTime.toLocaleString()} icon={Clock} color="green" trend="+10.1%" />
              <MetricCard title="Subscribers" value={analytics.subscribers.toLocaleString()} icon={Users} color="yellow" trend="+5.7%" />
            </div>

            {/* Video Management Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Video List */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Videos</h2>
                {videosLoading ? (
                  <p className="text-gray-600 dark:text-gray-400">Loading videos...</p>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {videos.map((video) => {
                      const videoId = video.snippet.resourceId?.videoId || video.contentDetails?.videoId;
                      return (
                        <div key={videoId} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg flex items-center space-x-4">
                          <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} className="w-24 h-16 rounded-md object-cover" />
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">{video.snippet.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              Published: {new Date(video.snippet.publishedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => openEditModal(video)}
                            className="py-2 px-4 bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-semibold rounded-lg flex items-center gap-2"
                          >
                            <Edit2 size={16} />
                            Edit
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Upload Form */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Upload size={24} />
                  Upload Video
                </h2>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Video File</label>
                    <input type="file" name="videoFile" accept="video/*" required className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input type="text" name="title" required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea name="description" rows={4} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Privacy</label>
                    <select name="privacyStatus" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white">
                      <option value="private">Private</option>
                      <option value="unlisted">Unlisted</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full py-2 px-4 bg-gradient-to-r from-pink-600 to-yellow-400 text-white font-semibold rounded-lg hover:shadow-lg transition-all">
                    Upload Video
                  </button>
                  {uploadStatus && <p className="text-sm text-center text-gray-600 dark:text-gray-400">{uploadStatus}</p>}
                </form>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Video</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input type="text" name="title" defaultValue={selectedVideo.snippet.title} required className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea name="description" defaultValue={selectedVideo.snippet.description} rows={6} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Privacy</label>
                <select name="privacyStatus" className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white">
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="public">Public</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="py-2 px-4 bg-gradient-to-r from-pink-600 to-yellow-400 text-white font-semibold rounded-lg">
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
