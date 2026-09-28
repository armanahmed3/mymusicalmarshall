import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import nodemailer from 'nodemailer';

// Official Gmail SMTP configuration provided by user
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'mymusicmarshall@gmail.com',
    pass: 'lcqewvoepptbvpms'
  }
});

function smtpApiPlugin(): Plugin {
  return {
    name: 'smtp-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Endpoint: Send Activation Email to User via Gmail SMTP
        if (req.method === 'POST' && req.url === '/api/send-activation-email') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { to, username, referralCode } = JSON.parse(body);

              const mailOptions = {
                from: '"Music Marshall" <mymusicmarshall@gmail.com>',
                to,
                bcc: 'mymusicmarshall@gmail.com',
                subject: '🎵 Your SoundMarshall VIP Account Has Been Activated!',
                html: `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta charset="utf-8">
                    <title>Account Activated</title>
                    <style>
                      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
                      .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
                      .header { background: #0f172a; color: #ffffff; padding: 28px; text-align: center; }
                      .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
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
                          <a href="http://localhost:5174/" class="btn">Launch SoundMarshall Music Lab</a>
                        </div>
                      </div>
                      <div class="footer">
                        &copy; ${new Date().getFullYear()} Music Marshall Studios. Sent via official SMTP.
                      </div>
                    </div>
                  </body>
                  </html>
                `
              };

              // 1. Send activation email to user (with BCC to admin)
              const result = await transporter.sendMail(mailOptions);

              // 2. Also send dedicated Administrator Approval Notification to mymusicmarshall@gmail.com
              try {
                await transporter.sendMail({
                  from: '"SoundMarshall Administration" <mymusicmarshall@gmail.com>',
                  to: 'mymusicmarshall@gmail.com',
                  subject: `✅ Member Approved & Activated: ${username} (${to})`,
                  html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
                      <div style="background: #0f172a; color: #ffffff; padding: 20px 24px; border-radius: 8px; margin-bottom: 20px;">
                        <h2 style="margin: 0; font-size: 18px; color: #ffffff;">SoundMarshall Administrator Alert</h2>
                        <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Membership Approval & Activation Confirmation</p>
                      </div>
                      <div style="padding: 4px;">
                        <p style="font-size: 15px; margin-top: 0;">You have successfully approved and activated VIP access for the following listener:</p>
                        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
                          <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 10px 0; font-weight: 700; color: #64748b;">Username:</td>
                            <td style="padding: 10px 0; font-weight: 800; color: #0f172a;">${username}</td>
                          </tr>
                          <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 10px 0; font-weight: 700; color: #64748b;">Member Email:</td>
                            <td style="padding: 10px 0; font-weight: 800; color: #0f172a;">${to}</td>
                          </tr>
                          <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 10px 0; font-weight: 700; color: #64748b;">Referral Code:</td>
                            <td style="padding: 10px 0; font-weight: 800; color: #0f172a; font-family: monospace;">${referralCode}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; font-weight: 700; color: #64748b;">Approval Date:</td>
                            <td style="padding: 10px 0; font-weight: 800; color: #16a34a;">${new Date().toLocaleString()}</td>
                          </tr>
                        </table>
                        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 14px; margin-top: 16px; font-size: 13px; color: #166534; font-weight: 600;">
                          ✓ The member's VIP audio streaming vault and Music Lab access are now active.
                        </div>
                      </div>
                    </div>
                  `
                });
              } catch (adminMailErr) {
                console.warn('Admin record email error (non-fatal):', adminMailErr);
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, messageId: result.messageId }));
            } catch (error: any) {
              console.error('SMTP Activation Email Error:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: error.message || 'SMTP send failed' }));
            }
          });
          return;
        }

        // Endpoint: Notify Admin of New Pending Registration
        if (req.method === 'POST' && req.url === '/api/send-admin-notification') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { username, email, referralCode } = JSON.parse(body);
              const mailOptions = {
                from: '"SoundMarshall Security" <mymusicmarshall@gmail.com>',
                to: 'mymusicmarshall@gmail.com',
                subject: `🔔 New VIP Registration Pending Approval: ${username}`,
                html: `
                  <div style="font-family: sans-serif; padding: 20px; color: #0f172a;">
                    <h2>New VIP Registration Pending Approval</h2>
                    <p>A new listener has registered on SoundMarshall and is awaiting your confirmation on the Admin Portal:</p>
                    <ul>
                      <li><strong>Username:</strong> ${username}</li>
                      <li><strong>Email:</strong> ${email}</li>
                      <li><strong>Referral Code:</strong> ${referralCode}</li>
                    </ul>
                    <p>Please log in to your <a href="http://127.0.0.1:5173/">Admin Portal</a> to review and click <strong>"Approve & Send Activation Email"</strong>.</p>
                  </div>
                `
              };
              const result = await transporter.sendMail(mailOptions);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, messageId: result.messageId }));
            } catch (error: any) {
              console.error('SMTP Admin Notification Error:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: error.message }));
            }
          });
          return;
        }

        // Endpoint: Send OTP Email to User via Gmail SMTP
        if (req.method === 'POST' && req.url === '/api/send-otp-email') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { to, username, otp, mode } = JSON.parse(body);

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

              const result = await transporter.sendMail(mailOptions);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, messageId: result.messageId }));
            } catch (error: any) {
              console.error('SMTP OTP Send Error:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: error.message || 'Failed to dispatch OTP email' }));
            }
          });
          return;
        }

        // Endpoint: Send Email Blast to Members via Gmail SMTP
        if (req.method === 'POST' && req.url === '/api/send-email-blast') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { subject, headline, content, recipients } = JSON.parse(body);

              if (!Array.isArray(recipients) || recipients.length === 0) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'No recipients provided' }));
                return;
              }

              let sentCount = 0;
              const errors: string[] = [];

              for (const recipient of recipients) {
                try {
                  const mailOptions = {
                    from: '"SoundMarshall VIP Broadcast" <mymusicmarshall@gmail.com>',
                    to: recipient.email,
                    subject: subject || '🎵 SoundMarshall VIP Announcement',
                    html: `
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <meta charset="utf-8">
                        <style>
                          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px 12px; color: #f8fafc; }
                          .container { max-width: 580px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 14px; overflow: hidden; }
                          .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 24px; text-align: center; border-bottom: 2px solid #22c55e; }
                          .header h1 { margin: 0; font-size: 22px; color: #ffffff; }
                          .content { padding: 28px 24px; line-height: 1.6; }
                          .headline { font-size: 18px; font-weight: 800; color: #22c55e; margin: 0 0 16px 0; }
                          .body-text { font-size: 14px; color: #cbd5e1; white-space: pre-line; }
                          .footer { background: #0b0f19; padding: 18px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1f2937; }
                        </style>
                      </head>
                      <body>
                        <div class="container">
                          <div class="header">
                            <h1>SOUNDMARSHALL VIP</h1>
                            <p style="margin:4px 0 0; font-size:12px; color:#94a3b8;">High-Fidelity Audio & Studio Production</p>
                          </div>
                          <div class="content">
                            <h2 class="headline">${headline || subject}</h2>
                            <p style="font-size: 14px; color: #94a3b8; margin-top: 0;">Hello ${recipient.username || 'Member'},</p>
                            <div class="body-text">${content}</div>
                            <div style="margin-top: 28px; text-align: center;">
                              <a href="http://127.0.0.1:5173/" style="display:inline-block; background:#22c55e; color:#0f172a; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:800; font-size:14px;">Open SoundMarshall Music Lab</a>
                            </div>
                          </div>
                          <div class="footer">
                            &copy; ${new Date().getFullYear()} SoundMarshall Platform. Sent via Official Studio SMTP.
                          </div>
                        </div>
                      </body>
                      </html>
                    `
                  };
                  await transporter.sendMail(mailOptions);
                  sentCount++;
                } catch (err: any) {
                  errors.push(`${recipient.email}: ${err.message}`);
                }
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, sentCount, total: recipients.length, errors }));
            } catch (error: any) {
              console.error('Email blast error:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: error.message }));
            }
          });
          return;
        }

        // Endpoint: Verify SMTP Connection
        if (req.method === 'GET' && req.url === '/api/test-smtp') {
          try {
            await transporter.verify();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'SMTP credentials verified successfully!' }));
          } catch (error: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: error.message }));
          }
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), smtpApiPlugin()]
});
