import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { sendResetPasswordEmail } from '@/lib/email';
import { generateToken } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { message: 'Se o email existir, você receberá um link de recuperação' },
        { status: 200 }
      );
    }

    const token = generateToken();
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { email, token, expires },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    await sendResetPasswordEmail(email, resetUrl);

    return NextResponse.json(
      { message: 'Se o email existir, você receberá um link de recuperação' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[FORGOT_PASSWORD_ERROR]', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
