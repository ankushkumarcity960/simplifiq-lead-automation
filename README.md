# SimplifIQ — AI Lead Intake & Automation System

> Capture a prospect’s company details → enrich with AI research → generate a personalised PDF audit → email it automatically. Zero human intervention.

## ✨ Features

- Lead intake form with frontend + backend validation
- Company enrichment using Groq LLMs
- Website scraping using Cheerio
- Automated PDF audit generation using Puppeteer
- Email delivery using Resend API
- CSV lead logging (`leads.csv`)
- Optional Google Sheets / Drive integration placeholders
- Fully deployed workflow (Vercel + Render)

---

## 🏗 Architecture

```txt
User Form Submit
      ↓
Validation
      ↓
Company Enrichment (Groq)
      ↓
Generate PDF Report
      ↓
Email Report (Resend)
      ↓
CSV Logging
```

Project structure:

```txt
simplIfiq/
├── client/
│   ├── src/
│   ├── App.jsx
│   └── vite.config.js
│
└── server/
    ├── routes/
    ├── services/
    │   ├── enrichment.js
    │   ├── reportGenerator.js
    │   ├── emailer.js
    │   ├── csvLogger.js
    │   └── googleIntegrations.js
    ├── index.js
    └── .env.example
```

---

## 🚀 Quick Start

Install:

```bash
cd server
npm install

cd ../client
npm install
```

Create `.env`:

```env
PORT=3001

GROQ_API_KEY=your_groq_key

RESEND_API_KEY=your_resend_key

FROM_EMAIL="SimplifIQ <onboarding@resend.dev>"
```

Run backend:

```bash
cd server
npm start
```

Run frontend:

```bash
cd client
npm run dev
```

Open:

```txt
http://localhost:5173
```

---

## ✅ Validation

Implemented validation for:

- Name → required
- Email → required + format check
- Company → required
- Website → optional + URL validation
- Role → optional
- Pain points → optional

Both frontend and backend validation included.

---

## 📄 Generated Reports

Reports contain:

- Executive summary
- Company profile
- AI readiness insights
- Strategic recommendations
- Actionable next steps

Reports are generated as PDFs and emailed automatically.

---

## ⚠ Error Handling

Handled cases:

- Missing fields
- Invalid email / website
- Groq failures (fallback mode)
- Website scraping failures
- Missing Resend API key
- CSV logging failure
- Optional integrations unavailable

Pipeline continues without crashing.

---

## 🛠 Tech Stack

Frontend:

- React
- Vite
- Axios

Backend:

- Node.js
- Express
- Groq API
- Puppeteer
- Resend API
- Cheerio

Deployment:

- Vercel (Frontend)
- Render (Backend)

---

## 🌐 Deployment Status

Verified in production:

✅ Lead capture  
✅ Validation  
✅ AI enrichment  
✅ PDF generation  
✅ Email delivery (Resend)  
✅ CSV logging  
✅ Frontend deployment (Vercel)  
✅ Backend deployment (Render)  
✅ End-to-end workflow

---

## 🏁 Limitations

- Cheerio may struggle with JS-heavy websites
- Puppeteer is resource intensive
- Resend free tier has email limits
- Groq API rate limits apply

---

## 📄 License

Educational / assignment use.