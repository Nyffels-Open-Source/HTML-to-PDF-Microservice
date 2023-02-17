import express, { Application } from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import crypto from 'crypto';

import Router from './routes';

const PORT = process.env.PORT || 8000;
if (!process.env.CODE) process.env.Code = crypto.randomBytes(20).toString('hex');

const app: Application = express();

app.use(express.json());
app.use(morgan('tiny'));
app.use(express.static('public'));

app.use(
  '/documentation',
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    customSiteTitle: 'HTML to PDF',
    swaggerOptions: {
      url: '/swagger.json',
    },
  })
);

app.use(Router);

app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
  console.log('Authorization code:', process.env.CODE);
});
