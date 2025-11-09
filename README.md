# Understanding Digital Rights Management

# Simple DRM System

Used this project to understand cryptographic concepts and how they apply in Digital Rights Management system for educational purposes that demonstrates secure video content protection using modern encryption standards and authentication mechanisms.

## Features

- Video encryption/decryption using AES-256-CBC -> (Codeblockchaining)
- Secure license server with JWT-based authentication
- Role-based content access control
- Web-based video player interface with secure playback
- SQLite database for user management


## Technology Stack

- **Backend**: Node.js with Express.js
- **Authentication**: JWT (jsonwebtoken) with bcrypt for password hashing
- **Database**: SQLite3
- **Encryption**: crypto-js and Node.js native crypto module
- **Frontend**: Vanilla JavaScript with HTML5 video player

## Quick Start

1. Clone the repository and install dependencies:
   \`\`\`bash

   *git clone <repository-url>
   *cd simple-drm-project
   *npm install
   \`\`\`


2. Set up the database and encrypt the test video:
   \`\`\`bash
   node setup-video.js
   # This initializes the SQLite database and encrypts the test video
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   # For production: npm start
   \`\`\`

4. Access the application:
   - Open http://localhost:3001 in your browser
   - The server includes request logging for debugging

## Test Credentials

- Username: \`testuser\`
- Password: \`password123\`

## Available Scripts

- \`npm start\`: Start the production server
- \`npm run dev\`: Start the development server with hot-reload
- \`npm run encrypt\`: Re-encrypt the test video file
- \`npm test\`: Run the test suite (to be implemented)

## Project Structure

\`\`\`
*simple-drm-project/

 ├── src/

 │   ├── server.js           # Main Express 

 server

 │   ├── database/           # Database 

 setup and queries

 │   └── encryption/         # Video 

 encryption utilities

 ├── public/                 # Static 

 frontend files

 ├── scripts/               # Utility scripts

 └── crypto-basics/         # Core 
 
 cryptography implementations
\`\`\`


## Security Notice

⚠️ This is an educational project demonstrating DRM concepts. It includes:
- Hardcoded JWT secret (should use environment variables)
- Basic authentication mechanism
- Simplified encryption implementation

**DO NOT USE IN PRODUCTION ENVIRONMENTS**

## License

This project is intended for educational purposes only. See LICENSE file for details.
