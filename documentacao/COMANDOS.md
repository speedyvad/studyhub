# 🚀 COMANDOS ÚTEIS - STUDYHUB

## 📋 Visão Geral

Este documento contém todos os comandos úteis para desenvolvimento, manutenção e troubleshooting do StudyHub.

## 🏗️ Desenvolvimento

### **Iniciar Projeto**
```bash
# Terminal 1 - Backend
cd backend
node src/app-working.js

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Banco (se necessário)
cd backend
sudo docker-compose up -d
```

### **Verificar Status**
```bash
# Verificar se backend está rodando
curl http://localhost:3001/api/health

# Verificar se frontend está rodando
curl http://localhost:5173

# Verificar containers Docker
sudo docker ps
```

## 🗄️ Banco de Dados

### **Docker e Containers**
```bash
# Iniciar containers
sudo docker-compose up -d

# Parar containers
sudo docker-compose down

# Parar e remover volumes
sudo docker-compose down -v

# Ver logs dos containers
sudo docker logs studyhub-postgres
sudo docker logs studyhub-redis

# Acessar PostgreSQL
docker exec -it studyhub-postgres psql -U studyhub studyhub

# Acessar Redis
docker exec -it studyhub-redis redis-cli
```

### **Prisma ORM**
```bash
# Aplicar mudanças no schema
npx prisma db push

# Gerar cliente Prisma
npx prisma generate

# Abrir Prisma Studio
npx prisma studio

# Ver status do banco
npx prisma db status

# Validar schema
npx prisma validate

# Resetar banco (CUIDADO!)
npx prisma migrate reset
```

### **Backup e Restore**
```bash
# Backup do banco
docker exec studyhub-postgres pg_dump -U studyhub studyhub > backup.sql

# Restaurar backup
docker exec -i studyhub-postgres psql -U studyhub studyhub < backup.sql

# Backup com compressão
docker exec studyhub-postgres pg_dump -U studyhub -Z 9 studyhub > backup.sql.gz
```

## 🔧 Manutenção

### **Limpeza do Sistema**
```bash
# Limpar containers parados
sudo docker container prune

# Limpar imagens não utilizadas
sudo docker image prune

# Limpar volumes não utilizados
sudo docker volume prune

# Limpeza completa (CUIDADO!)
sudo docker system prune -a
```

### **Logs e Monitoramento**
```bash
# Ver logs do backend em tempo real
tail -f logs/app.log

# Ver logs do Docker
sudo docker logs -f studyhub-postgres
sudo docker logs -f studyhub-redis

# Ver uso de recursos
sudo docker stats

# Ver espaço em disco
df -h
```

## 🧪 Testes

### **Testar APIs**
```bash
# Health check
curl http://localhost:3001/api/health

# Testar login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@studyhub.com", "password": "admin123"}'

# Testar criação de tarefa
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title": "Teste", "subject": "geral", "priority": "high"}'

# Testar listagem de tarefas
curl -X GET http://localhost:3001/api/tasks \
  -H "Authorization: Bearer TOKEN"
```

### **Testar Frontend**
```bash
# Verificar se frontend carrega
curl http://localhost:5173

# Testar build
cd frontend
npm run build

# Testar preview do build
npm run preview
```

## 🐛 Troubleshooting

### **Problemas de Conexão**
```bash
# Verificar portas em uso
sudo lsof -i :3001  # Backend
sudo lsof -i :5173  # Frontend
sudo lsof -i :5432  # PostgreSQL
sudo lsof -i :6379  # Redis

# Matar processo em porta específica
sudo kill -9 $(sudo lsof -t -i:3001)

# Verificar se serviços estão rodando
sudo systemctl status docker
sudo systemctl status postgresql  # Se instalado localmente
```

### **Problemas de Dependências**
```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Verificar versões
node --version
npm --version
docker --version
```

### **Problemas de Banco**
```bash
# Verificar conexão com banco
docker exec studyhub-postgres pg_isready -U studyhub

# Verificar tabelas
docker exec studyhub-postgres psql -U studyhub studyhub -c "\dt"

# Verificar dados
docker exec studyhub-postgres psql -U studyhub studyhub -c "SELECT COUNT(*) FROM users;"
```

## 🔄 Reset e Reinstalação

### **Reset Completo**
```bash
# Parar todos os containers
sudo docker-compose down -v

# Remover volumes
sudo docker volume prune

# Limpar sistema Docker
sudo docker system prune -a

# Reinstalar dependências
cd frontend && rm -rf node_modules package-lock.json && npm install
cd ../backend && rm -rf node_modules package-lock.json && npm install

# Recriar banco
sudo docker-compose up -d
npx prisma db push
```

### **Reset Parcial**
```bash
# Apenas resetar banco
npx prisma migrate reset

# Apenas reinstalar dependências
npm install

# Apenas reiniciar containers
sudo docker-compose restart
```

## 📊 Monitoramento

### **Recursos do Sistema**
```bash
# Uso de CPU e memória
htop

# Uso de disco
df -h
du -sh *

# Uso de rede
netstat -tulpn

# Processos do Node
ps aux | grep node
```

### **Monitoramento do Banco**
```sql
-- Conectar ao banco
docker exec -it studyhub-postgres psql -U studyhub studyhub

-- Ver tamanho do banco
SELECT pg_size_pretty(pg_database_size('studyhub'));

-- Ver tabelas e tamanhos
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Ver conexões ativas
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Ver queries lentas
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## 🚀 Deploy

### **Preparação para Produção**
```bash
# Build do frontend
cd frontend
npm run build

# Verificar build
npm run preview

# Instalar dependências de produção
cd ../backend
npm install --production
```

### **Variáveis de Ambiente**
```bash
# Criar arquivo .env
cd backend
touch .env

# Conteúdo do .env
echo "DATABASE_URL=postgresql://studyhub:studyhub123@localhost:5432/studyhub" >> .env
echo "JWT_SECRET=seu-jwt-secret-super-seguro-aqui" >> .env
echo "PORT=3001" >> .env
```

## 🔍 Debugging

### **Logs Detalhados**
```bash
# Backend com logs detalhados
DEBUG=* node src/app-working.js

# Frontend com logs detalhados
cd frontend
DEBUG=* npm run dev

# Docker com logs detalhados
sudo docker-compose up --build
```

### **Ferramentas de Debug**
```bash
# Instalar ferramentas de debug
npm install -g nodemon
npm install -g pm2

# Executar com nodemon (auto-restart)
nodemon src/app-working.js

# Executar com PM2 (process manager)
pm2 start src/app-working.js --name studyhub-api
pm2 logs studyhub-api
pm2 restart studyhub-api
```

## 📱 Testes Mobile

### **Testar em Dispositivos**
```bash
# Expor frontend na rede local
cd frontend
npm run dev -- --host

# Acessar de outros dispositivos
# http://SEU_IP:5173
```

## 🔐 Segurança

### **Verificar Segurança**
```bash
# Verificar dependências vulneráveis
npm audit

# Corrigir vulnerabilidades
npm audit fix

# Verificar configurações do Docker
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image studyhub-postgres
```

## 📈 Performance

### **Otimização**
```bash
# Analisar bundle do frontend
cd frontend
npm run build
npx vite-bundle-analyzer dist

# Verificar tamanho das dependências
npm ls --depth=0

# Limpar cache
npm cache clean --force
```

## 🆘 Emergência

### **Recuperação Rápida**
```bash
# Parar tudo
sudo docker-compose down
pkill -f "node src/app-working.js"
pkill -f "npm run dev"

# Limpar tudo
sudo docker system prune -a
rm -rf frontend/node_modules backend/node_modules

# Reinstalar tudo
cd frontend && npm install
cd ../backend && npm install
sudo docker-compose up -d
npx prisma db push

# Reiniciar
cd backend && node src/app-working.js &
cd frontend && npm run dev &
```

---

**📚 Continue explorando: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) e [DEPLOY.md](./DEPLOY.md)**
