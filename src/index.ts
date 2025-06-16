import express, {Application} from 'express';
import morgan from 'morgan';
import jsonData from "./swagger.json";
import swaggerUi from 'swagger-ui-express';
import crypto from 'crypto';
import bodyParser from 'body-parser';

import Router from './routes';
import {config} from 'dotenv';

config();

if (!process.env.PORT) {
  process.env.PORT = '' + 80;
}
if (!process.env.CODE) {
  process.env.Code = crypto.randomBytes(20)
    .toString('hex');
}

const app: Application = express();
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.json());
app.use(morgan('tiny'));
app.use(express.static('public'));

app.get('/swagger.json', (req, res) => {
  res.send(jsonData);
});


app.use('/documentation', swaggerUi.serve, swaggerUi.setup(undefined, {
    customSiteTitle: 'HTML to PDF',
    swaggerOptions: {
      url: '/swagger.json',
    },
  })
);

app.use(Router);

app.listen(+process.env.PORT, () => {
  console.log('Server is running on port', process.env.PORT);
});
