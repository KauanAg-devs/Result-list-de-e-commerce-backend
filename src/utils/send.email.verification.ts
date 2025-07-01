import { Resend } from 'resend';

const resend = new Resend(process.env.EMAIL_RESEND_API_KEY);

export async function sendEmail(email: string, verificationCode: string) {
  const { data, error } = await resend.emails.send({
    from: 'Result List <onboarding@resend.dev>',
    to: [email],
    subject: 'Verifique seu e-mail',
    html: `
      <p>Olá,</p>
      <p>Segue abaixo seu código de verificação: </p>
      <p>${verificationCode}</p>
      <p>Se você não solicitou isso, ignore este e-mail.</p>
    `,
  });

  if (error) {
    throw new Error(`Falha ao enviar e-mail: ${error.message}`);
  }

  console.log('E-mail enviado com sucesso:', data);
}
