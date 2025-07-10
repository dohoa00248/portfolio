import mongoose from 'mongoose';

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.DB_MONGODB_URI);
    console.log('Connected to MongoDB successfully.');
  } catch (error) {
    console.log('Connection to MongoDB failed.');
  }
};
export default connectMongoDB;
