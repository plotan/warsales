const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
    const products = [];
    for await (const { value } of db.getRange({ start: 'product:', end: 'product;' })) {
        products.push(value);
    }
    res.render('transactions', { title: 'New Transaction', products });
});

router.post('/', async (req, res) => {
    const { items } = req.body;
    
    // Validate stock availability
    for (const item of items) {
        const product = await db.get(`product:${item.id}`);
        if (!product || product.stock < item.quantity) {
            return res.status(400).json({ error: `Not enough stock for ${item.name}` });
        }
    }
    
    // Update stock and create transaction
    try {
        for (const item of items) {
            const product = await db.get(`product:${item.id}`);
            await db.put(`product:${item.id}`, {
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
        
        await db.put(`transaction:${transaction.id}`, transaction);
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'Failed to process transaction' });
    }
});

module.exports = router;