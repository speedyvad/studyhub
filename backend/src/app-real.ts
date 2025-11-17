import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from './lib/prisma'

// Carregar variáveis de ambiente
dotenv.config()

const app = express()

// Middleware de segurança
app.use(helmet())

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Parser de JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'StudyHub API está funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
})

// Schema de validação para registro
const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
})

// Schema de validação para login
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

// Registro de usuário
app.post('/api/auth/register', async (req, res) => {
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
    const hashedPassword = await bcrypt.hash(password, 12)

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
    })

    // Gerar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    return res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso!',
      data: {
        user,
        token
      }
    })

  } catch (error: unknown) {
    console.error('Erro no registro:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Login de usuário
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      })
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      })
    }

    // Gerar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    // Retornar dados do usuário (sem senha)
    const { passwordHash: _, ...userWithoutPassword } = user

    return res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      data: {
        user: userWithoutPassword,
        token
      }
    })

  } catch (error: unknown) {
    console.error('Erro no login:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
})

// Perfil do usuário (requer autenticação)
app.get('/api/auth/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso necessário'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    
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
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      })
    }

    return res.json({
      success: true,
      data: { user }
    })

  } catch (error: unknown) {
    console.error('Erro no perfil:', error)
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    })
  }
})

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 StudyHub API rodando na porta ${PORT}`)
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`)
})

export default app
