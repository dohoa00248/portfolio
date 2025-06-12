import express from 'express';
import testRouter from '../../test/routes/homeRoutes.test.js';
import testUserRouter from '../../test/routes/userRoutes.test.js';
import authRouter from '../../test/routes/authRoutes.test.js';
import adminRouter from '../../test/routes/adminRoutes.test.js';
import homeRouter from '../../test/routes/homeRoutes.test.js';
import userRouter from '../../test/routes/userRoutes.test.js';
const applyRoutes = (app) => {
  app.use('/', homeRouter);
  app.use('/api/v1/test', testRouter);
  app.use('/api/v1/test-user', testUserRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/user', userRouter);
};

export default applyRoutes;
