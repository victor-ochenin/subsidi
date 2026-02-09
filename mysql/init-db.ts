import { pool } from './db';
import fs from 'fs';
import path from 'path';

export async function initializeDatabase() {
  let retries = 5;
  let connected = false;

  // Пытаемся подключиться с повторными попытками
  while (retries > 0 && !connected) {
    try {
      await pool.execute('SELECT 1');
      connected = true;
      console.log('✓ Database connection established');
    } catch (error) {
      retries--;
      console.log(`Database connection failed. Retries left: ${retries}`);
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.error('Failed to connect to database after 5 attempts');
        throw error;
      }
    }
  }

  try {
    const [tables] = await pool.execute(
      "SHOW TABLES LIKE 'city_coefficients'"
    ) as any[];

    if (tables.length === 0) {
      console.log('⚠ Table city_coefficients not found. Initializing database...');
      
      const possiblePaths = [
        path.join(process.cwd(), 'mysql', 'init.sql'),
        path.join(__dirname, 'init.sql'),
        '/app/mysql/init.sql',
      ];
      
      let initSqlPath: string | null = null;
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          initSqlPath = possiblePath;
          break;
        }
      }
      
      if (!initSqlPath) {
        throw new Error('Cannot find init.sql file');
      }
      
      const initSql = fs.readFileSync(initSqlPath, 'utf-8');
      
      const statements: string[] = [];
      let currentStatement = '';
      const lines = initSql.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('--')) {
          continue;
        }
        
        currentStatement += (currentStatement ? ' ' : '') + trimmedLine;
        
        if (trimmedLine.endsWith(';')) {
          const statement = currentStatement.slice(0, -1).trim(); 
          if (statement) {
            statements.push(statement);
          }
          currentStatement = '';
        }
      }
      
      for (const statement of statements) {
        if (statement) {
          try {
            await pool.execute(statement);
          } catch (error: any) {
            if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
                error.code === 'ER_DUP_ENTRY' ||
                (error.code === 'ER_PARSE_ERROR' && error.message.includes('empty'))) {
            } else {
              console.warn(`Warning executing statement: ${error.message}`);
              if (error.code === 'ER_NO_SUCH_TABLE' && statement.includes('DELETE FROM')) {
                continue;
              }
            }
          }
        }
      }

      console.log('✓ Database initialized successfully');
    } else {
      console.log('✓ Database tables already exist');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

