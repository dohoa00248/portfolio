const authSignin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(302).redirect('/api/v1/auth/signin');
  }
  next();
};
const checkSuperAdmin = (req, res, next) => {
  const currentUser = req.session.user;

  if (!currentUser || currentUser.role !== 0) {
    return res.status(403).render('error', {
      message: 'You do not have permission to perform this action.',
      error: {},
    });
  }

  next();
};
export default {
  authSignin,
  checkSuperAdmin,
};
