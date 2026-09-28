import nodemailer from 'nodemailer';

// Official Gmail SMTP configuration provided by user
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'mymusicmarshall@gmail.com',
    pass: 'lcqewvoepptbvpms'
  }
});

interface ActivationEmailParams {
  to: string;
  username: string;
  referralCode: string;
}

export async function sendActivationEmail({ to, username, referralCode }: ActivationEmailParams) {
  const mailOptions = {
    from: '"mymusicmarshall" <mymusicmarshall@gmail.com>',
    to,
    subject: '🎵 Your SoundMarshall VIP Account Has Been Activated!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Account Activated</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
          .header { background: #0f172a; color: #ffffff; padding: 28px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
          .header p { margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; }
          .content { padding: 32px 28px; line-height: 1.6; }
          .badge { display: inline-block; background: #dcfce7; color: #15803d; font-weight: 800; font-size: 12px; padding: 4px 10px; border-radius: 9999px; margin-bottom: 16px; }
          .details-card { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px; padding: 18px; margin: 20px 0; }
          .details-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; }
          .btn { display: inline-block; background: #0f172a; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-top: 10px; text-align: center; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SoundMarshall VIP Portal</h1>
            <p>High-Fidelity Audio & Studio Production</p>
          </div>
          <div class="content">
            <span class="badge">✓ ACTIVATION CONFIRMED BY ADMINISTRATOR</span>
            <h2 style="margin-top: 0; font-size: 18px; font-weight: 800;">Welcome, ${username}!</h2>
            <p>Your membership application has been reviewed and officially <strong>approved and activated</strong> by the platform administrator.</p>
            
            <div class="details-card">
              <div class="details-row"><strong>Registered Email:</strong> <span>${to}</span></div>
              <div class="details-row"><strong>Your VIP Referral Code:</strong> <span style="font-family: monospace; font-weight: 800;">${referralCode}</span></div>
              <div class="details-row" style="margin-bottom: 0;"><strong>Access Status:</strong> <span style="color: #16a34a; font-weight: 700;">Full Access (Music Lab Unlocked)</span></div>
            </div>

            <p>You can now sign in with your credentials and launch the full <strong>SoundMarshall Music Lab & Player</strong>.</p>

            <div style="text-align: center; margin-top: 24px;">
              <a href="http://127.0.0.1:5173/" class="btn">Launch SoundMarshall Music Lab</a>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Music Marshall Studios. Kingston to London. Sent via official SMTP.
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
}

export async function sendAdminNotification({ newUsername, newEmail, referralCode }: { newUsername: string; newEmail: string; referralCode: string; }) {
  const mailOptions = {
    from: '"SoundMarshall System" <mymusicmarshall@gmail.com>',
    to: 'mymusicmarshall@gmail.com',
    subject: `🔔 New Member Registration Pending Approval: ${newUsername}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #0f172a;">
        <h2>New VIP Registration Pending Approval</h2>
        <p>A new listener has registered on SoundMarshall and is awaiting your confirmation on the Admin Portal:</p>
        <ul>
          <li><strong>Username:</strong> ${newUsername}</li>
          <li><strong>Email:</strong> ${newEmail}</li>
          <li><strong>Referral Code Used:</strong> ${referralCode}</li>
          <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p>Please log in to your <a href="http://127.0.0.1:5173/">Admin Portal</a> to review and click <strong>"Approve & Send Activation Email"</strong>.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
}

export async function sendOtpEmail({
  to,
  username,
  otp,
  mode
}: {
  to: string;
  username: string;
  otp: string;
  mode?: 'register' | 'login' | 'admin_2fa';
}) {
  const is2fa = mode === 'admin_2fa';
  const subject = is2fa
    ? '🔒 SoundMarshall Admin Security — 2FA Authorization Passcode'
    : '🎵 Welcome to SoundMarshall — Your VIP Verification Code';

  const mailOptions = {
    from: '"SoundMarshall VIP Portal" <mymusicmarshall@gmail.com>',
    to,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; margin: 0; padding: 32px 16px; color: #f8fafc; }
          .container { max-width: 540px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
          .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 32px 24px; text-align: center; border-bottom: 1px solid #334155; }
          .logo { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; margin: 0; }
          .tagline { margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; font-weight: 500; }
          .content { padding: 32px 28px; line-height: 1.6; }
          .greeting { font-size: 18px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0; }
          .text { font-size: 14px; color: #cbd5e1; margin: 0 0 24px 0; }
          .otp-card { background: #0f172a; border: 2px dashed #38bdf8; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
          .otp-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #38bdf8; font-weight: 800; margin-bottom: 8px; display: block; }
          .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #ffffff; text-shadow: 0 0 12px rgba(56, 189, 248, 0.4); display: inline-block; padding: 4px 8px; }
          .otp-expiry { display: block; font-size: 12px; color: #94a3b8; margin-top: 10px; font-weight: 600; }
          .security-note { font-size: 12px; color: #64748b; background: rgba(255,255,255,0.03); border: 1px solid #1e293b; border-radius: 8px; padding: 12px 14px; margin-top: 24px; }
          .footer { background: #0b0f19; padding: 20px; text-align: center; font-size: 12px; color: #475569; border-top: 1px solid #1e293b; }
          .footer a { color: #38bdf8; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">SOUNDMARSHALL VIP</h1>
            <p class="tagline">Studio Production & High-Fidelity Audio Vault</p>
          </div>
          <div class="content">
            <h2 class="greeting">Hello ${username || 'VIP Member'},</h2>
            <p class="text">
              ${is2fa
                ? 'An administrator login authorization request was initiated for your SoundMarshall account. Please use the high-security passcode below to authorize administrative access.'
                : 'Thank you for registering on SoundMarshall. Use the following One-Time Passcode (OTP) to verify your email address and proceed with your VIP membership onboarding.'}
            </p>
            
            <div class="otp-card">
              <span class="otp-label">YOUR ONE-TIME PASSCODE (OTP)</span>
              <div class="otp-code">${otp}</div>
              <span class="otp-expiry">⏳ Valid for 10 minutes</span>
            </div>

            <div class="security-note">
              🔒 <strong>Security Warning:</strong> Never share this code with anyone. SoundMarshall personnel will never ask for your verification code. If you did not make this request, please contact our support team at <a href="mailto:support@ellivrocorporation.com" style="color: #38bdf8;">support@ellivrocorporation.com</a>.
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} SoundMarshall. All rights reserved.<br>
            Support: <a href="mailto:support@ellivrocorporation.com">support@ellivrocorporation.com</a> | Marketing: <a href="mailto:mymusicmarshall@gmail.com">mymusicmarshall@gmail.com</a>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
}

