import pg from 'pg';
export function createPool(connectionString) {
  const pool = new pg.Pool({ connectionString, max: 10, connectionTimeoutMillis: 5000 });
  pool.on('error', error => console.error('Database pool error:', error.code));
  return pool;
}
