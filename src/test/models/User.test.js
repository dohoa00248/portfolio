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
      enum: [0, 1, 2, 3],
      required: false,
      // 0: superAdmin; 1: admin; 2: user; 3: guest
    },
  },
  { timestamps: true }
);

const User = mongoose.model('UserTest', userSchema);

export default User;
