import mysql2 from 'mysql2/promise.js';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql2.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'dthdthoa84202',
  database: process.env.DB_NAME || '',
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
// connectMySQL();

export default connectMySQL;
