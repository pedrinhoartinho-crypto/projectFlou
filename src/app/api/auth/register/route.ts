import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos os campos sao obrigatorios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter no minimo 6 caracteres' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.emailVerified) {
        return NextResponse.json(
          { error: 'Email ja cadastrado' },
          { status: 400 }
        );
      }
      // Re-enviar codigo para usuario nao verificado
      const code = generateCode();
      await prisma.emailVerificationCode.create({
        data: {
          email,
          code,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });
      const emailSent = await sendVerificationEmail(email, code);
      return NextResponse.json({
        message: emailSent ? 'Codigo reenviado para seu email' : 'Codigo reenviado',
        email,
        code: !emailSent ? code : undefined,
        requiresVerification: true,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: null,
      },
    });

    const code = generateCode();
    await prisma.emailVerificationCode.create({
      data: {
        email,
        code,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const emailSent = await sendVerificationEmail(email, code).catch(() => false);

    return NextResponse.json(
      {
        message: emailSent ? 'Codigo de verificacao enviado para seu email' : 'Conta criada. Verifique seu email.',
        email,
        code: !emailSent ? code : undefined,
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[REGISTER_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
