const authSignin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(302).redirect('/api/v1/auth/signin');
  }
  next();
};

export default {
  authSignin,
};
