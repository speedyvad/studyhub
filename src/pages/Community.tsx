import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, TrendingUp, Star, Users, Hash, Bell, X, Settings, BookOpen, Code, Calculator, Globe, Music, Palette, Zap, MessageCircle } from 'lucide-react';
import communityApi from '../lib/communityApi';
import socketLib from '../lib/socket';
import type { Post, Group } from '../types/community';
import toast from 'react-hot-toast';
import GroupChat from '../components/GroupChat';
import { useStore } from '../store/useStore';

export default function Community() {
  const { user } = useStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'groups'>('feed');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    category: '',
    isPrivate: false,
    tags: [] as string[]
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGroupForChat, setSelectedGroupForChat] = useState<Group | null>(null);
  // `showCreatePost` state is handled in EnhancedCommunity; not used here
  const [newPost, setNewPost] = useState({
    content: '',
    tags: [] as string[]
  });

  useEffect(() => {
    let mounted = true;

    const loadCommunityData = async () => {
      try {
        setLoading(true);
        const [postsResponse, groupsResponse] = await Promise.all([
          communityApi.getPosts(),
          communityApi.getGroups()
        ]);

        if (!mounted) return;
        setPosts(postsResponse.data.posts || []);
        setGroups(groupsResponse.data.groups || []);
      } catch (error) {
        console.error('Erro ao carregar dados da comunidade:', error);
        // Por enquanto, usar dados mock se a API não estiver disponível
        setPosts([]);
        setGroups([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCommunityData();

    // Conectar socket e registrar listeners
    const socket = socketLib.connectSocket();

    const onPostCreated = (payload: any) => {
      const newPost = payload?.post ?? payload;
      if (!newPost || !newPost.id) return;
      if (newPost.user?.id === user?.id) {
        return;
      }
      setPosts(prev => {
        // evitar duplicatas
        if (prev.some(p => p.id === newPost.id)) return prev;
        return [newPost, ...prev];
      });
      toast.success('Um novo post foi publicado na comunidade!');
    };

    const onPostLiked = (payload: any) => {
      const { postId, likes, liked } = payload ?? {};
      if (!postId) return;
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: typeof likes === 'number' ? likes : p.likes, liked: typeof liked === 'boolean' ? liked : p.liked } : p));
    };
    const onPostDeleted = (payload: any) => {
      const { postId } = payload ?? {};
      if (!postId) return;
      
      // Remove o post do estado local
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    };

    const onCommentCreated = (payload: { postId: string }) => {
      const { postId } = payload ?? {};
      if (!postId) return;
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        const cur = typeof p.comments === 'number' ? p.comments : 0;
        return { ...p, comments: cur + 1 };
      }));
    };

    socket.on('post:created', onPostCreated);
    socket.on('post:liked', onPostLiked);
    socket.on('comment:created', onCommentCreated);
    socket.on('post:deleted', onPostDeleted);

    return () => {
      mounted = false;
      try {
        socket.off('post:created', onPostCreated);
        socket.off('post:liked', onPostLiked);
        socket.off('comment:created', onCommentCreated);
        socket.off('post:deleted', onPostDeleted);
      } catch (e) {
        // ignore
      }
      // não desconectamos o socket globalmente para não perturbar outros componentes; se quiser, chamar socketLib.disconnectSocket()
    };
  }, [user]);

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Categorias disponíveis para grupos
  const categories = [
    { id: 'matematica', name: 'Matemática', icon: Calculator, color: 'bg-blue-500' },
    { id: 'programacao', name: 'Programação', icon: Code, color: 'bg-green-500' },
    { id: 'historia', name: 'História', icon: BookOpen, color: 'bg-yellow-500' },
    { id: 'geografia', name: 'Geografia', icon: Globe, color: 'bg-purple-500' },
    { id: 'arte', name: 'Arte', icon: Palette, color: 'bg-pink-500' },
    { id: 'musica', name: 'Música', icon: Music, color: 'bg-indigo-500' },
    { id: 'ciencias', name: 'Ciências', icon: Zap, color: 'bg-red-500' },
    { id: 'outros', name: 'Outros', icon: Hash, color: 'bg-gray-500' }
  ];

  // Tags populares
  const popularTags = [
    'estudo', 'prova', 'vestibular', 'enem', 'concursos', 'faculdade',
    'universidade', 'pesquisa', 'trabalho', 'projeto', 'apresentação',
    'grupo', 'colaboração', 'dúvidas', 'dicas', 'material'
  ];

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim() || !newGroup.description.trim() || !newGroup.category) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const groupData = {
        ...newGroup,
        tags: selectedTags
      };

      // --- INÍCIO DA CORREÇÃO ---

      // 1. Chame a API REAL (que você corrigiu antes)
      const response = await communityApi.createGroup(groupData);

      // 2. Pegue o grupo REAL que o backend retornou (com o ID do Prisma)
      const createdGroupFromAPI = response.data.group;

      // 3. Adicione o grupo REAL ao seu estado
      setGroups(prev => [createdGroupFromAPI, ...prev]);

      // --- FIM DA CORREÇÃO ---

      setShowCreateGroup(false);
      setNewGroup({ name: '', description: '', category: '', isPrivate: false, tags: [] });
      setSelectedTags([]);
      toast.success('Grupo criado com sucesso! 🎉');

    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      // Isso vai mostrar o erro do Zod (Ex: "Categoria é obrigatória")
      toast.error(`Erro ao criar grupo: ${(error instanceof Error && error.message) || 'Tente novamente.'}`);
    }
  };

  const handleJoinGroup = (groupId: string) => {
    setGroups(prev => prev.map(group =>
      group.id === groupId
        ? { ...group, isJoined: !group.isJoined, memberCount: group.isJoined ? group.memberCount - 1 : group.memberCount + 1 }
        : group
    ));

    const group = groups.find(g => g.id === groupId);
    if (group) {
      toast.success(group.isJoined ? 'Você saiu do grupo' : 'Você entrou no grupo! 🎉');
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else if (selectedTags.length < 5) {
      setSelectedTags(prev => [...prev, tag]);
    } else {
      toast.error('Máximo de 5 tags permitidas');
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) {
      toast.error('Escreva algo para compartilhar!');
      return;
    }

    // Otimista: criar placeholder temporário
    const tempId = `temp-${Date.now()}`;
    const optimisticPost: Post = {
      id: tempId,
      content: newPost.content,
      user: {
        id: user?.id || 'temp-user',
        name: user?.name || 'Você',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        verified: false
      },
      tags: selectedTags,
      timestamp: new Date().toISOString(),
      likes: 0,
      shares: 0,
      comments: 0,
      liked: false
    };

    setPosts(prev => [optimisticPost, ...prev]);
    setNewPost({ content: '', tags: [] });
    setSelectedTags([]);

    try {
      const res = await communityApi.createPost(optimisticPost.content, optimisticPost.tags || []);
      const serverPost = res?.data?.post;
      if (serverPost && serverPost.id) {
        setPosts(prev => prev.map(p => p.id === tempId ? serverPost : p));
      } else {
        // se backend retornou sem post, apenas manter o otimista e alertar
        toast.success('Post compartilhado (modo offline)');
      }
    } catch (error) {
      // Reverter post otimista
      setPosts(prev => prev.filter(p => p.id !== tempId));
      console.error('Erro ao criar post:', error);
      toast.error('Erro ao compartilhar o post');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-text-primary">Comunidade</h1>
        <p className="text-text-secondary">Conecte-se com outros estudantes e compartilhe conhecimento</p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar posts, grupos, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'feed'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'groups'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Grupos
            </button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {activeTab === 'feed' ? (
        <div className="space-y-4">
          {/* Create Post Form */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                  alt="Seu avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <textarea
                    placeholder="O que você gostaria de compartilhar com a comunidade?"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Tags */}
              {newPost.content.trim() && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-text-secondary">Adicionar tags (opcional)</h4>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedTags.includes(tag)
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {newPost.content.trim() && (
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => {
                      setNewPost({ content: '', tags: [] });
                      setSelectedTags([]);
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreatePost}
                    className="btn-primary px-4 py-2"
                  >
                    Compartilhar
                  </button>
                </div>
              )}
            </div>
          </motion.div>
          {filteredPosts.length === 0 ? (
            <motion.div
              className="card text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Hash className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Nenhum post encontrado
              </h3>
              <p className="text-text-secondary mb-4">
                Seja o primeiro a compartilhar algo na comunidade!
              </p>
              <button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Criar Post
              </button>
            </motion.div>
          ) : (
            filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {/* CORRIGIDO: Adicionado '?.' e fallback '?' */}
                      {post.user?.name?.charAt(0) || '?'} {/* <--- Correto */}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {/* CORRIGIDO: Adicionado '?.' e fallback 'Usuário Anônimo' */}
                      <h4 className="font-semibold text-text-primary">{post.user?.name || 'Usuário Anônimo'}</h4> {/* <--- Correto */}

                      {/* CORRIGIDO: Adicionado '?.' */}
                      {post.user?.verified &&
                        <Star className="w-4 h-4 text-blue-500" />
                      }
                      <span className="text-sm text-text-secondary">
                        {new Date(post.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-text-primary mb-3">{post.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-text-secondary">
                      <button className="flex items-center space-x-1 hover:text-primary">
                        <Star className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-primary">
                        <Hash className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header dos Grupos */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Grupos de Estudo</h2>
              <p className="text-text-secondary">Encontre ou crie grupos para estudar junto</p>
            </div>
            <motion.button
              onClick={() => setShowCreateGroup(true)}
              className="btn-primary flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              <span>Criar Grupo</span>
            </motion.button>
          </div>

          {/* Modal de Criação de Grupo */}
          <AnimatePresence>
            {showCreateGroup && (
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-text-primary">Criar Novo Grupo</h3>
                    <button
                      onClick={() => setShowCreateGroup(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Nome do Grupo */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Nome do Grupo *
                      </label>
                      <input
                        type="text"
                        value={newGroup.name}
                        onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                        className="input-field w-full"
                        placeholder="Ex: Matemática Avançada"
                        maxLength={50}
                      />
                    </div>

                    {/* Descrição */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Descrição *
                      </label>
                      <textarea
                        value={newGroup.description}
                        onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                        className="input-field w-full h-24 resize-none"
                        placeholder="Descreva o propósito e objetivos do grupo..."
                        maxLength={200}
                      />
                      <p className="text-xs text-text-secondary mt-1">
                        {newGroup.description.length}/200 caracteres
                      </p>
                    </div>

                    {/* Categoria */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Categoria *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {categories.map((category) => {
                          const IconComponent = category.icon;
                          return (
                            <button
                              key={category.id}
                              onClick={() => setNewGroup(prev => ({ ...prev, category: category.id }))}
                              className={`p-3 rounded-lg border-2 transition-all ${newGroup.category === category.id
                                ? 'border-primary bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                              <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                                <IconComponent className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-medium text-text-primary">{category.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Tags (máximo 5)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {popularTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1 rounded-full text-sm transition-all ${selectedTags.includes(tag)
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      {selectedTags.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-text-secondary mb-1">Tags selecionadas:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedTags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-primary-100 text-primary text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Privacidade */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        checked={newGroup.isPrivate}
                        onChange={(e) => setNewGroup(prev => ({ ...prev, isPrivate: e.target.checked }))}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <label htmlFor="isPrivate" className="text-sm text-text-primary">
                        Grupo privado (apenas membros convidados podem entrar)
                      </label>
                    </div>

                    {/* Botões */}
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={() => setShowCreateGroup(false)}
                        className="flex-1 btn-outline"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleCreateGroup}
                        className="flex-1 btn-primary"
                      >
                        Criar Grupo
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lista de Grupos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.length === 0 ? (
              <motion.div
                className="col-span-full card text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Nenhum grupo encontrado
                </h3>
                <p className="text-text-secondary mb-4">
                  Crie um novo grupo para começar uma discussão!
                </p>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Grupo
                </button>
              </motion.div>
            ) : (
              filteredGroups.map((group) => {
                const category = categories.find(c => c.id === group.category);
                const IconComponent = category?.icon || Hash;

                return (
                  <motion.div
                    key={group.id}
                    className="card hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 ${category?.color || 'bg-gray-500'} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary">{group.name}</h3>
                          <p className="text-sm text-text-secondary">{category?.name || 'Outros'}</p>
                        </div>
                      </div>
                      {group.isPrivate && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Settings className="w-3 h-3 mr-1" />
                          Privado
                        </div>
                      )}
                    </div>

                    <p className="text-text-secondary text-sm mb-4 line-clamp-2">{group.description}</p>

                    {group.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {group.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                        {group.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{group.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {group.memberCount}
                        </span>
                        <span className="flex items-center">
                          <Hash className="w-4 h-4 mr-1" />
                          {group.postCount}
                        </span>
                      </div>
                      {group.isOwner && (
                        <span className="text-xs bg-primary-100 text-primary px-2 py-1 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${group.isJoined
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-primary text-white hover:bg-primary-600'
                          }`}
                      >
                        {group.isJoined ? 'Sair do Grupo' : 'Entrar no Grupo'}
                      </button>

                      {group.isJoined && (
                        <button
                          onClick={() => setSelectedGroupForChat(group)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Chat</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Group Chat Modal */}
      {selectedGroupForChat && (
        <GroupChat
          groupId={selectedGroupForChat.id}
          groupName={selectedGroupForChat.name}
          isOpen={!!selectedGroupForChat}
          onClose={() => setSelectedGroupForChat(null)}
        />
      )}
    </div>
  );
}