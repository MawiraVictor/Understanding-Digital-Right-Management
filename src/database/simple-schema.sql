
-- Simple DRM System Database
-- Stores only login details and encryption keys

-- Users table - basic user accounts
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Encryption keys table - stores encryption keys and IVs for protected content
CREATE TABLE IF NOT EXISTS content_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_id TEXT UNIQUE NOT NULL,
    encryption_key TEXT NOT NULL,
    encryption_iv TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert test user (password: password123)
INSERT OR IGNORE INTO users (username, password_hash) 
VALUES ('testuser', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Insert sample content key
INSERT OR IGNORE INTO content_keys (content_id, encryption_key, encryption_iv) 
VALUES ('video1', 'test-key-1234567890', 'test-iv-1234567890');