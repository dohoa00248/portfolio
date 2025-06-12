import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
const router = express.Router();

router.get('/signin', (req, res) => {
  res.render('signin');
});

router.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).render('signin.ejs', {
        error: 'Username and password are required.',
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).render('signin.ejs', {
        error: 'Invalid username or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).render('signin.ejs', {
        error: 'Invalid username or password.',
      });
    }

    console.log(req.session);
    req.session.user = user;
    console.log(req.session);

    return res.redirect('/api/v1/admin/dashboard');
  } catch (err) {
    console.error(err);
    return res.status(500).render('signin.ejs', {
      error: 'Server error. Please try again.',
    });
  }
});

export default router;
