import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  CheckSquare, 
  Clock, 
  TrendingUp, 
  Music,
  Trophy,
  Star,
  Target
} from 'lucide-react';

export default function Dashboard() {
  const { user, tasks, completedSessions, achievements, posts } = useStore();

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasksToday = tasks.filter(task => 
    task.completed && 
    new Date(task.createdAt).toDateString() === new Date().toDateString()
  );
  const sessionsToday = completedSessions.filter(session => 
    new Date(session.timestamp).toDateString() === new Date().toDateString()
  );
  const unlockedAchievements = achievements.filter(achievement => achievement.unlocked);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Welcome header */}
      <motion.div 
        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.h1 
          className="text-3xl font-bold mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Olá, {user?.name?.split(' ')[0]}! 👋
        </motion.h1>
        <motion.p 
          className="text-blue-100"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Pronto para mais um dia de estudos? Vamos alcançar seus objetivos!
        </motion.p>
        <motion.div 
          className="flex items-center space-x-6 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">{user?.points} pontos</span>
          </motion.div>
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Clock className="w-5 h-5" />
            <span className="font-semibold">{user?.studyHours.toFixed(1)}h estudadas</span>
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick actions */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Link
                to="/pomodoro"
                className="card hover:shadow-lg transition-all duration-300 group block"
              >
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Play className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Iniciar Pomodoro</h3>
                    <p className="text-sm text-gray-600">25 minutos de foco</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Link
                to="/tasks"
                className="card hover:shadow-lg transition-all duration-300 group block"
              >
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <CheckSquare className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ver Tarefas</h3>
                    <p className="text-sm text-gray-600">{pendingTasks.length} pendentes</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Today's tasks */}
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Tarefas de Hoje</h2>
              <Link 
                to="/tasks" 
                className="text-blue-500 hover:text-blue-600 font-medium text-sm transition-colors"
              >
                Ver todas
              </Link>
            </div>
            
            {pendingTasks.length > 0 ? (
              <div className="space-y-3">
                {pendingTasks.slice(0, 3).map((task, index) => (
                  <motion.div 
                    key={task.id} 
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.div 
                      className={`w-4 h-4 rounded border-2 ${
                        task.priority === 'high' ? 'border-red-400' :
                        task.priority === 'medium' ? 'border-yellow-400' : 'border-gray-300'
                      }`}
                      whileHover={{ scale: 1.2 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-600">{task.subject}</p>
                    </div>
                  </motion.div>
                ))}
                {pendingTasks.length > 3 && (
                  <motion.p 
                    className="text-sm text-gray-600 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                  >
                    +{pendingTasks.length - 3} tarefas restantes
                  </motion.p>
                )}
              </div>
            ) : (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                </motion.div>
                <p className="text-gray-600">Nenhuma tarefa pendente!</p>
                <p className="text-sm text-gray-500">Que tal adicionar uma nova?</p>
              </motion.div>
            )}
          </motion.div>

          {/* Study session summary */}
          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Resumo de Hoje</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold text-text-primary">{sessionsToday.length}</p>
                <p className="text-sm text-text-secondary">Pomodoros</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <CheckSquare className="w-6 h-6 text-secondary" />
                </div>
                <p className="text-2xl font-bold text-text-primary">{completedTasksToday.length}</p>
                <p className="text-sm text-text-secondary">Tarefas</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gamification-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-gamification" />
                </div>
                <p className="text-2xl font-bold text-text-primary">{sessionsToday.length * 25}</p>
                <p className="text-sm text-text-secondary">Pontos</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-text-primary">
                  {((sessionsToday.length * 25) / 60).toFixed(1)}h
                </p>
                <p className="text-sm text-text-secondary">Estudadas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Music player placeholder */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Music className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-text-primary">Música para Foco</h3>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <Music className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-text-secondary mb-2">Spotify Integration</p>
              <p className="text-xs text-text-secondary">Em breve</p>
            </div>
          </div>

          {/* Recent achievements */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Trophy className="w-5 h-5 text-gamification" />
              <h3 className="font-semibold text-text-primary">Conquistas</h3>
            </div>
            <div className="space-y-3">
              {unlockedAchievements.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gamification-50 rounded-lg">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <p className="font-medium text-text-primary text-sm">{achievement.title}</p>
                    <p className="text-xs text-text-secondary">+{achievement.points} pontos</p>
                  </div>
                </div>
              ))}
              {unlockedAchievements.length === 0 && (
                <p className="text-sm text-text-secondary text-center py-4">
                  Complete tarefas para desbloquear conquistas!
                </p>
              )}
            </div>
          </div>

          {/* Community feed */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">Comunidade</h3>
              <Link 
                to="/community" 
                className="text-primary hover:text-primary-600 font-medium text-sm"
              >
                Ver mais
              </Link>
            </div>
            <div className="space-y-3">
              {posts.slice(0, 2).map((post) => (
                <div key={post.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <img
                      src={post.author.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=24&h=24&fit=crop&crop=face'}
                      alt={post.author.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium text-text-primary text-sm">{post.author.name}</span>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2">{post.content}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-text-secondary">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
