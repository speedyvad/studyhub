import { Server as SocketIOServer, Socket as IOSocket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends IOSocket {
  userId: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

interface ChatMessage {
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
  groupId: string;
}

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: Date;
}

export class ChatSocketManager {
  private io: SocketIOServer;
  private typingUsers: Map<string, Map<string, TypingUser>> = new Map(); // groupId -> userId -> TypingUser
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  // Método genérico para emitir eventos globais
  public broadcast(event: string, payload: any) {
    try {
      this.io.emit(event, payload);
    } catch (err) {
      console.error('Erro ao emitir evento broadcast:', err);
    }
  }

  private setupMiddleware() {
    // Middleware de autenticação
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Token não fornecido'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        // Buscar usuário no banco
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true
          }
        });

        if (!user) {
          return next(new Error('Usuário não encontrado'));
        }

        (socket as AuthenticatedSocket).userId = user.id;
        (socket as AuthenticatedSocket).user = {
          id: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl || undefined
        };

        next();
      } catch (error) {
        console.error('Erro na autenticação WebSocket:', error);
        next(new Error('Token inválido'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: IOSocket) => {
      const authSocket = socket as AuthenticatedSocket;
      console.log(`Usuário ${authSocket.user?.name || 'desconhecido'} conectado: ${authSocket.id}`);

      // Armazenar socket do usuário
      if (authSocket.userId) this.userSockets.set(authSocket.userId, authSocket.id);

      // Evento: Entrar em um grupo
      authSocket.on('join_group', async (data: { groupId: string }) => {
        try {
          const { groupId } = data;

          // Verificar se o usuário é membro do grupo
          const membership = await prisma.groupMembership.findUnique({
            where: {
              userId_groupId: {
                userId: authSocket.userId,
                groupId: groupId
              }
            },
            include: {
              group: true
            }
          });

          if (!membership) {
            authSocket.emit('error', { message: 'Você não é membro deste grupo' });
            return;
          }

          // Entrar na sala do grupo
          authSocket.join(`group_${groupId}`);

          // Notificar outros membros que o usuário entrou
          authSocket.to(`group_${groupId}`).emit('user_joined', {
            userId: authSocket.userId,
            userName: authSocket.user?.name,
            timestamp: new Date()
          });

          // Enviar confirmação
          authSocket.emit('joined_group', {
            groupId,
            groupName: membership.group.name,
            message: 'Você entrou no chat do grupo'
          });

          console.log(`Usuário ${authSocket.user?.name} entrou no grupo ${groupId}`);
        } catch (error) {
          console.error('Erro ao entrar no grupo:', error);
          authSocket.emit('error', { message: 'Erro ao entrar no grupo' });
        }
      });

      // Evento: Sair de um grupo
      authSocket.on('leave_group', (data: { groupId: string }) => {
        const { groupId } = data;
        authSocket.leave(`group_${groupId}`);

        // Notificar outros membros
        authSocket.to(`group_${groupId}`).emit('user_left', {
          userId: authSocket.userId,
          userName: authSocket.user?.name,
          timestamp: new Date()
        });

        console.log(`Usuário ${authSocket.user?.name} saiu do grupo ${groupId}`);
      });

      // Evento: Enviar mensagem
      authSocket.on('send_message', async (data: { groupId: string; content: string; replyToId?: string; type?: 'TEXT' | 'IMAGE' | 'FILE' }) => {
        try {
          const { groupId, content, replyToId, type = 'TEXT' } = data;

          // Verificar se o usuário é membro do grupo
          const membership = await prisma.groupMembership.findUnique({
            where: {
              userId_groupId: {
                userId: authSocket.userId,
                groupId: groupId
              }
            }
          });

          if (!membership) {
            authSocket.emit('error', { message: 'Você não é membro deste grupo' });
            return;
          }

          // Salvar mensagem no banco
          const message = await prisma.chatMessage.create({
            data: {
              userId: authSocket.userId,
              groupId: groupId,
              content: content,
              replyToId: replyToId || null,
              messageType: type
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true
                }
              }
            }
          });

          // Preparar dados da mensagem para envio
          const messageData: ChatMessage = {
            id: message.id,
            content: message.content,
            author: {
              id: message.user.id,
              name: message.user.name,
              avatar: message.user.avatarUrl || undefined,
              role: membership.role === 'ADMIN' ? 'admin' : 'member'
            },
            timestamp: message.createdAt,
            type: message.messageType.toLowerCase() as 'text' | 'image' | 'file' | 'system',
            groupId: groupId
          };

          // Enviar mensagem para todos os membros do grupo
          this.io.to(`group_${groupId}`).emit('new_message', messageData);

          console.log(`Mensagem (${type}) enviada no grupo ${groupId} por ${authSocket.user?.name}`);
        } catch (error) {
          console.error('Erro ao enviar mensagem:', error);
          authSocket.emit('error', { message: 'Erro ao enviar mensagem' });
        }
      });

      // Evento: Usuário está digitando
      authSocket.on('typing_start', (data: { groupId: string }) => {
        const { groupId } = data;

        if (!this.typingUsers.has(groupId)) {
          this.typingUsers.set(groupId, new Map());
        }

        const typingUser: TypingUser = {
          userId: authSocket.userId,
          userName: authSocket.user?.name || '',
          timestamp: new Date()
        };

        this.typingUsers.get(groupId)!.set(authSocket.userId, typingUser);

        // Notificar outros membros
        authSocket.to(`group_${groupId}`).emit('user_typing', {
          users: Array.from(this.typingUsers.get(groupId)!.values())
        });
      });

      // Evento: Usuário parou de digitar
      authSocket.on('typing_stop', (data: { groupId: string }) => {
        const { groupId } = data;

        if (this.typingUsers.has(groupId)) {
          this.typingUsers.get(groupId)!.delete(authSocket.userId);

          // Notificar outros membros
          authSocket.to(`group_${groupId}`).emit('user_typing', {
            users: Array.from(this.typingUsers.get(groupId)!.values())
          });
        }
      });

      // Evento: Adicionar reação
      authSocket.on('add_reaction', async (data: { messageId: string; emoji: string }) => {
        try {
          const { messageId, emoji } = data;

          // Verificar se a mensagem existe e o usuário tem acesso
          const message = await prisma.chatMessage.findFirst({
            where: {
              id: messageId,
              group: {
                memberships: {
                  some: {
                    userId: authSocket.userId
                  }
                }
              }
            }
          });

          if (!message) {
            authSocket.emit('error', { message: 'Mensagem não encontrada' });
            return;
          }

          // Adicionar ou remover reação
          const existingReaction = await prisma.messageReaction.findUnique({
            where: {
              messageId_userId_emoji: {
                messageId,
                userId: authSocket.userId,
                emoji
              }
            }
          });

          if (existingReaction) {
            // Remover reação existente
            await prisma.messageReaction.delete({
              where: {
                id: existingReaction.id
              }
            });
          } else {
            // Adicionar nova reação
            await prisma.messageReaction.create({
              data: {
                messageId,
                userId: authSocket.userId,
                emoji
              }
            });
          }

          // Buscar todas as reações da mensagem
          const reactions = await prisma.messageReaction.findMany({
            where: { messageId },
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          });

          // Notificar todos os membros do grupo
          this.io.to(`group_${message.groupId}`).emit('message_reaction_updated', {
            messageId,
            reactions: reactions.map((r: any) => ({
              emoji: r.emoji,
              users: reactions
                .filter((reaction: any) => reaction.emoji === r.emoji)
                .map((reaction: any) => reaction.user)
            }))
          });

        } catch (error) {
          console.error('Erro ao adicionar reação:', error);
          authSocket.emit('error', { message: 'Erro ao adicionar reação' });
        }
      });

      // Evento: Desconexão
      authSocket.on('disconnect', () => {
        console.log(`Usuário ${authSocket.user?.name} desconectado: ${authSocket.id}`);

        // Remover socket do usuário
        this.userSockets.delete(authSocket.userId);

        // Limpar indicadores de digitação
        for (const [groupId, typingMap] of this.typingUsers.entries()) {
          if (typingMap.has(authSocket.userId)) {
            typingMap.delete(authSocket.userId);

            // Notificar outros membros
            authSocket.to(`group_${groupId}`).emit('user_typing', {
              users: Array.from(typingMap.values())
            });
          }
        }
      });
    });
  }

  // Método para enviar notificação para um usuário específico
  public sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  // Método para enviar notificação para todos os membros de um grupo
  public sendNotificationToGroup(groupId: string, notification: any) {
    this.io.to(`group_${groupId}`).emit('group_notification', notification);
  }

  // Método para obter estatísticas
  public getStats() {
    return {
      connectedUsers: this.userSockets.size,
      activeGroups: this.typingUsers.size
    };
  }
}

export default ChatSocketManager;
