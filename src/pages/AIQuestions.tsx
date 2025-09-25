import { motion } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  Lock, 
  Star,
  BookOpen,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';

export default function AIQuestions() {
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.div 
          className="flex items-center space-x-4 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div 
            className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Brain className="w-8 h-8" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold">Questões Geradas por IA</h1>
            <p className="text-purple-100">Inteligência artificial para criar questões personalizadas</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex items-center space-x-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">IA Avançada</span>
          </motion.div>
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Lock className="w-5 h-5" />
            <span className="font-semibold">Recurso Premium</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Development Notice */}
      <motion.div 
        className="card border-2 border-dashed border-purple-200 bg-purple-50 dark:bg-purple-900/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="text-center py-12">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              repeatDelay: 2 
            }}
            className="w-20 h-20 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Brain className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🚧 Página em Desenvolvimento
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Estamos trabalhando duro para trazer uma experiência incrível de geração de questões 
            personalizadas usando inteligência artificial. Em breve você poderá criar questões 
            únicas baseadas no seu material de estudo!
          </p>

          <motion.div 
            className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Em breve - Recurso Premium</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Feature 1 */}
        <motion.div 
          className="card hover:shadow-lg transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Questões Personalizadas</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Gere questões baseadas no seu material de estudo, com diferentes níveis de dificuldade.
          </p>
        </motion.div>

        {/* Feature 2 */}
        <motion.div 
          className="card hover:shadow-lg transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Múltiplas Matérias</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Questões para Matemática, Física, Química, História, Geografia e muito mais.
          </p>
        </motion.div>

        {/* Feature 3 */}
        <motion.div 
          className="card hover:shadow-lg transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Geração Instantânea</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Crie centenas de questões em segundos com nossa IA avançada.
          </p>
        </motion.div>

        {/* Feature 4 */}
        <motion.div 
          className="card hover:shadow-lg transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Adaptação Inteligente</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            A IA aprende com suas respostas e adapta as questões ao seu nível.
          </p>
        </motion.div>

        {/* Feature 5 */}
        <motion.div 
          className="card hover:shadow-lg transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Questões Únicas</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Cada questão é gerada exclusivamente para você, evitando repetições.
          </p>
        </motion.div>

        {/* Feature 6 */}
        <motion.div 
          className="card hover:shadow-lg transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">IA Avançada</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Utilizamos os modelos mais avançados de IA para garantir qualidade máxima.
          </p>
        </motion.div>
      </div>

      {/* Coming Soon CTA */}
      <motion.div 
        className="card bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.1 }}
      >
        <div className="text-center py-8">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              repeatDelay: 3 
            }}
            className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Quer ser notificado quando estiver pronto?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Deixe seu email e te avisaremos assim que o recurso estiver disponível!
          </p>
          
          <motion.button
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            Me notifique quando estiver pronto
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
