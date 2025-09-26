# 📚 Documentação do Sistema de Chat com WebSocket

## 🎯 Visão Geral

O StudyHub agora possui um sistema completo de chat em tempo real usando **WebSocket (Socket.IO)** para comunicação instantânea entre membros de grupos de estudo.

## 🏗️ Arquitetura

```
┌─────────────────┐    WebSocket + REST API    ┌─────────────────┐
│   Frontend      │ ←─────────────────────────→ │   Backend       │
│   (React)       │                             │   (Express)     │
│   Socket.IO     │                             │   Socket.IO     │
└─────────────────┘                             └─────────────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │   Database      │
                                                │   (PostgreSQL)  │
                                                │   Prisma ORM    │
                                                └─────────────────┘
```

## 🗄️ Banco de Dados

### Modelos Principais

#### **Group (Grupos)**
```sql
- id: String (PK)
- name: String
- description: String?
- category: String
- isPrivate: Boolean
- tags: String[]
- ownerId: String (FK → User)
- createdAt: DateTime
- updatedAt: DateTime
```

#### **GroupMembership (Membros)**
```sql
- id: String (PK)
- userId: String (FK → User)
- groupId: String (FK → Group)
- role: GroupRole (MEMBER, ADMIN, MODERATOR)
- joinedAt: DateTime
```

#### **ChatMessage (Mensagens)**
```sql
- id: String (PK)
- userId: String (FK → User)
- groupId: String (FK → Group)
- content: String
- messageType: MessageType (TEXT, IMAGE, FILE, SYSTEM)
- replyToId: String? (FK → ChatMessage)
- isEdited: Boolean
- editedAt: DateTime?
- createdAt: DateTime
```

#### **MessageReaction (Reações)**
```sql
- id: String (PK)
- messageId: String (FK → ChatMessage)
- userId: String (FK → User)
- emoji: String
- createdAt: DateTime
```

#### **GroupInvitation (Convites)**
```sql
- id: String (PK)
- groupId: String (FK → Group)
- userId: String (FK → User)
- invitedBy: String (FK → User)
- status: InvitationStatus (PENDING, ACCEPTED, DECLINED, EXPIRED)
- createdAt: DateTime
- respondedAt: DateTime?
```

## 🔌 WebSocket Events

### **Conexão e Autenticação**

#### **Middleware de Autenticação**
```typescript
// Verifica JWT token na conexão
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  socket.userId = user.id;
  socket.user = user;
  next();
});
```

### **Eventos do Cliente → Servidor**

#### **1. Entrar em Grupo**
```typescript
socket.emit('join_group', { groupId: string });
```
- **Resposta:** `joined_group` ou `error`
- **Verifica:** Se usuário é membro do grupo
- **Ação:** Adiciona socket à sala `group_${groupId}`

#### **2. Sair do Grupo**
```typescript
socket.emit('leave_group', { groupId: string });
```
- **Resposta:** `user_left` para outros membros
- **Ação:** Remove socket da sala

#### **3. Enviar Mensagem**
```typescript
socket.emit('send_message', {
  groupId: string,
  content: string,
  replyToId?: string
});
```
- **Resposta:** `new_message` para todos os membros
- **Ação:** Salva no banco e envia para sala

#### **4. Indicar Digitação**
```typescript
socket.emit('typing_start', { groupId: string });
socket.emit('typing_stop', { groupId: string });
```
- **Resposta:** `user_typing` com lista de usuários
- **Ação:** Gerencia estado de digitação

#### **5. Adicionar Reação**
```typescript
socket.emit('add_reaction', {
  messageId: string,
  emoji: string
});
```
- **Resposta:** `message_reaction_updated`
- **Ação:** Adiciona/remove reação no banco

### **Eventos do Servidor → Cliente**

#### **1. Nova Mensagem**
```typescript
socket.on('new_message', (message: ChatMessage) => {
  // Atualizar interface
});
```

#### **2. Usuário Digitando**
```typescript
socket.on('user_typing', (data: { users: TypingUser[] }) => {
  // Mostrar indicador de digitação
});
```

#### **3. Usuário Entrou/Saiu**
```typescript
socket.on('user_joined', (data: { userId, userName, timestamp }) => {
  // Notificar entrada
});

socket.on('user_left', (data: { userId, userName, timestamp }) => {
  // Notificar saída
});
```

#### **4. Reação Atualizada**
```typescript
socket.on('message_reaction_updated', (data: { messageId, reactions }) => {
  // Atualizar reações da mensagem
});
```

## 🌐 API REST Endpoints

### **Chat Routes (`/api/chat`)**

#### **GET `/groups/:groupId/messages`**
```typescript
// Obter histórico de mensagens
Query: { limit?: number, offset?: number }
Response: { success: boolean, data: { messages: ChatMessage[], total: number } }
```

#### **POST `/groups/:groupId/messages`**
```typescript
// Enviar mensagem (fallback REST)
Body: { content: string, replyToId?: string }
Response: { success: boolean, data: { message: ChatMessage } }
```

#### **PUT `/messages/:messageId`**
```typescript
// Editar mensagem
Body: { content: string }
Response: { success: boolean, data: { message: ChatMessage } }
```

#### **DELETE `/messages/:messageId`**
```typescript
// Deletar mensagem
Response: { success: boolean, message: string }
```

#### **GET `/groups/:groupId/members`**
```typescript
// Obter membros do grupo
Response: { success: boolean, data: { members: GroupMember[] } }
```

### **Group Routes (`/api/groups`)**

#### **GET `/`**
```typescript
// Listar grupos do usuário e descobrir novos
Query: { category?: string, search?: string, limit?: number, offset?: number }
Response: { success: boolean, data: { userGroups: Group[], discoverGroups: Group[], total: number } }
```

#### **POST `/`**
```typescript
// Criar grupo
Body: { name: string, description?: string, category: string, isPrivate?: boolean, tags?: string[] }
Response: { success: boolean, data: { group: Group } }
```

#### **POST `/:groupId/join`**
```typescript
// Entrar em grupo
Response: { success: boolean, message: string }
```

#### **DELETE `/:groupId/leave`**
```typescript
// Sair do grupo
Response: { success: boolean, message: string }
```

#### **POST `/:groupId/invite`**
```typescript
// Convidar usuário
Body: { userId: string }
Response: { success: boolean, data: { invitation: GroupInvitation } }
```

#### **GET `/:groupId`**
```typescript
// Obter detalhes do grupo
Response: { success: boolean, data: { group: Group } }
```

## 💻 Frontend Implementation

### **ChatService (Socket.IO Client)**

```typescript
class ChatService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  
  // Conectar ao grupo
  connectToGroup(groupId: string, userId: string) {
    this.socket.emit('join_group', { groupId });
  }
  
  // Enviar mensagem
  sendMessage(content: string, author: ChatMessage['author']) {
    this.socket.emit('send_message', {
      groupId: this.currentGroupId,
      content,
      author
    });
  }
  
  // Indicar digitação
  startTyping(userId: string, userName: string) {
    this.socket.emit('typing_start', { groupId: this.currentGroupId });
  }
  
  // Callbacks
  onMessage(callback: (message: ChatMessage) => void) { /* ... */ }
  onTyping(callback: (users: TypingUser[]) => void) { /* ... */ }
  onConnection(callback: (connected: boolean) => void) { /* ... */ }
}
```

### **GroupChat Component**

```typescript
export default function GroupChat({ groupId, groupName, isOpen, onClose }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    if (isOpen && groupId) {
      // Conectar ao chat
      chatService.connectToGroup(groupId, 'current-user');
      
      // Configurar listeners
      const unsubscribeMessage = chatService.onMessage((message) => {
        setMessages(prev => [...prev, message]);
      });
      
      const unsubscribeTyping = chatService.onTyping((users) => {
        setTypingUsers(users);
      });
      
      const unsubscribeConnection = chatService.onConnection((connected) => {
        setIsConnected(connected);
      });
      
      return () => {
        unsubscribeMessage();
        unsubscribeTyping();
        unsubscribeConnection();
        chatService.disconnect();
      };
    }
  }, [isOpen, groupId]);
}
```

## 🚀 Como Executar

### **1. Backend**
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### **2. Frontend**
```bash
cd /home/vini/studyhub
npm install
npm run dev
```

### **3. Teste WebSocket**
```bash
cd backend
node test-websocket.js
```

## 🔧 Configuração

### **Variáveis de Ambiente**

#### **Backend (.env)**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/studyhub"
JWT_SECRET="your-secret-key"
CORS_ORIGIN="http://localhost:5173"
PORT=3001
NODE_ENV="development"
```

#### **Frontend (.env)**
```env
VITE_API_URL="http://localhost:3001"
VITE_WS_URL="http://localhost:3001"
```

## 📊 Monitoramento

### **Estatísticas WebSocket**
```typescript
// Obter estatísticas do servidor
const stats = chatSocketManager.getStats();
console.log({
  connectedUsers: stats.connectedUsers,
  activeGroups: stats.activeGroups
});
```

### **Logs de Conexão**
```typescript
// Logs automáticos
console.log(`Usuário ${socket.user.name} conectado: ${socket.id}`);
console.log(`Usuário ${socket.user.name} entrou no grupo ${groupId}`);
console.log(`Mensagem enviada no grupo ${groupId} por ${socket.user.name}`);
```

## 🛡️ Segurança

### **Autenticação WebSocket**
- **JWT Token** obrigatório na conexão
- **Verificação** de membros antes de ações
- **Rate limiting** na API REST
- **Validação** de dados com Zod

### **Autorização**
- **Apenas membros** podem enviar mensagens
- **Apenas admins** podem convidar usuários
- **Apenas dono** pode deletar grupo
- **Verificação** de permissões em cada ação

## 🎨 UX Features

### **Status de Conexão**
```typescript
// Indicador visual de conexão
{isConnected ? (
  <Wifi className="w-4 h-4 text-green-500" />
) : (
  <WifiOff className="w-4 h-4 text-red-500" />
)}
```

### **Indicador de Digitação**
```typescript
// Mostrar quem está digitando
{typingUsers.length > 0 && (
  <div className="flex items-center space-x-2">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
    <span>{typingUsers[0].userName} está digitando...</span>
  </div>
)}
```

### **Loading States**
```typescript
// Estado de carregamento
{isLoading ? (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <p>Carregando mensagens...</p>
  </div>
) : (
  // Mensagens
)}
```

## 🔄 Fallback e Offline

### **Modo Offline**
```typescript
// Fallback para dados mock quando backend offline
const getMockData = (url: string) => {
  if (url.includes('/community/posts')) {
    return { success: true, data: { posts: mockPosts } };
  }
  if (url.includes('/community/groups')) {
    return { success: true, data: { groups: mockGroups } };
  }
  return { success: true, message: 'Modo offline' };
};
```

### **Reconexão Automática**
```typescript
// WebSocket reconecta automaticamente
socket.on('disconnect', () => {
  console.log('Desconectado, tentando reconectar...');
  // Socket.IO reconecta automaticamente
});
```

## 📈 Próximas Funcionalidades

### **Planejadas**
- [ ] **Notificações Push** do navegador
- [ ] **Arquivos e mídia** no chat
- [ ] **Chamadas de voz/vídeo**
- [ ] **Moderação avançada**
- [ ] **Analytics de uso**
- [ ] **Mensagens privadas**
- [ ] **Status online/offline**
- [ ] **Histórico de mensagens** com paginação
- [ ] **Busca em mensagens**
- [ ] **Mensagens fixadas**

### **Melhorias Técnicas**
- [ ] **Redis** para cache de sessões
- [ ] **Rate limiting** por usuário
- [ ] **Compressão** de mensagens
- [ ] **CDN** para arquivos
- [ ] **Monitoring** com Prometheus
- [ ] **Logs** estruturados
- [ ] **Testes** automatizados
- [ ] **CI/CD** pipeline

## 🐛 Troubleshooting

### **Problemas Comuns**

#### **1. WebSocket não conecta**
```bash
# Verificar se backend está rodando
curl http://localhost:3001/api/health

# Verificar token JWT
localStorage.getItem('token')
```

#### **2. Mensagens não aparecem**
```bash
# Verificar logs do backend
npm run dev

# Verificar se usuário é membro do grupo
# Verificar permissões no banco
```

#### **3. Erro de CORS**
```typescript
// Verificar configuração CORS no backend
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
```

#### **4. Banco de dados**
```bash
# Resetar banco
npx prisma db push --force-reset

# Gerar client
npx prisma generate
```

## 📞 Suporte

Para dúvidas ou problemas:
- **Issues:** GitHub Issues
- **Documentação:** Este arquivo
- **Logs:** Console do navegador e terminal
- **Debug:** `console.log` nos eventos WebSocket

---

**🎉 Sistema de Chat com WebSocket implementado com sucesso!**

*Documentação criada em: $(date)*
*Versão: 1.0.0*
*Autor: StudyHub Team*
