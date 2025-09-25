import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

// Schemas de validação
const createPostSchema = z.object({
  content: z.string().min(1, 'Conteúdo é obrigatório').max(500, 'Máximo 500 caracteres')
})

const createCommentSchema = z.object({
  content: z.string().min(1, 'Conteúdo é obrigatório').max(200, 'Máximo 200 caracteres')
})

export const getPosts = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            level: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string)
    })

    const totalPosts = await prisma.post.count()

    res.json({
      success: true,
      data: { 
        posts,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalPosts,
          pages: Math.ceil(totalPosts / parseInt(limit as string))
        }
      }
    })
  } catch (error) {
    console.error('Erro ao buscar posts:', error)
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar posts' 
    })
  }
}

export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            level: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                level: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    })

    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post não encontrado' 
      })
    }

    res.json({
      success: true,
      data: { post }
    })
  } catch (error) {
    console.error('Erro ao buscar post:', error)
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar post' 
    })
  }
}

export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { content } = createPostSchema.parse(req.body)

    const post = await prisma.post.create({
      data: {
        content,
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            level: true
          }
        }
      }
    })

    res.status(201).json({
      success: true,
      message: 'Post criado com sucesso',
      data: { post }
    })
  } catch (error) {
    console.error('Erro ao criar post:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        message: error.errors[0].message 
      })
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Erro ao criar post' 
    })
  }
}

export const likePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params

    // Verificar se o post existe
    const post = await prisma.post.findUnique({
      where: { id }
    })

    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post não encontrado' 
      })
    }

    // Verificar se já curtiu
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId,
          postId: id
        }
      }
    })

    if (existingLike) {
      // Remover like
      await prisma.postLike.delete({
        where: {
          userId_postId: {
            userId,
            postId: id
          }
        }
      })

      // Atualizar contador
      await prisma.post.update({
        where: { id },
        data: {
          likesCount: {
            decrement: 1
          }
        }
      })

      res.json({
        success: true,
        message: 'Like removido',
        data: { liked: false }
      })
    } else {
      // Adicionar like
      await prisma.postLike.create({
        data: {
          userId,
          postId: id
        }
      })

      // Atualizar contador
      await prisma.post.update({
        where: { id },
        data: {
          likesCount: {
            increment: 1
          }
        }
      })

      res.json({
        success: true,
        message: 'Post curtido!',
        data: { liked: true }
      })
    }
  } catch (error) {
    console.error('Erro ao curtir post:', error)
    res.status(500).json({ 
      success: false,
      message: 'Erro ao curtir post' 
    })
  }
}

export const createComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params
    const { content } = createCommentSchema.parse(req.body)

    // Verificar se o post existe
    const post = await prisma.post.findUnique({
      where: { id }
    })

    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post não encontrado' 
      })
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        postId: id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            level: true
          }
        }
      }
    })

    // Atualizar contador de comentários
    await prisma.post.update({
      where: { id },
      data: {
        commentsCount: {
          increment: 1
        }
      }
    })

    res.status(201).json({
      success: true,
      message: 'Comentário adicionado com sucesso',
      data: { comment }
    })
  } catch (error) {
    console.error('Erro ao criar comentário:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        message: error.errors[0].message 
      })
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Erro ao criar comentário' 
    })
  }
}

export const deletePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params

    // Verificar se o post existe e pertence ao usuário
    const post = await prisma.post.findFirst({
      where: { 
        id,
        userId 
      }
    })

    if (!post) {
      return res.status(404).json({ 
        success: false,
        message: 'Post não encontrado ou você não tem permissão para deletá-lo' 
      })
    }

    await prisma.post.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: 'Post deletado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao deletar post:', error)
    res.status(500).json({ 
      success: false,
      message: 'Erro ao deletar post' 
    })
  }
}


