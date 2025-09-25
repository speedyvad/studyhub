import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Smile, 
  Image, 
  Bold, 
  Italic, 
  Link,
  Hash,
  AtSign,
  Sparkles,
  X
} from 'lucide-react';

interface EnhancedCommentFormProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  isSubmitting?: boolean;
  maxLength?: number;
  showRichText?: boolean;
}

const emojiCategories = {
  '😀': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃'],
  '📚': ['📚', '📖', '📝', '✏️', '📐', '🧮', '🔬', '🧪', '🔍', '💡'],
  '🎯': ['🎯', '⚡', '🔥', '💪', '🚀', '⭐', '🌟', '💯', '🏆', '🎓'],
  '❤️': ['❤️', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍', '💕', '💖']
};

const formattingOptions = [
  { icon: Bold, action: 'bold', label: 'Negrito' },
  { icon: Italic, action: 'italic', label: 'Itálico' },
  { icon: Link, action: 'link', label: 'Link' },
  { icon: Hash, action: 'hashtag', label: 'Hashtag' },
  { icon: AtSign, action: 'mention', label: 'Menção' }
];

export default function EnhancedCommentForm({ 
  onSubmit, 
  placeholder = "Compartilhe seus pensamentos...",
  isSubmitting = false,
  maxLength = 500,
  showRichText = true
}: EnhancedCommentFormProps) {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    
    onSubmit(content);
    setContent('');
    setShowEmojiPicker(false);
    setShowFormatting(false);
  };

  const addEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const addFormatting = (type: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    let newCursorPos = start;

    switch (type) {
      case 'bold':
        formattedText = `**${selectedText || 'texto'}**`;
        newCursorPos = start + 2;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'texto'}*`;
        newCursorPos = start + 1;
        break;
      case 'link':
        formattedText = `[${selectedText || 'texto do link'}](url)`;
        newCursorPos = start + (selectedText ? selectedText.length + 2 : 12);
        break;
      case 'hashtag':
        formattedText = `#${selectedText || 'hashtag'}`;
        newCursorPos = start + 1;
        break;
      case 'mention':
        formattedText = `@${selectedText || 'usuário'}`;
        newCursorPos = start + 1;
        break;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > maxLength;
  const remainingChars = maxLength - characterCount;

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="p-4">
        {/* Rich Text Toolbar */}
        {showRichText && (
          <motion.div 
            className="flex items-center justify-between mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-1">
              {formattingOptions.map((option) => (
                <motion.button
                  key={option.action}
                  type="button"
                  onClick={() => addFormatting(option.action)}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title={option.label}
                >
                  <option.icon className="w-4 h-4" />
                </motion.button>
              ))}
            </div>
            
            <div className="flex items-center space-x-1">
              <motion.button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Adicionar emoji"
              >
                <Smile className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full px-4 py-3 pr-12 border rounded-xl resize-none transition-all duration-200 ${
              isFocused 
                ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
                : 'border-gray-200 dark:border-gray-600'
            } ${
              isOverLimit 
                ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-800' 
                : ''
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400`}
            rows={3}
            placeholder={placeholder}
            maxLength={maxLength + 50} // Allow some overflow for better UX
          />
          
          {/* Character Count */}
          <div className="absolute bottom-2 right-2 text-xs">
            <span className={`${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
              {characterCount}/{maxLength}
            </span>
          </div>
        </div>

        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Escolha um emoji:</p>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {Object.entries(emojiCategories).map(([category, emojis]) => (
                  <div key={category}>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">{category}</p>
                    <div className="grid grid-cols-10 gap-1">
                      {emojis.map((emoji) => (
                        <motion.button
                          key={emoji}
                          type="button"
                          onClick={() => addEmoji(emoji)}
                          className="p-2 text-lg hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            {isOverLimit && (
              <motion.div
                className="flex items-center space-x-1 text-red-500 text-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <X className="w-4 h-4" />
                <span>Limite excedido em {Math.abs(remainingChars)} caracteres</span>
              </motion.div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Anexar imagem"
            >
              <Image className="w-5 h-5" />
            </motion.button>

            <motion.button
              type="submit"
              disabled={!content.trim() || isSubmitting || isOverLimit}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publicar</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Preview */}
        {content && (
          <motion.div 
            className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
            <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {content}
            </div>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}
