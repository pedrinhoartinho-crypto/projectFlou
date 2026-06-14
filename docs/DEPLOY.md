# Guia de Deploy

## Pre-requisitos

- Node.js 18+
- PostgreSQL (Supabase ou Neon recomendado)
- Conta na Vercel
- Conta no Resend (emails)
- Conta no UploadThing (arquivos)

## Variaveis de Ambiente

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/projectflow"

# NextAuth
AUTH_SECRET="openssl rand -base64 32"
AUTH_URL="https://seu-dominio.vercel.app"

# Resend
RESEND_API_KEY="re_xxxxx"

# UploadThing
UPLOADTHING_SECRET="sk_xxxxx"
UPLOADTHING_APP_ID="xxxxx"

# App
NEXT_PUBLIC_APP_URL="https://seu-dominio.vercel.app"
```

## Deploy na Vercel

1. Crie uma conta em https://vercel.com
2. Conecte seu repositorio do GitHub
3. Configure as variaveis de ambiente no dashboard da Vercel
4. O `vercel.json` ja esta configurado
5. O banco PostgreSQL pode ser criado no Supabase ou Neon
6. Execute `npx prisma db push` apos o deploy inicial
7. Execute `npx prisma db seed` para popular dados de exemplo

## Comandos uteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Prisma
npm run db:generate   # Gera client
npm run db:push       # Sincroniza schema
npm run db:migrate    # Cria migracao
npm run db:seed       # Popula dados
npm run db:studio     # Abre studio
```
