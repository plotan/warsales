const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const {
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct
} = require('../utils/database');

router.get('/', asyncHandler(async (req, res) => {
    const products = await getAllProducts();
    res.render('inventory', { title: 'Inventory', products });
}));

router.post('/', asyncHandler(async (req, res) => {
    const { id, name, price, stock } = req.body;
    const product = {
        id: id || Date.now().toString(),
        name,
        price: parseInt(price),
        stock: parseInt(stock)
    };
    await updateProduct(product.id, product);
    res.redirect('/inventory');
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    await deleteProduct(req.params.id);
    res.json({ success: true });
}));

module.exports = router;