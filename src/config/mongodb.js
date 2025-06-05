import mongoose from 'mongoose';

const connectMongoDB = async () => {
  try {
    // console.log(process.env.DB_MONGODB_URI);
    await mongoose.connect(process.env.DB_MONGODB_URI);

    console.log('Connected to MongoDB successfully.');
  } catch (error) {
    console.log('Connection to MongoDB failed.');
  }
};
// connectMongoDB();
export default connectMongoDB;
