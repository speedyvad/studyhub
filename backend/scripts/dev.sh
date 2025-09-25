#!/bin/bash

echo "🚀 Iniciando desenvolvimento do StudyHub Backend..."

# Verificar se o .env existe
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp env.example .env
    echo "⚠️  Configure as variáveis no arquivo .env antes de continuar!"
    exit 1
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# Executar migrações
echo "🗄️  Executando migrações..."
npx prisma db push

# Executar seed
echo "🌱 Executando seed..."
npm run db:seed

# Iniciar servidor de desenvolvimento
echo "🎯 Iniciando servidor de desenvolvimento..."
npm run dev


