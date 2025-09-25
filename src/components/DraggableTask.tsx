import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Check, Edit3, Trash2, GripVertical } from 'lucide-react';
import type { Task } from '../types/task';

interface DraggableTaskProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function DraggableTask({ task, onToggle, onEdit, onDelete }: DraggableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    low: 'border-gray-300',
    medium: 'border-yellow-400',
    high: 'border-red-400'
  };

  const priorityIcons = {
    low: '🟢',
    medium: '🟡', 
    high: '🔴'
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`card transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-105 shadow-lg' : 'hover:shadow-md'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      layout
    >
      <div className="flex items-start space-x-4">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Checkbox */}
        <motion.button
          onClick={() => onToggle(task.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-green-500'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {task.completed && <Check className="w-4 h-4" />}
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <motion.h3 
                className={`font-medium ${
                  task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'
                }`}
                animate={{ 
                  opacity: task.completed ? 0.6 : 1,
                  textDecoration: task.completed ? 'line-through' : 'none'
                }}
                transition={{ duration: 0.3 }}
              >
                {task.title}
              </motion.h3>
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {task.description}
                </p>
              )}
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  📚 {task.subject}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full border ${priorityColors[task.priority]}`}>
                  {priorityIcons[task.priority]} {task.priority === 'low' ? 'Baixa' : task.priority === 'medium' ? 'Média' : 'Alta'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  📅 {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <motion.button
                onClick={() => onEdit(task.id)}
                className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Editar"
              >
                <Edit3 className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => onDelete(task.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
