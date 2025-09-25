import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  MoreHorizontal,
  User,
  Clock
} from 'lucide-react';
import EnhancedCommentForm from './EnhancedCommentForm';

interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  likes: number;
  liked: boolean;
  replies?: Comment[];
}

interface PostCommentsProps {
  postId: string;
  comments: Comment[];
  onAddComment: (postId: string, content: string) => void;
  onLikeComment: (commentId: string) => void;
  onReplyToComment: (commentId: string, content: string) => void;
}

export default function PostComments({ 
  postId, 
  comments, 
  onAddComment, 
  onLikeComment, 
  onReplyToComment 
}: PostCommentsProps) {
  const [showComments, setShowComments] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'agora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const handleAddComment = (content: string) => {
    onAddComment(postId, content);
    setShowReplyForm(null);
  };

  const handleReply = (commentId: string, content: string) => {
    onReplyToComment(commentId, content);
    setShowReplyForm(null);
    setReplyingTo(null);
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <motion.div 
      className={`${isReply ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex space-x-3">
        <img
          src={comment.author.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'}
          alt={comment.author.name}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
              {comment.author.name}
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(comment.timestamp)}</span>
            </span>
          </div>
          
          <p className="text-gray-900 dark:text-gray-100 text-sm mb-2 whitespace-pre-wrap">
            {comment.content}
          </p>
          
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => onLikeComment(comment.id)}
              className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className={`w-4 h-4 ${comment.liked ? 'fill-current text-red-500' : ''}`} />
              <span className="text-xs">{comment.likes}</span>
            </motion.button>
            
            {!isReply && (
              <motion.button
                onClick={() => {
                  setShowReplyForm(comment.id);
                  setReplyingTo(comment.author.name);
                }}
                className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Reply className="w-4 h-4" />
                <span className="text-xs">Responder</span>
              </motion.button>
            )}
            
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          
          {/* Reply Form */}
          {showReplyForm === comment.id && (
            <motion.div 
              className="mt-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <EnhancedCommentForm
                onSubmit={(content) => handleReply(comment.id, content)}
                placeholder={`Responder para ${replyingTo}...`}
                showRichText={false}
                maxLength={300}
              />
            </motion.div>
          )}
          
          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      {/* Comments Toggle */}
      <motion.button
        onClick={() => setShowComments(!showComments)}
        className="w-full flex items-center justify-between p-4 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">
            {comments.length} {comments.length === 1 ? 'comentário' : 'comentários'}
          </span>
        </div>
        <motion.div
          animate={{ rotate: showComments ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.button>

      {/* Comments List */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 space-y-4">
              {/* Add Comment Form */}
              <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                <EnhancedCommentForm
                  onSubmit={handleAddComment}
                  placeholder="Adicione um comentário..."
                  showRichText={false}
                  maxLength={500}
                />
              </div>

              {/* Comments */}
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                </div>
              ) : (
                <motion.div 
                  className="text-center py-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  </motion.div>
                  <p className="text-gray-600 dark:text-gray-400">Nenhum comentário ainda</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Seja o primeiro a comentar!</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
