import express from 'express';
import homeController from '../controllers/homeController.js';
import userController from '../controllers/userController.js';
const router = express.Router();

router.get('/', homeController.getHomePage);
router.get('/dashboard', userController.getUserDashboard);
export default router;
