import { Router } from 'express'
import { 
  getTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask, 
  completeTask,
  getTaskStats // 👈 1. IMPORTE A NOVA FUNÇÃO
} from '../controllers/taskController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Todas as rotas de tarefas precisam de autenticação
router.use(authenticateToken)

// CRUD de tarefas
router.get('/', getTasks)
router.get('/stats', getTaskStats) // 👈 2. ADICIONE A NOVA ROTA
router.get('/:id', getTaskById)
router.post('/', createTask)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)

router.patch('/:id/complete', completeTask)

export default router