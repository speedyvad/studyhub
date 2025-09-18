import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface TaskContainerProps {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}

export default function TaskContainer({ id, title, children, className = '' }: TaskContainerProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <motion.div
      ref={setNodeRef}
      className={`space-y-3 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h3 
        className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <span>{title}</span>
        {isOver && (
          <motion.span
            className="text-blue-500"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            📥
          </motion.span>
        )}
      </motion.h3>
      
      <motion.div
        className={`min-h-[100px] p-4 rounded-lg border-2 border-dashed transition-all duration-200 ${
          isOver 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
        }`}
        animate={{
          scale: isOver ? 1.02 : 1,
          borderColor: isOver ? '#60a5fa' : undefined,
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
