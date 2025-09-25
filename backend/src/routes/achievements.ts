import { Router } from 'express'
import { 
  getAchievements, 
  getUserAchievements, 
  checkAchievements, 
  getLeaderboard 
} from '../controllers/achievementController'
import { authenticateToken, optionalAuth } from '../middleware/auth'

const router = Router()

// Rotas públicas
router.get('/leaderboard', getLeaderboard)

// Rotas protegidas
router.get('/', authenticateToken, getAchievements)
router.get('/user', authenticateToken, getUserAchievements)
router.post('/check', authenticateToken, checkAchievements)

export default router


