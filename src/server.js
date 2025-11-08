const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");
const SimpleDB = require('./database/simple-db');

const app = express();
const PORT = 3001;
const JWT_SECRET = "your-super-secure-jwt-secret-key-for-drm-system-2024";

// Initialize database
const simpleDB = new SimpleDB();
const db = simpleDB.getDB();

// Middleware - MUST come first
app.use(express.json());

// Debug middleware to log all requests
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

// API ROUTES - THESE MUST COME BEFORE STATIC FILES
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
                { expiresIn: '1h' }
            );
            
            console.log("Login successful for:", username);
            res.json({ 
                token, 
                user: { 
                    id: user.id, 
                    username: user.username
                } 
            });
        } else {
            console.log("Login failed for:", username);
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

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
            if (err || !content) {
                return res.status(404).json({ error: 'Content not found' });
            }
            
            res.json({
                contentId: content.content_id,
                key: content.encryption_key,
                iv: content.encryption_iv,
                expiration: Date.now() + (60 * 60 * 1000)
            });
        }
    );
});

// STATIC FILES - MUST COME AFTER API ROUTES
app.use(express.static("public"));

// Default route - should be last
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Start server only after database is ready
simpleDB.init(() => {
    app.listen(PORT, () => {
        console.log("🚀 DRM Server running on http://localhost:" + PORT);
        console.log("👤 Test credentials: username=testuser, password=password123");
        console.log("📡 API endpoints:");
        console.log("   POST /api/login");
        console.log("   POST /api/license");
    });
});