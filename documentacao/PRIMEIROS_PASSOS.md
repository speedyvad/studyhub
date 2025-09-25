# 🚀 PRIMEIROS PASSOS - STUDYHUB

## 📋 Visão Geral

Este guia te ajudará a dar os primeiros passos no StudyHub, desde a instalação até o primeiro uso da aplicação.

## 🎯 O que é o StudyHub?

O **StudyHub** é uma plataforma completa de produtividade para estudantes que oferece:

- ✅ **Gerenciamento de Tarefas** com grupos e filtros
- ⏰ **Sessões de Foco** (Pomodoro) com gamificação
- 👥 **Sistema de Grupos** para organização
- 📊 **Estatísticas** e acompanhamento
- 🖼️ **Upload de Arquivos** e fotos de perfil
- 🔐 **Autenticação** segura

## 🚀 Instalação Rápida

### **1. Pré-requisitos**
```bash
# Verificar se Node.js está instalado
node --version  # Deve mostrar v18+

# Verificar se Docker está instalado
docker --version

# Verificar se Git está instalado
git --version
```

### **2. Clonar e Configurar**
```bash
# Clonar o projeto
git clone https://github.com/seu-usuario/studyhub.git
cd studyhub

# Instalar dependências do frontend
cd frontend
npm install

# Instalar dependências do backend
cd ../backend
npm install
```

### **3. Configurar Banco de Dados**
```bash
# Iniciar containers Docker
cd backend
sudo docker-compose up -d

# Configurar banco
npx prisma db push
```

### **4. Iniciar Aplicação**
```bash
# Terminal 1 - Backend
cd backend
node src/app-working.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🎉 Primeiro Uso

### **1. Acessar a Aplicação**
- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:3001`

### **2. Criar Primeira Conta**
1. Acesse `http://localhost:5173`
2. Clique em "Registrar"
3. Preencha os dados:
   - **Nome**: Seu nome
   - **Email**: Seu email
   - **Senha**: Sua senha
4. Clique em "Criar Conta"

### **3. Fazer Login**
1. Clique em "Login"
2. Digite seu email e senha
3. Clique em "Entrar"

## 📝 Criando Sua Primeira Tarefa

### **1. Acessar Página de Tarefas**
- No menu lateral, clique em "Tarefas"
- Você verá a página de gerenciamento de tarefas

### **2. Criar Nova Tarefa**
1. Clique no botão "Nova Tarefa"
2. Preencha o formulário:
   - **Título**: "Estudar React"
   - **Descrição**: "Aprender hooks e componentes"
   - **Matéria**: "Programação"
   - **Prioridade**: "Alta"
3. Clique em "Criar Tarefa"

### **3. Gerenciar Tarefas**
- **Marcar como concluída**: Clique no ✓
- **Excluir**: Clique no ×
- **Filtrar**: Use os filtros no topo
- **Buscar**: Digite na barra de busca

## 👥 Criando Seu Primeiro Grupo

### **1. Acessar Gerenciador de Grupos**
- Na página de tarefas, clique em "Grupos"
- Clique em "Novo Grupo"

### **2. Configurar Grupo**
1. **Nome**: "Estudos de Frontend"
2. **Descrição**: "Tarefas relacionadas ao desenvolvimento frontend"
3. **Cor**: Escolha uma cor
4. **Ícone**: Escolha um ícone
5. Clique em "Criar Grupo"

### **3. Associar Tarefas ao Grupo**
- Ao criar uma nova tarefa, selecione o grupo criado
- As tarefas aparecerão organizadas por grupo

## ⏰ Primeira Sessão de Foco

### **1. Acessar Sessão de Foco**
- No menu lateral, clique em "Sessão de Foco"
- Você verá a interface de configuração

### **2. Configurar Sessão**
1. **Tempo total**: "60 minutos"
2. **Matéria**: "Programação"
3. Clique em "Gerar Plano"

### **3. Iniciar Sessão**
1. Revise o plano gerado
2. Veja quantas "coins" você ganhará
3. Clique em "Aceitar Desafio"
4. A sessão começará automaticamente

### **4. Durante a Sessão**
- **Timer**: Mostra o tempo restante
- **Ciclos**: Mostra quantos ciclos faltam
- **Progresso**: Barra de progresso na parte inferior
- **Controles**: Pausar, continuar ou resetar

## 📊 Visualizando Estatísticas

### **1. Dashboard Principal**
- Acesse a página inicial (Dashboard)
- Veja suas estatísticas:
  - **Tarefas**: Total, pendentes, concluídas
  - **Pomodoro**: Sessões completadas
  - **Pontos**: Seus pontos de gamificação
  - **Horas**: Horas estudadas

### **2. Página de Estatísticas**
- No menu lateral, clique em "Estatísticas"
- Veja gráficos detalhados:
  - **Produtividade**: Por dia/semana
  - **Matérias**: Tempo por matéria
  - **Conquistas**: Suas conquistas

## 🖼️ Configurando Perfil

### **1. Acessar Perfil**
- No menu lateral, clique em "Perfil"
- Clique em "Editar Perfil"

### **2. Atualizar Informações**
1. **Nome**: Atualize se necessário
2. **Bio**: Adicione uma biografia
3. **Foto**: Clique em "Alterar Foto"
4. Selecione uma imagem
5. Clique em "Salvar"

### **3. Ver Estatísticas Pessoais**
- **Pontos**: Seus pontos acumulados
- **Nível**: Seu nível atual
- **Horas**: Horas estudadas
- **Conquistas**: Suas conquistas

## 🎮 Sistema de Gamificação

### **Como Ganhar Pontos**
- **Tarefas**: 10 pontos por tarefa concluída
- **Pomodoro**: 2 pontos por minuto de foco
- **Conquistas**: Pontos extras por conquistas

### **Níveis e Conquistas**
- **Nível 1**: 0-100 pontos
- **Nível 2**: 100-500 pontos
- **Nível 3**: 500-1000 pontos
- **E assim por diante...**

### **Conquistas Disponíveis**
- 🎯 **Primeira Tarefa**: Complete sua primeira tarefa
- ⏰ **Primeira Sessão**: Complete sua primeira sessão de foco
- 📚 **Estudioso**: Complete 10 tarefas
- 🔥 **Focado**: Complete 10 sessões de foco
- 🏆 **Mestre**: Alcance o nível 5

## 🔧 Personalizando a Interface

### **1. Tema Escuro/Claro**
- Clique no ícone de tema no menu lateral
- Alterna entre tema claro e escuro

### **2. Sidebar Colapsível**
- Clique no ícone de menu no topo da sidebar
- A sidebar se recolhe/expande

### **3. Filtros de Tarefas**
- **Todas**: Mostra todas as tarefas
- **Pendentes**: Mostra apenas tarefas pendentes
- **Concluídas**: Mostra apenas tarefas concluídas
- **Matéria**: Filtra por matéria específica

## 📱 Usando em Dispositivos Móveis

### **1. Acessar via Mobile**
- Abra o navegador no seu celular
- Acesse `http://SEU_IP:5173`
- A interface se adapta automaticamente

### **2. Funcionalidades Mobile**
- **Touch**: Toque para interagir
- **Swipe**: Deslize para navegar
- **Responsivo**: Interface adaptada para mobile

## 🚨 Resolução de Problemas Comuns

### **1. Aplicação Não Carrega**
```bash
# Verificar se serviços estão rodando
curl http://localhost:3001/api/health
curl http://localhost:5173

# Reiniciar se necessário
sudo docker-compose restart
```

### **2. Erro de Login**
- Limpe o cache do navegador
- Verifique se o email e senha estão corretos
- Tente criar uma nova conta

### **3. Dados Não Aparecem**
- Recarregue a página (F5)
- Verifique se o backend está rodando
- Limpe o localStorage do navegador

## 🎯 Próximos Passos

### **1. Explorar Funcionalidades**
- Experimente todas as funcionalidades
- Crie várias tarefas e grupos
- Faça sessões de foco

### **2. Personalizar**
- Configure seu perfil
- Crie grupos personalizados
- Defina suas matérias favoritas

### **3. Acompanhar Progresso**
- Veja suas estatísticas
- Acompanhe seu progresso
- Alcance novas conquistas

## 📚 Recursos Adicionais

### **Documentação Completa**
- [**INSTALACAO.md**](./INSTALACAO.md) - Instalação detalhada
- [**ARQUITETURA.md**](./ARQUITETURA.md) - Arquitetura do sistema
- [**BACKEND.md**](./BACKEND.md) - Documentação do backend
- [**FRONTEND.md**](./FRONTEND.md) - Documentação do frontend

### **Comandos Úteis**
- [**COMANDOS.md**](./COMANDOS.md) - Comandos para desenvolvimento
- [**TROUBLESHOOTING.md**](./TROUBLESHOOTING.md) - Resolução de problemas

### **APIs**
- [**API_AUTENTICACAO.md**](./API_AUTENTICACAO.md) - API de autenticação
- [**API_TAREFAS.md**](./API_TAREFAS.md) - API de tarefas
- [**API_GRUPOS.md**](./API_GRUPOS.md) - API de grupos

## 🎉 Parabéns!

Você completou o guia de primeiros passos! Agora você sabe:

- ✅ Como instalar e configurar o StudyHub
- ✅ Como criar sua primeira conta
- ✅ Como gerenciar tarefas e grupos
- ✅ Como usar sessões de foco
- ✅ Como visualizar estatísticas
- ✅ Como personalizar seu perfil
- ✅ Como resolver problemas comuns

**🚀 Agora é hora de explorar e aproveitar ao máximo o StudyHub!**

---

**📚 Continue explorando a documentação completa para aprender mais sobre o StudyHub!**
