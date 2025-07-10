import mongoose from 'mongoose';

const vocabularySchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    pronunciation: {
      type: String,
      trim: true,
    },
    partOfSpeech: {
      type: String,
      enum: [
        'noun',
        'verb',
        'adjective',
        'adverb',
        'preposition',
        'conjunction',
        'interjection',
        'pronoun',
        'determiner',
        'null',
      ],
      required: true,
    },
    meaning: {
      type: String,
      required: true,
      trim: true,
    },
    examples: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Vocabulary = mongoose.model('Vocabulary', vocabularySchema);
export default Vocabulary;
