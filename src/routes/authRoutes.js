import express from 'express';
import session from 'express-session';
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

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).render('signin.ejs', {
        error: 'Invalid username or password.',
      });
    }

    // Compare entered password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).render('signin.ejs', {
        error: 'Invalid username or password.',
      });
    }

    // Store user in session
    req.session.user = user;

    return res.redirect('/api/v1/admin/dictionary');
  } catch (err) {
    console.error(err);
    return res.status(500).render('signin.ejs', {
      error: 'Server error. Please try again.',
    });
  }
});

export default router;
