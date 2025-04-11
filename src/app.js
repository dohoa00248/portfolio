import express from 'express';
import homeRouter from './routes/homeRoutes.js';
import path from 'path';

const app = express();

app.use('/', homeRouter);
// view engine setup
// app.set('views', path.join(__dirname, '../../src', 'views'));
app.set('views', path.join('./src/views'));
app.set('view engine', 'ejs');
export default app;
