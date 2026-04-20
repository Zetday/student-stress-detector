import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from '../routes/index.js';
import ErrorHandler from '../middlewares/error.js';

const app = express();

app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
);
app.use(express.json());

app.use('/uploads/images', express.static('src/services/uploads/files/profiles'));

app.use(routes);
app.use(ErrorHandler);

export default app;
