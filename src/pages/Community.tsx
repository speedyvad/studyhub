import { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Plus, 
  Heart, 
  MessageCircle, 
  Share2, 
  Users, 
  Search,
  TrendingUp,
  Star,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Community() {
  const { posts, addPost, likePost } = useStore();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'trending' | 'recent'>('all');

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    addPost(newPostContent);
    setNewPostContent('');
    setShowCreatePost(false);
    toast.success('Postagem criada com sucesso! 🎉');
  };

  const handleLikePost = (postId: string) => {
    likePost(postId);
    toast.success('Curtida adicionada! ❤️');
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'agora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  // Filtrar posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'trending') {
      return matchesSearch && post.likes >= 5;
    }
    if (filter === 'recent') {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return matchesSearch && post.timestamp > oneHourAgo;
    }
    
    return matchesSearch;
  });

  // Estatísticas da comunidade
  const totalPosts = posts.length;
  const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
  const activeUsers = new Set(posts.map(post => post.author.id)).size;

  return (
    <motion.div 
      className="max-w-6xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Comunidade</h1>
          <p className="text-gray-600 dark:text-gray-400">Conecte-se com outros estudantes e compartilhe experiências</p>
        </div>
        <motion.button
          onClick={() => setShowCreatePost(true)}
          className="btn-primary flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Plus className="w-5 h-5" />
          <span>Nova Postagem</span>
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div 
          className="card"
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <MessageCircle className="w-6 h-6 text-blue-500" />
            </motion.div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalPosts}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Postagens</p>
            </div>
          </div>
        </motion.div>
        <motion.div 
          className="card"
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Heart className="w-6 h-6 text-red-500" />
            </motion.div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalLikes}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Curtidas</p>
            </div>
          </div>
        </motion.div>
        <motion.div 
          className="card"
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center"
              whileHover={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Users className="w-6 h-6 text-green-500" />
            </motion.div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeUsers}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Usuários ativos</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main feed */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters */}
          <div className="card">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar postagens..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Filter buttons */}
              <div className="flex space-x-2">
                {(['all', 'trending', 'recent'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
                      filter === filterType
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filterType === 'all' && <MessageCircle className="w-4 h-4" />}
                    {filterType === 'trending' && <TrendingUp className="w-4 h-4" />}
                    {filterType === 'recent' && <Star className="w-4 h-4" />}
                    <span>
                      {filterType === 'all' && 'Todas'}
                      {filterType === 'trending' && 'Em alta'}
                      {filterType === 'recent' && 'Recentes'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Create Post Modal */}
          {showCreatePost && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Nova Postagem</h3>
                <button
                  onClick={() => {
                    setShowCreatePost(false);
                    setNewPostContent('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="input-field"
                    rows={4}
                    placeholder="Compartilhe algo com a comunidade... Dicas de estudo, conquistas, dúvidas..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreatePost(false);
                      setNewPostContent('');
                    }}
                    className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Publicar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Posts Feed */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post, index) => (
                  <motion.div 
                    key={post.id} 
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    layout
                  >
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <motion.img
                        src={post.author.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
                        alt={post.author.name}
                        className="w-10 h-10 rounded-full object-cover"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{post.author.name}</h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(post.timestamp)}
                          </span>
                          {post.likes >= 5 && (
                            <motion.span 
                              className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full flex items-center space-x-1"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            >
                              <TrendingUp className="w-3 h-3" />
                              <span>Em alta</span>
                            </motion.span>
                          )}
                        </div>

                        <p className="text-gray-900 dark:text-gray-100 mb-4 whitespace-pre-wrap">{post.content}</p>

                        {/* Actions */}
                        <div className="flex items-center space-x-6">
                          <motion.button
                            onClick={() => handleLikePost(post.id)}
                            className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <motion.div
                              animate={post.liked ? { scale: [1, 1.2, 1] } : {}}
                              transition={{ duration: 0.3 }}
                            >
                              <Heart className={`w-5 h-5 ${post.liked ? 'fill-current text-red-500' : ''}`} />
                            </motion.div>
                            <span className="text-sm">{post.likes}</span>
                          </motion.button>
                          <motion.button 
                            className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm">{post.comments}</span>
                          </motion.button>
                          <motion.button 
                            className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Share2 className="w-5 h-5" />
                            <span className="text-sm">Compartilhar</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
            ) : (
              <motion.div 
                className="card text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {searchTerm || filter !== 'all' 
                    ? 'Nenhuma postagem encontrada' 
                    : 'Nenhuma postagem ainda'
                  }
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm || filter !== 'all'
                    ? 'Tente ajustar os filtros ou criar uma nova postagem.'
                    : 'Seja o primeiro a compartilhar algo com a comunidade!'
                  }
                </p>
                {(!searchTerm && filter === 'all') && (
                  <motion.button
                    onClick={() => setShowCreatePost(true)}
                    className="btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Criar Primeira Postagem
                  </motion.button>
                )}
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Study Groups */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-text-primary">Grupos de Estudo</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 text-sm">📚 Matemática Avançada</h4>
                <p className="text-xs text-blue-600">12 membros</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 text-sm">🧬 Biologia Molecular</h4>
                <p className="text-xs text-green-600">8 membros</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800 text-sm">💻 Programação</h4>
                <p className="text-xs text-purple-600">25 membros</p>
              </div>
            </div>
            <button className="w-full mt-4 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors duration-200 text-sm font-medium">
              Criar Grupo
            </button>
          </div>

          {/* Top Contributors */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Trophy className="w-5 h-5 text-gamification" />
              <h3 className="font-semibold text-text-primary">Top Contribuidores</h3>
            </div>
            <div className="space-y-3">
              {posts
                .reduce((acc, post) => {
                  const existing = acc.find(item => item.author.id === post.author.id);
                  if (existing) {
                    existing.likes += post.likes;
                  } else {
                    acc.push({ author: post.author, likes: post.likes });
                  }
                  return acc;
                }, [] as { author: any; likes: number }[])
                .sort((a, b) => b.likes - a.likes)
                .slice(0, 5)
                .map((contributor, index) => (
                  <div key={contributor.author.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gamification-100 rounded-full flex items-center justify-center text-xs font-bold text-gamification">
                      {index + 1}
                    </div>
                    <img
                      src={contributor.author.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'}
                      alt={contributor.author.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary text-sm truncate">
                        {contributor.author.name}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {contributor.likes} curtidas
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Study Tips */}
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-4">💡 Dicas da Comunidade</h3>
            <div className="space-y-3 text-sm text-text-secondary">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="font-medium text-yellow-800 mb-1">Técnica Pomodoro</p>
                <p>Use intervalos de 25 minutos para manter o foco.</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800 mb-1">Mapas Mentais</p>
                <p>Crie conexões visuais entre conceitos.</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800 mb-1">Revisão Espaçada</p>
                <p>Revise o conteúdo em intervalos crescentes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
