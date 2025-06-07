import express from 'express';
import HomeController from '../controllers/homeController.js';

const router = express.Router();

router.get('/', HomeController.getHomePage);
router.get('/test', HomeController.getTestPage);
router.get('/dictionary', HomeController.getDictionaryPage);

export default router;
