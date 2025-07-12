const getUserDashboard = async (req, res) => {
  res.status(200).render('users.ejs');
};

export default {
  getUserDashboard,
};
