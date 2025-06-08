import ProjectTest from '../models/Project.test';
const getHomePage = async (req, res) => {
  //   res.send('Hello world');
  const dataList = await ProjectTest.find({});
  console.log('Data list:', dataList);
  res.status(200).render('test.ejs', { dataList });
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
