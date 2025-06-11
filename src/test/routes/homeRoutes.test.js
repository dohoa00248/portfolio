import express from 'express';
import homeController from '../../controllers/homeController.js';

const router = express.Router();

// Dummy users
// var users = [
//   { id: 0, name: 'tj', email: 'tj@vision-media.ca', role: 'member' },
//   { id: 1, name: 'ciaran', email: 'ciaranj@gmail.com', role: 'member' },
//   {
//     id: 2,
//     name: 'aaron',
//     email: 'aaron.heckmann+github@gmail.com',
//     role: 'admin',
//   },
// ];

// function loadUser(req, res, next) {
//   // You would fetch your user from the db
//   var user = users[req.params.id];
//   console.log(user);
//   if (user) {
//     req.user = user;
//     next();
//   } else {
//     next(new Error('Failed to load user ' + req.params.id));
//   }
// }

// router.get('/user/:id', loadUser, function (req, res) {
//   res.send('Viewing user ' + req.user.name);
// });

// router.get('/api/v1/home', HomeController.getHomePage);

router.get('/', homeController.getHomePage);

router.get('/test', homeController.getTestPage);

router.get('/dictionary', homeController.getDictionaryPage);

// router.get(
//   '/dictionary-test',
//   (req, res, next) => {
//     if (req.session.user) {
//       return next(); // Cho phép đi tiếp
//     }
//     return res.redirect('/api/v1/auth/signin'); // Chưa đăng nhập
//   },
//   (req, res) => {
//     // Đây là handler chính sau khi đã xác thực
//     res.render('dictionary.ejs');
//   }
// );
export default router;
