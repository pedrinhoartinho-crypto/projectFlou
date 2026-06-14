# Documentacao da API

## Autenticacao

### POST /api/auth/register
Body: `{ name, email, password }`
Response: `{ message, user }`

### POST /api/auth/forgot-password
Body: `{ email }`
Response: `{ message }`

### POST /api/auth/reset-password
Body: `{ token, password }`
Response: `{ message }`

### GET/PUT /api/user/profile
GET: Retorna dados do perfil
PUT: Atualiza nome e/ou senha
Body: `{ name, currentPassword?, newPassword? }`

## Server Actions (use server)

### Team
- `getTeams()` - Lista equipes
- `getTeam(teamId)` - Detalhes da equipe
- `createTeam(data)` - Cria equipe
- `updateTeam(teamId, data)` - Atualiza equipe
- `deleteTeam(teamId)` - Exclui equipe
- `inviteMember(teamId, email, role)` - Convida membro
- `removeMember(teamId, userId)` - Remove membro
- `updateMemberRole(teamId, userId, role)` - Altera permissao
- `acceptInvite(token)` - Aceita convite

### Project
- `getProjects()` - Lista projetos
- `getProject(projectId)` - Projeto com colunas e tarefas
- `createProject(data)` - Cria projeto com colunas padrao
- `updateProject(projectId, data)` - Atualiza projeto
- `deleteProject(projectId)` - Exclui projeto
- `addProjectMember(projectId, userId, role)` - Adiciona membro
- `removeProjectMember(projectId, userId)` - Remove membro
- `createLabel(projectId, name, color)` - Cria etiqueta
- `deleteLabel(labelId)` - Exclui etiqueta

### Task
- `getTask(taskId)` - Detalhes da tarefa
- `createTask(data)` - Cria tarefa
- `updateTask(taskId, data)` - Atualiza tarefa
- `deleteTask(taskId)` - Exclui tarefa
- `reorderTasks(updates[])` - Reordena (drag & drop)
- `addAssignee(taskId, userId)` - Adiciona responsavel
- `removeAssignee(taskId, userId)` - Remove responsavel
- `addLabel(taskId, labelId)` - Adiciona etiqueta
- `removeLabel(taskId, labelId)` - Remove etiqueta

### Comment
- `createComment(taskId, content)` - Cria comentario
- `updateComment(commentId, content)` - Edita comentario
- `deleteComment(commentId)` - Exclui comentario

### Checklist
- `createChecklist(taskId, title)` - Cria checklist
- `deleteChecklist(checklistId)` - Exclui checklist
- `addChecklistItem(checklistId, text)` - Adiciona item
- `toggleChecklistItem(itemId)` - Alterna item
- `deleteChecklistItem(itemId)` - Remove item

### Notification
- `getNotifications()` - Lista notificacoes
- `markAsRead(notificationId)` - Marca como lida
- `markAllAsRead()` - Marca todas como lidas
- `getUnreadCount()` - Contagem de nao lidas

## Dashboard API

### GET /api/dashboard
Response: `{ totalProjects, totalTasks, completedTasks, totalMembers, tasksByPriority[], tasksByStatus[] }`
