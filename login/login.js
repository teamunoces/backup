document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // prevent normal form submission

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

            if (result.success) {
                // redirect based on role
                if (result.role === 'admin') {
                    window.location.href = '/admin/Dashboard/Dashboard.html';
                } else if (result.role === 'coordinator') {
                    window.location.href = '/coordinator/Dashboard/dashboard.html';
                } else {
                    window.location.href = '/index.php';
                }
            } else {
                // show error
                errorMessage.style.display = 'block';
                errorMessage.textContent = result.message;
            }
        } catch (err) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Server error. Please try again later.';
            console.error(err);
        }
    });
});
