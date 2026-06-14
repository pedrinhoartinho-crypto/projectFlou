import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_xxxxx')) {
    console.log(`[EMAIL] Would send to ${to}: ${subject}`);
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'ProjectFlow <noreply@projectflow.app>',
      to,
      subject,
      html,
    });

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('[EMAIL] Failed to send:', error);
    return false;
  }
}

export function sendInviteEmail(to: string, teamName: string, inviteUrl: string) {
  return sendEmail({
    to,
    subject: `Convite para ${teamName} - ProjectFlow`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="color: #6366f1;">ProjectFlow</h1>
        <p>Você foi convidado para participar da equipe <strong>${teamName}</strong>!</p>
        <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Aceitar Convite
        </a>
        <p style="color: #666; font-size: 14px;">Se você não esperava este convite, ignore este e-mail.</p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(to: string, code: string) {
  return sendEmail({
    to,
    subject: 'Confirme seu email - ProjectFlow',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="color: #6366f1;">ProjectFlow</h1>
        <p>Seu codigo de verificacao:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #f4f4f5; border-radius: 8px; margin: 16px 0; color: #6366f1;">
          ${code}
        </div>
        <p style="color: #666; font-size: 14px;">Este codigo expira em 15 minutos.</p>
        <p style="color: #666; font-size: 14px;">Se voce nao criou uma conta, ignore este email.</p>
      </div>
    `,
  });
}

export function sendResetPasswordEmail(to: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: 'Recuperação de Senha - ProjectFlow',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="color: #6366f1;">ProjectFlow</h1>
        <p>Recebemos uma solicitação de recuperação de senha.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Redefinir Senha
        </a>
        <p style="color: #666; font-size: 14px;">Este link expira em 1 hora. Se você não solicitou, ignore este e-mail.</p>
      </div>
    `,
  });
}
