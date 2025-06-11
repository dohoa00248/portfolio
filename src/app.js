import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';

//TEST
// import adminRouter from './test/routes/adminRoutes.test.js';
// import testRouter from './test/routes/homeRoutes.test.js';
// import testUserRouter from './test/routes/userRoutes.test.js';
// import authRouter from './test/routes/authRoutes.test.js';

//
import authRouter from './routes/authRoutes.js';
import adminRouter from './routes/adminRoutes.js';
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
app.use(
  session({
    secret: '123',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1h
    },
  })
);
// 3. Static files
app.use(express.static(path.join(__dirname, 'public')));

// 4. Routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/user', userRouter);
// app.use('/api/v1/test', testRouter);
// app.use('/api/v1/test-user', testUserRouter);
app.use('/', homeRouter);

export default app;
