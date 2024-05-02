import { Pool, PoolConfig } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const DB_URL = process.env.POSTGRES_URL;
const dbConfig: PoolConfig = {
  connectionString: DB_URL,
};

const pool = new Pool(dbConfig);

pool.connect((err) => {
  console.log('Connecting to PostgreSQL...');
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL successfully!');
  }
});

export default pool;