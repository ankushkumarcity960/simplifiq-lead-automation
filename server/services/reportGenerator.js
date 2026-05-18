/**
 * reportGenerator.js
 * Generates a visually stunning, personalised audit PDF using Puppeteer.
 * The report is first rendered as HTML (with embedded CSS), then printed to PDF.
 */

import dotenv from "dotenv";
dotenv.config();

import puppeteer from 'puppeteer';
import path from 'path';
import os from 'os';
import fs from 'fs';

import Groq from "groq-sdk";

const groq = new Groq({
 apiKey: process.env.GROQ_API_KEY
});





// ─────────────────────────────────────────────
// Generate AI narrative for report
// ─────────────────────────────────────────────

async function generateInsightNarrative(
  lead,
  enriched
) {

  try {

    const prompt = `

Write a detailed strategic audit narrative.

Company:
${lead.company}

Contact:
${lead.name}
(${lead.role || "representative"})

Industry:
${enriched.industry}

Growth Stage:
${enriched.growthStage}

Overview:
${enriched.companyOverview}

Pain Points:
${enriched.painPointsAnalysis}

Opportunities:
${(enriched.opportunityAreas || [])
.join(", ")}

Write:

1. Current state assessment

2. Opportunity analysis

3. Strategic roadmap

Approx:
250 words

`;

    const response =
      await groq.chat.completions.create({

      model: "llama-3.1-8b-instant",

      messages: [

        {
          role:
          "system",

          content:
          "You are a senior business consultant creating AI readiness reports."
        },

        {
          role:
          "user",

          content:
          prompt
        }

      ],

      temperature:
      0.7

    });


    return response
      .choices[0]
      .message
      .content;


  } catch(err){

    console.log(
      "Groq failed:",
      err.message
    );


    return `

${enriched.executiveSummary}

Primary opportunities:

${(enriched.opportunityAreas || [])
.slice(0,2)
.join(" and ")}

Recommended first step:

${(
enriched.recommendedSolutions
||
["Process automation"]
)[0]}

Expected ROI:

${enriched.potentialROI}

`;

  }

}

function formatDate(d = new Date()) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function scoreCard(label, score, color) {
  const pct = Math.min(100, Math.max(0, score));
  return `
    <div class="score-card">
      <div class="score-label">${label}</div>
      <div class="score-bar-wrap">
        <div class="score-bar" style="width:${pct}%; background:${color};"></div>
      </div>
      <div class="score-value">${pct}%</div>
    </div>`;
}

function pillList(items = [], color = '#0ea5e9') {
  if (!items.length) return '<span class="muted">Not identified</span>';
  return items.map(i => `<span class="pill" style="--pill-color:${color}">${i}</span>`).join('');
}

// ── HTML Template ──────────────────────────────────────────────────────────

function buildHTML({ lead, enriched, narrative }) {
  const date = formatDate();
  const confidence = enriched.dataConfidence || 'medium';
  const confidenceColor = confidence === 'high' ? '#22c55e' : confidence === 'medium' ? '#f59e0b' : '#ef4444';

  // Derive "readiness scores" from the enriched data
  const automationScore = enriched.opportunityAreas?.length >= 3 ? 78 : 60;
  const growthScore = enriched.growthStage === 'enterprise' ? 85 : enriched.growthStage === 'growth' ? 72 : 55;
  const techScore = enriched.technologiesDetected?.length >= 3 ? 70 : 50;
  const marketScore = enriched.targetMarket ? 65 : 45;

  const narrativeParagraphs = narrative.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;0,700;1,300&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #0a0a0f;
    --ink-2: #3d3d4d;
    --ink-3: #8888a0;
    --bg: #fafaf8;
    --accent: #1a1a2e;
    --gold: #c9a84c;
    --gold-light: #f0d98a;
    --blue: #0ea5e9;
    --green: #22c55e;
    --red: #ef4444;
    --border: #e5e5ec;
    --card-bg: #ffffff;
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--ink);
    font-size: 10.5pt;
    line-height: 1.65;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Cover Page ── */
  .cover {
    background: var(--accent);
    color: #fff;
    min-height: 297mm;
    padding: 0;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    page-break-after: always;
  }
  .cover-deco {
    position: absolute;
    top: -60px; right: -60px;
    width: 420px; height: 420px;
    border-radius: 50%;
    background: radial-gradient(circle at 60% 40%, #c9a84c33, transparent 70%);
    border: 1px solid #c9a84c22;
  }
  .cover-deco-2 {
    position: absolute;
    bottom: 40px; left: -80px;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: radial-gradient(circle, #0ea5e922, transparent 70%);
  }
  .cover-top {
    padding: 40px 50px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .brand { font-family: 'Fraunces', serif; font-size: 22pt; letter-spacing: -0.5px; color: #fff; }
  .brand span { color: var(--gold); }
  .cover-badge {
    font-size: 7.5pt; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
    border: 1px solid #c9a84c55; color: var(--gold-light); padding: 5px 12px; border-radius: 20px;
  }
  .cover-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 50px;
  }
  .cover-eyebrow {
    font-size: 8pt; letter-spacing: 3px; text-transform: uppercase; color: var(--gold);
    margin-bottom: 18px; font-weight: 600;
  }
  .cover-title {
    font-family: 'Fraunces', serif;
    font-size: 38pt; font-weight: 700;
    line-height: 1.1; color: #fff;
    margin-bottom: 10px;
  }
  .cover-company {
    font-family: 'Fraunces', serif;
    font-size: 26pt; font-weight: 300; font-style: italic;
    color: var(--gold-light);
    margin-bottom: 40px;
  }
  .cover-divider { width: 60px; height: 2px; background: var(--gold); margin-bottom: 32px; }
  .cover-meta { display: flex; gap: 40px; }
  .cover-meta-item label { display: block; font-size: 7.5pt; letter-spacing: 2px; text-transform: uppercase; color: #ffffff60; margin-bottom: 3px; }
  .cover-meta-item span { font-size: 10pt; font-weight: 500; color: #fff; }
  .cover-footer {
    padding: 24px 50px;
    border-top: 1px solid #ffffff15;
    font-size: 7.5pt; color: #ffffff40; letter-spacing: 0.5px;
    display: flex; justify-content: space-between;
  }

  /* ── Pages ── */
  .page {
    padding: 44px 50px;
    page-break-after: always;
    min-height: 297mm;
    position: relative;
  }
  .page:last-child { page-break-after: avoid; }

  .page-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 32px; padding-bottom: 16px;
    border-bottom: 1.5px solid var(--border);
  }
  .page-brand { font-family: 'Fraunces', serif; font-size: 12pt; color: var(--ink-3); }
  .page-brand b { color: var(--accent); }
  .page-num { font-size: 8pt; color: var(--ink-3); letter-spacing: 1px; }

  .section-title {
    font-family: 'Fraunces', serif;
    font-size: 18pt; font-weight: 600; color: var(--accent);
    margin-bottom: 6px; line-height: 1.2;
  }
  .section-sub {
    font-size: 9pt; color: var(--ink-3); margin-bottom: 24px; font-weight: 400;
  }

  /* ── Cards & Grid ── */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 20px; }

  .card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .card-label {
    font-size: 7.5pt; letter-spacing: 2px; text-transform: uppercase;
    color: var(--ink-3); font-weight: 600; margin-bottom: 8px;
  }
  .card-value {
    font-size: 12pt; font-weight: 600; color: var(--ink); line-height: 1.3;
  }
  .card-value.large { font-size: 22pt; font-family: 'Fraunces', serif; }
  .card-accent { border-left: 3px solid var(--gold); }
  .card-blue { border-left: 3px solid var(--blue); }
  .card-green { border-left: 3px solid var(--green); }

  /* ── Score bars ── */
  .score-card { margin-bottom: 14px; }
  .score-label { font-size: 9pt; font-weight: 500; color: var(--ink-2); margin-bottom: 5px; }
  .score-bar-wrap { background: #f0f0f5; border-radius: 4px; height: 8px; position: relative; overflow: hidden; }
  .score-bar { height: 100%; border-radius: 4px; transition: width 0.3s; }
  .score-value { font-size: 8pt; color: var(--ink-3); margin-top: 3px; text-align: right; }

  /* ── Pills ── */
  .pill {
    display: inline-block;
    padding: 4px 12px; margin: 3px;
    border-radius: 20px;
    font-size: 8.5pt; font-weight: 500;
    background: color-mix(in srgb, var(--pill-color) 12%, white);
    color: color-mix(in srgb, var(--pill-color) 80%, #0a0a0f);
    border: 1px solid color-mix(in srgb, var(--pill-color) 25%, transparent);
  }

  /* ── Narrative ── */
  .narrative-box {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 28px 32px;
    margin-bottom: 20px;
  }
  .narrative-box p { color: var(--ink-2); margin-bottom: 14px; font-size: 10pt; line-height: 1.75; }
  .narrative-box p:last-child { margin-bottom: 0; }

  /* ── Recommendation list ── */
  .reco-list { list-style: none; }
  .reco-list li {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 14px 18px; margin-bottom: 10px;
    background: var(--card-bg); border: 1px solid var(--border);
    border-radius: 8px;
  }
  .reco-num {
    flex-shrink: 0; width: 26px; height: 26px;
    background: var(--accent); color: #fff;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 8.5pt; font-weight: 700;
  }
  .reco-text { font-size: 10pt; color: var(--ink-2); line-height: 1.5; }

  /* ── Callout ── */
  .callout {
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    color: #fff; border-radius: 12px;
    padding: 28px 32px; margin-bottom: 20px;
  }
  .callout-title { font-family: 'Fraunces', serif; font-size: 15pt; color: var(--gold-light); margin-bottom: 8px; }
  .callout p { color: #ffffffcc; font-size: 9.5pt; line-height: 1.7; }

  /* ── Footer ── */
  .page-footer {
    position: absolute; bottom: 24px; left: 50px; right: 50px;
    font-size: 7.5pt; color: var(--ink-3);
    display: flex; justify-content: space-between;
    border-top: 1px solid var(--border); padding-top: 10px;
  }

  .muted { color: var(--ink-3); font-style: italic; }
  .highlight { color: var(--accent); font-weight: 600; }
  .tag { font-size: 7.5pt; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; color: var(--gold); }
  .divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }
</style>
</head>
<body>

<!-- ═══════════════ COVER PAGE ═══════════════ -->
<div class="cover">
  <div class="cover-deco"></div>
  <div class="cover-deco-2"></div>

  <div class="cover-top">
    <div class="brand">Simplif<span>IQ</span></div>
    <div class="cover-badge">Confidential · AI Audit</div>
  </div>

  <div class="cover-body">
    <div class="cover-eyebrow">Personalised Business Intelligence Report</div>
    <div class="cover-title">AI Readiness<br>&amp; Growth Audit</div>
    <div class="cover-company">${lead.company}</div>
    <div class="cover-divider"></div>
    <div class="cover-meta">
      <div class="cover-meta-item">
        <label>Prepared for</label>
        <span>${lead.name}${lead.role ? ', ' + lead.role : ''}</span>
      </div>
      <div class="cover-meta-item">
        <label>Industry</label>
        <span>${enriched.industry || lead.industry || 'N/A'}</span>
      </div>
      <div class="cover-meta-item">
        <label>Report Date</label>
        <span>${date}</span>
      </div>
      <div class="cover-meta-item">
        <label>Data Confidence</label>
        <span style="color:${confidenceColor}">${confidence.toUpperCase()}</span>
      </div>
    </div>
  </div>

  <div class="cover-footer">
    <span>SimplifIQ Intelligence Platform · Automated Report</span>
    <span>${lead.email}</span>
  </div>
</div>

<!-- ═══════════════ PAGE 2 — EXECUTIVE SUMMARY ═══════════════ -->
<div class="page">
  <div class="page-header">
    <div class="page-brand">Simplif<b>IQ</b> · ${lead.company}</div>
    <div class="page-num">01 / EXECUTIVE SUMMARY</div>
  </div>

  <div class="section-title">Executive Summary</div>
  <div class="section-sub">High-level overview of ${lead.company}'s current position and AI opportunity landscape</div>

  <div class="callout">
    <div class="callout-title">Strategic Overview</div>
    <p>${enriched.executiveSummary || `This report provides a comprehensive AI readiness and growth audit for ${lead.company}. Our analysis draws on publicly available information, your submitted profile, and SimplifIQ's industry benchmarking data.`}</p>
  </div>

  <div class="grid-3">
    <div class="card card-accent">
      <div class="card-label">Company Stage</div>
      <div class="card-value">${(enriched.growthStage || 'growth').charAt(0).toUpperCase() + (enriched.growthStage || 'growth').slice(1)}</div>
    </div>
    <div class="card card-blue">
      <div class="card-label">Company Size</div>
      <div class="card-value">${(enriched.estimatedSize || 'small').charAt(0).toUpperCase() + (enriched.estimatedSize || 'small').slice(1)}</div>
    </div>
    <div class="card card-green">
      <div class="card-label">Target Market</div>
      <div class="card-value">${enriched.targetMarket || 'B2B'}</div>
    </div>
  </div>

  <div class="card" style="margin-bottom:20px;">
    <div class="card-label">Company Overview</div>
    <p style="margin-top:8px; color:var(--ink-2); line-height:1.7;">${enriched.companyOverview || `${lead.company} is a ${lead.industry || 'technology'} company working to deliver value to its clients.`}</p>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-label">Core Value Proposition</div>
      <p style="margin-top:8px; color:var(--ink-2);">${enriched.valueProposition || 'Delivering excellence to clients.'}</p>
    </div>
    <div class="card">
      <div class="card-label">Key Products / Services</div>
      <div style="margin-top:8px;">${pillList(enriched.keyProducts, '#1a1a2e')}</div>
    </div>
  </div>

  <div class="page-footer">
    <span>Confidential — prepared exclusively for ${lead.name}</span>
    <span>SimplifIQ · ${date}</span>
  </div>
</div>

<!-- ═══════════════ PAGE 3 — AI READINESS ═══════════════ -->
<div class="page">
  <div class="page-header">
    <div class="page-brand">Simplif<b>IQ</b> · ${lead.company}</div>
    <div class="page-num">02 / AI READINESS</div>
  </div>

  <div class="section-title">AI Readiness Assessment</div>
  <div class="section-sub">Benchmarked against SimplifIQ's ${enriched.industry || 'industry'} database</div>

  <div class="grid-2">
    <div>
      ${scoreCard('Automation Potential', automationScore, '#c9a84c')}
      ${scoreCard('Growth Trajectory', growthScore, '#0ea5e9')}
      ${scoreCard('Tech Sophistication', techScore, '#22c55e')}
      ${scoreCard('Market Positioning', marketScore, '#8b5cf6')}
    </div>
    <div class="card" style="display:flex;flex-direction:column;justify-content:center;">
      <div class="card-label">Overall AI Readiness Score</div>
      <div class="card-value large" style="color:var(--gold);margin:10px 0;">${Math.round((automationScore + growthScore + techScore + marketScore) / 4)}<span style="font-size:14pt;color:var(--ink-3)">/100</span></div>
      <p style="font-size:9pt;color:var(--ink-3);line-height:1.6;">
        Based on our multi-factor model covering automation potential, tech stack maturity, growth stage, and market fit.
        ${lead.company} is well-positioned to benefit from targeted AI implementations.
      </p>
    </div>
  </div>

  <hr class="divider"/>

  <div class="section-title" style="font-size:14pt;margin-bottom:4px;">Technologies Detected</div>
  <div class="section-sub">Inferred from public website and digital footprint</div>
  <div style="margin-bottom:20px;">${pillList(enriched.technologiesDetected, '#0ea5e9')}</div>

  <div class="section-title" style="font-size:14pt;margin-bottom:4px;">Competitive Advantages</div>
  <div class="section-sub">Identified strengths to build upon</div>
  <div style="margin-bottom:20px;">${pillList(enriched.competitiveAdvantages, '#22c55e')}</div>

  <div class="section-title" style="font-size:14pt;margin-bottom:4px;">Industry Trends to Watch</div>
  <div class="section-sub">Macro forces shaping ${enriched.industry || 'your industry'} in 2024–2025</div>
  <div>${pillList(enriched.industryTrends, '#c9a84c')}</div>

  <div class="page-footer">
    <span>Confidential — prepared exclusively for ${lead.name}</span>
    <span>SimplifIQ · ${date}</span>
  </div>
</div>

<!-- ═══════════════ PAGE 4 — STRATEGIC NARRATIVE ═══════════════ -->
<div class="page">
  <div class="page-header">
    <div class="page-brand">Simplif<b>IQ</b> · ${lead.company}</div>
    <div class="page-num">03 / STRATEGIC ANALYSIS</div>
  </div>

  <div class="section-title">Strategic Analysis</div>
  <div class="section-sub">Personalised insights based on ${lead.company}'s profile and pain points</div>

  <div class="narrative-box">${narrativeParagraphs}</div>

  <div class="section-title" style="font-size:14pt;margin-bottom:4px;margin-top:20px;">Pain Point Analysis</div>
  <div class="section-sub">How your stated challenges map to solvable problems</div>

  <div class="card" style="margin-bottom:20px;">
    <div class="card-label">Submitted Pain Points → Our Assessment</div>
    <p style="margin-top:8px;color:var(--ink-2);line-height:1.75;">${enriched.painPointsAnalysis || 'No specific pain points were mentioned. Our recommendations are based on industry-standard challenges for companies at this stage.'}</p>
  </div>

  <div class="section-title" style="font-size:14pt;margin-bottom:4px;">Expected ROI Areas</div>
  <div class="card card-green">
    <div class="card-label">Potential Impact</div>
    <p style="margin-top:8px;color:var(--ink-2);">${enriched.potentialROI || 'Significant efficiency gains and cost reduction through targeted automation.'}</p>
  </div>

  <div class="page-footer">
    <span>Confidential — prepared exclusively for ${lead.name}</span>
    <span>SimplifIQ · ${date}</span>
  </div>
</div>

<!-- ═══════════════ PAGE 5 — RECOMMENDATIONS ═══════════════ -->
<div class="page">
  <div class="page-header">
    <div class="page-brand">Simplif<b>IQ</b> · ${lead.company}</div>
    <div class="page-num">04 / RECOMMENDATIONS</div>
  </div>

  <div class="section-title">Strategic Recommendations</div>
  <div class="section-sub">Prioritised action plan for ${lead.company}'s AI transformation journey</div>

  <div class="section-title" style="font-size:13pt;margin-bottom:12px;">Top Opportunity Areas</div>
  <div style="margin-bottom:24px;">${pillList(enriched.opportunityAreas, '#c9a84c')}</div>

  <div class="section-title" style="font-size:13pt;margin-bottom:12px;">Recommended Solutions</div>
  <ul class="reco-list">
    ${(enriched.recommendedSolutions || ['AI process automation', 'Intelligent data analytics', 'Automated customer engagement']).map((s, i) => `
      <li>
        <div class="reco-num">${i + 1}</div>
        <div class="reco-text">${s}</div>
      </li>`).join('')}
  </ul>

  <div class="callout" style="margin-top:24px;">
    <div class="callout-title">Why SimplifIQ?</div>
    <p>We specialise in deploying AI solutions tailored to ${enriched.industry || 'your industry'}-specific workflows. Our approach begins with a discovery session to validate these findings, followed by a phased implementation roadmap designed for your team's capacity and budget. Most clients see measurable results within 60–90 days of engagement.</p>
  </div>

  <div class="card card-accent" style="margin-top:16px;">
    <div class="card-label">Next Step</div>
    <p style="margin-top:6px;color:var(--ink-2);">Reply to this report email to schedule a complimentary 30-minute strategy call with a SimplifIQ consultant. We'll walk through these findings together and design a custom implementation plan for <strong>${lead.company}</strong>.</p>
  </div>

  <div class="page-footer">
    <span>Confidential — prepared exclusively for ${lead.name}</span>
    <span>SimplifIQ · ${date}</span>
  </div>
</div>

</body>
</html>`;
}

// ── Main export ────────────────────────────────────────────────────────────

export async function generateReport({ lead, enriched }) {
  const narrative = await generateInsightNarrative(lead, enriched);
  const html = buildHTML({ lead, enriched, narrative });

  const tmpDir = os.tmpdir();
  const pdfPath = path.join(tmpDir, `simplIfiq_${lead.company.replace(/\W+/g, '_')}_${Date.now()}.pdf`);

  // Write HTML to temp file for debugging (optional)
  const htmlPath = pdfPath.replace('.pdf', '.html');
  fs.writeFileSync(htmlPath, html);

const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--single-process',          // critical on Render's memory-limited containers
  ],
  timeout: 60000,
});

  try {
    const page = await browser.newPage();
await page.setContent(html, {
  waitUntil: 'load',
  timeout: 60000,
});   
await new Promise(r => setTimeout(r, 2000));


await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
    });
  } finally {
    await browser.close();
  }

  console.log(`[Report] PDF saved to ${pdfPath}`);
  return pdfPath;
}
