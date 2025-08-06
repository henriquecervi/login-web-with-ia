// Dashboard Page JavaScript

// Global variable to store user data
let currentUserData = null;

// Global modal functions
function showSettingsModal() {
    // Get current user data
    const currentUser = currentUserData || {};
    
    // Get current dark mode state
    const isDarkModeEnabled = document.body.classList.contains('dark-mode');
    
    const modalHTML = `
        <div id="settingsModal" class="modal settings-modal">
            <div class="modal-content">
                <h4 class="blue-text text-darken-3">
                    <i class="material-icons left">settings</i>
                    Settings
                </h4>
                <div class="settings-content">
                    <div class="settings-section">
                        <h6 class="blue-text text-darken-2">Display Settings</h6>
                        <div class="settings-item">
                            <label>
                                <input type="checkbox" id="darkMode" ${isDarkModeEnabled ? 'checked' : ''} />
                                <span>Dark Mode</span>
                            </label>
                        </div>
                        <div class="settings-item">
                            <label>
                                <input type="checkbox" id="emailNotifications" checked />
                                <span>Email Notifications</span>
                            </label>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h6 class="blue-text text-darken-2">Profile Settings</h6>
                        <div class="input-field">
                            <input id="displayName" type="text" value="${currentUser.name || ''}" />
                            <label for="displayName">Display Name</label>
                        </div>
                        <div class="input-field">
                            <input id="userEmail" type="email" value="${currentUser.email || ''}" disabled />
                            <label for="userEmail">Email</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-close waves-effect waves-light btn-flat grey-text">Cancel</button>
                <button type="button" class="waves-effect waves-light btn blue darken-2" id="saveSettings">
                    <i class="material-icons left">save</i>
                    Save Settings
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = M.Modal.init(document.getElementById('settingsModal'), {
        dismissible: true,
        opacity: 0.3,
        inDuration: 250,
        outDuration: 200,
        startingTop: '5%',
        endingTop: '8%'
    });
    modal.open();

    // Initialize form fields
    M.updateTextFields();

    // Handle settings save
    document.getElementById('saveSettings').addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Get form values
        const darkMode = document.getElementById('darkMode').checked;
        const emailNotifications = document.getElementById('emailNotifications').checked;
        const displayName = document.getElementById('displayName').value.trim();
        
        // Validate display name
        if (!displayName) {
            M.toast({html: 'Display name cannot be empty', classes: 'red'});
            return;
        }
        
        const saveBtn = e.target;
        const originalText = saveBtn.innerHTML;
        
        // Show loading state
        saveBtn.innerHTML = '<i class="material-icons left">hourglass_empty</i>Saving...';
        saveBtn.disabled = true;
        
        try {
            // Apply dark mode
            toggleDarkMode(darkMode);
            
            // Update current user data locally
            if (currentUserData) {
                currentUserData.name = displayName;
                // Update the displayed profile immediately
                displayUserProfile({ user: currentUserData });
            }
            
            // Here you could add an API call to save the name change
            // const response = await AuthAPI.updateProfile({ name: displayName });
            
            M.toast({html: 'Settings saved successfully!', classes: 'green'});
            modal.close();
        } catch (error) {
            M.toast({html: 'Failed to save settings', classes: 'red'});
        } finally {
            // Restore button state
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    });
    
    // Clean up modal
    document.getElementById('settingsModal').addEventListener('modal:close', function() {
        setTimeout(() => this.remove(), 300);
    });
}

function showSecurityModal() {
    const modalHTML = `
        <div id="securityModal" class="modal security-modal">
            <div class="modal-content">
                <h4 class="green-text text-darken-3">
                    <i class="material-icons left">security</i>
                    Security Settings
                </h4>
                <div class="security-content">
                    <div class="security-section">
                        <h6 class="green-text text-darken-2">Password Management</h6>
                        <div class="input-field">
                            <input id="currentPassword" type="password" required />
                            <label for="currentPassword">Current Password</label>
                        </div>
                        <div class="input-field">
                            <input id="newPassword" type="password" required minlength="6" />
                            <label for="newPassword">New Password</label>
                            <span class="helper-text">Must have at least 6 characters with uppercase, lowercase, and number</span>
                        </div>
                        <div class="input-field">
                            <input id="confirmNewPassword" type="password" required />
                            <label for="confirmNewPassword">Confirm New Password</label>
                        </div>
                    </div>
                    <div class="security-section">
                        <h6 class="green-text text-darken-2">Security Options</h6>
                        <div class="security-options">
                            <label class="security-item">
                                <input type="checkbox" id="twoFactorAuth" />
                                <span>Enable Two-Factor Authentication</span>
                            </label>
                            <label class="security-item">
                                <input type="checkbox" id="loginNotifications" checked />
                                <span>Login Notifications</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-close waves-effect waves-light btn-flat grey-text">Cancel</button>
                <button type="button" class="waves-effect waves-light btn green darken-2" id="saveSecurity">
                    <i class="material-icons left">security</i>
                    Update Security
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize modal
    const modalElement = document.getElementById('securityModal');
    const modal = M.Modal.init(modalElement, {
        dismissible: true,
        opacity: 0.3,
        inDuration: 250,
        outDuration: 200,
        startingTop: '5%',
        endingTop: '8%'
    });
    
    // Initialize form fields
    M.updateTextFields();
    modal.open();
    
    // Handle save security
    const saveButton = document.getElementById('saveSecurity');
    saveButton.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Get form values
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        const twoFactorAuth = document.getElementById('twoFactorAuth').checked;
        const loginNotifications = document.getElementById('loginNotifications').checked;

        // Validate passwords
        if (!currentPassword) {
            M.toast({html: 'Current password is required', classes: 'red'});
            return;
        }

        if (!newPassword) {
            M.toast({html: 'New password is required', classes: 'red'});
            return;
        }

        if (newPassword !== confirmNewPassword) {
            M.toast({html: 'New passwords do not match', classes: 'red'});
            return;
        }

        // Validate new password complexity
        if (!UIUtils.validatePassword(newPassword)) {
            M.toast({html: 'New password must have at least 6 characters with uppercase, lowercase, and number', classes: 'red'});
            return;
        }

        try {
            // Show loading state
            saveButton.innerHTML = '<i class="material-icons left">hourglass_empty</i>Updating...';
            saveButton.disabled = true;
            
            // Disable all inputs
            const inputs = modalElement.querySelectorAll('input');
            inputs.forEach(input => input.disabled = true);

            // Update password
                                    const response = await AuthAPI.updatePassword(currentPassword, newPassword, confirmNewPassword);
                        console.log('Update password response:', response);

            if (response.success) {
                M.toast({html: 'Security settings updated successfully!', classes: 'green'});
                
                // Clear form
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmNewPassword').value = '';
                
                // Close modal after a short delay to show success state
                setTimeout(() => modal.close(), 500);
            } else {
                // Handle specific error cases
                if (response.status === 401) {
                    M.toast({html: 'Current password is incorrect', classes: 'red'});
                    document.getElementById('currentPassword').focus();
                } else if (response.data && response.data.error) {
                    M.toast({html: response.data.error, classes: 'red'});
                } else {
                    M.toast({html: 'Failed to update security settings', classes: 'red'});
                }
                
                // Re-enable inputs
                inputs.forEach(input => input.disabled = false);
            }
        } catch (error) {
            console.error('Security update error:', error);
            M.toast({html: 'An error occurred while updating security settings', classes: 'red'});
            
            // Re-enable inputs
            const inputs = modalElement.querySelectorAll('input');
            inputs.forEach(input => input.disabled = false);
        } finally {
            // Restore button state
            saveButton.innerHTML = '<i class="material-icons left">security</i>Update Security';
            saveButton.disabled = false;
        }
    });
    
    // Clean up modal
    document.getElementById('securityModal').addEventListener('modal:close', function() {
        setTimeout(() => this.remove(), 300);
    });
}

function showHelpModal() {
    const modalHTML = `
        <div id="helpModal" class="modal help-modal">
            <div class="modal-content">
                <h4 class="orange-text text-darken-3">
                    <i class="material-icons left">help</i>
                    Help & Support
                </h4>
                <div class="help-content">
                    <div class="help-section">
                        <h6 class="orange-text text-darken-2">Frequently Asked Questions</h6>
                        <ul class="collapsible help-faq">
                            <li>
                                <div class="collapsible-header">
                                    <i class="material-icons">expand_more</i>
                                    How do I change my password?
                                </div>
                                <div class="collapsible-body">
                                    <p>Go to Security Settings and enter your current password along with your new password.</p>
                                </div>
                            </li>
                            <li>
                                <div class="collapsible-header">
                                    <i class="material-icons">expand_more</i>
                                    How do I enable dark mode?
                                </div>
                                <div class="collapsible-body">
                                    <p>Go to Settings and toggle the Dark Mode option.</p>
                                </div>
                            </li>
                            <li>
                                <div class="collapsible-header">
                                    <i class="material-icons">expand_more</i>
                                    What is two-factor authentication?
                                </div>
                                <div class="collapsible-body">
                                    <p>Two-factor authentication adds an extra layer of security to your account by requiring a second form of verification.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h6 class="orange-text text-darken-2">Contact Support</h6>
                        <p>If you need additional help, please contact our support team:</p>
                        <ul class="help-contact">
                            <li><i class="material-icons tiny">email</i> support@loginwithia.com</li>
                            <li><i class="material-icons tiny">phone</i> +1 (555) 123-4567</li>
                            <li><i class="material-icons tiny">schedule</i> Mon-Fri 9AM-5PM EST</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-close waves-effect waves-light btn orange darken-2">Close</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = M.Modal.init(document.getElementById('helpModal'), {
        dismissible: true,
        opacity: 0.3,
        inDuration: 250,
        outDuration: 200,
        startingTop: '5%',
        endingTop: '8%'
    });
    modal.open();
    
    // Initialize collapsible
    M.Collapsible.init(document.querySelectorAll('.collapsible'));
    
    // Clean up modal
    document.getElementById('helpModal').addEventListener('modal:close', function() {
        setTimeout(() => this.remove(), 300);
    });
}

function showLogoutModal() {
    // Create modal HTML with better styling
    const modalHTML = `
        <div id="logoutModal" class="modal logout-modal">
            <div class="modal-content">
                <div class="logout-header">
                    <div class="logout-icon">
                        <i class="material-icons large">logout</i>
                    </div>
                    <h4 class="blue-text text-darken-3">Confirm Logout</h4>
                </div>
                <div class="logout-body">
                    <p class="flow-text">Are you sure you want to logout from your account?</p>
                    <p class="grey-text">You will need to login again to access the dashboard.</p>
                    <div class="logout-warning">
                        <i class="material-icons small orange-text">warning</i>
                        <span class="orange-text">Your session will be terminated</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-close waves-effect waves-light btn-flat grey-text">
                    <i class="material-icons left">cancel</i>
                    Cancel
                </button>
                <button type="button" class="waves-effect waves-light btn red darken-2" id="confirmLogout">
                    <i class="material-icons left">logout</i>
                    Logout
                </button>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize modal with better options
    const modal = M.Modal.init(document.getElementById('logoutModal'), {
        dismissible: true,
        opacity: 0.5,
        inDuration: 250,
        outDuration: 250,
        startingTop: '4%',
        endingTop: '10%'
    });
    modal.open();
    
    // Handle confirm logout
    document.getElementById('confirmLogout').addEventListener('click', function(e) {
        e.preventDefault();
        modal.close();
        setTimeout(() => {
            AuthManager.logout();
        }, 300);
    });
    
    // Clean up modal after close
    document.getElementById('logoutModal').addEventListener('modal:close', function() {
        setTimeout(() => {
            this.remove();
        }, 300);
    });
}

// Dark mode toggle function
function toggleDarkMode(enable) {
    const isDarkMode = enable !== undefined ? enable : !document.body.classList.contains('dark-mode');
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
    }
}

// Profile display functions
function displayUserProfile(data) {
    currentUserData = data.user || data;
    const userProfile = document.getElementById('userProfile');
    
    if (!userProfile) return;
    
    // Get user initials for avatar
    const userName = currentUserData.name || 'User';
    const initials = userName.split(' ').map(word => word.charAt(0).toUpperCase()).join('').substring(0, 2);
    
    const profileHTML = `
        <div class="user-info">
            <div class="user-avatar">
                <div class="avatar-circle">
                    <span class="avatar-initials">${initials}</span>
                </div>
            </div>
            <div class="user-details">
                <h5 class="user-name">${userName}</h5>
                <p class="user-email grey-text">${currentUserData.email || 'No email'}</p>
                <p class="user-joined grey-text">
                    <i class="material-icons tiny">schedule</i>
                    Joined ${UIUtils.formatDate(currentUserData.createdAt || new Date())}
                </p>
            </div>
        </div>
        <div class="user-stats">
            <div class="stat-card">
                <div class="stat-number blue-text">1</div>
                <div class="stat-label">Active Sessions</div>
            </div>
            <div class="stat-card">
                <div class="stat-number green-text">${currentUserData.loginCount || 0}</div>
                <div class="stat-label">Total Logins</div>
            </div>
            <div class="stat-card">
                <div class="stat-number orange-text">High</div>
                <div class="stat-label">Security Level</div>
            </div>
        </div>
    `;
    
    userProfile.innerHTML = profileHTML;
}

function displayError(message) {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.querySelector('#errorText').textContent = message;
        errorMessage.style.display = 'block';
    }
}

    async function loadUserProfile() {
        try {
            const response = await AuthAPI.getProfile();
        console.log('Profile API response:', response);

            if (response.success) {
                displayUserProfile(response.data);
            } else {
                if (response.status === 401) {
                    // Token expired or invalid
                    AuthManager.logout();
                } else {
                displayError('Error loading user profile');
                }
            }
        } catch (error) {
        console.error('Error loading profile:', error);
        displayError('Failed to load user profile');
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    AuthManager.redirectIfNotAuthenticated();

    // Load user profile
    loadUserProfile();

    // Initialize event listeners
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showLogoutModal();
        });
    }

    // Handle refresh button in header
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const icon = refreshBtn.querySelector('i');
            const originalClass = icon.className;
            
            // Show loading animation
            icon.className = 'material-icons rotating';
            icon.textContent = 'hourglass_empty';
            refreshBtn.disabled = true;
            
            try {
                await loadUserProfile();
                M.toast({html: 'Profile refreshed successfully!', classes: 'green'});
            } catch (error) {
                M.toast({html: 'Failed to refresh profile', classes: 'red'});
            } finally {
                // Restore button state
                icon.className = originalClass;
                icon.textContent = 'refresh';
                refreshBtn.disabled = false;
            }
        });
    }

    // Initialize Quick Action buttons
    const settingsBtn = document.getElementById('settingsBtn');
    const securityBtn = document.getElementById('securityBtn');
    const helpBtn = document.getElementById('helpBtn');

    if (settingsBtn) {
        settingsBtn.addEventListener('click', showSettingsModal);
    }
    if (securityBtn) {
        securityBtn.addEventListener('click', showSecurityModal);
    }
    if (helpBtn) {
        helpBtn.addEventListener('click', showHelpModal);
    }

    // Initialize Floating Action Button
    const fab = document.querySelector('.fixed-action-btn');
    if (fab) {
        M.FloatingActionButton.init(fab, {
            direction: 'top',
            hoverEnabled: false
        });

        // FAB buttons
        const fabSettings = document.getElementById('fabSettings');
        const fabSecurity = document.getElementById('fabSecurity');
        const fabHelp = document.getElementById('fabHelp');

        if (fabSettings) {
            fabSettings.addEventListener('click', showSettingsModal);
        }
        if (fabSecurity) {
            fabSecurity.addEventListener('click', showSecurityModal);
        }
        if (fabHelp) {
            fabHelp.addEventListener('click', showHelpModal);
        }
    }

    // Apply saved dark mode setting (mantém no localStorage - configuração permanente)
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Mostrar informação de expiração do token no console para debug
    const tokenInfo = AuthManager.getTokenExpiryInfo();
    if (tokenInfo) {
        console.log(`Token expires at: ${tokenInfo.expiresAt.toLocaleString()}`);
        console.log(`Time left: ${tokenInfo.timeLeftMinutes} minutes`);
    }
}); 