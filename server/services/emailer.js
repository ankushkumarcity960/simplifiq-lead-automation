import { Resend } from 'resend';
import fs from 'fs';

export async function sendReportEmail({ lead, pdfPath }) {

  if (!process.env.RESEND_API_KEY) {
    console.warn(
      '[Email] RESEND_API_KEY missing — skipping.'
    );
    return;
  }

  const resend =
    new Resend(process.env.RESEND_API_KEY);

  const pdfBuffer =
    fs.readFileSync(pdfPath);

  const filename =
`SimplifIQ_Audit_${
lead.company.replace(/\W+/g,'_')
}.pdf`;

  await resend.emails.send({

    from:
'SimplifIQ <onboarding@resend.dev>',

    to: lead.email,

    subject:
`Your ${lead.company}
AI Audit is Ready`,

    html:
`<h2>Hi ${lead.name} 🎉</h2>
<p>Your audit for
<strong>${lead.company}</strong>
is attached.</p>`,

    attachments: [
      {
        filename,
        content:
pdfBuffer.toString('base64')
      }
    ]

  });

  console.log(
`[Email] Sent to ${lead.email}`
);

}