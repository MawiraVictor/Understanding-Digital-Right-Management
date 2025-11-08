const fs = require('fs');

// Create a simple script to generate a test video using ffmpeg
// You'll need ffmpeg installed for this to work

function createTestVideoScript() {
    const script = `
#!/bin/bash
# Create a 10-second test video using ffmpeg
ffmpeg -f lavfi -i testsrc=duration=10:size=640x480:rate=30 -c:v libx264 -pix_fmt yuv420p test-input.mp4

if [ $? -eq 0 ]; then
    echo "Test video created: test-input.mp4"
else
    echo "FFmpeg not found. Please install ffmpeg or create a test video manually."
fi
    `;
    
    fs.writeFileSync('create-test-video.sh', script);
    console.log('Run: chmod +x create-test-video.sh && ./create-test-video.sh');
}

createTestVideoScript();