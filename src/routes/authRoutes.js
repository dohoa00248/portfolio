import express from 'express';
import session from 'express-session';

const router = express.Router();

router.get('/signin', (req, res) => {
  res.render('signin');
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

export default router;
