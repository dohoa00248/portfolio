import express from 'express';
import homeController from '../controllers/homeController.js';
import userController from '../controllers/userController.js';
import auth from '../middlewares/auth.js';
const router = express.Router();

router.get('/', homeController.getHomePage);
router.get('/dashboard', userController.getUserDashboard);
router.get('/my-dictionary/', auth.authSignin, userController.getUserDashboard);

router.post(
  '/dictionary',
  auth.authSignin,
  // auth.checkSuperAdmin,
  userController.createVocabulary
);
export default router;
