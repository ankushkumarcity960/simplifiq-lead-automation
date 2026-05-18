import { Router } from 'express';
import { enrichCompany } from '../services/enrichment.js';
import { generateReport } from '../services/reportGenerator.js';
import { sendReportEmail } from '../services/emailer.js';
import { logToSheets, archiveToDrive } from '../services/googleIntegrations.js';
import { logToCSV } from "../services/csvLogger.js";


const router = Router();

/**
 * POST /api/lead
 * Body: { name, email, company, website, industry, employees, painPoints, role }
 */
router.post('/', async (req, res) => {
  const { name, email, company, website, industry, employees, painPoints, role } = req.body;

  // ── Validation ────────────────────────────────────────────────────
// Validation
// Validation
const missing =
['name','email','company']
.filter(
 f => !req.body[f]?.trim()
);

if(missing.length){

return res.status(400).json({
error:
`Missing required fields:
${missing.join(', ')}`
});

}

// Email validation
if(
!/^[^\s@]+@[^\s@]+\.[^\s@]+$/
.test(email)
){

return res.status(400).json({
error:
'Invalid email address.'
});

}

// Website validation
if(

website &&

!/^https?:\/\/.+\..+/
.test(website)

){

return res.status(400).json({

error:
'Website must start with http:// or https://'

});

}
  const lead = { name, email, company, website: website || '', industry: industry || '', employees: employees || '', painPoints: painPoints || '', role: role || '' };

  // Respond immediately so the user knows the form was received
  res.json({
    success: true,
    message: `Thank you, ${name}! We're researching ${company} now and will email your personalised audit within a few minutes.`,
  });

  // ── Run pipeline async (don't block the HTTP response) ────────────
  runPipeline(lead).catch(err =>
    console.error(`[Pipeline] Fatal error for ${email}:`, err)
  );
});

async function runPipeline(lead) {
  const startedAt = new Date().toISOString();
let reportStatus = 'failed';
let pdfPath = null;

  try {
    // 1. Enrich
    console.log(`[Pipeline] Enriching ${lead.company}…`);
    const enriched = await enrichCompany(lead);

    // 2. Generate PDF report
    console.log(`[Pipeline] Generating PDF report for ${lead.company}…`);
    pdfPath =await generateReport({lead, enriched});

    // 3. Send email
    console.log(`[Pipeline] Sending report to ${lead.email}…`);
    await sendReportEmail({ lead, pdfPath });

    reportStatus = 'sent';
    console.log(`[Pipeline] ✅  Done for ${lead.email}`);
  } catch (err) {
    console.error(`[Pipeline] Error:`, err.message);
  }

  // 4. BONUS — Sheets + Drive (best-effort, won't crash the pipeline)
try {

await logToCSV(
lead,
reportStatus
);

}
catch(e){

console.warn(
"[CSV] Failed:",
e.message
);

}

  try {
    if (
  reportStatus === 'sent'
  && pdfPath
) {

  await archiveToDrive(
    pdfPath,
    lead.company
  );

}
  } catch (e) {
    console.warn('[Drive] Skipped:', e.message);
  }
}

export default router;
