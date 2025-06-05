import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import testRouter from './routes/testRoutes.js';
import homeRouter from './routes/homeRoutes.js';
import userRouter from './routes/userRoutes.js';

// ES Module __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 2. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Static files
app.use(express.static(path.join(__dirname, 'public')));

// 4. Routers
app.use('/', homeRouter);
app.use('/api/v1/test', testRouter);
app.use('/api/v1/user', userRouter);
// const myLogger = function (req, res, next) {
//   console.log('LOGGED');
//   next();
// };

// app.use(myLogger);

// app.get('/api/v1/test', (req, res) => {
//   res.send('Hello World!');
// });
export default app;
