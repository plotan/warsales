const express = require('express');
const path = require('path');
const { open } = require('lmdb');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = 3000;

// Database setup
const db = open({
  path: 'data.mdb',
  compression: true
});

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Helper function to calculate profits
async function calculateProfits() {
    const transactions = [];
    for await (const { value } of db.getRange({ start: 'transaction:', end: 'transaction;' })) {
        transactions.push(value);
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayTransactions = transactions.filter(t => new Date(t.date) >= today);
    const yesterdayTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date >= yesterday && date < today;
    });

    return {
        todayProfit: todayTransactions.reduce((sum, t) => sum + t.total, 0),
        todayTransactions: todayTransactions.length,
        yesterdayProfit: yesterdayTransactions.reduce((sum, t) => sum + t.total, 0),
        yesterdayTransactions: yesterdayTransactions.length,
        totalProfit: transactions.reduce((sum, t) => sum + t.total, 0),
        totalTransactions: transactions.length
    };
}

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

app.get('/inventory', async (req, res) => {
    const products = [];
    for await (const { value } of db.getRange({ start: 'product:', end: 'product;' })) {
        products.push(value);
    }
    res.render('inventory', { title: 'Inventory', products });
});

app.post('/inventory', async (req, res) => {
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

app.delete('/inventory/:id', async (req, res) => {
    await db.remove(`product:${req.params.id}`);
    res.json({ success: true });
});

app.get('/transactions', async (req, res) => {
    const products = [];
    for await (const { value } of db.getRange({ start: 'product:', end: 'product;' })) {
        products.push(value);
    }
    res.render('transactions', { title: 'New Transaction', products });
});

app.post('/transactions', async (req, res) => {
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

app.get('/history', async (req, res) => {
    const transactions = [];
    for await (const { value } of db.getRange({ start: 'transaction:', end: 'transaction;' })) {
        transactions.push(value);
    }
    
    const profits = await calculateProfits();
    
    res.render('history', {
        title: 'Transaction History',
        transactions,
        ...profits
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
