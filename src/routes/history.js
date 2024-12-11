const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { calculateProfits } = require('../utils/profit');

router.get('/', async (req, res) => {
    const transactions = [];
    for await (const { value } of db.getRange({ start: 'transaction:', end: 'transaction;' })) {
        transactions.push(value);
    }
    
    const profits = await calculateProfits(db);
    
    res.render('history', {
        title: 'Transaction History',
        transactions,
        ...profits
    });
});

module.exports = router;