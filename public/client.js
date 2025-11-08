let authToken = null;
let currentUser = null;

// DOM elements
const loginForm = document.getElementById('loginForm');
const contentArea = document.getElementById('contentArea');
const videoPlayer = document.getElementById('videoPlayer');
const videoMessage = document.getElementById('videoMessage');

// Login form handler
document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            
            document.getElementById('userName').textContent = currentUser.username;
            loginForm.classList.add('hidden');
            contentArea.classList.remove('hidden');
            
            showMessage('Login successful!', 'success');
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        showMessage('Login failed: ' + error.message, 'error');
    }
});

// Get license and play video
async function getLicense() {
    if (!authToken) {
        showMessage('Please login first', 'error');
        return;
    }
    
    try {
        showMessage('Requesting license...', 'success');
        
        const response = await fetch('/api/license', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ contentId: 'video1' })
        });
        
        const license = await response.json();
        
        if (response.ok) {
            showMessage('License acquired! Now playing video...', 'success');
            
            // In a real implementation, you'd use EME here
            // For this demo, we'll just show a success message
            simulateVideoPlayback(license);
        } else {
            showMessage('License request failed: ' + license.error, 'error');
        }
    } catch (error) {
        showMessage('License request failed: ' + error.message, 'error');
    }
}

function simulateVideoPlayback(license) {
    videoMessage.innerHTML = `
        <div class="success">
            <h4>Video playback simulation</h4>
            <p>License acquired for content: ${license.contentId}</p>
            <p>Key: ${license.key.substring(0, 20)}...</p>
            <p>Expires: ${new Date(license.expiration).toLocaleString()}</p>
            <p>In a real implementation, the video would now play using EME.</p>
        </div>
    `;
}

function logout() {
    authToken = null;
    currentUser = null;
    contentArea.classList.add('hidden');
    loginForm.classList.remove('hidden');
    videoPlayer.classList.add('hidden');
    videoMessage.innerHTML = '';
}

function showMessage(message, type) {
    const element = type === 'login' ? 
        document.getElementById('loginMessage') : videoMessage;
    
    element.innerHTML = `<div class="${type}">${message}</div>`;
    setTimeout(() => element.innerHTML = '', 5000);
}