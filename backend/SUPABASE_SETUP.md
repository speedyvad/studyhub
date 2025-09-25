# 🚀 Configuração do Supabase (GRATUITO)

## 1. Criar conta no Supabase
1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub
4. Clique em "New Project"

## 2. Configurar projeto
- **Name**: studyhub
- **Database Password**: escolha uma senha forte
- **Region**: South America (São Paulo) - mais próximo do Brasil

## 3. Obter string de conexão
Após criar o projeto:
1. Vá em "Settings" > "Database"
2. Copie a "Connection string"
3. Substitua `[YOUR-PASSWORD]` pela senha que você escolheu

## 4. Configurar .env
```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar .env com a string do Supabase
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"
```

## 5. Vantagens do Supabase
- ✅ **100% gratuito** até 500MB
- ✅ **Interface web** para gerenciar dados
- ✅ **Auth incluído** (opcional)
- ✅ **Real-time** (opcional)
- ✅ **Backup automático**
- ✅ **SSL incluído**

## 6. Executar migrações
```bash
cd backend
npm install
npx prisma db push
npm run db:seed
npm run dev
```


