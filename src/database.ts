import { Pool, PoolConfig } from 'pg';
var db_dev_url : string = "postgres://postgres:postgres@postgres-ppl-dev:5432/development";

const dbConfig: PoolConfig = {
  connectionString: process.env.POSTGRES_URL + "?sslmode=require"
};

const dbConfigDev: PoolConfig = {
  connectionString: db_dev_url,
}

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