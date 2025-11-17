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
    // Redirecionar para o login ou mostrar erro
    // Lançar um erro aqui pode ser pego pelo catch e mostrar dados mock
    console.error('Usuário não autenticado, token não encontrado.');
    // Em um app real, você poderia redirecionar para /login
    // window.location.href = '/login';
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
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error('Erro da API:', errorData);
      throw new Error(errorData.message || `Erro ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Falha na requisição. Verifique o backend ou a URL.', error);
    
    throw error;
  }
};

// API de Comunidade
export const communityApi = {
  // Posts
  async getPosts(limit = 20, offset = 0): Promise<{ success: boolean; data: { posts: Post[]; total: number } }> {
    // ⛔️ ERRO: /community/posts
    // ✅ CORRETO: /community (assumindo que em communityRoutes.ts você tem router.get('/', getPosts))
    //    Se em communityRoutes.ts você tiver router.get('/posts', getPosts), então mantenha /community/posts
    //    Com base no seu 404, o correto é /community
    return authenticatedFetch(`${API_BASE_URL}/community?limit=${limit}&offset=${offset}`);
  },

  async createPost(content: string, tags: string[] = []): Promise<{ success: boolean; message: string; data: { post: Post } }> {
    // ✅ CORRETO: /community (assumindo router.post('/', createPost))
    return authenticatedFetch(`${API_BASE_URL}/community`, {
      method: 'POST',
      body: JSON.stringify({ content, tags }),
    });
  },

  async likePost(postId: string): Promise<{ success: boolean; message: string }> {
    // ✅ CORRETO: /community/:id/like (assumindo router.post('/:id/like', likePost))
    return authenticatedFetch(`${API_BASE_URL}/community/${postId}/like`, {
      method: 'POST',
    });
  },

  async unlikePost(postId: string): Promise<{ success: boolean; message: string }> {
    // ✅ CORRETO: /community/:id/unlike (assumindo router.delete('/:id/unlike', unlikePost))
    return authenticatedFetch(`${API_BASE_URL}/community/${postId}/unlike`, {
      method: 'DELETE',
    });
  },

  // Comentários
  async getComments(postId: string): Promise<{ success: boolean; data: { comments: Comment[] } }> {
    // ✅ CORRETO: /community/:id/comments (assumindo router.get('/:id/comments', getComments))
    return authenticatedFetch(`${API_BASE_URL}/community/${postId}/comments`);
  },

  async addComment(postId: string, content: string): Promise<{ success: boolean; message: string; data: { comment: Comment } }> {
    // ✅ CORRETO: /community/:id/comments (assumindo router.post('/:id/comments', addComment))
    return authenticatedFetch(`${API_BASE_URL}/community/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // Grupos
  async getGroups(): Promise<{ success: boolean; data: { groups: Group[] } }> {
    // ⛔️ ERRO: /community/groups
    // ✅ CORRETO: /groups (pois seu app.ts usa /api/groups)
    return authenticatedFetch(`${API_BASE_URL}/groups`);
  },

  async createGroup(groupData: Partial<Group>): Promise<{ success: boolean; message: string; data: { group: Group } }> {
    // ⛔️ ERRO: /community/groups
    // ✅ CORRETO: /groups (pois seu app.ts usa /api/groups)
    return authenticatedFetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  },

  async joinGroup(groupId: string): Promise<{ success: boolean; message: string }> {
    // ⛔️ ERRO: /community/groups/...
    // ✅ CORRETO: /groups/...
    return authenticatedFetch(`${API_BASE_URL}/groups/${groupId}/join`, {
      method: 'POST',
    });
  },

  async leaveGroup(groupId: string): Promise<{ success: boolean; message: string }> {
    // ⛔️ ERRO: /community/groups/...
    // ✅ CORRETO: /groups/...
    return authenticatedFetch(`${API_BASE_URL}/groups/${groupId}/leave`, {
      method: 'DELETE',
    });
  },
};

export default communityApi;