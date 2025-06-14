import Project from '../models/Project.js';
const getHomePage = async (req, res) => {
  //   res.send('Hello world');
  const dataList = await Project.find({});
  // console.log('Data list:', dataList);
  res.status(200).render('home.ejs', { dataList });
};

const getTestPage = async (req, res) => {
  const dataList = await Project.find({});
  // console.log('Data list:', dataList);
  res.status(200).render('test.ejs', { dataList });
};
const getDictionaryPage = (req, res) => {
  res.render('dictionary.ejs');
};

export default {
  getHomePage,
  getTestPage,
  getDictionaryPage,
};
