const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

class SimpleDB {
    constructor() { 
        this.db = new sqlite3.Database(':memory:'); 
    }
    
    init(callback) {
        // Create users table with email field
        this.db.run(`
            CREATE TABLE users (
                id INTEGER PRIMARY KEY, 
                username TEXT UNIQUE, 
                email TEXT UNIQUE,
                password_hash TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, () => {
            
            // Create content_keys table
            this.db.run(`
                CREATE TABLE content_keys (
                    id INTEGER PRIMARY KEY, 
                    content_id TEXT UNIQUE, 
                    encryption_key TEXT, 
                    encryption_iv TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`, () => {
                
                // Insert test user
                const hashedPassword = bcrypt.hashSync('password123', 10);
                this.db.run(
                    `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`, 
                    ['testuser', 'test@example.com', hashedPassword], 
                    () => {
                        
                    // Insert sample content key
                    this.db.run(
                        `INSERT INTO content_keys (content_id, encryption_key, encryption_iv) VALUES (?, ?, ?)`, 
                        ['video1', 'test-key-123', 'test-iv-456'], 
                        () => {
                            console.log('✅ Database ready with registration support'); 
                            if (callback) callback();
                        }
                    );
                });
            });
        });
    }

    getDB() { return this.db; }
}

module.exports = SimpleDB;