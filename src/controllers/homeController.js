import Project from '../models/Project.js';
const getHomePage = async (req, res) => {
  //   res.send('Hello world');
  const dataList = await Project.find({});
  console.log('Data list:', dataList);
  res.status(200).render('home.ejs', { dataList }); // render 'projects.ejs'
  // res.render('home.ejs');
};
const getTestPage = (req, res) => {
  res.render('test.ejs');
};
const getDictionaryPage = (req, res) => {
  res.render('dictionary.ejs');
};

export default {
  getHomePage,
  getTestPage,
  getDictionaryPage,
};
