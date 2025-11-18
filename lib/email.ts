import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY nu este configurat. Email-ul nu va fi trimis.');
    console.log('Email ar fi fost trimis către:', to);
    console.log('Subiect:', subject);
    return { success: false, error: 'RESEND_API_KEY nu este configurat' };
  }

  try {
    const result = await resend.emails.send({
      from: from || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to,
      subject,
      html,
    });

    if (result.error) {
      console.error('Eroare Resend:', result.error);
      return { success: false, error: result.error.message || 'Eroare la trimiterea email-ului' };
    }

    return { success: true, id: result.data?.id || 'unknown' };
  } catch (error: any) {
    console.error('Eroare la trimiterea email-ului:', error);
    return { success: false, error: error.message };
  }
}

export function generateTestCompletedEmail(
  patientName: string,
  testTitle: string,
  responseId: string,
  appUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1890ff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background-color: #1890ff; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Notificare Test Completat</h1>
        </div>
        <div class="content">
          <p>Bună ziua,</p>
          <p>Pacientul <strong>${patientName}</strong> a finalizat testul <strong>${testTitle}</strong>.</p>
          <p>Puteți accesa rezultatele testului pentru a le analiza și adăuga comentarii.</p>
          <div style="text-align: center;">
            <a href="${appUrl}/responses/${responseId}" class="button">Vezi Rezultatele</a>
          </div>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Acest email a fost trimis automat de către platforma de sănătate mentală.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Platformă Sănătate Mentală. Toate drepturile rezervate.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateInvitationEmail(
  patientName: string,
  inviteLink: string,
  appUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1890ff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background-color: #1890ff; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Invitație Psiholog</h1>
        </div>
        <div class="content">
          <p>Bună ziua,</p>
          <p>Pacientul <strong>${patientName}</strong> vă invită să deveniți psihologul său pe platforma de sănătate mentală.</p>
          <p>Prin acceptarea acestei invitații, veți putea accesa și analiza rezultatele testelor pacientului.</p>
          <div style="text-align: center;">
            <a href="${inviteLink}" class="button">Acceptă Invitația</a>
          </div>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Sau copiază acest link în browser: <br>
            <a href="${inviteLink}" style="color: #1890ff; word-break: break-all;">${inviteLink}</a>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Platformă Sănătate Mentală. Toate drepturile rezervate.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

