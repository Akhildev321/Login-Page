// API Configuration
const API_BASE_URL = window.location.origin + '/api/auth';
console.log('🔗 API Base URL:', API_BASE_URL);

// Password requirements
const PASSWORD_REQUIREMENTS = `
Password must contain:
• At least 8 characters
• At least 1 uppercase letter (A-Z)
• At least 1 lowercase letter (a-z)
• At least 1 number (0-9)
• At least 1 special symbol (@$!%*?&)
`;

// Utility functions
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `<div class="error-message">❌ ${message}</div>`;
    setTimeout(() => {
      element.innerHTML = '';
    }, 5000);
  }
}

function showSuccess(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `<div class="success-message">✅ ${message}</div>`;
    setTimeout(() => {
      element.innerHTML = '';
    }, 3000);
  }
}

// Password strength checker
function checkPasswordStrength(password) {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[@$!%*?&]/.test(password)
  };
  
  const passed = Object.values(requirements).filter(Boolean).length;
  const total = Object.keys(requirements).length;
  const strength = Math.floor((passed / total) * 100);
  
  return { requirements, strength, passed, total };
}

// Update password strength meter
function updatePasswordStrength(password) {
  const strengthMeter = document.getElementById('passwordStrength');
  const requirementsList = document.getElementById('passwordRequirements');
  
  if (!strengthMeter || !requirementsList) return;
  
  const { requirements, strength } = checkPasswordStrength(password);
  
  // Update meter
  strengthMeter.style.width = `${strength}%`;
  
  if (strength < 40) {
    strengthMeter.style.backgroundColor = '#dc3545'; // Red
  } else if (strength < 80) {
    strengthMeter.style.backgroundColor = '#ffc107'; // Yellow
  } else {
    strengthMeter.style.backgroundColor = '#28a745'; // Green
  }
  
  // Update requirements list
  const requirementsHtml = `
    <div class="requirements-list">
      <h4>Password Requirements:</h4>
      <div class="${requirements.length ? 'requirement-met' : 'requirement-not-met'}">
        ${requirements.length ? '✅' : '❌'} At least 8 characters
      </div>
      <div class="${requirements.uppercase ? 'requirement-met' : 'requirement-not-met'}">
        ${requirements.uppercase ? '✅' : '❌'} At least 1 uppercase letter
      </div>
      <div class="${requirements.lowercase ? 'requirement-met' : 'requirement-not-met'}">
        ${requirements.lowercase ? '✅' : '❌'} At least 1 lowercase letter
      </div>
      <div class="${requirements.number ? 'requirement-met' : 'requirement-not-met'}">
        ${requirements.number ? '✅' : '❌'} At least 1 number
      </div>
      <div class="${requirements.symbol ? 'requirement-met' : 'requirement-not-met'}">
        ${requirements.symbol ? '✅' : '❌'} At least 1 special symbol (@$!%*?&)
      </div>
    </div>
  `;
  
  requirementsList.innerHTML = requirementsHtml;
}

// ==================== SIGNUP ====================
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  const passwordInput = document.getElementById('password');
  
  // Add password strength meter HTML
  const passwordField = passwordInput.parentElement;
  passwordField.innerHTML += `
    <div class="password-strength-meter">
      <div class="strength-bar">
        <div id="passwordStrength" class="strength-fill"></div>
      </div>
      <div id="passwordRequirements" class="requirements-container"></div>
    </div>
  `;
  
  // Real-time password validation
  passwordInput.addEventListener('input', (e) => {
    updatePasswordStrength(e.target.value);
  });
  
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Client-side password validation
    const { requirements } = checkPasswordStrength(password);
    const allRequirementsMet = Object.values(requirements).every(Boolean);
    
    if (!allRequirementsMet) {
      showError('error', 'Password does not meet all requirements. Please check the requirements below.');
      updatePasswordStrength(password);
      return;
    }
    
    const submitBtn = signupForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating account...';
    submitBtn.disabled = true;
    
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
        // Server-side validation failed
        let errorMessage = data.error || 'Signup failed. Please try again.';
        if (data.requirements) {
          errorMessage += `<br><small>${data.requirements}</small>`;
        }
        throw new Error(errorMessage);
      }
      
      // Store authentication data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      showSuccess('success', '🎉 Account created successfully! Redirecting...');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
      
    } catch (error) {
      showError('error', error.message);
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

// ==================== LOGIN ====================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
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
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }
      
      // Store authentication data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      showSuccess('success', '✅ Login successful! Redirecting...');
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
      
    } catch (error) {
      showError('error', error.message);
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

// ==================== AUTH CHECK ====================
function checkAuthStatus() {
  const token = localStorage.getItem('token');
  const currentPage = window.location.pathname;
  
  // If user is logged in and tries to access login/signup pages
  if (token && (currentPage.includes('login.html') || currentPage.includes('signup.html'))) {
    window.location.href = 'dashboard.html';
  }
  
  // If user is not logged in and tries to access dashboard
  if (!token && currentPage.includes('dashboard.html')) {
    window.location.href = 'login.html';
  }
}

// Check auth status on page load
document.addEventListener('DOMContentLoaded', checkAuthStatus);