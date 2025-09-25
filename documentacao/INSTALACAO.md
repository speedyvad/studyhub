# 🚀 INSTALAÇÃO - STUDYHUB

## 📋 Pré-requisitos

### **Sistema Operacional**
- **Linux** (Ubuntu 20.04+ recomendado)
- **Windows** (WSL2 recomendado)
- **macOS** (10.15+)

### **Software Necessário**

#### **1. Node.js (v18+)**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v18+
npm --version   # Deve mostrar 9+
```

#### **2. Docker e Docker Compose**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalação
docker --version
docker-compose --version
```

#### **3. Git**
```bash
# Ubuntu/Debian
sudo apt-get install git

# Verificar
git --version
```

## 📥 Instalação do Projeto

### **1. Clonar Repositório**
```bash
# Clonar o projeto
git clone https://github.com/seu-usuario/studyhub.git
cd studyhub

# Verificar estrutura
ls -la
```

**Estrutura esperada:**
```
studyhub/
├── frontend/          # React + Vite
├── backend/           # Node.js + Express
├── documentacao/      # Esta documentação
└── README.md
```

### **2. Instalar Dependências do Frontend**
```bash
cd frontend

# Instalar dependências
npm install

# Verificar se instalou corretamente
npm list --depth=0
```

**Dependências principais:**
- `react` - Framework principal
- `vite` - Build tool
- `typescript` - Tipagem
- `framer-motion` - Animações
- `zustand` - Estado global
- `react-router-dom` - Roteamento
- `lucide-react` - Ícones

### **3. Instalar Dependências do Backend**
```bash
cd ../backend

# Instalar dependências
npm install

# Verificar se instalou corretamente
npm list --depth=0
```

**Dependências principais:**
- `express` - Servidor web
- `prisma` - ORM para banco de dados
- `bcrypt` - Hash de senhas
- `jsonwebtoken` - Autenticação
- `cors` - CORS middleware
- `@prisma/client` - Cliente Prisma

## 🗄️ Configuração do Banco de Dados

### **1. Iniciar Containers Docker**
```bash
# No diretório backend
cd backend

# Iniciar PostgreSQL e Redis
sudo docker-compose up -d

# Verificar se containers estão rodando
sudo docker ps
```

**Containers esperados:**
```
CONTAINER ID   IMAGE         PORTS                    NAMES
abc123def456   postgres:15   0.0.0.0:5432->5432/tcp   studyhub-postgres
def456ghi789   redis:7       0.0.0.0:6379->6379/tcp   studyhub-redis
```

### **2. Configurar Banco de Dados**
```bash
# Executar migrações do Prisma
npx prisma db push

# Verificar se funcionou
npx prisma studio
```

**Se tudo funcionou:**
- Prisma Studio abrirá no navegador
- Você verá as tabelas: `User`, `Task`, `TaskGroup`, `PomodoroSession`

### **3. Verificar Conexão**
```bash
# Testar conexão com banco
npx prisma db seed  # Se houver seed configurado
```

## 🚀 Iniciar Aplicação

### **1. Iniciar Backend**
```bash
# Terminal 1 - Backend
cd backend
node src/app-working.js
```

**Saída esperada:**
```
🚀 StudyHub API rodando na porta 3001
🌐 CORS Origin: http://localhost:5173
```

### **2. Iniciar Frontend**
```bash
# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Saída esperada:**
```
  VITE v4.4.5  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### **3. Verificar Funcionamento**
1. **Abrir navegador**: `http://localhost:5173`
2. **Verificar backend**: `http://localhost:3001/api/health`
3. **Testar login**: Criar conta e fazer login

## 🔧 Configuração Avançada

### **Variáveis de Ambiente**

#### **Backend (.env)**
```bash
# Criar arquivo .env no backend
cd backend
touch .env
```

**Conteúdo do .env:**
```env
# Banco de dados
DATABASE_URL="postgresql://studyhub:studyhub123@localhost:5432/studyhub"

# JWT
JWT_SECRET="seu-jwt-secret-super-seguro-aqui"

# Redis
REDIS_URL="redis://localhost:6379"

# Porta
PORT=3001
```

#### **Frontend (.env)**
```bash
# Criar arquivo .env no frontend
cd frontend
touch .env
```

**Conteúdo do .env:**
```env
# API Backend
VITE_API_URL=http://localhost:3001/api

# Nome da aplicação
VITE_APP_NAME=StudyHub
```

### **Configuração do Docker**

#### **docker-compose.yml (backend/)**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: studyhub-postgres
    environment:
      POSTGRES_DB: studyhub
      POSTGRES_USER: studyhub
      POSTGRES_PASSWORD: studyhub123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: studyhub-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## ✅ Verificação da Instalação

### **Checklist de Verificação**

#### **✅ Backend**
- [ ] Node.js v18+ instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Docker rodando (`sudo docker ps`)
- [ ] PostgreSQL acessível (porta 5432)
- [ ] Redis acessível (porta 6379)
- [ ] Prisma conectado (`npx prisma db push`)
- [ ] Servidor iniciado (`node src/app-working.js`)

#### **✅ Frontend**
- [ ] Node.js v18+ instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Vite funcionando (`npm run dev`)
- [ ] Aplicação carregando (`http://localhost:5173`)

#### **✅ Integração**
- [ ] Backend respondendo (`http://localhost:3001/api/health`)
- [ ] Frontend conectando com backend
- [ ] Login funcionando
- [ ] Tarefas carregando

### **Comandos de Teste**

#### **Testar Backend**
```bash
# Health check
curl http://localhost:3001/api/health

# Resposta esperada:
# {"success":true,"message":"StudyHub API está funcionando!"}
```

#### **Testar Frontend**
```bash
# Verificar se frontend está rodando
curl http://localhost:5173

# Deve retornar HTML da aplicação
```

#### **Testar Integração**
```bash
# Testar login
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@teste.com","password":"123456"}'

# Resposta esperada:
# {"success":true,"message":"Usuário criado com sucesso!"}
```

## 🚨 Problemas Comuns

### **Erro: "Port already in use"**
```bash
# Verificar processos usando as portas
sudo lsof -i :3001  # Backend
sudo lsof -i :5173  # Frontend
sudo lsof -i :5432  # PostgreSQL

# Matar processos se necessário
sudo kill -9 <PID>
```

### **Erro: "Cannot connect to database"**
```bash
# Verificar se Docker está rodando
sudo docker ps

# Reiniciar containers
sudo docker-compose down
sudo docker-compose up -d

# Verificar logs
sudo docker logs studyhub-postgres
```

### **Erro: "Module not found"**
```bash
# Reinstalar dependências
cd frontend && rm -rf node_modules package-lock.json && npm install
cd ../backend && rm -rf node_modules package-lock.json && npm install
```

### **Erro: "Prisma client not found"**
```bash
# Regenerar cliente Prisma
cd backend
npx prisma generate
npx prisma db push
```

## 🎉 Próximos Passos

Após a instalação bem-sucedida:

1. **Leia**: [PRIMEIROS_PASSOS.md](./PRIMEIROS_PASSOS.md)
2. **Explore**: [ARQUITETURA.md](./ARQUITETURA.md)
3. **Desenvolva**: [FRONTEND.md](./FRONTEND.md) e [BACKEND.md](./BACKEND.md)

---

**🎯 Instalação concluída! Agora você pode começar a usar o StudyHub!**
