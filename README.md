# ⚡ SmartBite Canteen OS - Smart Canteen Management System

A full-stack, real-time, interactive **Smart Canteen Management System** designed to eliminate long cafeteria queues, automate order flow, and provide real-time status tracking across self-service kiosks, the kitchen, and public waiting displays.

---

## 🌟 Key Features & Portals

### 1. 📱 Student & Employee Self-Service Kiosk
* **Visual Digital Menu:** Categorized by Breakfast, Rice & Meals, Snacks & Burgers, Wraps & Rolls, Beverages, and Sweets.
* **Dietary Tagging (FSSAI standard):** Pure Veg (🟢 green badge) and Non-Veg (🔴 red triangle).
* **Instant Search & Filters:** Live search by food name or ingredient, category pills, and dietary toggles.
* **Customization Modal:** Choose portion sizes (Regular / Jumbo) and add-ons (Extra Cheese, Peri-Peri Dip, Spice Level, and special notes like "no onions").
* **Smart Tray (Cart):** Item counters, student discount promo codes (`STUDENT10` for 10% off, `WELCOME20`, `SNACK30`), 5% GST tax calculation.
* **Multi-Payment Checkout:**
  - **RFID / Student Canteen Wallet:** 1-tap instant deduction from student balance.
  - **UPI QR Code Simulation:** Dynamic on-screen QR code for GPay / PhonePe / Paytm.
  - **Cash at Counter:** Token marked as unpaid for cashier collection.
* **Automated Token Generation:** Generates sequential digital token numbers (e.g. `#T-104`).
* **Live Order Tracker:** 4-stage visual stepper (Order Placed ➔ Cooking in Kitchen ➔ Ready for Pickup ➔ Completed) with estimated prep countdown.
* **Thermal Receipt Printing:** Formatted for 80mm POS receipt printers.

---

### 2. 👨‍🍳 Kitchen Display System (KDS)
* **Real-time Kanban Columns:**
  - 🟡 **1. New Incoming Orders** (triggers alert sound)
  - 🔵 **2. Cooking & In-Progress** (shows elapsed cooking timer and SLA warning)
  - 🟢 **3. Ready for Counter** (signals the waiting area)
* **Auditory Alert System:** Synthesized kitchen ding-dong chime using Web Audio API (zero audio files required).
* **Kitchen Order Ticket (KOT):** Printable kitchen chef slip with items, quantities, and highlighted custom cooking notes.
* **Station Filters:** Filter tickets by Hot Food & Grill, Beverage Bar, or Fast Snacks.

---

### 3. 📺 Public TV Token Board (Cafeteria Waiting Screen)
* High-contrast split screen designed for mounting on cafeteria displays or TVs:
  - **🍳 NOW PREPARING:** Token numbers currently cooking in the kitchen.
  - **🔔 READY FOR PICKUP:** Giant glowing green pulsing token badges alerting students to collect their meals at Counter 1 & 2.
* **Fullscreen Support:** One-click full-screen display mode.

---

### 4. 📊 Manager & Admin Dashboard
* **Real-Time KPI Metrics:** Today's Revenue (₹), Total Orders Processed, Active Queue Length, and Average Prep Time.
* **1-Click Menu & Stock Management:** Instant toggle between "In Stock" and "Out of Stock" (immediately updates the customer ordering kiosk).
* **Add New Dish Modal:** Set dish name, category, price, veg/non-veg indicator, calories, preparation time, and photo URL.
* **Order Transaction Log:** Complete log with customer name, student ID, timestamp, items, total, and status.
* **Student Wallet Management:** Search student by ID/RFID, inspect balance and transaction history, and top-up funds (+₹200, +₹500).

---

## 🚀 Multi-Tab Real-Time Synchronization

The system uses `BroadcastChannel` and `localStorage` to synchronize events across different browser tabs without any complex setup:
1. Open **Tab 1** in **Customer Kiosk** mode (`index.html`).
2. Open **Tab 2** in **Kitchen KDS** mode.
3. Open **Tab 3** in **TV Token Board** mode.
4. Place an order in **Tab 1** ➔ **Tab 2 immediately dings with an audio alert and renders the ticket**, while **Tab 3 shows the token in preparation** in real time!

---

## 🛠️ How to Run

### Method 1: Instant Direct Browser (Zero Installation Required)
Simply double-click or open `index.html` in any modern web browser (Chrome, Edge, Firefox, Brave). Everything works immediately out of the box!

### Method 2: Native Windows PowerShell Server
Run the built-in PowerShell web server (no extra software needed):
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
This automatically starts a local HTTP server at `http://localhost:5000` and opens your browser.

### Method 3: Node.js / Express Server
If Node.js is installed:
```bash
npm install
npm start
```
Starts Express server on `http://localhost:3000`.

### Method 4: Python Server
If Python 3 is installed:
```bash
python server.py
```
Starts Python server on `http://localhost:8000`.

---

## 📁 Project Structure

```
smart-canteen/
├── index.html         # Main application shell with all 4 role portals & modals
├── css/
│   └── styles.css     # Custom animations, dietary badges, print styles, and scrollbars
├── js/
│   ├── data.js        # Default menu catalog, mock orders, and promo codes
│   ├── audio.js       # Web Audio API sound synthesizer (fanfares, chimes, dings)
│   ├── store.js       # Central data store & BroadcastChannel multi-tab synchronizer
│   └── app.js         # UI controller, cart math, modals, KDS & Admin logic
├── server.ps1         # Zero-dependency PowerShell HTTP server & REST API
├── server.js          # Node.js Express backend server
├── package.json       # Node package configuration
├── server.py          # Python 3 standard library web server
└── README.md          # Documentation
```

---

## 💳 Test Accounts & Demo Credentials

* **Active Student ID:** `STU-2024-089` (Rahul Sharma, Default Balance: ₹450.00)
* **Secondary Student ID:** `STU-2023-412` (Priya Nair, Default Balance: ₹820.00)
* **Active Promo Codes:**
  - `STUDENT10` (10% off, min order ₹100)
  - `WELCOME20` (20% off, min order ₹200)
  - `SNACK30` (Flat ₹30 off, min order ₹150)
