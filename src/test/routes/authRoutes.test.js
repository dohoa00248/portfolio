import express from 'express';
import session from 'express-session';
import auth from '../../test/middlewares/auth.test.js';
// import jwt from 'jsonwebtoken';

const router = express.Router();

// router.get('/dashboard', (req, res) => {
//   res.render('dashboard.ejs');
// });

router.get('/signin', (req, res) => {
  res.render('signin.ejs');
});

const users = [
  {
    username: 'admin',
    password: 'admin',
    role: 1,
  },
];

router.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).render('signin.ejs');
    }

    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return res.status(401).render('signin.ejs');
    }

    console.log(req.session);
    req.session.user = user;
    console.log(req.session);

    return res.redirect('/api/v1/admin/dictionary');
  } catch (err) {
    return res.status(500).render('signin.ejs');
  }
});

router.get('/dictionary-test', auth.authSignin, (req, res) => {
  // Đây là handler chính sau khi đã xác thực
  res.render('dictionary.ejs');
});

// router.post('/signin', (req, res) => {
//   try {
//     const token = req.headers;
//     console.log('Token:', token);
//     const { username, password } = req.body;
//     console.log('username:', username + ' and ' + 'password:', password);
//     res.status(200).json({ data: username, password });
//   } catch (error) {
//     res.status(500).json({ error: 'message' });
//   }
// });

export default router;
