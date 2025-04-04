// frontend/assets/js/index.js

/**
 * Homepage functionality for UniMarket
 * Handles listing display, searching, and filtering
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize page
    setupPage();
    
    // Load listings
    loadListings();
    
    // Set up search functionality
    setupSearch();
    
    // Set up category filtering
    setupCategoryFilters();
    
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
   * Set up initial page state
   */
  function setupPage() {
    // Check URL parameters for any filters or search terms
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    // Apply search term to search input if present
    if (search && document.getElementById('searchInput')) {
      document.getElementById('searchInput').value = search;
    }
    
    // Highlight active category if one is selected
    if (category) {
      const categoryLinks = document.querySelectorAll('.category-link');
      categoryLinks.forEach(link => {
        if (link.dataset.category === category) {
          link.classList.add('active');
        }
      });
    }
  }
  
  /**
   * Load listings from API
   * @param {Object} filters - Optional filters to apply
   */
  async function loadListings(filters = {}) {
    // Get the product grid element
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;
    
    // Show loading indicator
    productGrid.innerHTML = `
      <div class="loading-container" style="text-align: center; padding: 3rem; grid-column: 1 / -1;">
        <div class="spinner" style="display: inline-block; width: 40px; height: 40px; border: 3px solid rgba(255, 143, 171, 0.3); border-radius: 50%; border-top-color: var(--primary-color); animation: spin 1s linear infinite;"></div>
        <p>Loading listings...</p>
      </div>
    `;
    
    // Initialize query parameters
    let queryParams = new URLSearchParams();
    
    // Apply filters
    if (filters.category) {
      queryParams.append('category', filters.category);
    }
    
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    
    // Always filter to only show active listings
    queryParams.append('status', 'Active');
    
    // Get current page from URL or default to 1
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || 1;
    queryParams.append('page', page);
    
    try {
      // Fetch listings from API
      const response = await fetch(`${API_BASE_URL}/listings?${queryParams.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load listings');
      }
      
      // Display listings
      displayListings(data.listings, data.total, data.page, data.pages);
    } catch (error) {
      console.error('Error loading listings:', error);
      productGrid.innerHTML = `
        <div style="text-align: center; padding: 2rem; grid-column: 1 / -1;">
          <p>Error loading listings. Please try again later.</p>
          <button onclick="loadListings()" class="btn btn-primary" style="margin-top: 1rem;">Retry</button>
        </div>
      `;
    }
  }
  
  /**
   * Display listings in the product grid
   * @param {Array} listings - Array of listing objects
   * @param {number} total - Total number of listings
   * @param {number} page - Current page number
   * @param {number} pages - Total number of pages
   */
  function displayListings(listings, total, page, pages) {
    const productGrid = document.getElementById('productGrid');
    
    // If no listings found
    if (!listings || listings.length === 0) {
      productGrid.innerHTML = `
        <div style="text-align: center; padding: 3rem; grid-column: 1 / -1;">
          <div style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;">
            <i class="fas fa-search"></i>
          </div>
          <h2>No Listings Found</h2>
          <p style="margin-bottom: 1.5rem; color: #666;">
            We couldn't find any listings matching your criteria.
          </p>
          <a href="index.html" class="btn btn-primary">View All Listings</a>
        </div>
      `;
      return;
    }
    
    // Clear previous content
    productGrid.innerHTML = '';
    
    // Add listings to grid
    listings.forEach(listing => {
      // Get image URL
      const imageUrl = listing.images && listing.images.length > 0 
        ? `${IMAGE_BASE_URL}${listing.images[0]}` 
        : '../assets/images/placeholder.jpg';
      
      // Format date
      const createdDate = new Date(listing.createdAt);
      const formattedDate = createdDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      
      // Create product card
      const card = document.createElement('div');
      card.className = 'product-card';
      
      card.innerHTML = `
        <a href="listing-detail.html?id=${listing._id}" class="product-card-link">
          <img src="${imageUrl}" alt="${listing.title}" class="product-image">
          <div class="product-info">
            <h3 class="product-title">${listing.title}</h3>
            <div class="product-price">$${listing.price.toFixed(2)}</div>
            <div class="product-meta">
              <span>${listing.condition}</span>
              <span>${formattedDate}</span>
            </div>
          </div>
        </a>
      `;
      
      productGrid.appendChild(card);
    });
    
    // Add pagination if more than one page
    if (pages > 1) {
      addPagination(page, pages);
    }
    
    // Add results count
    const resultsCount = document.createElement('div');
    resultsCount.className = 'results-count';
    resultsCount.style.gridColumn = '1 / -1';
    resultsCount.style.marginBottom = '1rem';
    resultsCount.style.color = '#666';
    resultsCount.style.fontSize = '0.9rem';
    resultsCount.textContent = `Showing ${listings.length} of ${total} results`;
    
    productGrid.insertBefore(resultsCount, productGrid.firstChild);
  }
  
  /**
   * Add pagination controls
   * @param {number} currentPage - Current page number
   * @param {number} totalPages - Total number of pages
   */
  function addPagination(currentPage, totalPages) {
    const productGrid = document.getElementById('productGrid');
    
    // Create pagination container
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';
    paginationContainer.style.gridColumn = '1 / -1';
    paginationContainer.style.display = 'flex';
    paginationContainer.style.justifyContent = 'center';
    paginationContainer.style.margin = '2rem 0';
    paginationContainer.style.gap = '0.5rem';
    
    // Get current URL params for maintaining filters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Previous page button
    if (currentPage > 1) {
      const prevBtn = document.createElement('a');
      prevBtn.href = '#';
      prevBtn.className = 'pagination-btn';
      prevBtn.style.padding = '0.5rem 1rem';
      prevBtn.style.backgroundColor = '#f0f2f5';
      prevBtn.style.borderRadius = '5px';
      prevBtn.style.textDecoration = 'none';
      prevBtn.style.color = 'var(--text-color)';
      prevBtn.innerHTML = '&laquo; Prev';
      
      prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        urlParams.set('page', currentPage - 1);
        window.location.search = urlParams.toString();
      });
      
      paginationContainer.appendChild(prevBtn);
    }
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement('a');
      pageBtn.href = '#';
      pageBtn.className = 'pagination-btn';
      pageBtn.style.padding = '0.5rem 1rem';
      pageBtn.style.backgroundColor = i === currentPage ? 'var(--primary-color)' : '#f0f2f5';
      pageBtn.style.color = i === currentPage ? 'white' : 'var(--text-color)';
      pageBtn.style.borderRadius = '5px';
      pageBtn.style.textDecoration = 'none';
      pageBtn.textContent = i;
      
      if (i !== currentPage) {
        pageBtn.addEventListener('click', function(e) {
          e.preventDefault();
          urlParams.set('page', i);
          window.location.search = urlParams.toString();
        });
      }
      
      paginationContainer.appendChild(pageBtn);
    }
    
    // Next page button
    if (currentPage < totalPages) {
      const nextBtn = document.createElement('a');
      nextBtn.href = '#';
      nextBtn.className = 'pagination-btn';
      nextBtn.style.padding = '0.5rem 1rem';
      nextBtn.style.backgroundColor = '#f0f2f5';
      nextBtn.style.borderRadius = '5px';
      nextBtn.style.textDecoration = 'none';
      nextBtn.style.color = 'var(--text-color)';
      nextBtn.innerHTML = 'Next &raquo;';
      
      nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        urlParams.set('page', currentPage + 1);
        window.location.search = urlParams.toString();
      });
      
      paginationContainer.appendChild(nextBtn);
    }
    
    productGrid.appendChild(paginationContainer);
  }
  
  /**
   * Set up search functionality
   */
  function setupSearch() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    
    if (!searchForm || !searchInput) return;
    
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const searchTerm = searchInput.value.trim();
      
      if (searchTerm) {
        // Get current URL params for maintaining other filters
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('search', searchTerm);
        urlParams.delete('page'); // Reset to page 1 on new search
        
        // Update URL and trigger search
        window.location.search = urlParams.toString();
      }
    });
  }
  
  /**
   * Set up category filtering
   */
  function setupCategoryFilters() {
    const categoryLinks = document.querySelectorAll('.category-link');
    
    categoryLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const category = this.dataset.category;
        
        // Get current URL params for maintaining search term
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('category', category);
        urlParams.delete('page'); // Reset to page 1 on new filter
        
        // Update URL and trigger filter
        window.location.search = urlParams.toString();
      });
    });
  }