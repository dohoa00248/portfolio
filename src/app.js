import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import setupViewEngine from './config/viewEngine.js';
import setupStaticFiles from './config/staticFiles.js';

import applyMiddleware from './middlewares/index.js';
import applyRoutes from './routes/index.js';

// ES Module __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. View engine setup
setupViewEngine(app, __dirname);

// 2. Middlewares
applyMiddleware(app);

// 3. Static files
setupStaticFiles(app, __dirname);

// 4. Routers
applyRoutes(app);

export default app;
