import express from 'express';
import bcrypt from 'bcryptjs';
import auth from '../../test/middlewares/auth.test.js';
import User from '../models/User.test.js';
import Vocabulary from '../models/Vocabulary.test.js';

const router = express.Router();

/**
 * DASHBOARD ROUTES
 */
router.get('/dashboard', auth.authSignin, async (req, res) => {
  try {
    // throw new Error('Test error dashboard');

    const users = await User.find({});

    return res.render('dashboard.ejs', {
      user: req.session.user,
      users,
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);

    return res.status(500).render('error.ejs', {
      message: 'Server error while loading dashboard.',
      error,
    });
  }
});

router.get('/dictionary', auth.authSignin, async (req, res) => {
  try {
    // throw new Error('Test error dashboard');
    const vocabularies = await Vocabulary.find({});
    res.render('dictionary', {
      user: req.session.user,
      vocabularies,
    });
  } catch (error) {
    console.error('Error', error);
    return res.status(500).render('error.ejs', {
      message: 'Server error while loading.',
      error,
    });
  }
});

router.post('/dictionary', async (req, res) => {
  try {
    console.log(req.body);
    const { word, pronunciation, partOfSpeech, meaning, examples } = req.body;

    const newVocabulary = new Vocabulary({
      word,
      pronunciation,
      partOfSpeech,
      meaning,
      examples,
    });
    await newVocabulary.save();

    const vocabularies = await Vocabulary.find({});

    res.status(200).render('dictionary', {
      data: newVocabulary,
      user: req.session.user,
      vocabularies,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', {
      success: false,
      message: 'Server error',
    });
  }
});
router.get('/dictionary/search', auth.authSignin, async (req, res) => {
  try {
    const vocabularies = await Vocabulary.find();

    res.render('dictionary', {
      title: 'Dictionary',
      user: req.session.user,
      vocabularies,
      message: 'Loaded successfully',
      error: null,
    });
  } catch (error) {
    console.error('Error loading dictionary:', error);

    res.status(500).render('dictionary', {
      title: 'Dictionary',
      user: req.session.user,
      vocabularies: [],
      message: null,
      error: 'Internal server error',
    });
  }
});
/**
 * USER PROFILE ROUTES
 */
router.get('/users/profile', auth.authSignin, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) return res.status(404).send('User not found');
    res.render('update-profile', { user });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send('Server error');
  }
});

router.post('/users/profile', auth.authSignin, async (req, res) => {
  try {
    const { username, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.session.user._id,
      { username, email },
      { new: true }
    );
    req.session.user = updatedUser;
    res.redirect('/api/v1/admin/dashboard');
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).send('Server error');
  }
});

/**
 * USER MANAGEMENT ROUTES (ADMIN)
 */
router.get('/users', auth.authSignin, async (req, res) => {
  try {
    const users = await User.find({});
    res.render('users.ejs', {
      user: req.session.user,
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Server error');
  }
});

router.get('/users/create', (req, res) => {
  res.render('create-user.ejs', { user: req.session.user });
});

router.post('/users', auth.authSignin, async (req, res) => {
  try {
    const { username, password, email } = req.body;

    let role = req.body.role || 2;

    if (req.session.user.role !== 1) {
      role = 2;
    }

    if (!username || !password) {
      return res.status(400).render('create-user.ejs', {
        error: 'All fields are required.',
        user: req.session.user,
      });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).render('create-user.ejs', {
        error: 'Username already exists.',
        user: req.session.user,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    res.redirect('/api/v1/admin/users');
  } catch (error) {
    console.error(error);
    res.status(500).render('create-user.ejs', {
      error: 'Server error. Please try again.',
      user: req.session.user,
    });
  }
});

router.get('/users/search', auth.authSignin, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      const vocabularies = await Vocabulary.find();

      return res.status(400).render('dictionary', {
        user: req.session.user,
        vocabularies,
        error: 'Please enter a search term.',
      });
    }

    const vocabularies = await Vocabulary.find({
      word: { $regex: query, $options: 'i' },
    });

    res.render('dictionary', {
      user: req.session.user,
      vocabularies,
    });
  } catch (error) {
    console.error('Error searching dictionary:', error);
    res.status(500).render('error', {
      user: req.session.user,
      message: 'Internal server error when searching dictionary.',
      error,
    });
  }
});

router.get('/users/:id', auth.authSignin, async (req, res) => {
  try {
    const { id } = req.params;
    const userById = await User.findById(id);

    if (!userById) {
      return res.status(404).render('user-detail', {
        error: 'User not found',
      });
    }

    res.render('user-detail', {
      user: req.session.user,
      userById,
    });
  } catch (error) {
    console.error('Error fetching user details:', error.message);
    res.status(500).render('user-detail', {
      error: 'Internal server error',
    });
  }
});

router.put('/users/:id', auth.authSignin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, password, role } = req.body;

    const updateData = {
      username,
      email,
      firstName,
      lastName,
    };

    // Nếu nhập password mới thì hash trước khi update
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Nếu user đăng nhập là admin thì mới cho phép update role
    if (req.session.user.role === 1 || req.session.user.role === 0) {
      updateData.role = role;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).render('users', {
        user: req.session.user,
        users: await User.find(),
        error: 'User not found',
      });
    }

    const users = await User.find();
    res.status(200).render('users', {
      user: req.session.user,
      users,
      success: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).render('users', {
      error: 'Internal server error',
      user: req.session.user,
      users: await User.find(),
    });
  }
});

router.get('/users/:id/change-password', auth.authSignin, async (req, res) => {
  try {
    const { id } = req.params;
    const userById = await User.findById(id);
    if (!userById) {
      return res.status(404).send('User not found');
    }

    res.render('change-password', {
      user: req.session.user,
      userById,
      error: null,
      success: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/users/:id/change-password', auth.authSignin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id } = req.params;

    const userById = await User.findById(id);
    if (!userById) {
      return res.status(404).render('change-password', {
        error: 'User not found',
        success: null,
        user: req.session.user,
        userById: null,
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, userById.password);
    if (!isMatch) {
      return res.status(400).render('change-password', {
        error: 'Current password is incorrect',
        success: null,
        user: req.session.user,
        userById,
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    userById.password = hashedNewPassword;
    await userById.save();

    res.render('users', {
      user: req.session.user,
      success: 'Password changed successfully!',
      error: null,
      userById: null,
      users: await User.find(),
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).render('change-password', {
      error: 'Internal server error',
      success: null,
      user: req.session.user,
      userById: null,
    });
  }
});

// router.post('/users/:id', auth.authSignin, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { username, newPassword, newRole } = req.body;

//     const updateData = {};
//     if (username) updateData.username = username;
//     if (newPassword) updateData.password = await bcrypt.hash(newPassword, 10);
//     if (newRole) updateData.role = parseInt(newRole);

//     const updatedUser = await User.findByIdAndUpdate(id, updateData, {
//       new: true,
//     });

//     if (!updatedUser) {
//       return res.status(404).render('signin.ejs', {
//         error: 'User not found.',
//       });
//     }

//     res.redirect('/api/v1/auth/signin');
//   } catch (error) {
//     console.error(error);
//     res.status(500).render('signin.ejs', {
//       error: 'Server error. Please try again.',
//     });
//   }
// });

router.delete('/users/:id', auth.authSignin, async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    const users = await User.find();

    res.status(200).render('users', {
      user: req.session.user,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('users', {
      error: 'Server error.',
      user: req.session.user,
      users: await User.find(),
    });
  }
});

// dictionary
router.get('/dictionary/:id', auth.authSignin, async (req, res) => {
  try {
    const { id } = req.params;
    const vocabulary = await Vocabulary.findById(id);

    if (!vocabulary) {
      return res.status(404).render('vocabulary-detail', {
        error: 'Vocabulary not found',
      });
    }

    res.render('vocabulary-detail', {
      user: req.session.user,
      vocabulary,
    });
  } catch (error) {
    console.error('Error fetching vocabulary details:', error.message);
    res.status(500).render('vocabulary-detail', {
      error: 'Internal server error',
    });
  }
});

router.put('/dictionary/:id', auth.authSignin, async (req, res) => {
  try {
    const { id } = req.params;
    const { word, pronunciation, partOfSpeech, meaning, examples } = req.body;

    const updated = await Vocabulary.findByIdAndUpdate(
      id,
      {
        word,
        pronunciation,
        partOfSpeech,
        meaning,
        examples: examples
          .split('\n')
          .map((e) => e.trim())
          .filter((e) => e),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).render('dictionary', {
        error: 'Vocabulary not found',
        user: req.session.user,
        vocabularies: await Vocabulary.find(),
      });
    }
    console.log('Update by:', req.session.user);

    const vocabularies = await Vocabulary.find();

    return res.status(200).render('dictionary', {
      user: req.session.user,
      vocabularies,
    });
  } catch (error) {
    console.error('Error updating vocabulary:', error);
    return res.status(500).render('error', {
      error: 'Internal server error',
      user: req.session.user,
    });
  }
});

router.delete('/dictionary/:id', auth.authSignin, async (req, res) => {
  try {
    const { id } = req.params;
    await Vocabulary.findByIdAndDelete(id);

    const vocabularies = await Vocabulary.find();

    res.render('dictionary', {
      user: req.session.user,
      vocabularies,
    });
  } catch (error) {
    console.error('Error deleting vocabulary:', error.message);
    const vocabularies = await Vocabulary.find();
    res.status(500).render('dictionary', {
      user: req.session.user,
      vocabularies,
    });
  }
});

export default router;
