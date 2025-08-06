// Main JavaScript for Login Web with IA

// API Configuration - Use local proxy
const API_BASE_URL = window.location.origin;

// Utility Functions
class AuthAPI {
    static async makeRequest(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = AuthManager.getToken();
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
        };

        const config = { 
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...(options.headers || {})
            }
        };
        
        console.log('Making API request to:', url);
        console.log('Request options:', config);

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            console.log('API Response:', {
                status: response.status,
                ok: response.ok,
                data: data
            });
            
            return {
                success: response.ok,
                status: response.status,
                data: data
            };
        } catch (error) {
            console.error('API Request Error:', error);
            return {
                success: false,
                status: 500,
                data: { error: 'Server connection error' }
            };
        }
    }

    static async register(userData) {
        return this.makeRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    static async login(credentials) {
        return this.makeRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    static async getProfile() {
        const token = AuthManager.getToken();
        if (!token || !AuthManager.isTokenValid()) {
            return {
                success: false,
                status: 401,
                data: { error: 'Token not found or expired' }
            };
        }

        return this.makeRequest('/api/auth/profile', {
            method: 'GET'
        });
    }

    static async forgotPassword(email) {
        return this.makeRequest('/api/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    static async resetPassword(data) {
        return this.makeRequest('/api/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async updatePassword(currentPassword, newPassword, confirmPassword) {
        console.log('Updating password with:', { currentPassword: '***', newPassword: '***', confirmPassword: '***' });
        const token = AuthManager.getToken();
        console.log('Current token:', token ? 'exists' : 'missing');
        
        const response = await this.makeRequest('/api/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
        });
        
        console.log('Update password response:', {
            success: response.success,
            status: response.status,
            error: response.data?.error || null
        });
        
        return response;
    }
}

// UI Utility Functions
class UIUtils {
    static showMessage(elementId, message, type = 'error') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const textElement = element.querySelector('span') || element;
        textElement.textContent = message;

        element.className = `card-panel ${type === 'error' ? 'red lighten-4 red-text text-darken-4' : 'green lighten-4 green-text text-darken-4'}`;
        element.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }

    static hideMessage(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    }

    static showLoading(loadingId, formId) {
        const loading = document.getElementById(loadingId);
        const form = document.getElementById(formId);
        
        if (loading) loading.style.display = 'block';
        if (form) form.style.display = 'none';
    }

    static hideLoading(loadingId, formId) {
        const loading = document.getElementById(loadingId);
        const form = document.getElementById(formId);
        
        if (loading) loading.style.display = 'none';
        if (form) form.style.display = 'block';
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        if (!password || password.length < 6) {
            return false;
        }
        // Must contain at least one uppercase letter, one lowercase letter, and one number
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        
        return hasUpperCase && hasLowerCase && hasNumber;
    }

    static validateName(name) {
        return name && name.trim().length >= 2 && name.trim().length <= 50;
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Authentication Management
class AuthManager {
    static TOKEN_EXPIRY_MINUTES = 10; // Token expira em 10 minutos

    static isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;
        
        // Verifica se o token não expirou
        return this.isTokenValid();
    }

    static getToken() {
        const tokenData = sessionStorage.getItem('tokenData');
        if (!tokenData) return null;
        
        try {
            const { token, timestamp } = JSON.parse(tokenData);
            return token;
        } catch (error) {
            console.error('Error parsing token data:', error);
            this.removeToken();
            return null;
        }
    }

    static setToken(token) {
        const tokenData = {
            token: token,
            timestamp: Date.now()
        };
        sessionStorage.setItem('tokenData', JSON.stringify(tokenData));
        
        // Limpar token expirado do localStorage se existir
        localStorage.removeItem('token');
    }

    static isTokenValid() {
        const tokenData = sessionStorage.getItem('tokenData');
        if (!tokenData) return false;
        
        try {
            const { timestamp } = JSON.parse(tokenData);
            const now = Date.now();
            const expiryTime = this.TOKEN_EXPIRY_MINUTES * 60 * 1000; // em milissegundos
            
            const isValid = (now - timestamp) < expiryTime;
            
            if (!isValid) {
                console.log('Token expired, removing...');
                this.removeToken();
            }
            
            return isValid;
        } catch (error) {
            console.error('Error validating token:', error);
            this.removeToken();
            return false;
        }
    }

    static removeToken() {
        sessionStorage.removeItem('tokenData');
        // Também remove token antigo do localStorage se existir
        localStorage.removeItem('token');
    }

    static logout() {
        this.removeToken();
        // Limpar também outros dados de sessão
        sessionStorage.removeItem('justLoggedIn');
        sessionStorage.clear();
        window.location.href = '/login';
    }

    static redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            window.location.href = '/dashboard';
        }
    }

    static redirectIfNotAuthenticated() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login';
        }
    }

    static getTokenExpiryInfo() {
        const tokenData = sessionStorage.getItem('tokenData');
        if (!tokenData) return null;
        
        try {
            const { timestamp } = JSON.parse(tokenData);
            const now = Date.now();
            const expiryTime = this.TOKEN_EXPIRY_MINUTES * 60 * 1000;
            const timeLeft = expiryTime - (now - timestamp);
            
            return {
                expiresAt: new Date(timestamp + expiryTime),
                timeLeftMs: timeLeft,
                timeLeftMinutes: Math.round(timeLeft / (60 * 1000) * 10) / 10
            };
        } catch (error) {
            return null;
        }
    }
}

// Form Validation
class FormValidator {
    static validateLoginForm(email, password) {
        const errors = [];

        if (!email || !UIUtils.validateEmail(email)) {
            errors.push('Invalid email');
        }

        if (!password) {
            errors.push('Password is required');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    static validateRegisterForm(name, email, password, confirmPassword) {
        const errors = [];

        if (!UIUtils.validateName(name)) {
            errors.push('Name must be between 2 and 50 characters');
        }

        if (!UIUtils.validateEmail(email)) {
            errors.push('Invalid email');
        }

        if (!UIUtils.validatePassword(password)) {
            errors.push('Password must have at least 6 characters, including uppercase, lowercase, and number');
        }

        if (password !== confirmPassword) {
            errors.push('Passwords do not match');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Initialize MaterializeCSS components
document.addEventListener('DOMContentLoaded', function() {
    // Initialize MaterializeCSS components
    M.AutoInit();

    // Initialize tooltips
    const tooltips = document.querySelectorAll('.tooltipped');
    M.Tooltip.init(tooltips);

    // Initialize modals
    const modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);

    // Initialize dropdowns
    const dropdowns = document.querySelectorAll('.dropdown-trigger');
    M.Dropdown.init(dropdowns);

    // Initialize sidenav for mobile
    const sidenavs = document.querySelectorAll('.sidenav');
    M.Sidenav.init(sidenavs);

    // Initialize tabs
    const tabs = document.querySelectorAll('.tabs');
    M.Tabs.init(tabs);

    // Initialize collapsible
    const collapsibles = document.querySelectorAll('.collapsible');
    M.Collapsible.init(collapsibles);

    // Initialize select
    const selects = document.querySelectorAll('select');
    M.FormSelect.init(selects);

    // Initialize date picker
    const datepickers = document.querySelectorAll('.datepicker');
    M.Datepicker.init(datepickers);

    // Initialize time picker
    const timepickers = document.querySelectorAll('.timepicker');
    M.Timepicker.init(timepickers);

    // Initialize character counter
    const characterCounters = document.querySelectorAll('.character-counter');
    M.CharacterCounter.init(characterCounters);

    // Initialize chips
    const chips = document.querySelectorAll('.chips');
    M.Chips.init(chips);

    // Initialize floating action button
    const fab = document.querySelectorAll('.fixed-action-btn');
    M.FloatingActionButton.init(fab);

    // Initialize scrollspy
    const scrollspy = document.querySelectorAll('.scrollspy');
    M.ScrollSpy.init(scrollspy);

    // Initialize pushpin
    const pushpin = document.querySelectorAll('.pushpin');
    M.Pushpin.init(pushpin);

    // Initialize parallax
    const parallax = document.querySelectorAll('.parallax');
    M.Parallax.init(parallax);

    // Initialize carousel
    const carousel = document.querySelectorAll('.carousel');
    M.Carousel.init(carousel);

    // Initialize materialbox
    const materialbox = document.querySelectorAll('.materialboxed');
    M.Materialbox.init(materialbox);

    // Initialize slider
    const slider = document.querySelectorAll('.slider');
    M.Slider.init(slider);

    // Initialize autocomplete
    const autocomplete = document.querySelectorAll('.autocomplete');
    M.Autocomplete.init(autocomplete);

    // Initialize form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('invalid');
                } else {
                    field.classList.remove('invalid');
                    field.classList.add('valid');
                }
            });

            if (!isValid) {
                e.preventDefault();
                M.toast({html: 'Please fill in all required fields', classes: 'red'});
            }
        });
    });
});

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global Error:', e.error);
    M.toast({html: 'An unexpected error occurred', classes: 'red'});
});

// Export classes for use in other files
window.AuthAPI = AuthAPI;
window.UIUtils = UIUtils;
window.AuthManager = AuthManager;
window.FormValidator = FormValidator; 