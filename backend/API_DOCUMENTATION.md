# 📚 StudyHub API - Documentação

## 🚀 Base URL
```
http://localhost:3001/api
```

## 🔐 Autenticação
Todas as rotas protegidas requerem o header:
```
Authorization: Bearer <token>
```

---

## 👤 **Autenticação**

### POST `/auth/register`
Registrar novo usuário

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "user-id",
      "name": "João Silva",
      "email": "joao@email.com",
      "points": 0,
      "studyHours": 0,
      "level": 1
    }
  }
}
```

### POST `/auth/login`
Fazer login

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "123456"
}
```

### GET `/auth/profile`
Buscar perfil do usuário (protegida)

---

## 📋 **Tarefas**

### GET `/tasks`
Listar tarefas do usuário

**Query params:**
- `completed`: boolean (filtrar por status)
- `subject`: string (filtrar por matéria)
- `priority`: LOW|MEDIUM|HIGH

### GET `/tasks/:id`
Buscar tarefa específica

### POST `/tasks`
Criar nova tarefa

**Body:**
```json
{
  "title": "Estudar React",
  "description": "Revisar hooks e context",
  "subject": "Programação",
  "priority": "HIGH",
  "dueDate": "2024-01-15T10:00:00Z"
}
```

### PUT `/tasks/:id`
Atualizar tarefa

### DELETE `/tasks/:id`
Deletar tarefa

### PATCH `/tasks/:id/complete`
Completar tarefa (+10 pontos)

---

## 🍅 **Pomodoro**

### GET `/pomodoro`
Listar sessões do usuário

**Query params:**
- `completed`: boolean
- `limit`: number (padrão: 50)

### GET `/pomodoro/stats`
Estatísticas do usuário

### POST `/pomodoro`
Iniciar nova sessão

**Body:**
```json
{
  "duration": 25
}
```

### PATCH `/pomodoro/:id/complete`
Completar sessão (+25 pontos por 25min)

---

## 🏆 **Conquistas**

### GET `/achievements`
Listar todas as conquistas (com status de desbloqueio)

### GET `/achievements/user`
Conquistas desbloqueadas pelo usuário

### POST `/achievements/check`
Verificar e desbloquear novas conquistas

### GET `/achievements/leaderboard`
Ranking de usuários

---

## 🌐 **Comunidade**

### GET `/community`
Listar posts (público)

**Query params:**
- `page`: number (padrão: 1)
- `limit`: number (padrão: 20)

### GET `/community/:id`
Buscar post específico

### POST `/community`
Criar novo post (protegida)

**Body:**
```json
{
  "content": "Acabei de completar 4 horas de estudo! 🎉"
}
```

### POST `/community/:id/like`
Curtir/descurtir post (protegida)

### POST `/community/:id/comments`
Comentar em post (protegida)

**Body:**
```json
{
  "content": "Parabéns! Continue assim! 👏"
}
```

### DELETE `/community/:id`
Deletar post (protegida)

---

## 📊 **Health Check**

### GET `/health`
Status da API

**Response:**
```json
{
  "success": true,
  "message": "StudyHub API está funcionando!",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "environment": "development"
}
```

---

## 🔧 **Códigos de Status**

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `403` - Token inválido
- `404` - Não encontrado
- `429` - Muitas requisições
- `500` - Erro interno

---

## 📝 **Formato de Resposta**

### Sucesso
```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": { ... }
}
```

### Erro
```json
{
  "success": false,
  "message": "Descrição do erro"
}
```

---

## 🚀 **Como Testar**

### 1. Instalar dependências
```bash
cd backend
npm install
```

### 2. Configurar banco
```bash
# Copiar .env
cp env.example .env

# Configurar DATABASE_URL no .env
# Executar migrações
npx prisma db push

# Executar seed
npm run db:seed
```

### 3. Iniciar servidor
```bash
npm run dev
```

### 4. Testar com curl
```bash
# Health check
curl http://localhost:3001/api/health

# Registrar usuário
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@email.com","password":"123456"}'
```

---

## 🛠️ **Scripts Disponíveis**

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run start        # Iniciar produção
npm run db:generate  # Gerar cliente Prisma
npm run db:push      # Executar migrações
npm run db:seed      # Popular banco
npm test            # Executar testes
```


