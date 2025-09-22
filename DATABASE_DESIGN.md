# 🗄️ StudyHub - Estrutura do Banco de Dados

## 📋 Visão Geral

Este documento apresenta a evolução do banco de dados do StudyHub, desde uma versão simples até uma estrutura robusta e escalável.

## 🚀 Fase 1: Começando Direto com MySQL (Recomendado)

### Por que ir direto para MySQL?
- ✅ **Escalabilidade**: Milhares de usuários simultâneos
- ✅ **Performance**: Otimizado para produção
- ✅ **Recursos avançados**: Índices, views, stored procedures
- ✅ **Backup automático**: Ferramentas nativas
- ✅ **Ecosystem maduro**: Muitas ferramentas e tutoriais
- ✅ **Deploy moderno**: PlanetScale, Railway, Supabase são fáceis
- ✅ **Evita retrabalho**: Não precisa migrar depois

### Alternativa: SQLite (Para prototipagem rápida)
- ✅ **Simplicidade**: Arquivo único, sem configuração de servidor
- ✅ **Desenvolvimento rápido**: Ideal para prototipagem
- ✅ **Zero configuração**: Funciona out-of-the-box
- ✅ **Portabilidade**: Fácil backup e deploy
- ✅ **Custo zero**: Sem necessidade de servidor de banco
- ❌ **Limitações**: Máximo ~100 usuários simultâneos
- ❌ **Migração futura**: Trabalho extra depois

### Estrutura Inicial (MySQL)

```sql
-- Tabela de Usuários
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  bio TEXT,
  points INT DEFAULT 0,
  study_hours FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Matérias Favoritas
CREATE TABLE user_favorite_subjects (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  subject VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Tarefas
CREATE TABLE tasks (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  subject VARCHAR(50) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Sessões Pomodoro
CREATE TABLE pomodoro_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  duration INT NOT NULL, -- em minutos
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Conquistas
CREATE TABLE achievements (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL,
  points INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Conquistas do Usuário
CREATE TABLE user_achievements (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  achievement_id VARCHAR(36) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE(user_id, achievement_id)
);

-- Tabela de Posts da Comunidade
CREATE TABLE posts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Curtidas
CREATE TABLE post_likes (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  post_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  UNIQUE(user_id, post_id)
);

-- Tabela de Comentários
CREATE TABLE comments (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  post_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
```

## 🚀 Opções de Deploy MySQL

### **1. PlanetScale (Recomendado)**
```bash
# Gratuito até 1GB, sem configuração
# URL: https://planetscale.com
DATABASE_URL="mysql://username:password@host:port/database?sslaccept=strict"
```

**Vantagens:**
- ✅ **Gratuito** até 1GB
- ✅ **Zero configuração** - funciona imediatamente
- ✅ **Escalável** - cresce com seu projeto
- ✅ **Deploy fácil** - integra com Vercel
- ✅ **Backup automático** - não precisa se preocupar

### **2. Railway**
```bash
# $5/mês, fácil deploy
# URL: https://railway.app
DATABASE_URL="mysql://username:password@host:port/database"
```

### **3. Supabase (PostgreSQL)**
```bash
# PostgreSQL (ainda melhor que MySQL)
# URL: https://supabase.com
DATABASE_URL="postgresql://username:password@host:port/database"
```

### **4. Local (Desenvolvimento)**
```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: studyhub
      MYSQL_USER: studyhub
      MYSQL_PASSWORD: studyhub123
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

## 🔧 Fase 2: Otimizações Avançadas (Produção)

### Quando migrar?
- ✅ **Usuários > 1000**: SQLite começa a ter limitações
- ✅ **Concorrência**: Múltiplos usuários simultâneos
- ✅ **Backup**: Necessidade de backup automático
- ✅ **Escalabilidade**: Crescimento do projeto

### Melhorias na Estrutura

```sql
-- Adicionar índices para performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_subject ON tasks(subject);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
CREATE INDEX idx_pomodoro_sessions_started_at ON pomodoro_sessions(started_at);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_user_id ON posts(user_id);

-- Adicionar constraints mais robustas
ALTER TABLE users ADD CONSTRAINT check_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE users ADD CONSTRAINT check_points_positive 
  CHECK (points >= 0);

ALTER TABLE users ADD CONSTRAINT check_study_hours_positive 
  CHECK (study_hours >= 0);

-- Adicionar triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🚀 Fase 3: Funcionalidades Avançadas

### Novas Tabelas para Funcionalidades Extras

```sql
-- Tabela de Grupos de Estudo
CREATE TABLE study_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  created_by TEXT NOT NULL,
  max_members INTEGER DEFAULT 10,
  is_public BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Membros dos Grupos
CREATE TABLE group_members (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT CHECK(role IN ('member', 'admin')) DEFAULT 'member',
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(group_id, user_id)
);

-- Tabela de Notificações
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'achievement', 'group_invite', 'post_like', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  data JSONB, -- Dados extras específicos do tipo
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Configurações do Usuário
CREATE TABLE user_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  theme TEXT CHECK(theme IN ('light', 'dark', 'auto')) DEFAULT 'auto',
  pomodoro_duration INTEGER DEFAULT 25,
  break_duration INTEGER DEFAULT 5,
  long_break_duration INTEGER DEFAULT 15,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Relatórios de Estudo
CREATE TABLE study_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  total_hours REAL DEFAULT 0,
  pomodoro_sessions INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, date)
);
```

## 📊 Fase 4: Analytics e Relatórios

### Tabelas para Analytics Avançados

```sql
-- Tabela de Eventos (para analytics)
CREATE TABLE user_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'login', 'task_completed', 'pomodoro_started', etc.
  event_data JSONB,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Rankings
CREATE TABLE rankings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL, -- 'weekly_points', 'monthly_hours', 'total_tasks', etc.
  position INTEGER NOT NULL,
  value REAL NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Metas do Usuário
CREATE TABLE user_goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'daily_hours', 'weekly_tasks', 'monthly_points', etc.
  target_value REAL NOT NULL,
  current_value REAL DEFAULT 0,
  deadline DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🛠️ Implementação Prática

### 1. Configuração do Prisma

```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // ou "postgresql" na fase 2
  url      = env("DATABASE_URL")
}

model User {
  id                String   @id @default(cuid())
  name              String
  email             String   @unique
  passwordHash      String   @map("password_hash")
  avatarUrl         String?  @map("avatar_url")
  bio               String?
  points            Int      @default(0)
  studyHours        Float    @default(0) @map("study_hours")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  
  // Relacionamentos
  favoriteSubjects  UserFavoriteSubject[]
  tasks             Task[]
  pomodoroSessions  PomodoroSession[]
  achievements      UserAchievement[]
  posts             Post[]
  postLikes         PostLike[]
  comments          Comment[]
  notifications     Notification[]
  settings          UserSettings?
  studyReports      StudyReport[]
  events            UserEvent[]
  rankings          Ranking[]
  goals             UserGoal[]
  
  @@map("users")
}

model Task {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")
  title       String
  description String?
  subject     String
  completed   Boolean  @default(false)
  priority    Priority @default(MEDIUM)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("tasks")
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

// ... outros modelos
```

### 2. API Routes com Prisma

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// src/pages/api/tasks/index.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const tasks = await prisma.task.findMany({
      where: { userId: req.query.userId as string },
      orderBy: { createdAt: 'desc' }
    })
    res.json(tasks)
  }
  
  if (req.method === 'POST') {
    const task = await prisma.task.create({
      data: {
        ...req.body,
        userId: req.body.userId
      }
    })
    res.json(task)
  }
}
```

## 📈 Estratégia de Implementação

### Fase 1: MySQL Direto (Recomendado)
- ✅ **Implementar estrutura básica** com MySQL
- ✅ **Usar Prisma ORM** para type-safety
- ✅ **Deploy com PlanetScale** (gratuito)
- ✅ **Integração com Vercel** (deploy automático)

### Fase 2: Otimizações (1000+ usuários)
- ✅ **Adicionar índices** para performance
- ✅ **Implementar cache** (Redis)
- ✅ **Otimizar queries** complexas
- ✅ **Implementar paginação**

### Fase 3: Escala (10k+ usuários)
- ✅ **Adicionar CDN** para assets
- ✅ **Implementar rate limiting**
- ✅ **Monitoramento avançado**
- ✅ **Backup automático**

### Fase 4: Enterprise (100k+ usuários)
- ✅ **Sharding de banco**
- ✅ **Microserviços**
- ✅ **Load balancing**
- ✅ **Analytics avançados**

## 🔐 Considerações de Segurança

### Autenticação
```typescript
// Hash de senhas com bcrypt
import bcrypt from 'bcrypt'

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 12)
}

const verifyPassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash)
}
```

### Validação de Dados
```typescript
// Validação com Zod
import { z } from 'zod'

const createTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  subject: z.string().min(1).max(50),
  priority: z.enum(['low', 'medium', 'high'])
})
```

### Rate Limiting
```typescript
// Rate limiting com Redis
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Muitas tentativas, tente novamente em 15 minutos'
})
```

## 📊 Monitoramento e Analytics

### Métricas Importantes
- ✅ **Usuários ativos diários/mensais**
- ✅ **Tempo médio de sessão**
- ✅ **Taxa de conclusão de tarefas**
- ✅ **Engajamento com Pomodoro**
- ✅ **Crescimento da comunidade**

### Ferramentas Recomendadas
- **Analytics**: Google Analytics, Mixpanel
- **Monitoramento**: Sentry, LogRocket
- **Performance**: Vercel Analytics, Web Vitals
- **Banco**: Prisma Metrics, PostgreSQL logs

## 🎯 Próximos Passos

1. **Criar conta no PlanetScale** (gratuito)
2. **Configurar Prisma** com MySQL
3. **Implementar schema** básico
4. **Criar API routes** com autenticação
5. **Migrar store Zustand** para usar API real
6. **Deploy no Vercel** com banco funcionando
7. **Implementar testes** automatizados
8. **Adicionar monitoramento** e analytics

## 🚀 Comandos para Começar

```bash
# 1. Instalar dependências
npm install prisma @prisma/client
npm install -D prisma

# 2. Inicializar com MySQL
npx prisma init --datasource-provider mysql

# 3. Configurar .env com URL do PlanetScale
DATABASE_URL="mysql://username:password@host:port/database?sslaccept=strict"

# 4. Gerar cliente e aplicar schema
npx prisma generate
npx prisma db push

# 5. Visualizar banco (opcional)
npx prisma studio
```

---

**💡 Recomendação**: Vá direto para MySQL com PlanetScale! É gratuito, escalável e evita retrabalho futuro. Foque no desenvolvimento, não na infraestrutura! 🚀
