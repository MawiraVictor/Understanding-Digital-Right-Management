const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");
const SimpleDB = require('./database/simple-db');

const app = express();
const PORT = 3001;

// Security: Use environment variable for JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secure-jwt-secret-key-for-drm-system-2024-change-in-production";

// Initialize database
const simpleDB = new SimpleDB();
const db = simpleDB.getDB();

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
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

// USER REGISTRATION ENDPOINT
app.post('/api/register', (req, res) => {
    console.log("Registration request:", req.body);
    
    const { username, password, email } = req.body;
    
    // Input validation
    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Username, password, and email are required' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    if (username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    // Check if user already exists
    db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], (err, existingUser) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Server error during registration' });
        }
        
        if (existingUser) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        // Hash password and create user
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        db.run(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, hashedPassword],
            function(err) {
                if (err) {
                    console.error('User creation error:', err);
                    return res.status(500).json({ error: 'Failed to create user' });
                }

                // Generate JWT token for immediate login
                const token = jwt.sign(
                    { id: this.lastID, username: username },
                    JWT_SECRET,
                    { expiresIn: '24h' } // Longer expiry for better UX
                );
                
                console.log("Registration successful for:", username);
                res.status(201).json({ 
                    token, 
                    user: { 
                        id: this.lastID, 
                        username: username,
                        email: email
                    },
                    message: 'Registration successful!'
                });
            }
        );
    });
});

// Enhanced login endpoint
app.post('/api/login', (req, res) => {
    console.log("Login request:", req.body);
    
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        if (bcrypt.compareSync(password, user.password_hash)) {
            const token = jwt.sign(
                { id: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '24h' } // Extended from 1h to 24h
            );
            
            console.log("Login successful for:", username);
            res.json({ 
                token, 
                user: { 
                    id: user.id, 
                    username: user.username,
                    email: user.email || ''
                } 
            });
        } else {
            console.log("Login failed for:", username);
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

// Enhanced license endpoint with better validation
app.post('/api/license', authenticateToken, (req, res) => {
    console.log("License request from user:", req.user.username);
    
    const { contentId } = req.body;
    
    if (!contentId) {
        return res.status(400).json({ error: 'Content ID required' });
    }
    
    db.get(
        `SELECT * FROM content_keys WHERE content_id = ?`,
        [contentId],
        (err, content) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Server error' });
            }
            
            if (!content) {
                return res.status(404).json({ error: 'Content not found' });
            }
            
            // Log license issuance for security
            console.log(`License issued to ${req.user.username} for content ${contentId}`);
            
            res.json({
                contentId: content.content_id,
                key: content.encryption_key,
                iv: content.encryption_iv,
                expiration: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
                issuedTo: req.user.username,
                issuedAt: new Date().toISOString()
            });
        }
    );
});

// New endpoint: Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
    db.get(
        'SELECT id, username, email, created_at FROM users WHERE id = ?',
        [req.user.id],
        (err, user) => {
            if (err || !user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({ user });
        }
    );
});

// Static files
app.use(express.static("public"));

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Serve registration page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
simpleDB.init(() => {
    app.listen(PORT, () => {
        console.log("🚀 DRM Server running on http://localhost:" + PORT);
        console.log("👤 Test credentials: username=testuser, password=password123");
        console.log("📡 API endpoints:");
        console.log("   POST /api/register");
        console.log("   POST /api/login");
        console.log("   POST /api/license");
        console.log("   GET  /api/profile");
        console.log("🌐 Pages: / (login) and /register");
    });
});