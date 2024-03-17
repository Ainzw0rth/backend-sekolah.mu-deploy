import { Pool, PoolConfig } from 'pg';

const dbConfig: PoolConfig = {
  connectionString: process.env.POSTGRES_URL + "?sslmode=require",
};

const pool = new Pool(dbConfig);

pool.connect((err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL successfully!');
  }
});

export default pool;
