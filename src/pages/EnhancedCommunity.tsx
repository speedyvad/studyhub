import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  TrendingUp,
  Star,
  Users,
  Hash,
  Bell,
  Grid,
  List,
  Flame
} from 'lucide-react';
import EnhancedCommentForm from '../components/EnhancedCommentForm';
import EnhancedFeed from '../components/EnhancedFeed';
import GroupCard from '../components/GroupCard';
import CreateGroupModal from '../components/CreateGroupModal';
import AdvancedSearch from '../components/AdvancedSearch';
import communityApi, { Post, Group } from '../lib/communityApi';

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

export default function EnhancedCommunity() {
  const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'trending' | 'following'>('feed');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Mock data
  const mockGroups: Group[] = [
    {
      id: '1',
      name: 'Matemática Avançada',
      description: 'Grupo para discussões sobre matemática de nível superior, cálculo, álgebra linear e mais.',
      category: 'Matemática',
      memberCount: 1250,
      postCount: 89,
      isPrivate: false,
      isJoined: true,
      isOwner: false,
      tags: ['Cálculo', 'Álgebra', 'Análise'],
      trendingScore: 85,
      rules: ['Seja respeitoso', 'Mantenha o foco'],
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Programação Web',
      description: 'Compartilhe projetos, dúvidas e aprenda sobre desenvolvimento web moderno.',
      category: 'Programação',
      memberCount: 2100,
      postCount: 156,
      isPrivate: false,
      isJoined: false,
      isOwner: false,
      tags: ['React', 'JavaScript', 'CSS'],
      trendingScore: 92,
      rules: ['Código limpo', 'Compartilhe conhecimento'],
      createdAt: new Date('2024-01-10')
    }
  ];

  const mockPosts: Post[] = [
    {
      id: '1',
      content: 'Acabei de resolver um problema de cálculo que estava me quebrando a cabeça! 🎉\n\nA chave era usar integração por partes de forma criativa. Alguém mais já passou por isso?',
      author: {
        id: 'user1',
        name: 'Ana Silva',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        verified: true,
        followers: 1250
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 45,
      liked: false,
      comments: 12,
      shares: 8,
      bookmarked: false,
      upvotes: 38,
      downvotes: 2,
      voted: null,
      trendingScore: 156,
      category: 'Matemática',
      tags: ['Cálculo', 'Integração', 'Dúvida'],
      group: {
        id: '1',
        name: 'Matemática Avançada',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
      }
    },
    {
      id: '2',
      content: 'Dica de ouro para quem está estudando React: use o React DevTools! 🔧\n\nIsso mudou completamente minha forma de debugar componentes. A performance melhorou muito.',
      author: {
        id: 'user2',
        name: 'Carlos Dev',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        verified: false,
        followers: 890
      },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      likes: 78,
      liked: true,
      comments: 23,
      shares: 15,
      bookmarked: true,
      upvotes: 65,
      downvotes: 3,
      voted: 'up',
      trendingScore: 234,
      category: 'Programação',
      tags: ['React', 'Dica', 'Debugging']
    }
  ];

  const categories = [
    'Todas', 'Matemática', 'Física', 'Química', 'Biologia', 'História', 
    'Geografia', 'Português', 'Inglês', 'Programação', 'Filosofia', 'Arte'
  ];

  const handleCreatePost = (content: string) => {
    console.log('Creating post:', content);
    setShowCreatePost(false);
  };

  const handleCreateGroup = (data: any) => {
    console.log('Creating group:', data);
    setShowCreateGroup(false);
  };

  const handleSearch = (filters: any) => {
    console.log('Searching with filters:', filters);
    setShowAdvancedSearch(false);
  };

  const handleLike = (postId: string) => {
    console.log('Liking post:', postId);
  };

  const handleShare = (postId: string) => {
    console.log('Sharing post:', postId);
  };

  const handleBookmark = (postId: string) => {
    console.log('Bookmarking post:', postId);
  };

  const handleVote = (postId: string, vote: 'up' | 'down') => {
    console.log('Voting on post:', postId, vote);
  };

  const handleComment = (postId: string, content: string) => {
    console.log('Commenting on post:', postId, content);
  };

  const handleFollow = (userId: string) => {
    console.log('Following user:', userId);
  };

  const handleJoinGroup = (groupId: string) => {
    console.log('Joining group:', groupId);
  };

  const handleLeaveGroup = (groupId: string) => {
    console.log('Leaving group:', groupId);
  };

  const handleViewGroup = (groupId: string) => {
    console.log('Viewing group:', groupId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Hash className="w-5 h-5 text-white" />
              </motion.div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Comunidade</h1>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => setShowAdvancedSearch(true)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Search className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bell className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <motion.button
                  onClick={() => setShowCreatePost(true)}
                  className="w-full flex items-center space-x-3 p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Nova Postagem</span>
                </motion.button>
                
                <motion.button
                  onClick={() => setShowCreateGroup(true)}
                  className="w-full flex items-center space-x-3 p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Criar Grupo</span>
                </motion.button>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Categorias</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-medium">{category}</span>
                    <span className="text-sm">12</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Tópicos em Alta</h3>
              <div className="space-y-3">
                {['#ReactJS', '#Cálculo', '#Prova', '#Dica', '#Estudo'].map((topic, index) => (
                  <motion.div
                    key={topic}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Hash className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{topic}</span>
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-1">
                  {[
                    { id: 'feed', label: 'Feed', icon: Hash },
                    { id: 'groups', label: 'Grupos', icon: Users },
                    { id: 'trending', label: 'Em Alta', icon: TrendingUp },
                    { id: 'following', label: 'Seguindo', icon: Star }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{tab.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <List className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Grid className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Buscar posts, grupos, usuários..."
                />
              </div>
            </div>

            {/* Content */}
            {activeTab === 'feed' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <EnhancedFeed
                  posts={mockPosts}
                  onLike={handleLike}
                  onShare={handleShare}
                  onBookmark={handleBookmark}
                  onVote={handleVote}
                  onComment={handleComment}
                  onFollow={handleFollow}
                  onReport={() => {}}
                  currentUserId="current-user"
                />
              </motion.div>
            )}

            {activeTab === 'groups' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                    : 'grid-cols-1'
                }`}
              >
                {mockGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onJoin={handleJoinGroup}
                    onLeave={handleLeaveGroup}
                    onView={handleViewGroup}
                  />
                ))}
              </motion.div>
            )}

            {activeTab === 'trending' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Flame className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Conteúdo em Alta
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Posts populares aparecerão aqui quando houver engajamento suficiente.
                </p>
              </motion.div>
            )}

            {activeTab === 'following' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Pessoas que Você Segue
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Posts das pessoas que você segue aparecerão aqui.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreatePost && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreatePost(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Nova Postagem</h2>
              </div>
              <div className="p-6">
                <EnhancedCommentForm
                  onSubmit={handleCreatePost}
                  placeholder="Compartilhe algo com a comunidade..."
                  showRichText={true}
                  maxLength={1000}
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {showCreateGroup && (
          <CreateGroupModal
            isOpen={showCreateGroup}
            onClose={() => setShowCreateGroup(false)}
            onSubmit={handleCreateGroup}
          />
        )}

        {showAdvancedSearch && (
          <AdvancedSearch
            isOpen={showAdvancedSearch}
            onClose={() => setShowAdvancedSearch(false)}
            onSearch={handleSearch}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
