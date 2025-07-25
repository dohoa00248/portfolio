import mysql2 from 'mysql2/promise.js';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const connectMySQL = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('Connected to MySQL successfully.');
    conn.release();
  } catch (error) {
    console.log('Connection to MySQL failed.');
  }
};

export default connectMySQL;
