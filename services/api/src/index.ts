import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { readFile } from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/ping', (_req: Request, res: Response) => {
  res.json({ pong: true, time: new Date().toISOString() });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Data helpers
type Draw = { date: string; numbers: number[]; stars: number[] };
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SAMPLE_PATH = resolve(__dirname, '..', '..', 'scraper', 'data', 'sample_draws.json');

async function loadDraws(): Promise<Draw[]> {
  try {
    const raw = await readFile(SAMPLE_PATH, 'utf-8');
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr as Draw[];
    return [];
  } catch {
    return [];
  }
}

// Latest draw
app.get('/draws/latest', async (_req: Request, res: Response) => {
  const draws = await loadDraws();
  const latest = draws[0] || null;
  res.json(latest);
});

// Draws list
app.get('/draws', async (req: Request, res: Response) => {
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
  const draws = await loadDraws();
  res.json(draws.slice(0, limit));
});

// Draw by date (YYYY-MM-DD)
app.get('/draws/:date', async (req: Request, res: Response) => {
  const ymd = String(req.params.date);
  const draws = await loadDraws();
  const found = draws.find(d => (d.date || '').startsWith(ymd));
  if (!found) return res.status(404).json({ code: 'NOT_FOUND', message: `No draw for ${ymd}` });
  res.json(found);
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API prête sur http://localhost:${port}`);
});

