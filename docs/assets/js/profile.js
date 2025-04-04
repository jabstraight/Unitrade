// frontend/assets/js/profile.js

/**
 * Profile page functionality for UniMarket
 * Handles profile data loading, editing, and image upload
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!requireAuth()) {
      return;
    }
    
    // Load profile data
    loadProfileData();
    
    // Setup form submission
    setupProfileForm();
    
    // Setup password change form
    setupPasswordForm();
    
    // Setup profile picture upload
    setupProfilePictureUpload();
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', function() {
        const navLinks = document.getElementById('navLinks');
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
      });
    }
    
    // Tab switching functionality
    setupTabs();
  });
  
  /**
   * Load user profile data from the API
   */
  async function loadProfileData() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = 'login.html';
        return;
      }
      
      // Show loading state
      document.getElementById('profileContent').style.display = 'none';
      document.getElementById('profileLoading').style.display = 'flex';
      
      // Fetch user profile data
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const userData = await response.json();
      
      if (!response.ok) {
        throw new Error(userData.message || 'Failed to load profile data');
      }
      
      // Hide loading, show content
      document.getElementById('profileLoading').style.display = 'none';
      document.getElementById('profileContent').style.display = 'block';
      
      // Populate form fields
      document.getElementById('name').value = userData.name || '';
      document.getElementById('email').value = userData.email || '';
      document.getElementById('university').value = userData.university || '';
      
      // Set profile picture if available
      const profilePicPreview = document.getElementById('profilePicPreview');
      if (profilePicPreview) {
        if (userData.profilePicture && userData.profilePicture !== 'default-profile.jpg') {
          profilePicPreview.src = `${IMAGE_BASE_URL}/${userData.profilePicture}`;
        } else {
          profilePicPreview.src = '../assets/images/default-profile.jpg';
        }
      }
      
      // Display user information in profile header
      const profileName = document.getElementById('profileName');
      const profileEmail = document.getElementById('profileEmail');
      const profileUniversity = document.getElementById('profileUniversity');
      
      if (profileName) profileName.textContent = userData.name || '';
      if (profileEmail) profileEmail.textContent = userData.email || '';
      if (profileUniversity) profileUniversity.textContent = userData.university || '';
      
      // Load user statistics if available (optional)
      loadUserStats();
      
    } catch (error) {
      console.error('Error loading profile:', error);
      document.getElementById('profileLoading').style.display = 'none';
      showAlert('Error loading profile data. Please try again later.', 'danger');
    }
  }
  
  /**
   * Load user statistics (listings count, etc.)
   */
  async function loadUserStats() {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch user listings for stats
      const response = await fetch(`${API_BASE_URL}/listings/user/listings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const listings = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to load user statistics');
      }
      
      // Count listings by status
      const totalListings = listings.length;
      const activeListings = listings.filter(listing => listing.status === 'Active').length;
      const soldListings = listings.filter(listing => listing.status === 'Sold').length;
      
      // Update stats display if elements exist
      const statsContainer = document.getElementById('userStats');
      if (statsContainer) {
        statsContainer.innerHTML = `
          <div class="stat-item">
            <span class="stat-value">${totalListings}</span>
            <span class="stat-label">Total Listings</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${activeListings}</span>
            <span class="stat-label">Active</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">${soldListings}</span>
            <span class="stat-label">Sold</span>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
      // Don't show an alert for this, it's not critical
    }
  }
  
  /**
   * Set up profile form submission
   */
  function setupProfileForm() {
    const profileForm = document.getElementById('profileForm');
    
    if (!profileForm) return;
    
    profileForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get form values
      const name = document.getElementById('name').value.trim();
      const university = document.getElementById('university').value.trim();
      
      // Validate form
      if (!name) {
        showAlert('Please enter your name', 'danger');
        return;
      }
      
      if (!university) {
        showAlert('Please enter your university', 'danger');
        return;
      }
      
      // Show loading state
      const submitBtn = profileForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      submitBtn.disabled = true;
      
      try {
        const token = localStorage.getItem('token');
        
        // Update profile via API
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name,
            university
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to update profile');
        }
        
        // Update stored user data
        const currentUser = JSON.parse(localStorage.getItem('user'));
        currentUser.name = data.name;
        currentUser.university = data.university;
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        // Update displayed user information
        const profileName = document.getElementById('profileName');
        const profileUniversity = document.getElementById('profileUniversity');
        
        if (profileName) profileName.textContent = data.name;
        if (profileUniversity) profileUniversity.textContent = data.university;
        
        // Show success message
        showAlert('Profile updated successfully', 'success');
        
      } catch (error) {
        console.error('Error updating profile:', error);
        showAlert(error.message || 'Failed to update profile', 'danger');
      } finally {
        // Reset button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }
  
  /**
   * Set up password change form
   */
  function setupPasswordForm() {
    const passwordForm = document.getElementById('passwordForm');
    
    if (!passwordForm) return;
    
    passwordForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get form values
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      // Validate form
      if (!currentPassword) {
        showAlert('Please enter your current password', 'danger', 'passwordAlertContainer');
        return;
      }
      
      if (!newPassword) {
        showAlert('Please enter a new password', 'danger', 'passwordAlertContainer');
        return;
      }
      
      if (newPassword.length < 6) {
        showAlert('New password must be at least 6 characters long', 'danger', 'passwordAlertContainer');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        showAlert('Passwords do not match', 'danger', 'passwordAlertContainer');
        return;
      }
      
      // Show loading state
      const submitBtn = passwordForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
      submitBtn.disabled = true;
      
      try {
        const token = localStorage.getItem('token');
        
        // Update password via API
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            password: newPassword,
            currentPassword: currentPassword
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to update password');
        }
        
        // Show success message
        showAlert('Password updated successfully', 'success', 'passwordAlertContainer');
        
        // Reset form
        passwordForm.reset();
        
      } catch (error) {
        console.error('Error updating password:', error);
        showAlert(error.message || 'Failed to update password', 'danger', 'passwordAlertContainer');
      } finally {
        // Reset button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }
  
  /**
   * Set up profile picture upload
   */
  function setupProfilePictureUpload() {
    const profilePicInput = document.getElementById('profilePicture');
    const profilePicPreview = document.getElementById('profilePicPreview');
    const uploadBtn = document.getElementById('uploadProfilePicBtn');
    
    if (!profilePicInput || !profilePicPreview) return;
    
    // Preview selected image
    profilePicInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
          profilePicPreview.src = e.target.result;
        }
        
        reader.readAsDataURL(this.files[0]);
        
        // Enable upload button if it exists
        if (uploadBtn) {
          uploadBtn.disabled = false;
        }
      }
    });
    
    // Handle upload button if it exists separately from the form
    if (uploadBtn) {
      uploadBtn.addEventListener('click', async function() {
        if (!profilePicInput.files || !profilePicInput.files[0]) {
          showAlert('Please select an image first', 'warning');
          return;
        }
        
        await uploadProfilePicture();
      });
    }
  }
  
  /**
   * Upload profile picture to the server
   */
  async function uploadProfilePicture() {
    const profilePicInput = document.getElementById('profilePicture');
    const uploadBtn = document.getElementById('uploadProfilePicBtn') || 
                     document.querySelector('#profilePictureForm button[type="submit"]');
    
    // Check if there's a file selected
    if (!profilePicInput || !profilePicInput.files || !profilePicInput.files[0]) {
      return;
    }
    
    // Show loading state
    const originalBtnText = uploadBtn ? uploadBtn.textContent : '';
    if (uploadBtn) {
      uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
      uploadBtn.disabled = true;
    }
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Add profile picture to form data
      formData.append('profilePicture', profilePicInput.files[0]);
      
      // Upload via API
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload profile picture');
      }
      
      // Update stored user data
      const currentUser = JSON.parse(localStorage.getItem('user'));
      currentUser.profilePicture = data.profilePicture;
      localStorage.setItem('user', JSON.stringify(currentUser));
      
      // Show success message
      showAlert('Profile picture updated successfully', 'success');
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      showAlert(error.message || 'Failed to upload profile picture', 'danger');
    } finally {
      // Reset button state
      if (uploadBtn) {
        uploadBtn.innerHTML = originalBtnText;
        uploadBtn.disabled = false;
      }
    }
  }
  
  /**
   * Set up tab switching functionality
   */
  function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (!tabButtons.length || !tabContents.length) return;
    
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all buttons
        tabButtons.forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Add active class to current button
        this.classList.add('active');
        
        // Hide all tab contents
        tabContents.forEach(content => {
          content.style.display = 'none';
        });
        
        // Show the selected tab content
        const tabId = this.dataset.tab;
        document.getElementById(tabId).style.display = 'block';
      });
    });
  }
  
  /**
   * Display an alert message
   * @param {string} message - Message to display
   * @param {string} type - Alert type (success, danger, warning)
   * @param {string} containerId - ID of the container element
   */
  function showAlert(message, type, containerId = 'alertContainer') {
    const alertContainer = document.getElementById(containerId);
    
    if (!alertContainer) return;
    
    // Create alert element
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type}`;
    alertEl.innerHTML = `
      ${message}
      <button type="button" class="close-btn" style="float: right; background: none; border: none; color: inherit; cursor: pointer;" onclick="this.parentElement.remove();">
        &times;
      </button>
    `;
    
    // Add it to the page
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertEl);
    
    // Auto dismiss after 5 seconds for success messages
    if (type === 'success') {
      setTimeout(() => {
        if (alertEl.parentNode) {
          alertEl.remove();
        }
      }, 5000);
    }
  }