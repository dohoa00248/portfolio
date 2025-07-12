import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
      required: true,
    },
    role: {
      type: Number,
      enum: [0, 1, 2, 3],
      required: false,
      default: 2,
      // 0: superAdmin; 1: admin; 2: user; 3: guest
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
