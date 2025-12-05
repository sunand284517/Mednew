/**
 * Shopping Cart Page Script
 * Handle cart display and checkout
 */

document.addEventListener('DOMContentLoaded', function () {
  Auth.requireAuth('/user/login.html');
  loadCart();
  updateUserInfo();

  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', handleCheckout);
  }
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to logout?')) {
        Auth.logout();
      }
    });
  }
});

function updateUserInfo() {
  const user = Auth.getCachedUser();
  if (user) {
    const initialsElement = document.getElementById('userInitials');
    if (initialsElement && user.name) {
      const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      initialsElement.textContent = initials;
    }
  }
}

function loadCart() {
  const cartItems = Cart.getItems();
  displayCartItems(cartItems);
  updateCartSummary();
}

function displayCartItems(items) {
  const container = document.getElementById('cartItemsContainer');

  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
        <i class="fas fa-shopping-cart" style="font-size: 4rem; opacity: 0.3; display: block; margin-bottom: 20px;"></i>
        <h3 style="margin-bottom: 10px; color: var(--text-primary);">Your cart is empty</h3>
        <p style="margin-bottom: 25px;">Add medicines to your cart to continue</p>
        <a href="search.html" class="btn-primary">
          <i class="fas fa-search"></i> Search Medicines
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map((item, index) => `
    <div class="section-card cart-item" style="margin-bottom: 20px;">
      <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 20px; align-items: center;">
        <div class="item-details">
          <h4 style="margin-bottom: 8px; color: var(--text-primary);">
            <i class="fas fa-pills" style="color: var(--primary-color); margin-right: 8px;"></i>
            ${item.medicineName}
          </h4>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Price: <span style="font-weight: 600; color: var(--text-primary);">${Utils.formatCurrency(item.price)}</span> per unit
          </p>
        </div>
        
        <div class="item-quantity" style="display: flex; align-items: center; gap: 10px; background: #f9fafb; padding: 8px 12px; border-radius: 8px;">
          <button onclick="updateQuantity(${index}, ${item.quantity - 1})" 
                  style="width: 32px; height: 32px; border: none; background: white; border-radius: 6px; cursor: pointer; font-size: 18px; color: var(--primary-color); box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
                  ${item.quantity <= 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
            <i class="fas fa-minus"></i>
          </button>
          <span style="min-width: 40px; text-align: center; font-weight: 600; font-size: 16px;">${item.quantity}</span>
          <button onclick="updateQuantity(${index}, ${item.quantity + 1})" 
                  style="width: 32px; height: 32px; border: none; background: white; border-radius: 6px; cursor: pointer; font-size: 18px; color: var(--primary-color); box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <i class="fas fa-plus"></i>
          </button>
        </div>
        
        <div style="text-align: right;">
          <div class="item-total" style="font-size: 1.2rem; font-weight: 700; color: var(--primary-color); margin-bottom: 10px;">
            ${Utils.formatCurrency(item.price * item.quantity)}
          </div>
          <button class="btn-remove" onclick="removeItem(${index})" 
                  style="padding: 8px 16px; background: #fee; color: #dc2626; border: 1px solid #fecaca; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.2s;">
            <i class="fas fa-trash"></i> Remove
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function updateQuantity(index, newQuantity) {
  const items = Cart.getItems();
  if (items[index]) {
    const quantity = parseInt(newQuantity);
    if (quantity > 0) {
      Cart.updateQuantity(items[index].medicineId, items[index].pharmacyId, quantity);
      loadCart();
    }
  }
}

function removeItem(index) {
  const items = Cart.getItems();
  if (items[index]) {
    Cart.removeItem(items[index].medicineId, items[index].pharmacyId);
    loadCart();
    Utils.showToast('Item removed from cart', 'success');
  }
}

function updateCartSummary() {
  const items = Cart.getItems();
  const count = items.length;
  const subtotal = Cart.getTotal();
  const deliveryFee = subtotal > 500 ? 0 : 40; // Free delivery above ₹500
  const gst = subtotal * 0.05; // 5% GST
  const total = subtotal + deliveryFee + gst;

  // Update item count
  const countElement = document.getElementById('itemCount');
  if (countElement) countElement.textContent = count;

  // Update cart badge
  const cartBadge = document.getElementById('cartBadge');
  if (cartBadge) {
    if (count > 0) {
      cartBadge.textContent = count;
      cartBadge.style.display = 'block';
    } else {
      cartBadge.style.display = 'none';
    }
  }

  // Update header
  const headerText = document.querySelector('.user-welcome p');
  if (headerText) {
    headerText.textContent = count === 0 ? 'Your cart is empty' : `${count} ${count === 1 ? 'item' : 'items'} ready for checkout`;
  }

  // Update amounts
  const subtotalElement = document.getElementById('subtotalAmount');
  const deliveryElement = document.getElementById('deliveryFee');
  const gstElement = document.getElementById('gstAmount');
  const totalElement = document.getElementById('totalAmount');
  
  if (subtotalElement) subtotalElement.textContent = Utils.formatCurrency(subtotal);
  if (deliveryElement) {
    deliveryElement.textContent = deliveryFee === 0 ? 'FREE' : Utils.formatCurrency(deliveryFee);
    deliveryElement.style.color = deliveryFee === 0 ? 'var(--success-color)' : 'var(--text-primary)';
  }
  if (gstElement) gstElement.textContent = Utils.formatCurrency(gst);
  if (totalElement) totalElement.textContent = Utils.formatCurrency(total);

  // Enable/disable checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.disabled = count === 0;
    checkoutBtn.style.opacity = count === 0 ? '0.5' : '1';
    checkoutBtn.style.cursor = count === 0 ? 'not-allowed' : 'pointer';
  }

  // Show/hide delivery estimate
  const deliveryEstimate = document.getElementById('deliveryEstimate');
  if (deliveryEstimate) {
    if (count > 0) {
      deliveryEstimate.style.display = 'block';
      const deliveryTimeElement = document.getElementById('deliveryTime');
      if (deliveryTimeElement) {
        deliveryTimeElement.textContent = '30-45 minutes';
      }
    } else {
      deliveryEstimate.style.display = 'none';
    }
  }
}

async function handleCheckout() {
  const user = Auth.getUser();
  if (!user) {
    Auth.requireAuth('login.html');
    return;
  }

  // Get the correct user ID (MongoDB uses _id)
  const userId = user._id || user.id;
  if (!userId) {
    Utils.showToast('User session error. Please login again.', 'error');
    Auth.logout();
    return;
  }

  const cartItems = Cart.getItems();
  if (cartItems.length === 0) {
    Utils.showToast('Your cart is empty', 'error');
    return;
  }

  // Filter out items with invalid pharmacyId and try to get valid pharmacy
  const validItems = [];
  const invalidItems = [];
  
  for (const item of cartItems) {
    // Check if pharmacyId is a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = item.pharmacyId && 
                            item.pharmacyId !== 'default-pharmacy-id' && 
                            item.pharmacyId !== 'unknown' &&
                            /^[a-fA-F0-9]{24}$/.test(item.pharmacyId);
    
    if (isValidObjectId) {
      validItems.push(item);
    } else {
      invalidItems.push(item);
    }
  }

  // If there are invalid items, try to fetch a valid pharmacy for them
  if (invalidItems.length > 0) {
    try {
      // Fetch medicines to get valid pharmacy IDs
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/medicines`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const medicines = data.data?.medicines || [];
        
        for (const item of invalidItems) {
          // Find the medicine and get its pharmacy
          const medicine = medicines.find(m => (m._id || m.id) === item.medicineId);
          if (medicine && medicine.availableAt && medicine.availableAt.length > 0) {
            const pharmacyId = medicine.availableAt[0].pharmacyId;
            if (pharmacyId && /^[a-fA-F0-9]{24}$/.test(pharmacyId.toString())) {
              item.pharmacyId = pharmacyId.toString();
              validItems.push(item);
              // Update cart with correct pharmacyId
              Cart.updatePharmacyId(item.medicineId, pharmacyId.toString());
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching pharmacy data:', error);
    }
  }

  if (validItems.length === 0) {
    Utils.showToast('Unable to process order. Please clear cart and add items again.', 'error');
    return;
  }

  // Group items by pharmacy
  const ordersByPharmacy = groupByPharmacy(validItems);

  try {
    Utils.showLoading();

    // Create order for each pharmacy
    for (const [pharmacyId, items] of Object.entries(ordersByPharmacy)) {
      const orderData = {
        userId: userId,
        pharmacyId: pharmacyId,
        items: items.map(item => ({
          medicineId: item.medicineId,
          quantity: item.quantity
        })),
        totalPrice: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };

      await OrderService.createOrder(orderData);
    }

    Utils.hideLoading();
    Cart.clear();
    Utils.showToast('Order placed successfully!', 'success');
    
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);  } catch (error) {
    Utils.hideLoading();
    Utils.showToast(error.message || 'Checkout failed', 'error');
  }
}

function groupByPharmacy(items) {
  return items.reduce((acc, item) => {
    if (!acc[item.pharmacyId]) {
      acc[item.pharmacyId] = [];
    }
    acc[item.pharmacyId].push(item);
    return acc;
  }, {});
}
