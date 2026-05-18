/**
 * googleIntegrations.js
 * BONUS features:
 *   - logToSheets: append lead data to a Google Sheet (live leads tracker)
 *   - archiveToDrive: upload generated PDF to a Google Drive folder
 *
 * Requires a Google Service Account JSON key with:
 *   - Editor access to the target Sheet
 *   - Writer access to the target Drive folder
 *
 * Setup:
 *   1. Go to Google Cloud Console → IAM → Service Accounts → Create
 *   2. Download the JSON key → save as google-service-account.json in /server
 *   3. Share your Sheet and Drive folder with the service account email
 *   4. Set GOOGLE_SERVICE_ACCOUNT_KEY_PATH, GOOGLE_SHEET_ID, GOOGLE_DRIVE_FOLDER_ID in .env
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';

// ── JWT / Auth ─────────────────────────────────────────────────────────────
// We implement a minimal JWT for Google OAuth2 without requiring googleapis SDK
// so the server has zero heavy peer dependencies for this bonus feature.

import { createSign } from 'crypto';

function loadServiceAccount() {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  if (!keyPath || !fs.existsSync(keyPath)) return null;
  return JSON.parse(fs.readFileSync(keyPath, 'utf8'));
}

async function getGoogleAccessToken(sa, scopes) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claim = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url');

  const signingInput = `${header}.${claim}`;
  const sign = createSign('RSA-SHA256');
  sign.update(signingInput);
  const sig = sign.sign(sa.private_key, 'base64url');
  const jwt = `${signingInput}.${sig}`;

  const { data } = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  }));
  return data.access_token;
}

// ── Sheets ─────────────────────────────────────────────────────────────────

export async function logToSheets({ lead, status, timestamp }) {
  const sa = loadServiceAccount();
  if (!sa || !process.env.GOOGLE_SHEET_ID) {
    console.log('[Sheets] Not configured — skipping.');
    return;
  }

  const token = await getGoogleAccessToken(sa, ['https://www.googleapis.com/auth/spreadsheets']);
  const sheetId = process.env.GOOGLE_SHEET_ID;

  // Ensure header row exists (append to sheet; Google will create it if needed)
  const values = [[
    lead.name,
    lead.email,
    lead.company,
    lead.website || '',
    lead.industry || '',
    lead.role || '',
    timestamp,
    status,
  ]];

  await axios.post(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:H:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    { values },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  console.log('[Sheets] Lead logged.');
}

// ── Drive ──────────────────────────────────────────────────────────────────

export async function archiveToDrive(pdfPath, companyName) {
  const sa = loadServiceAccount();
  if (!sa || !process.env.GOOGLE_DRIVE_FOLDER_ID) {
    console.log('[Drive] Not configured — skipping.');
    return;
  }

  const token = await getGoogleAccessToken(sa, ['https://www.googleapis.com/auth/drive.file']);
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const filename = path.basename(pdfPath);
  const fileBuffer = fs.readFileSync(pdfPath);

  // Multipart upload
  const boundary = 'simplIfiq_boundary';
  const metadata = JSON.stringify({ name: filename, parents: [folderId] });
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`),
    fileBuffer,
    Buffer.from(`\r\n--${boundary}--`),
  ]);

  await axios.post(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    }
  );

  console.log(`[Drive] ${filename} archived to Drive folder.`);
}
