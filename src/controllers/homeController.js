const getHomePage = (req, res) => {
  //   res.send('Hello world');
  res.render('home.ejs');
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
