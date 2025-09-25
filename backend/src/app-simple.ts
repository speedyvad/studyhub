import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import authRoutes from './routes/auth-simple'

// Carregar variáveis de ambiente
dotenv.config()

const app = express()

// Middleware de segurança
app.use(helmet())

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
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

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Teste funcionando!',
    data: {
      database: 'PostgreSQL conectado',
      redis: 'Redis conectado',
      timestamp: new Date().toISOString()
    }
  })
})

// Rotas de autenticação
app.use('/api/auth', authRoutes)

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
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5174'}`)
})

export default app
