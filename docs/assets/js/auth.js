// frontend/assets/js/auth.js

/**
 * Authentication utilities for UniMarket
 * This file handles user authentication state, login/logout functionality,
 * and provides helper functions for making authenticated API requests.
 */

// Check authentication state when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
    
    // Setup logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
      });
    }
  });
  
  /**
   * Update navigation links based on authentication state
   */
  function updateNavigation() {
    const loggedInLinks = document.getElementById('loggedInLinks');
    const loggedOutLinks = document.getElementById('loggedOutLinks');
    
    if (isAuthenticated()) {
      // User is logged in
      if (loggedInLinks) loggedInLinks.style.display = 'flex';
      if (loggedOutLinks) loggedOutLinks.style.display = 'none';
    } else {
      // User is logged out
      if (loggedInLinks) loggedInLinks.style.display = 'none';
      if (loggedOutLinks) loggedOutLinks.style.display = 'flex';
    }
  }
  
  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has a valid token
   */
  function isAuthenticated() {
    return localStorage.getItem('token') !== null;
  }
  
  /**
   * Get current user information
   * @returns {object|null} User object or null if not logged in
   */
  function getCurrentUser() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  }
  
  /**
   * Log user out
   * Removes token and user data from localStorage and redirects to homepage
   */
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  }
  
  /**
   * Require authentication for protected pages
   * Redirects to login page if user is not authenticated
   * @returns {boolean} True if authenticated, false otherwise
   */
  function requireAuth() {
    if (!isAuthenticated()) {
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
      return false;
    }
    return true;
  }
  
  /**
   * Make an authenticated API request
   * @param {string} endpoint - API endpoint (will be appended to API_BASE_URL)
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
   * @param {object} data - Request body data (for POST/PUT requests)
   * @returns {Promise} Promise resolving to the API response
   */
  async function apiRequest(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('token');
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Add authorization header if token exists
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add body data if provided
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
      const responseData = await response.json();
      
      if (!response.ok) {
        // Handle unauthorized errors (expired token)
        if (response.status === 401) {
          logout();
          throw new Error('Your session has expired. Please log in again.');
        }
        
        throw new Error(responseData.message || 'Something went wrong');
      }
      
      return responseData;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
  
  /**
   * Display an alert message
   * @param {string} message - The message to display
   * @param {string} type - Alert type (success, danger, warning)
   * @param {string} containerId - ID of the container element for the alert
   */
  function showAlert(message, type, containerId = 'alertContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
      ${message}
      <button type="button" class="close-btn" style="float: right; background: none; border: none; color: inherit; cursor: pointer;" onclick="this.parentElement.remove();">
        &times;
      </button>
    `;
    
    container.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 5000);
  }