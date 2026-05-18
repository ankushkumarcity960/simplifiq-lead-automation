Your architecture section got broken (`└── ├── csvLogger.js`). Here’s the corrected full README:

# SimplifIQ — AI Lead Intake & Automation System

> Capture a prospect's company details → enrich with AI research → generate a personalised PDF audit → email it automatically. Zero human intervention.

---

## ✨ What It Does

When a prospect submits the intake form:

1. Validates submitted lead information
2. Scrapes company websites (Cheerio) for context
3. Enriches data using Groq LLMs
4. Generates branded PDF audit reports (Puppeteer → PDF)
5. Emails reports automatically via SMTP
6. Logs leads into CSV (`leads.csv`)
7. Supports optional Google integrations (placeholders)

---

## 🏗 Architecture

```txt
simplIfiq/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── server/
    ├── routes/
    │   └── lead.js
    │
    ├── services/
    │   ├── enrichment.js
    │   ├── reportGenerator.js
    │   ├── emailer.js
    │   ├── csvLogger.js
    │   └── googleIntegrations.js
    │
    ├── .env.example
    ├── index.js
    └── package.json
```

---

## 🔄 Data Flow

```txt
Browser Form Submit
      │
      ▼
POST /api/lead
      │
      ├── Validate fields
      ├── Return 400 if invalid
      │
      ▼
Async Pipeline
│
├── Website enrichment (Cheerio)
├── Groq AI analysis
├── PDF generation (Puppeteer)
├── Email delivery (SMTP)
├── CSV lead logging
├── Optional Google Sheets log
└── Optional Google Drive archive
```

---

## 🚀 Quick Start

### Prerequisites

* Node.js 18+
* Groq API key
* Gmail App Password

Groq keys:

[https://console.groq.com/keys](https://console.groq.com/keys)

---

### Install

Server:

```bash
cd server
npm install
```

Client:

```bash
cd client
npm install
```

---

### Configure `.env`

Copy:

```bash
cp .env.example .env
```

Example:

```env
PORT=3001

GROQ_API_KEY=your_key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=you@gmail.com
SMTP_PASS=your_app_password

FROM_EMAIL="SimplifIQ <you@gmail.com>"
```

---

### Run

Backend:

```bash
cd server
npm start
```

Frontend:

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

Implemented:

| Field      | Validation                |
| ---------- | ------------------------- |
| name       | required                  |
| email      | required + format         |
| company    | required                  |
| website    | optional + URL validation |
| role       | optional                  |
| painPoints | optional                  |

Both frontend and backend validation implemented.

---

## 📄 Report Pipeline

Generated reports include:

* Executive summary
* Company profile
* AI readiness analysis
* Recommendations
* Strategic narrative
* Actionable insights

Reports are saved as PDFs and emailed automatically.

---

## ⚠ Error Handling

| Scenario                | Behaviour               |
| ----------------------- | ----------------------- |
| Missing fields          | Return 400              |
| Invalid email           | Return 400              |
| Invalid website         | Return 400              |
| Website unreachable     | Continue with fallback  |
| Groq failure            | Use fallback enrichment |
| SMTP unavailable        | Skip email              |
| CSV logging fails       | Continue pipeline       |
| Google APIs unavailable | Skip optional features  |

---

## ⭐ Bonus Logging & Archiving

Implemented:

### CSV Tracker

Stores:

```txt
name | email | company | timestamp | status
```

Example:

```csv
Jane Doe,jane@gmail.com,Google,2026...,sent
```

Optional placeholders:

* Google Sheets integration
* Google Drive archiving

Core workflow works without cloud setup.

---

## 🛠 Tech Stack

Frontend:

* React
* Vite
* Axios

Backend:

* Node.js
* Express
* Groq API
* Puppeteer
* Nodemailer
* Cheerio

---

## 🏁 Limitations

* Cheerio struggles with JS-heavy SPAs
* Puppeteer is resource intensive
* Gmail SMTP unsuitable for production scale
* Google integrations require cloud configuration
* Groq rate limits apply

---

## 📌 Outcome

Implemented:

✅ Lead capture
✅ Validation
✅ AI enrichment
✅ PDF generation
✅ Automated email delivery
✅ CSV lead tracking
✅ Error handling
✅ End-to-end pipeline


