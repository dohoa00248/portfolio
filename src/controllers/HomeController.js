const getHomePage = (req, res) => {
  //   res.send('Hello world');
  res.render('home.ejs');
};

export default {
  getHomePage,
};
