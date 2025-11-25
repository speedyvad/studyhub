const API_BASE_URL = 'http://localhost:3001/api';

// Interface para dados do usuário
export interface UserData {
  id: string;
  name: string;
  email: string;
  points: number;
  studyHours: number;
  level: number;
  role: string;
  createdAt: string;
  bio?: string;
  favoriteSubjects?: string[];
  avatarUrl?: string;
  avatar?: string; // Manter compatibilidade com frontend que usa 'avatar'
}

// Interface para resposta da API
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: UserData;
    token: string;
  };
}

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

// API de Autenticação
export const authApi = {
  // Login
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro no login');
    }

    return response.json();
  },

  // Registro
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro no registro');
    }

    return response.json();
  },

  // Obter perfil do usuário
  async getProfile(): Promise<{ success: boolean; data: { user: UserData } }> {
    return authenticatedFetch(`${API_BASE_URL}/auth/profile`);
  },

  // Atualizar perfil
  async updateProfile(data: Partial<UserData>): Promise<{ success: boolean; message: string; data: { user: UserData } }> {
    return authenticatedFetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Verificar se o usuário está autenticado
  async checkAuth(): Promise<boolean> {
    try {
      const token = getAuthToken();
      if (!token) return false;
      
      await this.getProfile();
      return true;
    } catch {
      return false;
    }
  }
};

export default authApi;
