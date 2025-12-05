/**
 * User Dashboard Page Script
 * Display user orders and profile
 */

document.addEventListener('DOMContentLoaded', function() {
  // Check authentication first - single check, no redirect loop
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    window.location.replace('login.html');
    return;
  }
  
  loadUserProfile();
  loadUserOrders();
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});

function loadUserProfile() {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    window.location.replace('login.html');
    return;
  }
  
  try {
    const user = JSON.parse(userStr);
    
    const nameElement = document.getElementById('userName');
    const emailElement = document.getElementById('userEmail');
    const roleElement = document.getElementById('userRole');
    const profileBtn = document.querySelector('.profile-btn');
    
    if (nameElement) nameElement.textContent = user.name || 'User';
    if (emailElement) emailElement.textContent = user.email || '';
    if (roleElement) roleElement.textContent = user.role || 'user';
    
    // Update profile initials
    if (profileBtn && user.name) {
      const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      profileBtn.textContent = initials;
    }
  } catch (e) {
    console.error('Error parsing user:', e);
    localStorage.clear();
    window.location.replace('login.html');
  }
}

async function loadUserOrders() {
  const user = Auth.getUser();
  if (!user || !user._id) {
    console.warn('User or user ID not found');
    return;
  }
  
  try {
    Utils.showLoading();
    const orders = await OrderService.getUserOrders(user._id);
    displayOrders(orders);
    
    // Update stats
    updateStats(orders);
    
    Utils.hideLoading();
  } catch (error) {
    Utils.hideLoading();
    console.error('Failed to load orders:', error);
    // Don't show error toast for empty orders
  }
}

function displayOrders(orders) {
  // Update table body
  const tableBody = document.getElementById('recentOrdersTable');
  
  if (!tableBody) return;
  
  if (orders.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">
          <i class="fas fa-box" style="font-size: 3rem; opacity: 0.3; display: block; margin-bottom: 15px;"></i>
          No recent orders found
        </td>
      </tr>
    `;
    return;
  }
  
  tableBody.innerHTML = orders.slice(0, 5).map(order => `
    <tr>
      <td><strong>#${order._id.slice(-6)}</strong></td>
      <td>${order.items?.[0]?.medicineId?.name || 'N/A'}</td>
      <td>${order.pharmacyId?.name || 'N/A'}</td>
      <td><span class="badge badge-${order.status}">${order.status}</span></td>
      <td>${new Date(order.createdAt).toLocaleDateString()}</td>
      <td>
        <a href="track.html?order=${order._id}" class="btn-sm">Track</a>
      </td>
    </tr>
  `).join('');
}

function displayOrderItems(items) {
  if (!items || items.length === 0) return '<p>No items</p>';
  
  return items.map(item => `
    <div class="order-item">
      <span>${item.medicineId?.name || 'Medicine'}</span>
      <span>x${item.quantity}</span>
    </div>
  `).join('');
}

function updateStats(orders) {
  const totalOrders = orders.length;
  const activeOrders = orders.filter(o => ['pending', 'accepted', 'out-for-delivery'].includes(o.status)).length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  
  // Update stat values using the correct IDs from HTML
  const totalOrdersEl = document.getElementById('totalOrders');
  const activeOrdersEl = document.getElementById('activeOrders');
  const totalSpentEl = document.getElementById('totalSpent');
  
  if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
  if (activeOrdersEl) activeOrdersEl.textContent = activeOrders;
  if (totalSpentEl) totalSpentEl.textContent = Utils.formatCurrency(totalSpent);
}

async function cancelOrder(orderId) {
  if (!confirm('Are you sure you want to cancel this order?')) return;
  
  try {
    Utils.showLoading();
    await OrderService.updateOrderStatus(orderId, 'cancelled');
    Utils.hideLoading();
    Utils.showToast('Order cancelled', 'success');
    loadUserOrders();
  } catch (error) {
    Utils.hideLoading();
    Utils.showToast('Failed to cancel order', 'error');
  }
}

function handleLogout() {
  Auth.logout();
}
