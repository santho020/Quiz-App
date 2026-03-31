import nodemailer from 'nodemailer';

export function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!isMailConfigured()) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

export async function sendPasswordResetEmail(email, username, resetUrl) {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(`SMTP is not configured. Password reset link for ${email}: ${resetUrl}`);
    return;
  }

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Reset your BrainBuzz Quiz Arena password',
    text: `Hi ${username},\n\nUse this link to reset your password:\n${resetUrl}\n\nThis link expires in 30 minutes.`,
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;background:#0b1020;color:#e8f2ff;padding:24px">
        <h2 style="margin:0 0 16px;color:#67e8f9">BrainBuzz Quiz Arena</h2>
        <p style="margin:0 0 12px">Hi ${username},</p>
        <p style="margin:0 0 16px">Click the button below to reset your password. The link expires in 30 minutes.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#22d3ee;color:#04111c;text-decoration:none;font-weight:700">Reset Password</a>
        <p style="margin:16px 0 0">If you did not request this, you can ignore this email.</p>
      </div>
    `
  });

  console.log('Password reset mail result:', {
    to: email,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
    messageId: info.messageId
  });
}
