import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Obter histórico de mensagens de um grupo
router.get('/groups/:groupId/messages', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user!.id;

    // Verificar se o usuário é membro do grupo
    const membership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Você não é membro deste grupo'
      });
    }

    // Buscar mensagens
    const messages = await prisma.chatMessage.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        replyTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: Number(offset)
    });

    // Formatar mensagens
    const formattedMessages = messages.map(message => ({
      id: message.id,
      content: message.content,
      author: {
        id: message.user.id,
        name: message.user.name,
        avatar: message.user.avatarUrl || undefined,
        role: membership.role === 'ADMIN' ? 'admin' : 'member'
      },
      timestamp: message.createdAt,
      type: message.messageType.toLowerCase(),
      isEdited: message.isEdited,
      editedAt: message.editedAt,
      replyTo: message.replyTo ? {
        id: message.replyTo.id,
        content: message.replyTo.content,
        author: {
          id: message.replyTo.user.id,
          name: message.replyTo.user.name
        }
      } : undefined,
      reactions: message.reactions.reduce((acc, reaction) => {
        const existing = acc.find(r => r.emoji === reaction.emoji);
        if (existing) {
          existing.users.push({
            id: reaction.user.id,
            name: reaction.user.name
          });
        } else {
          acc.push({
            emoji: reaction.emoji,
            users: [{
              id: reaction.user.id,
              name: reaction.user.name
            }]
          });
        }
        return acc;
      }, [] as any[])
    }));

    res.json({
      success: true,
      data: {
        messages: formattedMessages.reverse(), // Ordenar do mais antigo para o mais recente
        total: await prisma.chatMessage.count({ where: { groupId } })
      }
    });

  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Enviar mensagem (endpoint REST como fallback)
router.post('/groups/:groupId/messages', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content, replyToId } = req.body;
    const userId = req.user!.id;

    // Verificar se o usuário é membro do grupo
    const membership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Você não é membro deste grupo'
      });
    }

    // Criar mensagem
    const message = await prisma.chatMessage.create({
      data: {
        userId,
        groupId,
        content,
        replyToId: replyToId || null
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

    res.json({
      success: true,
      data: {
        message: {
          id: message.id,
          content: message.content,
          author: {
            id: message.user.id,
            name: message.user.name,
            avatar: message.user.avatarUrl || undefined,
            role: membership.role === 'ADMIN' ? 'admin' : 'member'
          },
          timestamp: message.createdAt,
          type: message.messageType.toLowerCase(),
          groupId
        }
      }
    });

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Editar mensagem
router.put('/messages/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;

    // Verificar se a mensagem existe e pertence ao usuário
    const message = await prisma.chatMessage.findFirst({
      where: {
        id: messageId,
        userId
      }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mensagem não encontrada'
      });
    }

    // Atualizar mensagem
    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
        editedAt: new Date()
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

    res.json({
      success: true,
      data: {
        message: {
          id: updatedMessage.id,
          content: updatedMessage.content,
          author: {
            id: updatedMessage.user.id,
            name: updatedMessage.user.name,
            avatar: updatedMessage.user.avatarUrl || undefined
          },
          timestamp: updatedMessage.createdAt,
          isEdited: updatedMessage.isEdited,
          editedAt: updatedMessage.editedAt,
          groupId: updatedMessage.groupId
        }
      }
    });

  } catch (error) {
    console.error('Erro ao editar mensagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Deletar mensagem
router.delete('/messages/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user!.id;

    // Verificar se a mensagem existe e pertence ao usuário
    const message = await prisma.chatMessage.findFirst({
      where: {
        id: messageId,
        userId
      }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mensagem não encontrada'
      });
    }

    // Deletar mensagem
    await prisma.chatMessage.delete({
      where: { id: messageId }
    });

    res.json({
      success: true,
      message: 'Mensagem deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar mensagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Obter membros de um grupo
router.get('/groups/:groupId/members', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user!.id;

    // Verificar se o usuário é membro do grupo
    const membership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Você não é membro deste grupo'
      });
    }

    // Buscar membros
    const members = await prisma.groupMembership.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true
          }
        }
      },
      orderBy: [
        { role: 'desc' }, // Admins primeiro
        { joinedAt: 'asc' }
      ]
    });

    // Formatar membros
    const formattedMembers = members.map(member => ({
      id: member.user.id,
      name: member.user.name,
      avatar: member.user.avatarUrl || undefined,
      role: member.role.toLowerCase(),
      joinedAt: member.joinedAt,
      isOnline: false // Será implementado com WebSocket
    }));

    res.json({
      success: true,
      data: { members: formattedMembers }
    });

  } catch (error) {
    console.error('Erro ao buscar membros:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
