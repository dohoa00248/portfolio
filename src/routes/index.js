import authRouter from '../routes/authRoutes.js';
import adminRouter from '../routes/adminRoutes.js';
import homeRouter from '../routes/homeRoutes.js';
import userRouter from '../routes/userRoutes.js';

const applyRoutes = (app) => {
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/user', userRouter);
  app.use('/', homeRouter);
};

export default applyRoutes;
