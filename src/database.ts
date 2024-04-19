import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: PoolConfig = {
  connectionString: "postgres://default:sDMed2HluBV5@ep-old-frost-a179vfkk.ap-southeast-1.aws.neon.tech:5432/verceldb?sslmode=require"
};

// Change the variable to connect to different database
// 1. dbConfig for production
// 2. dbConfigDev for development

const pool = new Pool(dbConfig);

pool.connect((err) => {
  console.log('Connecting to PostgreSQL...', dbConfig);
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL successfully!');
  }
});

export default pool;