import mongoose from 'mongoose';

const connectMongoDB = async () => {
  try {
    // await mongoose.connect(
    //   `mongodb+srv://dohoa00248:7K7SnOpBH2JtrEe8@cluster0.zitgo4k.mongodb.net/test`
    // );
    // console.log(process.env.DB_MONGODB_URI);
    await mongoose.connect(process.env.DB_MONGODB_URI);

    console.log('Connected to MongoDB successfully.');
  } catch (error) {
    console.log('Connection to MongoDB failed.');
  }
};
// connectMongoDB();
export default connectMongoDB;
