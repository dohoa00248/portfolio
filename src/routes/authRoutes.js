import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

router.get('/signin', authController.getSigninPage);
router.post('/signin', authController.signIn);
router.post('/signout', authController.signOut);

export default router;
