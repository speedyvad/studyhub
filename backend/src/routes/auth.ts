import { Router } from 'express'
import { register, login, getProfile } from '../controllers/authController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Rotas públicas
router.post('/register', register)
router.post('/login', login)

// Rotas protegidas
router.get('/profile', authenticateToken, getProfile)

export default router


