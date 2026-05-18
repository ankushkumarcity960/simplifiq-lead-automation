import { execSync } from 'child_process';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import leadRouter from './routes/lead.js';

dotenv.config();

// Install Chrome if not present
try {
  execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });
} catch (e) {
  console.warn('Chrome install skipped:', e.message);
}

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/lead', leadRouter);

app.listen(PORT, () => {
  console.log(`\n🚀  SimplifIQ server running on http://localhost:${PORT}\n`);
});