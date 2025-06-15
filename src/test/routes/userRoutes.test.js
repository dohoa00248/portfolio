import express from 'express';
import ProjectTest from '../models/Project.test.js';
// import Vocabulary from '../models/Vocabulary.test.js';
const router = express.Router();

// router.get('/projects', async (req, res) => {
//   try {
//     const dataList = await ProjectTest.find({});
//     console.log('Data list:', dataList);
//     res.status(200).render('test.ejs', { dataList });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).render('error', { message: 'Internal server error' });
//   }
// });

router.get('/projects', async (req, res) => {
  try {
    const dataList = await ProjectTest.find({});
    console.log('Data list:', dataList);
    res.status(200).json({ dataList: dataList });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: 'Internal server error' });
  }
});

router.get('/projects/:id', async (req, res) => {
  try {
    console.log('Req params:', req.params);
    // const id = req.params.id;
    const { id } = req.params;
    console.log('Id:', id);
    const projectId = await ProjectTest.findById(id);
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

    const newProject = new ProjectTest(data);
    await newProject.save();
    console.log('Data save:', data);

    res.status(201).json({ data: newProject });
  } catch (error) {
    // console.error()
    res.status(400).json({ error: 'message' });
  }
});

router.put('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    const updatedProject = await ProjectTest.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json({ data: updatedProject });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Id:', id);
    const results = await ProjectTest.deleteOne({ _id: id });
    console.log('Results: ', results);
    res.status(200).json({ data: results });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(400).json({ error: 'message' });
  }
});

const myLogger = function (req, res, next) {
  console.log('LOGGED');
  next();
};

router.get('/mylogger', myLogger, (req, res) => {
  res.send('Hello World!');
});

router.get('/admin', (req, res) => {
  res.render('dashboard.ejs');
});

export default router;
