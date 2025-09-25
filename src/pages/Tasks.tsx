import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  Plus, 
  Check, 
  X, 
  Search,
  BookOpen,
  Flag
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import DraggableTask from '../components/DraggableTask';
import TaskContainer from '../components/TaskContainer';
import TaskSkeleton from '../components/TaskSkeleton';
import EnhancedTaskForm from '../components/EnhancedTaskForm';
import { useLoading } from '../hooks/useLoading';
import toast from 'react-hot-toast';
import tasksApi from '../lib/tasksApi';
import type { Task, TaskStats } from '../types/task';

type Priority = 'low' | 'medium' | 'high';
type FilterType = 'all' | 'pending' | 'completed';

const subjects = [
  'Matemática', 'Física', 'Química', 'Biologia', 'História', 
  'Geografia', 'Português', 'Inglês', 'Programação', 'Outros'
];


export default function Tasks() {
  const { isAuthenticated } = useStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({ total: 0, completed: 0, pending: 0, completionRate: 0 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { withLoading } = useLoading(false, 800);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Carregar tarefas e estatísticas
  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const [tasksResponse, statsResponse] = await Promise.all([
        tasksApi.getTasks(),
        tasksApi.getStats()
      ]);
      
      setTasks(tasksResponse.data.tasks);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast.error('Erro ao carregar tarefas');
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();
    }
  }, [isAuthenticated]);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'Matemática',
    priority: 'medium' as Priority
  });

  const handleSubmit = async (taskData: any) => {
    try {
      await withLoading(async () => {
        if (editingTask) {
          await tasksApi.updateTask(editingTask, taskData);
          setEditingTask(null);
          toast.success('Tarefa atualizada com sucesso! ✏️');
        } else {
          await tasksApi.createTask(taskData);
          toast.success('Tarefa criada com sucesso! ✅');
        }
        setShowAddForm(false);
        loadTasks(); // Recarregar tarefas e estatísticas
      });
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      toast.error('Erro ao salvar tarefa');
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      // Aqui você implementaria a lógica de reordenação no store
      // Por enquanto, vamos apenas mostrar uma notificação
      toast.success('Tarefa reordenada! 🔄');
    }
  };

  const handleEdit = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditingTask(taskId);
      setShowAddForm(true);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await tasksApi.deleteTask(taskId);
        setTasks(tasks.filter(t => t.id !== taskId));
        toast.success('Tarefa excluída! 🗑️');
        loadTasks(); // Recarregar estatísticas
      } catch (error) {
        console.error('Erro ao deletar tarefa:', error);
        toast.error('Erro ao excluir tarefa');
      }
    }
  };

  const handleToggle = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const newCompleted = !task.completed;
        await tasksApi.updateTask(taskId, { completed: newCompleted });
        
        setTasks(tasks.map(t => 
          t.id === taskId ? { ...t, completed: newCompleted } : t
        ));
        
        toast.success(newCompleted ? 'Tarefa concluída! 🎉' : 'Tarefa marcada como pendente! ⏳');
        loadTasks(); // Recarregar estatísticas
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  // Filtrar tarefas
  const filteredTasks = tasks.filter(task => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'pending' && !task.completed) ||
      (filter === 'completed' && task.completed);
    
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = selectedSubject === 'all' || task.subject === selectedSubject;

    return matchesFilter && matchesSearch && matchesSubject;
  });


  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Tarefas</h1>
          <p className="text-text-secondary">Organize seus estudos e mantenha o foco</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Tarefa</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
              <p className="text-sm text-text-secondary">Total de tarefas</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Flag className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.pending}</p>
              <p className="text-sm text-text-secondary">Pendentes</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
              <Check className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.completed}</p>
              <p className="text-sm text-text-secondary">Concluídas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex space-x-2">
            {(['all', 'pending', 'completed'] as FilterType[]).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  filter === filterType
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterType === 'all' && 'Todas'}
                {filterType === 'pending' && 'Pendentes'}
                {filterType === 'completed' && 'Concluídas'}
              </button>
            ))}
          </div>

          {/* Subject filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Todas as matérias</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Enhanced Task Form */}
      <EnhancedTaskForm
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setEditingTask(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingTask ? tasks.find(t => t.id === editingTask) : undefined}
        isEditing={!!editingTask}
      />

      {/* Tasks List with Drag & Drop */}
      {isInitialLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tarefas Pendentes</h3>
            <div className="min-h-[100px] p-4 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3">
              {[1, 2, 3].map((i) => (
                <TaskSkeleton key={i} />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tarefas Concluídas</h3>
            <div className="min-h-[100px] p-4 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3">
              {[1, 2].map((i) => (
                <TaskSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Tasks */}
            <TaskContainer
              id="pending-tasks"
              title="Tarefas Pendentes"
              className="lg:col-span-1"
            >
              <SortableContext items={filteredTasks.filter(task => !task.completed).map(task => task.id)} strategy={verticalListSortingStrategy}>
                <AnimatePresence>
                  {filteredTasks.filter(task => !task.completed).map((task) => (
                    <DraggableTask
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </AnimatePresence>
              </SortableContext>
            {filteredTasks.filter(task => !task.completed).length === 0 && (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Flag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                </motion.div>
                <p className="text-gray-600 dark:text-gray-400">Nenhuma tarefa pendente!</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Que tal adicionar uma nova?</p>
              </motion.div>
            )}
          </TaskContainer>

          {/* Completed Tasks */}
          <TaskContainer
            id="completed-tasks"
            title="Tarefas Concluídas"
            className="lg:col-span-1"
          >
            <SortableContext items={filteredTasks.filter(task => task.completed).map(task => task.id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence>
                {filteredTasks.filter(task => task.completed).map((task) => (
                  <DraggableTask
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </SortableContext>
            {filteredTasks.filter(task => task.completed).length === 0 && (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Check className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                </motion.div>
                <p className="text-gray-600 dark:text-gray-400">Nenhuma tarefa concluída ainda!</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Complete suas tarefas para vê-las aqui.</p>
              </motion.div>
            )}
          </TaskContainer>
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <motion.div 
            className="card text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm || selectedSubject !== 'all' || filter !== 'all' 
                ? 'Nenhuma tarefa encontrada' 
                : 'Nenhuma tarefa criada ainda'
              }
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || selectedSubject !== 'all' || filter !== 'all'
                ? 'Tente ajustar os filtros ou criar uma nova tarefa.'
                : 'Comece criando sua primeira tarefa para organizar seus estudos.'
              }
            </p>
            {!searchTerm && selectedSubject === 'all' && filter === 'all' && (
              <motion.button
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Criar Primeira Tarefa
              </motion.button>
            )}
          </motion.div>
        )}
        </DndContext>
      )}
    </div>
  );
}
