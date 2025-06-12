import express from 'express';
import bcrypt from 'bcryptjs';
import auth from '../../test/middlewares/auth.test.js';
import User from '../models/User.test.js';
const router = express.Router();

router.get('/dashboard', auth.authSignin, (req, res) => {
  res.render('dashboard.ejs', { user: req.session.user });
});

router.get('/dictionary', auth.authSignin, (req, res) => {
  res.render('dictionary.ejs');
});

router.post('/users', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).render('signin.ejs', {
        error: 'Username and password are required.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      // role: 1,
    });

    await newUser.save();

    return res.redirect('/api/v1/auth/signin');
  } catch (error) {
    console.error(error);
    return res.status(500).render('signin.ejs', {
      error: 'Server error. Please try again.',
    });
  }
});

router.post('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(req.params);
    const { username, newPassword, newRole } = req.body;

    console.log(req.body);

    const updateData = {};

    if (username) {
      updateData.username = username;
    }

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    if (newRole) {
      updateData.role = parseInt(newRole);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).render('signin.ejs', {
        error: 'User not found.',
      });
    }

    return res.redirect('/api/v1/auth/signin');
  } catch (error) {
    console.error(error);
    return res.status(500).render('signin.ejs', {
      error: 'Server error. Please try again.',
    });
  }
});

export default router;
