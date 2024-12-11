const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { getAllTransactions } = require('../utils/database');
const { calculateProfits } = require('../utils/profit');
const db = require('../config/database');

router.get('/', asyncHandler(async (req, res) => {
    const transactions = await getAllTransactions();
    const profits = await calculateProfits(db);
    
    res.render('history', {
        title: 'Transaction History',
        transactions,
        ...profits
    });
}));

module.exports = router;