// Cliente API para comunicação com o backend
const API_BASE_URL = 'http://localhost:3001/api'

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Adicionar token se existir
    const token = localStorage.getItem('token')
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição')
      }

      return data
    } catch (error) {
      console.error('Erro na API:', error)
      throw error
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Métodos específicos da API
  async healthCheck() {
    return this.get('/health')
  }

  async test() {
    return this.get('/test')
  }

  // Autenticação
  async login(email: string, password: string) {
    return this.post('/auth/login', { email, password })
  }

  async register(name: string, email: string, password: string) {
    return this.post('/auth/register', { name, email, password })
  }

  async getProfile() {
    return this.get('/auth/profile')
  }

  // Tarefas
  async getTasks() {
    return this.get('/tasks')
  }

  async createTask(task: any) {
    return this.post('/tasks', task)
  }

  async updateTask(id: string, task: any) {
    return this.put(`/tasks/${id}`, task)
  }

  async deleteTask(id: string) {
    return this.delete(`/tasks/${id}`)
  }

  async completeTask(id: string) {
    return this.post(`/tasks/${id}/complete`)
  }

  // Pomodoro
  async getSessions() {
    return this.get('/pomodoro')
  }

  async createSession(duration: number) {
    return this.post('/pomodoro', { duration })
  }

  async completeSession(id: string) {
    return this.post(`/pomodoro/${id}/complete`)
  }

  async getStats() {
    return this.get('/pomodoro/stats')
  }

  // Conquistas
  async getAchievements() {
    return this.get('/achievements')
  }

  async getUserAchievements() {
    return this.get('/achievements/user')
  }

  async checkAchievements() {
    return this.post('/achievements/check')
  }

  async getLeaderboard() {
    return this.get('/achievements/leaderboard')
  }

  // Comunidade
  async getPosts(page = 1, limit = 20) {
    return this.get(`/community?page=${page}&limit=${limit}`)
  }

  async createPost(content: string) {
    return this.post('/community', { content })
  }

  async likePost(id: string) {
    return this.post(`/community/${id}/like`)
  }

  async createComment(postId: string, content: string) {
    return this.post(`/community/${postId}/comments`, { content })
  }
}

// Instância global do cliente API
export const api = new ApiClient(API_BASE_URL)

// Hook para usar a API no React
export const useApi = () => {
  return {
    // Health check
    healthCheck: () => api.healthCheck(),
    test: () => api.test(),

    // Autenticação
    login: (email: string, password: string) => api.login(email, password),
    register: (name: string, email: string, password: string) => api.register(name, email, password),
    getProfile: () => api.getProfile(),

    // Tarefas
    getTasks: () => api.getTasks(),
    createTask: (task: any) => api.createTask(task),
    updateTask: (id: string, task: any) => api.updateTask(id, task),
    deleteTask: (id: string) => api.deleteTask(id),
    completeTask: (id: string) => api.completeTask(id),

    // Pomodoro
    getSessions: () => api.getSessions(),
    createSession: (duration: number) => api.createSession(duration),
    completeSession: (id: string) => api.completeSession(id),
    getStats: () => api.getStats(),

    // Conquistas
    getAchievements: () => api.getAchievements(),
    getUserAchievements: () => api.getUserAchievements(),
    checkAchievements: () => api.checkAchievements(),
    getLeaderboard: () => api.getLeaderboard(),

    // Comunidade
    getPosts: (page?: number, limit?: number) => api.getPosts(page, limit),
    createPost: (content: string) => api.createPost(content),
    likePost: (id: string) => api.likePost(id),
    createComment: (postId: string, content: string) => api.createComment(postId, content),
  }
}

export default api


