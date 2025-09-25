import type { Task, TaskStats, CreateTaskData, UpdateTaskData } from '../types/task';

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

// API de Tarefas
export const tasksApi = {
  // Listar todas as tarefas
  async getTasks(filters?: {
    completed?: boolean;
    subject?: string;
    priority?: string;
  }): Promise<{ success: boolean; data: { tasks: Task[]; total: number } }> {
    const queryParams = new URLSearchParams();
    if (filters?.completed !== undefined) queryParams.append('completed', filters.completed.toString());
    if (filters?.subject) queryParams.append('subject', filters.subject);
    if (filters?.priority) queryParams.append('priority', filters.priority);

    const url = `${API_BASE_URL}/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return authenticatedFetch(url);
  },

  // Criar nova tarefa
  async createTask(taskData: CreateTaskData): Promise<{ success: boolean; message: string; data: { task: Task } }> {
    return authenticatedFetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  // Atualizar tarefa
  async updateTask(taskId: string, taskData: UpdateTaskData): Promise<{ success: boolean; message: string; data: { task: Task } }> {
    return authenticatedFetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  // Deletar tarefa
  async deleteTask(taskId: string): Promise<{ success: boolean; message: string }> {
    return authenticatedFetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  // Obter estatísticas
  async getStats(): Promise<{ success: boolean; data: TaskStats }> {
    return authenticatedFetch(`${API_BASE_URL}/tasks/stats`);
  },

  // Marcar tarefa como concluída
  async completeTask(taskId: string): Promise<{ success: boolean; message: string; data: { task: Task } }> {
    return this.updateTask(taskId, { completed: true });
  },

  // Marcar tarefa como pendente
  async uncompleteTask(taskId: string): Promise<{ success: boolean; message: string; data: { task: Task } }> {
    return this.updateTask(taskId, { completed: false });
  },
};

export default tasksApi;
