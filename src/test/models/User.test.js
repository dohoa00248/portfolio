import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: false,
      trim: true,
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: false,
    },
    role: {
      type: Number,
      enum: [1, 2, 3],
      required: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('UserTest', userSchema);

export default User;
