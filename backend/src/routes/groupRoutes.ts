import { Router, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { z } from 'zod';

// Este tipo é melhor do que (req as any)
type AuthenticatedRequest = Request & {
  user: { id: string };
};

const router = Router();
const prisma = new PrismaClient();

// Schema de validação para criar grupo
const createGroupSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  isPrivate: z.boolean().default(false),
  tags: z.array(z.string()).max(10, 'Máximo 10 tags').default([])
});

// Schema de validação para convite
const inviteUserSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório')
});

// Listar grupos do usuário
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const { category, search, limit = 20, offset = 0 } = req.query;

    // Buscar grupos onde o usuário é membro
    const memberships = await prisma.groupMembership.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            _count: {
              select: {
                memberships: true,
                messages: true
              }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    // Buscar grupos públicos para descobrir
    const publicGroups = await prisma.group.findMany({
      where: {
        isPrivate: false,
        ...(category && { category: category as string }),
        ...(search && {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } },
            { tags: { has: search as string } }
          ]
        })
      },
      include: {
        _count: {
          select: {
            memberships: true,
            messages: true
          }
        },
        memberships: {
          where: { userId },
          select: { id: true }
        }
      },
      take: Number(limit),
      skip: Number(offset)
    });

    // Formatar grupos
    const userGroups = memberships.map(membership => ({
      id: membership.group.id,
      name: membership.group.name,
      description: membership.group.description || '', // Garantir que não é null
      category: membership.group.category,
      isPrivate: membership.group.isPrivate,
      tags: membership.group.tags,
      memberCount: membership.group._count.memberships,
      postCount: membership.group._count.messages,
      isJoined: true,
      isOwner: membership.group.ownerId === userId,
      role: membership.role,
      joinedAt: membership.joinedAt,
      createdAt: membership.group.createdAt
    }));

    const discoverGroups = publicGroups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description || '', // Garantir que não é null
      category: group.category,
      isPrivate: group.isPrivate,
      tags: group.tags,
      memberCount: group._count.memberships,
      postCount: group._count.messages,
      isJoined: group.memberships.length > 0,
      isOwner: group.ownerId === userId,
      createdAt: group.createdAt
    }));

    // --- INÍCIO DA CORREÇÃO ---
    // Combinar as duas listas numa única array 'groups'
    const allGroups = [...userGroups, ...discoverGroups];
    
    // Remover duplicatas (caso um grupo esteja em ambas as listas)
    const uniqueGroups = Array.from(new Map(allGroups.map(g => [g.id, g])).values());

    return res.json({
      success: true,
      data: {
        groups: uniqueGroups, // ⬅️ ENVIANDO A ARRAY 'groups' QUE O FRONT-END ESPERA
        total: await prisma.group.count({ // Manter a contagem total de 'discover' para paginação
          where: {
            isPrivate: false,
            ...(category && { category: category as string }),
            ...(search && {
              OR: [
                { name: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
                { tags: { has: search as string } }
              ]
            })
          }
        })
      }
    });
    // --- FIM DA CORREÇÃO ---

  } catch (error: unknown) {
    console.error('Erro ao buscar grupos:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Criar grupo
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const groupData = createGroupSchema.parse(req.body);

    // Criar grupo
    const group = await prisma.group.create({
      data: {
        ...groupData,
        ownerId: userId
      },
      include: {
        _count: {
          select: {
            memberships: true,
            messages: true
          }
        }
      }
    });

    // Adicionar o criador como admin
    const membership = await prisma.groupMembership.create({
      data: {
        userId,
        groupId: group.id,
        role: 'ADMIN'
      }
    });

    // --- INÍCIO DA CORREÇÃO 2 ---
    // Formatar a resposta para corresponder exatamente à interface 'Group' do front-end
    const formattedGroup = {
      id: group.id,
      name: group.name,
      description: group.description || '',
      category: group.category,
      isPrivate: group.isPrivate,
      tags: group.tags,
      memberCount: 1, // Começa com 1 membro (o dono)
      postCount: 0,
      isJoined: true, // O criador entra automaticamente
      isOwner: true, // O criador é o dono
      role: membership.role, // 'ADMIN'
      createdAt: group.createdAt,
      joinedAt: membership.joinedAt // Usar a data de quando a membership foi criada
    };

    return res.status(201).json({
      success: true,
      message: 'Grupo criado com sucesso',
      data: {
        group: formattedGroup // ⬅️ ENVIANDO O GRUPO FORMATADO
      }
    });
    // --- FIM DA CORREÇÃO 2 ---

  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    }

    console.error('Erro ao criar grupo:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Entrar em um grupo
router.post('/:groupId/join', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;

    // Verificar se o grupo existe
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo não encontrado'
      });
    }

    // Verificar se o usuário já é membro
    const existingMembership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: 'Você já é membro deste grupo'
      });
    }

    // Se o grupo é privado, verificar se há convite
    if (group.isPrivate) {
      const invitation = await prisma.groupInvitation.findFirst({
        where: {
          groupId,
          userId,
          status: 'PENDING'
        }
      });

      if (!invitation) {
        return res.status(403).json({
          success: false,
          message: 'Este grupo é privado e você não foi convidado'
        });
      }

      // Aceitar convite
      await prisma.groupInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date()
        }
      });
    }

    // Adicionar membro
    await prisma.groupMembership.create({
      data: {
        userId,
        groupId,
        role: 'MEMBER'
      }
    });

    return res.json({
      success: true,
      message: 'Você entrou no grupo com sucesso'
    });

  } catch (error: unknown) {
    console.error('Erro ao entrar no grupo:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Sair de um grupo
router.delete('/:groupId/leave', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;

    // Verificar se o usuário é membro
    const membership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      },
      include: {
        group: true
      }
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Você não é membro deste grupo'
      });
    }

    // Verificar se é o dono do grupo
    if (membership.group.ownerId === userId) {
      return res.status(400).json({
        success: false,
        message: 'O dono do grupo não pode sair. Transfira a propriedade primeiro.'
      });
    }

    // Remover membro
    await prisma.groupMembership.delete({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });

    return res.json({
      success: true,
      message: 'Você saiu do grupo com sucesso'
    });

  } catch (error: unknown) {
    console.error('Erro ao sair do grupo:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Convidar usuário para grupo
router.post('/:groupId/invite', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId: invitedUserId } = inviteUserSchema.parse(req.body);
    const inviterId = (req as AuthenticatedRequest).user.id;

    // Verificar se o convidador é admin do grupo
    const membership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId: inviterId,
          groupId
        }
      }
    });

    if (!membership || membership.role === 'MEMBER') {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores podem convidar usuários'
      });
    }

    // Verificar se o usuário já é membro
    const existingMembership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId: invitedUserId,
          groupId
        }
      }
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: 'Este usuário já é membro do grupo'
      });
    }

    // Verificar se já existe convite pendente
    const existingInvitation = await prisma.groupInvitation.findFirst({
      where: {
        groupId,
        userId: invitedUserId,
        status: 'PENDING'
      }
    });

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um convite pendente para este usuário'
      });
    }

    // Criar convite
    const invitation = await prisma.groupInvitation.create({
      data: {
        groupId,
        userId: invitedUserId,
        invitedBy: inviterId
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Convite enviado com sucesso',
      data: { invitation }
    });

  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    }

    console.error('Erro ao convidar usuário:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Obter detalhes de um grupo
router.get('/:groupId', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: {
            memberships: true,
            messages: true
          }
        },
        memberships: {
          where: { userId },
          select: { id: true, role: true }
        },
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Grupo não encontrado'
      });
    }

    const isMember = group.memberships.length > 0;
    const userRole = isMember ? group.memberships[0].role : null;

    return res.json({
      success: true,
      data: {
        group: {
          id: group.id,
          name: group.name,
          description: group.description || '', // Garantir que não é null
          category: group.category,
          isPrivate: group.isPrivate,
          tags: group.tags,
          memberCount: group._count.memberships,
          postCount: group._count.messages,
          isJoined: isMember,
          isOwner: group.ownerId === userId,
          role: userRole?.toLowerCase(),
          owner: group.owner,
          createdAt: group.createdAt
        }
      }
    });

  } catch (error: unknown) {
    console.error('Erro ao buscar detalhes do grupo:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;