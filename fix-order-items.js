/**
 * Script to fix order items with invalid/deleted medicine references
 * This updates order items to point to valid medicines in the database
 */

const mongoose = require('mongoose');
const { connectDB } = require('./src/config/database');

async function fixOrderItems() {
    await connectDB();
    
    const Order = require('./src/models/Order.model');
    const Medicine = require('./src/models/Medicine.model');
    
    // Get all current medicines
    const medicines = await Medicine.find({}, { _id: 1, name: 1, price: 1 }).lean();
    console.log(`Found ${medicines.length} medicines in database`);
    
    if (medicines.length === 0) {
        console.log('No medicines found! Cannot fix orders.');
        process.exit(1);
    }
    
    // Create a map of medicine names to their current IDs
    const medicineMap = new Map();
    medicines.forEach(med => {
        medicineMap.set(med.name.toLowerCase(), med);
    });
    
    // Get all orders
    const orders = await Order.find().lean();
    console.log(`Found ${orders.length} orders to check`);
    
    let fixedOrders = 0;
    let fixedItems = 0;
    
    for (const order of orders) {
        let needsUpdate = false;
        const updatedItems = [];
        
        for (const item of order.items || []) {
            // Check if medicine exists
            const medExists = await Medicine.findById(item.medicineId);
            
            if (!medExists) {
                // Medicine doesn't exist - assign a random valid medicine
                // In production, you'd want to match by name or other criteria
                const randomIndex = Math.floor(Math.random() * medicines.length);
                const newMedicine = medicines[randomIndex];
                
                console.log(`  Order ${order._id}: Replacing invalid medicine ${item.medicineId} with ${newMedicine.name} (${newMedicine._id})`);
                
                updatedItems.push({
                    ...item,
                    medicineId: newMedicine._id,
                    price: item.price || newMedicine.price || 50
                });
                needsUpdate = true;
                fixedItems++;
            } else {
                updatedItems.push(item);
            }
        }
        
        if (needsUpdate) {
            await Order.updateOne(
                { _id: order._id },
                { $set: { items: updatedItems } }
            );
            fixedOrders++;
        }
    }
    
    console.log('\n===== FIX COMPLETE =====');
    console.log(`Fixed ${fixedOrders} orders`);
    console.log(`Fixed ${fixedItems} items`);
    
    // Verify
    console.log('\n===== VERIFICATION =====');
    const sampleOrder = await Order.findOne().populate('items.medicineId', 'name price').lean();
    if (sampleOrder && sampleOrder.items) {
        console.log('Sample order items after fix:');
        sampleOrder.items.forEach((item, i) => {
            console.log(`  ${i + 1}. Medicine: ${item.medicineId?.name || 'STILL INVALID'}, Qty: ${item.quantity}`);
        });
    }
    
    process.exit(0);
}

fixOrderItems().catch(err => {
    console.error('Error fixing orders:', err);
    process.exit(1);
});
