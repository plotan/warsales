const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
    const products = [];
    for await (const { value } of db.getRange({ start: 'product:', end: 'product;' })) {
        products.push(value);
    }
    res.render('inventory', { title: 'Inventory', products });
});

router.post('/', async (req, res) => {
    const { id, name, price, stock } = req.body;
    const product = {
        id: id || Date.now().toString(),
        name,
        price: parseInt(price),
        stock: parseInt(stock)
    };
    await db.put(`product:${product.id}`, product);
    res.redirect('/inventory');
});

router.delete('/:id', async (req, res) => {
    await db.remove(`product:${req.params.id}`);
    res.json({ success: true });
});

module.exports = router;