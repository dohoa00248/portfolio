import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
// import ProjectTest from '../models/Project.test.js';
import User from '../models/User.test.js';
import auth from '../../test/middlewares/auth.test.js';

// import jwt from 'jsonwebtoken';

const router = express.Router();

// router.get('/dashboard', (req, res) => {
//   res.render('dashboard.ejs');
// });

router.get('/signin', (req, res) => {
  res.render('signin.ejs');
});

router.get('/signout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Signout error:', err);
      return res.status(500).send('Logout failed.');
    }

    res.clearCookie('connect.sid');

    res.redirect('/api/v1/auth/signin');
  });
});
// const users = [
//   {
//     username: 'admin',
//     password: 'admin',
//     role: 1,
//   },
// ];

router.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Validate input
    if (!username || !password) {
      return res.status(400).render('signin.ejs', {
        error: 'Username and password are required.',
      });
    }

    // 2. Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).render('signin.ejs', {
        error: 'Invalid username or password.',
      });
    }

    // 3. Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).render('signin.ejs', {
        error: 'Invalid username or password.',
      });
    }

    // 4. Store user info in session
    // req.session.user = user;
    req.session.user = {
      _id: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
    };
    console.log(req.session);

    // 5. Redirect to admin dashboard
    return res.redirect('/api/v1/admin/dashboard');
  } catch (error) {
    console.error('Error during signin:', error);
    return res.status(500).render('signin.ejs', {
      error: 'Internal server error. Please try again.',
    });
  }
});

router.get('/dictionary-test', auth.authSignin, (req, res) => {
  res.render('dictionary.ejs');
});

export default router;
