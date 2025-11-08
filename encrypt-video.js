const fs = require('fs');
const crypto = require ('crypto');
const path = require('path');

// Function to encrypt a video file using AES-256-CBC
class videoEncryptor{
    constructor(){
        this.algorithm = 'aes-256-cbc';
    }

    //Generate a random key and IV
    //key => is the cryptographic key used for encryption
    //iv => is the initialization vector

    generateKey(){
        const key = crypto.randomBytes(32); // AES-256 requires a 32-byte key
        const iv = crypto.randomBytes(16);//128-bit IV
        return { 
            key: key.toString('hex'),
            iv: iv.toString('hex')
        };
    }
    //Encrypt the video file
    
    encryptFile(inputPath, outputPath, key, iv){
        return new Promise((resolve, reject) => {
            const input = fs.createReadStream(inputPath);
            const output = fs.createWriteStream(outputPath);

            const cipher = crypto.createCipheriv(this.algorithm,
                Buffer.from(key, 'hex'),
                Buffer.from(iv, 'hex'));

            input.pipe(cipher).pipe(output);

            output.on('finish', () => {
                console.log(`Video encrypted successfully: ${outputPath}`);
                resolve();
            });
            output.on('error', reject);
        });
    }
    //Decrypting the video file
    
    decryptFile(inputPath, outputPath, key, iv){
        return new Promise((resolve, reject)=>{
            const input = fs.createReadStream(inputPath);
            const output = fs.createWriteStream (outputPath);
            
            const decipher = crypto.createDecipheriv(this.algorithm,
                Buffer.from(key, 'hex'),
                Buffer.from(iv, 'hex'));

            input.pipe(decipher).pipe(output);

            output.on('finish', () => {
                console.log(`Video decrypted successfully: ${outputPath}`);
                resolve();
            });
            output.on('error', reject);
        })
    }

}

// testing if the encryption works
async function testEncryption() {
    const encryptor = new videoEncryptor();
    const { key, iv } = encryptor.generateKey();

    console.log('Generated key: ', key);
    console.log('Generated IV: ', iv);

    //you'll need to provide your own video file path here
    const testVideo = 'test-input.mp4';
    const encryptedVideo = 'test-encrypted.mp4';
    const decryptedVideo = 'test-decrypted.mp4';

    if (fs.existsSync(testVideo)) {
        await encryptor.encryptFile(testVideo, encryptedVideo, key, iv);
        await encryptor.decryptFile(encryptedVideo, decryptedVideo, key, iv);
        console.log('Encryption and decryption test completed.');
    } else {
        console.log('Please create a small test video file named "test-input.mp4" in the current directory to run the test.');
    }
}
// Run the test
if (require.main === module) {
    testEncryption().catch(console.error);
}