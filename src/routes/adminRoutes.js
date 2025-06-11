import express from 'express';
// import auth from '../../test/middlewares/auth.test.js';
import auth from '../middlewares/auth.js';
const router = express.Router();

router.get('/dashboard', auth.authSignin, (req, res) => {
  res.render('dashboard.ejs');
});

router.get('/dictionary', auth.authSignin, (req, res) => {
  res.render('dictionary.ejs');
});

export default router;
