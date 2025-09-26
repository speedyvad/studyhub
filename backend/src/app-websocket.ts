import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { createServer } from 'http'
import ChatSocketManager from './websocket/chatSocket'

// Importar rotas
import authRoutes from './routes/auth'
import taskRoutes from './routes/tasks'
import pomodoroRoutes from './routes/pomodoro'
import achievementRoutes from './routes/achievements'
import communityRoutes from './routes/community'
import chatRoutes from './routes/chatRoutes'
import groupRoutes from './routes/groupRoutes'

// Carregar variáveis de ambiente
dotenv.config()

const app = express()
const server = createServer(app)

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
app.use('/api/chat', chatRoutes)
app.use('/api/groups', groupRoutes)

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

// Inicializar WebSocket
const chatSocketManager = new ChatSocketManager(server)

// Expor o gerenciador de WebSocket para uso em outras partes da aplicação
export { chatSocketManager }

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`🚀 StudyHub API com WebSocket rodando na porta ${PORT}`)
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`)
  console.log(`🔌 WebSocket habilitado para chat em tempo real`)
})

export default app
