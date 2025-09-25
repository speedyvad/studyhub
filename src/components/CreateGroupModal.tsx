import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Hash, 
  Users, 
  Lock, 
  Globe, 
  Tag,
  Image,
  Plus,
  Send,
  BookOpen,
  Palette
} from 'lucide-react';

interface CreateGroupData {
  name: string;
  description: string;
  category: string;
  isPrivate: boolean;
  tags: string[];
  rules: string[];
  coverImage?: string;
  avatar?: string;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGroupData) => void;
}

const categories = [
  'Matemática', 'Física', 'Química', 'Biologia', 'História', 
  'Geografia', 'Português', 'Inglês', 'Programação', 'Filosofia',
  'Arte', 'Música', 'Esportes', 'Geral'
];

const popularTags = [
  'Estudo', 'Prova', 'Trabalho', 'Projeto', 'Dúvidas', 
  'Dicas', 'Material', 'Exercícios', 'Revisão', 'Grupo'
];

const defaultRules = [
  'Seja respeitoso com outros membros',
  'Mantenha o foco no tema do grupo',
  'Não compartilhe conteúdo inadequado',
  'Use a busca antes de fazer perguntas repetidas'
];

export default function CreateGroupModal({ isOpen, onClose, onSubmit }: CreateGroupModalProps) {
  const [formData, setFormData] = useState<CreateGroupData>({
    name: '',
    description: '',
    category: 'Geral',
    isPrivate: false,
    tags: [],
    rules: [...defaultRules]
  });

  const [newTag, setNewTag] = useState('');
  const [newRule, setNewRule] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        description: '',
        category: 'Geral',
        isPrivate: false,
        tags: [],
        rules: [...defaultRules]
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tag.trim()] });
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ 
      ...formData, 
      tags: formData.tags.filter(tag => tag !== tagToRemove) 
    });
  };

  const addRule = (rule: string) => {
    if (rule.trim() && !formData.rules.includes(rule.trim())) {
      setFormData({ ...formData, rules: [...formData.rules, rule.trim()] });
    }
    setNewRule('');
  };

  const removeRule = (ruleToRemove: string) => {
    setFormData({ 
      ...formData, 
      rules: formData.rules.filter(rule => rule !== ruleToRemove) 
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
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
                  className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Users className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Criar Novo Grupo
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Crie um grupo para conectar estudantes com interesses similares
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
            {/* Group Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Nome do Grupo *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  placeholder="Ex: Matemática Avançada - USP"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Descrição *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-all duration-200"
                rows={3}
                placeholder="Descreva o propósito do grupo, que tipo de discussões acontecerão aqui..."
                required
              />
            </div>

            {/* Category and Privacy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Categoria
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Visibilidade
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPrivate: false })}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                      !formData.isPrivate
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Globe className="w-4 h-4" />
                    <span className={`text-sm font-medium ${
                      !formData.isPrivate 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      Público
                    </span>
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPrivate: true })}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                      formData.isPrivate
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Lock className="w-4 h-4" />
                    <span className={`text-sm font-medium ${
                      formData.isPrivate 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      Privado
                    </span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Tags
              </label>
              
              {/* Current Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
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
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Adicionar tag..."
                  />
                </div>
                <motion.button
                  type="button"
                  onClick={() => addTag(newTag)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4" />
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

            {/* Rules */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Regras do Grupo
              </label>
              
              {/* Current Rules */}
              <div className="space-y-2 mb-3">
                {formData.rules.map((rule, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">•</span>
                    <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">{rule}</span>
                    <button
                      type="button"
                      onClick={() => removeRule(rule)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Add Rule Input */}
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRule(newRule))}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Adicionar regra..."
                  />
                </div>
                <motion.button
                  type="button"
                  onClick={() => addRule(newRule)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
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
                disabled={!formData.name.trim() || !formData.description.trim() || isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Criar Grupo</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
