import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    const teams = await prisma.team.findMany({
      where: { members: { some: { userId } } },
      select: { id: true },
    });
    const teamIds = teams.map((t) => t.id);

    const projects = await prisma.project.findMany({
      where: { teamId: { in: teamIds } },
      select: { id: true },
    });
    const projectIds = projects.map((p) => p.id);

    const totalProjects = projectIds.length;

    const tasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds }, isArchived: false },
      select: { id: true, priority: true, columnId: true },
    });

    const totalTasks = tasks.length;

    const totalMembers = await prisma.teamMember.count({
      where: { teamId: { in: teamIds } },
    });

    const columns = await prisma.column.findMany({
      where: { projectId: { in: projectIds } },
      select: { id: true, name: true },
    });
    const completedColumnIds = columns.filter((c) => c.name === 'Concluído').map((c) => c.id);
    const completedTasks = tasks.filter((t) => completedColumnIds.includes(t.columnId)).length;

    const priorityCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 };
    tasks.forEach((t) => { priorityCounts[t.priority]++; });

    const tasksByPriority = Object.entries(priorityCounts).map(([name, value]) => ({ name, value }));

    const statusCounts: Record<string, number> = {};
    columns.forEach((c) => { statusCounts[c.name] = 0; });
    tasks.forEach((t) => {
      const col = columns.find((c) => c.id === t.columnId);
      if (col) statusCounts[col.name] = (statusCounts[col.name] || 0) + 1;
    });
    const tasksByStatus = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    return NextResponse.json({
      totalProjects,
      totalTasks,
      completedTasks,
      totalMembers,
      tasksByPriority,
      tasksByStatus,
    });
  } catch (error) {
    console.error('[DASHBOARD_ERROR]', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
