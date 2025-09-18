import { motion } from 'framer-motion';

export default function TaskSkeleton() {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start space-x-4">
        {/* Drag handle skeleton */}
        <div className="flex-shrink-0 p-2">
          <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Checkbox skeleton */}
        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />

        {/* Content skeleton */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              {/* Title skeleton */}
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
              
              {/* Description skeleton */}
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
              
              {/* Tags skeleton */}
              <div className="flex items-center space-x-4 mt-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
              </div>
            </div>

            {/* Actions skeleton */}
            <div className="flex items-center space-x-2 ml-4">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
