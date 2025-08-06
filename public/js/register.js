// Register Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already authenticated
    AuthManager.redirectIfAuthenticated();

    const registerForm = document.getElementById('registerForm');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Handle form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form data
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Hide previous messages
        UIUtils.hideMessage('errorMessage');
        UIUtils.hideMessage('successMessage');

        // Validate form
        const validation = FormValidator.validateRegisterForm(name, email, password, confirmPassword);
        if (!validation.isValid) {
            UIUtils.showMessage('errorMessage', validation.errors.join(', '), 'error');
            return;
        }

        // Show loading
        UIUtils.showLoading('loading', 'registerForm');

        try {
            // Make register request
            const response = await AuthAPI.register({ name, email, password });

            if (response.success) {
                console.log('Register response:', response);
                
                // Store token if provided
                if (response.data.token) {
                    AuthManager.setToken(response.data.token);
                    console.log('Token stored, redirecting to dashboard');
                    
                    // Set flag for welcome notification
                    sessionStorage.setItem('justLoggedIn', 'true');
                    
                    // If we have a token, go directly to dashboard
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1000);
                } else {
                    console.log('No token provided, redirecting to login');
                    // Show success message
                    UIUtils.showMessage('successMessage', 'Account created successfully! Redirecting to login...', 'success');
                    // Redirect to login after 2 seconds
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                }
            } else {
                // Handle different error cases
                let errorMsg = 'Error creating account';
                
                if (response.status === 400) {
                    if (response.data.error && response.data.error.includes('Validation failed')) {
                        // Parse validation details from API
                        if (response.data.details) {
                            const validationErrors = response.data.details.map(detail => detail.msg).join(', ');
                            errorMsg = `Validation errors: ${validationErrors}`;
                        } else {
                            errorMsg = 'Invalid data. Check the fields and try again.';
                        }
                    } else if (response.data.error && response.data.error.includes('email')) {
                        errorMsg = 'Email already in use. Try another email.';
                    } else if (response.data.error && response.data.error.includes('password')) {
                        errorMsg = 'Password must have at least 6 characters with uppercase, lowercase, and number.';
                    } else {
                        errorMsg = response.data.error || 'Invalid data';
                    }
                } else if (response.status === 409) {
                    errorMsg = 'Email already in use. Try another email.';
                } else if (response.data.error) {
                    errorMsg = response.data.error;
                }

                UIUtils.showMessage('errorMessage', errorMsg, 'error');
            }
        } catch (error) {
            console.error('Register error:', error);
            UIUtils.showMessage('errorMessage', 'Connection error. Check your internet and try again.', 'error');
        } finally {
            console.log('Register process completed');
            // Hide loading
            UIUtils.hideLoading('loading', 'registerForm');
        }
    });

    // Real-time validation
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    nameInput.addEventListener('blur', function() {
        const name = this.value.trim();
        if (name && !UIUtils.validateName(name)) {
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else if (name) {
            this.classList.add('valid');
            this.classList.remove('invalid');
        } else {
            this.classList.remove('valid', 'invalid');
        }
    });

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
        if (password && !UIUtils.validatePassword(password)) {
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else if (password) {
            this.classList.add('valid');
            this.classList.remove('invalid');
        } else {
            this.classList.remove('valid', 'invalid');
        }
    });

    confirmPasswordInput.addEventListener('blur', function() {
        const password = passwordInput.value;
        const confirmPassword = this.value;
        if (confirmPassword && password !== confirmPassword) {
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else if (confirmPassword) {
            this.classList.add('valid');
            this.classList.remove('invalid');
        } else {
            this.classList.remove('valid', 'invalid');
        }
    });

    // Password strength indicator
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strengthIndicator = document.getElementById('passwordStrength') || createPasswordStrengthIndicator();
        
        let strength = 0;
        let strengthText = '';
        let strengthClass = '';

        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        // Check if password meets API requirements
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const meetsRequirements = password.length >= 6 && hasUpperCase && hasLowerCase && hasNumber;

        switch (strength) {
            case 0:
            case 1:
                strengthText = 'Very weak';
                strengthClass = 'red';
                break;
            case 2:
                strengthText = 'Weak';
                strengthClass = 'orange';
                break;
            case 3:
                strengthText = 'Medium';
                strengthClass = 'yellow';
                break;
            case 4:
                strengthText = 'Strong';
                strengthClass = 'light-green';
                break;
            case 5:
            case 6:
                strengthText = 'Very strong';
                strengthClass = 'green';
                break;
        }

        strengthIndicator.textContent = strengthText;
        strengthIndicator.className = `chip ${strengthClass} white-text`;
        
        // Add requirement indicator
        if (password.length > 0) {
            const requirements = [];
            if (password.length < 6) requirements.push('At least 6 characters');
            if (!hasUpperCase) requirements.push('One uppercase letter');
            if (!hasLowerCase) requirements.push('One lowercase letter');
            if (!hasNumber) requirements.push('One number');
            
            if (requirements.length > 0) {
                strengthIndicator.textContent += ` - Missing: ${requirements.join(', ')}`;
                strengthIndicator.className = 'chip red white-text';
            }
        }
    });

    function createPasswordStrengthIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'passwordStrength';
        indicator.className = 'chip grey white-text';
        indicator.textContent = 'Type your password';
        
        const passwordField = passwordInput.closest('.input-field');
        passwordField.appendChild(indicator);
        
        return indicator;
    }

    // Show/hide password functionality for both password fields
    [passwordInput, confirmPasswordInput].forEach(input => {
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

        const inputField = input.closest('.input-field');
        inputField.style.position = 'relative';
        inputField.appendChild(showPasswordBtn);

        showPasswordBtn.addEventListener('click', function() {
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            this.innerHTML = type === 'password' ? '<i class="material-icons">visibility</i>' : '<i class="material-icons">visibility_off</i>';
        });
    });

    // Enter key to submit
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && ['name', 'email', 'password', 'confirmPassword'].includes(e.target.id)) {
            registerForm.dispatchEvent(new Event('submit'));
        }
    });

    // Auto-focus on name field
    nameInput.focus();

    // Terms and conditions checkbox
    const termsCheckbox = document.createElement('p');
    termsCheckbox.innerHTML = `
        <label>
            <input type="checkbox" id="acceptTerms" required />
            <span>I agree with the <a href="#" class="blue-text">Terms of Use</a> and <a href="#" class="blue-text">Privacy Policy</a></span>
        </label>
    `;
    
    // Insert before the submit button
    const submitButton = document.querySelector('#registerForm .btn');
    submitButton.parentNode.insertBefore(termsCheckbox, submitButton);

    // Handle terms acceptance
    const acceptTermsInput = document.getElementById('acceptTerms');
    acceptTermsInput.addEventListener('change', function() {
        const submitBtn = document.querySelector('#registerBtn');
        if (this.checked) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('disabled');
        } else {
            submitBtn.disabled = true;
            submitBtn.classList.add('disabled');
        }
    });

    // Initially disable submit button
    const submitBtn = document.querySelector('#registerBtn');
    submitBtn.disabled = true;
    submitBtn.classList.add('disabled');

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

    // Password confirmation real-time check
    confirmPasswordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        const confirmPassword = this.value;
        
        if (confirmPassword && password !== confirmPassword) {
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else if (confirmPassword) {
            this.classList.add('valid');
            this.classList.remove('invalid');
        } else {
            this.classList.remove('valid', 'invalid');
        }
    });
}); 