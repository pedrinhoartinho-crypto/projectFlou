import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email e codigo sao obrigatorios' },
        { status: 400 }
      );
    }

    const verification = await prisma.emailVerificationCode.findFirst({
      where: {
        email,
        code,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Codigo invalido ou expirado' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    await prisma.emailVerificationCode.deleteMany({
      where: { email },
    });

    return NextResponse.json({
      message: 'Email verificado com sucesso!',
    });
  } catch (error) {
    console.error('[VERIFY_EMAIL_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
