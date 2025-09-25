import { Router } from 'express'
import { 
  getPosts, 
  getPostById, 
  createPost, 
  likePost, 
  createComment, 
  deletePost 
} from '../controllers/communityController'
import { authenticateToken, optionalAuth } from '../middleware/auth'

const router = Router()

// Rotas públicas (com autenticação opcional)
router.get('/', optionalAuth, getPosts)
router.get('/:id', optionalAuth, getPostById)

// Rotas protegidas
router.post('/', authenticateToken, createPost)
router.post('/:id/like', authenticateToken, likePost)
router.post('/:id/comments', authenticateToken, createComment)
router.delete('/:id', authenticateToken, deletePost)

export default router


