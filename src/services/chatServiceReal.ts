import { io, Socket } from 'socket.io-client';

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
  private socket: Socket | null = null;
  private currentGroupId: string | null = null;
  private isConnected: boolean = false;
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private typingCallbacks: ((users: TypingUser[]) => void)[] = [];
  private memberCallbacks: ((members: GroupMember[]) => void)[] = [];
  private connectionCallbacks: ((connected: boolean) => void)[] = [];

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Token não encontrado para WebSocket');
      return;
    }

    const wsUrl = import.meta.env.DEV 
      ? 'http://localhost:3001' 
      : 'https://your-production-domain.com';

    this.socket = io(wsUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket conectado');
      this.isConnected = true;
      this.connectionCallbacks.forEach(callback => callback(true));
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket desconectado');
      this.isConnected = false;
      this.connectionCallbacks.forEach(callback => callback(false));
    });

    this.socket.on('error', (error) => {
      console.error('Erro WebSocket:', error);
    });

    this.socket.on('new_message', (message: ChatMessage) => {
      // Converter timestamp para Date
      if (typeof message.timestamp === 'string') {
        message.timestamp = new Date(message.timestamp);
      }
      this.messageCallbacks.forEach(callback => callback(message));
    });

    this.socket.on('user_typing', (data: { users: TypingUser[] }) => {
      this.typingCallbacks.forEach(callback => callback(data.users));
    });

    this.socket.on('user_joined', (data: { userId: string; userName: string; timestamp: Date }) => {
      console.log(`${data.userName} entrou no chat`);
    });

    this.socket.on('user_left', (data: { userId: string; userName: string; timestamp: Date }) => {
      console.log(`${data.userName} saiu do chat`);
    });

    this.socket.on('joined_group', (data: { groupId: string; groupName: string; message: string }) => {
      console.log(data.message);
    });

    this.socket.on('message_reaction_updated', (data: { messageId: string; reactions: any[] }) => {
      console.log('Reação atualizada:', data);
    });
  }

  // Conectar ao chat de um grupo
  connectToGroup(groupId: string, _userId: string) {
    if (!this.socket) {
      this.initializeSocket();
    }

    if (!this.socket) {
      console.error('WebSocket não inicializado');
      return;
    }

    this.currentGroupId = groupId;
    this.socket.emit('join_group', { groupId });
  }

  // Desconectar do grupo atual
  disconnect() {
    if (this.socket && this.currentGroupId) {
      this.socket.emit('leave_group', { groupId: this.currentGroupId });
    }
    this.currentGroupId = null;
  }

  // Enviar mensagem
  sendMessage(content: string, author: ChatMessage['author'], type: 'text' | 'image' | 'file' = 'text') {
    if (!this.socket || !this.currentGroupId) {
      console.error('WebSocket não conectado ou grupo não selecionado');
      return;
    }

    this.socket.emit('send_message', {
      groupId: this.currentGroupId,
      content,
      author,
      type: type.toUpperCase()
    });
  }

  // Indicar que está digitando
  startTyping(_userId: string, _userName: string) {
    if (!this.socket || !this.currentGroupId) {
      return;
    }

    this.socket.emit('typing_start', { groupId: this.currentGroupId });
  }

  // Parar de indicar que está digitando
  stopTyping(_userId: string) {
    if (!this.socket || !this.currentGroupId) {
      return;
    }

    this.socket.emit('typing_stop', { groupId: this.currentGroupId });
  }

  // Adicionar reação a uma mensagem
  addReaction(messageId: string, emoji: string, _userId: string) {
    if (!this.socket) {
      return;
    }

    this.socket.emit('add_reaction', { messageId, emoji });
  }

  // Responder a uma mensagem
  replyToMessage(messageId: string, content: string, _author: ChatMessage['author']) {
    if (!this.socket || !this.currentGroupId) {
      return;
    }

    this.socket.emit('send_message', {
      groupId: this.currentGroupId,
      content,
      replyToId: messageId
    });
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

  onConnection(callback: (connected: boolean) => void) {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
    };
  }

  // Obter histórico de mensagens
  async getMessageHistory(groupId: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/chat/groups/${groupId}/messages?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar histórico');
      }

      const data = await response.json();
      const messages = data.data.messages || [];
      
      // Converter timestamps para Date
      return messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        editedAt: msg.editedAt ? new Date(msg.editedAt) : undefined
      }));
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      return [];
    }
  }

  // Obter membros do grupo
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/chat/groups/${groupId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar membros');
      }

      const data = await response.json();
      return data.data.members || [];
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      return [];
    }
  }

  // Verificar se está conectado
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Desconectar completamente
  disconnectCompletely() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.currentGroupId = null;
  }
}

// Instância singleton
export const chatService = new ChatService();
