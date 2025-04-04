// frontend/assets/js/categories.js

/**
 * Categories page functionality for UniMarket
 * Handles category filtering, sorting, and product display
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize page
    setupPage();
    
    // Load listings based on selected category
    loadCategoryListings();
    
    // Set up search functionality
    setupSearch();
    
    // Set up sort dropdown
    setupSortDropdown();
    
    // Set up price range filter
    setupPriceFilter();
    
    // Set up condition filters
    setupConditionFilters();
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', function() {
        const navLinks = document.getElementById('navLinks');
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
      });
    }
    
    // Mobile filter toggle
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    const filterSidebar = document.getElementById('filterSidebar');
    
    if (filterToggleBtn && filterSidebar) {
      filterToggleBtn.addEventListener('click', function() {
        filterSidebar.classList.toggle('show-filters');
      });
    }
  });
  
  /**
   * Set up initial page state
   */
  function setupPage() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    // Set category title
    const categoryTitle = document.getElementById('categoryTitle');
    if (categoryTitle) {
      categoryTitle.textContent = category ? `${category}` : 'All Categories';
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
    
    // Apply search term to search input if present
    if (search && document.getElementById('searchInput')) {
      document.getElementById('searchInput').value = search;
    }
    
    // Set sort dropdown to URL value or default
    const sort = urlParams.get('sort') || 'newest';
    const sortDropdown = document.getElementById('sortDropdown');
    if (sortDropdown) {
      sortDropdown.value = sort;
    }
    
    // Set price range if in URL
    const minPrice = urlParams.get('minPrice');
    const maxPrice = urlParams.get('maxPrice');
    
    if (minPrice && document.getElementById('minPrice')) {
      document.getElementById('minPrice').value = minPrice;
    }
    
    if (maxPrice && document.getElementById('maxPrice')) {
      document.getElementById('maxPrice').value = maxPrice;
    }
    
    // Set condition checkboxes based on URL params
    const conditions = urlParams.getAll('condition');
    if (conditions.length > 0) {
      const conditionCheckboxes = document.querySelectorAll('input[name="condition"]');
      conditionCheckboxes.forEach(checkbox => {
        checkbox.checked = conditions.includes(checkbox.value);
      });
    }
  }
  
  /**
   * Load listings for the selected category
   */
  async function loadCategoryListings() {
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
    
    // Get URL parameters for filtering
    const urlParams = new URLSearchParams(window.location.search);
    
    // Create request parameters
    let queryParams = new URLSearchParams();
    
    // Add category if specified
    const category = urlParams.get('category');
    if (category) {
      queryParams.append('category', category);
    }
    
    // Add search term if specified
    const search = urlParams.get('search');
    if (search) {
      queryParams.append('search', search);
    }
    
    // Add sort parameter
    const sort = urlParams.get('sort') || 'newest';
    queryParams.append('sort', sort);
    
    // Add price range if specified
    const minPrice = urlParams.get('minPrice');
    const maxPrice = urlParams.get('maxPrice');
    
    if (minPrice) {
      queryParams.append('minPrice', minPrice);
    }
    
    if (maxPrice) {
      queryParams.append('maxPrice', maxPrice);
    }
    
    // Add condition filters if specified
    const conditions = urlParams.getAll('condition');
    conditions.forEach(condition => {
      queryParams.append('condition', condition);
    });
    
    // Always filter to only show active listings
    queryParams.append('status', 'Active');
    
    // Get pagination parameters
    const page = urlParams.get('page') || 1;
    queryParams.append('page', page);
    
    // Set limit for listings per page
    queryParams.append('limit', '12');
    
    try {
      // Fetch listings from API
      const response = await fetch(`${API_BASE_URL}/listings?${queryParams.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load listings');
      }
      
      // Display listings
      displayListings(data.listings, data.total, data.page, data.pages);
      
      // Update listing count
      updateListingCount(data.total);
      
    } catch (error) {
      console.error('Error loading listings:', error);
      productGrid.innerHTML = `
        <div style="text-align: center; padding: 2rem; grid-column: 1 / -1;">
          <p>Error loading listings. Please try again later.</p>
          <button onclick="loadCategoryListings()" class="btn btn-primary" style="margin-top: 1rem;">Retry</button>
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
          <a href="categories.html" class="btn btn-primary">Clear Filters</a>
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
  }
  
  /**
   * Update the listing count display
   * @param {number} count - Total number of listings
   */
  function updateListingCount(count) {
    const listingCount = document.getElementById('listingCount');
    if (listingCount) {
      listingCount.textContent = `${count} ${count === 1 ? 'listing' : 'listings'} found`;
    }
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
      
      // Get existing parameters
      const urlParams = new URLSearchParams(window.location.search);
      
      if (searchTerm) {
        urlParams.set('search', searchTerm);
      } else {
        urlParams.delete('search');
      }
      
      // Reset to page 1 on new search
      urlParams.delete('page');
      
      // Update URL and trigger search
      window.location.search = urlParams.toString();
    });
  }
  
  /**
   * Set up sort dropdown
   */
  function setupSortDropdown() {
    const sortDropdown = document.getElementById('sortDropdown');
    
    if (!sortDropdown) return;
    
    sortDropdown.addEventListener('change', function() {
      // Get existing parameters
      const urlParams = new URLSearchParams(window.location.search);
      
      // Update sort parameter
      urlParams.set('sort', this.value);
      
      // Reset to page 1 on sort change
      urlParams.delete('page');
      
      // Update URL and trigger reload
      window.location.search = urlParams.toString();
    });
  }
  
  /**
   * Set up price range filter
   */
  function setupPriceFilter() {
    const priceFilterForm = document.getElementById('priceFilterForm');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    
    if (!priceFilterForm || !minPriceInput || !maxPriceInput) return;
    
    priceFilterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const minPrice = minPriceInput.value.trim();
      const maxPrice = maxPriceInput.value.trim();
      
      // Get existing parameters
      const urlParams = new URLSearchParams(window.location.search);
      
      // Update price parameters
      if (minPrice) {
        urlParams.set('minPrice', minPrice);
      } else {
        urlParams.delete('minPrice');
      }
      
      if (maxPrice) {
        urlParams.set('maxPrice', maxPrice);
      } else {
        urlParams.delete('maxPrice');
      }
      
      // Reset to page 1 on filter change
      urlParams.delete('page');
      
      // Update URL and trigger reload
      window.location.search = urlParams.toString();
    });
    
    // Add reset button functionality
    const resetPriceBtn = document.getElementById('resetPriceBtn');
    
    if (resetPriceBtn) {
      resetPriceBtn.addEventListener('click', function() {
        minPriceInput.value = '';
        maxPriceInput.value = '';
        
        // Get existing parameters
        const urlParams = new URLSearchParams(window.location.search);
        
        // Remove price parameters
        urlParams.delete('minPrice');
        urlParams.delete('maxPrice');
        
        // Reset to page 1
        urlParams.delete('page');
        
        // Update URL and trigger reload
        window.location.search = urlParams.toString();
      });
    }
  }
  
  /**
   * Set up condition filter checkboxes
   */
  function setupConditionFilters() {
    const conditionCheckboxes = document.querySelectorAll('input[name="condition"]');
    const applyConditionBtn = document.getElementById('applyConditionBtn');
    
    if (!conditionCheckboxes.length || !applyConditionBtn) return;
    
    applyConditionBtn.addEventListener('click', function() {
      // Get existing parameters
      const urlParams = new URLSearchParams(window.location.search);
      
      // Remove existing condition parameters
      urlParams.delete('condition');
      
      // Add selected conditions
      conditionCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
          urlParams.append('condition', checkbox.value);
        }
      });
      
      // Reset to page 1 on filter change
      urlParams.delete('page');
      
      // Update URL and trigger reload
      window.location.search = urlParams.toString();
    });
    
    // Add reset button functionality
    const resetConditionBtn = document.getElementById('resetConditionBtn');
    
    if (resetConditionBtn) {
      resetConditionBtn.addEventListener('click', function() {
        // Uncheck all checkboxes
        conditionCheckboxes.forEach(checkbox => {
          checkbox.checked = false;
        });
        
        // Get existing parameters
        const urlParams = new URLSearchParams(window.location.search);
        
        // Remove condition parameters
        urlParams.delete('condition');
        
        // Reset to page 1
        urlParams.delete('page');
        
        // Update URL and trigger reload
        window.location.search = urlParams.toString();
      });
    }
  }