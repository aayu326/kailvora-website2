const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));  // serve kailvora-infra.html

// ── Nodemailer transporter ──
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,    // thereliableestates25@gmail.com
    pass: process.env.GMAIL_PASS,    // 16-digit App Password
  },
});

// ── POST /send ──
app.post('/send', async (req, res) => {
  const { name, phone, email, service, message } = req.body;

  if (!name || !phone || !email) {
    return res.json({ success: false, error: 'Missing required fields' });
  }

  // ── Email to Kailvora (you receive this) ──
  const toKailvora = {
    from: `"Kailvora Website" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: `📩 New Inquiry from ${name} — Kailvora Infra Website`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;border-radius:10px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#0a1628,#122040);padding:30px;text-align:center;">
          <h1 style="color:#c8973a;margin:0;font-size:24px;">Kailvora Infra</h1>
          <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px;">New Website Inquiry</p>
        </div>
        <div style="padding:30px;background:white;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:12px;background:#f5f5f5;font-weight:bold;color:#0a1628;width:140px;border-radius:6px 0 0 6px;">👤 Name</td><td style="padding:12px;color:#333;">${name}</td></tr>
            <tr><td style="padding:12px;font-weight:bold;color:#0a1628;">📞 Phone</td><td style="padding:12px;color:#333;">${phone}</td></tr>
            <tr><td style="padding:12px;background:#f5f5f5;font-weight:bold;color:#0a1628;">📧 Email</td><td style="padding:12px;background:#f5f5f5;color:#333;">${email}</td></tr>
            <tr><td style="padding:12px;font-weight:bold;color:#0a1628;">🏠 Service</td><td style="padding:12px;color:#333;">${service || 'Not specified'}</td></tr>
            <tr><td style="padding:12px;background:#f5f5f5;font-weight:bold;color:#0a1628;">💬 Message</td><td style="padding:12px;background:#f5f5f5;color:#333;">${message || 'No message'}</td></tr>
          </table>
          <div style="margin-top:24px;padding:16px;background:linear-gradient(135deg,#f0f7f3,#e8f4ee);border-radius:8px;border-left:4px solid #c8973a;">
            <p style="margin:0;color:#0a1628;font-size:13px;"><strong>Action Required:</strong> Reply to this inquiry within 24 hours.</p>
          </div>
        </div>
        <div style="padding:16px;background:#f5f5f5;text-align:center;">
          <p style="margin:0;color:#888;font-size:12px;">© 2026 Kailvora Infra Private Limited | CIN: U68100HR2026PTC146137</p>
        </div>
      </div>
    `,
  };

  // ── Auto-reply to client ──
  const toClient = {
    from: `"Kailvora Infra" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Thank you for contacting Kailvora Infra, ${name}!`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;border-radius:10px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#0a1628,#122040);padding:30px;text-align:center;">
          <h1 style="color:#c8973a;margin:0;font-size:24px;">Kailvora Infra</h1>
          <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px;">Private Limited</p>
        </div>
        <div style="padding:30px;background:white;">
          <h2 style="color:#0a1628;margin-top:0;">Hello, ${name}! 👋</h2>
          <p style="color:#555;line-height:1.7;">Thank you for reaching out to <strong>Kailvora Infra Private Limited</strong>. We have received your inquiry and our team will get back to you within <strong>24 business hours</strong>.</p>
          <div style="background:linear-gradient(135deg,#f0f7f3,#e8f4ee);padding:20px;border-radius:8px;border-left:4px solid #c8973a;margin:20px 0;">
            <p style="margin:0;color:#0a1628;font-weight:bold;">Your Inquiry Summary:</p>
            <p style="margin:8px 0 0;color:#555;font-size:14px;">Service Interest: <strong>${service || 'General Inquiry'}</strong></p>
          </div>
          <p style="color:#555;line-height:1.7;">In the meantime, feel free to reach us directly:</p>
          <p style="color:#555;">📞 <strong>+91 9213903156</strong></p>
          <p style="color:#555;">📧 <strong>thereliableestates25@gmail.com</strong></p>
          <p style="color:#555;">📍 <strong>Farrukh Nagar, Gurugram, Haryana – 122506</strong></p>
        </div>
        <div style="padding:20px;background:linear-gradient(135deg,#0a1628,#122040);text-align:center;">
          <p style="margin:0;color:rgba(255,255,255,0.6);font-size:12px;">Creating Landmarks with Vision and Values</p>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.4);font-size:11px;">© 2026 Kailvora Infra Pvt Ltd | CIN: U68100HR2026PTC146137</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(toKailvora);
    await transporter.sendMail(toClient);
    console.log(`✅ Emails sent for inquiry from ${name} (${email})`);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Email error:', err.message);
    res.json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Kailvora Server running at http://localhost:${PORT}`);
  console.log(`📄 Website: http://localhost:${PORT}/kailvora-infra.html`);
  console.log(`📧 Emails will be sent via: ${process.env.GMAIL_USER || 'CHECK .env FILE'}\n`);
});
