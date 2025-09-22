import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  points: number;
  studyHours: number;
  favoriteSubjects: string[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  subject: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface PomodoroSession {
  id: string;
  duration: number; // em minutos
  completed: boolean;
  timestamp: Date;
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
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (name: string, email: string, password: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;

  // Pomodoro
  currentSession: PomodoroSession | null;
  completedSessions: PomodoroSession[];
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  completePomodoro: () => void;

  // Achievements
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;

  // Community
  posts: Post[];
  addPost: (content: string) => void;
  likePost: (id: string) => void;

  // Stats
  getStudyStats: () => {
    totalHours: number;
    totalSessions: number;
    weeklyHours: number;
    streak: number;
  };
}

const mockUser: User = {
  id: '1',
  name: 'João Silva',
  email: 'joao@email.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  bio: 'Estudante de Engenharia apaixonado por tecnologia',
  points: 1250,
  studyHours: 45.5,
  favoriteSubjects: ['Matemática', 'Física', 'Programação']
};

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Resolver exercícios de Cálculo',
    description: 'Capítulo 5 - Integrais',
    subject: 'Matemática',
    completed: false,
    priority: 'high',
    createdAt: new Date()
  },
  {
    id: '2',
    title: 'Estudar React Hooks',
    description: 'useState, useEffect, useContext',
    subject: 'Programação',
    completed: true,
    priority: 'medium',
    createdAt: new Date()
  },
  {
    id: '3',
    title: 'Revisar Física Quântica',
    subject: 'Física',
    completed: false,
    priority: 'low',
    createdAt: new Date()
  }
];

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Primeiro Pomodoro',
    description: 'Complete seu primeiro ciclo de estudo',
    icon: '🎯',
    points: 50,
    unlocked: true,
    unlockedAt: new Date()
  },
  {
    id: '2',
    title: 'Maratonista',
    description: 'Estude por 4 horas seguidas',
    icon: '🏃‍♂️',
    points: 200,
    unlocked: false
  },
  {
    id: '3',
    title: 'Social',
    description: 'Faça 10 posts na comunidade',
    icon: '💬',
    points: 100,
    unlocked: false
  }
];

const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@email.com',
      points: 980,
      studyHours: 32.5,
      favoriteSubjects: ['Biologia', 'Química']
    },
    content: 'Acabei de completar 2 horas de estudo de Biologia! 🧬 Quem mais está estudando para a prova?',
    likes: 12,
    comments: 5,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    liked: false
  },
  {
    id: '2',
    author: {
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro@email.com',
      points: 1500,
      studyHours: 58.2,
      favoriteSubjects: ['História', 'Geografia']
    },
    content: 'Dica: Use o método Pomodoro para manter o foco durante os estudos longos! ⏰',
    likes: 8,
    comments: 3,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
    liked: true
  }
];

export const useStore = create<StudyHubStore>((set, get) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  login: (_email: string, _password: string) => {
    // Simulação de login
    set({ user: mockUser, isAuthenticated: true });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
  register: (name: string, _email: string, _password: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email: _email,
      points: 0,
      studyHours: 0,
      favoriteSubjects: []
    };
    set({ user: newUser, isAuthenticated: true });
  },

  // Tasks
  tasks: mockTasks,
  addTask: (task) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },
  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      )
    }));
  },
  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id)
    }));
  },
  toggleTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    }));
  },

  // Pomodoro
  currentSession: null,
  completedSessions: [
    {
      id: '1',
      duration: 25,
      completed: true,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      duration: 25,
      completed: true,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
    }
  ],
  startPomodoro: () => {
    const session: PomodoroSession = {
      id: Date.now().toString(),
      duration: 25,
      completed: false,
      timestamp: new Date()
    };
    set({ currentSession: session });
  },
  pausePomodoro: () => {
    // Implementar lógica de pausa
  },
  resetPomodoro: () => {
    set({ currentSession: null });
  },
  completePomodoro: () => {
    const { currentSession } = get();
    if (currentSession) {
      const completedSession = { ...currentSession, completed: true };
      set((state) => ({
        currentSession: null,
        completedSessions: [...state.completedSessions, completedSession],
        user: state.user ? {
          ...state.user,
          points: state.user.points + 25,
          studyHours: state.user.studyHours + 0.42 // 25 minutos = 0.42 horas
        } : null
      }));
    }
  },

  // Achievements
  achievements: mockAchievements,
  unlockAchievement: (id) => {
    set((state) => ({
      achievements: state.achievements.map((achievement) =>
        achievement.id === id
          ? { ...achievement, unlocked: true, unlockedAt: new Date() }
          : achievement
      )
    }));
  },

  // Community
  posts: mockPosts,
  addPost: (content) => {
    const { user } = get();
    if (!user) return;

    const newPost: Post = {
      id: Date.now().toString(),
      author: user,
      content,
      likes: 0,
      comments: 0,
      timestamp: new Date(),
      liked: false
    };
    set((state) => ({ posts: [newPost, ...state.posts] }));
  },
  likePost: (id) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === id 
          ? { 
              ...post, 
              likes: post.liked ? post.likes - 1 : post.likes + 1,
              liked: !post.liked 
            } 
          : post
      )
    }));
  },

  // Stats
  getStudyStats: () => {
    const { user, completedSessions } = get();
    if (!user) return { totalHours: 0, totalSessions: 0, weeklyHours: 0, streak: 0 };

    const totalSessions = completedSessions.length;
    const totalHours = user.studyHours;
    
    // Calcular horas da semana (simulação)
    const weeklyHours = Math.min(totalHours, 20);
    
    // Calcular streak (simulação)
    const streak = Math.min(totalSessions, 7);

    return { totalHours, totalSessions, weeklyHours, streak };
  }
}));
