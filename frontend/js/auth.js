const API_BASE_URL = '/api/auth';

// Common utility functions
const showError = (elementId, message) => {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.style.color = '#e74c3c';
  setTimeout(() => element.textContent = '', 5000);
};

const showSuccess = (elementId, message) => {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.style.color = '#27ae60';
  setTimeout(() => element.textContent = '', 5000);
};

// Signup functionality
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Basic validation
    if (password.length < 6) {
      showError('error', 'Password must be at least 6 characters');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }
      
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      showSuccess('success', 'Account created successfully! Redirecting...');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
      
    } catch (error) {
      showError('error', error.message);
    }
  });
}

// Login functionality
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      showSuccess('success', 'Login successful! Redirecting...');
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
      
    } catch (error) {
      showError('error', error.message);
    }
  });
}

// Check if user is already logged in
const checkAuth = () => {
  const token = localStorage.getItem('token');
  const currentPage = window.location.pathname;
  
  // If user is on login/signup page but already logged in
  if (token && (currentPage.includes('login.html') || currentPage.includes('signup.html'))) {
    window.location.href = 'dashboard.html';
  }
  
  // If user is on dashboard but not logged in
  if (!token && currentPage.includes('dashboard.html')) {
    window.location.href = 'login.html';
  }
};

// Initialize auth check
document.addEventListener('DOMContentLoaded', checkAuth);