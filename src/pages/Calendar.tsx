import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import tasksApi from '../lib/tasksApi';
import type { Task } from '../types/task';
import toast from 'react-hot-toast';

export default function Calendar() {
  const { user } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await tasksApi.getTasks();
        setTasks(response.data.tasks || []);
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        toast.error('Erro ao carregar tarefas');
      }
    };

    if (user) {
      loadTasks();
    }
  }, [user]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      // Ajuste de fuso horário se necessário, mas assumindo UTC ou local consistente
      // Comparando apenas dia/mês/ano
      return isSameDay(taskDate, date);
    });
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const selectedDayTasks = selectedDate ? getTasksForDay(selectedDate) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Calendário</h1>
          <p className="text-text-secondary">Planeje seus estudos e acompanhe prazos</p>
        </div>
        <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 min-w-[140px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 card">
          <div className="grid grid-cols-7 mb-4">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} className="aspect-square" />;
              
              const dayTasks = getTasksForDay(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              const hasHighPriority = dayTasks.some(t => t.priority === 'HIGH');

              return (
                <motion.button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all
                    ${isSelected 
                      ? 'border-primary bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                    ${isToday ? 'bg-blue-50 dark:bg-blue-900/10 font-bold text-blue-600 dark:text-blue-400' : ''}
                  `}
                >
                  <span className={`text-sm ${isSelected ? 'text-primary font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                    {date.getDate()}
                  </span>
                  
                  {/* Task Indicators */}
                  <div className="flex space-x-1 mt-1">
                    {dayTasks.length > 0 && (
                      <div className={`w-1.5 h-1.5 rounded-full ${hasHighPriority ? 'bg-red-500' : 'bg-blue-500'}`} />
                    )}
                    {dayTasks.length > 1 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="space-y-6">
          <div className="card h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary">
                {selectedDate ? (
                  <>
                    {selectedDate.getDate()} de {monthNames[selectedDate.getMonth()]}
                    {isSameDay(selectedDate, new Date()) && <span className="ml-2 text-sm text-primary font-normal">(Hoje)</span>}
                  </>
                ) : 'Selecione uma data'}
              </h3>
              <CalendarIcon className="w-5 h-5 text-gray-400" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {selectedDayTasks.length > 0 ? (
                selectedDayTasks.map(task => (
                  <motion.div 
                    key={task.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border ${
                      task.completed 
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-medium text-sm ${task.completed ? 'text-green-700 dark:text-green-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                          {task.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.subject}</p>
                      </div>
                      <div className={`
                        w-2 h-2 rounded-full mt-1.5
                        ${task.priority === 'HIGH' ? 'bg-red-500' : task.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'}
                      `} />
                    </div>
                    <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400 space-x-3">
                      {task.completed ? (
                        <span className="flex items-center text-green-600 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Concluída
                        </span>
                      ) : (
                        <span className="flex items-center text-orange-600 dark:text-orange-400">
                          <Clock className="w-3 h-3 mr-1" /> Pendente
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CalendarIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <p>Nenhuma tarefa para este dia</p>
                  <p className="text-sm mt-1">Aproveite para descansar ou adiantar estudos!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
