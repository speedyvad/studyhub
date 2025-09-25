import { Router } from 'express'
import { 
  getSessions, 
  getSessionById, 
  createSession, 
  completeSession, 
  getStats 
} from '../controllers/pomodoroController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Todas as rotas de pomodoro precisam de autenticação
router.use(authenticateToken)

// CRUD de sessões
router.get('/', getSessions)
router.get('/stats', getStats)
router.get('/:id', getSessionById)
router.post('/', createSession)
router.patch('/:id/complete', completeSession)

export default router


