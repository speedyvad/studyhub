import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar conquistas padrão
  const achievements = [
    {
      title: 'Primeira Tarefa',
      description: 'Complete sua primeira tarefa',
      icon: '✅',
      points: 10
    },
    {
      title: 'Primeiro Pomodoro',
      description: 'Complete seu primeiro ciclo de estudo',
      icon: '🍅',
      points: 25
    },
    {
      title: 'Produtivo',
      description: 'Complete 10 tarefas',
      icon: '⚡',
      points: 50
    },
    {
      title: 'Focado',
      description: 'Complete 10 sessões de Pomodoro',
      icon: '🎯',
      points: 100
    },
    {
      title: 'Centenário',
      description: 'Atinga 100 pontos',
      icon: '💯',
      points: 200
    },
    {
      title: 'Maratonista',
      description: 'Estude por 4 horas seguidas',
      icon: '🏃‍♂️',
      points: 300
    },
    {
      title: 'Social',
      description: 'Faça 10 posts na comunidade',
      icon: '💬',
      points: 150
    },
    {
      title: 'Especialista',
      description: 'Complete 50 tarefas de uma matéria',
      icon: '🎓',
      points: 500
    },
    {
      title: 'Lendário',
      description: 'Atinga 1000 pontos',
      icon: '👑',
      points: 1000
    },
    {
      title: 'Mestre',
      description: 'Complete 100 sessões de Pomodoro',
      icon: '🧙‍♂️',
      points: 2000
    }
  ]

  console.log('📝 Criando conquistas...')
  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: achievement
    })
  }

  console.log('✅ Seed executado com sucesso!')
  console.log(`📊 ${achievements.length} conquistas criadas`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
