import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  MoreHorizontal,
  TrendingUp,
  Star,
  Clock,
  User,
  Hash,
  ArrowUp,
  ArrowDown,
  Flag,
  Eye,
  ThumbsUp
} from 'lucide-react';
import EnhancedCommentForm from './EnhancedCommentForm';
import PostComments from './PostComments';

interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
    followers?: number;
  };
  timestamp: Date;
  likes: number;
  liked: boolean;
  comments: number;
  shares: number;
  bookmarked: boolean;
  upvotes: number;
  downvotes: number;
  voted: 'up' | 'down' | null;
  trendingScore: number;
  category: string;
  tags: string[];
  images?: string[];
  group?: {
    id: string;
    name: string;
    avatar?: string;
  };
  isPinned?: boolean;
  isAnnouncement?: boolean;
}

interface EnhancedFeedProps {
  posts: Post[];
  onLike: (postId: string) => void;
  onShare: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onVote: (postId: string, vote: 'up' | 'down') => void;
  onComment: (postId: string, content: string) => void;
  onFollow: (userId: string) => void;
  onReport: (postId: string) => void;
  currentUserId: string;
}

export default function EnhancedFeed({ 
  posts, 
  onLike, 
  onShare, 
  onBookmark, 
  onVote,
  onComment,
  onFollow,
  onReport,
  currentUserId 
}: EnhancedFeedProps) {
  const [showCommentForm, setShowCommentForm] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<string | null>(null);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'agora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const PostCard = ({ post }: { post: Post }) => (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <img
              src={post.author.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {post.author.name}
                </h4>
                {post.author.verified && (
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Star className="w-4 h-4 text-blue-500" />
                  </motion.div>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatTimeAgo(post.timestamp)}
                </span>
                {post.isPinned && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                    📌 Fixado
                  </span>
                )}
                {post.isAnnouncement && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
                    📢 Anúncio
                  </span>
                )}
              </div>
              
              {post.group && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>em</span>
                  <div className="flex items-center space-x-1">
                    <img
                      src={post.group.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=16&h=16&fit=crop&crop=face'}
                      alt={post.group.name}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="font-medium">{post.group.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {post.trendingScore > 50 && (
              <motion.div 
                className="flex items-center space-x-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded-full"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className="w-3 h-3" />
                <span>Em alta</span>
              </motion.div>
            )}
            
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-900 dark:text-gray-100 mb-4 whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span 
                key={index}
                className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4">
            <div className={`grid gap-2 ${
              post.images.length === 1 ? 'grid-cols-1' :
              post.images.length === 2 ? 'grid-cols-2' :
              post.images.length === 3 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}>
              {post.images.slice(0, 4).map((image, index) => (
                <motion.img
                  key={index}
                  src={image}
                  alt={`Imagem ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                />
              ))}
              {post.images.length > 4 && (
                <div className="relative">
                  <img
                    src={post.images[3]}
                    alt="Mais imagens"
                    className="w-full h-48 object-cover rounded-lg opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <span className="text-white font-semibold">+{post.images.length - 4}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reddit-style Voting */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-1">
            <motion.button
              onClick={() => onVote(post.id, 'up')}
              className={`p-2 rounded-lg transition-colors ${
                post.voted === 'up'
                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                  : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {post.upvotes - post.downvotes}
            </span>
            <motion.button
              onClick={() => onVote(post.id, 'down')}
              className={`p-2 rounded-lg transition-colors ${
                post.voted === 'down'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowDown className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
            <Eye className="w-4 h-4" />
            <span>{formatNumber(post.trendingScore)} visualizações</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Like Button */}
            <motion.button
              onClick={() => onLike(post.id)}
              className={`flex items-center space-x-2 transition-colors ${
                post.liked 
                  ? 'text-red-500' 
                  : 'text-gray-500 hover:text-red-500'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={post.liked ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart className={`w-5 h-5 ${post.liked ? 'fill-current' : ''}`} />
              </motion.div>
              <span className="text-sm font-medium">{formatNumber(post.likes)}</span>
            </motion.button>

            {/* Comment Button */}
            <motion.button
              onClick={() => setShowComments(showComments === post.id ? null : post.id)}
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{formatNumber(post.comments)}</span>
            </motion.button>

            {/* Share Button */}
            <motion.button
              onClick={() => onShare(post.id)}
              className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">{formatNumber(post.shares)}</span>
            </motion.button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Bookmark Button */}
            <motion.button
              onClick={() => onBookmark(post.id)}
              className={`p-2 rounded-lg transition-colors ${
                post.bookmarked
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                  : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bookmark className={`w-4 h-4 ${post.bookmarked ? 'fill-current' : ''}`} />
            </motion.button>

            {/* Follow Button */}
            {post.author.id !== currentUserId && (
              <motion.button
                onClick={() => onFollow(post.author.id)}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Seguir
              </motion.button>
            )}
          </div>
        </div>

        {/* Comment Form */}
        <AnimatePresence>
          {showCommentForm === post.id && (
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <EnhancedCommentForm
                onSubmit={(content) => {
                  onComment(post.id, content);
                  setShowCommentForm(null);
                }}
                placeholder="Adicione um comentário..."
                showRichText={false}
                maxLength={500}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments === post.id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PostComments
              postId={post.id}
              comments={[]} // Mock comments
              onAddComment={(postId, content) => onComment(postId, content)}
              onLikeComment={() => {}}
              onReplyToComment={() => {}}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <PostCard post={post} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
