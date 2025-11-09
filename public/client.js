let authToken = null;
let currentUser = null;

// DOM elements - FIXED: Use the correct ID from your HTML
const loginCard = document.getElementById('loginCard'); // Changed from loginForm
const contentArea = document.getElementById('contentArea');
const videoPlayer = document.getElementById('videoPlayer');
const videoMessage = document.getElementById('videoMessage');

// Check if we're on the login page before running login-specific code
if (loginCard && contentArea) {
    // Only run this code if we're on the main page (not registration page)
    
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
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error('Server returned HTML instead of JSON. Check if API route exists.');
            }
            
            const data = await response.json();
            
            if (response.ok) {
                authToken = data.token;
                currentUser = data.user;
                
                document.getElementById('userName').textContent = currentUser.username;
                loginCard.classList.add('hidden'); // Changed from loginForm
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
                showMessage('License acquired! Loading video...', 'success');
                
                // Show the video player
                videoPlayer.innerHTML = `
                    <video controls width="100%">
                        <source src="/video.mp4" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
                videoPlayer.classList.remove('hidden');
            } else {
                showMessage('License request failed: ' + license.error, 'error');
            }
        } catch (error) {
            showMessage('License request failed: ' + error.message, 'error');
        }
    }

    function logout() {
        authToken = null;
        currentUser = null;
        contentArea.classList.add('hidden');
        loginCard.classList.remove('hidden'); // Changed from loginForm
        videoPlayer.classList.add('hidden');
        videoMessage.innerHTML = '';
    }

    function showMessage(message, type) {
        const element = document.getElementById('loginMessage');
        element.innerHTML = `<div class="${type}">${message}</div>`;
    }

    // Make functions globally available
    window.getLicense = getLicense;
    window.logout = logout;
}