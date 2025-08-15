import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3011; // éviter conflit avec 3001

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/ping', (_req: Request, res: Response) => {
  res.json({ pong: true, proto: 'api-ping', time: new Date().toISOString() });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Proto API Ping prêt sur http://localhost:${port}`);
});

