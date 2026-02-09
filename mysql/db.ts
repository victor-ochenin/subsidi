import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

let initializationStarted = false;
if (typeof window === 'undefined' && !initializationStarted) {
  initializationStarted = true;
  import('./init-db').then(({ initializeDatabase }) => {
    initializeDatabase().catch((error) => {
      console.error('Failed to initialize database:', error);
      initializationStarted = false;
    });
  });
}

