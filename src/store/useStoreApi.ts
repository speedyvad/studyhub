import { create } from 'zustand';
import { api } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  points: number;
  studyHours: number;
  level: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  subject: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  dueDate?: Date;
}

export interface PomodoroSession {
  id: string;
  duration: number; // em minutos
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  likes: number;
  comments: number;
  timestamp: Date;
  liked: boolean;
}

interface StudyHubStore {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // Tasks
  tasks: Task[];
  tasksLoading: boolean;

  // Pomodoro
  currentSession: PomodoroSession | null;
  completedSessions: PomodoroSession[];
  pomodoroLoading: boolean;

  // Achievements
  achievements: Achievement[];
  achievementsLoading: boolean;

  // Community
  posts: Post[];
  postsLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;

  // Tasks
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;

  // Pomodoro
  fetchSessions: () => Promise<void>;
  startPomodoro: (duration: number) => Promise<void>;
  completePomodoro: (sessionId: string) => Promise<void>;
  getStats: () => Promise<any>;

  // Achievements
  fetchAchievements: () => Promise<void>;
  checkAchievements: () => Promise<void>;

  // Community
  fetchPosts: (page?: number, limit?: number) => Promise<void>;
  createPost: (content: string) => Promise<void>;
  likePost: (id: string) => Promise<void>;
  createComment: (postId: string, content: string) => Promise<void>;
}

export const useStore = create<StudyHubStore>((set, get) => ({
  // Estado inicial
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  tasks: [],
  tasksLoading: false,

  currentSession: null,
  completedSessions: [],
  pomodoroLoading: false,

  achievements: [],
  achievementsLoading: false,

  posts: [],
  postsLoading: false,

  // Autenticação
  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.login(email, password);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        set({
          user: response.data.user,
          isAuthenticated: true,
          loading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao fazer login',
        loading: false,
      });
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.register(name, email, password);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        set({
          user: response.data.user,
          isAuthenticated: true,
          loading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao criar conta',
        loading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      isAuthenticated: false,
      tasks: [],
      completedSessions: [],
      achievements: [],
      posts: [],
      error: null,
    });
  },

  clearError: () => set({ error: null }),

  // Tarefas
  fetchTasks: async () => {
    set({ tasksLoading: true });
    try {
      const response = await api.getTasks();
      if (response.success) {
        set({ tasks: response.data.tasks, tasksLoading: false });
      }
    } catch (error: any) {
      set({ tasksLoading: false, error: error.message });
    }
  },

  addTask: async (taskData) => {
    try {
      const response = await api.createTask(taskData);
      if (response.success) {
        set((state) => ({
          tasks: [response.data.task, ...state.tasks],
        }));
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateTask: async (id: string, updates) => {
    try {
      const response = await api.updateTask(id, updates);
      if (response.success) {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteTask: async (id: string) => {
    try {
      await api.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  completeTask: async (id: string) => {
    try {
      const response = await api.completeTask(id);
      if (response.success) {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: true } : task
          ),
        }));
        // Atualizar pontos do usuário
        if (response.data.pointsEarned) {
          set((state) => ({
            user: state.user ? {
              ...state.user,
              points: state.user.points + response.data.pointsEarned
            } : null
          }));
        }
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  // Pomodoro
  fetchSessions: async () => {
    set({ pomodoroLoading: true });
    try {
      const response = await api.getSessions();
      if (response.success) {
        set({ completedSessions: response.data.sessions, pomodoroLoading: false });
      }
    } catch (error: any) {
      set({ pomodoroLoading: false, error: error.message });
    }
  },

  startPomodoro: async (duration: number) => {
    try {
      const response = await api.createSession(duration);
      if (response.success) {
        set({ currentSession: response.data.session });
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  completePomodoro: async (sessionId: string) => {
    try {
      const response = await api.completeSession(sessionId);
      if (response.success) {
        set((state) => ({
          currentSession: null,
          completedSessions: [response.data.session, ...state.completedSessions],
        }));
        // Atualizar pontos e horas do usuário
        if (response.data.pointsEarned && response.data.hoursEarned) {
          set((state) => ({
            user: state.user ? {
              ...state.user,
              points: state.user.points + response.data.pointsEarned,
              studyHours: state.user.studyHours + response.data.hoursEarned
            } : null
          }));
        }
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await api.getStats();
      return response.data;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  // Conquistas
  fetchAchievements: async () => {
    set({ achievementsLoading: true });
    try {
      const response = await api.getAchievements();
      if (response.success) {
        set({ achievements: response.data.achievements, achievementsLoading: false });
      }
    } catch (error: any) {
      set({ achievementsLoading: false, error: error.message });
    }
  },

  checkAchievements: async () => {
    try {
      const response = await api.checkAchievements();
      if (response.success && response.data.newAchievements.length > 0) {
        // Atualizar conquistas
        set((state) => ({
          achievements: state.achievements.map((achievement) => {
            const newAchievement = response.data.newAchievements.find(
              (na: any) => na.id === achievement.id
            );
            return newAchievement ? { ...achievement, unlocked: true } : achievement;
          }),
        }));
      }
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // Comunidade
  fetchPosts: async (page = 1, limit = 20) => {
    set({ postsLoading: true });
    try {
      const response = await api.getPosts(page, limit);
      if (response.success) {
        set({ posts: response.data.posts, postsLoading: false });
      }
    } catch (error: any) {
      set({ postsLoading: false, error: error.message });
    }
  },

  createPost: async (content: string) => {
    try {
      const response = await api.createPost(content);
      if (response.success) {
        set((state) => ({
          posts: [response.data.post, ...state.posts],
        }));
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  likePost: async (id: string) => {
    try {
      const response = await api.likePost(id);
      if (response.success) {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === id
              ? {
                  ...post,
                  liked: response.data.liked,
                  likes: response.data.liked
                    ? post.likes + 1
                    : post.likes - 1,
                }
              : post
          ),
        }));
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  createComment: async (postId: string, content: string) => {
    try {
      const response = await api.createComment(postId, content);
      if (response.success) {
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId
              ? { ...post, comments: post.comments + 1 }
              : post
          ),
        }));
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));


