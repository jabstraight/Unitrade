// frontend/assets/js/create-listing.js

/**
 * Create Listing functionality for UniMarket
 * Handles form submission, image uploads, and validation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in, redirect to login if not
    if (!isAuthenticated()) {
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
      return;
    }
    
    // Set up form submission
    setupFormSubmission();
    
    // Set up character counter for description
    setupCharCounter();
    
    // Set up image preview 
    setupImagePreview();
    
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
   * Handle form submission
   */
  function setupFormSubmission() {
    const form = document.getElementById('createListingForm');
    
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Check for required fields
      if (!validateForm(form)) {
        return;
      }
      
      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
      submitBtn.disabled = true;
      
      try {
        // Create FormData from form
        const formData = new FormData(form);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // Send request to API
        const response = await fetch(`${API_BASE_URL}/listings`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Show success message
          showAlert('Your item has been posted successfully!', 'success');
          
          // Reset form
          form.reset();
          document.getElementById('imagePreviewContainer').innerHTML = '';
          document.getElementById('charCount').textContent = '0';
          
          // Redirect to listing page after short delay
          setTimeout(() => {
            window.location.href = `listing-detail.html?id=${data._id}`;
          }, 2000);
        } else {
          throw new Error(data.message || 'Failed to create listing');
        }
      } catch (error) {
        console.error('Error:', error);
        showAlert('Error: ' + error.message, 'danger');
      } finally {
        // Reset button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }
  
  /**
   * Validate form before submission
   * @param {HTMLFormElement} form - The form to validate
   * @returns {boolean} True if form is valid, false otherwise
   */
  function validateForm(form) {
    const title = form.querySelector('#title').value.trim();
    const price = form.querySelector('#price').value;
    const category = form.querySelector('#category').value;
    const condition = form.querySelector('#condition').value;
    const location = form.querySelector('#location').value.trim();
    const description = form.querySelector('#description').value.trim();
    const images = form.querySelector('#images').files;
    
    // Check required fields
    if (!title) {
      showAlert('Please enter a title for your item', 'danger');
      return false;
    }
    
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      showAlert('Please enter a valid price', 'danger');
      return false;
    }
    
    if (!category) {
      showAlert('Please select a category', 'danger');
      return false;
    }
    
    if (!condition) {
      showAlert('Please select the condition of your item', 'danger');
      return false;
    }
    
    if (!location) {
      showAlert('Please enter a campus location', 'danger');
      return false;
    }
    
    if (!description) {
      showAlert('Please enter a description for your item', 'danger');
      return false;
    }
    
    // Check if description is too short
    if (description.length < 10) {
      showAlert('Please enter a more detailed description (at least 10 characters)', 'danger');
      return false;
    }
    
    // Check image count
    if (images.length > MAX_IMAGES_PER_LISTING) {
      showAlert(`You can upload a maximum of ${MAX_IMAGES_PER_LISTING} images`, 'danger');
      return false;
    }
    
    // Check image sizes
    for (let i = 0; i < images.length; i++) {
      if (images[i].size > MAX_FILE_SIZE) {
        showAlert(`Image "${images[i].name}" exceeds the maximum size of 5MB`, 'danger');
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Character counter for description
   */
  function setupCharCounter() {
    const descriptionTextarea = document.getElementById('description');
    const charCount = document.getElementById('charCount');
    
    descriptionTextarea.addEventListener('input', function() {
      const length = this.value.length;
      charCount.textContent = length;
      
      // Add visual indication when approaching limit
      if (length > 900) {
        charCount.style.color = 'var(--primary-color)';
      } else if (length > 990) {
        charCount.style.color = '#dc3545';
      } else {
        charCount.style.color = 'inherit';
      }
    });
  }
  
  /**
   * Handle image preview
   */
  function setupImagePreview() {
    const imageInput = document.getElementById('images');
    const previewContainer = document.getElementById('imagePreviewContainer');
    
    // Check if elements exist
    if (!imageInput || !previewContainer) return;
    
    // Add drag and drop functionality
    const uploadLabel = document.querySelector('.image-upload-label');
    if (uploadLabel) {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadLabel.addEventListener(eventName, preventDefaults, false);
      });
      
      function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      ['dragenter', 'dragover'].forEach(eventName => {
        uploadLabel.addEventListener(eventName, highlight, false);
      });
      
      ['dragleave', 'drop'].forEach(eventName => {
        uploadLabel.addEventListener(eventName, unhighlight, false);
      });
      
      function highlight() {
        uploadLabel.classList.add('highlight');
        uploadLabel.style.borderColor = 'var(--primary-color)';
        uploadLabel.style.backgroundColor = 'rgba(255, 143, 171, 0.1)';
      }
      
      function unhighlight() {
        uploadLabel.classList.remove('highlight');
        uploadLabel.style.borderColor = '';
        uploadLabel.style.backgroundColor = '';
      }
      
      uploadLabel.addEventListener('drop', handleDrop, false);
      
      function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        // Check if files exceed maximum
        if (files.length > MAX_IMAGES_PER_LISTING) {
          showAlert(`You can only upload ${MAX_IMAGES_PER_LISTING} images maximum`, 'warning');
        }
        
        imageInput.files = files;
        handleFiles(files);
      }
    }
    
    // Handle file selection
    imageInput.addEventListener('change', function() {
      handleFiles(this.files);
    });
    
    function handleFiles(files) {
      // Clear previous previews
      previewContainer.innerHTML = '';
      
      // Limit to MAX_IMAGES_PER_LISTING
      const fileArray = Array.from(files).slice(0, MAX_IMAGES_PER_LISTING);
      
      if (files.length > MAX_IMAGES_PER_LISTING) {
        showAlert(`Maximum ${MAX_IMAGES_PER_LISTING} images allowed. Only the first ${MAX_IMAGES_PER_LISTING} will be used.`, 'warning');
      }
      
      fileArray.forEach((file, index) => {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          showAlert(`File "${file.name}" exceeds the maximum size of 5MB`, 'warning');
          return;
        }
        
        // Create preview wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'img-preview-wrapper';
        
        // Create image preview
        const img = document.createElement('img');
        img.className = 'img-preview';
        img.src = URL.createObjectURL(file);
        img.alt = `Image preview ${index + 1}`;
        
        // Create remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-img-btn';
        removeBtn.innerHTML = '×';
        removeBtn.type = 'button';
        removeBtn.title = 'Remove image';
        
        removeBtn.addEventListener('click', function() {
          wrapper.remove();
          
          // Create a new FileList object without the removed file
          // Note: We can't actually modify the FileList, so this is visual-only
          // The backend will need to handle this
        });
        
        // Append elements
        wrapper.appendChild(img);
        wrapper.appendChild(removeBtn);
        previewContainer.appendChild(wrapper);
      });
    }
  }