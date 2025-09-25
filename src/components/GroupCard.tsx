import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Hash, 
  TrendingUp, 
  Star, 
  Plus, 
  Check,
  Lock,
  Globe,
  Crown,
  MessageCircle
} from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  postCount: number;
  isPrivate: boolean;
  isJoined: boolean;
  isOwner: boolean;
  tags: string[];
  trendingScore: number;
  avatar?: string;
  coverImage?: string;
  rules: string[];
  createdAt: Date;
}

interface GroupCardProps {
  group: Group;
  onJoin: (groupId: string) => void;
  onLeave: (groupId: string) => void;
  onView: (groupId: string) => void;
}

const categoryColors = {
  'Matemática': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Física': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'Química': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Biologia': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'História': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'Geografia': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  'Programação': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  'Geral': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
};

export default function GroupCard({ group, onJoin, onLeave, onView }: GroupCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatMemberCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300"
      whileHover={{ y: -4, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Cover Image */}
      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-500">
        {group.coverImage ? (
          <img 
            src={group.coverImage} 
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <Hash className="w-12 h-12 text-white opacity-50" />
          </div>
        )}
        
        {/* Group Avatar */}
        <div className="absolute -bottom-6 left-4">
          <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-lg">
            {group.avatar ? (
              <img src={group.avatar} alt={group.name} className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <Hash className="w-6 h-6 text-blue-500" />
            )}
          </div>
        </div>

        {/* Privacy Badge */}
        <div className="absolute top-3 right-3">
          {group.isPrivate ? (
            <div className="bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>Privado</span>
            </div>
          ) : (
            <div className="bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
              <Globe className="w-3 h-3" />
              <span>Público</span>
            </div>
          )}
        </div>

        {/* Trending Badge */}
        {group.trendingScore > 50 && (
          <motion.div 
            className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TrendingUp className="w-3 h-3" />
            <span>Em alta</span>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 pt-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">
                {group.name}
              </h3>
              {group.isOwner && (
                <Crown className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {group.description}
            </p>
          </div>
        </div>

        {/* Category */}
        <div className="mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColors[group.category as keyof typeof categoryColors] || categoryColors.Geral}`}>
            {group.category}
          </span>
        </div>

        {/* Tags */}
        {group.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {group.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
            {group.tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{group.tags.length - 3} mais
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{formatMemberCount(group.memberCount)} membros</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-4 h-4" />
            <span>{group.postCount} posts</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={() => onView(group.id)}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Ver Grupo
          </motion.button>
          
          {group.isJoined ? (
            <motion.button
              onClick={() => onLeave(group.id)}
              className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium flex items-center space-x-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Check className="w-4 h-4" />
              <span>Sair</span>
            </motion.button>
          ) : (
            <motion.button
              onClick={() => onJoin(group.id)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center space-x-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              <span>Entrar</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
