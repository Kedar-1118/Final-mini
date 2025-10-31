import { useState } from 'react';
import { ChevronDown, Heart, MessageCircle } from 'lucide-react';

interface Post {
  caption: string;
  likes: number;
  comments: number;
  image: string;
}

interface PostDropdownProps {
  posts: Post[];
}

export function PostDropdown({ posts }: PostDropdownProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  return (
    <div className="space-y-4">
      <div className="relative">
        <select
          onChange={(e) => setSelectedPost(posts[Number(e.target.value)])}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none cursor-pointer"
        >
          <option value="">Select a post to preview</option>
          {posts.map((post, index) => (
            <option key={index} value={index}>
              {post.caption.slice(0, 50)}...
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
      </div>

      {selectedPost && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 animate-fade-in">
          <img
            src={`http://localhost:3000/api/v1/proxy/image?url=${encodeURIComponent(post.image)}`}
            alt={selectedPost.caption}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
          <p className="text-gray-900 dark:text-white font-medium mb-4">{selectedPost.caption}</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Heart size={20} className="text-pink-500" />
              <span className="font-semibold">{selectedPost.likes}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MessageCircle size={20} className="text-blue-500" />
              <span className="font-semibold">{selectedPost.comments}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
