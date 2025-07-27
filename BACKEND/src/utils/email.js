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
  const siteUrl = process.env.CLIENT_URL || 'https://eventpulse-five.vercel.app'
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

async function sendVerificationEmail({ to, name, verificationToken, redirectPath }) {
  const backendUrl = process.env.BACKEND_URL || 'https://pulseevent-backend.onrender.com';
  // Include redirect path in the verification URL if provided
  const redirectParam = redirectPath ? `&redirect=${encodeURIComponent(redirectPath)}` : '';
  const verifyLink = `${backendUrl}/api/auth/verify-email?token=${verificationToken}${redirectParam}`;
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

async function sendPasswordResetEmail({ to, name, resetToken }) {
  const frontendUrl = process.env.CLIENT_URL || 'https://eventpulse-five.vercel.app';
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@eventpulse.com',
    to,
    subject: 'Reset your password for EventPulse',
    html: `
      <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 24px; border-radius: 8px; max-width: 480px; margin: auto;">
        <h2 style="color: #4f46e5;">Reset Your Password</h2>
        <p style="font-size: 16px; color: #222;">Hi${name ? ` ${name}` : ''},</p>
        <p style="font-size: 16px; color: #222;">We received a request to reset your password for your <b>EventPulse</b> account.</p>
        <p style="font-size: 16px; color: #222;">Click the button below to set a new password. This link will expire in <b>10 minutes</b>.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetLink}" target="_blank" style="background: #4f46e5; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="font-size: 15px; color: #444;">If you did not request a password reset, you can safely ignore this email.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size:12px;color:#888; text-align: center;">This email was sent via <b>EventPulse</b>. If you have questions, reply to this email.</p>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
}

async function sendPasswordChangeNotification({ to, name }) {
  const frontendUrl = process.env.CLIENT_URL || 'https://eventpulse-five.vercel.app';
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@eventpulse.com',
    to,
    subject: 'Your EventPulse password was changed',
    html: `
      <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 24px; border-radius: 8px; max-width: 480px; margin: auto;">
        <h2 style="color: #4f46e5;">Password Changed</h2>
        <p style="font-size: 16px; color: #222;">Hi${name ? ` ${name}` : ''},</p>
        <p style="font-size: 16px; color: #222;">Your password for <b>EventPulse</b> was just changed.</p>
        <p style="font-size: 16px; color: #222;">If you did not perform this action, please <a href="${frontendUrl}/forgot-password" style="color: #4f46e5; text-decoration: underline;">reset your password</a> immediately or contact support.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size:12px;color:#888; text-align: center;">This email was sent via <b>EventPulse</b>. If you have questions, reply to this email.</p>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
}

async function sendRegistrationRejectionEmail({ to, name, eventTitle, hostName, hostEmail }) {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@eventpulse.com',
    to,
    subject: `Update on your registration for ${eventTitle} – EventPulse`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 24px; border-radius: 8px; max-width: 480px; margin: auto;">
        <h2 style="color: #eab308;">Registration Update</h2>
        <p style="font-size: 16px; color: #222;">Hi${name ? ` ${name}` : ''},</p>
        <p style="font-size: 16px; color: #222;">
          Thank you for your interest in <b>${eventTitle}</b> on <b>EventPulse</b>.
        </p>
        <p style="font-size: 16px; color: #222;">
          After a careful and thorough review of your registration details, the event host <b>${hostName}</b> has decided not to approve your registration for this event.
        </p>
        <p style="font-size: 16px; color: #222;">
          We understand this may be disappointing, but please know that every application is reviewed thoughtfully and the decision was made by the host based on event requirements and criteria.
        </p>
        <p style="font-size: 16px; color: #222;">
          If you have any questions or would like more information about this decision, you are welcome to contact the host directly at <a href="mailto:${hostEmail}" style="color: #4f46e5; text-decoration: underline;">${hostEmail}</a>.
        </p>
        <p style="font-size: 16px; color: #222;">
          We encourage you to explore other events on EventPulse and hope to see you participate in the future!
        </p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size:12px;color:#888; text-align: center;">This message was sent via <b>EventPulse</b>. If you have questions, reply to this email.</p>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendInvitationEmail, sendVerificationEmail, sendPasswordResetEmail, sendPasswordChangeNotification, sendRegistrationRejectionEmail };
