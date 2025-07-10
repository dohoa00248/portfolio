import app from './app.js';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db.js';

// console.log(process.env);
const port = process.env.PORT || 3000;
await connectDB();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
