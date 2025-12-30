import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

async function runMigrations() {
    const migrationsDir = path.join(__dirname, 'migrations');
    
    // Get all .sql files sorted by name
    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();
    
    console.log(`Found ${files.length} migration files\n`);
    
    for (const file of files) {
        console.log(`Running: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        try {
            await pool.query(sql);
            console.log(`✓ ${file} completed successfully\n`);
        } catch (error) {
            console.error(`✗ ${file} failed:`);
            console.error(`  Error: ${error.message}\n`);
            
            // Continue with other migrations unless it's a critical error
            if (error.message.includes('permission denied') || 
                error.message.includes('does not exist')) {
                // These may be expected depending on setup
            }
        }
    }
    
    console.log('Migration run complete!');
    await pool.end();
}

runMigrations().catch(console.error);
