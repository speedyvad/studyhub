import { motion } from 'framer-motion';

interface SkeletonCardProps {
  lines?: number;
  height?: string;
}

export default function SkeletonCard({ lines = 3, height = 'h-32' }: SkeletonCardProps) {
  return (
    <motion.div
      className={`bg-white rounded-xl border border-gray-100 p-6 ${height}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className="h-4 bg-gray-200 rounded"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.1,
            }}
            style={{
              width: `${Math.random() * 40 + 60}%`,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
