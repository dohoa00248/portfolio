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
    const currentUser = req.session.user;
    const users = await User.find({});
    const totalUsers = await User.countDocuments();
    const totalVocabulary = await Vocabulary.countDocuments();
    // console.log('Total Users:', totalUsers);
    // console.log('Total Vocabulary:', totalVocabulary);
    return res.render('dashboard.ejs', {
      currentUser,
      users,
      totalUsers,
      totalVocabulary,
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
    const currentUser = req.session.user;
    const vocabularies = await Vocabulary.find({});
    res.render('dictionary', {
      currentUser,
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

router.get('/statistics', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
    const totalUsers = await User.countDocuments();
    const totalVocabulary = await Vocabulary.countDocuments();
    res.render('statistics', {
      currentUser,
      totalUsers,
      totalVocabulary,
    });
  } catch (error) {
    console.error('Error', error);
    return res.status(500).render('error.ejs', {
      message: 'Server error while loading.',
      error,
    });
  }
});

router.post('/dictionary', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
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
      currentUser,
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

/**
 * USER PROFILE ROUTES
 */
router.get('/users/profile', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
    const user = await User.findById(req.session.user._id);
    if (!user) return res.status(404).send('User not found');
    res.render('update-profile', { currentUser });
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
    const currentUser = req.session.user;
    const users = await User.find({});
    const totalUsers = await User.countDocuments();
    res.render('users.ejs', {
      currentUser,
      users,
      totalUsers,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Server error');
  }
});

router.get('/users/create', auth.authSignin, (req, res) => {
  const currentUser = req.session.user;
  res.render('create-user.ejs', { currentUser });
});

router.post('/users', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
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
        currentUser,
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
    res.status(500).render('error', {
      message: 'Server error. Please try again.',
      error,
    });
  }
});

router.get('/users/search', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { query } = req.query;

    if (!query) {
      return res.render('users', {
        user: req.session.user,
        error,
      });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        // { email: { $regex: query, $options: 'i' } },
      ],
    }).sort({ createdAt: -1 });

    return res.render('users', {
      currentUser,
      users,
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return res.status(500).render('error', {
      message: 'Internal server error',
      error,
    });
  }
});

router.get('/dictionary/search', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
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
      currentUser,
      vocabularies,
    });
  } catch (error) {
    console.error('Error searching dictionary:', error);
    res.status(500).render('error', {
      message: 'Internal server error when searching dictionary.',
      error,
    });
  }
});

router.get('/users/:id', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { id } = req.params;
    const userById = await User.findById(id);

    if (!userById) {
      return res.status(404).render('user-detail', {
        error: 'User not found',
      });
    }

    res.render('user-detail', {
      currentUser,
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
    const currentUser = req.session.user;
    const { id } = req.params;
    const { username, email, firstName, lastName, password, role } = req.body;

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).render('users', {
        currentUser,
        users: await User.find(),
        error: 'User not found',
      });
    }

    if (currentUser.role === 0) {
    } else if (currentUser.role === 1) {
      if (userToUpdate.role === 0 || userToUpdate.role === 1) {
        return res.status(403).render('users', {
          currentUser,
          users: await User.find(),
          error: 'You do not have permission to update this user',
        });
      }
    } else {
      return res.status(403).render('users', {
        currentUser,
        users: await User.find(),
        error: 'You do not have permission to update users',
      });
    }

    const updateData = { username, email, firstName, lastName };

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    if (currentUser.role === 0) {
      updateData.role = role;
    } else if (
      currentUser.role === 1 &&
      (userToUpdate.role === 2 || userToUpdate.role === 3)
    ) {
      updateData.role = role;
    }

    await User.findByIdAndUpdate(id, updateData, { new: true });

    const users = await User.find();
    res.status(200).render('users', {
      currentUser,
      users,
      message: 'User updated successfully',
      error: null,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).render('error', {
      message: 'Internal server error',
      error,
    });
  }
});

router.get('/users/:id/change-password', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { id } = req.params;
    const userById = await User.findById(id);
    if (!userById) {
      return res.status(404).send('User not found');
    }

    res.render('change-password', {
      currentUser,
      userById,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/users/:id/change-password', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { currentPassword, newPassword } = req.body;
    const { id } = req.params;

    const userById = await User.findById(id);

    if (!userById) {
      return res.status(404).render('change-password', {
        error: 'User not found',
        user: currentUser,
        userById: null,
      });
    }

    if (currentUser.role === 0) {
    } else if (currentUser.role === 1) {
      if (userById.role === 0 || userById.role === 1) {
        return res.status(403).render('change-password', {
          error: 'You do not have permission to change password for this user',
          user: currentUser,
          userById,
        });
      }
    } else {
      if (currentUser._id.toString() !== id) {
        return res.status(403).render('change-password', {
          error: 'You do not have permission to change password for this user',
          user: currentUser,
          userById,
        });
      }
    }

    let isMatch = true;
    if (currentUser.role === 0 || currentUser.role === 1) {
    } else {
      isMatch = await bcrypt.compare(currentPassword, userById.password);
      if (!isMatch) {
        return res.status(400).render('change-password', {
          error: 'Current password is incorrect',
          user: currentUser,
          userById,
        });
      }
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    userById.password = hashedNewPassword;
    await userById.save();

    const users = await User.find();

    res.render('users', {
      user: currentUser,
      users,
      message: 'Password changed successfully',
      error: null,
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).render('change-password', {
      error: 'Internal server error',
      user: req.session.user,
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
    const currentUser = req.session.user;
    const { id } = req.params;

    const userToDelete = await User.findById(id);

    if (!userToDelete) {
      return res.status(404).render('users', {
        currentUser,
        users: await User.find(),
        error: 'User not found.',
      });
    }

    if (currentUser.role === 0) {
      await userToDelete.deleteOne();
    } else if (currentUser.role === 1) {
      if (userToDelete.role >= 2) {
        await userToDelete.deleteOne();
      } else {
        return res.status(403).render('users', {
          user: currentUser,
          users: await User.find(),
          error: 'You do not have permission to delete this user.',
        });
      }
    } else {
      return res.status(403).render('users', {
        currentUser,
        users: await User.find(),
        error: 'You do not have permission to delete users.',
      });
    }

    const users = await User.find();

    res.status(200).render('users', {
      currentUser,
      users,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    console.error(error);

    res.status(500).render('users', {
      error: 'Server error.',
      currentUser,
      users: await User.find(),
    });
  }
});

// dictionary
router.get('/dictionary/:id', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { id } = req.params;
    const vocabulary = await Vocabulary.findById(id);

    if (!vocabulary) {
      return res.status(404).render('vocabulary-detail', {
        error: 'Vocabulary not found',
      });
    }

    res.render('vocabulary-detail', {
      currentUser,
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
    const currentUser = req.session.user;
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
      currentUser,
      vocabularies,
    });
  } catch (error) {
    console.error('Error updating vocabulary:', error);
    return res.status(500).render('error', {
      message: 'Internal server error',
      error,
    });
  }
});

router.delete('/dictionary/:id', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { id } = req.params;
    await Vocabulary.findByIdAndDelete(id);

    const vocabularies = await Vocabulary.find();

    res.render('dictionary', {
      currentUser,
      vocabularies,
    });
  } catch (error) {
    console.error('Error deleting vocabulary:', error.message);
    res.status(500).render('dictionary', {
      message: 'Internal server error',
      error,
    });
  }
});

export default router;
