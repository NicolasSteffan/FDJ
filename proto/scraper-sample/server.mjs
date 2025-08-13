import express from 'express';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { readFile, writeFile, mkdir, appendFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5174;
const DATA_DIR = path.join(__dirname, 'data');
const UI_DIR = path.join(__dirname, 'ui');
const LOG_FILE = path.join(DATA_DIR, 'journal_proto.log');

async function logProto(message) {
  try {
    const ts = new Date().toISOString();
    const line = `[${ts}] ${message}`;
    console.log(line);
    if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true });
    await appendFile(LOG_FILE, line + "\n").catch(() => {});
  } catch (_) {}
}

app.use('/ui', express.static(UI_DIR));
app.use('/data', express.static(DATA_DIR));

function toISO(dateYmd) {
  return `${dateYmd}T00:00:00.000Z`;
}

function normalizeAmount(text) {
  const cleaned = (text || '').replace(/[^0-9,\.\s]/g, '').replace(/\s/g, '');
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');
  if (hasComma && hasDot) {
    const iComma = cleaned.indexOf(',');
    const iDot = cleaned.indexOf('.');
    // Si virgule avant point: virgule = milliers, point = décimal -> supprimer virgules
    if (iComma < iDot) {
      return parseFloat(cleaned.replace(/,/g, ''));
    }
    // Sinon: point = milliers, virgule = décimal -> supprimer points, convertir virgules en points
    return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
  }
  if (hasComma) {
    return parseFloat(cleaned.replace(',', '.'));
  }
  return parseFloat(cleaned);
}

function getEuromillonesUrl(dateYmd) {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  // Utiliser UTC pour rester cohérent avec ymd ISO
  const d = new Date(`${dateYmd}T00:00:00Z`);
  const suffix = days[d.getUTCDay()] || 'fri';
  return `https://www.euromillones.com/en/results/euromillions--results-${dateYmd}-${suffix}`;
}

async function scrapeTirageFromLotteryExtreme(ymd) {
  const url = `https://www.lotteryextreme.com/euromillions/prize_breakdown(${ymd})`;
  await logProto(`TIRAGE GET ${url}`);
  const res = await fetch(url);
  await logProto(`TIRAGE HTTP ${res.status}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const nums = [];
  $('ul.displayball li').each((_, el) => {
    const v = parseInt($(el).text().trim(), 10);
    if (!Number.isNaN(v)) nums.push(v);
  });
  if (nums.length < 7) throw new Error(`Parse error: expected 7 numbers got ${nums.length}`);
  const numbers = nums.slice(0, 5);
  const stars = nums.slice(5, 7);
  await logProto(`TIRAGE numbers=${numbers.length} stars=${stars.length}`);

  // breakdown table (simple parse similar to PS script)
  const rows = [];
  $('table.tbsg tr.sg1, table.tbsg tr.sg2').each((_, tr) => {
    const tds = $(tr).find('td');
    if (tds.length >= 3) {
      const label = $(tds[0]).text().replace(/\s+/g, '');
      const winners = parseInt($(tds[1]).text().replace(/[^0-9]/g, ''), 10) || 0;
      const amount = normalizeAmount($(tds[2]).text());
      const currency = 'EUR';
      if (/^\d+\+\d+$/.test(label) && !Number.isNaN(amount)) {
        rows.push({ rankLabel: label, winners, amount, currency });
      }
    }
  });
  await logProto(`TIRAGE rows=${rows.length}`);

  return {
    date: toISO(ymd),
    numbers,
    stars,
    breakdown: rows,
    meta: {
      providerUsed: 'lotteryextreme',
      providersTried: ['lotteryextreme:prize_breakdown'],
      errors: [],
    },
  };
}



app.get('/api/scrape', async (req, res) => {
  const ymd = (req.query.date || '2025-08-08').toString();
  try {
    await logProto(`SCRAPE start date=${ymd}`);
    const tirage = await scrapeTirageFromLotteryExtreme(ymd);
    const outT = path.join(DATA_DIR, 'tirage.json');
    if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true });
    await writeFile(outT, JSON.stringify([tirage], null, 2));
    await logProto('WROTE data/tirage.json');
    await logProto(`SCRAPE done date=${ymd} provider_tirage=${tirage.meta?.providerUsed || ''}`);
    res.json({ ok: true, date: ymd });
  } catch (e) {
    await logProto(`SCRAPE ERROR date=${ymd} ${e.message}`);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/', (req, res) => res.redirect('/ui/index.html'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

