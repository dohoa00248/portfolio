import express from 'express';
import bcrypt from 'bcryptjs';
import auth from '../../test/middlewares/auth.test.js';
import User from '../models/User.test.js';
const router = express.Router();

router.get('/dashboard', auth.authSignin, (req, res) => {
  res.render('dashboard.ejs');
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
router.post('/users/update', async (req, res) => {
  try {
    const { username, newPassword, newRole } = req.body;

    if (!username) {
      return res.status(400).render('update-user.ejs', {
        error: 'Username is required to update user.',
      });
    }

    const updateData = {};

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    if (newRole) {
      updateData.role = parseInt(newRole);
    }

    const updatedUser = await User.findOneAndUpdate({ username }, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).render('update-user.ejs', {
        error: 'User not found.',
      });
    }

    return res.redirect('/api/v1/auth/signin');
  } catch (error) {
    console.error(error);
    return res.status(500).render('update-user.ejs', {
      error: 'Server error. Please try again.',
    });
  }
});
export default router;
