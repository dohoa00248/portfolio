import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Vocabulary from '../models/Vocabulary.js';
import upload from '../middlewares/upload.js';
import auth from '../middlewares/auth.js';
import path from 'path';
import xlsx from 'xlsx';
import fs from 'fs';

const router = express.Router();

/**
 * DASHBOARD ROUTES
 */
router.get('/dashboard', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;

    const [users, totalUsers, totalVocabulary, totalProjects] =
      await Promise.all([
        User.find(),
        User.countDocuments(),
        Vocabulary.countDocuments(),
        Project.countDocuments(),
      ]);

    return res.render('admin-dashboard', {
      currentUser,
      users,
      totalUsers,
      totalVocabulary,
      totalProjects,
    });
  } catch (error) {
    console.error('Error loading dashboard:', error.message);

    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
});

router.get('/users', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
    const users = await User.find();
    const totalUsers = await User.countDocuments();

    return res.render('admin-users', {
      currentUser,
      users,
      totalUsers,
    });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
});

router.get('/projects', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
    const projects = await Project.find();
    const totalProjects = await Project.countDocuments();

    return res.status(200).render('admin-projects', {
      currentUser,
      projects,
      totalProjects,
    });
  } catch (error) {
    console.error('Error loading projects:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
});

router.get('/dictionary', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
    const vocabularies = await Vocabulary.find();

    return res.render('admin-dictionary', {
      currentUser,
      vocabularies,
    });
  } catch (error) {
    console.error('Error fetching dictionary:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
});

router.get('/statistics', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;

    const totalUsers = await User.countDocuments();
    const totalVocabulary = await Vocabulary.countDocuments();
    const totalProjects = await Project.countDocuments();

    return res.render('admin-statistics', {
      currentUser,
      totalUsers,
      totalVocabulary,
      totalProjects,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
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
    if (!user) {
      console.error(`User ${currentUser._id} not found`);
      return res.status(404).render('error', {
        message: 'User not found',
      });
    }

    return res.render('update-profile', { currentUser: user });
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
});

router.put('/users/profile', auth.authSignin, async (req, res) => {
  try {
    const { username, email, firstName, lastName } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.session.user._id,
      { username, email, firstName, lastName },
      { new: true }
    );

    // Cập nhật lại session user sau khi update
    req.session.user = updatedUser;

    console.log(`Updated profile for user ${updatedUser.username}`);

    return res.redirect('/api/v1/auth/signin');
  } catch (error) {
    console.error('Error updating profile:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
});

/**
 * USER MANAGEMENT ROUTES (ADMIN)
 */
router.get('/users/create', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;

    return res.render('create-user.ejs', {
      currentUser,
    });
  } catch (error) {
    console.error('Error loading create user page:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
});

router.post('/users', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { username, password, email, role: roleInput } = req.body;

    if (currentUser.role > 1) {
      return res.status(403).render('error', {
        message: 'You do not have permission to create users.',
      });
    }

    if (!username || !password) {
      return res.status(400).render('create-user.ejs', {
        error: 'Username and password are required.',
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

    let role = 2;
    if (currentUser.role === 0) {
      role = roleInput;
    } else if (currentUser.role === 1) {
      if ([1, 2, 3].includes(Number(roleInput))) {
        role = roleInput;
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

    console.log(`User ${username} created by ${currentUser.username}`);

    return res.redirect('/api/v1/admin/users');
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
});

router.get('/users/search', auth.authSignin, async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { query } = req.query;

    if (!query) {
      const users = await User.find().sort({ createdAt: -1 });
      return res.render('admin-users', {
        currentUser,
        users,
        error: 'Please enter a search query.',
      });
    }

    const users = await User.find({
      username: { $regex: query, $options: 'i' },

      // email: { $regex: query, $options: 'i' },
    }).sort({ createdAt: -1 });

    return res.render('admin-users', {
      currentUser,
      users,
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
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
      return res.status(404).render('error', {
        message: 'User not found.',
      });
    }

    return res.render('user-detail', {
      currentUser,
      userById,
    });
  } catch (error) {
    console.error('Error fetching user details:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
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
      return res.status(404).render('error', {
        message: 'User not found.',
      });
    }

    // Permission check
    if (currentUser.role === 1) {
      if (userToUpdate.role === 0 || userToUpdate.role === 1) {
        return res.status(403).render('error', {
          message: 'You do not have permission to update this user.',
        });
      }
    } else if (currentUser.role !== 0) {
      return res.status(403).render('error', {
        message: 'You do not have permission to update users.',
      });
    }

    const updateData = { username, email, firstName, lastName };

    // Update password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update role if permitted
    if (currentUser.role === 0) {
      updateData.role = role;
    } else if (
      currentUser.role === 1 &&
      (userToUpdate.role === 2 || userToUpdate.role === 3)
    ) {
      updateData.role = role;
    }

    await User.findByIdAndUpdate(id, updateData, { new: true });

    console.log(`Updated user ${id} by ${currentUser.username}`);

    return res.redirect('/api/v1/admin/users');
  } catch (error) {
    console.error('Error updating user:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
});

router.get('/users/:id/change-password', auth.authSignin, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.session.user;

    const userById = await User.findById(id);

    if (!userById) {
      return res.status(404).render('error', {
        message: 'User not found.',
      });
    }

    if (
      currentUser.role === 0 ||
      (currentUser.role === 1 && userById.role >= 2) ||
      currentUser._id.toString() === id
    ) {
      return res.render('change-password', {
        userById,
        currentUser,
      });
    } else {
      return res.status(403).render('error', {
        message: "You do not have permission to change this user's password.",
      });
    }
  } catch (err) {
    console.error('Error loading change password page:', err.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
    });
  }
});

router.post('/users/:id/change-password', auth.authSignin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id } = req.params;

    const userById = await User.findById(id);
    if (!userById) {
      return res.status(404).render('error', {
        message: 'User not found.',
      });
    }

    const currentUser = req.session.user;

    // Check role-based permission
    if (currentUser.role === 1) {
      if (userById.role === 0 || userById.role === 1) {
        return res.status(403).render('error', {
          message:
            'You do not have permission to change password for this user.',
        });
      }
    } else if (currentUser.role !== 0) {
      if (currentUser._id.toString() !== id) {
        return res.status(403).render('error', {
          message:
            'You do not have permission to change password for this user.',
        });
      }
    }

    if (currentUser.role !== 0 && currentUser.role !== 1) {
      const isMatch = await bcrypt.compare(currentPassword, userById.password);
      if (!isMatch) {
        return res.status(400).render('change-password', {
          error: 'Current password is incorrect',
          userById,
        });
      }
    }

    // Hash and update new password
    userById.password = await bcrypt.hash(newPassword, 10);
    await userById.save();

    console.log(`Password of user ${id} changed by ${currentUser.username}`);

    return res.redirect('/api/v1/admin/users');
  } catch (error) {
    console.error('Error changing password:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
});

router.delete('/users/:id', auth.authSignin, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.session.user;

    const userToDelete = await User.findById(id);

    if (!userToDelete) {
      return res.status(404).render('error', {
        message: 'User not found.',
      });
    }

    if (
      currentUser.role === 0 ||
      (currentUser.role === 1 && userToDelete.role >= 2)
    ) {
      await userToDelete.deleteOne();
      console.log(`Deleted user ${id} by ${currentUser.username}`);
    } else {
      return res.status(403).render('error', {
        message: 'You do not have permission to delete this user.',
      });
    }

    return res.redirect('/api/v1/admin/users');
  } catch (error) {
    console.error('Error deleting user:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
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

      console.log(
        `Created new project "${title}" by ${req.session.user.username}`
      );

      return res.redirect('/api/v1/admin/projects');
    } catch (error) {
      console.error('Error creating project:', error.message);
      return res.status(500).render('error', {
        message: 'Internal Server Error',
        error,
      });
    }
  }
);

router.get('/projects/:id', auth.authSignin, async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).render('error', {
        message: 'Project not found.',
      });
    }

    console.log(`Fetched project ${id} by ${req.session.user.username}`);

    return res.render('project-detail', {
      project,
      currentUser: req.session.user,
    });
  } catch (error) {
    console.error('Error loading project detail:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
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
        return res.status(404).render('error', {
          message: 'Project not found.',
        });
      }

      console.log(`Updated project ${id} by ${req.session.user.username}`);

      return res.redirect('/api/v1/admin/projects');
    } catch (error) {
      console.error('Error updating project:', error.message);
      return res.status(500).render('error', {
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
      const { id } = req.params;

      const deletedProject = await Project.findByIdAndDelete(id);

      if (!deletedProject) {
        return res.status(404).render('error', {
          message: 'Project not found',
          error: null,
        });
      }

      console.log(`Deleted project ${id} by ${req.session.user.username}`);

      return res.redirect('/api/v1/admin/projects');
    } catch (error) {
      console.error('Error deleting project:', error.message);
      return res.status(500).render('error', {
        message: 'Internal Server Error',
        error,
      });
    }
  }
);

// dictionary
router.post('/dictionary', auth.authSignin, async (req, res) => {
  try {
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
      `Created new vocabulary "${word}" by ${req.session.user.username}`
    );

    return res.redirect('/api/v1/admin/dictionary');
  } catch (error) {
    console.error('Error creating vocabulary:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
});

router.get('/dictionary/search', auth.authSignin, async (req, res) => {
  try {
    const { query } = req.query;
    let vocabularies;

    if (!query) {
      vocabularies = await Vocabulary.find();
      console.log('No search query provided. Returning all vocabularies.');
      return res.status(400).render('admin-dictionary', {
        vocabularies,
        currentUser: req.session.user,
      });
    }

    vocabularies = await Vocabulary.find({
      word: { $regex: query, $options: 'i' },
    });

    console.log(
      `Searched vocabulary with query "${query}" by ${req.session.user.username}`
    );

    return res.render('admin-dictionary', {
      vocabularies,
      currentUser: req.session.user,
    });
  } catch (error) {
    console.error('Error searching dictionary:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
});
router.get('/dictionary/export-excel', auth.authSignin, async (req, res) => {
  try {
    // Query DB
    const vocabularies = await Vocabulary.find({}).lean();

    // Format data
    const data = vocabularies.map((vocab) => ({
      Word: vocab.word,
      Pronunciation: vocab.pronunciation,
      PartOfSpeech: vocab.partOfSpeech,
      Meaning: vocab.meaning,
      Examples: Array.isArray(vocab.examples) ? vocab.examples.join(', ') : '',
    }));

    //worksheet and workbook
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Dictionary');

    // write file Excel to buffer
    const excelBuffer = xlsx.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    // Set header to browser recive that file
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="dictionary_export.xlsx"'
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    // send file to client
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error exporting excel:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/dictionary/:id', auth.authSignin, async (req, res) => {
  try {
    const { id } = req.params;

    const vocabulary = await Vocabulary.findById(id);

    if (!vocabulary) {
      return res.status(404).render('error', {
        message: 'Vocabulary not found',
        error: null,
      });
    }

    console.log(`Fetched vocabulary ${id} by ${req.session.user.username}`);

    return res.render('vocabulary-detail', {
      vocabulary,
      currentUser: req.session.user,
    });
  } catch (error) {
    console.error('Error fetching vocabulary details:', error.message);

    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
});

router.put(
  '/dictionary/:id',
  auth.authSignin,
  auth.checkSuperAdmin,
  async (req, res) => {
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
        return res.status(404).render('error', {
          message: 'Vocabulary not found',
          error: null,
        });
      }

      console.log(`Updated vocabulary ${id} by ${req.session.user.username}`);

      return res.redirect('/api/v1/admin/dictionary');
    } catch (error) {
      console.error('Error updating vocabulary:', error.message);
      return res.status(500).render('error', {
        message: 'Internal Server Error',
        error,
      });
    }
  }
);

router.delete(
  '/dictionary/:id',
  auth.authSignin,
  auth.checkSuperAdmin,
  async (req, res) => {
    try {
      const deleted = await Vocabulary.findByIdAndDelete(req.params.id);

      if (!deleted) {
        return res.status(404).render('error', {
          message: 'Vocabulary not found',
          error: null,
        });
      }

      console.log(
        `Deleted vocabulary ${req.params.id} by ${req.session.user.username}`
      );

      return res.redirect('/api/v1/admin/dictionary');
    } catch (error) {
      console.error('Error deleting vocabulary:', error.message);
      return res.status(500).render('error', {
        message: 'Internal Server Error',
        error,
      });
    }
  }
);

router.post(
  '/dictionary/import-excel',
  upload.single('file'),
  auth.authSignin,
  auth.checkSuperAdmin,
  async (req, res) => {
    try {
      const filePath = path.join(req.file.destination, req.file.filename);

      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      const posMap = {
        n: 'noun',
        v: 'verb',
        adj: 'adjective',
        adv: 'adverb',
        prep: 'preposition',
        conj: 'conjunction',
        interj: 'interjection',
        pron: 'pronoun',
        det: 'determiner',
      };

      // Chuẩn hóa header về lowercase + trim
      const normalizedData = data.map((item) => {
        const obj = {};
        for (let key in item) {
          obj[key.trim().toLowerCase()] = item[key];
        }
        return obj;
      });

      // Format dữ liệu, gán null cho trường thiếu
      const formattedData = normalizedData.map((item) => ({
        word: item.word ? item.word.toLowerCase().trim() : null,
        pronunciation: item.pronunciation ? item.pronunciation.trim() : null,
        partOfSpeech: item.partofspeech
          ? posMap[item.partofspeech.toLowerCase().trim()] ||
            item.partofspeech.toLowerCase().trim()
          : null,
        meaning: item.meaning ? item.meaning.trim() : null,
        examples: item.examples
          ? item.examples.split(',').map((e) => e.trim())
          : [],
      }));

      // Filter bỏ những row thiếu trường bắt buộc
      const validData = formattedData.filter(
        (item) => item.word && item.meaning && item.partOfSpeech
      );

      const skipped = formattedData.length - validData.length;

      // Insert vào DB
      if (validData.length > 0) {
        await Vocabulary.insertMany(validData);
      }

      // Xóa file upload
      fs.unlinkSync(filePath);

      console.log(
        `Imported ${validData.length} vocabulary items by ${req.session.user.username}`
      );
      if (skipped > 0) {
        console.log(`Skipped ${skipped} rows due to missing required fields`);
      }

      return res.redirect('/api/v1/admin/dictionary');
    } catch (error) {
      console.error('Error importing excel:', error);
      return res.status(500).render('error', {
        message: 'Internal Server Error',
        error,
      });
    }
  }
);

export default router;
