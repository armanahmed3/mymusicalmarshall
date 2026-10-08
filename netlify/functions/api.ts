import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import nodemailer from 'nodemailer';

// Gmail SMTP transporter configured with environment variables or fallback credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'mymusicmarshall@gmail.com',
    pass: process.env.SMTP_PASS || 'lcqewvoepptbvpms'
  }
});

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path.replace(/^\/\.netlify\/functions\/api/, '').replace(/^\/api/, '');

  try {
    // 1. Verify SMTP Connection
    if (event.httpMethod === 'GET' && (path === '/test-smtp' || path === '')) {
      await transporter.verify();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'SMTP credentials verified successfully!' })
      };
    }

    // 2. Send OTP Email
    if (event.httpMethod === 'POST' && path === '/send-otp-email') {
      const { to, username, otp, mode } = JSON.parse(event.body || '{}');
      const is2fa = mode === 'admin_2fa';
      const subject = is2fa
        ? '🔒 Music Marshall Admin Security — 2FA Authorization Passcode'
        : '🎵 Welcome to Music Marshall — Your VIP Verification Code';

      const mailOptions = {
        from: '"Music Marshall VIP Portal" <mymusicmarshall@gmail.com>',
        to,
        subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; margin: 0; padding: 32px 16px; color: #f8fafc; }
              .container { max-width: 540px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
              .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 32px 24px; text-align: center; border-bottom: 1px solid #334155; }
              .logo { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; margin: 0; }
              .tagline { margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; font-weight: 500; }
              .content { padding: 32px 28px; line-height: 1.6; }
              .greeting { font-size: 18px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0; }
              .text { font-size: 14px; color: #cbd5e1; margin: 0 0 24px 0; }
              .otp-card { background: #0f172a; border: 2px dashed #00f59b; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
              .otp-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #00f59b; font-weight: 800; margin-bottom: 8px; display: block; }
              .otp-code { font-family: monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #00f59b; display: inline-block; padding: 4px 8px; }
              .otp-expiry { display: block; font-size: 12px; color: #94a3b8; margin-top: 10px; font-weight: 600; }
              .footer { background: #0b0f19; padding: 20px; text-align: center; font-size: 12px; color: #475569; border-top: 1px solid #1e293b; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 class="logo">Music Marshall VIP</h1>
                <p class="tagline">High-Fidelity Audio Vault</p>
              </div>
              <div class="content">
                <h2 class="greeting">Hello ${username || 'VIP Member'},</h2>
                <p class="text">
                  ${is2fa
                    ? 'An administrator login authorization request was initiated for your Music Marshall account. Please enter the passcode below to authorize access.'
                    : 'Use the following One-Time Passcode (OTP) to complete your VIP account registration.'}
                </p>
                <div class="otp-card">
                  <span class="otp-label">ONE-TIME PASSCODE (OTP)</span>
                  <div class="otp-code">${otp}</div>
                  <span class="otp-expiry">⏳ Valid for 10 minutes</span>
                </div>
              </div>
              <div class="footer">
                &copy; ${new Date().getFullYear()} Music Marshall Platform.
              </div>
            </div>
          </body>
          </html>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, messageId: result.messageId })
      };
    }

    // 3. Send Welcome / Activation Email to Member
    if (event.httpMethod === 'POST' && (path === '/send-activation-email' || path === '/send-welcome-email')) {
      const { to, username, referralCode } = JSON.parse(event.body || '{}');
      const mailOptions = {
        from: '"Music Marshall" <mymusicmarshall@gmail.com>',
        to,
        bcc: 'mymusicmarshall@gmail.com',
        subject: '🎵 Welcome to Music Marshall VIP — Lifetime Stream Access Pass!',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; padding: 32px 16px; color: #f8fafc;">
            <div style="max-width: 560px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
              <div style="background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #047857;">
                <h1 style="color: #00f59b; font-size: 24px; font-weight: 800; margin: 0;">Music Marshall VIP Portal</h1>
                <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">High-Fidelity Studio Sound & DJ Jugglings</p>
              </div>
              <div style="padding: 28px 24px;">
                <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0 0 12px 0;">Welcome, ${username || 'VIP Member'}!</h2>
                <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                  Your Music Marshall VIP registration is officially active! You have full, unrestricted streaming access to all authentic sound system mixes, dancehall jugglings, Rocksteady tributes, and official MY MM Productions releases.
                </p>
                <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin: 20px 0;">
                  <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #00f59b; font-weight: 800; margin-bottom: 10px;">Membership Pass</div>
                  <div style="color: #ffffff; font-size: 14px; margin-bottom: 6px;"><strong>Email:</strong> ${to}</div>
                  <div style="color: #ffffff; font-size: 14px; margin-bottom: 6px;"><strong>Promo / Referral Code:</strong> <span style="font-family: monospace; font-weight: 800; color: #fbbf24;">${referralCode}</span></div>
                  <div style="color: #34d399; font-size: 14px; font-weight: 700;"><strong>Status:</strong> ✓ Active VIP Listener</div>
                </div>
                <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 16px 0 0 0;">
                  Feel free to curate custom playlists, explore upcoming sound system flyers on our Notice Board, or loop extended mixes on your sound setup.
                </p>
              </div>
              <div style="background: #0b0f19; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1f2937;">
                &copy; ${new Date().getFullYear()} Music Marshall Platform. Authentic Audio Studio.
              </div>
            </div>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, messageId: result.messageId })
      };
    }

    // 4. Send Admin Notification of Pending Registration
    if (event.httpMethod === 'POST' && path === '/send-admin-notification') {
      const { username, email, referralCode } = JSON.parse(event.body || '{}');
      const mailOptions = {
        from: '"Music Marshall Security" <mymusicmarshall@gmail.com>',
        to: 'mymusicmarshall@gmail.com',
        subject: `🔔 New VIP Registration Pending Approval: ${username}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #0f172a;">
            <h2>New VIP Registration Pending Approval</h2>
            <ul>
              <li><strong>Username:</strong> ${username}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Referral Code:</strong> ${referralCode}</li>
            </ul>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, messageId: result.messageId })
      };
    }

    // 4b. Send Profile Update Notification to Both User & Admin
    if (event.httpMethod === 'POST' && path === '/send-profile-update-email') {
      const { userEmail, username, firstName, lastName, phone, favoriteGenre, bio } = JSON.parse(event.body || '{}');

      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; padding: 32px 16px; color: #f8fafc;">
          <div style="max-width: 560px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
            <div style="background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%); padding: 28px 24px; text-align: center; border-bottom: 1px solid #047857;">
              <h1 style="color: #00f59b; font-size: 22px; font-weight: 800; margin: 0;">Music Marshall VIP Portal</h1>
              <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Member Profile Information Update</p>
            </div>
            <div style="padding: 24px;">
              <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 10px 0;">Hello ${username || 'VIP Member'},</h2>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5; margin: 0 0 16px 0;">
                Your Music Marshall member profile and account details have been successfully updated.
              </p>
              <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; margin: 16px 0; font-size: 13px; line-height: 1.6;">
                <div><strong style="color: #94a3b8;">Username:</strong> <span style="color: #ffffff;">${username}</span></div>
                <div><strong style="color: #94a3b8;">Full Name:</strong> <span style="color: #ffffff;">${firstName || ''} ${lastName || ''}</span></div>
                <div><strong style="color: #94a3b8;">Account Email:</strong> <span style="color: #ffffff;">${userEmail}</span></div>
                ${phone ? `<div><strong style="color: #94a3b8;">Phone:</strong> <span style="color: #ffffff;">${phone}</span></div>` : ''}
                ${favoriteGenre ? `<div><strong style="color: #94a3b8;">Favorite Genre:</strong> <span style="color: #00f59b;">${favoriteGenre}</span></div>` : ''}
                ${bio ? `<div><strong style="color: #94a3b8;">Bio:</strong> <span style="color: #e2e8f0;">${bio}</span></div>` : ''}
                <div><strong style="color: #94a3b8;">Updated Timestamp:</strong> <span style="color: #cbd5e1;">${new Date().toUTCString()}</span></div>
              </div>
              <p style="color: #64748b; font-size: 12px; margin: 16px 0 0 0;">
                Notice: A duplicate confirmation of this update has been transmitted to platform administrators.
              </p>
            </div>
            <div style="background: #0b0f19; padding: 14px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1f2937;">
              &copy; ${new Date().getFullYear()} Music Marshall Platform.
            </div>
          </div>
        </div>
      `;

      // Dispatch to user and copy admin
      const mailOptions = {
        from: '"Music Marshall Member Desk" <mymusicmarshall@gmail.com>',
        to: userEmail,
        bcc: 'mymusicmarshall@gmail.com',
        subject: `👤 Music Marshall Profile Updated: ${username}`,
        html: emailHtml
      };

      const result = await transporter.sendMail(mailOptions);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, messageId: result.messageId })
      };
    }

    // 5. Send Email Blast
    if (event.httpMethod === 'POST' && path === '/send-email-blast') {
      const { subject, headline, content, recipients } = JSON.parse(event.body || '{}');
      if (!Array.isArray(recipients) || recipients.length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'No recipients provided' })
        };
      }

      let sentCount = 0;
      for (const recipient of recipients) {
        try {
          await transporter.sendMail({
            from: '"Music Marshall VIP Broadcast" <mymusicmarshall@gmail.com>',
            to: recipient.email,
            subject: subject || '🎵 Music Marshall VIP Announcement',
            html: `
              <div style="font-family: sans-serif; padding: 24px; color: #0f172a;">
                <h2>${headline || subject}</h2>
                <p>Hello ${recipient.username || 'VIP Member'},</p>
                <div style="white-space: pre-line;">${content}</div>
              </div>
            `
          });
          sentCount++;
        } catch (e) {
          console.error('Blast recipient error:', e);
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, sentCount, total: recipients.length })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Not found: ${path}` })
    };
  } catch (error: any) {
    console.error('Netlify function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message || 'Internal server error' })
    };
  }
};

