import express, { Application } from 'express';
import morgan from 'morgan';
import jsonData from './swagger.json';
import swaggerUi from 'swagger-ui-express';

import Router from './routes';
import { closeBrowser } from './core/puppeteer';
import { config } from 'dotenv';

config();

if (!process.env.PORT) {
  process.env.PORT = '8000';
}

const app: Application = express();
app.use(express.json({ limit: '50mb' }));
app.use(morgan('tiny'));
app.use(express.static('public'));

app.get('/swagger.json', (_req, res) => {
  res.send(jsonData);
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(undefined, {
  customSiteTitle: 'HTML to PDF',
  swaggerOptions: {
    url: '/swagger.json',
  },
}));

app.use(Router);

const server = app.listen(Number(process.env.PORT), () => {
  console.log('Server is running on port', process.env.PORT);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}. Shutting down gracefully.`);
  server.close(async () => {
    await closeBrowser();
    process.exit(0);
  });
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
