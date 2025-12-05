/**
 * Medicine Search Page Script
 * Handle medicine search and display with filters
 */

// Ensure user is authenticated
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');
if (!token || !user) {
  window.location.replace('login.html');
}

let allMedicines = [];
let filteredMedicines = [];
let currentView = 'grid'; // 'grid' or 'list'

// Filter state
const filters = {
  search: '',
  distance: '1',
  price: 'any',
  availability: 'all',
  sort: 'distance'
};

document.addEventListener('DOMContentLoaded', function () {
  initializeUserInfo();
  loadAllMedicines();
  initializeFilters();
  initializeViewToggle();
  updateCartBadge();

  // Search functionality
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', Utils.debounce(handleSearch, 500));
  }

  const searchButton = document.getElementById('searchButton');
  if (searchButton) {
    searchButton.addEventListener('click', handleSearch);
  }
});

function initializeUserInfo() {
  // Set user initials
  const userInitials = document.getElementById('userInitials');
  const userData = Auth.getUser();
  
  if (userInitials && userData) {
    const name = userData.name || userData.email || 'User';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    userInitials.textContent = initials || 'U';
  }
}

function initializeViewToggle() {
  const gridViewBtn = document.getElementById('gridViewBtn');
  const listViewBtn = document.getElementById('listViewBtn');
  const medicineGrid = document.getElementById('medicinesList');
  
  if (gridViewBtn) {
    gridViewBtn.addEventListener('click', () => {
      currentView = 'grid';
      gridViewBtn.classList.add('active');
      listViewBtn?.classList.remove('active');
      medicineGrid?.classList.remove('list-view');
    });
  }
  
  if (listViewBtn) {
    listViewBtn.addEventListener('click', () => {
      currentView = 'list';
      listViewBtn.classList.add('active');
      gridViewBtn?.classList.remove('active');
      medicineGrid?.classList.add('list-view');
    });
  }
}

function updateCartBadge() {
  const cartBadge = document.getElementById('cartBadge');
  if (cartBadge && typeof Cart !== 'undefined') {
    const count = Cart.getCount();
    if (count > 0) {
      cartBadge.textContent = count;
      cartBadge.style.display = 'block';
    } else {
      cartBadge.style.display = 'none';
    }
  }
}

function initializeFilters() {
  // Distance filter
  const distanceFilter = document.getElementById('filterDistance');
  if (distanceFilter) {
    distanceFilter.addEventListener('change', (e) => {
      filters.distance = e.target.value;
      applyFilters();
    });
  }

  // Price filter
  const priceFilter = document.getElementById('filterPrice');
  if (priceFilter) {
    priceFilter.addEventListener('change', (e) => {
      filters.price = e.target.value;
      applyFilters();
    });
  }

  // Availability filter
  const availabilityFilter = document.getElementById('filterAvailability');
  if (availabilityFilter) {
    availabilityFilter.addEventListener('change', (e) => {
      filters.availability = e.target.value;
      applyFilters();
    });
  }

  // Sort filter
  const sortFilter = document.getElementById('filterSort');
  if (sortFilter) {
    sortFilter.addEventListener('change', (e) => {
      filters.sort = e.target.value;
      applyFilters();
    });
  }

  // Clear all filters button
  const clearBtn = document.getElementById('clearFilters');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearAllFilters);
  }
}

function clearAllFilters() {
  // Reset filter state
  filters.distance = '1';
  filters.price = 'any';
  filters.availability = 'all';
  filters.sort = 'distance';
  filters.search = '';

  // Reset dropdown values
  const distanceFilter = document.getElementById('filterDistance');
  const priceFilter = document.getElementById('filterPrice');
  const availabilityFilter = document.getElementById('filterAvailability');
  const sortFilter = document.getElementById('filterSort');
  const searchInput = document.getElementById('searchInput');

  if (distanceFilter) distanceFilter.value = '1';
  if (priceFilter) priceFilter.value = 'any';
  if (availabilityFilter) availabilityFilter.value = 'all';
  if (sortFilter) sortFilter.value = 'distance';
  if (searchInput) searchInput.value = '';

  // Re-apply filters (show all)
  applyFilters();
  Utils.showToast('Filters cleared', 'success');
}

function applyFilters() {
  let results = [...allMedicines];

  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    results = results.filter(med => 
      med.name.toLowerCase().includes(searchTerm) ||
      (med.category && med.category.toLowerCase().includes(searchTerm)) ||
      (med.description && med.description.toLowerCase().includes(searchTerm))
    );
  }

  // Apply price filter
  if (filters.price !== 'any') {
    results = results.filter(med => {
      const price = parseFloat(med.price) || parseFloat(med.availableAt?.[0]?.price) || 0;
      switch (filters.price) {
        case '0-50': return price < 50;
        case '50-100': return price >= 50 && price <= 100;
        case '100-500': return price > 100 && price <= 500;
        case '500+': return price > 500;
        default: return true;
      }
    });
  }

  // Apply availability filter
  if (filters.availability !== 'all') {
    results = results.filter(med => {
      const stock = parseInt(med.stock) || 0;
      switch (filters.availability) {
        case 'instock': return stock > 10;
        case 'limited': return stock > 0 && stock <= 10;
        case 'outofstock': return stock === 0;
        default: return true;
      }
    });
  }

  // Apply sorting
  results.sort((a, b) => {
    const priceA = parseFloat(a.price) || parseFloat(a.availableAt?.[0]?.price) || 0;
    const priceB = parseFloat(b.price) || parseFloat(b.availableAt?.[0]?.price) || 0;
    const stockA = parseInt(a.stock) || 0;
    const stockB = parseInt(b.stock) || 0;

    switch (filters.sort) {
      case 'price-asc': return priceA - priceB;
      case 'price-desc': return priceB - priceA;
      case 'name': return a.name.localeCompare(b.name);
      case 'stock': return stockB - stockA;
      case 'distance':
      default: return 0; // Keep original order for distance (placeholder)
    }
  });

  filteredMedicines = results;
  displayMedicines(results);
}

async function loadAllMedicines() {
  try {
    Utils.showLoading();
    allMedicines = await MedicineService.getAllMedicines();
    filteredMedicines = [...allMedicines];
    applyFilters();
    Utils.hideLoading();
  } catch (error) {
    Utils.hideLoading();
    Utils.showToast('Failed to load medicines', 'error');
  }
}

async function handleSearch() {
  const keyword = document.getElementById('searchInput')?.value.trim();
  filters.search = keyword;

  if (!keyword) {
    // If search is empty, reload all medicines
    await loadAllMedicines();
    return;
  }

  try {
    Utils.showLoading();
    // Try Elasticsearch search first
    const results = await MedicineService.searchMedicines(keyword);
    if (results && results.length > 0) {
      allMedicines = results;
    }
    applyFilters();
    Utils.hideLoading();
  } catch (error) {
    Utils.hideLoading();
    // Fallback to local filtering
    applyFilters();
  }
}

function displayMedicines(medicines) {
  const container = document.getElementById('medicinesList') || document.getElementById('results');

  if (!container) return;

  // Update results count
  const resultsCount = document.getElementById('resultsCount');
  if (resultsCount) {
    resultsCount.innerHTML = `
      <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
      ${medicines.length} Result${medicines.length !== 1 ? 's' : ''} Found
    `;
  }

  if (medicines.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding:60px 20px;">
        <i class="fas fa-search" style="font-size:4rem; color:#d1d5db; margin-bottom:20px;"></i>
        <p style="color:#6b7280; font-size:1.2rem;">No medicines found. Try a different search term.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = medicines.map(medicine => {
    // Handle both MongoDB format (with availableAt) and Elasticsearch format
    const medicineId = medicine._id || medicine.id;
    const stock = parseInt(medicine.stock) || 0;
    const availableAt = medicine.availableAt || [];
    const firstPharmacy = availableAt[0];
    const price = parseFloat(firstPharmacy?.price || medicine.price || 0);
    const pharmacyName = firstPharmacy?.pharmacy || medicine.pharmacy || 'Multiple pharmacies';
    
    console.log(`Medicine: ${medicine.name}, Stock: ${stock}, Price: ${price}`); // Debug log
    
    return `
      <div class="medicine-card" data-id="${medicineId}">
        <div class="medicine-header">
          <div class="medicine-icon">
            <i class="fas fa-pills"></i>
          </div>
          <span class="availability-badge ${stock > 0 ? 'badge-available' : 'badge-unavailable'}">
            ${stock > 0 ? `${stock} Available` : 'Out of Stock'}
          </span>
        </div>
        
        <h3 class="medicine-name">${medicine.name}</h3>
        
        <div class="medicine-details">
          <div><i class="fas fa-capsules"></i> ${medicine.category || 'Medicine'}</div>
          <div><i class="fas fa-box"></i> Stock: ${stock} units</div>
        </div>
        
        <div class="pharmacy-info">
          <div class="pharmacy-name">
            <i class="fas fa-store"></i> ${pharmacyName}
          </div>
          <div class="pharmacy-distance">
            <i class="fas fa-info-circle"></i> ${medicine.description || 'Quality medicine'}
          </div>
          ${availableAt.length > 1 ? `<div style="font-size: 0.85rem; color: var(--success-color); margin-top: 5px;"><i class="fas fa-check-circle"></i> Available at ${availableAt.length} pharmacies</div>` : ''}
        </div>
        
        <div class="price-row">
          <div class="price">${Utils.formatCurrency(price)}</div>
          <button class="btn-add-cart" onclick="addToCart('${medicineId}', '${medicine.name.replace(/'/g, "\\'")}', ${price})" ${stock > 0 ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"'}>
            <i class="fas fa-cart-plus"></i> Add to Cart
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function addToCart(medicineId, medicineName, price) {
  // Check if user is logged in before adding to cart
  if (!Auth.isAuthenticated()) {
    Utils.showToast('Please login to add items to cart', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }
  
  // Get pharmacy ID from the medicine card or use default
  const pharmacyId = 'default-pharmacy-id'; // You can enhance this to select specific pharmacy
  
  // Add item to cart
  Cart.addItem({
    _id: medicineId,
    name: medicineName,
    price: price
  }, pharmacyId, 1);
  
  // Update cart count badge
  updateCartCount();
  
  // Show success message with option to view cart
  const cartCount = Cart.getCount();
  Utils.showToast(`Added to cart! (${cartCount} items)`, 'success');
  
  // Optional: Show "View Cart" button temporarily
  showViewCartPrompt();
}

function showViewCartPrompt() {
  // Remove existing prompt if any
  const existingPrompt = document.querySelector('.cart-prompt');
  if (existingPrompt) {
    existingPrompt.remove();
  }
  
  // Create floating cart prompt
  const prompt = document.createElement('div');
  prompt.className = 'cart-prompt';
  prompt.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <i class="fas fa-check-circle" style="color: #10b981;"></i>
      <span>Item added to cart!</span>
    </div>
    <a href="cart.html" class="btn-primary" style="padding: 8px 16px; text-decoration: none;">
      <i class="fas fa-shopping-cart"></i> View Cart
    </a>
  `;
  
  // Add styles
  Object.assign(prompt.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    zIndex: '9999',
    animation: 'slideInUp 0.3s ease',
    maxWidth: '400px'
  });
  
  document.body.appendChild(prompt);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    prompt.style.animation = 'slideOutDown 0.3s ease';
    setTimeout(() => prompt.remove(), 300);
  }, 4000);
}

function updateCartCount() {
  updateCartBadge();
}
