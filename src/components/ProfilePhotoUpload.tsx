import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfilePhotoUploadProps {
  currentAvatar?: string;
  onPhotoSelect: (file: File) => void;
  onPhotoRemove?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32'
};

export default function ProfilePhotoUpload({ 
  currentAvatar, 
  onPhotoSelect, 
  onPhotoRemove,
  size = 'md',
  className = ""
}: ProfilePhotoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validar se é imagem
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas imagens');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo: 5MB');
      return;
    }

    setIsUploading(true);
    
    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Simular upload
    setTimeout(() => {
      onPhotoSelect(file);
      setIsUploading(false);
      toast.success('Foto de perfil atualizada!');
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

  const removePhoto = () => {
    setPreview(null);
    if (onPhotoRemove) {
      onPhotoRemove();
      toast.success('Foto removida');
    }
  };

  const displayImage = preview || currentAvatar;

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <motion.div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer transition-all ${
          isDragOver 
            ? 'ring-4 ring-blue-500 ring-opacity-50' 
            : 'hover:ring-4 hover:ring-gray-300 hover:ring-opacity-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt="Foto de perfil"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <Camera className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {/* Overlay de upload */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all flex items-center justify-center">
          <motion.div
            animate={isUploading ? { rotate: 360 } : {}}
            transition={{ duration: 1, repeat: isUploading ? Infinity : 0 }}
            className="opacity-0 hover:opacity-100 transition-opacity"
          >
            {isUploading ? (
              <Upload className="w-6 h-6 text-white" />
            ) : (
              <Camera className="w-6 h-6 text-white" />
            )}
          </motion.div>
        </div>

        {/* Indicador de sucesso */}
        {!isUploading && displayImage && (
          <motion.div
            className="absolute top-1 right-1 bg-green-500 rounded-full p-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Check className="w-3 h-3 text-white" />
          </motion.div>
        )}

        {/* Botão de remover */}
        {displayImage && onPhotoRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              removePhoto();
            }}
            className="absolute top-1 left-1 bg-red-500 hover:bg-red-600 rounded-full p-1 transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        )}
      </motion.div>

      {/* Texto de ajuda */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {isUploading ? 'Processando...' : 'Clique para alterar'}
        </p>
      </div>
    </div>
  );
}
