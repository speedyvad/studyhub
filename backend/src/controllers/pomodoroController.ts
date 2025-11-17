import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import { AuthRequest } from '../middleware/auth'

// Schemas de validação
const createSessionSchema = z.object({
  duration: z.number().min(1, 'Duração deve ser pelo menos 1 minuto').max(60, 'Duração máxima é 60 minutos')
})

const updateSessionSchema = z.object({
  completed: z.boolean().optional(),
  duration: z.number().min(1).max(60).optional()
})

export const getSessions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Usuário não autenticado' 
      })
    }
    const userId = req.user.id
    const { completed, limit = '50' } = req.query

    const where: any = { userId }
    
    if (completed !== undefined) {
      where.completed = completed === 'true'
    }

    const sessions = await prisma.pomodoroSession.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: parseInt(limit as string)
    })

    return res.json({
      success: true,
      data: { sessions }
    })
  } catch (error) {
    console.error('Erro ao buscar sessões:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar sessões' 
    })
  }
}

export const getSessionById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Usuário não autenticado' 
      })
    }
    const userId = req.user.id
    const { id } = req.params

    const session = await prisma.pomodoroSession.findFirst({
      where: { 
        id,
        userId 
      }
    })

    if (!session) {
      return res.status(404).json({ 
        success: false,
        message: 'Sessão não encontrada' 
      })
    }

    return res.json({
      success: true,
      data: { session }
    })
  } catch (error) {
    console.error('Erro ao buscar sessão:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar sessão' 
    })
  }
}

export const createSession = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Usuário não autenticado' 
      })
    }
    const userId = req.user.id
    const data = createSessionSchema.parse(req.body)

    const session = await prisma.pomodoroSession.create({
      data: {
        ...data,
        userId
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Sessão iniciada com sucesso',
      data: { session }
    })
  } catch (error) {
    console.error('Erro ao criar sessão:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        message: error.errors[0].message 
      })
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao criar sessão' 
    })
  }
}

export const completeSession = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Usuário não autenticado' 
      })
    }
    const userId = req.user.id
    const { id } = req.params

    // Verificar se a sessão existe e pertence ao usuário
    const existingSession = await prisma.pomodoroSession.findFirst({
      where: { 
        id,
        userId 
      }
    })

    if (!existingSession) {
      return res.status(404).json({ 
        success: false,
        message: 'Sessão não encontrada' 
      })
    }

    if (existingSession.completed) {
      return res.status(400).json({ 
        success: false,
        message: 'Sessão já foi completada' 
      })
    }

    const session = await prisma.pomodoroSession.update({
      where: { id },
      data: { 
        completed: true,
        completedAt: new Date()
      }
    })

    // Adicionar pontos e horas de estudo ao usuário
    const pointsEarned = Math.floor(session.duration / 25) * 25 // 25 pontos por 25 minutos
    const hoursEarned = session.duration / 60

    await prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: pointsEarned
        },
        studyHours: {
          increment: hoursEarned
        }
      }
    })

    return res.json({
      success: true,
      message: `Sessão completada! +${pointsEarned} pontos`,
      data: { 
        session,
        pointsEarned,
        hoursEarned
      }
    })
  } catch (error) {
    console.error('Erro ao completar sessão:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao completar sessão' 
    })
  }
}

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Usuário não autenticado' 
      })
    }
    const userId = req.user.id

    // Estatísticas gerais
    const totalSessions = await prisma.pomodoroSession.count({
      where: { userId, completed: true }
    })

    const totalMinutes = await prisma.pomodoroSession.aggregate({
      where: { userId, completed: true },
      _sum: { duration: true }
    })

    const totalHours = (totalMinutes._sum.duration || 0) / 60

    // Sessões dos últimos 7 dias
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentSessions = await prisma.pomodoroSession.count({
      where: { 
        userId, 
        completed: true,
        completedAt: {
          gte: sevenDaysAgo
        }
      }
    })

    // Sessões por dia da semana
    const sessionsByDay = await prisma.pomodoroSession.groupBy({
      by: ['startedAt'],
      where: { userId, completed: true },
      _count: { id: true }
    })

    return res.json({
      success: true,
      data: {
        totalSessions,
        totalHours: Math.round(totalHours * 100) / 100,
        recentSessions,
        sessionsByDay
      }
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar estatísticas' 
    })
  }
}


