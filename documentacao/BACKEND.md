# 🔧 BACKEND - STUDYHUB

## 📋 Visão Geral

O backend do StudyHub é construído com **Node.js + Express + Prisma** e oferece uma API RESTful completa para gerenciamento de tarefas, autenticação, grupos e sessões Pomodoro.

## 🏗️ Estrutura do Backend

```
backend/
├── src/
│   ├── app-working.js      # Servidor principal (JavaScript)
│   └── app-real.ts         # Versão TypeScript (opcional)
├── prisma/
│   ├── schema.prisma       # Schema do banco de dados
│   └── migrations/         # Migrações automáticas
├── docker-compose.yml      # Containers Docker
├── package.json           # Dependências
└── .env                   # Variáveis de ambiente
```

## 🚀 Servidor Principal (`app-working.js`)

### **Configuração Inicial**
```javascript
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const PORT = 3001;
```

### **Middleware de Autenticação**
```javascript
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token não fornecido' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acesso negado' 
    });
  }
  next();
};
```

## 🔐 Autenticação

### **Registro de Usuário**
```javascript
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email já cadastrado' 
      });
    }
    
    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Criar usuário
    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        passwordHash 
      }
    });
    
    // Gerar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso!',
      data: { user, token }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});
```

### **Login de Usuário**
```javascript
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuário
    const user = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciais inválidas' 
      });
    }
    
    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciais inválidas' 
      });
    }
    
    // Gerar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      data: { user, token }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});
```

## 📝 API de Tarefas

### **Listar Tarefas**
```javascript
app.get('/api/tasks', requireAuth, async (req, res) => {
  try {
    const { subject, priority, completed } = req.query;
    
    const where = { userId: req.user.userId };
    if (subject) where.subject = subject;
    if (priority) where.priority = priority.toUpperCase();
    if (completed !== undefined) where.completed = completed === 'true';
    
    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    res.json({ 
      success: true, 
      data: { tasks }, 
      total: tasks.length 
    });
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});
```

### **Criar Tarefa**
```javascript
app.post('/api/tasks', requireAuth, async (req, res) => {
  try {
    const { title, description, subject, priority, dueDate, groupId } = req.body;
    
    if (!title) {
      return res.status(400).json({ 
        success: false, 
        message: 'Título é obrigatório' 
      });
    }
    
    // Mapear prioridade para maiúsculo
    const priorityMap = { 
      'low': 'LOW', 
      'medium': 'MEDIUM', 
      'high': 'HIGH' 
    };
    
    const task = await prisma.task.create({
      data: {
        title,
        description: description || '',
        subject: subject || 'geral',
        priority: priorityMap[priority] || 'MEDIUM',
        completed: false,
        dueDate: dueDate ? new Date(dueDate) : null,
        groupId: groupId || null,
        userId: req.user.userId
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Tarefa criada com sucesso!',
      data: { task }
    });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});
```

### **Atualizar Tarefa**
```javascript
app.put('/api/tasks/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject, priority, completed, dueDate, groupId } = req.body;
    
    // Verificar se tarefa existe e pertence ao usuário
    const existingTask = await prisma.task.findFirst({
      where: { id, userId: req.user.userId }
    });
    
    if (!existingTask) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tarefa não encontrada' 
      });
    }
    
    // Mapear prioridade se fornecida
    const priorityMap = { 
      'low': 'LOW', 
      'medium': 'MEDIUM', 
      'high': 'HIGH' 
    };
    
    const task = await prisma.task.update({
      where: { id },
      data: {
        title: title || existingTask.title,
        description: description !== undefined ? description : existingTask.description,
        subject: subject || existingTask.subject,
        priority: priority ? priorityMap[priority] : existingTask.priority,
        completed: completed !== undefined ? completed : existingTask.completed,
        dueDate: dueDate ? new Date(dueDate) : existingTask.dueDate,
        groupId: groupId !== undefined ? groupId : existingTask.groupId
      }
    });
    
    res.json({
      success: true,
      message: 'Tarefa atualizada com sucesso!',
      data: { task }
    });
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});
```

### **Excluir Tarefa**
```javascript
app.delete('/api/tasks/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se tarefa existe e pertence ao usuário
    const existingTask = await prisma.task.findFirst({
      where: { id, userId: req.user.userId }
    });
    
    if (!existingTask) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tarefa não encontrada' 
      });
    }
    
    await prisma.task.delete({
      where: { id }
    });
    
    res.json({
      success: true,
      message: 'Tarefa excluída com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});
```

### **Estatísticas de Tarefas**
```javascript
app.get('/api/tasks/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const total = await prisma.task.count({
      where: { userId }
    });
    
    const pending = await prisma.task.count({
      where: { userId, completed: false }
    });
    
    const completed = await prisma.task.count({
      where: { userId, completed: true }
    });
    
    res.json({
      success: true,
      data: { total, pending, completed }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});
```

## 👥 API de Grupos

### **Listar Grupos**
```javascript
app.get('/api/groups', requireAuth, async (req, res) => {
  try {
    const groups = await prisma.taskGroup.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { tasks: true } }
      }
    });
    
    // Adicionar contador de tarefas
    const groupsWithCount = groups.map(group => ({
      ...group,
      taskCount: group._count.tasks
    }));
    
    res.json({ 
      success: true, 
      data: { groups: groupsWithCount } 
    });
  } catch (error) {
    console.error('Erro ao listar grupos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});
```

### **Criar Grupo**
```javascript
app.post('/api/groups', requireAuth, async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome do grupo é obrigatório' 
      });
    }
    
    const group = await prisma.taskGroup.create({
      data: {
        name,
        description: description || '',
        color: color || 'blue',
        icon: icon || 'folder',
        userId: req.user.userId
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Grupo criado com sucesso!',
      data: { group }
    });
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});
```

## ⏰ API de Pomodoro

### **Iniciar Sessão**
```javascript
app.post('/api/pomodoro/start', requireAuth, async (req, res) => {
  try {
    const { duration = 25 } = req.body; // 25 minutos por padrão
    
    const session = await prisma.pomodoroSession.create({
      data: {
        userId: req.user.userId,
        duration: duration,
        completed: false
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Sessão iniciada com sucesso!',
      data: { session }
    });
  } catch (error) {
    console.error('Erro ao iniciar sessão Pomodoro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});
```

### **Completar Sessão**
```javascript
app.put('/api/pomodoro/:id/complete', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await prisma.pomodoroSession.update({
      where: { id },
      data: {
        completed: true,
        completedAt: new Date()
      }
    });
    
    // Atualizar pontos e horas do usuário
    await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        points: { increment: session.duration * 2 }, // 2 pontos por minuto
        studyHours: { increment: session.duration / 60 }
      }
    });
    
    res.json({
      success: true,
      message: 'Sessão completada com sucesso!',
      data: { session }
    });
  } catch (error) {
    console.error('Erro ao completar sessão:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});
```

## 📤 API de Upload

### **Upload de Avatar**
```javascript
app.post('/api/upload/avatar', requireAuth, async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    
    if (!avatarUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'URL do avatar é obrigatória' 
      });
    }
    
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { avatarUrl }
    });
    
    res.json({
      success: true,
      message: 'Avatar atualizado com sucesso!',
      data: { user }
    });
  } catch (error) {
    console.error('Erro ao atualizar avatar:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});
```

## 🗄️ Schema do Banco (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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

enum Priority {
  LOW
  MEDIUM
  HIGH
}
```

## 🐳 Docker Compose

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

  redis:
    image: redis:7-alpine
    container_name: studyhub-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## 🔧 Comandos Úteis

### **Desenvolvimento**
```bash
# Iniciar servidor
node src/app-working.js

# Ver logs em tempo real
tail -f logs/app.log

# Testar API
curl http://localhost:3001/api/health
```

### **Banco de Dados**
```bash
# Aplicar mudanças no schema
npx prisma db push

# Gerar cliente Prisma
npx prisma generate

# Abrir Prisma Studio
npx prisma studio

# Resetar banco
npx prisma db push --force-reset
```

### **Docker**
```bash
# Iniciar containers
sudo docker-compose up -d

# Ver logs
sudo docker logs studyhub-postgres
sudo docker logs studyhub-redis

# Parar containers
sudo docker-compose down

# Limpar volumes
sudo docker-compose down -v
```

## 🚨 Tratamento de Erros

### **Padrão de Resposta**
```javascript
// Sucesso
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": { /* dados */ }
}

// Erro
{
  "success": false,
  "message": "Descrição do erro",
  "error": "Código do erro (opcional)"
}
```

### **Middleware de Erro Global**
```javascript
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});
```

---

**📚 Continue explorando: [FRONTEND.md](./FRONTEND.md) e [INTEGRACAO.md](./INTEGRACAO.md)**
