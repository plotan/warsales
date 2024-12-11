const db = require('../config/database');

async function getAllProducts() {
    const products = [];
    for await (const { value } of db.getRange({ start: 'product:', end: 'product;' })) {
        products.push(value);
    }
    return products;
}

async function getAllTransactions() {
    const transactions = [];
    for await (const { value } of db.getRange({ start: 'transaction:', end: 'transaction;' })) {
        transactions.push(value);
    }
    return transactions;
}

async function getProduct(id) {
    return await db.get(`product:${id}`);
}

async function updateProduct(id, data) {
    await db.put(`product:${id}`, data);
}

async function deleteProduct(id) {
    await db.remove(`product:${id}`);
}

async function createTransaction(transaction) {
    await db.put(`transaction:${transaction.id}`, transaction);
}

module.exports = {
    getAllProducts,
    getAllTransactions,
    getProduct,
    updateProduct,
    deleteProduct,
    createTransaction
};