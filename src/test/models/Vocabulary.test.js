import mongoose from 'mongoose';

const vocabularySchema = new mongoose.Schema({
  no: Number,
  vocabulary: String,
  pronunciation: String,
  partOfSpeech: String,
  meaning: String,
  raw: [String],
});

const Vocabulary = mongoose.model('Vocabulary', vocabularySchema);
export default Vocabulary;
