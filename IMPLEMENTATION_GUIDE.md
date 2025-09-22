# 🚀 Guia de Implementação - Banco de Dados StudyHub

## 📋 Passo a Passo para Implementar

### 1. Configuração Inicial (SQLite + Prisma)

```bash
# Instalar dependências
npm install prisma @prisma/client
npm install -D prisma

# Inicializar Prisma
npx prisma init --datasource-provider sqlite
```

### 2. Configurar Schema Prisma

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id                String   @id @default(cuid())
  name              String
  email             String   @unique
  passwordHash      String
  avatarUrl         String?
  bio               String?
  points            Int      @default(0)
  studyHours        Float    @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relacionamentos
  favoriteSubjects  UserFavoriteSubject[]
  tasks             Task[]
  pomodoroSessions  PomodoroSession[]
  achievements      UserAchievement[]
  posts             Post[]
  postLikes         PostLike[]
  comments          Comment[]
  
  @@map("users")
}

model UserFavoriteSubject {
  id        String   @id @default(cuid())
  userId    String
  subject   String
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("user_favorite_subjects")
}

model Task {
  id          String   @id @default(cuid())
  userId      String
  title       String
  description String?
  subject     String
  completed   Boolean  @default(false)
  priority    Priority @default(MEDIUM)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("tasks")
}

model PomodoroSession {
  id          String    @id @default(cuid())
  userId      String
  duration    Int       // em minutos
  completed   Boolean   @default(false)
  startedAt   DateTime  @default(now())
  completedAt DateTime?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("pomodoro_sessions")
}

model Achievement {
  id          String   @id @default(cuid())
  title       String
  description String
  icon        String
  points      Int
  createdAt   DateTime @default(now())
  
  users UserAchievement[]
  
  @@map("achievements")
}

model UserAchievement {
  id            String      @id @default(cuid())
  userId        String
  achievementId String
  unlockedAt    DateTime    @default(now())
  
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)
  
  @@unique([userId, achievementId])
  @@map("user_achievements")
}

model Post {
  id            String   @id @default(cuid())
  userId        String
  content       String
  likesCount    Int      @default(0)
  commentsCount Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user     User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  likes    PostLike[]
  comments Comment[]
  
  @@map("posts")
}

model PostLike {
  id        String   @id @default(cuid())
  userId    String
  postId    String
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  @@unique([userId, postId])
  @@map("post_likes")
}

model Comment {
  id        String   @id @default(cuid())
  userId    String
  postId    String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  @@map("comments")
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}
```

### 3. Configurar Cliente Prisma

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 4. Criar API Routes

```typescript
// src/pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, password } = req.body

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' })
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas' })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatarUrl,
        bio: user.bio,
        points: user.points,
        studyHours: user.studyHours
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Erro interno do servidor' })
  }
}

// src/pages/api/tasks/index.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getUserIdFromToken } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getUserIdFromToken(req)
  
  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado' })
  }

  if (req.method === 'GET') {
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
    res.json(tasks)
  }

  if (req.method === 'POST') {
    const { title, description, subject, priority } = req.body
    
    const task = await prisma.task.create({
      data: {
        title,
        description,
        subject,
        priority,
        userId
      }
    })
    
    res.json(task)
  }
}

// src/pages/api/tasks/[id].ts
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getUserIdFromToken } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getUserIdFromToken(req)
  
  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado' })
  }

  const { id } = req.query

  if (req.method === 'PUT') {
    const { title, description, subject, priority, completed } = req.body
    
    const task = await prisma.task.update({
      where: { 
        id: id as string,
        userId // Garantir que o usuário só pode editar suas próprias tarefas
      },
      data: {
        title,
        description,
        subject,
        priority,
        completed
      }
    })
    
    res.json(task)
  }

  if (req.method === 'DELETE') {
    await prisma.task.delete({
      where: { 
        id: id as string,
        userId
      }
    })
    
    res.json({ message: 'Tarefa deletada com sucesso' })
  }
}
```

### 5. Utilitários de Autenticação

```typescript
// src/lib/auth.ts
import jwt from 'jsonwebtoken'
import { NextApiRequest } from 'next'

export async function getUserIdFromToken(req: NextApiRequest): Promise<string | null> {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) return null
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    return decoded.userId
  } catch (error) {
    return null
  }
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )
}
```

### 6. Migrar Store Zustand para usar API

```typescript
// src/store/useStore.ts
import { create } from 'zustand'
import { api } from '../lib/api'

interface StudyHubStore {
  // Auth
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<void>

  // Tasks
  tasks: Task[]
  loading: boolean
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  fetchTasks: () => Promise<void>
}

export const useStore = create<StudyHubStore>((set, get) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      set({ user, isAuthenticated: true })
    } catch (error) {
      throw new Error('Erro ao fazer login')
    }
  },
  
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, isAuthenticated: false, tasks: [] })
  },
  
  register: async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { name, email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      set({ user, isAuthenticated: true })
    } catch (error) {
      throw new Error('Erro ao criar conta')
    }
  },

  // Tasks
  tasks: [],
  loading: false,
  
  fetchTasks: async () => {
    set({ loading: true })
    try {
      const response = await api.get('/tasks')
      set({ tasks: response.data })
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
    } finally {
      set({ loading: false })
    }
  },
  
  addTask: async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData)
      const newTask = response.data
      
      set((state) => ({ tasks: [newTask, ...state.tasks] }))
    } catch (error) {
      throw new Error('Erro ao criar tarefa')
    }
  },
  
  updateTask: async (id: string, updates: Partial<Task>) => {
    try {
      const response = await api.put(`/tasks/${id}`, updates)
      const updatedTask = response.data
      
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? updatedTask : task
        )
      }))
    } catch (error) {
      throw new Error('Erro ao atualizar tarefa')
    }
  },
  
  deleteTask: async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`)
      
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id)
      }))
    } catch (error) {
      throw new Error('Erro ao deletar tarefa')
    }
  }
}))
```

### 7. Configurar API Client

```typescript
// src/lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export { api }
```

### 8. Executar Migrações

```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma db push

# (Opcional) Visualizar banco
npx prisma studio
```

### 9. Seed do Banco (Dados Iniciais)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Criar conquistas padrão
  const achievements = await prisma.achievement.createMany({
    data: [
      {
        title: 'Primeiro Pomodoro',
        description: 'Complete seu primeiro ciclo de estudo',
        icon: '🎯',
        points: 50
      },
      {
        title: 'Maratonista',
        description: 'Estude por 4 horas seguidas',
        icon: '🏃‍♂️',
        points: 200
      },
      {
        title: 'Social',
        description: 'Faça 10 posts na comunidade',
        icon: '💬',
        points: 100
      }
    ]
  })

  console.log('Seed executado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

```json
// package.json
{
  "scripts": {
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

## 🎯 Próximos Passos

1. **Implementar autenticação** completa
2. **Adicionar validação** com Zod
3. **Implementar testes** automatizados
4. **Configurar deploy** com banco
5. **Adicionar monitoramento**
6. **Implementar cache** (Redis)
7. **Migrar para PostgreSQL** quando necessário

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev
npx prisma studio

# Banco de dados
npx prisma db push
npx prisma generate
npx prisma db seed

# Deploy
npm run build
npm run start
```

---

**💡 Dica**: Comece implementando apenas as funcionalidades essenciais (usuários, tarefas, pomodoro) e vá adicionando as outras conforme a necessidade!
