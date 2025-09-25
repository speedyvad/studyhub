import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  BookOpen,
  Target,
  Brain,
  Coffee,
  Timer,
  X,
  Star,
  Zap
} from 'lucide-react';
import { useStore } from '../store/useStore';
import pomodoroApi from '../lib/pomodoroApi';

// Estados da sessão
type SessionState = 'setup' | 'confirmation' | 'focus' | 'break' | 'completed';

// Configurações do Pomodoro
interface PomodoroConfig {
  totalTime: number; // tempo total desejado em minutos
  focusTime: number; // minutos de foco por ciclo
  shortBreak: number; // minutos de pausa curta
  longBreak: number; // minutos de pausa longa
  sessionsUntilLongBreak: number;
}

// Plano de estudo gerado
interface StudyPlan {
  cycles: Array<{
    type: 'focus' | 'break' | 'longBreak';
    duration: number;
    subject: string;
  }>;
  totalCoins: number;
  estimatedTime: number;
}

// Matérias disponíveis
const subjects = [
  'Matemática', 'Física', 'Química', 'Biologia', 'História', 
  'Geografia', 'Português', 'Inglês', 'Programação', 'Outros'
];

export default function FocusSession() {
  const { user } = useStore();
  const [config, setConfig] = useState<PomodoroConfig>({
    totalTime: 60, // 1 hora por padrão
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4
  });
  
  const [currentState, setCurrentState] = useState<SessionState>('setup');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Matemática']);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // em segundos
  const [sessionCount, setSessionCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);

  // Algoritmo para gerar plano de estudo
  const generateStudyPlan = (totalTime: number, subjects: string[]): StudyPlan => {
    const cycles = [];
    let remainingTime = totalTime;
    let focusSessions = 0;
    let totalCoins = 0;
    let subjectIndex = 0;
    
    while (remainingTime > 0) {
      // Adicionar sessão de foco
      const focusDuration = Math.min(config.focusTime, remainingTime);
      cycles.push({
        type: 'focus',
        duration: focusDuration,
        subject: subjects[subjectIndex % subjects.length]
      });
      focusSessions++;
      totalCoins += focusDuration * 2; // 2 coins por minuto de foco
      remainingTime -= focusDuration;
      subjectIndex++;
      
      // Se ainda há tempo, adicionar pausa
      if (remainingTime > 0) {
        const isLongBreak = focusSessions % config.sessionsUntilLongBreak === 0;
        const breakDuration = isLongBreak ? config.longBreak : config.shortBreak;
        const actualBreakDuration = Math.min(breakDuration, remainingTime);
        
        cycles.push({
          type: isLongBreak ? 'longBreak' : 'break',
          duration: actualBreakDuration,
          subject: subjects[0] // Pausa não tem matéria específica
        });
        remainingTime -= actualBreakDuration;
      }
    }
    
    return {
      cycles,
      totalCoins,
      estimatedTime: totalTime
    };
  };

  // Gerar plano quando configurar
  const generatePlan = () => {
    const plan = generateStudyPlan(config.totalTime, selectedSubjects);
    setStudyPlan(plan);
    setCurrentState('confirmation');
  };

  // Iniciar sessão
  const startSession = async () => {
    if (currentState === 'confirmation' && studyPlan) {
      setCurrentState('focus');
      setTimeLeft(studyPlan.cycles[0].duration * 60);
      setCurrentCycle(0);
      setShowOverlay(false);
      
      try {
        const response = await pomodoroApi.startSession(studyPlan.cycles[0].duration);
        if (response.success) {
          setCurrentSessionId(response.data.session.id);
        }
      } catch (error) {
        console.error('Erro ao iniciar sessão:', error);
      }
      
      setIsRunning(true);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleSessionComplete();
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSessionComplete = async () => {
    setIsRunning(false);
    
    if (currentState === 'focus') {
      // Sessão de foco completada
      if (currentSessionId) {
        try {
          await pomodoroApi.completeSession(currentSessionId);
          setCurrentSessionId(null);
        } catch (error) {
          console.error('Erro ao finalizar sessão:', error);
        }
      }
      
      setSessionCount(sessionCount + 1);
    }
    
    // Avançar para o próximo ciclo
    const nextCycle = currentCycle + 1;
    
    if (nextCycle >= studyPlan!.cycles.length) {
      // Sessão completa
      setCurrentState('completed');
      setIsRunning(false);
    } else {
      const nextCycleData = studyPlan!.cycles[nextCycle];
      setCurrentCycle(nextCycle);
      setTimeLeft(nextCycleData.duration * 60);
      
      if (nextCycleData.type === 'focus') {
        setCurrentState('focus');
        // Iniciar nova sessão de foco
        try {
          const response = await pomodoroApi.startSession(nextCycleData.duration);
          if (response.success) {
            setCurrentSessionId(response.data.session.id);
          }
        } catch (error) {
          console.error('Erro ao iniciar sessão:', error);
        }
      } else {
        setCurrentState('break');
      }
      
      // Continuar automaticamente
      setIsRunning(true);
    }
  };

  const pauseSession = () => {
    setIsRunning(false);
  };

  const resetSession = () => {
    setIsRunning(false);
    setCurrentState('setup');
    setTimeLeft(config.focusTime * 60);
    setSessionCount(0);
    setCurrentSessionId(null);
    setStudyPlan(null);
    setCurrentCycle(0);
    setShowOverlay(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentSubject = () => {
    if (studyPlan && currentCycle < studyPlan.cycles.length) {
      return studyPlan.cycles[currentCycle].subject;
    }
    return selectedSubjects[0];
  };

  const getProgressPercentage = () => {
    if (!studyPlan) return 0;
    return ((currentCycle + 1) / studyPlan.cycles.length) * 100;
  };

  const getCycleProgressPercentage = () => {
    if (!studyPlan || currentCycle >= studyPlan.cycles.length) return 0;
    const currentCycleData = studyPlan.cycles[currentCycle];
    const totalSeconds = currentCycleData.duration * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  // Overlay de configuração
  if (showOverlay && currentState === 'setup') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sessão de Foco</h2>
            <p className="text-gray-600">Configure sua sessão de estudo</p>
          </div>

          <div className="space-y-4">
            {/* Tempo Total */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quanto tempo deseja estudar?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[30, 60, 90, 120, 180].map(time => (
                  <button
                    key={time}
                    onClick={() => setConfig({...config, totalTime: time})}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      config.totalTime === time
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {time}min
                  </button>
                ))}
              </div>
            </div>

            {/* Matérias */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matérias (máximo 2)
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {subjects.map(subject => (
                  <button
                    key={subject}
                    onClick={() => {
                      if (selectedSubjects.includes(subject)) {
                        setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
                      } else if (selectedSubjects.length < 2) {
                        setSelectedSubjects([...selectedSubjects, subject]);
                      }
                    }}
                    className={`p-2 rounded-lg border-2 transition-all text-sm ${
                      selectedSubjects.includes(subject)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={!selectedSubjects.includes(subject) && selectedSubjects.length >= 2}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={generatePlan}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Gerar Plano
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Overlay de confirmação
  if (showOverlay && currentState === 'confirmation' && studyPlan) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Desafio Aceito!</h2>
            <p className="text-gray-600">Seu plano de estudo está pronto</p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{studyPlan.estimatedTime}min</div>
                <div className="text-sm text-gray-600">Tempo Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{studyPlan.totalCoins} 🪙</div>
                <div className="text-sm text-gray-600">Coins a Ganhar</div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Seu Plano:</h3>
            <div className="space-y-2">
              {studyPlan.cycles.slice(0, 4).map((cycle, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm">
                    {cycle.type === 'focus' ? '🎯' : cycle.type === 'break' ? '☕' : '🌴'} 
                    {cycle.type === 'focus' ? 'Foco' : 'Pausa'} - {cycle.subject}
                  </span>
                  <span className="text-sm font-medium">{cycle.duration}min</span>
                </div>
              ))}
              {studyPlan.cycles.length > 4 && (
                <div className="text-center text-sm text-gray-500">
                  +{studyPlan.cycles.length - 4} ciclos adicionais
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowOverlay(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={startSession}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <Zap className="w-4 h-4 inline mr-2" />
              Iniciar Desafio
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Modo foco (tela cheia)
  if (currentState === 'focus' || currentState === 'break') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        {/* Header */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={resetSession}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">{getCurrentSubject()}</h1>
              <p className="text-sm text-white/70">
                {currentState === 'focus' ? 'Tempo de Foco' : 'Pausa'}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-white/70">Ciclo {currentCycle + 1} de {studyPlan?.cycles.length}</div>
            <div className="text-sm text-white/70">{sessionCount} sessões completas</div>
          </div>
        </div>

        {/* Timer Central */}
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            {/* Timer Circular */}
            <div className="relative w-80 h-80 mb-8">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Círculo de fundo */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-white/20"
                />
                {/* Círculo de progresso */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - getCycleProgressPercentage() / 100)}`}
                  className={currentState === 'focus' ? 'text-red-400' : 'text-green-400'}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Tempo no centro */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-lg text-white/70">
                    {currentState === 'focus' ? 'Foco' : 'Pausa'}
                  </div>
                </div>
              </div>
            </div>

            {/* Controles */}
            <div className="flex justify-center space-x-4">
              {!isRunning ? (
                <button
                  onClick={() => setIsRunning(true)}
                  className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-full font-medium transition-colors"
                >
                  <Play className="w-5 h-5 inline mr-2" />
                  Continuar
                </button>
              ) : (
                <button
                  onClick={pauseSession}
                  className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-full font-medium transition-colors"
                >
                  <Pause className="w-5 h-5 inline mr-2" />
                  Pausar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progresso na parte inferior */}
        <div className="absolute bottom-6 left-6 right-6">
          {/* Barra de progresso do ciclo atual */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-white/70 mb-2">
              <span>Progresso do Ciclo</span>
              <span>{Math.round(getCycleProgressPercentage())}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  currentState === 'focus' ? 'bg-red-400' : 'bg-green-400'
                }`}
                style={{ width: `${getCycleProgressPercentage()}%` }}
              />
            </div>
          </div>

          {/* Barra de progresso geral */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-white/70 mb-2">
              <span>Progresso da Sessão</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-1000"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>

          {/* Próximos ciclos */}
          <div className="flex space-x-2 overflow-x-auto">
            {studyPlan?.cycles.slice(currentCycle, currentCycle + 5).map((cycle, index) => (
              <div
                key={currentCycle + index}
                className={`flex-shrink-0 p-2 rounded-lg text-xs ${
                  index === 0
                    ? 'bg-white/30 text-white'
                    : 'bg-white/10 text-white/70'
                }`}
              >
                {cycle.type === 'focus' ? '🎯' : '☕'} {cycle.duration}min
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Tela de conclusão
  if (currentState === 'completed') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 text-white flex items-center justify-center">
        <motion.div
          className="text-center max-w-md mx-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-yellow-600" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4">Parabéns! 🎉</h1>
          <p className="text-xl text-white/80 mb-6">
            Você completou sua sessão de foco!
          </p>
          
          <div className="bg-white/10 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-yellow-400">{studyPlan?.totalCoins} 🪙</div>
                <div className="text-sm text-white/70">Coins Ganhos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{sessionCount}</div>
                <div className="text-sm text-white/70">Sessões Completas</div>
              </div>
            </div>
          </div>
          
          <button
            onClick={resetSession}
            className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-full font-medium transition-colors"
          >
            Nova Sessão
          </button>
        </motion.div>
      </div>
    );
  }

  return null;
}