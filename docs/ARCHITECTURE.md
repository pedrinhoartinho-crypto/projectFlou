# ProjectFlow - Arquitetura

## Stack Tecnologica

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Estilizacao:** Tailwind CSS, Shadcn/ui
- **ORM:** Prisma
- **Banco de Dados:** PostgreSQL
- **Autenticacao:** NextAuth.js v5 (JWT credentials)
- **Upload:** UploadThing
- **Email:** Resend
- **Drag & Drop:** @hello-pangea/dnd
- **Graficos:** Recharts
- **Estado Servidor:** TanStack React Query
- **Estado Cliente:** Zustand
- **Validacao:** Zod

## Estrutura de Diretorios

```
projectflow/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── api/
│   │   ├── dashboard/
│   │   ├── teams/
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── notifications/
│   │   ├── reports/
│   │   └── profile/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── kanban/
│   │   ├── tasks/
│   │   ├── teams/
│   │   ├── projects/
│   │   ├── calendar/
│   │   └── dashboard/
│   ├── actions/
│   ├── lib/
│   ├── hooks/
│   ├── providers/
│   └── types/
├── docs/
└── public/
```

## Modelo de Dados

18 tabelas principais:
- **User** - Usuarios
- **Account, Session, VerificationToken** - NextAuth
- **PasswordResetToken** - Recuperacao de senha
- **Team** - Equipes
- **TeamMember** - Membros da equipe (N:N com roles)
- **Invitation** - Convites pendentes
- **Project** - Projetos
- **ProjectMember** - Membros do projeto (N:N)
- **Column** - Colunas do Kanban
- **Task** - Tarefas
- **TaskAssignee** - Responsaveis
- **Comment** - Comentarios
- **Checklist** - Checklists (1:N items)
- **ChecklistItem** - Itens do checklist
- **Attachment** - Anexos
- **Label** - Etiquetas
- **TaskLabel** - Etiquetas da tarefa
- **Notification** - Notificacoes
- **ActivityLog** - Log de atividades

## Fluxo de Autenticacao

1. Login via /login (credentials)
2. NextAuth valida email + bcrypt password
3. JWT token com id, role
4. SessionProvider disponibiliza sessao
5. Server Actions protegem rotas

## Permissoes

- **ADMIN:** Criar/editar/excluir, convidar, gerenciar membros
- **MEMBER:** Criar/editar tarefas, comentar
- **VIEWER:** Visualizar apenas
