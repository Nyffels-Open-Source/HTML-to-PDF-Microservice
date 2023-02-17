import express, { Application } from 'express';
import morgan from 'morgan';
import swaggerUi from "swagger-ui-express";
import crypto from "crypto";

import Router from './routes';

const PORT = process.env.PORT || 8000;
if (!process.env.CODE) process.env.Code = crypto.randomBytes(20).toString('hex');

const app: Application = express();

app.use(express.json());
app.use(morgan('tiny'));
app.use(express.static('public'));

// app.use((req, res, next) => {
// 	console.log(req.headers.authorization);
// 	if (process.env.CODE != req.headers.authorization) throw new Error("Incorrect api key. More information: https://github.com/Nyffels-IT/HTML-to-PDF-Socker-Swagger-API");
// 	next();
// });

app.use(Router);

app.use(
  "/documentation",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
		customSiteTitle: "HTML to PDF",
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);

app.listen(PORT, () => {
	console.log('Server is running on port', PORT);
	console.log('Authorization code:', process.env.CODE);
});
