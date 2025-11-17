import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
  }
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Token de acesso não fornecido' 
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        email: true, 
        name: true,
        points: true,
        studyHours: true,
        level: true
      }
    })

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Usuário não encontrado' 
      })
    }

    req.user = user
    return next()
  } catch (error) {
    console.error('Erro na autenticação:', error)
    return res.status(403).json({ 
      success: false,
      message: 'Token inválido ou expirado' 
    })
  }
}

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { 
          id: true, 
          email: true, 
          name: true,
          points: true,
          studyHours: true,
          level: true
        }
      })

      if (user) {
        req.user = user
      }
    }
    
    next()
  } catch (error) {
    // Se houver erro, continua sem autenticação
    next()
  }
}
