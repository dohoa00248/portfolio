import Project from '../models/Project.js';
const getHomePage = async (req, res) => {
  //   res.send('Hello world');
  const dataList = await Project.find({});
  // console.log('Data list:', dataList);
  res.status(200).render('home.ejs', { dataList });
};

export default {
  getHomePage,
};
