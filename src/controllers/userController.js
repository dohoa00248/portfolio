import Vocabulary from '../models/Vocabulary.js';
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.session.user._id;

    const vocabularies = await Vocabulary.find({ createdBy: userId }).populate(
      'createdBy',
      'username email'
    );

    return res.render('users', {
      count: vocabularies.length,
      vocabularies,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

const createVocabulary = async (req, res) => {
  try {
    const { word, pronunciation, partOfSpeech, meaning, examples } = req.body;

    const newVocabulary = new Vocabulary({
      word,
      pronunciation,
      partOfSpeech,
      meaning,
      examples,
      createdBy: req.session.user._id,
    });

    await newVocabulary.save();

    console.log(
      `Created new vocabulary "${word}" by ${req.session.user.username}`
    );

    return res.json({
      message: 'created success',
      newVocabulary: newVocabulary,
    });
    return res.redirect('/api/v1/users/dashboard');
  } catch (error) {
    console.error('Error creating vocabulary:', error.message);
    return res.status(500).render('error', {
      message: 'Internal Server Error',
      error,
    });
  }
};
export default {
  getUserDashboard,
  createVocabulary,
};
