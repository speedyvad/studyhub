import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// Importar rotas
import authRoutes from './routes/auth'
import taskRoutes from './routes/tasks'
import pomodoroRoutes from './routes/pomodoro'
import achievementRoutes from './routes/achievements'
import communityRoutes from './routes/community'

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

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests por IP
  message: {
    success: false,
    message: 'Muitas requisições, tente novamente em alguns minutos'
  }
})
app.use(limiter)

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Parser de JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', err)
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido'
    })
  }
  
  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  })
})

// Rotas da API
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/pomodoro', pomodoroRoutes)
app.use('/api/achievements', achievementRoutes)
app.use('/api/community', communityRoutes)

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'StudyHub API está funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
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
