// Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already authenticated
    AuthManager.redirectIfAuthenticated();

    const loginForm = document.getElementById('loginForm');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form data
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Hide previous messages
        UIUtils.hideMessage('errorMessage');
        UIUtils.hideMessage('successMessage');

        // Validate form
        const validation = FormValidator.validateLoginForm(email, password);
        if (!validation.isValid) {
            UIUtils.showMessage('errorMessage', validation.errors.join(', '), 'error');
            return;
        }

        // Show loading
        UIUtils.showLoading('loading', 'loginForm');

        try {
            console.log('Attempting login with:', { email });
            // Make login request
            const response = await AuthAPI.login({ email, password });
            console.log('Login response:', response);

            if (response.success) {
                // Store token
                AuthManager.setToken(response.data.token);

                // Set flag for welcome notification
                sessionStorage.setItem('justLoggedIn', 'true');

                // Show success message
                UIUtils.showMessage('successMessage', 'Login successful! Redirecting...', 'success');

                // Redirect to dashboard after 1 second
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                // Handle different error cases
                let errorMsg = 'Login error';
                
                if (response.status === 401) {
                    if (response.data.message && response.data.message.includes('Invalid')) {
                        errorMsg = 'Invalid email or password';
                    } else if (response.data.message && response.data.message.includes('locked')) {
                        errorMsg = 'Account locked. Try again later or reset your password.';
                    } else {
                        errorMsg = 'Invalid credentials';
                    }
                } else if (response.status === 423) {
                    errorMsg = 'Account locked due to multiple attempts. Try again later.';
                } else if (response.status === 429) {
                    errorMsg = 'Too many attempts. Wait a moment before trying again.';
                } else if (response.data.error) {
                    errorMsg = response.data.error;
                }

                UIUtils.showMessage('errorMessage', errorMsg, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            UIUtils.showMessage('errorMessage', 'Connection error. Check your internet and try again.', 'error');
        } finally {
            // Hide loading
            UIUtils.hideLoading('loading', 'loginForm');
        }
    });

    // Real-time validation
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !UIUtils.validateEmail(email)) {
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else if (email) {
            this.classList.add('valid');
            this.classList.remove('invalid');
        } else {
            this.classList.remove('valid', 'invalid');
        }
    });

    passwordInput.addEventListener('blur', function() {
        const password = this.value;
        if (password && password.length < 1) {
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else if (password) {
            this.classList.add('valid');
            this.classList.remove('invalid');
        } else {
            this.classList.remove('valid', 'invalid');
        }
    });

    // Show/hide password functionality
    const showPasswordBtn = document.createElement('button');
    showPasswordBtn.type = 'button';
    showPasswordBtn.className = 'btn-flat waves-effect waves-light grey-text text-darken-2';
    showPasswordBtn.innerHTML = '<i class="material-icons">visibility</i>';
    showPasswordBtn.style.position = 'absolute';
    showPasswordBtn.style.right = '0';
    showPasswordBtn.style.top = '50%';
    showPasswordBtn.style.transform = 'translateY(-50%)';
    showPasswordBtn.style.background = 'none';
    showPasswordBtn.style.border = 'none';
    showPasswordBtn.style.zIndex = '10';

    const passwordField = document.querySelector('.input-field');
    passwordField.style.position = 'relative';
    passwordField.appendChild(showPasswordBtn);

    showPasswordBtn.addEventListener('click', function() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        this.innerHTML = type === 'password' ? '<i class="material-icons">visibility</i>' : '<i class="material-icons">visibility_off</i>';
    });

    // Enter key to submit
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && (e.target.id === 'email' || e.target.id === 'password')) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });

    // Auto-focus on email field
    emailInput.focus();

    // Remember me functionality (if needed)
    const rememberMeCheckbox = document.createElement('p');
    rememberMeCheckbox.innerHTML = `
        <label>
            <input type="checkbox" id="rememberMe" />
            <span>Remember me</span>
        </label>
    `;
    
    // Insert before the submit button
    const submitButton = document.querySelector('#loginForm .btn');
    submitButton.parentNode.insertBefore(rememberMeCheckbox, submitButton);

    // Handle remember me
    const rememberMeInput = document.getElementById('rememberMe');
    rememberMeInput.addEventListener('change', function() {
        if (this.checked) {
            localStorage.setItem('rememberMe', 'true');
        } else {
            localStorage.removeItem('rememberMe');
        }
    });

    // Check if remember me was previously set
    if (localStorage.getItem('rememberMe') === 'true') {
        rememberMeInput.checked = true;
    }

    // Forgot password link functionality
    const forgotPasswordLink = document.querySelector('a[href="/forgot-password"]');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Simple forgot password modal
            const email = emailInput.value.trim();
            if (!email || !UIUtils.validateEmail(email)) {
                UIUtils.showMessage('errorMessage', 'Please enter a valid email first', 'error');
                emailInput.focus();
                return;
            }

            // Show confirmation dialog
            if (confirm(`Send recovery email to ${email}?`)) {
                handleForgotPassword(email);
            }
        });
    }

    async function handleForgotPassword(email) {
        UIUtils.showLoading('loading', 'loginForm');
        
        try {
            const response = await AuthAPI.forgotPassword({ email });
            
            if (response.success) {
                UIUtils.showMessage('successMessage', 'Recovery email sent! Check your inbox.', 'success');
            } else {
                UIUtils.showMessage('errorMessage', response.data.error || 'Error sending recovery email', 'error');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            UIUtils.showMessage('errorMessage', 'Error processing request', 'error');
        } finally {
            UIUtils.hideLoading('loading', 'loginForm');
        }
    }

    // Add some nice animations
    const card = document.querySelector('.card');
    if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);
    }
}); 