import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { ENV } from '../../config/env.js';

let resendClient = null;
if (ENV.RESEND_API_KEY && ENV.RESEND_API_KEY.trim() !== '') {
  try {
    resendClient = new Resend(ENV.RESEND_API_KEY.trim());
  } catch (err) {
    console.warn('[EmailService] Falha ao instanciar cliente Resend:', err.message);
  }
}

let smtpTransporter = null;
if (ENV.SMTP_HOST && ENV.SMTP_HOST.trim() !== '') {
  try {
    smtpTransporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: ENV.SMTP_PORT,
      secure: ENV.SMTP_SECURE,
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
      },
    });
  } catch (err) {
    console.warn('[EmailService] Falha ao configurar transportador SMTP:', err.message);
  }
}

/**
 * Envia e-mail utilizando Resend, Nodemailer ou fallback em console no ambiente de desenvolvimento
 */
export async function enviarEmail({ to, subject, html, text }) {
  const from = ENV.EMAIL_FROM;

  // 1. Prioridade: Resend API
  if (resendClient) {
    try {
      const response = await resendClient.emails.send({
        from,
        to,
        subject,
        html,
        text,
      });
      console.log(`[EmailService] E-mail enviado com sucesso via Resend para ${to} (ID: ${response.data?.id || 'ok'})`);
      return { success: true, provider: 'resend', id: response.data?.id };
    } catch (err) {
      console.error('[EmailService] Erro ao enviar e-mail via Resend:', err.message);
      // Prossegue para tentar SMTP ou simulação
    }
  }

  // 2. Segunda opção: Servidor SMTP via Nodemailer
  if (smtpTransporter) {
    try {
      const info = await smtpTransporter.sendMail({
        from,
        to,
        subject,
        html,
        text,
      });
      console.log(`[EmailService] E-mail enviado com sucesso via SMTP para ${to} (ID: ${info.messageId})`);
      return { success: true, provider: 'smtp', id: info.messageId };
    } catch (err) {
      console.error('[EmailService] Erro ao enviar e-mail via SMTP:', err.message);
    }
  }

  // 3. Fallback Gracioso de Desenvolvimento: Log formatado no terminal
  console.log('\n' + '='.repeat(70));
  console.log('📧 [EMAIL SIMULADO - AMBIENTE LOCAL / DEV]');
  console.log(`Para: ${to}`);
  console.log(`Assunto: ${subject}`);
  console.log('-'.repeat(70));
  if (text) {
    console.log(text.trim());
  } else {
    console.log(html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim());
  }
  console.log('='.repeat(70) + '\n');

  return { success: true, provider: 'simulated', message: 'E-mail simulado com sucesso no terminal.' };
}

/**
 * Envia e-mail formatado para recuperação de senha com código OTP e link direto
 */
export async function enviarEmailRecuperacaoSenha({ to, name, code, resetUrl }) {
  const primeiroNome = (name || 'Usuário').split(' ')[0];
  const subject = `Código de recuperação de senha: ${code} - Itaim Vende`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Senha - Itaim Vende</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #334155;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f1f5f9;
      padding: 40px 16px;
    }
    .main {
      background-color: #ffffff;
      margin: 0 auto;
      max-width: 560px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    }
    .header {
      background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 6px 0 0;
      color: #e8f5e9;
      font-size: 13px;
      font-weight: 500;
    }
    .content {
      padding: 36px 32px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 14px;
    }
    .text {
      font-size: 14px;
      color: #475569;
      margin-bottom: 24px;
    }
    .code-box {
      background: #f8fafc;
      border: 2px dashed #2e7d32;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
      margin: 28px 0;
    }
    .code-box-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #166534;
      margin-bottom: 8px;
    }
    .code-number {
      font-size: 34px;
      font-weight: 900;
      letter-spacing: 8px;
      color: #2e7d32;
      font-family: monospace, Consolas, sans-serif;
    }
    .btn-container {
      text-align: center;
      margin: 30px 0 24px;
    }
    .btn {
      display: inline-block;
      background-color: #2e7d32;
      color: #ffffff !important;
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(46, 125, 50, 0.28);
    }
    .timer-note {
      background-color: #fefce8;
      border-left: 4px solid #ca8a04;
      padding: 12px 16px;
      border-radius: 0 6px 6px 0;
      font-size: 13px;
      color: #854d0e;
      margin: 24px 0 16px;
    }
    .security-note {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
      margin-top: 24px;
      border-top: 1px solid #e2e8f0;
      padding-top: 18px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px 32px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main">
      <div class="header">
        <h1>Itaim Vende</h1>
        <p>Marketplace de Paulistana e Região</p>
      </div>
      <div class="content">
        <h2 class="greeting">Olá, ${primeiroNome}!</h2>
        <p class="text">
          Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Itaim Vende</strong>.
        </p>

        <div class="code-box">
          <div class="code-box-label">Seu código de verificação é:</div>
          <div class="code-number">${code}</div>
        </div>

        <p class="text" style="text-align: center; margin-bottom: 8px;">
          Você também pode redefinir sua senha diretamente clicando no botão abaixo:
        </p>

        <div class="btn-container">
          <a href="${resetUrl}" class="btn" target="_blank" rel="noopener noreferrer">
            Redefinir Minha Senha
          </a>
        </div>

        <div class="timer-note">
          ⏱️ <strong>Atenção:</strong> Por motivos de segurança, este código e o link expiram em <strong>1 hora</strong>.
        </div>

        <div class="security-note">
          Se você não solicitou a recuperação de senha, nenhuma ação é necessária. Sua senha continuará segura e inalterada.
        </div>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Itaim Vende - Paulistana, PI. Todos os direitos reservados.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Itaim Vende - Recuperação de Senha

Olá, ${primeiroNome}!

Recebemos uma solicitação para redefinir a senha da sua conta no Itaim Vende.

SEU CÓDIGO DE VERIFICAÇÃO: ${code}

Ou acesse o link direto para redefinir:
${resetUrl}

⏱️ Este código e o link são válidos por 1 hora.

Se você não solicitou a redefinição de senha, desconsidere este e-mail.
  `.trim();

  return enviarEmail({ to, subject, html, text });
}
