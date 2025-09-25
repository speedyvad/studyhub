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
