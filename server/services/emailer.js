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

  try {

    const response =
      await resend.emails.send({

      from:
      process.env.FROM_EMAIL ||
      'SimplifIQ <onboarding@resend.dev>',

      to: lead.email,

      subject:
      `Your ${lead.company} AI Audit is Ready — SimplifIQ`,

      html: `
      <div style="
        font-family:Arial;
        max-width:600px;
        margin:auto;
        padding:20px;
      ">

      <h2>
      Hi ${lead.name} 🎉
      </h2>

      <p>
      Your personalised
      <strong>AI Audit Report</strong>
      for
      <strong>${lead.company}</strong>
      is ready.
      </p>

      <p>
      The PDF report is attached.
      </p>

      <p>
      Thanks for trying
      <strong>SimplifIQ</strong>.
      </p>

      </div>
      `,

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

    console.log(response);

  } catch(err){

    console.error(
      '[Email] Failed:',
      err.message
    );

    throw err;
  }

}