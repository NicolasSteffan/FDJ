import axios from 'axios';
import { load } from 'cheerio';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

type Draw = {
  date: string; // ISO date
  numbers: number[]; // 5 numbers
  stars: number[]; // 2 stars
};

const DATA_DIR = join(process.cwd(), 'data');

async function fetchSampleFromSource(): Promise<Draw[]> {
  // Proto: tenter une source publique simple; fallback mock si erreur
  // Pour éviter la fragilité, on récupère un contenu léger (ex: page récap) et on mock si structure inconnue
  try {
    const url = 'https://www.euro-millions.com/results';
    const response = await axios.get(url, { timeout: 10000 });
    const $ = load(response.data);
    const draws: Draw[] = [];

    $('.results .result').slice(0, 3).each((_i, el) => {
      const dateText = $(el).find('.date').text().trim();
      const balls = $(el).find('.balls li').map((_, b) => Number($(b).text().trim())).get();
      const stars = $(el).find('.lucky-stars li').map((_, s) => Number($(s).text().trim())).get();
      const numbers = balls.slice(0, 5);
      const starNums = stars.slice(0, 2);
      if (dateText && numbers.length === 5 && starNums.length === 2) {
        const iso = new Date(dateText).toISOString();
        draws.push({ date: iso, numbers, stars: starNums });
      }
    });

    if (draws.length > 0) return draws;
    return mockSample();
  } catch {
    return mockSample();
  }
}

function mockSample(): Draw[] {
  return [
    { date: new Date().toISOString(), numbers: [1, 7, 19, 33, 45], stars: [2, 9] },
    { date: new Date(Date.now() - 86400000).toISOString(), numbers: [5, 12, 16, 24, 38], stars: [3, 7] },
    { date: new Date(Date.now() - 2 * 86400000).toISOString(), numbers: [3, 11, 21, 29, 44], stars: [1, 10] }
  ];
}

async function main() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const sample = await fetchSampleFromSource();
  const outFile = join(DATA_DIR, 'sample_draws.json');
  writeFileSync(outFile, JSON.stringify(sample, null, 2), 'utf-8');
  // eslint-disable-next-line no-console
  console.log(`Échantillon sauvegardé: ${outFile}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

