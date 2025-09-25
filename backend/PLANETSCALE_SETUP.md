# 🪐 Configuração do PlanetScale (GRATUITO até 1GB)

## 1. Criar conta no PlanetScale
1. Acesse: https://planetscale.com
2. Clique em "Sign up" e faça login com GitHub
3. Clique em "Create database"

## 2. Configurar banco
- **Database name**: studyhub
- **Region**: São Paulo (mais próximo)
- **Plan**: Hobby (gratuito)

## 3. Obter string de conexão
1. Clique no banco criado
2. Vá em "Connect"
3. Selecione "Prisma"
4. Copie a string de conexão

## 4. Configurar .env
```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar .env com a string do PlanetScale
DATABASE_URL="mysql://xxxxxxxx:xxxxxxxx@xxxxxxxx.us-east-2.psdb.cloud/studyhub?sslaccept=strict"
```

## 5. Vantagens do PlanetScale
- ✅ **100% gratuito** até 1GB
- ✅ **MySQL compatível** com Prisma
- ✅ **Branching** (como Git para banco)
- ✅ **Backup automático**
- ✅ **Escalável**

## 6. Executar migrações
```bash
cd backend
npm install
npx prisma db push
npm run db:seed
npm run dev
```


