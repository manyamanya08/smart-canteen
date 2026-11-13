/**
 * Smart Canteen Management System - Node.js / Express Server
 * Serves static web application and provides REST API endpoints.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Helper to load/save JSON DB
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = { orders: [], menu: [], wallets: {} };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading DB:', err);
    return { orders: [], menu: [], wallets: {} };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

// ==================== REST API ENDPOINTS ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', timestamp: new Date().toISOString() });
});

// Orders
app.get('/api/orders', (req, res) => {
  const db = readDB();
  res.json(db.orders || []);
});

app.post('/api/orders', (req, res) => {
  const db = readDB();
  const newOrder = {
    id: 'ORD-' + Date.now(),
    createdAt: new Date().toISOString(),
    ...req.body
  };
  db.orders.unshift(newOrder);
  writeDB(db);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = readDB();
  const order = db.orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.status = status;
  if (status === 'ready') order.readyAt = new Date().toISOString();
  if (status === 'completed') order.completedAt = new Date().toISOString();

  writeDB(db);
  res.json(order);
});

// Wallets
app.get('/api/wallets/:studentId', (req, res) => {
  const { studentId } = req.params;
  const db = readDB();
  const wallet = db.wallets[studentId] || { name: studentId, balance: 500.0, transactions: [] };
  res.json(wallet);
});

app.post('/api/wallets/topup', (req, res) => {
  const { studentId, amount } = req.body;
  if (!studentId || !amount) return res.status(400).json({ error: 'Missing studentId or amount' });

  const db = readDB();
  if (!db.wallets[studentId]) {
    db.wallets[studentId] = { name: studentId, balance: 0, transactions: [] };
  }
  db.wallets[studentId].balance += Number(amount);
  db.wallets[studentId].transactions.unshift({
    id: 'TX-' + Date.now(),
    type: 'topup',
    amount: Number(amount),
    date: new Date().toISOString().split('T')[0],
    desc: 'Wallet Recharge'
  });
  writeDB(db);
  res.json(db.wallets[studentId]);
});

// Root Route fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`⚡ SmartBite Canteen System running at http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
