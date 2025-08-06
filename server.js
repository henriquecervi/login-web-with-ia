const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API Proxy Routes
app.post('/api/auth/register', async (req, res) => {
    console.log('Register request received:', req.body);
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        console.log('Register API response:', { status: response.status, data });
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Register proxy error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    console.log('Login request received:', { email: req.body.email });
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        console.log('Login API response:', { status: response.status, success: !!data.token });
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Login proxy error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/auth/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Profile proxy error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/auth/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Update profile proxy error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/auth/change-password', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Change password proxy error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Web Server running on http://localhost:${PORT}`);
    console.log(`📡 Connecting to API at: ${API_BASE_URL}`);
    console.log(`🌐 Login Page: http://localhost:${PORT}/login`);
    console.log(`📝 Register Page: http://localhost:${PORT}/register`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`⚠️  Make sure API is running on ${API_BASE_URL}`);
}); 