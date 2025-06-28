import { Resend } from 'resend';

const resend = new Resend(process.env.EMAIL_RESEND_API_KEY);

export async function sendEmail(email: string, token: string) {
  const backendUri = process.env.BACKEND_URI?.replace(/\/$/, '');

  if (!backendUri) {
    throw new Error('BACKEND_URI não está definido');
  }

  const verificationLink = `${backendUri}/auth/verify-email?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: 'Result List <onboarding@resend.dev>',
    to: [email],
    subject: 'Verifique seu e-mail',
    html: `
      <p>Olá,</p>
      <p>Clique no link abaixo para verificar seu e-mail:</p>
      <a href="${verificationLink}" target="_blank">${verificationLink}</a>
      <p>Se você não solicitou isso, ignore este e-mail.</p>
    `,
  });

  if (error) {
    throw new Error(`Falha ao enviar e-mail: ${error.message}`);
  }

  console.log('E-mail enviado com sucesso:', data);
}
