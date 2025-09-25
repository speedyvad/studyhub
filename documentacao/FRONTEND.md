# ⚛️ FRONTEND - STUDYHUB

## 📋 Visão Geral

O frontend do StudyHub é construído com **React + Vite + TypeScript** e oferece uma interface moderna e responsiva para gerenciamento de tarefas, sessões de foco e organização pessoal.

## 🏗️ Estrutura do Frontend

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Layout.tsx      # Layout principal
│   │   ├── TaskForm.tsx    # Formulário de tarefas
│   │   ├── GroupManager.tsx # Gerenciador de grupos
│   │   ├── FileUpload.tsx  # Upload de arquivos
│   │   └── ProfilePhotoUpload.tsx # Upload de foto de perfil
│   ├── pages/              # Páginas da aplicação
│   │   ├── Dashboard.tsx   # Página inicial
│   │   ├── Tasks.tsx      # Página de tarefas
│   │   ├── Profile.tsx     # Página de perfil
│   │   ├── Admin.tsx       # Página de admin
│   │   └── FocusSession.tsx # Sessão de foco
│   ├── lib/                # Serviços e APIs
│   │   ├── api.ts          # Cliente HTTP
│   │   ├── authApi.ts      # API de autenticação
│   │   ├── tasksApi.ts     # API de tarefas
│   │   ├── groupsApi.ts    # API de grupos
│   │   └── uploadApi.ts    # API de upload
│   ├── store/              # Estado global
│   │   └── useStore.ts     # Store Zustand
│   ├── types/              # Tipos TypeScript
│   │   ├── task.ts         # Tipos de tarefas
│   │   ├── group.ts        # Tipos de grupos
│   │   └── api.ts          # Tipos de API
│   ├── hooks/              # Hooks customizados
│   │   └── useLoading.ts   # Hook de loading
│   └── App.tsx             # Componente principal
├── public/                 # Arquivos estáticos
└── package.json           # Dependências
```

## 🎨 Sistema de Design

### **Cores e Tema**
```css
/* Cores principais */
:root {
  --primary: #3b82f6;
  --primary-dark: #1d4ed8;
  --secondary: #64748b;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  
  /* Cores de fundo */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-dark: #1e293b;
  
  /* Cores de texto */
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
}
```

### **Componentes Base**
```typescript
// Botões
.btn-primary {
  @apply bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors;
}

.btn-outline {
  @apply border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors;
}

// Cards
.card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6;
}

// Inputs
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent;
}
```

## 🏪 Estado Global (Zustand)

### **Store Principal (`store/useStore.ts`)**
```typescript
import { create } from 'zustand';
import authApi from '../lib/authApi';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  points: number;
  studyHours: number;
  favoriteSubjects: string[];
}

interface StudyHubStore {
  // Estado
  user: User | null;
  isAuthenticated: boolean;
  
  // Ações de autenticação
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

export const useStore = create<StudyHubStore>((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        set({ 
          user: response.data.user, 
          isAuthenticated: true 
        });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
  
  updateUser: (userData: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null
    }));
  },
  
  register: async (name: string, email: string, password: string) => {
    try {
      const response = await authApi.register(name, email, password);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        set({ 
          user: response.data.user, 
          isAuthenticated: true 
        });
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }
}));
```

## 🔌 Camada de API

### **Cliente HTTP (`lib/api.ts`)**
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### **API de Tarefas (`lib/tasksApi.ts`)**
```typescript
import api from './api';
import type { Task, TaskStats } from '../types/task';

const tasksApi = {
  getTasks: async (): Promise<{ success: boolean; data: { tasks: Task[] } }> => {
    const response = await api.get('/api/tasks');
    return response.data;
  },
  
  createTask: async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data: { task: Task } }> => {
    const response = await api.post('/api/tasks', taskData);
    return response.data;
  },
  
  updateTask: async (id: string, updates: Partial<Task>): Promise<{ success: boolean; data: { task: Task } }> => {
    const response = await api.put(`/api/tasks/${id}`, updates);
    return response.data;
  },
  
  deleteTask: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/api/tasks/${id}`);
    return response.data;
  },
  
  getStats: async (): Promise<{ success: boolean; data: TaskStats }> => {
    const response = await api.get('/api/tasks/stats');
    return response.data;
  }
};

export default tasksApi;
```

## 🎨 Componentes Principais

### **Layout Principal (`components/Layout.tsx`)**
```typescript
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Menu, LogOut, Grid, CheckSquare, Clock, Users, BarChart, User } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useStore();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved) {
      setSidebarCollapsed(JSON.parse(saved));
    }
  }, []);
  
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Grid },
    { name: 'Tarefas', href: '/tasks', icon: CheckSquare },
    { name: 'Sessão de Foco', href: '/pomodoro', icon: Clock },
    { name: 'Comunidade', href: '/community', icon: Users },
    { name: 'Estatísticas', href: '/stats', icon: BarChart },
    { name: 'Perfil', href: '/profile', icon: User },
  ];
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-white dark:bg-gray-800 shadow-lg`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {!sidebarCollapsed && (
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              StudyHub
            </h1>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        {/* User Info */}
        {!sidebarCollapsed && user && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face'}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.points} pontos
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="mt-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                <IconComponent className="w-5 h-5 mr-3" />
                {!sidebarCollapsed && item.name}
              </Link>
            );
          })}
        </nav>
        
        {/* Logout */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {!sidebarCollapsed && 'Sair'}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} transition-all duration-300`}>
        <main className="h-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### **Página de Tarefas (`pages/Tasks.tsx`)**
```typescript
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import tasksApi from '../lib/tasksApi';
import type { Task, TaskStats } from '../types/task';

export default function Tasks() {
  const { isAuthenticated } = useStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  
  const loadTasks = async () => {
    try {
      const [tasksResponse, statsResponse] = await Promise.all([
        tasksApi.getTasks(),
        tasksApi.getStats()
      ]);
      
      if (tasksResponse.success) {
        setTasks(tasksResponse.data.tasks);
      }
      
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();
    }
  }, [isAuthenticated]);
  
  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await tasksApi.createTask(taskData);
      if (response.success) {
        loadTasks(); // Recarregar tarefas
      }
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
    }
  };
  
  const handleToggleTask = async (id: string, completed: boolean) => {
    try {
      const response = await tasksApi.updateTask(id, { completed });
      if (response.success) {
        loadTasks(); // Recarregar tarefas
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };
  
  const handleDeleteTask = async (id: string) => {
    try {
      const response = await tasksApi.deleteTask(id);
      if (response.success) {
        loadTasks(); // Recarregar tarefas
      }
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
    }
  };
  
  // Filtrar tarefas
  const filteredTasks = tasks.filter(task => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'pending' && !task.completed) ||
      (filter === 'completed' && task.completed);
    
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = selectedSubject === 'all' || task.subject === selectedSubject;
    
    return matchesFilter && matchesSearch && matchesSubject;
  });
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Tarefas
        </h1>
        <button
          onClick={() => setShowTaskForm(true)}
          className="btn-primary"
        >
          Nova Tarefa
        </button>
      </div>
      
      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center">
            <h3 className="text-2xl font-bold text-primary">{stats.total}</h3>
            <p className="text-gray-600 dark:text-gray-400">Total</p>
          </div>
          <div className="card text-center">
            <h3 className="text-2xl font-bold text-yellow-600">{stats.pending}</h3>
            <p className="text-gray-600 dark:text-gray-400">Pendentes</p>
          </div>
          <div className="card text-center">
            <h3 className="text-2xl font-bold text-green-600">{stats.completed}</h3>
            <p className="text-gray-600 dark:text-gray-400">Concluídas</p>
          </div>
        </div>
      )}
      
      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['all', 'pending', 'completed'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === filterType
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {filterType === 'all' ? 'Todas' : 
               filterType === 'pending' ? 'Pendentes' : 'Concluídas'}
            </button>
          ))}
        </div>
        
        <input
          type="text"
          placeholder="Buscar tarefas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
        
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="input-field"
        >
          <option value="all">Todas as matérias</option>
          <option value="matemática">Matemática</option>
          <option value="programação">Programação</option>
          <option value="português">Português</option>
        </select>
      </div>
      
      {/* Lista de Tarefas com Animações */}
      <motion.div 
        className={`grid gap-6 ${filter === 'all' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}
        layout
      >
        {/* Tarefas Pendentes */}
        {filter !== 'completed' && (
          <motion.div className="space-y-3" layout>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Tarefas Pendentes
            </h2>
            <AnimatePresence mode="popLayout">
              {filteredTasks.filter(task => !task.completed).map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="card"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                          task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority === 'HIGH' ? 'Alta' :
                           task.priority === 'MEDIUM' ? 'Média' : 'Baixa'}
                        </span>
                        <span className="text-xs text-gray-500">{task.subject}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleTask(task.id, true)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
        
        {/* Tarefas Concluídas */}
        {filter !== 'pending' && (
          <motion.div className="space-y-3" layout>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Tarefas Concluídas
            </h2>
            <AnimatePresence mode="popLayout">
              {filteredTasks.filter(task => task.completed).map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="card opacity-75"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 line-through">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-through">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleTask(task.id, false)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      >
                        ↶
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
```

## 🎨 Animações (Framer Motion)

### **Configuração de Animações**
```typescript
import { motion, AnimatePresence } from 'framer-motion';

// Animações de entrada
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// Animações de layout
const layoutAnimation = {
  layout: true,
  transition: { duration: 0.3, ease: "easeInOut" }
};

// Animações de hover
const hoverAnimation = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
};
```

### **Componente com Animações**
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  whileHover={{ scale: 1.02 }}
  className="card"
>
  {/* Conteúdo */}
</motion.div>
```

## 📱 Responsividade

### **Breakpoints**
```css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### **Grid Responsivo**
```typescript
// Grid que se adapta ao filtro
<motion.div 
  className={`grid gap-6 ${
    filter === 'all' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
  }`}
  layout
>
  {/* Conteúdo */}
</motion.div>
```

## 🔧 Hooks Customizados

### **Hook de Loading (`hooks/useLoading.ts`)**
```typescript
import { useState } from 'react';

export const useLoading = () => {
  const [loading, setLoading] = useState(false);
  
  const withLoading = async (fn: () => Promise<void>) => {
    setLoading(true);
    try {
      await fn();
    } finally {
      setLoading(false);
    }
  };
  
  return { loading, withLoading };
};
```

## 🎯 Tipos TypeScript

### **Tipos de Tarefas (`types/task.ts`)**
```typescript
export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  subject: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  completed: boolean;
  dueDate?: string;
  groupId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  completed: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  groupId?: string;
}
```

### **Tipos de Grupos (`types/group.ts`)**
```typescript
export type GroupColor = 'blue' | 'green' | 'purple' | 'pink' | 'orange' | 'red';
export type GroupIcon = 'folder' | 'book' | 'code' | 'flask' | 'globe' | 'palette';

export interface TaskGroup {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: GroupColor;
  icon: GroupIcon;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  color?: GroupColor;
  icon?: GroupIcon;
}
```

## 🚀 Comandos de Desenvolvimento

### **Desenvolvimento**
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### **Linting e Formatação**
```bash
# Verificar erros
npm run lint

# Corrigir erros automaticamente
npm run lint:fix

# Formatar código
npm run format
```

---

**📚 Continue explorando: [INTEGRACAO.md](./INTEGRACAO.md) e [COMPONENTES.md](./COMPONENTES.md)**
