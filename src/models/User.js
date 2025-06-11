import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: Number,
    enum: [1, 2, 3],
    required: false,
  },
});

const User = mongoose.model('User', userSchema);

export default User;
