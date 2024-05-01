import { Pool, PoolConfig } from 'pg';

// link local db naufal
var db_local = "postgres://postgres:postgres@localhost:5432/ppl"; 
const dbConfigLocal: PoolConfig = {
  connectionString: db_local
};

var db_dev_url : string = "postgres://default:V1I4PZwRnBQM@ep-old-frost-a179vfkk.ap-southeast-1.aws.neon.tech:5432/verceldb?sslmode=require";

const dbConfig: PoolConfig = {
  connectionString: "postgres://default:V1I4PZwRnBQM@ep-old-frost-a179vfkk.ap-southeast-1.aws.neon.tech:5432/verceldb?sslmode=require"
};

const dbConfigDev: PoolConfig = {
  connectionString: db_dev_url,
}


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