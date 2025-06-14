import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import methodOverride from 'method-override';
//TEST
// import applyMiddleware from './test/middlewares/index.js';
// import authRouter from './test/routes/authRoutes.test.js';
// import adminRouter from './test/routes/adminRoutes.test.js';
// import testRouter from './test/routes/homeRoutes.test.js';
// import testUserRouter from './test/routes/userRoutes.test.js';
import applyRoutes from './test/routes/index.js';

//
import applyMiddleware from './middlewares/index.js';
// import applyRoutes from './routes/index.js';
import setupViewEngine from './config/viewEngine.js';
import setupStaticFiles from './config/staticFiles.js';

// ES Module __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. View engine setup
setupViewEngine(app, __dirname);

// 2. Middlewares
applyMiddleware(app);
app.use(methodOverride('_method'));
// 3. Static files
setupStaticFiles(app, __dirname);

// 4. Routers
applyRoutes(app);

export default app;
