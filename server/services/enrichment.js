/**
 * enrichment.js
 * Combines lightweight web scraping (Cheerio) with Claude AI to build a rich
 * company profile from publicly available information.
 */
import dotenv from "dotenv";
dotenv.config();
import axios from 'axios';
import * as cheerio from 'cheerio';

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});
// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Fetch the homepage text of a website (best-effort).
 */
async function scrapeWebsite(url) {
  if (!url) return '';
  const normalized = url.startsWith('http') ? url : `https://${url}`;
  try {
    const { data } = await axios.get(normalized, {
      timeout: 10_000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SimplifIQ/1.0)' },
    });
    const $ = cheerio.load(data);
    // Remove boilerplate tags
    $('script, style, noscript, nav, footer, header').remove();
    // Grab meaningful text
    const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 4000);
    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content') || '';
    return `Page title: ${title}\nMeta description: ${description}\n\nBody excerpt:\n${text}`;
  } catch (err) {
    console.warn(`[Scrape] Could not fetch ${url}: ${err.message}`);
    return '';
  }
}

/**
 * Ask Claude to synthesise everything we know into a structured profile.
 */
async function callLLM(systemPrompt, userPrompt) {
  const chat = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  });

  return chat.choices[0].message.content;
}

// ── Main export ────────────────────────────────────────────────────────────

/**
 * Enrich a lead's company data.
 * Returns a structured JS object with all the info we'll use in the report.
 */
export async function enrichCompany(lead) {
  const websiteContent = await scrapeWebsite(lead.website);

  const systemPrompt = `You are a senior business intelligence analyst. 
Your job is to produce a detailed, accurate company profile based on the information provided.
Respond ONLY with a valid JSON object — no markdown, no explanation, no backticks.
If you cannot determine a field with confidence, use null.`;

  const userPrompt = `Analyse this company and return a JSON profile:

Company name: ${lead.company}
Website: ${lead.website || 'not provided'}
Industry: ${lead.industry || 'unknown'}
Approximate employees: ${lead.employees || 'unknown'}
Contact role: ${lead.role || 'unknown'}
Pain points mentioned by contact: ${lead.painPoints || 'none provided'}

Website content scraped:
${websiteContent || '(website not accessible or not provided)'}

Return JSON with exactly these keys:
{
  "companyOverview": "2-3 sentence description of what this company does",
  "industry": "specific industry/sector",
  "estimatedSize": "size category: micro/small/medium/large/enterprise",
  "targetMarket": "who their customers are",
  "valueProposition": "their core value proposition",
  "keyProducts": ["product1", "product2"],
  "competitiveAdvantages": ["advantage1", "advantage2"],
  "technologiesDetected": ["tech1", "tech2"],
  "growthStage": "startup/growth/mature/enterprise",
  "painPointsAnalysis": "analysis of stated pain points in context of their business",
  "opportunityAreas": ["area where AI/automation could help 1", "area 2", "area 3"],
  "industryTrends": ["relevant trend 1", "relevant trend 2"],
  "potentialROI": "estimated impact area if they adopt AI/automation",
  "recommendedSolutions": ["specific recommendation 1", "specific recommendation 2", "recommendation 3"],
  "executiveSummary": "3-4 sentences that would open a business audit report for this company",
  "dataConfidence": "high/medium/low — how much data was available"
}`;

  let enriched = {};
  try {
    const raw = await callLLM(systemPrompt, userPrompt);
// Groq wraps responses in ```json ... ``` — strip them
const cleaned = raw
  .replace(/^```(?:json)?\s*/i, '')
  .replace(/\s*```\s*$/, '')
  .trim();
enriched = JSON.parse(cleaned);
  } catch (err) {
    console.warn('[Enrich] Claude parse failed, using fallback:', err.message);
    // Graceful fallback with minimal data
    enriched = {
      companyOverview: `${lead.company} is a ${lead.industry || 'business'} company.`,
      industry: lead.industry || 'Technology',
      estimatedSize: lead.employees ? categoriseSize(lead.employees) : 'small',
      targetMarket: 'B2B clients',
      valueProposition: 'Delivering value to their clients',
      keyProducts: [],
      competitiveAdvantages: [],
      technologiesDetected: [],
      growthStage: 'growth',
      painPointsAnalysis: lead.painPoints || 'Not specified.',
      opportunityAreas: ['Process automation', 'Data analytics', 'Customer engagement'],
      industryTrends: ['AI adoption', 'Digital transformation'],
      potentialROI: 'Significant efficiency gains through automation',
      recommendedSolutions: ['AI-powered workflows', 'Intelligent document processing', 'Automated reporting'],
      executiveSummary: `This audit has been prepared for ${lead.company}. Our analysis identifies several high-impact opportunities for operational improvement and growth acceleration.`,
      dataConfidence: 'low',
    };
  }

  return enriched;
}

function categoriseSize(employees) {
  const n = parseInt(employees, 10);
  if (isNaN(n)) return 'small';
  if (n < 10) return 'micro';
  if (n < 50) return 'small';
  if (n < 250) return 'medium';
  if (n < 1000) return 'large';
  return 'enterprise';
}
