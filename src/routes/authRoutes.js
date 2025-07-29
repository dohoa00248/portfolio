import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

router.get('/signin', authController.getSigninPage);
router.post('/signin', authController.signIn);
router.post('/signout', authController.signOut);
router.get('/signup', authController.getSignUpPage);
router.post('/signup', authController.signUp);

export default router;
