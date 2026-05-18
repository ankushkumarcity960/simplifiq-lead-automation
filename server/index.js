import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import leadRouter from './routes/lead.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Lead intake route
app.use('/api/lead', leadRouter);

app.listen(PORT, () => {
  console.log(`\n🚀  SimplifIQ server running on http://localhost:${PORT}\n`);
});
