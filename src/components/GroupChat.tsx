import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Smile, 
  Paperclip, 
  MoreVertical, 
  Users, 
  Phone, 
  Video, 
  Settings,
  Hash,
  AtSign,
  Image,
  FileText,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Wifi,
  WifiOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { chatService, type ChatMessage, type TypingUser, type GroupMember } from '../services/chatServiceReal';

// Usar o tipo ChatMessage do serviço
type Message = ChatMessage;

interface GroupChatProps {
  groupId: string;
  groupName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function GroupChat({ groupId, groupName, isOpen, onClose }: GroupChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  // Conectar ao chat quando o componente abrir
  useEffect(() => {
    if (isOpen && groupId) {
      setIsLoading(true);
      setIsConnected(true);
      
      // Conectar ao serviço de chat
      chatService.connectToGroup(groupId, 'current-user');
      
      // Carregar histórico de mensagens
      loadMessageHistory();
      
      // Carregar membros do grupo
      loadGroupMembers();
      
      // Configurar listeners
      const unsubscribeMessage = chatService.onMessage((message) => {
        setMessages(prev => [...prev, message]);
      });
      
      const unsubscribeTyping = chatService.onTyping((users) => {
        setTypingUsers(users);
      });
      
      const unsubscribeMembers = chatService.onMembers((members) => {
        setGroupMembers(members);
      });

      const unsubscribeConnection = chatService.onConnection((connected) => {
        setIsConnected(connected);
      });
      
      setIsLoading(false);
      
      return () => {
        unsubscribeMessage();
        unsubscribeTyping();
        unsubscribeMembers();
        unsubscribeConnection();
        chatService.disconnect();
      };
    }
  }, [isOpen, groupId]);

  const loadMessageHistory = async () => {
    try {
      const history = await chatService.getMessageHistory(groupId);
      setMessages(history);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar mensagens');
    }
  };

  const loadGroupMembers = async () => {
    try {
      const members = await chatService.getGroupMembers(groupId);
      setGroupMembers(members);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const author = {
      id: 'current-user',
      name: 'Você',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      role: 'member' as const
    };

    // Enviar mensagem através do serviço
    chatService.sendMessage(newMessage, author);
    
    // Parar de indicar que está digitando
    chatService.stopTyping('current-user');
    
    setNewMessage('');
    toast.success('Mensagem enviada!');
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Indicar que está digitando
    chatService.startTyping('current-user', 'Você');
    
    // Limpar timeout anterior
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    
    // Parar de indicar que está digitando após 3 segundos
    typingTimeoutRef.current = window.setTimeout(() => {
      chatService.stopTyping('current-user');
    }, 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💯', '🎉'];

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">{groupName}</h3>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-text-secondary">
                  {groupMembers.filter(m => m.isOnline).length} membros online
                </p>
                <div className="flex items-center space-x-1">
                  {isConnected ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-xs text-text-secondary">
                    {isConnected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Users className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-text-secondary">Carregando mensagens...</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
            const showDate = index === 0 || 
              formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
            
            return (
              <div key={message.id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                )}
                
                <motion.div
                  className={`flex space-x-3 ${
                    message.author.id === 'current-user' ? 'flex-row-reverse' : ''
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex-shrink-0">
                    <img
                      src={message.author.avatar}
                      alt={message.author.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </div>
                  
                  <div className={`flex-1 max-w-xs ${
                    message.author.id === 'current-user' ? 'text-right' : ''
                  }`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-text-primary">
                        {message.author.name}
                      </span>
                      {message.author.role === 'admin' && (
                        <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                      <span className="text-xs text-text-secondary">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    
                    <div className={`p-3 rounded-2xl ${
                      message.author.id === 'current-user'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-primary'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex space-x-1 mt-1">
                        {message.reactions.map((reaction, idx) => (
                          <button
                            key={idx}
                            className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-full transition-colors"
                          >
                            {reaction.emoji} {reaction.users.length}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })
          )}
          
          {typingUsers.length > 0 && (
            <motion.div
              className="flex items-center space-x-2 text-sm text-text-secondary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span>
                {typingUsers.length === 1 
                  ? `${typingUsers[0].userName} está digitando...`
                  : `${typingUsers.length} pessoas estão digitando...`
                }
              </span>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Image className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FileText className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Smile className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`p-2 rounded-lg transition-colors ${
                  isRecording 
                    ? 'bg-red-100 text-red-600' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Emoji Picker */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                className="absolute bottom-16 left-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className="grid grid-cols-5 gap-2">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setNewMessage(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
