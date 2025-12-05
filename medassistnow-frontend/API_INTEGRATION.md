# Frontend-Backend Integration Guide

## ✅ API Integration Complete!

Your frontend is now connected to the backend with a comprehensive JavaScript API layer.

---

## 📁 Created Files (in `/js` folder)

### **Core Files**
1. **config.js** - API endpoints and base URL configuration
2. **auth.js** - Authentication utilities (token management)
3. **api.js** - HTTP request wrapper (GET, POST, PUT, DELETE)
4. **utils.js** - Helper functions (toast, formatting, validation)
5. **cart.js** - Shopping cart management

### **Service Files** (API wrappers)
6. **auth.service.js** - Login, register, logout
7. **medicine.service.js** - Medicine CRUD and search
8. **pharmacy.service.js** - Pharmacy CRUD and inventory
9. **order.service.js** - Order creation and management
10. **delivery.service.js** - Delivery partner operations

---

## 🔗 How to Use in Your HTML Pages

### **1. Include Scripts in HTML (Add before closing `</body>`)**

```html
<!-- Core Scripts -->
<script src="/js/config.js"></script>
<script src="/js/auth.js"></script>
<script src="/js/api.js"></script>
<script src="/js/utils.js"></script>
<script src="/js/cart.js"></script>

<!-- Service Scripts (include as needed) -->
<script src="/js/auth.service.js"></script>
<script src="/js/medicine.service.js"></script>
<script src="/js/pharmacy.service.js"></script>
<script src="/js/order.service.js"></script>
<script src="/js/delivery.service.js"></script>

<!-- Page-specific script -->
<script src="/js/pages/login.js"></script>
```

---

## 📝 Example Usage

### **Login Page Example**

```javascript
// user/login.html - Add this script
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    Utils.showLoading();
    const response = await AuthService.login({ email, password });
    
    Utils.hideLoading();
    Utils.showToast('Login successful!', 'success');
    
    // Redirect based on role
    const user = Auth.getUser();
    if (user.role === 'admin') {
      window.location.href = '/admin/dashboard.html';
    } else if (user.role === 'pharmacy') {
      window.location.href = '/pharmacy/dashboard.html';
    } else {
      window.location.href = '/user/dashboard.html';
    }
  } catch (error) {
    Utils.hideLoading();
    Utils.showToast(error.message, 'error');
  }
});
```

### **Search Medicines Example**

```javascript
// user/search.html - Add this script
async function searchMedicines() {
  const keyword = document.getElementById('searchInput').value;
  
  try {
    Utils.showLoading();
    const medicines = await MedicineService.searchMedicines(keyword);
    
    Utils.hideLoading();
    displayMedicines(medicines);
  } catch (error) {
    Utils.hideLoading();
    Utils.showToast('Search failed', 'error');
  }
}

function displayMedicines(medicines) {
  const container = document.getElementById('medicinesList');
  container.innerHTML = medicines.map(med => `
    <div class="medicine-card">
      <h3>${med.name}</h3>
      <p>${med.description}</p>
      <p>Price: ${Utils.formatCurrency(med.price)}</p>
      <button onclick="Cart.addItem(${JSON.stringify(med)}, 'pharmacyId', 1)">
        Add to Cart
      </button>
    </div>
  `).join('');
}
```

### **View Orders Example**

```javascript
// user/dashboard.html - Add this script
async function loadUserOrders() {
  const user = Auth.getUser();
  
  if (!user) {
    Auth.requireAuth();
    return;
  }
  
  try {
    const orders = await OrderService.getUserOrders(user.id);
    displayOrders(orders);
  } catch (error) {
    Utils.showToast('Failed to load orders', 'error');
  }
}

function displayOrders(orders) {
  const container = document.getElementById('ordersList');
  container.innerHTML = orders.map(order => `
    <div class="order-card">
      <h4>Order #${order._id}</h4>
      <p>Status: ${order.status}</p>
      <p>Total: ${Utils.formatCurrency(order.totalPrice)}</p>
      <p>Date: ${Utils.formatDate(order.createdAt)}</p>
    </div>
  `).join('');
}

// Load on page load
document.addEventListener('DOMContentLoaded', loadUserOrders);
```

---

## 🔐 Authentication Flow

1. **User logs in** → `AuthService.login()` → Token saved to localStorage
2. **Protected pages** → Check `Auth.isAuthenticated()` → Redirect if not logged in
3. **API calls** → Token automatically added to headers via `Auth.getAuthHeaders()`
4. **Logout** → `Auth.logout()` → Token removed, redirect to home

---

## 🛒 Shopping Cart Flow

1. **Add to cart** → `Cart.addItem(medicine, pharmacyId, quantity)`
2. **View cart** → `Cart.getItems()` → Display items
3. **Checkout** → Create order with `OrderService.createOrder(orderData)`
4. **Clear cart** → `Cart.clear()`

---

## 📋 Next Steps

### **For Each HTML Page, Add:**

1. Include required scripts (config, auth, api, utils, + services)
2. Add page-specific JavaScript logic
3. Replace static data with API calls
4. Add loading states and error handling

### **Priority Pages to Connect:**

1. ✅ **user/login.html** - AuthService.login()
2. ✅ **user/signup.html** - AuthService.register()
3. ✅ **user/search.html** - MedicineService.searchMedicines()
4. ✅ **user/cart.html** - Cart.getItems()
5. ✅ **user/dashboard.html** - OrderService.getUserOrders()
6. ✅ **pharmacy/orders.html** - OrderService.getPharmacyOrders()
7. ✅ **admin/manage-users.html** - UserService (create this)

---

## 🚀 Start Backend Server

```bash
cd medassistnow-backend
npm run dev
```

Backend will run on: **http://localhost:5000**

---

## 🎯 Testing

1. Start backend: `npm run dev`
2. Open frontend: `index.html` in browser
3. Try login → Register → Search medicines → Add to cart → Checkout

---

Your frontend and backend are now **fully integrated**! 🎉

Need help connecting specific pages? Let me know which page to start with!
