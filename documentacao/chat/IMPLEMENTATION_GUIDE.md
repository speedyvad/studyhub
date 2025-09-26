# 🚀 Guia de Implementação - Chat WebSocket

## 📋 Índice
- [Setup Inicial](#setup-inicial)
- [Configuração do Backend](#configuração-do-backend)
- [Configuração do Frontend](#configuração-do-frontend)
- [Testes](#testes)
- [Deploy](#deploy)
- [Troubleshooting](#troubleshooting)

## 🛠️ Setup Inicial

### **1. Pré-requisitos**
```bash
# Node.js 18+
node --version

# PostgreSQL 14+
psql --version

# Git
git --version
```

### **2. Clone e Instalação**
```bash
# Clone o repositório
git clone https://github.com/your-org/studyhub.git
cd studyhub

# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install
```

## 🔧 Configuração do Backend

### **1. Variáveis de Ambiente**
```bash
cd backend
cp env.example .env
```

**Editar `.env`:**
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/studyhub"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **2. Configurar Banco de Dados**
```bash
# Gerar Prisma Client
npx prisma generate

# Criar/migrar banco
npx prisma db push

# (Opcional) Seed com dados iniciais
npm run db:seed
```

### **3. Iniciar Backend**
```bash
# Desenvolvimento com WebSocket
npm run dev

# Ou apenas autenticação (sem WebSocket)
npm run dev:auth
```

**Verificar se está funcionando:**
```bash
curl http://localhost:3001/api/health
```

## 🎨 Configuração do Frontend

### **1. Variáveis de Ambiente**
```bash
cd frontend
cp .env.example .env.local
```

**Editar `.env.local`:**
```env
VITE_API_URL="http://localhost:3001"
VITE_WS_URL="http://localhost:3001"
```

### **2. Instalar Dependências Adicionais**
```bash
# Socket.IO Client (já instalado)
npm install socket.io-client

# Verificar se está instalado
npm list socket.io-client
```

### **3. Iniciar Frontend**
```bash
npm run dev
```

**Verificar se está funcionando:**
- Abrir `http://localhost:5173`
- Verificar console do navegador
- Testar login/registro

## 🧪 Testes

### **1. Teste Manual - WebSocket**
```bash
cd backend
node test-websocket.js
```

**Saída esperada:**
```
🚀 Iniciando teste do WebSocket...
✅ Conectado ao WebSocket
✅ Entrou no grupo: { groupId: 'test-group', groupName: 'Test Group' }
📨 Nova mensagem: { id: '...', content: 'Olá, esta é uma mensagem de teste!' }
```

### **2. Teste Manual - Frontend**
1. **Login** no sistema
2. **Navegar** para Comunidade → Grupos
3. **Criar** um grupo
4. **Entrar** no grupo
5. **Abrir** o chat
6. **Enviar** mensagem
7. **Verificar** se aparece em tempo real

### **3. Teste de Conexão**
```javascript
// No console do navegador
const socket = io('http://localhost:3001', {
  auth: { token: localStorage.getItem('token') }
});

socket.on('connect', () => console.log('✅ Conectado'));
socket.on('disconnect', () => console.log('❌ Desconectado'));
```

## 🚀 Deploy

### **1. Build de Produção**

#### **Backend**
```bash
cd backend
npm run build
```

#### **Frontend**
```bash
cd frontend
npm run build
```

### **2. Docker (Recomendado)**

#### **Backend Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci --only=production

# Copiar código
COPY . .

# Build
RUN npm run build

# Expor porta
EXPOSE 3001

# Comando
CMD ["npm", "start:websocket"]
```

#### **Docker Compose**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: studyhub
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/studyhub
      JWT_SECRET: your-secret-key
      NODE_ENV: production
    ports:
      - "3001:3001"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### **3. Deploy Manual**

#### **Backend**
```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start dist/app-websocket.js --name studyhub-backend

# Configurar auto-restart
pm2 startup
pm2 save
```

#### **Frontend**
```bash
# Build
npm run build

# Servir com nginx
sudo cp -r dist/* /var/www/html/
```

### **4. Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## 🐛 Troubleshooting

### **Problemas Comuns**

#### **1. WebSocket não conecta**
```bash
# Verificar se backend está rodando
curl http://localhost:3001/api/health

# Verificar logs
npm run dev

# Verificar token
localStorage.getItem('token')
```

#### **2. Erro de CORS**
```typescript
// Verificar configuração no backend
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
```

#### **3. Banco de dados não conecta**
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conexão
npx prisma db push

# Resetar banco (CUIDADO!)
npx prisma db push --force-reset
```

#### **4. Mensagens não aparecem**
```bash
# Verificar logs do backend
npm run dev

# Verificar se usuário é membro do grupo
# Verificar permissões no banco
```

#### **5. Frontend não carrega**
```bash
# Verificar se frontend está rodando
curl http://localhost:5173

# Verificar console do navegador
# Verificar erros de build
npm run build
```

### **Logs de Debug**

#### **Backend**
```typescript
// Habilitar logs detalhados
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Logs WebSocket
socket.on('connect', () => {
  console.log(`Usuário ${socket.user.name} conectado: ${socket.id}`);
});
```

#### **Frontend**
```typescript
// Debug WebSocket
const socket = io('http://localhost:3001', {
  auth: { token: localStorage.getItem('token') }
});

socket.on('connect', () => console.log('✅ Conectado'));
socket.on('disconnect', () => console.log('❌ Desconectado'));
socket.on('error', (error) => console.error('❌ Erro:', error));
```

### **Comandos Úteis**

#### **Reset Completo**
```bash
# Parar tudo
pm2 stop all
docker-compose down

# Limpar banco
npx prisma db push --force-reset

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

#### **Verificar Status**
```bash
# Backend
curl http://localhost:3001/api/health

# Frontend
curl http://localhost:5173

# Banco
npx prisma db push

# WebSocket
node test-websocket.js
```

## 📊 Monitoramento

### **Métricas Importantes**
- **Conexões WebSocket** ativas
- **Mensagens** por minuto
- **Grupos** ativos
- **Erros** de conexão
- **Latência** de mensagens

### **Health Checks**
```typescript
// Endpoint de saúde
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    websocket: chatSocketManager.getStats(),
    database: await prisma.$queryRaw`SELECT 1`,
    timestamp: new Date().toISOString()
  });
});
```

### **Logs Estruturados**
```typescript
// Logs com contexto
console.log(JSON.stringify({
  level: 'info',
  message: 'User joined group',
  userId: socket.userId,
  groupId: data.groupId,
  timestamp: new Date().toISOString()
}));
```

## 🔒 Segurança

### **Checklist de Segurança**
- [ ] **JWT Secret** forte
- [ ] **CORS** configurado corretamente
- [ ] **Rate limiting** ativo
- [ ] **Validação** de dados
- [ ] **Autenticação** em todas as rotas
- [ ] **HTTPS** em produção
- [ ] **Headers** de segurança
- [ ] **Logs** de auditoria

### **Configuração de Produção**
```env
NODE_ENV=production
JWT_SECRET=super-secret-key-256-bits
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_MAX_REQUESTS=50
```

## 📈 Performance

### **Otimizações**
- **Connection pooling** no banco
- **Redis** para cache
- **CDN** para assets
- **Compressão** gzip
- **Rate limiting** por usuário
- **Paginação** de mensagens

### **Métricas de Performance**
```typescript
// Monitorar latência
const start = Date.now();
socket.emit('send_message', data);
socket.on('new_message', () => {
  console.log(`Latência: ${Date.now() - start}ms`);
});
```

---

**🎉 Guia de Implementação Completo!**

*Para dúvidas, consulte a documentação técnica ou abra uma issue no GitHub.*

**Versão:** 1.0.0  
**Última atualização:** $(date)  
**Autor:** StudyHub Team