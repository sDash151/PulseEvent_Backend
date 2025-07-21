// backend/src/utils/email.js
const nodemailer = require('nodemailer')

// Configure your SMTP transport here (use environment variables for real deployment)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'password',
  },
})

async function sendInvitationEmail({ to, eventTitle, eventId, hostName, invitationToken }) {
  const siteUrl = process.env.CLIENT_URL || 'https://eventpulse1.netlify.app'
  // Always direct to login with redirect to invitation page
  const loginLink = invitationToken
    ? `${siteUrl}/login?redirect=/invitation/${invitationToken}`
    : `${siteUrl}/login`
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@eventpulse.com',
    to,
    subject: `🎉 You're Invited to ${eventTitle} on EventPulse!`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 24px; border-radius: 8px; max-width: 480px; margin: auto;">
        <h2 style="color: #4f46e5;">You're Invited!</h2>
        <p style="font-size: 16px; color: #222;">Hi there,</p>
        <p style="font-size: 16px; color: #222;">
          <b>${hostName}</b> has invited you to join the event <b>${eventTitle}</b> on <b>EventPulse</b>.
        </p>
        <p style="font-size: 16px; color: #222;">Click the button below to log in and view your invitation:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${loginLink}" target="_blank" style="background: #4f46e5; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: bold;">Log In & View Invitation</a>
        </div>
        <p style="font-size: 15px; color: #444;">If you don't have an account, you can sign up after clicking the link above. It's quick and free!</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size:12px;color:#888; text-align: center;">This invitation was sent via <b>EventPulse</b>. If you have questions, reply to this email.</p>
      </div>
    `,
  }
  return transporter.sendMail(mailOptions)
}

async function sendVerificationEmail({ to, name, verificationToken }) {
  const siteUrl = process.env.CLIENT_URL || 'https://eventpulse1.netlify.app';
  const verifyLink = `${siteUrl}/verify-email?token=${verificationToken}`;
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@eventpulse.com',
    to,
    subject: 'Verify your email for EventPulse',
    html: `
      <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 24px; border-radius: 8px; max-width: 480px; margin: auto;">
        <h2 style="color: #4f46e5;">Verify Your Email</h2>
        <p style="font-size: 16px; color: #222;">Hi${name ? ` ${name}` : ''},</p>
        <p style="font-size: 16px; color: #222;">Thank you for registering on <b>EventPulse</b>!</p>
        <p style="font-size: 16px; color: #222;">Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${verifyLink}" target="_blank" style="background: #4f46e5; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: bold;">Verify Email</a>
        </div>
        <p style="font-size: 15px; color: #444;">If you did not create an account, you can ignore this email.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size:12px;color:#888; text-align: center;">This email was sent via <b>EventPulse</b>. If you have questions, reply to this email.</p>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendInvitationEmail, sendVerificationEmail };
