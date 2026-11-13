// ============================================================================
// Smart Canteen Central Store & Multi-Tab Real-time Synchronizer
// ============================================================================

class CanteenStore {
  constructor() {
    this.STORAGE_KEYS = {
      MENU: "canteen_menu_v1",
      ORDERS: "canteen_orders_v1",
      WALLETS: "canteen_wallets_v1",
      TOKEN_SEQ: "canteen_token_seq_v1",
      ACTIVE_STUDENT: "canteen_active_student_v1"
    };

    this.listeners = new Map();
    this.channel = null;

    this.initBroadcastChannel();
    this.initData();
  }

  initBroadcastChannel() {
    try {
      if ("BroadcastChannel" in window) {
        this.channel = new BroadcastChannel("smart_canteen_sync");
        this.channel.onmessage = (event) => {
          this.handleBroadcastMessage(event.data);
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel not supported in this environment", e);
    }
  }

  handleBroadcastMessage(data) {
    if (!data || !data.type) return;
    this.emit(data.type, data.payload, false);
  }

  broadcast(type, payload) {
    if (this.channel) {
      this.channel.postMessage({ type, payload });
    }
    this.emit(type, payload, true);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, payload, isLocal = true) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => {
        try {
          cb(payload, isLocal);
        } catch (err) {
          console.error("Listener error:", err);
        }
      });
    }
  }

  initData() {
    // Menu
    if (!localStorage.getItem(this.STORAGE_KEYS.MENU)) {
      localStorage.setItem(this.STORAGE_KEYS.MENU, JSON.stringify(DEFAULT_MENU_ITEMS));
    }
    // Orders
    if (!localStorage.getItem(this.STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
    }
    // Wallets
    if (!localStorage.getItem(this.STORAGE_KEYS.WALLETS)) {
      localStorage.setItem(this.STORAGE_KEYS.WALLETS, JSON.stringify(DEFAULT_WALLETS));
    }
    // Token sequence
    if (!localStorage.getItem(this.STORAGE_KEYS.TOKEN_SEQ)) {
      localStorage.setItem(this.STORAGE_KEYS.TOKEN_SEQ, "104");
    }
    // Active student
    if (!localStorage.getItem(this.STORAGE_KEYS.ACTIVE_STUDENT)) {
      localStorage.setItem(this.STORAGE_KEYS.ACTIVE_STUDENT, "STU-2024-089");
    }
  }

  // ==================== MENU OPERATIONS ====================
  getMenu() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.MENU)) || [];
    } catch {
      return DEFAULT_MENU_ITEMS;
    }
  }

  saveMenu(items) {
    localStorage.setItem(this.STORAGE_KEYS.MENU, JSON.stringify(items));
    this.broadcast("MENU_UPDATED", items);
  }

  toggleItemStock(itemId) {
    const menu = this.getMenu();
    const item = menu.find((i) => i.id === itemId);
    if (item) {
      item.inStock = !item.inStock;
      this.saveMenu(menu);
      return item.inStock;
    }
    return false;
  }

  addMenuItem(itemData) {
    const menu = this.getMenu();
    const newItem = {
      id: "item-" + Date.now(),
      inStock: true,
      rating: 5.0,
      reviews: 1,
      ...itemData
    };
    menu.unshift(newItem);
    this.saveMenu(menu);
    return newItem;
  }

  updateMenuItem(id, itemData) {
    const menu = this.getMenu();
    const idx = menu.findIndex((i) => i.id === id);
    if (idx !== -1) {
      menu[idx] = { ...menu[idx], ...itemData };
      this.saveMenu(menu);
      return menu[idx];
    }
    return null;
  }

  deleteMenuItem(id) {
    let menu = this.getMenu();
    menu = menu.filter((i) => i.id !== id);
    this.saveMenu(menu);
  }

  // ==================== ORDER OPERATIONS ====================
  getOrders() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ORDERS)) || [];
    } catch {
      return DEFAULT_ORDERS;
    }
  }

  saveOrders(orders) {
    localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  getNextToken() {
    let seq = parseInt(localStorage.getItem(this.STORAGE_KEYS.TOKEN_SEQ) || "100", 10);
    seq += 1;
    localStorage.setItem(this.STORAGE_KEYS.TOKEN_SEQ, seq.toString());
    return "T-" + seq;
  }

  createOrder(orderData) {
    const orders = this.getOrders();
    const token = this.getNextToken();
    const newOrder = {
      id: "ORD-" + Date.now(),
      token: token,
      status: "pending", // pending -> preparing -> ready -> completed
      createdAt: new Date().toISOString(),
      ...orderData
    };
    orders.unshift(newOrder);
    this.saveOrders(orders);
    this.broadcast("NEW_ORDER", newOrder);
    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      order.status = newStatus;
      if (newStatus === "ready") {
        order.readyAt = new Date().toISOString();
      } else if (newStatus === "completed") {
        order.completedAt = new Date().toISOString();
      }
      this.saveOrders(orders);
      this.broadcast("ORDER_STATUS_CHANGED", order);
      return order;
    }
    return null;
  }

  // ==================== WALLET OPERATIONS ====================
  getWallets() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.WALLETS)) || DEFAULT_WALLETS;
    } catch {
      return DEFAULT_WALLETS;
    }
  }

  getActiveStudentId() {
    return localStorage.getItem(this.STORAGE_KEYS.ACTIVE_STUDENT) || "STU-2024-089";
  }

  setActiveStudentId(studentId) {
    localStorage.setItem(this.STORAGE_KEYS.ACTIVE_STUDENT, studentId);
    this.broadcast("ACTIVE_STUDENT_CHANGED", studentId);
  }

  getStudentWallet(studentId) {
    const wallets = this.getWallets();
    if (!wallets[studentId]) {
      wallets[studentId] = {
        name: studentId,
        balance: 250.0,
        transactions: []
      };
      localStorage.setItem(this.STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
    }
    return wallets[studentId];
  }

  topupWallet(studentId, amount) {
    const wallets = this.getWallets();
    if (!wallets[studentId]) {
      wallets[studentId] = { name: studentId, balance: 0, transactions: [] };
    }
    wallets[studentId].balance += Number(amount);
    wallets[studentId].transactions.unshift({
      id: "TX-" + Date.now(),
      type: "topup",
      amount: Number(amount),
      date: new Date().toISOString().split("T")[0],
      desc: "Wallet Recharge"
    });
    localStorage.setItem(this.STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
    this.broadcast("WALLET_UPDATED", { studentId, wallet: wallets[studentId] });
    return wallets[studentId];
  }

  debitWallet(studentId, amount, orderRef) {
    const wallets = this.getWallets();
    const wallet = this.getStudentWallet(studentId);
    if (wallet.balance < amount) {
      return { success: false, message: "Insufficient wallet balance." };
    }
    wallet.balance -= amount;
    wallet.transactions.unshift({
      id: "TX-" + Date.now(),
      type: "debit",
      amount: amount,
      date: new Date().toISOString().split("T")[0],
      desc: "Order " + orderRef
    });
    wallets[studentId] = wallet;
    localStorage.setItem(this.STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
    this.broadcast("WALLET_UPDATED", { studentId, wallet });
    return { success: true, balance: wallet.balance };
  }

  // ==================== RESET SYSTEM ====================
  resetToDefaults() {
    localStorage.setItem(this.STORAGE_KEYS.MENU, JSON.stringify(DEFAULT_MENU_ITEMS));
    localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
    localStorage.setItem(this.STORAGE_KEYS.WALLETS, JSON.stringify(DEFAULT_WALLETS));
    localStorage.setItem(this.STORAGE_KEYS.TOKEN_SEQ, "104");
    this.broadcast("SYSTEM_RESET", {});
  }
}

window.canteenStore = new CanteenStore();
