# 🔧 TROUBLESHOOTING - STUDYHUB

## 📋 Visão Geral

Este documento contém soluções para os problemas mais comuns encontrados no desenvolvimento e uso do StudyHub.

## 🚨 Problemas Críticos

### **1. Aplicação Não Inicia**

#### **Sintomas:**
- Frontend não carrega (tela branca)
- Backend não responde
- Erro de conexão com banco

#### **Soluções:**
```bash
# 1. Verificar se todos os serviços estão rodando
sudo docker ps
curl http://localhost:3001/api/health
curl http://localhost:5173

# 2. Reiniciar tudo
sudo docker-compose down
sudo docker-compose up -d
cd backend && node src/app-working.js &
cd frontend && npm run dev &

# 3. Verificar logs
sudo docker logs studyhub-postgres
sudo docker logs studyhub-redis
```

### **2. Erro de Conexão com Banco**

#### **Sintomas:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
PrismaClientInitializationError
```

#### **Soluções:**
```bash
# 1. Verificar se PostgreSQL está rodando
sudo docker ps | grep postgres

# 2. Reiniciar container
sudo docker restart studyhub-postgres

# 3. Verificar logs
sudo docker logs studyhub-postgres

# 4. Testar conexão
docker exec studyhub-postgres pg_isready -U studyhub

# 5. Recriar container se necessário
sudo docker-compose down -v
sudo docker-compose up -d
```

### **3. Erro de Autenticação**

#### **Sintomas:**
```
401 Unauthorized
Token inválido
```

#### **Soluções:**
```bash
# 1. Limpar localStorage
# No navegador: F12 → Application → Local Storage → Clear All

# 2. Verificar JWT_SECRET
# No backend/.env
JWT_SECRET=seu-jwt-secret-super-seguro-aqui

# 3. Reiniciar backend
pkill -f "node src/app-working.js"
cd backend && node src/app-working.js
```

## 🐛 Problemas de Frontend

### **1. Tela Branca no Frontend**

#### **Sintomas:**
- Página não carrega
- Console mostra erros de JavaScript

#### **Soluções:**
```bash
# 1. Verificar se frontend está rodando
curl http://localhost:5173

# 2. Limpar cache do navegador
# Ctrl+Shift+R (hard refresh)

# 3. Verificar console do navegador
# F12 → Console → Ver erros

# 4. Reinstalar dependências
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### **2. Erro de Módulo Não Encontrado**

#### **Sintomas:**
```
Module not found: Can't resolve 'module'
The requested module does not provide an export named 'X'
```

#### **Soluções:**
```bash
# 1. Verificar se dependência está instalada
npm list module-name

# 2. Reinstalar dependência
npm install module-name

# 3. Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 4. Verificar imports
# Verificar se o import está correto
import { Component } from 'module-name';
```

### **3. Erro de TypeScript**

#### **Sintomas:**
```
Type 'X' is not assignable to type 'Y'
Property 'X' does not exist on type 'Y'
```

#### **Soluções:**
```bash
# 1. Verificar tipos
npm run type-check

# 2. Regenerar tipos
npx prisma generate

# 3. Verificar tsconfig.json
# Verificar se include/exclude estão corretos

# 4. Instalar tipos faltantes
npm install @types/node
npm install @types/react
```

## 🗄️ Problemas de Banco de Dados

### **1. Erro de Schema**

#### **Sintomas:**
```
PrismaClientValidationError: Unknown argument 'X'
Invalid `prisma.model.create()` invocation
```

#### **Soluções:**
```bash
# 1. Verificar schema
npx prisma validate

# 2. Regenerar cliente
npx prisma generate

# 3. Aplicar mudanças
npx prisma db push

# 4. Resetar banco se necessário
npx prisma migrate reset
```

### **2. Erro de Conexão**

#### **Sintomas:**
```
Error: P1001: Can't reach database server
Error: P1002: The database server is not running
```

#### **Soluções:**
```bash
# 1. Verificar se PostgreSQL está rodando
sudo docker ps | grep postgres

# 2. Verificar URL de conexão
# No .env: DATABASE_URL="postgresql://studyhub:studyhub123@localhost:5432/studyhub"

# 3. Testar conexão
docker exec studyhub-postgres psql -U studyhub studyhub -c "SELECT 1;"

# 4. Reiniciar container
sudo docker restart studyhub-postgres
```

### **3. Erro de Migração**

#### **Sintomas:**
```
Migration failed
Database schema is not in sync
```

#### **Soluções:**
```bash
# 1. Verificar status
npx prisma db status

# 2. Aplicar migrações
npx prisma migrate deploy

# 3. Resetar se necessário
npx prisma migrate reset

# 4. Forçar push
npx prisma db push --force-reset
```

## 🔌 Problemas de API

### **1. Erro 500 Internal Server Error**

#### **Sintomas:**
```
500 Internal Server Error
Erro interno do servidor
```

#### **Soluções:**
```bash
# 1. Verificar logs do backend
# No terminal onde o backend está rodando

# 2. Verificar se banco está acessível
curl http://localhost:3001/api/health

# 3. Verificar variáveis de ambiente
# No backend/.env

# 4. Reiniciar backend
pkill -f "node src/app-working.js"
cd backend && node src/app-working.js
```

### **2. Erro 401 Unauthorized**

#### **Sintomas:**
```
401 Unauthorized
Token não fornecido
```

#### **Soluções:**
```bash
# 1. Verificar se token está sendo enviado
# No navegador: F12 → Network → Ver headers

# 2. Limpar localStorage
# No navegador: F12 → Application → Local Storage → Clear All

# 3. Fazer login novamente
# Ir para página de login

# 4. Verificar JWT_SECRET
# No backend/.env
```

### **3. Erro 403 Forbidden**

#### **Sintomas:**
```
403 Forbidden
Acesso negado
```

#### **Soluções:**
```bash
# 1. Verificar se usuário tem permissão
# Verificar role do usuário no banco

# 2. Verificar se rota requer admin
# Verificar middleware requireAdmin

# 3. Verificar token
# Verificar se token contém role correto
```

## 🐳 Problemas de Docker

### **1. Container Não Inicia**

#### **Sintomas:**
```
Container exited with code 1
Container is not running
```

#### **Soluções:**
```bash
# 1. Verificar logs
sudo docker logs studyhub-postgres
sudo docker logs studyhub-redis

# 2. Verificar se porta está em uso
sudo lsof -i :5432
sudo lsof -i :6379

# 3. Parar e recriar
sudo docker-compose down
sudo docker-compose up -d

# 4. Limpar volumes se necessário
sudo docker-compose down -v
sudo docker-compose up -d
```

### **2. Erro de Permissão**

#### **Sintomas:**
```
Permission denied
Cannot connect to Docker daemon
```

#### **Soluções:**
```bash
# 1. Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker

# 2. Reiniciar Docker
sudo systemctl restart docker

# 3. Verificar permissões
ls -la /var/run/docker.sock
```

### **3. Erro de Espaço em Disco**

#### **Sintomas:**
```
No space left on device
Docker daemon error
```

#### **Soluções:**
```bash
# 1. Verificar espaço
df -h

# 2. Limpar Docker
sudo docker system prune -a

# 3. Limpar volumes
sudo docker volume prune

# 4. Limpar imagens
sudo docker image prune -a
```

## 🔄 Problemas de Sincronização

### **1. Dados Não Atualizam**

#### **Sintomas:**
- Mudanças não aparecem na interface
- Dados antigos sendo exibidos

#### **Soluções:**
```bash
# 1. Limpar cache do navegador
# Ctrl+Shift+R (hard refresh)

# 2. Verificar se backend está atualizado
curl http://localhost:3001/api/tasks

# 3. Verificar se banco está atualizado
docker exec studyhub-postgres psql -U studyhub studyhub -c "SELECT * FROM tasks LIMIT 5;"

# 4. Reiniciar frontend
# Parar e reiniciar npm run dev
```

### **2. Estado Inconsistente**

#### **Sintomas:**
- Interface mostra dados diferentes
- Erro de estado não encontrado

#### **Soluções:**
```bash
# 1. Limpar localStorage
# No navegador: F12 → Application → Local Storage → Clear All

# 2. Recarregar página
# F5 ou Ctrl+R

# 3. Verificar se store está sendo atualizado
# Verificar console do navegador

# 4. Reiniciar aplicação
# Parar e reiniciar frontend e backend
```

## 📱 Problemas de Interface

### **1. Layout Quebrado**

#### **Sintomas:**
- Elementos sobrepostos
- Cores incorretas
- Responsividade quebrada

#### **Soluções:**
```bash
# 1. Verificar se CSS está carregando
# F12 → Network → Ver se arquivos CSS estão carregando

# 2. Limpar cache do navegador
# Ctrl+Shift+R

# 3. Verificar se Tailwind está funcionando
# Verificar se classes estão sendo aplicadas

# 4. Reinstalar dependências
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### **2. Animações Não Funcionam**

#### **Sintomas:**
- Framer Motion não funciona
- Transições não aparecem

#### **Soluções:**
```bash
# 1. Verificar se Framer Motion está instalado
npm list framer-motion

# 2. Reinstalar Framer Motion
npm install framer-motion

# 3. Verificar se componentes estão importados
# Verificar imports nos componentes

# 4. Verificar se animações estão configuradas
# Verificar se motion.div está sendo usado
```

## 🔍 Debugging Avançado

### **1. Logs Detalhados**
```bash
# Backend com logs detalhados
DEBUG=* node src/app-working.js

# Frontend com logs detalhados
cd frontend
DEBUG=* npm run dev

# Docker com logs detalhados
sudo docker-compose up --build
```

### **2. Ferramentas de Debug**
```bash
# Instalar ferramentas
npm install -g nodemon
npm install -g pm2

# Executar com nodemon
nodemon src/app-working.js

# Executar com PM2
pm2 start src/app-working.js --name studyhub-api
pm2 logs studyhub-api
```

### **3. Monitoramento de Recursos**
```bash
# Ver uso de CPU e memória
htop

# Ver uso de rede
netstat -tulpn

# Ver processos do Node
ps aux | grep node
```

## 🆘 Recuperação de Emergência

### **Reset Completo**
```bash
# 1. Parar tudo
sudo docker-compose down
pkill -f "node src/app-working.js"
pkill -f "npm run dev"

# 2. Limpar tudo
sudo docker system prune -a
rm -rf frontend/node_modules backend/node_modules
rm -rf frontend/package-lock.json backend/package-lock.json

# 3. Reinstalar tudo
cd frontend && npm install
cd ../backend && npm install
sudo docker-compose up -d
npx prisma db push

# 4. Reiniciar
cd backend && node src/app-working.js &
cd frontend && npm run dev &
```

### **Backup e Restore**
```bash
# Backup do banco
docker exec studyhub-postgres pg_dump -U studyhub studyhub > backup.sql

# Restaurar backup
docker exec -i studyhub-postgres psql -U studyhub studyhub < backup.sql
```

## 📞 Suporte

### **Informações para Suporte**
```bash
# Versões
node --version
npm --version
docker --version

# Status dos serviços
sudo docker ps
curl http://localhost:3001/api/health
curl http://localhost:5173

# Logs
sudo docker logs studyhub-postgres
sudo docker logs studyhub-redis
```

### **Comandos de Diagnóstico**
```bash
# Verificar sistema
uname -a
cat /etc/os-release

# Verificar recursos
free -h
df -h
lscpu

# Verificar rede
ping google.com
nslookup localhost
```

---

**📚 Continue explorando: [LOGS.md](./LOGS.md) e [DEPLOY.md](./DEPLOY.md)**
