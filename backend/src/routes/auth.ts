import { Router } from 'express'
import { register, login, getProfile, updateProfile } from '../controllers/authController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Rotas públicas
router.post('/register', register)
router.post('/login', login)

// Rotas protegidas
router.get('/profile', authenticateToken, getProfile)
router.put('/profile', authenticateToken, updateProfile)

export default router


