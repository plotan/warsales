const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

// Import routes
const inventoryRoutes = require('./src/routes/inventory');
const transactionRoutes = require('./src/routes/transactions');
const historyRoutes = require('./src/routes/history');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

app.use('/inventory', inventoryRoutes);
app.use('/transactions', transactionRoutes);
app.use('/history', historyRoutes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});