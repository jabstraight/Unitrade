// frontend/assets/js/register.js

/**
 * Registration functionality for UniMarket
 * Handles form submission, validation, and account creation
 */

document.addEventListener('DOMContentLoaded', function() {
    // If user is already logged in, redirect to homepage
    if (isAuthenticated()) {
      window.location.href = 'index.html';
      return;
    }
    
    // Setup registration form submission
    setupRegistrationForm();
    
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
   * Set up registration form submission handler
   */
  function setupRegistrationForm() {
    const registerForm = document.getElementById('registerForm');
    
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get form values
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const university = document.getElementById('university').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const termsCheck = document.getElementById('termsCheck').checked;
      
      // Validate form
      if (!validateForm(name, email, university, password, confirmPassword, termsCheck)) {
        return;
      }
      
      // Show loading state
      const submitBtn = document.getElementById('registerButton');
      const originalBtnText = submitBtn.textContent;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
      submitBtn.disabled = true;
      
      try {
        // Send registration request to API
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            university,
            password
          })
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
          showAlert('Your account has been created successfully!', 'success');
          
          // Redirect to homepage after short delay
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1500);
        } else {
          throw new Error(data.message || 'Registration failed');
        }
      } catch (error) {
        console.error('Registration error:', error);
        showAlert(error.message || 'Registration failed. Please try again.', 'danger');
      } finally {
        // Reset button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }
  
  /**
   * Validate registration form inputs
   * @param {string} name - User's full name
   * @param {string} email - User's email address
   * @param {string} university - User's university
   * @param {string} password - User's password
   * @param {string} confirmPassword - Password confirmation
   * @param {boolean} termsCheck - Terms acceptance checkbox
   * @returns {boolean} True if form is valid, false otherwise
   */
  function validateForm(name, email, university, password, confirmPassword, termsCheck) {
    // Check name
    if (!name) {
      showAlert('Please enter your full name', 'danger');
      return false;
    }
    
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
    
    // Check for university email (recommended but optional)
    // Uncomment this if you want to strictly enforce university emails
    /*
    if (!email.endsWith('.edu')) {
      showAlert('Please use your university email address', 'danger');
      return false;
    }
    */
    
    // Check university
    if (!university) {
      showAlert('Please enter your university name', 'danger');
      return false;
    }
    
    // Check password
    if (!password) {
      showAlert('Please enter a password', 'danger');
      return false;
    }
    
    // Check password length
    if (password.length < 6) {
      showAlert('Password must be at least 6 characters long', 'danger');
      return false;
    }
    
    // Check password strength (optional)
    // Uncomment this if you want to enforce stronger passwords
    /*
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      showAlert('Password must include at least one uppercase letter, one lowercase letter, one number, and one special character', 'danger');
      return false;
    }
    */
    
    // Check password confirmation
    if (password !== confirmPassword) {
      showAlert('Passwords do not match', 'danger');
      return false;
    }
    
    // Check terms acceptance
    if (!termsCheck) {
      showAlert('You must accept the Terms and Conditions', 'danger');
      return false;
    }
    
    return true;
  }
  
  /**
   * Display an alert message in the registration form
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