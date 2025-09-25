# 🚂 Configuração do Railway (R$ 5/mês)

## 1. Criar conta no Railway
1. Acesse: https://railway.app
2. Clique em "Login" e faça login com GitHub
3. Clique em "New Project"

## 2. Adicionar PostgreSQL
1. Clique em "Add Service"
2. Selecione "Database" > "PostgreSQL"
3. Aguarde a criação (2-3 minutos)

## 3. Obter string de conexão
1. Clique no serviço PostgreSQL
2. Vá na aba "Variables"
3. Copie a variável `DATABASE_URL`

## 4. Configurar .env
```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar .env com a string do Railway
DATABASE_URL="postgresql://postgres:xxxxx@containers-us-west-xxx.railway.app:xxxx/railway"
```

## 5. Vantagens do Railway
- ✅ **R$ 5/mês** fixo
- ✅ **Backup automático**
- ✅ **Escalável**
- ✅ **Monitoramento incluído**
- ✅ **Deploy automático**

## 6. Executar migrações
```bash
cd backend
npm install
npx prisma db push
npm run db:seed
npm run dev
```


