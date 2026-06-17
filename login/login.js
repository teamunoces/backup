document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const BASE_URL = '/SYSTEM_VERSION_!'; // match config.php
    
    console.log('BASE_URL is set to:', BASE_URL); // Debug line

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(loginForm);
        const data = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            console.log('Login result:', result); // Debug line
            
            if (result.success) {
                let redirectUrl = '';
                
                if (result.role === 'admin') {
                    redirectUrl = `${BASE_URL}/admin/Dashboard/Dashboard.html`;
                } else if (result.role === 'coordinator') {
                    redirectUrl = `${BASE_URL}/coordinator/Dashboard/dashboard.html`;
                } else if (result.role === 'encoder') {
                    redirectUrl = `${BASE_URL}/encoder/encoder.html`;
                }
                
                window.location.href = redirectUrl;
            } else {
                errorMessage.style.display = 'block';
                errorMessage.textContent = result.message;
            }
        } catch (err) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Server error. Please try again later.';
            console.error('Error:', err);
        }
    });
});