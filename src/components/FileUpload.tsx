import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, Image, Video, FileText, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  selectedFile?: File | null;
  accept?: string;
  maxSize?: number; // em MB
  types?: string[];
  className?: string;
}

const getFileIcon = (file: File) => {
  const type = file.type;
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Video;
  if (type.includes('pdf') || type.includes('document')) return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function FileUpload({ 
  onFileSelect, 
  onFileRemove, 
  selectedFile, 
  accept = "*/*",
  maxSize = 10,
  types = ['image/*', 'video/*', 'application/pdf', 'text/*'],
  className = ""
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Máximo: ${maxSize}MB`);
      return;
    }

    // Validar tipo
    const isValidType = types.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isValidType) {
      toast.error('Tipo de arquivo não suportado');
      return;
    }

    setIsUploading(true);
    
    // Simular upload
    setTimeout(() => {
      onFileSelect(file);
      setIsUploading(false);
      toast.success('Arquivo selecionado com sucesso!');
    }, 1000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    if (onFileRemove) {
      onFileRemove();
      toast.success('Arquivo removido');
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {!selectedFile ? (
        <motion.div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            animate={isUploading ? { rotate: 360 } : {}}
            transition={{ duration: 1, repeat: isUploading ? Infinity : 0 }}
            className="mx-auto mb-4"
          >
            <Upload className="w-12 h-12 text-gray-400" />
          </motion.div>
          
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {isUploading ? 'Processando arquivo...' : 'Arraste um arquivo aqui'}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            ou clique para selecionar
          </p>
          
          <div className="text-xs text-gray-500 dark:text-gray-500">
            <p>Tipos suportados: {types.join(', ')}</p>
            <p>Tamanho máximo: {maxSize}MB</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {(() => {
                const IconComponent = getFileIcon(selectedFile);
                return <IconComponent className="w-8 h-8 text-blue-500" />;
              })()}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-500" />
              {onFileRemove && (
                <button
                  onClick={removeFile}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
