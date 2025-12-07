const API_BASE_URL = window.location.origin + '/api/auth';

async function loadDashboard() {
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const dashboardContent = document.getElementById('dashboardContent');
  
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  
  console.log('🔑 Token from localStorage:', token);
  console.log('👤 User from localStorage:', storedUser);
  
  if (!token) {
    console.log('❌ No token found, redirecting to login');
    window.location.href = 'login.html';
    return;
  }
  
  try {
    console.log('🌐 Fetching dashboard from:', `${API_BASE_URL}/dashboard`);
    console.log('📤 Sending token:', token);
    
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📥 Response status:', response.status);
    
    if (response.status === 401) {
      console.log('❌ Token expired or invalid');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
      return;
    }
    
    const data = await response.json();
    console.log('📊 Dashboard data received:', data);
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to load dashboard');
    }
    
    // Hide loading, show content
    loading.style.display = 'none';
    dashboardContent.style.display = 'block';
    
    // Display ACTUAL user data from server
    if (data.user) {
      console.log('✅ Displaying user:', data.user);
      document.getElementById('welcomeMessage').textContent = `Welcome, ${data.user.name}!`;
      document.getElementById('userId').textContent = data.user.id;
      document.getElementById('userName').textContent = data.user.name;
      document.getElementById('userEmail').textContent = data.user.email;
      
      if (data.user.created_at) {
        const createdDate = new Date(data.user.created_at);
        document.getElementById('userCreated').textContent = createdDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
      // Update localStorage with fresh data
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    loading.style.display = 'none';
    error.textContent = `Error: ${error.message}`;
    
    // Show cached data as fallback
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        dashboardContent.style.display = 'block';
        document.getElementById('welcomeMessage').textContent = `Welcome, ${user.name}! (cached)`;
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userEmail').textContent = user.email;
      } catch (e) {
        console.log('Could not use cached data:', e);
      }
    }
  }
}

// Logout function
window.logout = function() {
  console.log('🚪 Logging out...');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
};

// Add debug button
window.debugInfo = function() {
  console.log('=== DEBUG INFO ===');
  console.log('Token:', localStorage.getItem('token'));
  console.log('User:', localStorage.getItem('user'));
  
  // Test API directly
  fetch(`${API_BASE_URL}/dashboard`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(r => r.json())
    .then(console.log)
    .catch(console.error);
};

// Initialize
document.addEventListener('DOMContentLoaded', loadDashboard);