import connectMongoDB from './mongodb.js';
import connectMySQL from './mysql2.js';

const connectDB = async () => {
  try {
    await Promise.all([connectMongoDB(), connectMySQL()]);
    console.log('Connected to database successfully.');
  } catch (error) {
    console.log('Connected to database failed.');
  }
};

export default connectDB;
