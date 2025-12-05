/**
 * Cart Management
 * Handle shopping cart functionality
 */

const Cart = {
  CART_KEY: 'medassist_cart',
  
  /**
   * Get cart items
   */
  getItems() {
    const cart = localStorage.getItem(this.CART_KEY);
    return cart ? JSON.parse(cart) : [];
  },
  
  /**
   * Save cart items
   */
  saveItems(items) {
    localStorage.setItem(this.CART_KEY, JSON.stringify(items));
  },
  
  /**
   * Add item to cart
   */
  addItem(medicine, pharmacyId, quantity = 1) {
    const items = this.getItems();
    
    const existingItem = items.find(
      item => item.medicineId === medicine._id && item.pharmacyId === pharmacyId
    );
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.push({
        medicineId: medicine._id,
        medicineName: medicine.name,
        price: medicine.price,
        pharmacyId: pharmacyId,
        quantity: quantity
      });
    }
    
    this.saveItems(items);
    Utils.showToast('Added to cart', 'success');
  },
  
  /**
   * Remove item from cart
   */
  removeItem(medicineId, pharmacyId) {
    const items = this.getItems();
    const filtered = items.filter(
      item => !(item.medicineId === medicineId && item.pharmacyId === pharmacyId)
    );
    this.saveItems(filtered);
  },
  
  /**
   * Update item quantity
   */
  updateQuantity(medicineId, pharmacyId, quantity) {
    const items = this.getItems();
    const item = items.find(
      item => item.medicineId === medicineId && item.pharmacyId === pharmacyId
    );
    
    if (item) {
      item.quantity = quantity;
      this.saveItems(items);
    }
  },
  
  /**
   * Update pharmacy ID for an item (fix invalid pharmacy IDs)
   */
  updatePharmacyId(medicineId, newPharmacyId) {
    const items = this.getItems();
    const item = items.find(item => item.medicineId === medicineId);
    
    if (item) {
      item.pharmacyId = newPharmacyId;
      this.saveItems(items);
    }
  },
  
  /**
   * Clear cart
   */
  clear() {
    localStorage.removeItem(this.CART_KEY);
  },
  
  /**
   * Get cart total
   */
  getTotal() {
    const items = this.getItems();
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
  
  /**
   * Get cart count
   */
  getCount() {
    return this.getItems().length;
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Cart;
}
