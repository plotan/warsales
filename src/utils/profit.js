async function calculateProfits(db) {
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

module.exports = { calculateProfits };