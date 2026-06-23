const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Initialize local WhatsApp client
let isWhatsAppReady = false;
const whatsappClient = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    channel: 'chrome',
    handleSIGINT: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

whatsappClient.on('qr', (qr) => {
  console.log('\n======================================');
  console.log('SCAN THE QR CODE BELOW TO LINK WHATSAPP:');
  qrcode.generate(qr, { small: true });
  console.log('======================================\n');
});

whatsappClient.on('ready', () => {
  isWhatsAppReady = true;
  console.log('WhatsApp client is ready and connected!');
});

whatsappClient.on('auth_failure', msg => {
  console.error('WhatsApp authentication failure:', msg);
});

whatsappClient.initialize();


// Load environment variables from .env file if it exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
          process.env[key] = value;
        }
      }
    });
  } catch (err) {
    console.error('Error loading .env file:', err);
  }
}

const PORT = process.env.PORT || 8080;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

const server = http.createServer((req, res) => {
  // CORS Headers for Dev Server compatibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // API Endpoint for Newsletter Subscription
  if (pathname === '/api/subscribe' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { email } = JSON.parse(body);
        if (!email) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Email address is required' }));
          return;
        }

        const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
        const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
        const smtpUser = process.env.SMTP_USER || 'bhimeswarbhimeswar@gmail.com';
        const smtpPass = process.env.SMTP_PASS || 'mfvkgopaihbmgjpq';
        const smtpFrom = process.env.SMTP_FROM || `"OG FITNESS" <bhimeswarbhimeswar@gmail.com>`;

        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });

        await transporter.sendMail({
          from: smtpFrom,
          to: email,
          subject: 'Welcome to OG FITNESS Elite Newsletter',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #222; border-radius: 12px; background-color: #0d0d0d; color: #ffffff;">
                <div style="text-align: center; border-bottom: 2px solid #E10600; padding-bottom: 20px; margin-bottom: 25px;">
                    <span style="font-size: 28px; font-weight: bold; letter-spacing: 2px; color: #FFFFFF;">OG<span style="color: #E10600;">FITNESS</span></span>
                </div>
                <h2 style="color: #FFFFFF; font-size: 20px; text-align: center;">Welcome to the Elite Newsletter!</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #a3a3a3; text-align: center;">
                    Thank you for subscribing, OG! You are now locked in to receive our high-performance training newsletters, VIP event invites, and exclusive guides.
                </p>
                <div style="background-color: #1a1a1a; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0; border: 1px solid #333;">
                    <span style="font-size: 18px; font-weight: bold; color: #E10600;">YOUR VIP SUBSCRIPTION IS ACTIVE</span>
                </div>
                <p style="font-size: 14px; line-height: 1.5; color: #737373; text-align: center;">
                    Unleash the OG in you.
                </p>
                <div style="border-top: 1px solid #222; padding-top: 15px; margin-top: 25px; text-align: center; font-size: 12px; color: #525252;">
                    Sent by OG FITNESS. If you did not request this, please ignore this email.
                </div>
            </div>
          `
        });

        console.log(`Successfully sent newsletter subscription email to ${email}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error('Failed to send newsletter email:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to send email: ' + err.message }));
      }
    });
    return;
  }

  // API Endpoint for Book Pass Registration (automated WhatsApp sender)
  if (pathname === '/api/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { name, mobile, goal, message } = JSON.parse(body);
        if (!name || !mobile) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Name and mobile number are required' }));
          return;
        }

        // Sanitize phone number to digits only (except +)
        let cleanPhone = mobile.replace(/[^\d+]/g, '');
        if (!cleanPhone.startsWith('+')) {
          if (cleanPhone.length === 10) {
            cleanPhone = '+91' + cleanPhone;
          } else {
            cleanPhone = '+' + cleanPhone;
          }
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
        const hasTwilio = accountSid && authToken;

        const whatsAppText = `Hey ${name}! What's up? Here is your 1-Day Elite Pass to visit OG FITNESS Gym. Show this message at the desk to claim your entry. Unleash the OG in you!`;

        let twilioSent = false;
        let twilioError = null;
        let localSent = false;
        let localError = null;

        // Try local WhatsApp client first
        if (isWhatsAppReady) {
          try {
            const formattedNumber = cleanPhone.replace('+', '') + '@c.us';
            await whatsappClient.sendMessage(formattedNumber, whatsAppText);
            localSent = true;
            console.log(`Successfully sent WhatsApp message to ${formattedNumber} from linked local account.`);
          } catch (err) {
            localError = err.message;
            console.error(`Local WhatsApp send failed: ${err.message}`);
          }
        }

        // Fall back to Twilio if local client is not ready
        if (!localSent && hasTwilio) {
          try {
            const authString = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
            const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: new URLSearchParams({
                From: fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`,
                To: `whatsapp:${cleanPhone}`,
                Body: whatsAppText
              })
            });

            const data = await twilioRes.json();
            if (twilioRes.ok) {
              twilioSent = true;
              console.log(`Successfully sent WhatsApp message to ${cleanPhone} via Twilio: ${data.sid}`);
            } else {
              twilioError = data.message;
              console.error(`Twilio API error: ${data.message}`);
            }
          } catch (err) {
            twilioError = err.message;
            console.error(`Twilio fetch connection failed: ${err.message}`);
          }
        }

        const sentSuccessfully = localSent || twilioSent;

        // Console log representation (always logs for verification visibility)
        console.log('\n======================================');
        console.log('[AUTOMATED WHATSAPP OUTBOX]');
        console.log(`To: whatsapp:${cleanPhone}`);
        console.log(`Message: ${whatsAppText}`);
        console.log(`Local Sent: ${localSent} ${localError ? `| Error: ${localError}` : ''}`);
        console.log(`Twilio Active: ${!!hasTwilio} | Twilio Sent: ${twilioSent} ${twilioError ? `| Error: ${twilioError}` : ''}`);
        console.log('======================================\n');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          whatsappSent: sentSuccessfully,
          useFallbackRedirect: !sentSuccessfully
        }));
      } catch (err) {
        console.error('Registration processing failed:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    });
    return;
  }

  // Serve static files from the 'dist' directory
  let filePath = path.join(__dirname, 'dist', pathname);
  if (pathname === '/') {
    filePath = path.join(__dirname, 'dist', 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(__dirname, 'dist', 'index.html'), (errHtml, contentHtml) => {
          if (errHtml) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(contentHtml, 'utf-8');
          }
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`OG Fitness Server running securely on http://localhost:${PORT}`);
});
