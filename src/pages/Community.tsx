import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, TrendingUp, Star, Users, Hash, Bell } from 'lucide-react';
import communityApi from '../lib/communityApi';
import type { Post, Group } from '../types/community';

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'groups'>('feed');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadCommunityData = async () => {
      try {
        setLoading(true);
        const [postsResponse, groupsResponse] = await Promise.all([
          communityApi.getPosts(),
          communityApi.getGroups()
        ]);
        
        setPosts(postsResponse.data.posts || []);
        setGroups(groupsResponse.data.groups || []);
      } catch (error) {
        console.error('Erro ao carregar dados da comunidade:', error);
        // Por enquanto, usar dados mock se a API não estiver disponível
        setPosts([]);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    loadCommunityData();
  }, []);

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'feed' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'groups' 
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
                      {post.author.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-text-primary">{post.author.name}</h4>
                      {post.author.verified && (
                        <Star className="w-4 h-4 text-blue-500" />
                      )}
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
              <button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Criar Grupo
              </button>
            </motion.div>
          ) : (
            filteredGroups.map((group) => (
              <motion.div
                key={group.id}
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{group.name}</h3>
                    <p className="text-sm text-text-secondary">{group.category}</p>
                  </div>
                </div>
                <p className="text-text-secondary text-sm mb-3">{group.description}</p>
                <div className="flex items-center justify-between text-sm text-text-secondary">
                  <span>{group.memberCount} membros</span>
                  <span>{group.postCount} posts</span>
                </div>
                <button className="w-full mt-3 btn-secondary">
                  {group.isJoined ? 'Sair' : 'Entrar'}
                </button>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}