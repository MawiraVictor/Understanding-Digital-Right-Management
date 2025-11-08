const fs = require('fs');

console.log('🔍 Setting up video files...');

// Check if source video exists
if (!fs.existsSync('test-input.mp4')) {
    console.log('❌ ERROR: test-input.mp4 not found!');
    console.log('💡 Make sure your video file is in the main project folder');
    process.exit(1);
}

console.log(' Found test-input.mp4');

// Create public directory if it doesn't exist
if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
}

try {
    // Copy the video to public folder so it can be served
    fs.copyFileSync('test-input.mp4', 'public/video.mp4');
    console.log(' Copied video to: public/video.mp4');
    
    console.log('\n Setup complete! The video should now work.');
    console.log(' Video location: public/video.mp4');
    
} catch (error) {
    console.log(' Error:', error.message);
}
