const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'dbpicture',
  password: 'admin7895',
  port: 5432,
});

pool.connect((error, client) => {
  if (error) {
    console.error('Error al conectar a la base de datos:', error);
  } else {
    console.log('Conexión exitosa a la base de datos PostgreSQL');
    client.release(); 
  }
});

module.exports = pool;
