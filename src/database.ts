import { Pool, PoolConfig } from 'pg';

const dbConfig: PoolConfig = {
  connectionString: "postgres://default:sDMed2HluBV5@ep-old-frost-a179vfkk.ap-southeast-1.aws.neon.tech:5432/verceldb?sslmode=require"
};

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