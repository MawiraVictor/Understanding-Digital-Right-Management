const videoEncryptor = require('./video-encryptor');
const server = require('./server');
// Simple DRM Project Entry Point

async function iniitializeProject() {
    console.log('initializing the Simple DRM Project...\n');

    // Test encryption and decryption
    const encryptor = new videoEncryptor.VideoEncryptor();// Create an instance of VideoEncryptor
    const { key, iv } = encryptor.generateKeyAndIV();// Generate key and IV

    console.log('Sample Encryption Key:', key);
    console.log('Sample Encryption IV:', iv);
    console.log('\nSave these for testing your content!');
    console.log('\nNext steps:');
    console.log('1. Run: node index.js');
    console.log('2. Create a test video file named "test-input.mp4"');
    console.log('3. Use the encryption tool to encrypt it');
    console.log('4. Add the content key to the database using the admin API');
    console.log('5. Access http://localhost:3000 to test the system');
    }
    // Start the Server and initialization
    if (require.main === module) {
    iniitializeProject();
}