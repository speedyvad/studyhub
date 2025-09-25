# 🐳 Configuração com Docker (Mais Fácil)

## 1. Instalar Docker
```bash
# Ubuntu/WSL
sudo apt update
sudo apt install docker.io docker-compose

# Iniciar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Adicionar usuário ao grupo docker (opcional)
sudo usermod -aG docker $USER
```

## 2. Iniciar PostgreSQL
```bash
cd backend
docker-compose up -d
```

## 3. Verificar se está funcionando
```bash
# Ver containers rodando
docker ps

# Testar conexão
docker exec -it studyhub-postgres psql -U studyhub_user -d studyhub
```

## 4. Configurar .env
```bash
# Copiar arquivo de exemplo
cp env.example .env

# A string já está configurada para Docker
DATABASE_URL="postgresql://studyhub_user:studyhub123@localhost:5432/studyhub"
```

## 5. Executar migrações
```bash
cd backend
npm install
npx prisma db push
npm run db:seed
npm run dev
```

## 6. Comandos úteis
```bash
# Parar containers
docker-compose down

# Ver logs
docker-compose logs postgres

# Acessar banco
docker exec -it studyhub-postgres psql -U studyhub_user -d studyhub

# Resetar banco
docker-compose down -v
docker-compose up -d
```

## 7. Vantagens do Docker
- ✅ **Isolado** do sistema
- ✅ **Fácil de configurar**
- ✅ **Portável**
- ✅ **Inclui Redis** para cache
- ✅ **Não polui** o sistema


