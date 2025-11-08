const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;
const JWT_SECRET = "your-secret-key-change-in-production";

app.use(express.json());
app.use(express.static("public"));

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

// Initialize database with test data
db.serialize(() => {
    db.run(`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            subscription_level INTEGER DEFAULT 0
        )
    `);
    
    db.run(`
        CREATE TABLE content_keys (
            content_id TEXT PRIMARY KEY,
            encryption_key TEXT,
            encryption_iv TEXT,
            required_subscription INTEGER DEFAULT 0
        )
    `);
    
    // Add test user
    const hashedPassword = bcrypt.hashSync("password123", 10);
    db.run(
        `INSERT INTO users (username, password, subscription_level) VALUES (?, ?, ?)`,
        ["testuser", hashedPassword, 1]
    );
    
    // Add test content key
    db.run(
        `INSERT INTO content_keys (content_id, encryption_key, encryption_iv, required_subscription) VALUES (?, ?, ?, ?)`,
        ["video1", "test-key-123", "test-iv-456", 1]
    );
});

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Routes
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Validate password from database
        if (bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign(
                { id: user.id, username: user.username, subscription: user.subscription_level },
                JWT_SECRET,
                { expiresIn: '1h' }
            );
            
            res.json({ 
                token, 
                user: { 
                    id: user.id, 
                    username: user.username,
                    subscription: user.subscription_level 
                } 
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});
// License issuance route
app.post('/api/license', authenticateToken, (req, res) => {
    const { contentId } = req.body;
    
    if (!contentId) {
        return res.status(400).json({ error: 'Content ID required' });
    }
    
    db.get(//get content key and check subscription level
        `SELECT * FROM content_keys WHERE content_id = ?`,
        [contentId],
        (err, content) => {//   issue license if user has sufficient subscription
            if (err || !content) {
                return res.status(404).json({ error: 'Content not found' });
            }
            
            if (req.user.subscription < content.required_subscription) {
                return res.status(403).json({ error: 'Insufficient subscription level' });
            }
            
            res.json({//issue license to user
                contentId: content.content_id,
                key: content.encryption_key,
                iv: content.encryption_iv,
                expiration: Date.now() + (60 * 60 * 1000)
            });
        }
    );
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log("DRM Server running on http://localhost:" + PORT);
    console.log(" Test credentials: username=testuser, password=password123");
});