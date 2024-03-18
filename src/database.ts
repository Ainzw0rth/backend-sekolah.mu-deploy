import { Pool, PoolConfig } from 'pg';
var db_dev_url : string = "postgres://halodek:postgres@localhost:5432/development"; 

const dbConfig: PoolConfig = {
  connectionString: process.env.POSTGRES_URL + "?sslmode=require",
};

const dbConfigDev: PoolConfig = {
  connectionString: db_dev_url,
}

const pool = new Pool(dbConfigDev);

pool.connect((err) => {
  console.log('Connecting to PostgreSQL...');
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL successfully!');
  }
});

export default pool;
