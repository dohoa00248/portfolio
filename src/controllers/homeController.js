import Project from '../models/Project.js';
const getHomePage = async (req, res) => {
  const dataList = await Project.find({});
  res.status(200).render('home.ejs', { dataList });
};

export default {
  getHomePage,
};
