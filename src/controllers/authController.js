import User from '../models/User.js';
import bcrypt from 'bcryptjs';
const getSigninPage = (req, res) => {
  return res.render('signin');
};
const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Validate input
    if (!username || !password) {
      return res.status(400).render('signin.ejs', {
        error: 'Username and password are required.',
      });
    }

    // 2. Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).render('signin.ejs', {
        error: 'Invalid username or password.',
      });
    }

    // 3. Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).render('signin.ejs', {
        error: 'Invalid username or password.',
      });
    }

    // 4. Store user info in session
    // req.session.user = user;
    req.session.user = {
      _id: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    console.log(req.session);

    if (user.role === 0 || user.role === 1) {
      return res.redirect('/api/v1/admin/dashboard');
    } else {
      return res.redirect('/api/v1/user/dashboard');
    }

    // // 5. Redirect to admin dashboard
    // return res.redirect('/api/v1/admin/dashboard');
  } catch (error) {
    console.error('Error during signin:', error);
    return res.status(500).render('signin.ejs', {
      error: 'Internal server error. Please try again.',
    });
  }
};
const signOut = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Signout error:', err);
    }

    res.clearCookie('connect.sid');
    res.redirect('/api/v1/auth/signin');
  });
};
export default {
  getSigninPage,
  signIn,
  signOut,
};
