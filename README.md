# 📚 StudyHub - Plataforma de Estudos

Uma plataforma completa de estudos com sistema de tarefas, timer Pomodoro, rede social interativa e gamificação.

## 🎯 Funcionalidades

### ✅ Sistema de Autenticação
- Login e cadastro de usuários
- Interface moderna e responsiva
- Validação de formulários

### 📋 Gerenciamento de Tarefas
- CRUD completo de tarefas
- Organização por matérias/tópicos
- Sistema de prioridades (baixa, média, alta)
- Filtros e busca avançada
- Marcação de conclusão

### ⏰ Timer Pomodoro
- Cronômetro configurável (15, 25, 45, 60 minutos)
- Controles de iniciar, pausar e resetar
- Visualização circular do progresso
- Estatísticas de sessões do dia
- Sistema de pontos por sessão completada

### 👥 Comunidade
- Feed de postagens interativo
- Sistema de curtidas e comentários
- Grupos de estudo por matéria
- Ranking de contribuidores
- Dicas da comunidade

### 📊 Estatísticas e Analytics
- Gráficos de horas estudadas
- Distribuição por matérias
- Progresso mensal
- Ranking de pontos
- Resumo de conquistas

### 🏆 Sistema de Gamificação
- Pontos por atividades
- Conquistas desbloqueáveis
- Notificações de achievements
- Ranking entre usuários
- Níveis de progresso

### 👤 Perfil do Usuário
- Edição de informações pessoais
- Matérias favoritas
- Estatísticas pessoais
- Histórico de conquistas
- Resumo de estudos

## 🎨 Design System

### Paleta de Cores
- **Primária**: Azul Turquesa (#0EA5E9) - Botões, links, destaques
- **Secundária**: Verde Vibrante (#22C55E) - Checklists, progresso, badges
- **Gamificação**: Amarelo Sol (#FACC15) - Badges, conquistas, XP
- **Fundo**: Cinza Suave (#F9FAFB) - Background principal
- **Texto**: Cinza Grafite (#1E293B) - Títulos e corpo do texto

### Componentes
- Cards com sombras suaves
- Botões com estados hover
- Inputs com foco destacado
- Ícones Lucide React
- Animações CSS suaves

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework de estilos
- **React Router DOM** - Roteamento
- **TanStack Query** - Gerenciamento de estado servidor
- **Zustand** - Gerenciamento de estado local
- **Lucide React** - Ícones
- **Recharts** - Gráficos e visualizações

### Estrutura do Projeto
```
src/
├── components/          # Componentes reutilizáveis
│   ├── Layout.tsx      # Layout principal com sidebar
│   └── AchievementNotification.tsx
├── pages/              # Páginas da aplicação
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Tasks.tsx
│   ├── Pomodoro.tsx
│   ├── Community.tsx
│   ├── Stats.tsx
│   └── Profile.tsx
├── store/              # Gerenciamento de estado
│   └── useStore.ts     # Store Zustand
├── App.tsx             # Componente principal
├── main.tsx            # Entry point
└── index.css           # Estilos globais
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone <url-do-repositorio>
cd studyhub

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev
```

### Scripts Disponíveis
```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
npm run lint     # Verificação de código
```

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- 📱 Dispositivos móveis (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Telas grandes (1440px+)

## 🎮 Funcionalidades de Gamificação

### Sistema de Pontos
- **25 pontos** por sessão Pomodoro completada
- **10 pontos** por tarefa concluída
- **5 pontos** por postagem na comunidade
- **2 pontos** por curtida recebida

### Conquistas Disponíveis
- 🎯 **Primeiro Pomodoro** - Complete seu primeiro ciclo
- 🏃‍♂️ **Maratonista** - Estude por 4 horas seguidas
- 💬 **Social** - Faça 10 posts na comunidade
- 📚 **Estudioso** - Complete 50 tarefas
- ⭐ **Dedicado** - Mantenha 7 dias de sequência

### Níveis
- **Iniciante** (0-100 pontos)
- **Estudante** (101-500 pontos)
- **Avançado** (501-1000 pontos)
- **Expert** (1001-2000 pontos)
- **Mestre** (2000+ pontos)

## 🔮 Próximas Funcionalidades

### Integrações Planejadas
- 🎵 **Spotify** - Player de música para foco
- 📅 **Google Calendar** - Sincronização de agenda
- 📱 **Notificações Push** - Lembretes de estudo
- 🔔 **WebSocket** - Chat em tempo real

### Melhorias Futuras
- 📊 **Relatórios PDF** - Exportação de estatísticas
- 🎨 **Temas** - Dark mode e temas personalizados
- 🌍 **Internacionalização** - Suporte a múltiplos idiomas
- 📱 **PWA** - Aplicativo mobile nativo

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvido por

**StudyHub Team** - Plataforma de estudos moderna e gamificada

---

⭐ **Se este projeto te ajudou, não esqueça de dar uma estrela!**