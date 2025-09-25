import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

// Schemas de validação
const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
})

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body)

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Usuário já existe com este email' 
      })
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 12)

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash
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
    })

    // Gerar token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    return res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        token,
        user
      }
    })
  } catch (error) {
    console.error('Erro no registro:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        message: error.errors[0].message 
      })
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor' 
    })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Credenciais inválidas' 
      })
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Credenciais inválidas' 
      })
    }

    // Gerar token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    return res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          points: user.points,
          studyHours: user.studyHours,
          level: user.level
        }
      }
    })
  } catch (error) {
    console.error('Erro no login:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        message: error.errors[0].message 
      })
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor' 
    })
  }
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user

    return res.json({
      success: true,
      data: {
        user
      }
    })
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor' 
    })
  }
}