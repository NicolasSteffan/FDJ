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

// Mock breakdown (prototype)
type BreakdownRow = { rankLabel: string; winners: number; amount: number; currency: string };
function mockBreakdown(): BreakdownRow[] {
  return [
    { rankLabel: '5+2', winners: 0, amount: 0, currency: 'EUR' },
    { rankLabel: '5+1', winners: 3, amount: 331615.7, currency: 'EUR' },
    { rankLabel: '5+0', winners: 14, amount: 16608.0, currency: 'EUR' },
    { rankLabel: '4+2', winners: 68, amount: 1065.0, currency: 'EUR' },
    { rankLabel: '4+1', winners: 1313, amount: 101.6, currency: 'EUR' },
    { rankLabel: '3+2', winners: 2461, amount: 57.3, currency: 'EUR' },
    { rankLabel: '4+0', winners: 3201, amount: 30.9, currency: 'EUR' },
    { rankLabel: '2+2', winners: 34085, amount: 14.5, currency: 'EUR' },
    { rankLabel: '3+1', winners: 52194, amount: 10.5, currency: 'EUR' },
    { rankLabel: '3+0', winners: 126467, amount: 8.1, currency: 'EUR' },
    { rankLabel: '1+2', winners: 172275, amount: 7.2, currency: 'EUR' },
    { rankLabel: '2+1', winners: 704224, amount: 5.5, currency: 'EUR' },
    { rankLabel: '2+0', winners: 1683554, amount: 3.7, currency: 'EUR' },
  ];
}

app.get('/draws/latest/full', async (_req: Request, res: Response) => {
  const draws = await loadDraws();
  const latest = draws[0] || null;
  if (!latest) return res.json(null);
  res.json({ draw: latest, breakdown: mockBreakdown() });
});

app.get('/draws/:date/full', async (req: Request, res: Response) => {
  const ymd = String(req.params.date);
  const draws = await loadDraws();
  const found = draws.find(d => (d.date || '').startsWith(ymd));
  if (!found) return res.status(404).json({ code: 'NOT_FOUND', message: `No draw for ${ymd}` });
  res.json({ draw: found, breakdown: mockBreakdown() });
});

// Scrape run (stub)
app.post('/scrape/run', async (req: Request, res: Response) => {
  const date = typeof req.query.date === 'string' ? req.query.date : undefined;
  res.json({ status: 'queued', date: date || 'latest' });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API prête sur http://localhost:${port}`);
});

