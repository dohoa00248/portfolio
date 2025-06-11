import express from 'express';
// import HomeController from '../controllers/homeController.js';
import homeController from '../controllers/homeController.js';
const router = express.Router();

router.get('/test', homeController.getTestPage);
router.get('/dictionary', homeController.getDictionaryPage);
router.get('/', homeController.getHomePage);

export default router;
