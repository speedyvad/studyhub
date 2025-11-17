import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

export const getAchievements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    // Buscar todas as conquistas
    const allAchievements = await prisma.achievement.findMany({
      orderBy: { points: 'asc' }
    })

    // Buscar conquistas desbloqueadas pelo usuário
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true
      }
    })

    // Mapear conquistas com status de desbloqueio
    const achievementsWithStatus = allAchievements.map(achievement => {
      const userAchievement = userAchievements.find(
        ua => ua.achievementId === achievement.id
      )

      return {
        ...achievement,
        unlocked: !!userAchievement,
        unlockedAt: userAchievement?.unlockedAt || null
      }
    })

    return res.json({
      success: true,
      data: { achievements: achievementsWithStatus }
    })
  } catch (error) {
    console.error('Erro ao buscar conquistas:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar conquistas' 
    })
  }
}

export const getUserAchievements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true
      },
      orderBy: { unlockedAt: 'desc' }
    })

    return res.json({
      success: true,
      data: { achievements: userAchievements }
    })
  } catch (error) {
    console.error('Erro ao buscar conquistas do usuário:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar conquistas do usuário' 
    })
  }
}

export const checkAchievements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    // Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tasks: true,
        pomodoroSessions: {
          where: { completed: true }
        },
        achievements: {
          include: {
            achievement: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuário não encontrado' 
      })
    }

    const newAchievements = []

    // Verificar conquistas baseadas em tarefas
    const completedTasks = user.tasks.filter(task => task.completed).length
    
    if (completedTasks >= 1 && !user.achievements.some(a => a.achievement.title === 'Primeira Tarefa')) {
      const achievement = await prisma.achievement.findFirst({
        where: { title: 'Primeira Tarefa' }
      })
      
      if (achievement) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id
          }
        })
        newAchievements.push(achievement)
      }
    }

    if (completedTasks >= 10 && !user.achievements.some(a => a.achievement.title === 'Produtivo')) {
      const achievement = await prisma.achievement.findFirst({
        where: { title: 'Produtivo' }
      })
      
      if (achievement) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id
          }
        })
        newAchievements.push(achievement)
      }
    }

    // Verificar conquistas baseadas em Pomodoro
    const completedSessions = user.pomodoroSessions.length
    
    if (completedSessions >= 1 && !user.achievements.some(a => a.achievement.title === 'Primeiro Pomodoro')) {
      const achievement = await prisma.achievement.findFirst({
        where: { title: 'Primeiro Pomodoro' }
      })
      
      if (achievement) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id
          }
        })
        newAchievements.push(achievement)
      }
    }

    if (completedSessions >= 10 && !user.achievements.some(a => a.achievement.title === 'Focado')) {
      const achievement = await prisma.achievement.findFirst({
        where: { title: 'Focado' }
      })
      
      if (achievement) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id
          }
        })
        newAchievements.push(achievement)
      }
    }

    // Verificar conquistas baseadas em pontos
    if (user.points >= 100 && !user.achievements.some(a => a.achievement.title === 'Centenário')) {
      const achievement = await prisma.achievement.findFirst({
        where: { title: 'Centenário' }
      })
      
      if (achievement) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id
          }
        })
        newAchievements.push(achievement)
      }
    }

    return res.json({
      success: true,
      data: { 
        newAchievements,
        hasNewAchievements: newAchievements.length > 0
      }
    })
  } catch (error) {
    console.error('Erro ao verificar conquistas:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao verificar conquistas' 
    })
  }
}

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query

    const leaderboard = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        points: true,
        studyHours: true,
        level: true
      },
      orderBy: { points: 'desc' },
      take: parseInt(limit as string)
    })

    return res.json({
      success: true,
      data: { leaderboard }
    })
  } catch (error) {
    console.error('Erro ao buscar ranking:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar ranking' 
    })
  }
}


