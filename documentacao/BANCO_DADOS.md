# 🗄️ BANCO DE DADOS - STUDYHUB

## 📋 Visão Geral

O StudyHub utiliza **PostgreSQL** como banco principal e **Redis** para cache, gerenciados através do **Prisma ORM** com Docker para containerização.

## 🏗️ Arquitetura do Banco

### **Stack de Tecnologias**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │      Redis      │    │     Prisma      │
│   (Primary DB)  │    │    (Cache)      │    │     (ORM)       │
│   Port: 5432    │    │   Port: 6379    │    │   (Client)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Backend API   │
                    │   (Express)     │
                    └─────────────────┘
```

## 📊 Schema do Banco (`prisma/schema.prisma`)

### **Modelo User (Usuários)**
```prisma
model User {
  id          String   @id @default(cuid())
  name        String
  email       String   @unique
  passwordHash String
  avatarUrl   String?
  bio         String?
  points      Int      @default(0)
  studyHours  Float    @default(0)
  level       Int      @default(1)
  role        String   @default("user")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relacionamentos
  tasks             Task[]
  taskGroups        TaskGroup[]
  pomodoroSessions  PomodoroSession[]
  achievements      UserAchievement[]
  posts             Post[]
  postLikes         PostLike[]
  comments          Comment[]
  
  @@map("users")
}
```

**Campos explicados:**
- `id`: Identificador único (CUID)
- `name`: Nome do usuário
- `email`: Email único para login
- `passwordHash`: Senha criptografada com bcrypt
- `avatarUrl`: URL da foto de perfil (opcional)
- `bio`: Biografia do usuário (opcional)
- `points`: Pontos de gamificação
- `studyHours`: Horas estudadas acumuladas
- `level`: Nível do usuário
- `role`: Papel do usuário ('user' ou 'admin')

### **Modelo Task (Tarefas)**
```prisma
model Task {
  id          String   @id @default(cuid())
  userId      String
  title       String
  description String?
  subject     String
  priority    Priority
  completed   Boolean  @default(false)
  dueDate     DateTime?
  groupId     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relacionamentos
  user  User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  group TaskGroup? @relation(fields: [groupId], references: [id], onDelete: SetNull)
  
  @@map("tasks")
}
```

**Campos explicados:**
- `id`: Identificador único
- `userId`: ID do usuário proprietário
- `title`: Título da tarefa
- `description`: Descrição opcional
- `subject`: Matéria/disciplina
- `priority`: Prioridade (LOW, MEDIUM, HIGH)
- `completed`: Status de conclusão
- `dueDate`: Data de vencimento (opcional)
- `groupId`: ID do grupo (opcional)

### **Modelo TaskGroup (Grupos de Tarefas)**
```prisma
model TaskGroup {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String?
  color       String   @default("blue")
  icon        String   @default("folder")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relacionamentos
  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks Task[]
  
  @@map("task_groups")
}
```

**Campos explicados:**
- `id`: Identificador único
- `userId`: ID do usuário proprietário
- `name`: Nome do grupo
- `description`: Descrição opcional
- `color`: Cor do grupo (blue, green, purple, etc.)
- `icon`: Ícone do grupo (folder, book, code, etc.)

### **Modelo PomodoroSession (Sessões Pomodoro)**
```prisma
model PomodoroSession {
  id          String    @id @default(cuid())
  userId      String
  duration    Int
  completed   Boolean   @default(false)
  startedAt   DateTime  @default(now())
  completedAt DateTime?
  
  // Relacionamentos
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("pomodoro_sessions")
}
```

**Campos explicados:**
- `id`: Identificador único
- `userId`: ID do usuário
- `duration`: Duração em minutos
- `completed`: Se foi completada
- `startedAt`: Data/hora de início
- `completedAt`: Data/hora de conclusão (opcional)

### **Enums**
```prisma
enum Priority {
  LOW
  MEDIUM
  HIGH
}
```

## 🔗 Relacionamentos

### **Diagrama de Relacionamentos**
```mermaid
erDiagram
    User ||--o{ Task : "possui"
    User ||--o{ TaskGroup : "cria"
    User ||--o{ PomodoroSession : "faz"
    TaskGroup ||--o{ Task : "contém"
    
    User {
        string id PK
        string name
        string email UK
        string passwordHash
        string avatarUrl
        string bio
        int points
        float studyHours
        int level
        string role
        datetime createdAt
        datetime updatedAt
    }
    
    Task {
        string id PK
        string userId FK
        string title
        string description
        string subject
        string priority
        boolean completed
        datetime dueDate
        string groupId FK
        datetime createdAt
        datetime updatedAt
    }
    
    TaskGroup {
        string id PK
        string userId FK
        string name
        string description
        string color
        string icon
        datetime createdAt
        datetime updatedAt
    }
    
    PomodoroSession {
        string id PK
        string userId FK
        int duration
        boolean completed
        datetime startedAt
        datetime completedAt
    }
```

### **Tipos de Relacionamentos**

#### **1. One-to-Many (1:N)**
- **User → Tasks**: Um usuário pode ter muitas tarefas
- **User → TaskGroups**: Um usuário pode ter muitos grupos
- **User → PomodoroSessions**: Um usuário pode ter muitas sessões
- **TaskGroup → Tasks**: Um grupo pode ter muitas tarefas

#### **2. Many-to-One (N:1)**
- **Task → User**: Muitas tarefas pertencem a um usuário
- **Task → TaskGroup**: Muitas tarefas podem pertencer a um grupo
- **PomodoroSession → User**: Muitas sessões pertencem a um usuário

#### **3. Cascade Rules**
- **CASCADE**: Quando usuário é deletado, suas tarefas, grupos e sessões são deletados
- **SET NULL**: Quando grupo é deletado, tarefas ficam sem grupo (groupId = null)

## 🐳 Configuração Docker

### **Docker Compose (`docker-compose.yml`)**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: studyhub-postgres
    environment:
      POSTGRES_DB: studyhub
      POSTGRES_USER: studyhub
      POSTGRES_PASSWORD: studyhub123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U studyhub"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: studyhub-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  redis_data:
```

### **Variáveis de Ambiente**
```env
# Database
DATABASE_URL="postgresql://studyhub:studyhub123@localhost:5432/studyhub"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="seu-jwt-secret-super-seguro-aqui"
```

## 🔧 Comandos Prisma

### **Configuração Inicial**
```bash
# Instalar Prisma
npm install prisma @prisma/client

# Inicializar Prisma
npx prisma init

# Gerar cliente
npx prisma generate
```

### **Migrações**
```bash
# Aplicar mudanças no schema
npx prisma db push

# Criar migração
npx prisma migrate dev --name init

# Aplicar migrações
npx prisma migrate deploy

# Resetar banco
npx prisma migrate reset
```

### **Desenvolvimento**
```bash
# Abrir Prisma Studio
npx prisma studio

# Ver status do banco
npx prisma db status

# Validar schema
npx prisma validate
```

## 📊 Consultas Comuns

### **Consultas de Usuários**
```javascript
// Buscar usuário por email
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
});

// Buscar usuário com tarefas
const userWithTasks = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    tasks: true,
    taskGroups: true,
    pomodoroSessions: true
  }
});

// Listar todos os usuários (admin)
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    points: true,
    studyHours: true,
    level: true,
    createdAt: true
  },
  orderBy: { createdAt: 'desc' }
});
```

### **Consultas de Tarefas**
```javascript
// Buscar tarefas do usuário
const tasks = await prisma.task.findMany({
  where: { userId },
  orderBy: [
    { priority: 'desc' },
    { createdAt: 'desc' }
  ]
});

// Buscar tarefas com filtros
const filteredTasks = await prisma.task.findMany({
  where: {
    userId,
    subject: 'matemática',
    completed: false,
    priority: 'HIGH'
  }
});

// Estatísticas de tarefas
const stats = await prisma.task.groupBy({
  by: ['completed'],
  where: { userId },
  _count: { id: true }
});
```

### **Consultas de Grupos**
```javascript
// Buscar grupos com contador de tarefas
const groups = await prisma.taskGroup.findMany({
  where: { userId },
  include: {
    _count: { select: { tasks: true } }
  },
  orderBy: { createdAt: 'desc' }
});

// Buscar tarefas de um grupo
const groupTasks = await prisma.task.findMany({
  where: { 
    userId,
    groupId: groupId 
  },
  orderBy: { createdAt: 'desc' }
});
```

### **Consultas de Pomodoro**
```javascript
// Estatísticas de sessões
const stats = await prisma.pomodoroSession.aggregate({
  where: { userId, completed: true },
  _count: { id: true },
  _sum: { duration: true }
});

// Sessões de hoje
const todaySessions = await prisma.pomodoroSession.count({
  where: {
    userId,
    completed: true,
    startedAt: {
      gte: new Date(new Date().setHours(0, 0, 0, 0))
    }
  }
});
```

## 🔍 Índices e Performance

### **Índices Recomendados**
```sql
-- Índices para performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_subject ON tasks(subject);
CREATE INDEX idx_tasks_group_id ON tasks(group_id);

CREATE INDEX idx_pomodoro_user_id ON pomodoro_sessions(user_id);
CREATE INDEX idx_pomodoro_completed ON pomodoro_sessions(completed);
CREATE INDEX idx_pomodoro_started_at ON pomodoro_sessions(started_at);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### **Consultas Otimizadas**
```javascript
// Usar select específico
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    points: true
  }
});

// Usar paginação
const tasks = await prisma.task.findMany({
  where: { userId },
  skip: offset,
  take: limit,
  orderBy: { createdAt: 'desc' }
});

// Usar include apenas quando necessário
const userWithTasks = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    tasks: {
      where: { completed: false },
      take: 10
    }
  }
});
```

## 🚨 Backup e Segurança

### **Backup do Banco**
```bash
# Backup completo
docker exec studyhub-postgres pg_dump -U studyhub studyhub > backup.sql

# Restaurar backup
docker exec -i studyhub-postgres psql -U studyhub studyhub < backup.sql

# Backup com compressão
docker exec studyhub-postgres pg_dump -U studyhub -Z 9 studyhub > backup.sql.gz
```

### **Segurança**
```sql
-- Criar usuário com permissões limitadas
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE studyhub TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
```

## 📈 Monitoramento

### **Consultas de Monitoramento**
```sql
-- Tamanho do banco
SELECT pg_size_pretty(pg_database_size('studyhub'));

-- Tabelas com mais registros
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes
FROM pg_stat_user_tables
ORDER BY n_tup_ins DESC;

-- Conexões ativas
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
```

### **Logs do PostgreSQL**
```bash
# Ver logs do container
docker logs studyhub-postgres

# Acessar container
docker exec -it studyhub-postgres psql -U studyhub studyhub
```

## 🔧 Troubleshooting

### **Problemas Comuns**

#### **1. Erro de Conexão**
```bash
# Verificar se container está rodando
docker ps | grep postgres

# Verificar logs
docker logs studyhub-postgres

# Reiniciar container
docker restart studyhub-postgres
```

#### **2. Erro de Schema**
```bash
# Resetar banco
npx prisma migrate reset

# Aplicar schema
npx prisma db push

# Gerar cliente
npx prisma generate
```

#### **3. Performance Lenta**
```sql
-- Verificar queries lentas
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Analisar plano de execução
EXPLAIN ANALYZE SELECT * FROM tasks WHERE user_id = 'user_id';
```

---

**📚 Continue explorando: [MIGRACOES.md](./MIGRACOES.md) e [COMANDOS.md](./COMANDOS.md)**
