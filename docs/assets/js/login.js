// frontend/assets/js/login.js

/**
 * Login functionality for UniMarket
 * Handles form submission, validation, and authentication
 */

document.addEventListener('DOMContentLoaded', function() {
    // If user is already logged in, redirect to homepage
    if (isAuthenticated()) {
      window.location.href = 'index.html';
      return;
    }
    
    // Setup login form submission
    setupLoginForm();
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', function() {
        const navLinks = document.getElementById('navLinks');
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
      });
    }
  });
  
  /**
   * Set up login form submission handler
   */
  function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get form values
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      
      // Validate form
      if (!validateForm(email, password)) {
        return;
      }
      
      // Show loading state
      const submitBtn = document.getElementById('loginButton');
      const originalBtnText = submitBtn.textContent;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
      submitBtn.disabled = true;
      
      try {
        // Send login request to API
        const response = await fetch(`${API_BASE_URL}/users/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Store user data and token
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify({
            id: data._id,
            name: data.name,
            email: data.email,
            university: data.university,
            profilePicture: data.profilePicture
          }));
          
          // Show success message
          showAlert('Login successful!', 'success');
          
          // Redirect to desired page
          setTimeout(() => {
            // Check if there's a redirect URL in query params
            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get('redirect');
            
            if (redirectUrl) {
              window.location.href = redirectUrl;
            } else {
              window.location.href = 'index.html';
            }
          }, 1000);
        } else {
          throw new Error(data.message || 'Invalid credentials');
        }
      } catch (error) {
        console.error('Login error:', error);
        showAlert(error.message || 'Login failed. Please try again.', 'danger');
      } finally {
        // Reset button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }
  
  /**
   * Validate login form inputs
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {boolean} True if form is valid, false otherwise
   */
  function validateForm(email, password) {
    // Check email
    if (!email) {
      showAlert('Please enter your email address', 'danger');
      return false;
    }
    
    // Simple email validation
    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(email)) {
      showAlert('Please enter a valid email address', 'danger');
      return false;
    }
    
    // Check for university email (optional)
    // if (!email.endsWith('.edu')) {
    //   showAlert('Please use your university email address', 'danger');
    //   return false;
    // }
    
    // Check password
    if (!password) {
      showAlert('Please enter your password', 'danger');
      return false;
    }
    
    return true;
  }
  
  /**
   * Display an alert message in the login form
   * @param {string} message - Message to display
   * @param {string} type - Alert type (success, danger, warning)
   */
  function showAlert(message, type) {
    const alertPlaceholder = document.getElementById('alertPlaceholder');
    
    if (!alertPlaceholder) return;
    
    // Create alert element
    const wrapper = document.createElement('div');
    wrapper.className = `alert alert-${type}`;
    wrapper.innerHTML = `
      ${message}
      <button type="button" class="close-btn" style="float: right; background: none; border: none; color: inherit; cursor: pointer;" onclick="this.parentElement.remove();">
        &times;
      </button>
    `;
    
    // Clear existing alerts
    alertPlaceholder.innerHTML = '';
    
    // Add new alert
    alertPlaceholder.appendChild(wrapper);
    
    // Auto dismiss success alerts after 3 seconds
    if (type === 'success') {
      setTimeout(() => {
        if (wrapper.parentNode) {
          wrapper.remove();
        }
      }, 3000);
    }
  }