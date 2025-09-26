# 🔌 WebSocket API Documentation

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Eventos do Cliente](#eventos-do-cliente)
- [Eventos do Servidor](#eventos-do-servidor)
- [Códigos de Erro](#códigos-de-erro)
- [Exemplos de Uso](#exemplos-de-uso)

## 🎯 Visão Geral

O WebSocket do StudyHub permite comunicação em tempo real entre membros de grupos de estudo. Utiliza **Socket.IO** para conexões persistentes com fallback automático.

### **URL de Conexão**
```
Desenvolvimento: ws://localhost:3001
Produção: wss://your-domain.com
```

### **Autenticação**
```typescript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'jwt-token-here'
  }
});
```

## 🔐 Autenticação

### **Middleware de Autenticação**
```typescript
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    
    if (!user) {
      return next(new Error('Usuário não encontrado'));
    }
    
    socket.userId = user.id;
    socket.user = { id: user.id, name: user.name, avatarUrl: user.avatarUrl };
    next();
  } catch (error) {
    next(new Error('Token inválido'));
  }
});
```

### **Estrutura do Token**
```json
{
  "userId": "cuid-string",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 📤 Eventos do Cliente

### **1. join_group**
Entra em um grupo de chat.

```typescript
socket.emit('join_group', {
  groupId: string
});
```

**Respostas:**
- ✅ `joined_group` - Entrou com sucesso
- ❌ `error` - Erro (usuário não é membro)

**Exemplo:**
```typescript
socket.emit('join_group', { groupId: 'group-123' });

socket.on('joined_group', (data) => {
  console.log(`Entrou no grupo: ${data.groupName}`);
});

socket.on('error', (error) => {
  console.error('Erro:', error.message);
});
```

### **2. leave_group**
Sai de um grupo de chat.

```typescript
socket.emit('leave_group', {
  groupId: string
});
```

**Respostas:**
- ✅ `user_left` - Notifica outros membros

### **3. send_message**
Envia uma mensagem para o grupo.

```typescript
socket.emit('send_message', {
  groupId: string,
  content: string,
  replyToId?: string
});
```

**Respostas:**
- ✅ `new_message` - Mensagem enviada para todos
- ❌ `error` - Erro (não é membro, grupo não existe)

**Exemplo:**
```typescript
socket.emit('send_message', {
  groupId: 'group-123',
  content: 'Olá pessoal!',
  replyToId: 'message-456' // Opcional
});

socket.on('new_message', (message) => {
  console.log('Nova mensagem:', message);
});
```

### **4. typing_start**
Indica que o usuário está digitando.

```typescript
socket.emit('typing_start', {
  groupId: string
});
```

**Respostas:**
- ✅ `user_typing` - Lista de usuários digitando

### **5. typing_stop**
Para de indicar que está digitando.

```typescript
socket.emit('typing_stop', {
  groupId: string
});
```

### **6. add_reaction**
Adiciona ou remove reação de uma mensagem.

```typescript
socket.emit('add_reaction', {
  messageId: string,
  emoji: string
});
```

**Respostas:**
- ✅ `message_reaction_updated` - Reações atualizadas

## 📥 Eventos do Servidor

### **1. joined_group**
Confirmação de entrada no grupo.

```typescript
socket.on('joined_group', (data) => {
  console.log(data.groupName); // Nome do grupo
  console.log(data.message);   // Mensagem de boas-vindas
});
```

**Estrutura:**
```typescript
interface JoinedGroupData {
  groupId: string;
  groupName: string;
  message: string;
}
```

### **2. new_message**
Nova mensagem recebida.

```typescript
socket.on('new_message', (message) => {
  console.log(`${message.author.name}: ${message.content}`);
});
```

**Estrutura:**
```typescript
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
  replyTo?: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
    };
  };
}
```

### **3. user_typing**
Lista de usuários digitando.

```typescript
socket.on('user_typing', (data) => {
  console.log('Usuários digitando:', data.users);
});
```

**Estrutura:**
```typescript
interface TypingData {
  users: {
    userId: string;
    userName: string;
    timestamp: Date;
  }[];
}
```

### **4. user_joined**
Usuário entrou no grupo.

```typescript
socket.on('user_joined', (data) => {
  console.log(`${data.userName} entrou no chat`);
});
```

### **5. user_left**
Usuário saiu do grupo.

```typescript
socket.on('user_left', (data) => {
  console.log(`${data.userName} saiu do chat`);
});
```

### **6. message_reaction_updated**
Reações de mensagem atualizadas.

```typescript
socket.on('message_reaction_updated', (data) => {
  console.log('Reações:', data.reactions);
});
```

**Estrutura:**
```typescript
interface ReactionData {
  messageId: string;
  reactions: {
    emoji: string;
    users: {
      id: string;
      name: string;
    }[];
  }[];
}
```

### **7. error**
Erro ocorrido.

```typescript
socket.on('error', (error) => {
  console.error('Erro WebSocket:', error.message);
});
```

## ❌ Códigos de Erro

### **Erros de Autenticação**
- `Token não fornecido` - Token JWT ausente
- `Token inválido` - Token expirado ou malformado
- `Usuário não encontrado` - Usuário não existe no banco

### **Erros de Grupo**
- `Você não é membro deste grupo` - Usuário não tem acesso
- `Grupo não encontrado` - Grupo não existe
- `Este grupo é privado e você não foi convidado` - Sem permissão

### **Erros de Mensagem**
- `Mensagem não encontrada` - Mensagem não existe
- `Você não pode editar esta mensagem` - Sem permissão
- `Conteúdo muito longo` - Limite de caracteres excedido

## 💡 Exemplos de Uso

### **Exemplo Completo - Chat Básico**

```typescript
import { io } from 'socket.io-client';

class ChatManager {
  private socket: Socket;
  
  constructor(token: string) {
    this.socket = io('http://localhost:3001', {
      auth: { token }
    });
    
    this.setupEventListeners();
  }
  
  private setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Conectado ao chat');
    });
    
    this.socket.on('new_message', (message) => {
      this.displayMessage(message);
    });
    
    this.socket.on('user_typing', (data) => {
      this.showTypingIndicator(data.users);
    });
    
    this.socket.on('error', (error) => {
      console.error('Erro:', error.message);
    });
  }
  
  joinGroup(groupId: string) {
    this.socket.emit('join_group', { groupId });
  }
  
  sendMessage(groupId: string, content: string) {
    this.socket.emit('send_message', { groupId, content });
  }
  
  startTyping(groupId: string) {
    this.socket.emit('typing_start', { groupId });
  }
  
  stopTyping(groupId: string) {
    this.socket.emit('typing_stop', { groupId });
  }
  
  addReaction(messageId: string, emoji: string) {
    this.socket.emit('add_reaction', { messageId, emoji });
  }
  
  private displayMessage(message: ChatMessage) {
    // Implementar exibição da mensagem
    console.log(`${message.author.name}: ${message.content}`);
  }
  
  private showTypingIndicator(users: TypingUser[]) {
    // Implementar indicador de digitação
    if (users.length > 0) {
      console.log(`${users[0].userName} está digitando...`);
    }
  }
}

// Uso
const token = localStorage.getItem('token');
const chatManager = new ChatManager(token);

// Entrar em um grupo
chatManager.joinGroup('group-123');

// Enviar mensagem
chatManager.sendMessage('group-123', 'Olá pessoal!');

// Indicar digitação
chatManager.startTyping('group-123');
setTimeout(() => {
  chatManager.stopTyping('group-123');
}, 3000);
```

### **Exemplo - React Hook**

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useChat(groupId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const newSocket = io('http://localhost:3001', {
      auth: { token }
    });
    
    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join_group', { groupId });
    });
    
    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });
    
    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });
    
    newSocket.on('user_typing', (data) => {
      setTypingUsers(data.users);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, [groupId]);
  
  const sendMessage = (content: string) => {
    if (socket) {
      socket.emit('send_message', { groupId, content });
    }
  };
  
  const startTyping = () => {
    if (socket) {
      socket.emit('typing_start', { groupId });
    }
  };
  
  const stopTyping = () => {
    if (socket) {
      socket.emit('typing_stop', { groupId });
    }
  };
  
  return {
    socket,
    messages,
    typingUsers,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping
  };
}
```

## 🔧 Configuração do Servidor

### **Variáveis de Ambiente**
```env
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
PORT=3001
NODE_ENV=development
```

### **Rate Limiting**
```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: {
    success: false,
    message: 'Muitas requisições'
  }
});
```

### **Logs de Debug**
```typescript
// Habilitar logs detalhados
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
```

## 🚀 Deploy

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### **PM2**
```json
{
  "apps": [{
    "name": "studyhub-websocket",
    "script": "dist/app-websocket.js",
    "instances": 2,
    "exec_mode": "cluster"
  }]
}
```

### **Nginx (Proxy)**
```nginx
location /socket.io/ {
  proxy_pass http://localhost:3001;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
}
```

## 📊 Monitoramento

### **Métricas**
```typescript
// Estatísticas em tempo real
const stats = chatSocketManager.getStats();
console.log({
  connectedUsers: stats.connectedUsers,
  activeGroups: stats.activeGroups
});
```

### **Health Check**
```typescript
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    websocket: {
      connectedUsers: chatSocketManager.getStats().connectedUsers,
      activeGroups: chatSocketManager.getStats().activeGroups
    },
    timestamp: new Date().toISOString()
  });
});
```

---

**📚 Documentação WebSocket API - StudyHub**
*Versão: 1.0.0*
*Última atualização: $(date)*
