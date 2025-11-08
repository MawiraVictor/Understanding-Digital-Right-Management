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
        

    });