import express from 'express';
import bcrypt from 'bcryptjs';
import auth from '../../test/middlewares/auth.test.js';
import User from '../models/User.test.js';
import Vocabulary from '../models/Vocabulary.test.js';
import Project from '../../models/Project.js';

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
    return res.render('admin-dashboard.ejs', {
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
router.get('/users', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
    const users = await User.find({});
    const totalUsers = await User.countDocuments();
    res.render('admin-users.ejs', {
      currentUser,
      users,
      totalUsers,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Server error');
  }
});
router.get('/projects', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
    const projects = await Project.find({});
    const totalProjects = await Project.countDocuments();
    return res.status(200).render('admin-projects', {
      projects,
      currentUser,
      totalProjects,
    });
  } catch (error) {
    console.error('error load projects');
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
});
router.get('/dictionary', auth.authSignin, async (req, res) => {
  try {
    // throw new Error('Test error dashboard');
    const currentUser = req.session.user;
    const vocabularies = await Vocabulary.find({});
    res.render('admin-dictionary', {
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
    res.render('admin-statistics', {
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

/**
 * USER PROFILE ROUTES
 */
router.get('/users/profile', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
    const user = await User.findById(currentUser._id);
    if (!user) return res.status(404).send('User not found');
    res.render('update-profile', { currentUser });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send('Server error');
  }
});

router.put('/users/profile', auth.authSignin, async (req, res) => {
  try {
    const { username, email, firstName, lastName } = req.body;
    // console.log(req.body);
    const updatedUser = await User.findByIdAndUpdate(
      req.session.user._id,
      { username, email, firstName, lastName },
      { new: true }
    );
    // console.log(updatedUser);
    req.session.user = updatedUser;
    return res.redirect('/api/v1/auth/signin');
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).send('Server error');
  }
});

/**
 * USER MANAGEMENT ROUTES (ADMIN)
 */
router.get('/users/create', auth.authSignin, (req, res) => {
  const currentUser = req.session.user;
  res.render('create-user.ejs', { currentUser });
});

router.post('/users', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { username, password, email } = req.body;

    if (currentUser.role > 1) {
      return res.status(403).render('error', {
        message: 'You do not have permission to create users.',
      });
    }

    if (!username || !password) {
      return res.status(400).render('create-user.ejs', {
        error: 'All fields are required.',
        currentUser,
      });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).render('create-user.ejs', {
        error: 'Username already exists.',
        currentUser,
      });
    }

    let role = 2; // default User
    if (currentUser.role === 0) {
      role = req.body.role;
    } else if (currentUser.role === 1) {
      if (req.body.role == 1 || req.body.role == 2 || req.body.role == 3) {
        role = req.body.role;
      }
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

    return res.render('admin-users', {
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
      return res.status(404).render('admin-users', {
        currentUser,
        users: await User.find(),
        error: 'User not found',
      });
    }

    if (currentUser.role === 0) {
    } else if (currentUser.role === 1) {
      if (userToUpdate.role === 0 || userToUpdate.role === 1) {
        return res.status(403).render('admin-users', {
          currentUser,
          users: await User.find(),
          error: 'You do not have permission to update this user',
        });
      }
    } else {
      return res.status(403).render('admin-users', {
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
    res.status(200).render('admin-users', {
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
        currentUser,
        userById: null,
      });
    }

    if (currentUser.role === 0) {
    } else if (currentUser.role === 1) {
      if (userById.role === 0 || userById.role === 1) {
        return res.status(403).render('change-password', {
          error: 'You do not have permission to change password for this user',
          currentUser,
          userById,
        });
      }
    } else {
      if (currentUser._id.toString() !== id) {
        return res.status(403).render('change-password', {
          error: 'You do not have permission to change password for this user',
          currentUser,
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
          currentUser,
          userById,
        });
      }
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    userById.password = hashedNewPassword;
    await userById.save();

    const users = await User.find();

    res.render('users', {
      currentUser,
      users,
      message: 'Password changed successfully',
      error: null,
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).render('error', {
      message: 'Internal server error',
      error,
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
      return res.status(404).render('admin-users', {
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
        return res.status(403).render('admin-users', {
          currentUser,
          users: await User.find(),
          error: 'You do not have permission to delete this user.',
        });
      }
    } else {
      return res.status(403).render('admin-users', {
        currentUser,
        users: await User.find(),
        error: 'You do not have permission to delete users.',
      });
    }

    const users = await User.find();

    res.status(200).render('admin-users', {
      currentUser,
      users,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    console.error(error);

    res.status(500).render('admin-users', {
      error: 'Server error.',
      currentUser,
      users: await User.find(),
    });
  }
});

// project
router.post(
  '/projects',
  auth.authSignin,
  auth.checkSuperAdmin,
  async (req, res) => {
    try {
      const { title, tech, description, live, github } = req.body;

      const newProject = new Project({
        title,
        tech,
        description,
        live,
        github,
      });
      await newProject.save();

      res.redirect('/api/v1/admin/projects');
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).render('error', {
        message: 'Internal Server Error',
        error,
      });
    }
  }
);

router.get('/projects/:id', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).render('error', { message: 'Project not found' });
    }

    res.render('project-detail', { project, currentUser });
  } catch (error) {
    console.error('Error loading project edit:', error);
    res
      .status(500)
      .render('error', { message: 'Internal Server Error', error });
  }
});
router.put(
  '/projects/:id',
  auth.authSignin,
  auth.checkSuperAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, tech, description, live, github } = req.body;

      const updatedProject = await Project.findByIdAndUpdate(
        id,
        { title, tech, description, live, github },
        { new: true }
      );

      if (!updatedProject) {
        return res
          .status(404)
          .render('error', { message: 'Project not found.' });
      }

      res.redirect('/api/v1/admin/projects');
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).render('error', {
        message: 'Internal Server Error',
        error,
      });
    }
  }
);

router.delete(
  '/projects/:id',
  auth.authSignin,
  auth.checkSuperAdmin,
  async (req, res) => {
    try {
      await Project.findByIdAndDelete(req.params.id);
      res.redirect('/api/v1/admin/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).render('error', {
        message: 'Internal Server Error',
        error,
      });
    }
  }
);
// dictionary
router.post('/dictionary', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
    console.log(currentUser);
    const { word, pronunciation, partOfSpeech, meaning, examples } = req.body;

    const newVocabulary = new Vocabulary({
      word,
      pronunciation,
      partOfSpeech,
      meaning,
      examples,
    });
    await newVocabulary.save();

    console.log(
      'Vocabulary is created by',
      currentUser.username,
      ':',
      newVocabulary
    );

    const vocabularies = await Vocabulary.find({});

    res.status(200).render('admin-dictionary', {
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
router.get('/dictionary/search', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { query } = req.query;

    if (!query) {
      const vocabularies = await Vocabulary.find();

      return res.status(400).render('admin-dictionary', {
        currentUser,
        vocabularies,
      });
    }

    const vocabularies = await Vocabulary.find({
      word: { $regex: query, $options: 'i' },
    });

    res.render('admin-dictionary', {
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
      return res.status(404).render('admin-dictionary', {
        error: 'Vocabulary not found',
        user: req.session.user,
        vocabularies: await Vocabulary.find(),
      });
    }
    console.log('Update by:', req.session.user);

    const vocabularies = await Vocabulary.find();

    return res.status(200).render('admin-dictionary', {
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

    res.render('admin-dictionary', {
      currentUser,
      vocabularies,
    });
  } catch (error) {
    console.error('Error deleting vocabulary:', error.message);
    res.status(500).render('error', {
      message: 'Internal server error',
      error,
    });
  }
});

export default router;
