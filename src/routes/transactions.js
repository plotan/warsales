const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const {
    getAllProducts,
    getProduct,
    updateProduct,
    createTransaction
} = require('../utils/database');

router.get('/', asyncHandler(async (req, res) => {
    const products = await getAllProducts();
    res.render('transactions', { title: 'New Transaction', products });
}));

router.post('/', asyncHandler(async (req, res) => {
    const { items } = req.body;
    
    // Validate stock availability
    for (const item of items) {
        const product = await getProduct(item.id);
        if (!product || product.stock < item.quantity) {
            const error = new Error(`Not enough stock for ${item.name}`);
            error.type = 'validation';
            throw error;
        }
    }
    
    // Update stock and create transaction
    for (const item of items) {
        const product = await getProduct(item.id);
        await updateProduct(item.id, {
            ...product,
            stock: product.stock - item.quantity
        });
    }
    
    const transaction = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        items,
        total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    await createTransaction(transaction);
    res.json(transaction);
}));

module.exports = router;