# 📚 STUDYHUB - MANUAL COMPLETO

## 🎯 Visão Geral

O **StudyHub** é uma plataforma completa de produtividade para estudantes que combina:
- ✅ **Gerenciamento de Tarefas** com grupos e filtros avançados
- ⏰ **Sessões de Foco** (Pomodoro) com gamificação
- 👥 **Sistema de Grupos** para organização
- 📊 **Estatísticas** e acompanhamento de progresso
- 🖼️ **Upload de Arquivos** e fotos de perfil
- 🔐 **Autenticação** segura com JWT

## 🏗️ Arquitetura

```
StudyHub/
├── frontend/          # React + Vite + TypeScript
├── backend/           # Node.js + Express + Prisma
├── documentacao/      # 📚 Esta documentação
└── database/          # PostgreSQL + Redis (Docker)
```

## 📖 Índice da Documentação

### **🚀 Início Rápido**
- [**INSTALACAO.md**](./INSTALACAO.md) - Como instalar e configurar
- [**PRIMEIROS_PASSOS.md**](./PRIMEIROS_PASSOS.md) - Primeiro uso

### **🔧 Desenvolvimento**
- [**ARQUITETURA.md**](./ARQUITETURA.md) - Estrutura do projeto
- [**BACKEND.md**](./BACKEND.md) - API e banco de dados
- [**FRONTEND.md**](./FRONTEND.md) - Interface e componentes
- [**INTEGRACAO.md**](./INTEGRACAO.md) - Como frontend e backend se comunicam

### **🗄️ Banco de Dados**
- [**BANCO_DADOS.md**](./BANCO_DADOS.md) - Schema e relacionamentos
- [**MIGRACOES.md**](./MIGRACOES.md) - Como fazer mudanças no banco

### **🎨 Interface**
- [**COMPONENTES.md**](./COMPONENTES.md) - Componentes React
- [**PAGINAS.md**](./PAGINAS.md) - Páginas da aplicação
- [**ESTILOS.md**](./ESTILOS.md) - Sistema de design

### **🔌 APIs**
- [**API_AUTENTICACAO.md**](./API_AUTENTICACAO.md) - Login, registro, perfil
- [**API_TAREFAS.md**](./API_TAREFAS.md) - CRUD de tarefas
- [**API_GRUPOS.md**](./API_GRUPOS.md) - Gerenciamento de grupos
- [**API_POMODORO.md**](./API_POMODORO.md) - Sessões de foco
- [**API_UPLOAD.md**](./API_UPLOAD.md) - Upload de arquivos

### **🚀 Deploy**
- [**DEPLOY.md**](./DEPLOY.md) - Como colocar em produção
- [**DOCKER.md**](./DOCKER.md) - Containerização
- [**AMBIENTE.md**](./AMBIENTE.md) - Variáveis de ambiente

### **🛠️ Manutenção**
- [**COMANDOS.md**](./COMANDOS.md) - Comandos úteis
- [**TROUBLESHOOTING.md**](./TROUBLESHOOTING.md) - Resolução de problemas
- [**LOGS.md**](./LOGS.md) - Como debugar

## 🎯 Para Diferentes Públicos

### **👨‍💻 Desenvolvedor Iniciante**
1. Leia [INSTALACAO.md](./INSTALACAO.md)
2. Siga [PRIMEIROS_PASSOS.md](./PRIMEIROS_PASSOS.md)
3. Explore [ARQUITETURA.md](./ARQUITETURA.md)
4. Estude [FRONTEND.md](./FRONTEND.md) e [BACKEND.md](./BACKEND.md)

### **🔧 Desenvolvedor Experiente**
1. [ARQUITETURA.md](./ARQUITETURA.md) - Visão geral
2. [INTEGRACAO.md](./INTEGRACAO.md) - Como tudo se conecta
3. [API_*.md](./API_AUTENTICACAO.md) - Documentação das APIs
4. [DEPLOY.md](./DEPLOY.md) - Para produção

### **🎨 Designer/Frontend**
1. [FRONTEND.md](./FRONTEND.md) - Estrutura React
2. [COMPONENTES.md](./COMPONENTES.md) - Componentes disponíveis
3. [ESTILOS.md](./ESTILOS.md) - Sistema de design
4. [PAGINAS.md](./PAGINAS.md) - Páginas da aplicação

### **🗄️ Backend/Database**
1. [BACKEND.md](./BACKEND.md) - Servidor e APIs
2. [BANCO_DADOS.md](./BANCO_DADOS.md) - Schema e relacionamentos
3. [API_*.md](./API_AUTENTICACAO.md) - Documentação das APIs
4. [MIGRACOES.md](./MIGRACOES.md) - Mudanças no banco

## 🚀 Início Rápido

```bash
# 1. Clonar o projeto
git clone https://github.com/seu-usuario/studyhub.git
cd studyhub

# 2. Instalar dependências
cd frontend && npm install
cd ../backend && npm install

# 3. Configurar banco
cd backend
sudo docker-compose up -d
npx prisma db push

# 4. Iniciar aplicação
# Terminal 1 - Backend
node src/app-working.js

# Terminal 2 - Frontend  
cd ../frontend
npm run dev
```

## 📞 Suporte

- **Documentação**: Esta pasta `documentacao/`
- **Issues**: GitHub Issues
- **Comandos**: [COMANDOS.md](./COMANDOS.md)
- **Problemas**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 📝 Changelog

### **v1.0.0** - Versão Inicial
- ✅ Sistema de autenticação
- ✅ Gerenciamento de tarefas
- ✅ Grupos de tarefas
- ✅ Sessões Pomodoro
- ✅ Upload de arquivos
- ✅ Interface responsiva

---

**📚 Continue lendo a documentação específica para sua necessidade!**
