import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

// Schemas de validação
const createTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  subject: z.string().min(1, 'Matéria é obrigatória'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined)
})

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').optional(),
  description: z.string().optional(),
  subject: z.string().min(1, 'Matéria é obrigatória').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  completed: z.boolean().optional(),
  dueDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined)
})

export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { completed, subject, priority } = req.query

    // Construir filtros
    const where: any = { userId }
    
    if (completed !== undefined) {
      where.completed = completed === 'true'
    }
    
    if (subject) {
      where.subject = subject
    }
    
    if (priority) {
      where.priority = priority
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      success: true,
      data: { tasks }
    })
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error)
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar tarefas' 
    })
  }
}

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params

    const task = await prisma.task.findFirst({
      where: { 
        id,
        userId 
      }
    })

    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Tarefa não encontrada' 
      })
    }

    return res.json({
      success: true,
      data: { task }
    })
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar tarefa' 
    })
  }
}

export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const data = createTaskSchema.parse(req.body)

    const task = await prisma.task.create({
      data: {
        ...data,
        userId
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Tarefa criada com sucesso',
      data: { task }
    })
  } catch (error) {
    console.error('Erro ao criar tarefa:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        message: error.errors[0].message 
      })
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao criar tarefa' 
    })
  }
}

export const updateTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params
    const data = updateTaskSchema.parse(req.body)

    // Verificar se a tarefa existe e pertence ao usuário
    const existingTask = await prisma.task.findFirst({
      where: { 
        id,
        userId 
      }
    })

    if (!existingTask) {
      return res.status(404).json({ 
        success: false,
        message: 'Tarefa não encontrada' 
      })
    }

    const task = await prisma.task.update({
      where: { id },
      data
    })

    return res.json({
      success: true,
      message: 'Tarefa atualizada com sucesso',
      data: { task }
    })
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        message: error.errors[0].message 
      })
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar tarefa' 
    })
  }
}

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params

    // Verificar se a tarefa existe e pertence ao usuário
    const existingTask = await prisma.task.findFirst({
      where: { 
        id,
        userId 
      }
    })

    if (!existingTask) {
      return res.status(404).json({ 
        success: false,
        message: 'Tarefa não encontrada' 
      })
    }

    await prisma.task.delete({
      where: { id }
    })

    return res.json({
      success: true,
      message: 'Tarefa deletada com sucesso'
    })
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao deletar tarefa' 
    })
  }
}

export const completeTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params

    // Verificar se a tarefa existe e pertence ao usuário
    const existingTask = await prisma.task.findFirst({
      where: { 
        id,
        userId 
      }
    })

    if (!existingTask) {
      return res.status(404).json({ 
        success: false,
        message: 'Tarefa não encontrada' 
      })
    }

    const task = await prisma.task.update({
      where: { id },
      data: { completed: true }
    })

    // Adicionar pontos ao usuário
    await prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: 10
        }
      }
    })

    return res.json({
      success: true,
      message: 'Tarefa completada com sucesso! +10 pontos',
      data: { task }
    })
  } catch (error) {
    console.error('Erro ao completar tarefa:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao completar tarefa' 
    })
  }
}

// 👇 --- NOVA FUNÇÃO ADICIONADA --- 👇
export const getTaskStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Usar Promise.all para rodar as contagens em paralelo
    const [total, completed, pending] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, completed: true } }),
      prisma.task.count({ where: { userId, completed: false } })
    ]);

    // Opcional: Agrupar tarefas pendentes por prioridade
    const byPriority = await prisma.task.groupBy({
      by: ['priority'],
      where: { userId, completed: false },
      _count: {
        id: true
      }
    });

    const stats = {
      total,
      completed,
      pending,
      // Mapear para um formato mais amigável
      byPriority: byPriority.map(p => ({
        priority: p.priority,
        count: p._count.id
      }))
    };

    return res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas de tarefas:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar estatísticas' 
    });
  }
};