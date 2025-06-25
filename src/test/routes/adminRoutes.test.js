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
    const users = await User.find({});
    res.render('dashboard.ejs', {
      user: req.session.user,
      userList: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Server error');
  }
});

router.get('/dictionary', auth.authSignin, async (req, res) => {
  try {
    const vocabulary = await Vocabulary.find({});
    console.log(vocabulary);
    res.render('dictionary', {
      user: req.session.user,
      vocabularyList: vocabulary,
    });
  } catch (error) {
    console.error('Error', error);
    res.render('signin');
  }
});
// router.get('/dictionary/create', auth.authSignin, async (req, res) => {
//   try {
//     res.render('create-vocabulary');
//   } catch (error) {
//     console.error('Error', error);
//     res.render('signin');
//   }
// });
router.post('/dictionary', async (req, res) => {
  try {
    console.log(req.body);
    const { word, pronunciation, partOfSpeech, meaning, examples } = req.body;
    const vocabulary = await Vocabulary.find({});
    const newVocabulary = new Vocabulary({
      word,
      pronunciation,
      partOfSpeech,
      meaning,
      examples,
    });
    await newVocabulary.save();

    res.status(200).render('dictionary', {
      data: newVocabulary,
      user: req.session.user,
      vocabularyList: vocabulary,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', {
      success: false,
      message: 'Server error',
      // vocabularies: vocabulary,
      error: null,
    });
  }
});
router.get('/dictionary/search', auth.authSignin, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).render('dictionary', {
        error: 'Please enter a search term.',
        user: req.session.user,
        vocabularyList: await Vocabulary.find(),
      });
    }

    const vocabularies = await Vocabulary.find({
      $or: [{ word: { $regex: query, $options: 'i' } }],
    });

    res.render('dictionary', {
      user: req.session.user,
      vocabularyList: vocabularies,
      // success: `Found ${vocabularies.length} vocabularies(s) matching "${query}"`,
    });
  } catch (error) {
    console.error('Error searching dictionary:', error);
    res.status(500).render('dictionary', {
      error: 'Internal server error',
      user: req.session.user,
      vocabularyList: await Vocabulary.find(),
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
      userList: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Server error');
  }
});

router.get('/users/create', auth.authSignin, (req, res) => {
  res.render('create-user.ejs');
});

router.post('/users', auth.authSignin, async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

    if (!username || !password) {
      return res.status(400).render('create-user.ejs', {
        error: 'All fields are required.',
      });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).render('create-user.ejs', {
        error: 'Username already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 2,
    });

    await newUser.save();
    res.redirect('/api/v1/admin/users');
  } catch (error) {
    console.error(error);
    res.status(500).render('create-user.ejs', {
      error: 'Server error. Please try again.',
    });
  }
});

router.get('/users/search', auth.authSignin, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).render('users', {
        error: 'Please enter a search term.',
        user: req.session.user,
        userList: await User.find(),
      });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    });

    res.render('users', {
      user: req.session.user,
      userList: users,
      success: `Found ${users.length} user(s) matching "${query}"`,
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).render('users', {
      error: 'Internal server error',
      user: req.session.user,
      userList: await User.find(),
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
    const { username, email, firstName, lastName } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username, email, firstName, lastName },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).render('users', {
        error: 'User not found',
        user: req.session.user,
        userList: await User.find(),
      });
    }

    const userList = await User.find();
    res.status(200).render('users', {
      user: req.session.user,
      userList,
      success: 'User updated successfully!',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).render('users', {
      error: 'Internal server error',
      user: req.session.user,
      userList: await User.find(),
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
      userList: await User.find(),
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
    const userList = await User.find();

    res.status(200).render('users', {
      user: req.session.user,
      userList,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('users', {
      error: 'Server error.',
      user: req.session.user,
      userList: await User.find(),
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
        vocabularyList: await Vocabulary.find(),
      });
    }

    const vocabularyList = await Vocabulary.find();
    res.status(200).render('dictionary', {
      user: req.session.user,
      vocabularyList,
      success: 'Vocabulary updated successfully!',
    });
  } catch (error) {
    console.error('Error updating vocabulary:', error);
    res.status(500).render('dictionary', {
      error: 'Internal server error',
      user: req.session.user,
      vocabularyList: await Vocabulary.find(),
    });
  }
});

export default router;
