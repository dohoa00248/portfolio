import User from '../models/User.js';
import Vocabulary from '../models/Vocabulary.js';
import Project from '../models/Project.js';

const getAdminDashboard = async (req, res) => {
  try {
    const currentUser = req.session.user;

    const [users, totalUsers, totalVocabulary, totalProjects] =
      await Promise.all([
        User.find().limit(5),
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
};

const getProjectsPage = async (req, res) => {
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
};

const getDictionaryPage = async (req, res) => {
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
export default {
  getAdminDashboard,
  getUsersPage,
  getProjectsPage,
  getDictionaryPage,
  getStatisticsPage,
};
