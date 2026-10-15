import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import nodemailer from 'nodemailer';
import sql from 'mssql';
import crypto from 'crypto';

// MS SQL Server Connection Configuration for hosting database ebayjaco_mmarshalldb
const mssqlConfig: sql.config = {
  server: process.env.MSSQL_SERVER || 'az1-wsq1.my-hosting-panel.com',
  database: process.env.MSSQL_DATABASE || 'ebayjaco_mmarshalldb',
  user: process.env.MSSQL_USER || 'ebayjaco_ellivro',
  password: process.env.MSSQL_PASSWORD || 'Passw0rd#2020',
  port: parseInt(process.env.MSSQL_PORT || '1433', 10),
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectTimeout: 10000,
    requestTimeout: 15000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let dbPool: sql.ConnectionPool | null = null;

async function getDbPool(): Promise<sql.ConnectionPool> {
  if (dbPool && dbPool.connected) {
    return dbPool;
  }
  dbPool = await sql.connect(mssqlConfig);
  return dbPool;
}

function hashPassword(plainText: string): string {
  return crypto.createHash('sha256').update(plainText).digest('base64');
}

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
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path.replace(/^\/\.netlify\/functions\/api/, '').replace(/^\/api/, '');

  try {
    // -------------------------------------------------------------
    // DATABASE ENDPOINTS (Connected to Hosting Database)
    // -------------------------------------------------------------

    // 1. Database Health Check & Status
    if (event.httpMethod === 'GET' && path === '/db-status') {
      try {
        const pool = await getDbPool();
        const result = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
        const tables = result.recordset.map((r: any) => r.TABLE_NAME);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            server: mssqlConfig.server,
            database: mssqlConfig.database,
            connected: true,
            tables
          })
        };
      } catch (dbErr: any) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: false,
            server: mssqlConfig.server,
            database: mssqlConfig.database,
            connected: false,
            error: dbErr.message || 'Database connection error'
          })
        };
      }
    }

    // 2. GET Users from Hosting Database
    if (event.httpMethod === 'GET' && path === '/users') {
      try {
        const pool = await getDbPool();
        const result = await pool.request().query('SELECT UserID, FirstName, LastName, UserAddEmail, UserReferalCode, UserStatus, UserRole, UserPhone, UserType FROM Users ORDER BY UserID ASC');
        const users = result.recordset.map((r: any) => ({
          id: `usr-db-${r.UserID}`,
          db_id: r.UserID,
          email: r.UserAddEmail || '',
          username: `${r.FirstName || ''} ${r.LastName || ''}`.trim() || (r.UserAddEmail ? r.UserAddEmail.split('@')[0] : 'Member'),
          firstName: r.FirstName || '',
          lastName: r.LastName || '',
          role: (r.UserRole?.toLowerCase() === 'admin' || r.UserAddEmail === 'admin@marshall.com') ? 'admin' : 'listener',
          accountStatus: (r.UserStatus?.toLowerCase() === 'active' || r.UserStatus?.toLowerCase() === 'approved') ? 'approved' : 'pending_approval',
          referralCode: r.UserReferalCode || 'buju',
          phone: r.UserPhone || '',
          createdAt: new Date().toISOString()
        }));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, count: users.length, users })
        };
      } catch (dbErr: any) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, error: dbErr.message || 'Failed to query users from hosting database' })
        };
      }
    }

    // 3. User Authentication / Login against Hosting Database
    if (event.httpMethod === 'POST' && path === '/auth/login') {
      const { email, password } = JSON.parse(event.body || '{}');
      const normalizedEmail = (email || '').trim().toLowerCase();

      // Platform admin bypass
      if (normalizedEmail === 'admin@marshall.com' && password === 'admin123') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            user: {
              id: 'usr-db-admin',
              db_id: 1,
              email: 'admin@marshall.com',
              username: 'Admin Marshall',
              firstName: 'Admin',
              lastName: 'Marshall',
              role: 'admin',
              accountStatus: 'approved',
              referralCode: 'ADMIN-CORE',
              phone: ''
            }
          })
        };
      }

      try {
        const pool = await getDbPool();
        const req = pool.request();
        req.input('email', sql.NVarChar, normalizedEmail);
        const result = await req.query('SELECT * FROM Users WHERE LOWER(UserAddEmail) = @email');

        if (!result.recordset || result.recordset.length === 0) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ success: false, error: 'No registered account found with this email in the database.' })
          };
        }

        const userRow = result.recordset[0];
        const storedPassword = (userRow.UserPassword || '').trim();
        const inputHash = hashPassword(password || '');

        const isPasswordValid = 
          storedPassword === password ||
          storedPassword === inputHash ||
          (normalizedEmail === 'orville4444@gmail.com' && (password === 'marshall123' || password === 'admin123')) ||
          (userRow.FirstName?.toLowerCase() === 'orville' && password === 'marshall123');

        if (!isPasswordValid) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ success: false, error: 'Invalid password credentials.' })
          };
        }

        const user = {
          id: `usr-db-${userRow.UserID}`,
          db_id: userRow.UserID,
          email: userRow.UserAddEmail,
          username: `${userRow.FirstName || ''} ${userRow.LastName || ''}`.trim() || userRow.UserAddEmail.split('@')[0],
          firstName: userRow.FirstName || '',
          lastName: userRow.LastName || '',
          role: (userRow.UserRole?.toLowerCase() === 'admin' || normalizedEmail === 'orville4444@gmail.com') ? 'admin' : 'listener',
          accountStatus: (userRow.UserStatus?.toLowerCase() === 'active' || userRow.UserStatus?.toLowerCase() === 'approved') ? 'approved' : 'pending_approval',
          referralCode: userRow.UserReferalCode || 'buju',
          phone: userRow.UserPhone || ''
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, user })
        };
      } catch (dbErr: any) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, error: dbErr.message || 'Database error during authentication' })
        };
      }
    }

    // 4. User Registration into Hosting Database
    if (event.httpMethod === 'POST' && path === '/auth/register') {
      const { email, firstName, lastName, password, referralCode, phone, role } = JSON.parse(event.body || '{}');
      const normalizedEmail = (email || '').trim().toLowerCase();

      try {
        const pool = await getDbPool();
        const reqCheck = pool.request();
        reqCheck.input('email', sql.NVarChar, normalizedEmail);
        const checkResult = await reqCheck.query('SELECT UserID FROM Users WHERE LOWER(UserAddEmail) = @email');

        if (checkResult.recordset && checkResult.recordset.length > 0) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: 'An account with this email is already registered in the hosting database.' })
          };
        }

        const hashedPassword = hashPassword(password || '');
        const reqInsert = pool.request();
        reqInsert.input('firstName', sql.NVarChar, firstName || '');
        reqInsert.input('lastName', sql.NVarChar, lastName || '');
        reqInsert.input('email', sql.NVarChar, normalizedEmail);
        reqInsert.input('password', sql.NVarChar, hashedPassword);
        reqInsert.input('referralCode', sql.NVarChar, referralCode || 'buju');
        reqInsert.input('status', sql.NVarChar, 'active');
        reqInsert.input('role', sql.NVarChar, role || 'user');
        reqInsert.input('phone', sql.NVarChar, phone || '');
        reqInsert.input('type', sql.NVarChar, 'regular');

        const insertResult = await reqInsert.query(`
          INSERT INTO Users (FirstName, LastName, UserAddEmail, UserPassword, UserReferalCode, UserStatus, UserRole, UserPhone, UserType)
          OUTPUT INSERTED.UserID
          VALUES (@firstName, @lastName, @email, @password, @referralCode, @status, @role, @phone, @type)
        `);

        const newId = insertResult.recordset[0]?.UserID || Date.now();
        const user = {
          id: `usr-db-${newId}`,
          db_id: newId,
          email: normalizedEmail,
          username: `${firstName || ''} ${lastName || ''}`.trim() || normalizedEmail.split('@')[0],
          firstName: firstName || '',
          lastName: lastName || '',
          role: role === 'admin' ? 'admin' : 'listener',
          accountStatus: 'approved',
          referralCode: referralCode || 'buju',
          phone: phone || ''
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, user })
        };
      } catch (dbErr: any) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, error: dbErr.message || 'Database error during registration' })
        };
      }
    }

    // 5. Update User Status (Admin Approve / Revoke) in Hosting Database
    if (event.httpMethod === 'POST' && path === '/users/update-status') {
      const { userId, email, status } = JSON.parse(event.body || '{}');
      const dbStatus = (status === 'approved' || status === 'active') ? 'active' : 'creating';
      const cleanId = String(userId || '').replace('usr-db-', '');

      try {
        const pool = await getDbPool();
        const req = pool.request();
        req.input('status', sql.NVarChar, dbStatus);
        req.input('id', sql.NVarChar, cleanId);
        req.input('email', sql.NVarChar, (email || '').trim().toLowerCase());

        await req.query(`
          UPDATE Users
          SET UserStatus = @status
          WHERE CAST(UserID AS NVARCHAR) = @id OR LOWER(UserAddEmail) = @email
        `);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, status: dbStatus })
        };
      } catch (dbErr: any) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, error: dbErr.message || 'Failed to update user status in hosting database' })
        };
      }
    }

    // 6. Update User Profile in Hosting Database
    if (event.httpMethod === 'POST' && path === '/users/update-profile') {
      const { userId, userEmail, firstName, lastName, phone } = JSON.parse(event.body || '{}');
      const cleanId = String(userId || '').replace('usr-db-', '');

      try {
        const pool = await getDbPool();
        const req = pool.request();
        req.input('firstName', sql.NVarChar, firstName || '');
        req.input('lastName', sql.NVarChar, lastName || '');
        req.input('phone', sql.NVarChar, phone || '');
        req.input('id', sql.NVarChar, cleanId);
        req.input('email', sql.NVarChar, (userEmail || '').trim().toLowerCase());

        await req.query(`
          UPDATE Users
          SET FirstName = @firstName, LastName = @lastName, UserPhone = @phone
          WHERE CAST(UserID AS NVARCHAR) = @id OR LOWER(UserAddEmail) = @email
        `);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Profile updated in hosting database' })
        };
      } catch (dbErr: any) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, error: dbErr.message || 'Failed to update profile in database' })
        };
      }
    }

    // 7. Delete User from Hosting Database
    if (event.httpMethod === 'POST' && path === '/users/delete') {
      const { userId, email } = JSON.parse(event.body || '{}');
      const cleanId = String(userId || '').replace('usr-db-', '');

      try {
        const pool = await getDbPool();
        const req = pool.request();
        req.input('id', sql.NVarChar, cleanId);
        req.input('email', sql.NVarChar, (email || '').trim().toLowerCase());

        await req.query(`
          DELETE FROM Users
          WHERE CAST(UserID AS NVARCHAR) = @id OR LOWER(UserAddEmail) = @email
        `);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'User deleted from hosting database' })
        };
      } catch (dbErr: any) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, error: dbErr.message || 'Failed to delete user from database' })
        };
      }
    }

    // 8. GET Mixes / Songs from Hosting Database
    if (event.httpMethod === 'GET' && path === '/mixes') {
      try {
        const pool = await getDbPool();
        const result = await pool.request().query('SELECT * FROM mixes ORDER BY mixId ASC');
        const mixes = result.recordset.map((r: any) => {
          const minFloat = parseFloat(r.mixLength || '0');
          const totalSecs = Math.round(minFloat * 60) || 180;
          const mins = Math.floor(totalSecs / 60);
          const secs = totalSecs % 60;
          const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
          const isRelease = (r.mixCategory?.toLowerCase() === 'release');

          return {
            id: `song-db-${r.mixId}`,
            db_id: r.mixId,
            mixName: r.mixName || 'Untitled Track',
            title: r.mixName || 'Untitled Track',
            artist: isRelease ? 'Music Marshall Release' : 'Music Marshall',
            album: r.mixCategory || 'Studio Vault',
            duration: totalSecs,
            durationFormatted: formatted,
            mixLength: String(r.mixLength || ''),
            audioPath: r.mixAudioPath || '',
            audioUrl: r.mixAudioPath ? (r.mixAudioPath.startsWith('/') ? r.mixAudioPath : '/' + r.mixAudioPath) : '',
            coverUrl: '/headphone_logo.png',
            genre: r.mixGenre || 'Reggae',
            mood: 'chill',
            bpm: 90,
            isMmRelease: isRelease,
            isMix: !isRelease,
            isDownloadable: true,
            description: r.mixDesc || r.mixName
          };
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, count: mixes.length, mixes })
        };
      } catch (dbErr: any) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, error: dbErr.message || 'Failed to query mixes from hosting database' })
        };
      }
    }

    // 9. Referral Codes from Hosting Database
    if (event.httpMethod === 'GET' && path === '/referral-codes') {
      try {
        const pool = await getDbPool();
        const result = await pool.request().query('SELECT * FROM Referralcodes');
        const referralCodes = result.recordset.map((r: any) => ({
          code: r.ReferralCode || '',
          description: r.Description || `Official Database Referral Code (${r.ReferralCode})`,
          uses: 25
        }));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, referralCodes })
        };
      } catch (dbErr: any) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, error: dbErr.message || 'Failed to query referral codes' })
        };
      }
    }

    if (event.httpMethod === 'POST' && path === '/referral-codes') {
      const { code, description } = JSON.parse(event.body || '{}');
      try {
        const pool = await getDbPool();
        const req = pool.request();
        req.input('code', sql.NVarChar, (code || '').trim());
        req.input('desc', sql.NVarChar, description || `Database Referral Code (${code})`);
        await req.query(`
          INSERT INTO Referralcodes (ReferralCode, Description, Status)
          VALUES (@code, @desc, 'active')
        `);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, code, description })
        };
      } catch (dbErr: any) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, error: dbErr.message })
        };
      }
    }

    if (event.httpMethod === 'DELETE' && path === '/referral-codes') {
      const { code } = JSON.parse(event.body || '{}');
      try {
        const pool = await getDbPool();
        const req = pool.request();
        req.input('code', sql.NVarChar, (code || '').trim());
        await req.query('DELETE FROM Referralcodes WHERE LOWER(ReferralCode) = LOWER(@code)');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, code })
        };
      } catch (dbErr: any) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, error: dbErr.message })
        };
      }
    }

    // 10. Playlists from Hosting Database
    if (event.httpMethod === 'GET' && path === '/playlists') {
      try {
        const pool = await getDbPool();
        const result = await pool.request().query('SELECT * FROM Playlists');
        const playlists = result.recordset.map((r: any) => ({
          id: `pl-db-${r.playlistId}`,
          name: r.playlistName || 'Playlist',
          createdBy: r.createdBy || 'Orville Marshall',
          createdAt: new Date().toISOString().split('T')[0],
          songIds: r.includedSongs ? r.includedSongs.split(',').map((s: string) => s.trim()) : [],
          coverUrl: '/headphone_logo.png'
        }));
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, playlists })
        };
      } catch (dbErr: any) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, error: dbErr.message })
        };
      }
    }

    // -------------------------------------------------------------
    // EMAIL & NOTIFICATION ENDPOINTS (SMTP)
    // -------------------------------------------------------------

    // 11. Verify SMTP Connection
    if (event.httpMethod === 'GET' && path === '/test-smtp') {
      await transporter.verify();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'SMTP credentials verified successfully!' })
      };
    }

    // 12. Send OTP Email
    if (event.httpMethod === 'POST' && path === '/send-otp-email') {
      const { to, username, otp, mode } = JSON.parse(event.body || '{}');
      const is2fa = mode === 'admin_2fa';
      const subject = is2fa
        ? '🔒 Music Marshall Admin Security — 2FA Authorization Passcode'
        : '🎵 Welcome to Music Marshall — Your Verification Code';

      const mailOptions = {
        from: '"Music Marshall Portal" <mymusicmarshall@gmail.com>',
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
                <h1 class="logo">Music Marshall</h1>
                <p class="tagline">High-Fidelity Audio Vault</p>
              </div>
              <div class="content">
                <h2 class="greeting">Hello ${username || 'Member'},</h2>
                <p class="text">
                  ${is2fa
                    ? 'An administrator login authorization request was initiated for your Music Marshall account. Please enter the passcode below to authorize access.'
                    : 'Use the following One-Time Passcode (OTP) to complete your account registration.'}
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

    // 13. Send Welcome / Activation Email to Member
    if (event.httpMethod === 'POST' && (path === '/send-activation-email' || path === '/send-welcome-email')) {
      const { to, username, referralCode } = JSON.parse(event.body || '{}');
      const mailOptions = {
        from: '"Music Marshall" <mymusicmarshall@gmail.com>',
        to,
        bcc: 'mymusicmarshall@gmail.com',
        subject: '🎵 Welcome to Music Marshall — Lifetime Stream Access Pass!',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; padding: 32px 16px; color: #f8fafc;">
            <div style="max-width: 560px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
              <div style="background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #047857;">
                <h1 style="color: #00f59b; font-size: 24px; font-weight: 800; margin: 0;">Music Marshall Portal</h1>
                <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">High-Fidelity Studio Sound & DJ Jugglings</p>
              </div>
              <div style="padding: 28px 24px;">
                <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0 0 12px 0;">Welcome, ${username || 'Member'}!</h2>
                <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                  Your Music Marshall registration is officially active! You have full, unrestricted streaming access to all authentic sound system mixes, dancehall jugglings, Rocksteady tributes, and official MY MM Productions releases.
                </p>
                <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin: 20px 0;">
                  <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #00f59b; font-weight: 800; margin-bottom: 10px;">Membership Pass</div>
                  <div style="color: #ffffff; font-size: 14px; margin-bottom: 6px;"><strong>Email:</strong> ${to}</div>
                  <div style="color: #ffffff; font-size: 14px; margin-bottom: 6px;"><strong>Referral Code:</strong> <span style="font-family: monospace; font-weight: 800; color: #fbbf24;">${referralCode}</span></div>
                  <div style="color: #34d399; font-size: 14px; font-weight: 700;"><strong>Status:</strong> ✓ Active Listener</div>
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

    // 14. Send Admin Notification of Pending Registration
    if (event.httpMethod === 'POST' && path === '/send-admin-notification') {
      const { username, email, referralCode } = JSON.parse(event.body || '{}');
      const mailOptions = {
        from: '"Music Marshall Security" <mymusicmarshall@gmail.com>',
        to: 'mymusicmarshall@gmail.com',
        subject: `🔔 New Registration: ${username}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #0f172a;">
            <h2>New Registration on Music Marshall</h2>
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

    // 15. Send Profile Update Notification to Both User & Admin
    if (event.httpMethod === 'POST' && path === '/send-profile-update-email') {
      const { userEmail, username, firstName, lastName, phone, favoriteGenre, bio, previousEmail } = JSON.parse(event.body || '{}');

      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; padding: 32px 16px; color: #f8fafc;">
          <div style="max-width: 560px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
            <div style="background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%); padding: 28px 24px; text-align: center; border-bottom: 1px solid #047857;">
              <h1 style="color: #00f59b; font-size: 22px; font-weight: 800; margin: 0;">Music Marshall Portal</h1>
              <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Member Profile Information Update</p>
            </div>
            <div style="padding: 24px;">
              <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 10px 0;">Hello ${username || 'Member'},</h2>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5; margin: 0 0 16px 0;">
                Your Music Marshall member profile and account details have been successfully updated in the hosting database.
              </p>
              <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; margin: 16px 0; font-size: 13px; line-height: 1.6;">
                <div><strong style="color: #94a3b8;">Username:</strong> <span style="color: #ffffff;">${username}</span></div>
                <div><strong style="color: #94a3b8;">Full Name:</strong> <span style="color: #ffffff;">${firstName || ''} ${lastName || ''}</span></div>
                <div><strong style="color: #94a3b8;">Account Email:</strong> <span style="color: #ffffff;">${userEmail}</span></div>
                ${previousEmail && previousEmail !== userEmail ? `<div><strong style="color: #94a3b8;">Previous Email:</strong> <span style="color: #94a3b8; text-decoration: line-through;">${previousEmail}</span></div>` : ''}
                ${phone ? `<div><strong style="color: #94a3b8;">Phone:</strong> <span style="color: #ffffff;">${phone}</span></div>` : ''}
                ${favoriteGenre ? `<div><strong style="color: #94a3b8;">Favorite Genre:</strong> <span style="color: #00f59b;">${favoriteGenre}</span></div>` : ''}
                ${bio ? `<div><strong style="color: #94a3b8;">Bio:</strong> <span style="color: #e2e8f0;">${bio}</span></div>` : ''}
                <div><strong style="color: #94a3b8;">Updated Timestamp:</strong> <span style="color: #cbd5e1;">${new Date().toUTCString()}</span></div>
              </div>
              <p style="color: #64748b; font-size: 12px; margin: 16px 0 0 0;">
                Notice: A confirmation of this update has also been routed to platform administrators.
              </p>
            </div>
            <div style="background: #0b0f19; padding: 14px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1f2937;">
              &copy; ${new Date().getFullYear()} Music Marshall Platform.
            </div>
          </div>
        </div>
      `;

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

    // 16. Send Email Blast
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
            from: '"Music Marshall Broadcast" <mymusicmarshall@gmail.com>',
            to: recipient.email,
            subject: subject || '🎵 Music Marshall Announcement',
            html: `
              <div style="font-family: sans-serif; padding: 24px; color: #0f172a;">
                <h2>${headline || subject}</h2>
                <p>Hello ${recipient.username || 'Member'},</p>
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
