/**
 * Pharmacy Dashboard Page Script
 * Display pharmacy orders and inventory
 */

document.addEventListener('DOMContentLoaded', function () {
  Auth.requireAuth('/pharmacy/login.html');

  const user = Auth.getUser();
  if (user.role !== 'pharmacy') {
    Utils.showToast('Access denied', 'error');
    setTimeout(() => Auth.logout(), 1500);
    return;
  }

  loadPharmacyProfile();
  loadPharmacyOrders();

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => Auth.logout());
  }
});

function loadPharmacyProfile() {
  const user = Auth.getUser();
  if (!user) return;

  const nameElement = document.getElementById('pharmacyName');
  const emailElement = document.getElementById('pharmacyEmail');

  if (nameElement) nameElement.textContent = user.name;
  if (emailElement) emailElement.textContent = user.email;
}

async function loadPharmacyOrders() {
  const user = Auth.getUser();
  // Assuming pharmacyId is stored in user object
  const pharmacyId = user.pharmacyId || user.id;

  try {
    Utils.showLoading();
    const orders = await OrderService.getPharmacyOrders(pharmacyId);
    displayOrders(orders);
    Utils.hideLoading();
  } catch (error) {
    Utils.hideLoading();
    Utils.showToast('Failed to load orders', 'error');
  }
}

function displayOrders(orders) {
  const container = document.getElementById('ordersList');

  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = '<p class="no-orders">No orders yet</p>';
    return;
  }

  container.innerHTML = orders.map(order => `
    <div class="order-card" data-id="${order._id}">
      <div class="order-header">
        <h4>Order #${order._id.slice(-8)}</h4>
        <span class="status status-${order.status}">${order.status}</span>
      </div>
      <div class="order-details">
        <p><strong>Customer:</strong> ${order.userId?.name || 'N/A'}</p>
        <p><strong>Items:</strong> ${order.items?.length || 0}</p>
        <p><strong>Total:</strong> ${Utils.formatCurrency(order.totalPrice)}</p>
        <p><strong>Date:</strong> ${Utils.formatDate(order.createdAt)}</p>
      </div>
      <div class="order-items">
        ${displayOrderItems(order.items)}
      </div>
      <div class="order-actions">
        ${generateStatusButtons(order)}
      </div>
    </div>
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

function generateStatusButtons(order) {
  const buttons = [];

  if (order.status === 'pending') {
    buttons.push(`<button class="btn-accept" onclick="updateStatus('${order._id}', 'accepted')">Accept</button>`);
  } else if (order.status === 'accepted') {
    buttons.push(`<button class="btn-ready" onclick="updateStatus('${order._id}', 'out-for-delivery')">Ready for Delivery</button>`);
  }

  return buttons.join('');
}

async function updateStatus(orderId, newStatus) {
  try {
    Utils.showLoading();
    await OrderService.updateOrderStatus(orderId, newStatus);
    Utils.hideLoading();
    Utils.showToast('Order status updated', 'success');
    loadPharmacyOrders();
  } catch (error) {
    Utils.hideLoading();
    Utils.showToast('Failed to update status', 'error');
  }
}
