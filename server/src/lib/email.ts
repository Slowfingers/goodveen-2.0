import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `"Goodveen" <${process.env.SMTP_USER || 'noreply@goodveen.uz'}>`,
    to: email,
    subject: 'Восстановление пароля - Goodveen',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #303030; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { font-size: 32px; font-weight: 300; letter-spacing: 0.02em; color: #303030; }
            .content { background: #F6F6F6; padding: 40px; margin-bottom: 30px; }
            .button { display: inline-block; background: #303030; color: white; padding: 16px 40px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.2em; font-size: 12px; margin: 20px 0; }
            .footer { text-align: center; font-size: 12px; color: #808080; }
            .link { color: #303030; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">GOODVEEN</div>
            </div>
            
            <div class="content">
              <h2 style="font-weight: 300; font-size: 24px; margin-top: 0;">Восстановление пароля</h2>
              <p>Вы запросили восстановление пароля для вашего аккаунта Goodveen.</p>
              <p>Нажмите на кнопку ниже, чтобы создать новый пароль:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Восстановить пароль</a>
              </div>
              
              <p style="font-size: 14px; color: #808080; margin-top: 30px;">
                Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:<br>
                <a href="${resetUrl}" class="link">${resetUrl}</a>
              </p>
              
              <p style="font-size: 14px; color: #808080; margin-top: 30px;">
                Ссылка действительна в течение 30 минут.
              </p>
              
              <p style="font-size: 14px; color: #808080; margin-top: 30px;">
                Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.
              </p>
            </div>
            
            <div class="footer">
              <p>© Goodveen ${new Date().getFullYear()}</p>
              <p>Креативная цветочная студия</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Восстановление пароля - Goodveen

Вы запросили восстановление пароля для вашего аккаунта Goodveen.

Перейдите по ссылке ниже, чтобы создать новый пароль:
${resetUrl}

Ссылка действительна в течение 30 минут.

Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.

© Goodveen ${new Date().getFullYear()}
Креативная цветочная студия
    `,
  };

  try {
    // If SMTP is not configured, log to console instead
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('\n=== EMAIL NOT SENT (SMTP not configured) ===');
      console.log(`To: ${email}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Reset link: ${resetUrl}`);
      console.log('===========================================\n');
      return { success: true, message: 'Email logged to console (SMTP not configured)' };
    }

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    // Log to console as fallback
    console.log('\n=== EMAIL SEND FAILED - Logging to console ===');
    console.log(`To: ${email}`);
    console.log(`Reset link: ${resetUrl}`);
    console.log('===========================================\n');
    return { success: false, error };
  }
}
