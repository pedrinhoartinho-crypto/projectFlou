import { PrismaClient, TaskPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const defaultColumns = [
  { name: 'A Fazer', color: '#6b7280', position: 0 },
  { name: 'Em Andamento', color: '#3b82f6', position: 1 },
  { name: 'Em Revisão', color: '#f59e0b', position: 2 },
  { name: 'Concluído', color: '#10b981', position: 3 },
];

async function main() {
  console.log('Iniciando seed...');

  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.taskAssignee.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.label.deleteMany();
  await prisma.column.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('123456', 10);

  const alice = await prisma.user.create({
    data: { name: 'Alice Silva', email: 'alice@email.com', password, role: 'ADMIN', emailVerified: new Date() },
  });
  const bob = await prisma.user.create({
    data: { name: 'Bob Santos', email: 'bob@email.com', password, role: 'MEMBER', emailVerified: new Date() },
  });
  const carol = await prisma.user.create({
    data: { name: 'Carol Lima', email: 'carol@email.com', password, role: 'MEMBER', emailVerified: new Date() },
  });
  const david = await prisma.user.create({
    data: { name: 'David Oliveira', email: 'david@email.com', password, role: 'VIEWER', emailVerified: new Date() },
  });

  console.log('Usuarios criados');

  const devTeam = await prisma.team.create({
    data: {
      name: 'Time de Desenvolvimento',
      description: 'Equipe responsavel pelo desenvolvimento dos produtos',
      ownerId: alice.id,
      members: {
        create: [
          { userId: alice.id, role: 'ADMIN' },
          { userId: bob.id, role: 'MEMBER' },
          { userId: carol.id, role: 'MEMBER' },
          { userId: david.id, role: 'VIEWER' },
        ],
      },
    },
  });

  const designTeam = await prisma.team.create({
    data: {
      name: 'Time de Design',
      description: 'Equipe de design e experiencia do usuario',
      ownerId: bob.id,
      members: {
        create: [
          { userId: bob.id, role: 'ADMIN' },
          { userId: carol.id, role: 'MEMBER' },
        ],
      },
    },
  });

  console.log('Equipes criadas');

  const project1 = await prisma.project.create({
    data: {
      name: 'ProjectFlow SaaS',
      description: 'Plataforma de gerenciamento de projetos',
      teamId: devTeam.id,
      ownerId: alice.id,
      status: 'ACTIVE',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-06-30'),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'App Mobile',
      description: 'Aplicativo mobile para acompanhamento de tarefas',
      teamId: devTeam.id,
      ownerId: alice.id,
      status: 'PLANNING',
      startDate: new Date('2026-03-01'),
    },
  });

  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: alice.id, role: 'ADMIN' },
      { projectId: project1.id, userId: bob.id, role: 'MEMBER' },
      { projectId: project1.id, userId: carol.id, role: 'MEMBER' },
      { projectId: project2.id, userId: alice.id, role: 'ADMIN' },
      { projectId: project2.id, userId: bob.id, role: 'MEMBER' },
    ],
  });

  console.log('Projetos criados');

  const cols1 = await Promise.all(
    defaultColumns.map((col) =>
      prisma.column.create({ data: { ...col, projectId: project1.id } })
    )
  );
  await Promise.all(
    defaultColumns.map((col) =>
      prisma.column.create({ data: { ...col, projectId: project2.id } })
    )
  );

  console.log('Colunas criadas');

  const labelBug = await prisma.label.create({ data: { name: 'Bug', color: '#ef4444', projectId: project1.id } });
  const labelFeature = await prisma.label.create({ data: { name: 'Feature', color: '#3b82f6', projectId: project1.id } });
  const labelImprovement = await prisma.label.create({ data: { name: 'Melhoria', color: '#10b981', projectId: project1.id } });
  const labelUrgent = await prisma.label.create({ data: { name: 'Urgente', color: '#f59e0b', projectId: project1.id } });
  const labelDoc = await prisma.label.create({ data: { name: 'Documentacao', color: '#8b5cf6', projectId: project1.id } });

  console.log('Etiquetas criadas');

  const tasksData = [
    { title: 'Configurar autenticacao JWT', description: 'Implementar NextAuth com JWT e credenciais', columnIdx: 2, pos: 0, priority: 'HIGH' as TaskPriority, creatorId: alice.id, due: new Date('2026-02-15') },
    { title: 'Criar schema Prisma', description: 'Modelar banco de dados completo', columnIdx: 2, pos: 1, priority: 'HIGH' as TaskPriority, creatorId: alice.id, due: new Date('2026-02-10') },
    { title: 'Implementar Kanban Drag & Drop', description: 'Usar @hello-pangea/dnd para o quadro kanban', columnIdx: 1, pos: 0, priority: 'HIGH' as TaskPriority, creatorId: bob.id, due: new Date('2026-03-01') },
    { title: 'Criar pagina de login responsiva', description: 'Pagina de login com tema claro/escuro', columnIdx: 3, pos: 0, priority: 'MEDIUM' as TaskPriority, creatorId: carol.id },
    { title: 'Implementar notificacoes', description: 'Sistema de notificacoes para eventos', columnIdx: 0, pos: 0, priority: 'MEDIUM' as TaskPriority, creatorId: alice.id, due: new Date('2026-03-15') },
    { title: 'Dashboard analitico', description: 'Graficos e metricas de produtividade', columnIdx: 0, pos: 1, priority: 'HIGH' as TaskPriority, creatorId: alice.id, due: new Date('2026-04-01') },
    { title: 'Sistema de comentarios', description: 'Comentarios em tarefas', columnIdx: 1, pos: 1, priority: 'MEDIUM' as TaskPriority, creatorId: bob.id },
    { title: 'Upload de anexos', description: 'Upload de arquivos com UploadThing', columnIdx: 1, pos: 2, priority: 'LOW' as TaskPriority, creatorId: carol.id },
    { title: 'Calendario de tarefas', description: 'Visualizacao de tarefas em calendario', columnIdx: 0, pos: 2, priority: 'MEDIUM' as TaskPriority, creatorId: alice.id, due: new Date('2026-04-15') },
    { title: 'Recuperacao de senha', description: 'Fluxo completo de reset de senha', columnIdx: 3, pos: 1, priority: 'MEDIUM' as TaskPriority, creatorId: carol.id },
    { title: 'Corrigir bug no drag and drop', description: 'Ao arrastar entre colunas, a posicao nao e atualizada', columnIdx: 1, pos: 3, priority: 'URGENT' as TaskPriority, creatorId: bob.id },
    { title: 'Testes de integracao', description: 'Cobrir fluxos principais com testes', columnIdx: 0, pos: 3, priority: 'LOW' as TaskPriority, creatorId: alice.id, due: new Date('2026-05-01') },
  ];

  const createdTasks = await Promise.all(
    tasksData.map((t) =>
      prisma.task.create({
        data: {
          title: t.title, description: t.description,
          columnId: cols1[t.columnIdx].id, projectId: project1.id,
          creatorId: t.creatorId, position: t.pos, priority: t.priority,
          dueDate: t.due || undefined,
        },
      })
    )
  );

  await prisma.taskAssignee.createMany({
    data: [
      { taskId: createdTasks[0].id, userId: alice.id },
      { taskId: createdTasks[1].id, userId: alice.id },
      { taskId: createdTasks[2].id, userId: bob.id },
      { taskId: createdTasks[3].id, userId: carol.id },
      { taskId: createdTasks[4].id, userId: alice.id },
      { taskId: createdTasks[5].id, userId: alice.id },
      { taskId: createdTasks[5].id, userId: bob.id },
      { taskId: createdTasks[6].id, userId: bob.id },
      { taskId: createdTasks[7].id, userId: carol.id },
      { taskId: createdTasks[8].id, userId: alice.id },
      { taskId: createdTasks[9].id, userId: carol.id },
      { taskId: createdTasks[10].id, userId: bob.id },
      { taskId: createdTasks[11].id, userId: alice.id },
    ],
  });

  await prisma.taskLabel.createMany({
    data: [
      { taskId: createdTasks[0].id, labelId: labelFeature.id },
      { taskId: createdTasks[1].id, labelId: labelDoc.id },
      { taskId: createdTasks[2].id, labelId: labelFeature.id },
      { taskId: createdTasks[4].id, labelId: labelFeature.id },
      { taskId: createdTasks[5].id, labelId: labelFeature.id },
      { taskId: createdTasks[6].id, labelId: labelImprovement.id },
      { taskId: createdTasks[7].id, labelId: labelImprovement.id },
      { taskId: createdTasks[8].id, labelId: labelFeature.id },
      { taskId: createdTasks[10].id, labelId: labelBug.id },
      { taskId: createdTasks[10].id, labelId: labelUrgent.id },
    ],
  });

  await prisma.comment.createMany({
    data: [
      { content: 'Ja configurei o NextAuth, falta integrar com o Prisma.', taskId: createdTasks[0].id, userId: alice.id },
      { content: 'Otimo! Vou revisar o schema hoje.', taskId: createdTasks[0].id, userId: bob.id },
      { content: 'Schema finalizado, revisem por favor.', taskId: createdTasks[1].id, userId: alice.id },
      { content: 'Estou trabalhando na integracao do drag and drop.', taskId: createdTasks[2].id, userId: bob.id },
      { content: 'Precisamos definir as cores do dashboard.', taskId: createdTasks[5].id, userId: carol.id },
    ],
  });

  const checklist1 = await prisma.checklist.create({
    data: { title: 'Requisitos do Kanban', taskId: createdTasks[2].id },
  });

  await prisma.checklistItem.createMany({
    data: [
      { text: 'Implementar DragDropContext', checklistId: checklist1.id, position: 0 },
      { text: 'Criar colunas Droppable', checklistId: checklist1.id, position: 1 },
      { text: 'Criar cartoes Draggable', checklistId: checklist1.id, position: 2 },
      { text: 'Atualizar posicao no banco', checklistId: checklist1.id, position: 3 },
      { text: 'Testar entre colunas', checklistId: checklist1.id, position: 4 },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { type: 'TASK_ASSIGNED', title: 'Nova tarefa atribuida', message: 'Voce foi designado para "Configurar autenticacao JWT"', userId: alice.id, link: `/tasks/${createdTasks[0].id}` },
      { type: 'TASK_ASSIGNED', title: 'Nova tarefa atribuida', message: 'Voce foi designado para "Implementar Kanban"', userId: bob.id, link: `/tasks/${createdTasks[2].id}` },
      { type: 'COMMENT_ADDED', title: 'Novo comentario', message: 'Bob comentou em "Configurar autenticacao JWT"', userId: alice.id, link: `/tasks/${createdTasks[0].id}` },
      { type: 'TEAM_INVITE', title: 'Bem-vindo ao time!', message: 'Voce foi adicionado ao Time de Desenvolvimento', userId: bob.id },
      { type: 'DUE_DATE_REMINDER', title: 'Prazo proximo', message: 'Tarefa "Schema Prisma" vence em 3 dias', userId: alice.id, link: `/tasks/${createdTasks[1].id}` },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      { action: 'TASK_CREATED', entityType: 'TASK', entityId: createdTasks[0].id, userId: alice.id, projectId: project1.id, metadata: { title: 'Configurar autenticacao JWT' } },
      { action: 'TASK_MOVED', entityType: 'TASK', entityId: createdTasks[0].id, userId: bob.id, projectId: project1.id, metadata: { fromColumn: cols1[0].name, toColumn: cols1[2].name } },
    ],
  });

  console.log('Seed concluido com sucesso!');
  console.log('');
  console.log('Contas de teste:');
  console.log('   alice@email.com / 123456 (Admin)');
  console.log('   bob@email.com / 123456 (Membro)');
  console.log('   carol@email.com / 123456 (Membro)');
  console.log('   david@email.com / 123456 (Visualizador)');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
