import User from '../models/User.js';
import Vocabulary from '../models/Vocabulary.js';
import Project from '../models/Project.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import xlsx from 'xlsx';
import fs from 'fs';
const getAdminDashboard = async (req, res) => {
  try {
    const currentUser = req.session.user;

    const [users, totalUsers, totalVocabulary, totalProjects] =
      await Promise.all([
        User.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('username email')
          .lean(),
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
};

const getUsersPage = async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { search, page } = req.query;

    const searchQuery = search ? search.trim() : '';
    const pageNum = parseInt(page) || 1;
    const limit = 10;
    const skip = (pageNum - 1) * limit;

    const queryObj = searchQuery
      ? { username: { $regex: searchQuery, $options: 'i' } }
      : {};

    const [users, totalUsers] = await Promise.all([
      User.find(queryObj)
        .sort({ role: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('username firstName lastName email role createdAt updatedAt')
        .lean(),
      User.countDocuments(queryObj),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    return res.render('admin-users', {
      currentUser,
      users,
      totalUsers,
      totalPages,
      currentPage: pageNum,
      search: searchQuery,
    });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const getProjectsPage = async (req, res) => {
  try {
    const currentUser = req.session.user;

    const { search, page } = req.query;

    const searchQuery = search ? search.trim() : '';

    const pageNum = parseInt(page) || 1;
    const limit = 10;
    const skip = (pageNum - 1) * limit;

    const queryObj = searchQuery
      ? { title: { $regex: searchQuery, $options: 'i' } }
      : {};

    const [projects, totalProjects] = await Promise.all([
      Project.find(queryObj)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title tech description live github')
        .lean(),
      Project.countDocuments(queryObj),
    ]);

    const totalPages = Math.ceil(totalProjects / limit);

    return res.status(200).render('admin-projects', {
      currentUser,
      projects,
      totalProjects,
      totalPages,
      currentPage: pageNum,
      search: searchQuery,
    });
  } catch (error) {
    console.error('Error loading projects:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const getDictionaryPage = async (req, res) => {
  try {
    const currentUser = req.session.user;

    const { search, page } = req.query;

    const searchQuery = search ? search.trim() : '';

    const pageNum = parseInt(page) || 1;
    const limit = 10;
    const skip = (pageNum - 1) * limit;

    const queryObj = searchQuery
      ? { word: { $regex: searchQuery, $options: 'i' } }
      : {};

    const [vocabularies, totalVocabularies] = await Promise.all([
      Vocabulary.find(queryObj)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          'word pronunciation partOfSpeech meaning example createdAt updatedAt'
        )
        .lean(),
      Vocabulary.countDocuments(queryObj),
    ]);

    const totalPages = Math.ceil(totalVocabularies / limit);

    return res.render('admin-dictionary', {
      currentUser,
      vocabularies,
      totalVocabularies,
      totalPages,
      currentPage: pageNum,
      search: searchQuery,
    });
  } catch (error) {
    console.error('Error fetching dictionary:', error.message);

    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const getStatisticsPage = async (req, res) => {
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
};

const getProfilePage = async (req, res) => {
  try {
    const currentUser = req.session.user;

    const user = await User.findById(currentUser._id).lean();

    if (!user) {
      return res.status(404).render('error', { message: 'User not found' });
    }

    return res.render('update-profile', { currentUser: user });
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, email, firstName, lastName } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.session.user._id,
      { username, email, firstName, lastName },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).render('error', {
        message: 'User not found.',
      });
    }

    req.session.user = updatedUser;

    return res.redirect('/api/v1/admin/users/profile');
  } catch (error) {
    console.error('Error updating profile:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};
const getCreateUserPage = async (req, res) => {
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
};
const createUser = async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { username, password, email } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).render('create-user.ejs', {
        error: 'Username and password are required.',
        currentUser,
      });
    }

    // Check existing username
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).render('create-user.ejs', {
        error: 'Username already exists.',
        currentUser,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with assigned role from middleware
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: req.newUserRole,
    });

    await newUser.save();

    console.log(`User ${username} created by ${currentUser.username}`);

    // Redirect back to user list with success query
    return res.redirect('/api/v1/admin/users');
  } catch (error) {
    console.error('Error creating user:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};
const getUserById = async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { id } = req.params;
    const userById = await User.findById(id).lean();

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
};
const updateUser = async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { username, email, firstName, lastName } = req.body;
    const { id } = req.params;

    const existingUser = await User.findOne({ username, _id: { $ne: id } });
    if (existingUser) {
      return res.status(400).render('user-detail', {
        error: 'Username already exists.',
        currentUser,
        userById: await User.findById(id).lean(),
      });
    }
    const updateData = {
      username,
      email,
      firstName,
      lastName,
      role: req.updateUserRole,
    };

    await User.findByIdAndUpdate(id, updateData);

    console.log(`Updated user ${id} by ${currentUser.username}`);

    return res.redirect('/api/v1/admin/users');
  } catch (error) {
    console.error('Error updating user:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const getChangePasswordPage = async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { id } = req.params;
    const userById = await User.findById(id).lean();
    // console.log(userById);
    if (!userById) {
      return res.status(404).render('error', {
        message: 'User not found.',
      });
    }

    return res.render('change-password', {
      currentUser,
      userById,
    });
  } catch (err) {
    console.error('Error loading change password page:', err.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
    });
  }
};

const changPassWord = async (req, res) => {
  try {
    const currentUser = req.session.user;
    const { newPassword } = req.body;
    const { id } = req.params;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(id, { password: hashedPassword });

    console.log(`Password of user ${id} changed by ${currentUser.username}`);

    return res.redirect('/api/v1/admin/users');
  } catch (error) {
    console.error('Error changing password:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};
const deleteUser = async (req, res) => {
  try {
    const currentUser = req.session.user;
    const userToDelete = req.userToDelete;

    await userToDelete.deleteOne();
    console.log(`Deleted user ${userToDelete._id} by ${currentUser.username}`);

    return res.redirect('/api/v1/admin/users');
  } catch (error) {
    console.error('Error deleting user:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};

const createProject = async (req, res) => {
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
};

//projects
const getProjectById = async (req, res) => {
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
};

const updateProject = async (req, res) => {
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
};

const deleteProject = async (req, res) => {
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
};

const createVocabulary = async (req, res) => {
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
};
const exportDictionary = async (req, res) => {
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
};

const getVocabById = async (req, res) => {
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
};

const updateVocab = async (req, res) => {
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
};

const deleteVocab = async (req, res) => {
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
};

const importVocab = async (req, res) => {
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

    const normalizedData = data.map((item) => {
      const obj = {};
      for (let key in item) {
        obj[key.trim().toLowerCase()] = item[key];
      }
      return obj;
    });

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

    const validData = formattedData.filter(
      (item) => item.word && item.meaning && item.partOfSpeech
    );

    const skipped = formattedData.length - validData.length;

    if (validData.length > 0) {
      await Vocabulary.insertMany(validData);
    }

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
};
export default {
  getAdminDashboard,
  getUsersPage,
  getProjectsPage,
  getDictionaryPage,
  getStatisticsPage,
  getProfilePage,
  updateProfile,
  getCreateUserPage,
  createUser,
  getUserById,
  updateUser,
  getChangePasswordPage,
  changPassWord,
  deleteUser,
  createProject,
  //projects
  getProjectById,
  updateProject,
  deleteProject,
  //dictionary
  createVocabulary,
  exportDictionary,
  getVocabById,
  updateVocab,
  deleteVocab,
  importVocab,
};
