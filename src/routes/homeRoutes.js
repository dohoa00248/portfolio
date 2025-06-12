import express from 'express';
import homeController from '../controllers/homeController.js';
const router = express.Router();

router.get('/', homeController.getHomePage);
router.get('/test', homeController.getTestPage);
router.get('/dictionary', homeController.getDictionaryPage);

export default router;
