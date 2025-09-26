import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle, Clock, Target, X } from 'lucide-react';
import toast from 'react-hot-toast';

type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export default function Pomodoro() {
  const { currentSession, completedSessions, startPomodoro, pausePomodoro, resetPomodoro, completePomodoro } = useStore();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos em segundos
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [selectedDuration, setSelectedDuration] = useState(25);
  const intervalRef = useRef<number | null>(null);

  // Configurações de duração
  const durations = [
    { minutes: 15, label: '15 min', color: 'bg-blue-500' },
    { minutes: 25, label: '25 min', color: 'bg-primary' },
    { minutes: 45, label: '45 min', color: 'bg-purple-500' },
    { minutes: 60, label: '60 min', color: 'bg-red-500' },
  ];

  // Inicializar timer quando uma sessão é iniciada
  useEffect(() => {
    if (currentSession && timerState === 'idle') {
      setTimeLeft(selectedDuration * 60);
      setTimerState('running');
    }
  }, [currentSession, selectedDuration, timerState]);

  // Timer countdown
  useEffect(() => {
    if (timerState === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerState('completed');
            completePomodoro();
            toast.success('🎉 Pomodoro concluído! Parabéns! +25 pontos!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState, timeLeft, completePomodoro]);

  const handleStart = () => {
    if (timerState === 'idle') {
      startPomodoro();
      toast.success('Pomodoro iniciado! Foco total! 🎯');
    } else if (timerState === 'paused') {
      setTimerState('running');
      toast.success('Pomodoro retomado! Continue focado! 💪');
    }
  };

  const handlePause = () => {
    if (timerState === 'running') {
      setTimerState('paused');
      pausePomodoro();
      toast('Pomodoro pausado. Descanse um pouco! ☕');
    }
  };

  const handleReset = () => {
    setTimerState('idle');
    setTimeLeft(selectedDuration * 60);
    resetPomodoro();
    toast('Pomodoro resetado. Pronto para começar! 🔄');
  };

  const handleExit = () => {
    if (timerState === 'running' || timerState === 'paused') {
      if (confirm('Tem certeza que deseja sair? O progresso atual será perdido.')) {
        handleReset();
        toast('Sessão cancelada. Você pode começar uma nova quando quiser! 🚪');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const total = selectedDuration * 60;
    return ((total - timeLeft) / total) * 100;
  };

  const getTimerColor = () => {
    switch (timerState) {
      case 'running':
        return 'text-primary';
      case 'paused':
        return 'text-yellow-500';
      case 'completed':
        return 'text-secondary';
      default:
        return 'text-gray-500';
    }
  };


  // Estatísticas do dia
  const todaySessions = completedSessions.filter(session => 
    new Date(session.timestamp).toDateString() === new Date().toDateString()
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Pomodoro Timer</h1>
        <p className="text-text-secondary">Mantenha o foco com ciclos de estudo eficientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timer principal */}
        <div className="lg:col-span-2">
          <div className="card text-center">
            {/* Seletor de duração */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Duração da Sessão</h3>
              <div className="flex justify-center space-x-3">
                {durations.map((duration) => (
                  <button
                    key={duration.minutes}
                    onClick={() => {
                      if (timerState === 'idle') {
                        setSelectedDuration(duration.minutes);
                        setTimeLeft(duration.minutes * 60);
                      }
                    }}
                    disabled={timerState !== 'idle'}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      selectedDuration === duration.minutes
                        ? `${duration.color} text-white shadow-lg`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } ${timerState !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {duration.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timer circular */}
            <motion.div 
              className="relative w-80 h-80 mx-auto mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Círculo de fundo */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-gray-200"
                />
                {/* Círculo de progresso */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
                  className={`transition-all duration-1000 ${getTimerColor()}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                  animate={{ 
                    strokeDashoffset: 2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)
                  }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              </svg>
              
              {/* Conteúdo do timer */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div 
                  className={`text-6xl font-bold ${getTimerColor()} mb-2`}
                  key={timeLeft}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {formatTime(timeLeft)}
                </motion.div>
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={timerState}
                    className="text-gray-600"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {timerState === 'idle' && 'Pronto para começar'}
                    {timerState === 'running' && 'Foco total!'}
                    {timerState === 'paused' && 'Pausado'}
                    {timerState === 'completed' && 'Sessão concluída! 🎉'}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Botão de Sair - Sempre visível quando timer está ativo */}
            {(timerState === 'running' || timerState === 'paused') && (
              <motion.div 
                className="flex justify-center mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.button
                  onClick={handleExit}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <X className="w-4 h-4" />
                  <span>Sair</span>
                </motion.button>
              </motion.div>
            )}

            {/* Controles */}
            <motion.div 
              className="flex justify-center space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <AnimatePresence mode="wait">
                {timerState === 'idle' && (
                  <motion.button
                    key="start"
                    onClick={handleStart}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-medium flex items-center space-x-2 text-lg transition-colors duration-200 shadow-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <Play className="w-6 h-6" />
                    <span>Iniciar</span>
                  </motion.button>
                )}

                {timerState === 'running' && (
                  <motion.button
                    key="pause"
                    onClick={handlePause}
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-medium flex items-center space-x-2 text-lg transition-colors duration-200 shadow-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <Pause className="w-6 h-6" />
                    <span>Pausar</span>
                  </motion.button>
                )}

                {timerState === 'paused' && (
                  <motion.div
                    key="paused-controls"
                    className="flex space-x-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <motion.button
                      onClick={handleStart}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-medium flex items-center space-x-2 text-lg transition-colors duration-200 shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      <Play className="w-6 h-6" />
                      <span>Continuar</span>
                    </motion.button>
                    <motion.button
                      onClick={handleReset}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-medium flex items-center space-x-2 text-lg transition-colors duration-200 shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      <RotateCcw className="w-6 h-6" />
                      <span>Resetar</span>
                    </motion.button>
                  </motion.div>
                )}

                {timerState === 'completed' && (
                  <motion.button
                    key="completed"
                    onClick={handleReset}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-medium flex items-center space-x-2 text-lg transition-colors duration-200 shadow-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <RotateCcw className="w-6 h-6" />
                    <span>Nova Sessão</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Sidebar com estatísticas */}
        <div className="space-y-6">
          {/* Estatísticas do dia */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-text-primary">Hoje</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Sessões</p>
                    <p className="text-sm text-text-secondary">Completadas</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-primary">{todaySessions.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Tempo</p>
                    <p className="text-sm text-text-secondary">Estudado</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-secondary">
                  {((todaySessions.length * 25) / 60).toFixed(1)}h
                </span>
              </div>
            </div>
          </div>

          {/* Dicas */}
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-4">💡 Dicas</h3>
            <div className="space-y-3 text-sm text-text-secondary">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800 mb-1">Foco Total</p>
                <p>Desligue notificações e elimine distrações durante o Pomodoro.</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800 mb-1">Pausas</p>
                <p>Use os intervalos para descansar os olhos e se alongar.</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="font-medium text-yellow-800 mb-1">Consistência</p>
                <p>Mantenha um ritmo regular para melhores resultados.</p>
              </div>
            </div>
          </div>

          {/* Próximas metas */}
          <div className="card">
            <h3 className="font-semibold text-text-primary mb-4">🎯 Metas</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">5 sessões hoje</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((todaySessions.length / 5) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">2 horas hoje</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-secondary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(((todaySessions.length * 25) / 60 / 2) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
