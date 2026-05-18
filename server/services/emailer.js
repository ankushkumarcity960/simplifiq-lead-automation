import { Resend } from 'resend';
import fs from 'fs';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReportEmail({ lead, pdfPath }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not configured — skipping.');
    return;
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  const filename = `SimplifIQ_Audit_${lead.company.replace(/\W+/g, '_')}.pdf`;

  await resend.emails.send({
    from: 'SimplifIQ <onboarding@resend.dev>',
    to: lead.email,
    subject: `Your ${lead.company} AI Audit is Ready — SimplifIQ`,
    html: `<h2>Hi ${lead.name}, your audit is ready 🎉</h2>
           <p>Your personalised AI Readiness & Growth Audit for <strong>${lead.company}</strong> is attached.</p>
           <p>Reply to this email to book a free strategy call.</p>`,
    attachments: [{
      filename,
      content: pdfBuffer.toString('base64'),
    }],
  });

  console.log(`[Email] Sent to ${lead.email}`);
}