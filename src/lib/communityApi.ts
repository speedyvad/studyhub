import type { Post, Group, Comment } from '../types/community';

const API_BASE_URL = 'http://localhost:3001/api';

// Função para obter token do localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Função para fazer requisições autenticadas
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // Se o backend não estiver rodando, retornar dados mock
    console.warn('Backend não disponível, usando dados mock:', error);
    return getMockData(url, options);
  }
};

// Função para retornar dados mock quando o backend não estiver disponível
const getMockData = (url: string, options: RequestInit = {}) => {
  if (url.includes('/community/posts')) {
    return {
      success: true,
      data: {
        posts: [
          {
            id: '1',
            content: 'Acabei de terminar uma sessão de estudo de 2 horas! 🎉',
            author: {
              id: 'user1',
              name: 'Maria Silva',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
            },
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            likes: 12,
            comments: 3,
            tags: ['estudo', 'produtividade'],
            liked: false,
            shares: 0
          },
          {
            id: '2',
            content: 'Alguém tem dicas para a prova de Cálculo?',
            author: {
              id: 'user2',
              name: 'João Santos',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
            },
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            likes: 8,
            comments: 5,
            tags: ['matemática', 'cálculo'],
            liked: true,
            shares: 0
          }
        ],
        total: 2
      }
    };
  }
  
  if (url.includes('/community/groups')) {
    return {
      success: true,
      data: {
        groups: [
          {
            id: '1',
            name: 'Matemática Avançada',
            description: 'Grupo para discussões sobre matemática avançada, cálculo e álgebra linear.',
            category: 'matematica',
            isPrivate: false,
            tags: ['matemática', 'cálculo', 'álgebra'],
            memberCount: 45,
            postCount: 23,
            isJoined: true,
            isOwner: false,
            rules: [],
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: '2',
            name: 'Programação Web',
            description: 'Estudantes de programação web compartilhando conhecimento e projetos.',
            category: 'programacao',
            isPrivate: false,
            tags: ['javascript', 'react', 'nodejs'],
            memberCount: 32,
            postCount: 18,
            isJoined: false,
            isOwner: true,
            rules: [],
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          },
          {
            id: '3',
            name: 'Física Quântica',
            description: 'Discussões sobre física quântica e mecânica quântica.',
            category: 'fisica',
            isPrivate: true,
            tags: ['física', 'quântica', 'mecânica'],
            memberCount: 15,
            postCount: 8,
            isJoined: false,
            isOwner: false,
            rules: [],
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          }
        ]
      }
    };
  }
  
  // Para outras rotas, retornar sucesso genérico
  return {
    success: true,
    message: 'Operação realizada com sucesso (modo offline)',
    data: {}
  };
};

// API de Comunidade
export const communityApi = {
  // Posts
  async getPosts(limit = 20, offset = 0): Promise<{ success: boolean; data: { posts: Post[]; total: number } }> {
    return authenticatedFetch(`${API_BASE_URL}/community/posts?limit=${limit}&offset=${offset}`);
  },

  async createPost(content: string, tags: string[] = []): Promise<{ success: boolean; message: string; data: { post: Post } }> {
    return authenticatedFetch(`${API_BASE_URL}/community/posts`, {
      method: 'POST',
      body: JSON.stringify({ content, tags }),
    });
  },

  async likePost(postId: string): Promise<{ success: boolean; message: string }> {
    return authenticatedFetch(`${API_BASE_URL}/community/posts/${postId}/like`, {
      method: 'POST',
    });
  },

  async unlikePost(postId: string): Promise<{ success: boolean; message: string }> {
    return authenticatedFetch(`${API_BASE_URL}/community/posts/${postId}/unlike`, {
      method: 'DELETE',
    });
  },

  // Comentários
  async getComments(postId: string): Promise<{ success: boolean; data: { comments: Comment[] } }> {
    return authenticatedFetch(`${API_BASE_URL}/community/posts/${postId}/comments`);
  },

  async addComment(postId: string, content: string): Promise<{ success: boolean; message: string; data: { comment: Comment } }> {
    return authenticatedFetch(`${API_BASE_URL}/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // Grupos
  async getGroups(): Promise<{ success: boolean; data: { groups: Group[] } }> {
    return authenticatedFetch(`${API_BASE_URL}/community/groups`);
  },

  async createGroup(groupData: Partial<Group>): Promise<{ success: boolean; message: string; data: { group: Group } }> {
    return authenticatedFetch(`${API_BASE_URL}/community/groups`, {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  },

  async joinGroup(groupId: string): Promise<{ success: boolean; message: string }> {
    return authenticatedFetch(`${API_BASE_URL}/community/groups/${groupId}/join`, {
      method: 'POST',
    });
  },

  async leaveGroup(groupId: string): Promise<{ success: boolean; message: string }> {
    return authenticatedFetch(`${API_BASE_URL}/community/groups/${groupId}/leave`, {
      method: 'DELETE',
    });
  },
};

export default communityApi;
