const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'StudyHub API está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Registro de usuário
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe com este email'
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        points: 0,
        studyHours: 0,
        level: 1
      },
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        studyHours: true,
        level: true,
        createdAt: true
      }
    });

    // Gerar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso!',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Login de usuário
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Gerar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      'fallback-secret',
      { expiresIn: '7d' }
    );

    // Retornar dados do usuário (sem senha)
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso necessário'
      });
    }

    const decoded = jwt.verify(token, 'fallback-secret');
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Listar todos os usuários (para administração)
app.get('/api/users', requireAdmin, async (req, res) => {
  try {
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
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: { users },
      total: users.length
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Perfil do usuário
app.get('/api/auth/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso necessário'
      });
    }

    const decoded = jwt.verify(token, 'fallback-secret');
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        studyHours: true,
        level: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Erro no perfil:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
});

// ==================== ROTAS DE TAREFAS ====================

// Middleware para verificar autenticação (não admin)
const requireAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso necessário'
      });
    }

    const decoded = jwt.verify(token, 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Listar tarefas do usuário
app.get('/api/tasks', requireAuth, async (req, res) => {
  try {
    const { completed, subject, priority } = req.query;
    
    const where = {
      userId: req.user.userId
    };
    
    if (completed !== undefined) where.completed = completed === 'true';
    if (subject) where.subject = subject;
    if (priority) where.priority = priority.toUpperCase();
    
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

// Criar nova tarefa
app.post('/api/tasks', requireAuth, async (req, res) => {
  try {
    const { title, description, subject, priority, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Título é obrigatório'
      });
    }

    // Converter priority para maiúsculo
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

// Atualizar tarefa
app.put('/api/tasks/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject, priority, completed, dueDate } = req.body;

    // Verificar se a tarefa pertence ao usuário
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: req.user.userId
      }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada'
      });
    }

    // Converter priority para maiúsculo se fornecido
    const priorityMap = {
      'low': 'LOW',
      'medium': 'MEDIUM', 
      'high': 'HIGH'
    };
    
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (subject) updateData.subject = subject;
    if (priority) updateData.priority = priorityMap[priority] || priority.toUpperCase();
    if (completed !== undefined) updateData.completed = completed;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    
    const task = await prisma.task.update({
      where: { id },
      data: updateData
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

// Deletar tarefa
app.delete('/api/tasks/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a tarefa pertence ao usuário
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: req.user.userId
      }
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
      message: 'Tarefa deletada com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Obter estatísticas de tarefas
app.get('/api/tasks/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const totalTasks = await prisma.task.count({
      where: { userId }
    });

    const completedTasks = await prisma.task.count({
      where: { 
        userId,
        completed: true
      }
    });

    const pendingTasks = await prisma.task.count({
      where: { 
        userId,
        completed: false
      }
    });

    res.json({
      success: true,
      data: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ==================== ROTAS DE POMODORO ====================

// Iniciar sessão Pomodoro
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
      message: 'Sessão Pomodoro iniciada!',
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

// Finalizar sessão Pomodoro
app.put('/api/pomodoro/:id/complete', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se a sessão pertence ao usuário
    const existingSession = await prisma.pomodoroSession.findFirst({
      where: {
        id,
        userId: req.user.userId
      }
    });

    if (!existingSession) {
      return res.status(404).json({
        success: false,
        message: 'Sessão não encontrada'
      });
    }

    const session = await prisma.pomodoroSession.update({
      where: { id },
      data: { 
        completed: true,
        completedAt: new Date()
      }
    });

    // Atualizar horas de estudo do usuário
    const studyHours = session.duration / 60; // Converter minutos para horas
    await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        studyHours: {
          increment: studyHours
        },
        points: {
          increment: 10 // 10 pontos por sessão completada
        }
      }
    });

    res.json({
      success: true,
      message: 'Sessão Pomodoro finalizada!',
      data: { session }
    });

  } catch (error) {
    console.error('Erro ao finalizar sessão Pomodoro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Listar sessões do usuário
app.get('/api/pomodoro/sessions', requireAuth, async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const sessions = await prisma.pomodoroSession.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.pomodoroSession.count({
      where: { userId: req.user.userId }
    });

    res.json({
      success: true,
      data: { sessions, total }
    });

  } catch (error) {
    console.error('Erro ao listar sessões:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Estatísticas do Pomodoro
app.get('/api/pomodoro/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const totalSessions = await prisma.pomodoroSession.count({
      where: { userId, completed: true }
    });

    const totalMinutes = await prisma.pomodoroSession.aggregate({
      where: { userId, completed: true },
      _sum: { duration: true }
    });

    const todaySessions = await prisma.pomodoroSession.count({
      where: {
        userId,
        completed: true,
        startedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    const thisWeekSessions = await prisma.pomodoroSession.count({
      where: {
        userId,
        completed: true,
        startedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalSessions,
        totalMinutes: totalMinutes._sum.duration || 0,
        totalHours: Math.round((totalMinutes._sum.duration || 0) / 60 * 10) / 10,
        todaySessions,
        thisWeekSessions
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas Pomodoro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ==================== ROTAS DE GRUPOS ====================

// Listar grupos do usuário
app.get('/api/groups', requireAuth, async (req, res) => {
  try {
    const groups = await prisma.taskGroup.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    });

    // Adicionar taskCount a cada grupo
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

// Criar grupo
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

// Atualizar grupo
app.put('/api/groups/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, icon } = req.body;

    const existingGroup = await prisma.taskGroup.findFirst({
      where: { id, userId: req.user.userId }
    });

    if (!existingGroup) {
      return res.status(404).json({
        success: false,
        message: 'Grupo não encontrado'
      });
    }

    const group = await prisma.taskGroup.update({
      where: { id },
      data: {
        name: name || existingGroup.name,
        description: description !== undefined ? description : existingGroup.description,
        color: color || existingGroup.color,
        icon: icon || existingGroup.icon
      }
    });

    res.json({
      success: true,
      message: 'Grupo atualizado com sucesso!',
      data: { group }
    });
  } catch (error) {
    console.error('Erro ao atualizar grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Excluir grupo
app.delete('/api/groups/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const existingGroup = await prisma.taskGroup.findFirst({
      where: { id, userId: req.user.userId }
    });

    if (!existingGroup) {
      return res.status(404).json({
        success: false,
        message: 'Grupo não encontrado'
      });
    }

    await prisma.taskGroup.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Grupo excluído com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao excluir grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Listar tarefas de um grupo
app.get('/api/groups/:id/tasks', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const tasks = await prisma.task.findMany({
      where: { 
        userId: req.user.userId,
        groupId: id 
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('Erro ao listar tarefas do grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// ==================== ROTAS DE UPLOAD ====================

// Upload de foto de perfil
app.post('/api/upload/avatar', requireAuth, async (req, res) => {
  try {
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({
        success: false,
        message: 'URL do avatar é obrigatória'
      });
    }

    // Atualizar avatar do usuário
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

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`🚀 StudyHub API rodando na porta ${PORT}`);
  console.log(`🌐 CORS Origin: http://localhost:5173`);
});

