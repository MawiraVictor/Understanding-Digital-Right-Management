const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

class SimpleDB {
    constructor() { this.db = new sqlite3.Database(':memory:'); }
    
    init(callback) {
        this.db.run(`CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password_hash TEXT)`, () => {
            this.db.run(`CREATE TABLE content_keys (id INTEGER PRIMARY KEY, content_id TEXT UNIQUE, encryption_key TEXT, encryption_iv TEXT)`, () => {
                const hashedPassword = bcrypt.hashSync('password123', 10);
                this.db.run(`INSERT INTO users (username, password_hash) VALUES (?, ?)`, ['testuser', hashedPassword], () => {
                    this.db.run(`INSERT INTO content_keys (content_id, encryption_key, encryption_iv) VALUES (?, ?, ?)`, ['video1', 'test-key-123', 'test-iv-456'], () => {
                        console.log('✅ Database ready'); 
                        if (callback) callback();
                    });
                });
            });
        });
    }

    getDB() { return this.db; }
}

module.exports = SimpleDB;