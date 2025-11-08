const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt' );
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = '';

app.use(express.json());// For parsing application/json
app.use(express.static('public'));// Serve static files from 'public' directory

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

//initialize database schema
db.serialize(() => {

    // Table to store user information
    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        subscription_level iNTEGER DEFAULT 0
        )`
    );
    // Table to store content encryption keys and metadata
    db.run(`CREATE TABLE content_keys ( 
        content_id TEXT PRIMARY KEY,
        encryption_key TEXT,
        encryption_iv TEXT,
        required_subscription_level INTEGER DEFAULT 0
        )
    `);

    //Lets add a test user
    const hashedPassword = bcrypt.hashSync('password123', 10);
    db.run(
        `INSERT INTO users (username, password, subscription_level) VALUES (?, ?, ?)`,
        ['testuser', hashedPassword, 1] //test user with subscription level 1
    );
    //Lets add a test content key
    db.run(
        `INSERT INTO content_keys(content_id, encryption_key, encryption_iv, required_subscription_level) VALUES (?, ?, ?, ?)`,
        ['video1', '012345', 'abcdef', 1] //test content with required subscription level 1
    );
        // Authentication with middleware
        function authenticateToken(req, res, next) {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];// Bearer TOKEN
            if (!token) return res.sendStatus(401).json({ message: 'The access token is required' });// No token provided
            jwt.verify(token, JWT_SECRET, (err, user) => { //function to verify token
                if (err) return res.sendStatus(403).json({ message: 'Invalid access token' });// Invalid token
                req.user = user;
                next();
            });
        }
        //route to handle user login and token generation
        app.post('/api/login', (req, res) => {
            const { username, password } = req.body;

            db.get(`select * from users where username = ?`, [username], (err, user) => {
                if (err || !user){
                  return res.status(401).json({ message: 'Invalid credentials' }); 
                }
                if (bcrypt.compareSync(password, user.password)) {// Passwords match
                    const token = jwt.sign( //token generation
                        { id: user.id, username: user.username, subscription_level: user.subscription_level }, 
                        JWT_SECRET, 
                        { expiresIn: '1h' }); //expire in 1 hour
                    return res.json({ token });
                } else {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }
            });
        });
        app.post('/api/license', authenticateToken, (req, res) => {
    const { contentId } = req.body;
    
    if (!contentId) {
        return res.status(400).json({ error: 'Content ID required' });
    }
    db.get(
        `SELECT * FROM content_keys WHERE content_id = ?`,
        [contentId],
        (err, content) => {
            if (err || !content) {
                return res.status(404).json({ error: 'Content not found' });
            }
            
            // Check if user has required subscription level
            if (req.user.subscription < content.required_subscription) {
                return res.status(403).json({ error: 'Insufficient subscription level' });
            }
                res.json({// Provide license details
                    contentId: content.content_id,
                    key: content.encryption_key,
                    iv: content.encryption_iv,
                    expiration: Date.now() + (60 * 60 * 1000) // 1 hour
                });
            }
        );
    });