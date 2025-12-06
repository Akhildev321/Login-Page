const API_BASE_URL = 'http://localhost:5000/api/auth';

// Load dashboard data
const loadDashboard = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to load dashboard');
    }
    
    // Hide loading, show content
    document.getElementById('loading').style.display = 'none';
    document.getElementById('dashboardContent').style.display = 'block';
    
    // Display user data
    document.getElementById('welcomeMessage').textContent = `Welcome, ${data.user.name}!`;
    document.getElementById('userId').textContent = data.user.id;
    document.getElementById('userName').textContent = data.user.name;
    document.getElementById('userEmail').textContent = data.user.email;
    
    // Format date
    const createdDate = new Date(data.user.created_at);
    document.getElementById('userCreated').textContent = createdDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
  } catch (error) {
    document.getElementById('error').textContent = error.message;
    
    // If token is invalid, redirect to login
    if (error.message.includes('token') || error.message.includes('authorization')) {
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
      }, 2000);
    }
  }
};

// Logout function
window.logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
};

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  
  // Check auth status
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
  }
});