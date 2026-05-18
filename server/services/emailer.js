/**
 * emailer.js
 * Sends the personalised audit PDF to the prospect via Nodemailer (SMTP).
 * Works with Gmail (App Password), Brevo, Mailgun, Resend, etc.
 */

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}
export async function sendReportEmail({ lead, pdfPath }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[Email] SMTP credentials not configured — skipping email send.');
    return;
  }

  const transporter =createTransporter();

  const pdfBuffer = fs.readFileSync(pdfPath);
  const filename = `SimplifIQ_Audit_${lead.company.replace(/\W+/g, '_')}.pdf`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f7; margin: 0; padding: 0; }
  .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  .header { background: #1a1a2e; padding: 36px 40px; }
  .header h1 { color: #fff; font-size: 24px; margin: 0 0 4px; }
  .header h1 span { color: #c9a84c; }
  .header p { color: #ffffff80; font-size: 13px; margin: 0; }
  .body { padding: 36px 40px; }
  .body h2 { color: #1a1a2e; font-size: 20px; margin: 0 0 16px; }
  .body p { color: #555; font-size: 14px; line-height: 1.7; margin: 0 0 14px; }
  .cta { display: inline-block; background: #c9a84c; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 8px 0 24px; }
  .card { background: #f8f8fc; border-left: 3px solid #c9a84c; border-radius: 6px; padding: 16px 20px; margin-bottom: 20px; }
  .card p { margin: 0; font-size: 13px; }
  .footer { background: #f0f0f5; padding: 20px 40px; font-size: 12px; color: #999; text-align: center; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>Simplif<span>IQ</span></h1>
    <p>AI Intelligence Platform</p>
  </div>
  <div class="body">
    <h2>Hi ${lead.name}, your audit is ready 🎉</h2>
    <p>Thank you for your interest in SimplifIQ. We've completed a personalised <strong>AI Readiness &amp; Growth Audit</strong> for <strong>${lead.company}</strong> — and we're excited to share what we found.</p>
    <p>Your full report is attached to this email as a PDF. Inside you'll find:</p>
    <ul style="color:#555;font-size:14px;line-height:2;">
      <li>An executive summary of ${lead.company}'s current position</li>
      <li>Your AI Readiness Score, benchmarked against your industry</li>
      <li>A strategic analysis tied to your specific pain points</li>
      <li>Prioritised recommendations with expected ROI</li>
    </ul>
    <div class="card">
      <p>💡 <strong>Most companies at this stage see results within 60–90 days</strong> of implementing even one of our recommended solutions. Let's talk about what that looks like for ${lead.company}.</p>
    </div>
    <a class="cta" href="mailto:${process.env.FROM_EMAIL || process.env.SMTP_USER}?subject=Let's%20talk%20—%20${encodeURIComponent(lead.company)}">Book a Strategy Call</a>
    <p style="color:#999;font-size:12px;">Or simply reply to this email — we respond within one business day.</p>
  </div>
  <div class="footer">
    This report was generated automatically by SimplifIQ for ${lead.email}.<br/>
    © ${new Date().getFullYear()} SimplifIQ · All rights reserved.
  </div>
</div>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || `"SimplifIQ" <${process.env.SMTP_USER}>`,
    to: lead.email,
    subject: `Your ${lead.company} AI Audit is Ready — SimplifIQ`,
    html: htmlBody,
    attachments: [
      {
        filename,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });

  console.log(`[Email] Sent to ${lead.email}`);
}
