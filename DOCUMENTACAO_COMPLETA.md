# 📚 StudyHub - Documentação Completa do Código

## 🎯 Visão Geral do Projeto

O **StudyHub** é uma aplicação web moderna de produtividade para estudantes, construída com React, TypeScript e Tailwind CSS. A aplicação oferece funcionalidades como gerenciamento de tarefas, técnica Pomodoro, gamificação, comunidade e estatísticas de estudo.

---

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas
```
src/
├── components/          # Componentes reutilizáveis
├── hooks/              # Hooks customizados
├── pages/              # Páginas da aplicação
├── store/              # Gerenciamento de estado (Zustand)
├── assets/             # Imagens e recursos estáticos
├── App.tsx             # Componente principal
├── main.tsx            # Ponto de entrada
└── index.css           # Estilos globais
```

---

## 🔧 Configuração e Dependências

### Tecnologias Principais
- **React 19.1.1** - Biblioteca principal para interface
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e servidor de desenvolvimento
- **Tailwind CSS** - Framework de CSS utilitário
- **Zustand** - Gerenciamento de estado
- **React Router DOM** - Roteamento
- **Framer Motion** - Animações
- **React Query** - Cache e sincronização de dados

### Scripts Disponíveis
```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Compila para produção
npm run lint     # Executa linter
npm run preview  # Preview da build
```

---

## 📱 Componentes Principais

### 1. App.tsx - Componente Raiz
```typescript
// Configuração principal da aplicação
- QueryClient para cache de dados
- Router para navegação
- ProtectedRoute/PublicRoute para autenticação
- ToastProvider para notificações
```

**Funcionalidades:**
- Roteamento protegido e público
- Configuração do React Query
- Estrutura de rotas da aplicação

### 2. Layout.tsx - Layout Principal
```typescript
// Layout responsivo com sidebar
- Sidebar com navegação
- Header mobile
- Toggle de tema
- Informações do usuário
- Botão de logout
```

**Funcionalidades:**
- Sidebar responsiva (desktop/mobile)
- Navegação entre páginas
- Toggle de tema claro/escuro
- Informações do usuário logado

### 3. Dashboard.tsx - Página Principal
```typescript
// Dashboard com resumo do usuário
- Cards de ações rápidas
- Lista de tarefas pendentes
- Resumo de sessões de estudo
- Conquistas desbloqueadas
- Feed da comunidade
```

**Funcionalidades:**
- Ações rápidas (Pomodoro, Tarefas)
- Resumo de produtividade diária
- Sistema de pontos e conquistas
- Integração com música (placeholder)

---

## 🎨 Sistema de Design

### Cores e Temas
```css
/* Cores principais definidas no Tailwind */
- primary: azul (#3B82F6)
- secondary: verde (#10B981)
- gamification: laranja (#F59E0B)
- text-primary: cinza escuro
- text-secondary: cinza médio
```

### Componentes de UI
- **Cards**: Containers com sombra e bordas arredondadas
- **Botões**: Animações com Framer Motion
- **Formulários**: Estilização consistente
- **Loading**: Skeletons e spinners animados

---

## 🔄 Gerenciamento de Estado

### useStore.ts - Store Principal (Zustand)
```typescript
interface Store {
  // Autenticação
  isAuthenticated: boolean
  user: User | null
  
  // Dados
  tasks: Task[]
  completedSessions: Session[]
  achievements: Achievement[]
  posts: Post[]
  
  // Ações
  login: (user: User) => void
  logout: () => void
  addTask: (task: Task) => void
  completeTask: (id: string) => void
  // ... outras ações
}
```

**Funcionalidades:**
- Estado global da aplicação
- Persistência de dados
- Ações para manipular dados
- Sistema de autenticação

---

## 📄 Páginas da Aplicação

### 1. Login.tsx
- Formulário de login
- Validação de campos
- Redirecionamento após login

### 2. Register.tsx
- Formulário de registro
- Validação de senha
- Criação de conta

### 3. Tasks.tsx
- Lista de tarefas
- Criação/edição de tarefas
- Drag and drop para priorização
- Filtros por status e prioridade

### 4. Pomodoro.tsx
- Timer de 25 minutos
- Controles de play/pause
- Histórico de sessões
- Integração com sistema de pontos

### 5. Community.tsx
- Feed de posts da comunidade
- Sistema de likes e comentários
- Compartilhamento de conquistas

### 6. Stats.tsx
- Gráficos de produtividade
- Estatísticas de estudo
- Relatórios semanais/mensais

### 7. Profile.tsx
- Informações do usuário
- Configurações de conta
- Histórico de conquistas

---

## 🎮 Sistema de Gamificação

### Conquistas (Achievements)
```typescript
interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  points: number
  unlocked: boolean
  condition: string
}
```

**Tipos de Conquistas:**
- Primeira tarefa completada
- 10 sessões Pomodoro
- 100 pontos acumulados
- Streak de 7 dias
- Especialista em uma matéria

### Sistema de Pontos
- **25 pontos** por sessão Pomodoro completada
- **10 pontos** por tarefa completada
- **5 pontos** por post na comunidade
- **Bônus** por streaks e conquistas

---

## 🎵 Funcionalidades Futuras

### Integração com Spotify
- Player de música para foco
- Playlists de estudo
- Controle de volume
- Sincronização com sessões

### Questões Geradas por IA
- Geração automática de questões
- Diferentes níveis de dificuldade
- Múltiplas matérias
- Sistema de avaliação

---

## 🔧 Hooks Customizados

### useTheme.ts
```typescript
// Hook para gerenciar tema claro/escuro
const { theme, toggleTheme } = useTheme()
```

### useLoading.ts
```typescript
// Hook para estados de carregamento
const { isLoading, setLoading } = useLoading()
```

---

## 🎨 Animações e Transições

### Framer Motion
- **Entrada de páginas**: Fade in + slide up
- **Hover effects**: Scale e rotate
- **Loading states**: Skeleton animations
- **Micro-interactions**: Botões e cards

### Exemplos de Animações
```typescript
// Animação de entrada
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}

// Hover effect
whileHover={{ scale: 1.05 }}
transition={{ type: 'spring', stiffness: 400, damping: 17 }}
```

---

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Adaptações Mobile
- Sidebar colapsável
- Menu hambúrguer
- Cards empilhados
- Touch-friendly buttons

---

## 🚀 Performance

### Otimizações Implementadas
- **Lazy loading** de componentes
- **Memoização** com React.memo
- **Code splitting** automático
- **Tree shaking** de dependências

### Bundle Size
- **Vite** para build otimizado
- **Tailwind CSS** purging
- **Tree shaking** automático

---

## 🔒 Segurança

### Autenticação
- Rotas protegidas
- Redirecionamento automático
- Persistência de sessão
- Logout seguro

### Validação
- Validação de formulários
- Sanitização de inputs
- Proteção contra XSS

---

## 🧪 Estrutura de Dados

### Tipos Principais
```typescript
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  points: number
  studyHours: number
  level: number
}

interface Task {
  id: string
  title: string
  description: string
  subject: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  createdAt: string
  dueDate?: string
}

interface Session {
  id: string
  duration: number
  timestamp: string
  completed: boolean
}
```

---

## 🎯 Funcionalidades por Página

### Dashboard
- ✅ Resumo de produtividade
- ✅ Ações rápidas
- ✅ Tarefas pendentes
- ✅ Conquistas recentes
- ✅ Feed da comunidade

### Tarefas
- ✅ CRUD completo
- ✅ Drag and drop
- ✅ Filtros e busca
- ✅ Priorização
- ✅ Categorização por matéria

### Pomodoro
- ✅ Timer de 25 minutos
- ✅ Controles de play/pause
- ✅ Histórico de sessões
- ✅ Sistema de pontos
- ✅ Notificações

### Comunidade
- ✅ Feed de posts
- ✅ Sistema de likes
- ✅ Comentários
- ✅ Compartilhamento

### Estatísticas
- ✅ Gráficos de produtividade
- ✅ Relatórios temporais
- ✅ Métricas de estudo
- ✅ Comparações

---

## 🔮 Roadmap Futuro

### Versão 2.0
- [ ] Integração com Spotify
- [ ] Questões geradas por IA
- [ ] Modo offline
- [ ] PWA (Progressive Web App)
- [ ] Notificações push

### Versão 3.0
- [ ] Colaboração em tempo real
- [ ] Videochamadas de estudo
- [ ] IA para planejamento
- [ ] Integração com calendários
- [ ] Analytics avançados

---

## 🛠️ Como Contribuir

### Setup do Ambiente
```bash
# Clone o repositório
git clone [url-do-repo]

# Instale dependências
npm install

# Execute em desenvolvimento
npm run dev
```

### Estrutura de Commits
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação
2. Consulte os issues do GitHub
3. Entre em contato com a equipe

---

*Esta documentação foi criada para facilitar o entendimento do código para desenvolvedores de todos os níveis. Mantenha-a atualizada conforme novas funcionalidades forem adicionadas.*
