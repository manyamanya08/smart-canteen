// ============================================================================
// Smart Canteen Management System - Default Mock Data
// ============================================================================

const DEFAULT_MENU_ITEMS = [
  {
    id: "item-1",
    name: "Classic Paneer Tikka Roll",
    category: "rolls",
    price: 120,
    prepTime: 8,
    calories: 380,
    diet: "veg",
    rating: 4.8,
    reviews: 142,
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
    description: "Char-grilled cottage cheese cubes wrapped in flaky paratha with mint chutney and crunchy onions.",
    inStock: true,
    isSpecial: true,
    customizations: [
      {
        name: "Size",
        options: [
          { label: "Regular", price: 0 },
          { label: "Jumbo (Double Paneer)", price: 45 }
        ]
      },
      {
        name: "Add-ons",
        multiple: true,
        options: [
          { label: "Extra Amul Cheese", price: 25 },
          { label: "Spicy Peri Peri Dip", price: 15 },
          { label: "Mint Mayo", price: 10 }
        ]
      }
    ]
  },
  {
    id: "item-2",
    name: "Crispy Masala Dosa",
    category: "breakfast",
    price: 90,
    prepTime: 10,
    calories: 310,
    diet: "veg",
    rating: 4.9,
    reviews: 230,
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80",
    description: "Golden crispy crepe stuffed with spiced potato mash. Served with hot sambar and fresh coconut chutney.",
    inStock: true,
    isSpecial: true,
    customizations: [
      {
        name: "Portion",
        options: [
          { label: "Single Dosa", price: 0 },
          { label: "Ghee Roast Dosa", price: 25 }
        ]
      },
      {
        name: "Add-ons",
        multiple: true,
        options: [
          { label: "Extra Sambar Bowl", price: 15 },
          { label: "Gunpowder Masala Podi", price: 20 }
        ]
      }
    ]
  },
  {
    id: "item-3",
    name: "Schezwan Veg Fried Rice",
    category: "meals",
    price: 140,
    prepTime: 12,
    calories: 450,
    diet: "veg",
    rating: 4.6,
    reviews: 98,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80",
    description: "Wok-tossed basmati rice with crunchy seasonal veggies in aromatic fiery Schezwan chili paste.",
    inStock: true,
    isSpecial: false,
    customizations: [
      {
        name: "Portion Size",
        options: [
          { label: "Regular Bowl", price: 0 },
          { label: "Combo with Veg Manchurian (2 pcs)", price: 50 }
        ]
      },
      {
        name: "Spice Level",
        options: [
          { label: "Medium", price: 0 },
          { label: "Extra Spicy 🔥", price: 0 }
        ]
      }
    ]
  },
  {
    id: "item-4",
    name: "Grilled Chicken Club Sandwich",
    category: "snacks",
    price: 150,
    prepTime: 10,
    calories: 420,
    diet: "non-veg",
    rating: 4.7,
    reviews: 115,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80",
    description: "Triple-layer toasted sandwich stuffed with seasoned grilled chicken, crisp lettuce, cheese, and herb mayo.",
    inStock: true,
    isSpecial: true,
    customizations: [
      {
        name: "Bread",
        options: [
          { label: "White Bread", price: 0 },
          { label: "Whole Wheat Brown Bread", price: 10 }
        ]
      },
      {
        name: "Add-ons",
        multiple: true,
        options: [
          { label: "Extra Fried Egg", price: 20 },
          { label: "French Fries Side", price: 40 }
        ]
      }
    ]
  },
  {
    id: "item-5",
    name: "Cold Brew Hazelnut Frappe",
    category: "beverages",
    price: 85,
    prepTime: 5,
    calories: 220,
    diet: "veg",
    rating: 4.9,
    reviews: 310,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80",
    description: "Rich blended espresso with chilled milk, hazelnut syrup, ice cream and a chocolate drizzle.",
    inStock: true,
    isSpecial: true,
    customizations: [
      {
        name: "Sweetness",
        options: [
          { label: "Normal Sugar", price: 0 },
          { label: "Less Sugar", price: 0 },
          { label: "Sugar Free", price: 0 }
        ]
      },
      {
        name: "Toppings",
        multiple: true,
        options: [
          { label: "Vanilla Ice Cream Scoop", price: 25 },
          { label: "Extra Espresso Shot", price: 20 }
        ]
      }
    ]
  },
  {
    id: "item-6",
    name: "Classic Samosa Chaat (2 Pcs)",
    category: "snacks",
    price: 60,
    prepTime: 6,
    calories: 340,
    diet: "veg",
    rating: 4.7,
    reviews: 180,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
    description: "Crushed hot samosas smothered with tangy chole, sweet curd, tamarind chutney, and nylon sev.",
    inStock: true,
    isSpecial: false,
    customizations: [
      {
        name: "Sweet Curd Option",
        options: [
          { label: "With Curd", price: 0 },
          { label: "Without Curd (Vegan)", price: 0 }
        ]
      }
    ]
  },
  {
    id: "item-7",
    name: "Chicken Biryani Thali Box",
    category: "meals",
    price: 180,
    prepTime: 12,
    calories: 620,
    diet: "non-veg",
    rating: 4.9,
    reviews: 285,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
    description: "Dum-cooked aromatic basmati rice layered with juicy chicken piece, boiled egg, mirchi ka salan, and raita.",
    inStock: true,
    isSpecial: true,
    customizations: [
      {
        name: "Add-ons",
        multiple: true,
        options: [
          { label: "Extra Chicken Piece", price: 60 },
          { label: "Extra Boiled Egg", price: 15 },
          { label: "Gulab Jamun (1 pc)", price: 25 }
        ]
      }
    ]
  },
  {
    id: "item-8",
    name: "Double Veg Supreme Burger",
    category: "snacks",
    price: 110,
    prepTime: 9,
    calories: 410,
    diet: "veg",
    rating: 4.5,
    reviews: 88,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    description: "Crispy herb potato patty topped with cheese slice, fresh lettuce, tomatoes, and chef's thousand island sauce.",
    inStock: true,
    isSpecial: false,
    customizations: [
      {
        name: "Add-ons",
        multiple: true,
        options: [
          { label: "Add Cheese Slice", price: 20 },
          { label: "Salted Fries Combo", price: 45 }
        ]
      }
    ]
  },
  {
    id: "item-9",
    name: "Warm Molten Choco Lava Cake",
    category: "desserts",
    price: 75,
    prepTime: 5,
    calories: 290,
    diet: "veg",
    rating: 4.8,
    reviews: 164,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
    description: "Decadent chocolate cake with a rich liquid chocolate center. Baked fresh daily.",
    inStock: true,
    isSpecial: false,
    customizations: [
      {
        name: "Topping",
        options: [
          { label: "Classic Warm", price: 0 },
          { label: "With Vanilla Ice Cream", price: 30 }
        ]
      }
    ]
  },
  {
    id: "item-10",
    name: "Fresh Lemon Mint Iced Tea",
    category: "beverages",
    price: 50,
    prepTime: 4,
    calories: 90,
    diet: "veg",
    rating: 4.7,
    reviews: 95,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80",
    description: "Refreshing Ceylon black tea infused with handpicked mint leaves, lemon juice, and crushed ice.",
    inStock: true,
    isSpecial: false,
    customizations: [
      {
        name: "Sweetness",
        options: [
          { label: "Normal", price: 0 },
          { label: "Less Sweet", price: 0 }
        ]
      }
    ]
  },
  {
    id: "item-11",
    name: "North Indian Mini Thali",
    category: "meals",
    price: 130,
    prepTime: 10,
    calories: 540,
    diet: "veg",
    rating: 4.8,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80",
    description: "Dal makhani, paneer butter masala, 2 butter tawa rotis, jeera rice, salad, and pickle.",
    inStock: true,
    isSpecial: true,
    customizations: [
      {
        name: "Bread Choice",
        options: [
          { label: "2 Butter Rotis", price: 0 },
          { label: "3 Plain Rotis", price: 10 },
          { label: "1 Butter Naan", price: 20 }
        ]
      }
    ]
  },
  {
    id: "item-12",
    name: "Chai Kadak (Kulhad Masala Tea)",
    category: "beverages",
    price: 25,
    prepTime: 4,
    calories: 70,
    diet: "veg",
    rating: 4.9,
    reviews: 420,
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80",
    description: "Slow-brewed strong Assam tea with crushed ginger, cardamom, and whole spices served in clay kulhad.",
    inStock: true,
    isSpecial: false,
    customizations: [
      {
        name: "Sugar Level",
        options: [
          { label: "Standard Sugar", price: 0 },
          { label: "Less Sugar", price: 0 },
          { label: "Sugar-Free", price: 0 }
        ]
      }
    ]
  }
];

const DEFAULT_ORDERS = [
  {
    id: "ORD-101",
    token: "T-101",
    customerName: "Rahul Sharma",
    studentId: "STU-2024-089",
    items: [
      { name: "Classic Paneer Tikka Roll", qty: 1, price: 120, notes: "Extra Cheese (+₹25)" },
      { name: "Chai Kadak (Kulhad)", qty: 2, price: 50, notes: "Standard Sugar" }
    ],
    subtotal: 195,
    discount: 20,
    tax: 8.75,
    total: 183.75,
    status: "ready", // pending, preparing, ready, completed
    paymentMethod: "Canteen Wallet",
    paymentStatus: "Paid",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    estimatedMinutes: 8
  },
  {
    id: "ORD-102",
    token: "T-102",
    customerName: "Priya Nair",
    studentId: "STU-2023-412",
    items: [
      { name: "Chicken Biryani Thali Box", qty: 1, price: 180, notes: "Extra Raita" },
      { name: "Fresh Lemon Mint Iced Tea", qty: 1, price: 50, notes: "Less Sweet" }
    ],
    subtotal: 230,
    discount: 0,
    tax: 11.5,
    total: 241.5,
    status: "preparing",
    paymentMethod: "UPI QR",
    paymentStatus: "Paid",
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    estimatedMinutes: 12
  },
  {
    id: "ORD-103",
    token: "T-103",
    customerName: "Aman Verma",
    studentId: "EMP-TECH-104",
    items: [
      { name: "Crispy Masala Dosa", qty: 1, price: 90, notes: "Extra Sambar" },
      { name: "Cold Brew Hazelnut Frappe", qty: 1, price: 85, notes: "" }
    ],
    subtotal: 175,
    discount: 17.5,
    tax: 7.87,
    total: 165.37,
    status: "pending",
    paymentMethod: "Canteen Wallet",
    paymentStatus: "Paid",
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    estimatedMinutes: 10
  }
];

const DEFAULT_WALLETS = {
  "STU-2024-089": {
    name: "Rahul Sharma",
    balance: 450.0,
    transactions: [
      { id: "TX-1", type: "topup", amount: 500, date: "2026-11-10", desc: "UPI Top-up" },
      { id: "TX-2", type: "debit", amount: 183.75, date: "2026-11-13", desc: "Canteen Order #T-101" }
    ]
  },
  "STU-2023-412": {
    name: "Priya Nair",
    balance: 820.0,
    transactions: [
      { id: "TX-3", type: "topup", amount: 1000, date: "2026-11-01", desc: "Net Banking Recharge" }
    ]
  },
  "DEFAULT": {
    name: "Guest Student",
    balance: 500.0,
    transactions: [
      { id: "TX-0", type: "topup", amount: 500, date: "2026-11-13", desc: "Welcome Bonus Balance" }
    ]
  }
};

const PROMO_CODES = {
  "STUDENT10": { type: "percent", value: 10, minOrder: 100, desc: "10% off for verified students" },
  "WELCOME20": { type: "percent", value: 20, minOrder: 200, desc: "20% off on first order" },
  "SNACK30": { type: "flat", value: 30, minOrder: 150, desc: "Flat ₹30 off on snacks & drinks" }
};
