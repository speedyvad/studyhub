const API_BASE_URL = 'http://localhost:3001/api';

// Interface para PomodoroSession
export interface PomodoroSession {
  id: string;
  userId: string;
  duration: number; // em minutos
  completed: boolean;
  taskId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroStats {
  totalSessions: number;
  totalMinutes: number;
  totalHours: number;
  todaySessions: number;
  thisWeekSessions: number;
}

export interface StartPomodoroData {
  duration?: number; // padrão 25 minutos
  taskId?: string;
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

// API de Pomodoro
export const pomodoroApi = {
  // Iniciar sessão Pomodoro
  async startSession(data: StartPomodoroData): Promise<{ success: boolean; message: string; data: { session: PomodoroSession } }> {
    return authenticatedFetch(`${API_BASE_URL}/pomodoro/start`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Finalizar sessão Pomodoro
  async completeSession(sessionId: string): Promise<{ success: boolean; message: string; data: { session: PomodoroSession } }> {
    return authenticatedFetch(`${API_BASE_URL}/pomodoro/${sessionId}/complete`, {
      method: 'PUT',
    });
  },

  // Listar sessões do usuário
  async getSessions(limit = 10, offset = 0): Promise<{ success: boolean; data: { sessions: PomodoroSession[]; total: number } }> {
    return authenticatedFetch(`${API_BASE_URL}/pomodoro/sessions?limit=${limit}&offset=${offset}`);
  },

  // Obter estatísticas
  async getStats(): Promise<{ success: boolean; data: PomodoroStats }> {
    return authenticatedFetch(`${API_BASE_URL}/pomodoro/stats`);
  },
};

export default pomodoroApi;
