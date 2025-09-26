import { useWebSocket } from '../hooks/useWebSocket';

export interface ChatMessage {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: 'admin' | 'member';
  };
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
  isEdited?: boolean;
  reactions?: { emoji: string; users: string[] }[];
  replyTo?: string;
  groupId: string;
}

export interface TypingUser {
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'member';
  isOnline: boolean;
  lastSeen?: Date;
}

class ChatService {
  private wsUrl: string;
  private currentGroupId: string | null = null;
  private socket: any = null;
  private typingUsers: Map<string, TypingUser> = new Map();
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private typingCallbacks: ((users: TypingUser[]) => void)[] = [];
  private memberCallbacks: ((members: GroupMember[]) => void)[] = [];
  private isConnected: boolean = false;

  constructor() {
    // Em desenvolvimento, usar WebSocket local
    this.wsUrl = import.meta.env.DEV 
      ? 'http://localhost:3001' 
      : 'https://your-production-domain.com';
  }

  // Conectar ao chat de um grupo
  connectToGroup(groupId: string, userId: string) {
    this.currentGroupId = groupId;
    
    // Simular conexão WebSocket
    console.log(`Conectando ao grupo ${groupId} como usuário ${userId}`);
    
    // Simular mensagens de boas-vindas
    setTimeout(() => {
      this.emitMessage({
        id: 'system-1',
        content: 'Você entrou no chat do grupo',
        author: {
          id: 'system',
          name: 'Sistema',
          role: 'admin'
        },
        timestamp: new Date(),
        type: 'system',
        groupId
      });
    }, 1000);
  }

  // Desconectar do grupo atual
  disconnect() {
    this.currentGroupId = null;
    this.typingUsers.clear();
    console.log('Desconectado do chat');
  }

  // Enviar mensagem
  sendMessage(content: string, author: ChatMessage['author']) {
    if (!this.currentGroupId) {
      console.error('Não conectado a nenhum grupo');
      return;
    }

    const message: ChatMessage = {
      id: Date.now().toString(),
      content,
      author,
      timestamp: new Date(),
      type: 'text',
      groupId: this.currentGroupId
    };

    // Simular envio e recebimento
    this.emitMessage(message);
    
    // Simular outros usuários digitando
    setTimeout(() => {
      this.emitTyping([
        { userId: 'user1', userName: 'João', timestamp: new Date() }
      ]);
    }, 500);
  }

  // Indicar que está digitando
  startTyping(userId: string, userName: string) {
    const typingUser: TypingUser = {
      userId,
      userName,
      timestamp: new Date()
    };
    
    this.typingUsers.set(userId, typingUser);
    this.emitTyping(Array.from(this.typingUsers.values()));
  }

  // Parar de indicar que está digitando
  stopTyping(userId: string) {
    this.typingUsers.delete(userId);
    this.emitTyping(Array.from(this.typingUsers.values()));
  }

  // Adicionar reação a uma mensagem
  addReaction(messageId: string, emoji: string, userId: string) {
    console.log(`Usuário ${userId} reagiu com ${emoji} à mensagem ${messageId}`);
  }

  // Responder a uma mensagem
  replyToMessage(messageId: string, content: string, author: ChatMessage['author']) {
    console.log(`Respondendo à mensagem ${messageId}: ${content}`);
    this.sendMessage(content, author);
  }

  // Callbacks
  onMessage(callback: (message: ChatMessage) => void) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  onTyping(callback: (users: TypingUser[]) => void) {
    this.typingCallbacks.push(callback);
    return () => {
      this.typingCallbacks = this.typingCallbacks.filter(cb => cb !== callback);
    };
  }

  onMembers(callback: (members: GroupMember[]) => void) {
    this.memberCallbacks.push(callback);
    return () => {
      this.memberCallbacks = this.memberCallbacks.filter(cb => cb !== callback);
    };
  }

  // Emitir eventos
  private emitMessage(message: ChatMessage) {
    this.messageCallbacks.forEach(callback => callback(message));
  }

  private emitTyping(users: TypingUser[]) {
    this.typingCallbacks.forEach(callback => callback(users));
  }

  private emitMembers(members: GroupMember[]) {
    this.memberCallbacks.forEach(callback => callback(members));
  }

  // Obter histórico de mensagens
  async getMessageHistory(groupId: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
    // Simular carregamento de histórico
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockMessages: ChatMessage[] = [
          {
            id: '1',
            content: 'Bem-vindos ao grupo! Vamos estudar juntos! 🚀',
            author: {
              id: 'admin',
              name: 'Maria Silva',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
              role: 'admin'
            },
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            type: 'text',
            groupId
          },
          {
            id: '2',
            content: 'Alguém tem dicas para a prova de Cálculo?',
            author: {
              id: 'user1',
              name: 'João Santos',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
              role: 'member'
            },
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            type: 'text',
            groupId
          }
        ];
        resolve(mockMessages);
      }, 500);
    });
  }

  // Obter membros do grupo
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockMembers: GroupMember[] = [
          {
            id: 'admin',
            name: 'Maria Silva',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
            role: 'admin',
            isOnline: true
          },
          {
            id: 'user1',
            name: 'João Santos',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
            role: 'member',
            isOnline: true
          },
          {
            id: 'user2',
            name: 'Ana Costa',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
            role: 'member',
            isOnline: false,
            lastSeen: new Date(Date.now() - 30 * 60 * 1000)
          }
        ];
        resolve(mockMembers);
      }, 300);
    });
  }
}

// Instância singleton
export const chatService = new ChatService();
