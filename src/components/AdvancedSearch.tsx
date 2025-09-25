import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  Hash, 
  Users, 
  TrendingUp,
  Clock,
  Star,
  Tag,
  BookOpen,
  Calendar
} from 'lucide-react';

interface SearchFilters {
  query: string;
  category: string;
  sortBy: 'recent' | 'popular' | 'trending' | 'relevance';
  timeRange: 'all' | 'day' | 'week' | 'month' | 'year';
  contentType: 'all' | 'posts' | 'groups' | 'users';
  tags: string[];
  hasImages: boolean;
  hasComments: boolean;
  minLikes: number;
}

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

const categories = [
  'Todas', 'Matemática', 'Física', 'Química', 'Biologia', 'História', 
  'Geografia', 'Português', 'Inglês', 'Programação', 'Filosofia', 'Arte'
];

const sortOptions = [
  { value: 'recent', label: 'Mais Recentes', icon: Clock },
  { value: 'popular', label: 'Mais Populares', icon: TrendingUp },
  { value: 'trending', label: 'Em Alta', icon: Star },
  { value: 'relevance', label: 'Mais Relevantes', icon: Search }
];

const timeRanges = [
  { value: 'all', label: 'Todo o tempo' },
  { value: 'day', label: 'Últimas 24h' },
  { value: 'week', label: 'Última semana' },
  { value: 'month', label: 'Último mês' },
  { value: 'year', label: 'Último ano' }
];

const contentTypes = [
  { value: 'all', label: 'Tudo', icon: Search },
  { value: 'posts', label: 'Posts', icon: Hash },
  { value: 'groups', label: 'Grupos', icon: Users },
  { value: 'users', label: 'Usuários', icon: Users }
];

const popularTags = [
  'Estudo', 'Prova', 'Trabalho', 'Dúvida', 'Dica', 'Material', 
  'Exercício', 'Revisão', 'Grupo', 'Discussão', 'Ajuda', 'Compartilhar'
];

export default function AdvancedSearch({ isOpen, onClose, onSearch, initialFilters = {} }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'Todas',
    sortBy: 'relevance',
    timeRange: 'all',
    contentType: 'all',
    tags: [],
    hasImages: false,
    hasComments: false,
    minLikes: 0,
    ...initialFilters
  });

  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
    onClose();
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !filters.tags.includes(tag.trim())) {
      setFilters({ ...filters, tags: [...filters.tags, tag.trim()] });
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFilters({ 
      ...filters, 
      tags: filters.tags.filter(tag => tag !== tagToRemove) 
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Search className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Busca Avançada
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Encontre exatamente o que você está procurando
                  </p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Search Query */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Termo de Busca *
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={filters.query}
                      onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                      placeholder="Digite o que você está procurando..."
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Categoria
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Content Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Tipo de Conteúdo
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {contentTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <motion.button
                          key={type.value}
                          type="button"
                          onClick={() => setFilters({ ...filters, contentType: type.value as any })}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                            filters.contentType === type.value
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Icon className="w-4 h-4" />
                          <span className={`text-sm font-medium ${
                            filters.contentType === type.value 
                              ? 'text-purple-700 dark:text-purple-300' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {type.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Ordenar Por
                  </label>
                  <div className="space-y-2">
                    {sortOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => setFilters({ ...filters, sortBy: option.value as any })}
                          className={`w-full p-3 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                            filters.sortBy === option.value
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Icon className="w-4 h-4" />
                          <span className={`font-medium ${
                            filters.sortBy === option.value 
                              ? 'text-purple-700 dark:text-purple-300' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {option.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Time Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Período
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={filters.timeRange}
                      onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as any })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                    >
                      {timeRanges.map(range => (
                        <option key={range.value} value={range.value}>{range.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Tags
                  </label>
                  
                  {/* Current Tags */}
                  {filters.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {filters.tags.map((tag, index) => (
                        <motion.span
                          key={index}
                          className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          <Tag className="w-3 h-3" />
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  )}

                  {/* Add Tag Input */}
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(newTag))}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Adicionar tag..."
                      />
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => addTag(newTag)}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Tag className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Popular Tags */}
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tags populares:</p>
                    <div className="flex flex-wrap gap-2">
                      {popularTags.map((tag) => (
                        <motion.button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {tag}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Advanced Filters */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Filtros Avançados
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={filters.hasImages}
                        onChange={(e) => setFilters({ ...filters, hasImages: e.target.checked })}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Apenas posts com imagens</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={filters.hasComments}
                        onChange={(e) => setFilters({ ...filters, hasComments: e.target.checked })}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Apenas posts com comentários</span>
                    </label>
                  </div>
                </div>

                {/* Min Likes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Mínimo de Curtidas
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.minLikes}
                      onChange={(e) => setFilters({ ...filters, minLikes: parseInt(e.target.value) })}
                      className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[3rem]">
                      {filters.minLikes}+
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <motion.button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancelar
              </motion.button>
              <motion.button
                type="submit"
                disabled={!filters.query.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Search className="w-4 h-4" />
                <span>Buscar</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
