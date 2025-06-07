import express from 'express';
import Project from '../models/Project.js';
// import HomeController from '../controllers/HomeController.js';

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

router.get('/', (req, res) => {
  res.render('test.ejs');
});

router.get('/projects', async (req, res) => {
  try {
    const dataList = await Project.find({});
    console.log('Data list:', dataList);
    res.status(200).render('test.ejs', { dataList }); // render 'projects.ejs'
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { message: 'Internal server error' });
  }
});

// router.get('/projects', async (req, res) => {
//   try {
//     const dataList = await Project.find({});
//     console.log('Data list:', dataList);
//     res.status(200).json({ dataList: dataList });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(400).json({ error: 'Internal server error' });
//   }
// });

router.get('/projects/:id', async (req, res) => {
  try {
    console.log('Req params:', req.params);
    // const id = req.params.id;
    const { id } = req.params;
    console.log('Id:', id);
    const projectId = await Project.findById(id);
    res.status(200).json({ data: projectId });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: 'Internal server error' });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const data = req.body;
    console.log('Data:', data);

    const newProject = new Project(data);
    await newProject.save();
    console.log('Data save:', data);

    res.status(201).json({ data: newProject });
  } catch (error) {
    res.status(400).json({ error: 'message' });
  }
});

router.put('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Id:', id);
    const data = req.body;
    console.log('Data:', data);

    const newProject = new Project(data);
    await newProject.save();
    console.log('Data save:', data);

    res.status(201).json({ data: newProject });
  } catch (error) {
    res.status(400).json({ error: 'message' });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Id:', id);
    // const data = req.body;
    // console.log('Data:', data);
    const results = await Project.deleteOne({ _id: id });
    console.log('Results: ', results);
    // const newProject = new Project(data);
    // await newProject.save();
    // console.log('Data save:', data);

    res.status(201).json({ data: results });
  } catch (error) {
    res.status(400).json({ error: 'message' });
  }
});

export default router;
