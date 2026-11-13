// ============================================================================
// Smart Canteen Management System - Main Application Controller
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  const store = window.canteenStore;
  const soundFX = window.soundFX;

  // App State
  let currentRole = "customer";
  let cart = [];
  let appliedPromo = null;
  let activeCategory = "all";
  let activeDiet = "all";
  let searchQuery = "";
  let kdsStationFilter = "all";
  let adminActiveSection = "menu";
  let selectedCustomizeItem = null;
  let activeTrackingOrderId = null;

  // DOM Elements
  const headerTimeEl = document.getElementById("header-time");
  const navRoleButtons = document.querySelectorAll("[data-role-target]");
  const roleViews = document.querySelectorAll(".role-view");
  const cartBadge = document.getElementById("cart-badge");
  const cartDrawer = document.getElementById("cart-drawer");
  const cartBackdrop = document.getElementById("cart-backdrop");
  const cartItemsContainer = document.getElementById("cart-items");
  const cartSubtotalEl = document.getElementById("cart-subtotal");
  const cartDiscountEl = document.getElementById("cart-discount");
  const cartTaxEl = document.getElementById("cart-tax");
  const cartTotalEl = document.getElementById("cart-total");
  const walletBadgeBalance = document.getElementById("wallet-badge-balance");

  // ==========================================================================
  // Header Clock & Init
  // ==========================================================================
  function updateTime() {
    if (headerTimeEl) {
      const now = new Date();
      headerTimeEl.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    }
  }
  setInterval(updateTime, 1000);
  updateTime();

  function updateWalletBadge() {
    const studentId = store.getActiveStudentId();
    const wallet = store.getStudentWallet(studentId);
    if (walletBadgeBalance) {
      walletBadgeBalance.textContent = `₹${wallet.balance.toFixed(2)}`;
    }
  }
  updateWalletBadge();

  // ==========================================================================
  // Navigation / Role Switcher
  // ==========================================================================
  function switchRole(newRole) {
    currentRole = newRole;
    navRoleButtons.forEach((btn) => {
      const target = btn.getAttribute("data-role-target");
      if (target === newRole) {
        btn.classList.remove("text-slate-600", "bg-transparent", "hover:bg-slate-100");
        btn.classList.add("bg-emerald-600", "text-white", "shadow-sm");
      } else {
        btn.classList.remove("bg-emerald-600", "text-white", "shadow-sm");
        btn.classList.add("text-slate-600", "bg-transparent", "hover:bg-slate-100");
      }
    });

    roleViews.forEach((view) => {
      if (view.id === `view-${newRole}`) {
        view.classList.remove("hidden");
      } else {
        view.classList.add("hidden");
      }
    });

    if (newRole === "customer") renderCustomerMenu();
    if (newRole === "kitchen") renderKitchenKDS();
    if (newRole === "tv") renderTVBoard();
    if (newRole === "admin") renderAdminView();

    soundFX.playClick();
  }

  navRoleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      switchRole(btn.getAttribute("data-role-target"));
    });
  });

  // Sound toggle button
  const soundToggleBtn = document.getElementById("btn-sound-toggle");
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener("click", () => {
      const enabled = soundFX.toggle();
      soundToggleBtn.innerHTML = enabled
        ? `<i data-lucide="volume-2" class="w-4 h-4 text-emerald-600"></i>`
        : `<i data-lucide="volume-x" class="w-4 h-4 text-slate-400"></i>`;
      lucide.createIcons();
      showToast(enabled ? "Sound effects enabled" : "Sound effects muted", "info");
    });
  }

  // ==========================================================================
  // CUSTOMER PORTAL: Menu Rendering & Filters
  // ==========================================================================
  const menuContainer = document.getElementById("customer-menu-grid");
  const searchInput = document.getElementById("menu-search-input");
  const categoryPills = document.querySelectorAll("[data-category]");
  const dietFilterButtons = document.querySelectorAll("[data-diet]");

  function renderCustomerMenu() {
    if (!menuContainer) return;
    const menu = store.getMenu();

    const filtered = menu.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const matchesDiet = activeDiet === "all" || item.diet === activeDiet;
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesDiet && matchesSearch;
    });

    if (filtered.length === 0) {
      menuContainer.innerHTML = `
        <div class="col-span-full py-16 text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
            <i data-lucide="utensils" class="w-8 h-8"></i>
          </div>
          <h3 class="text-lg font-semibold text-slate-800">No dishes match your filter</h3>
          <p class="text-sm text-slate-500 mt-1">Try clearing filters or search for another dish</p>
          <button id="btn-clear-filters" class="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition">
            Clear Filters
          </button>
        </div>
      `;
      lucide.createIcons();
      const clearBtn = document.getElementById("btn-clear-filters");
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          activeCategory = "all";
          activeDiet = "all";
          searchQuery = "";
          if (searchInput) searchInput.value = "";
          categoryPills.forEach((p) => p.classList.toggle("bg-slate-900", p.dataset.category === "all"));
          renderCustomerMenu();
        });
      }
      return;
    }

    menuContainer.innerHTML = filtered
      .map((item) => {
        const isOutOfStock = !item.inStock;
        return `
        <div class="kiosk-card bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col relative group ${
          isOutOfStock ? "opacity-75" : ""
        }">
          <!-- Food Image with Badges -->
          <div class="relative h-48 w-full overflow-hidden bg-slate-100">
            <img 
              src="${item.image}" 
              alt="${item.name}" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
            
            <!-- Diet Badge Top Left -->
            <div class="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
              <span class="diet-badge ${item.diet}"></span>
              <span class="text-xs font-semibold capitalize text-slate-700">${item.diet}</span>
            </div>

            <!-- Prep Time Top Right -->
            <div class="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/75 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full">
              <i data-lucide="clock" class="w-3 h-3 text-amber-400"></i>
              <span>${item.prepTime}m</span>
            </div>

            <!-- Calorie & Rating bottom overlay -->
            <div class="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
              <span class="flex items-center gap-1 font-medium bg-black/40 backdrop-blur px-2 py-0.5 rounded">
                <i data-lucide="flame" class="w-3 h-3 text-orange-400"></i>
                ${item.calories} kcal
              </span>
              <span class="flex items-center gap-1 font-semibold bg-amber-500/90 text-slate-950 px-2 py-0.5 rounded">
                ★ ${item.rating} <span class="text-[10px] text-slate-800">(${item.reviews})</span>
              </span>
            </div>

            ${
              isOutOfStock
                ? `<div class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center">
                    <span class="bg-rose-600 text-white font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-md shadow-lg">
                      Sold Out Today
                    </span>
                  </div>`
                : ""
            }
          </div>

          <!-- Body -->
          <div class="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between gap-2">
                <h4 class="font-bold text-slate-900 text-base leading-snug">${item.name}</h4>
                ${
                  item.isSpecial
                    ? `<span class="shrink-0 text-[10px] uppercase font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Chef's Pick</span>`
                    : ""
                }
              </div>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">${item.description}</p>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span class="text-xs text-slate-400 font-medium block">Price</span>
                <span class="text-lg font-black text-slate-900">₹${item.price}</span>
              </div>

              ${
                isOutOfStock
                  ? `<button disabled class="px-4 py-2 bg-slate-200 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed">
                      Unavailable
                    </button>`
                  : item.customizations && item.customizations.length > 0
                  ? `<button data-customize-id="${item.id}" class="btn-customize px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm">
                      <i data-lucide="sliders-horizontal" class="w-3.5 h-3.5"></i>
                      <span>Customize</span>
                    </button>`
                  : `<button data-quick-add-id="${item.id}" class="btn-quick-add px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm">
                      <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                      <span>Add</span>
                    </button>`
              }
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    lucide.createIcons();

    // Attach button listeners
    menuContainer.querySelectorAll(".btn-quick-add").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-quick-add-id");
        const item = store.getMenu().find((i) => i.id === id);
        if (item) {
          addToCart(item, [], 1, "");
        }
      });
    });

    menuContainer.querySelectorAll(".btn-customize").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-customize-id");
        openCustomizeModal(id);
      });
    });
  }

  // Filter Event Listeners
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim();
      renderCustomerMenu();
    });
  }

  categoryPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      categoryPills.forEach((p) => {
        p.classList.remove("bg-slate-900", "text-white");
        p.classList.add("bg-white", "text-slate-700", "border-slate-200");
      });
      pill.classList.remove("bg-white", "text-slate-700", "border-slate-200");
      pill.classList.add("bg-slate-900", "text-white");
      activeCategory = pill.dataset.category;
      renderCustomerMenu();
    });
  });

  dietFilterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      dietFilterButtons.forEach((b) => {
        b.classList.remove("ring-2", "ring-emerald-600", "font-bold", "bg-emerald-50");
      });
      btn.classList.add("ring-2", "ring-emerald-600", "font-bold", "bg-emerald-50");
      activeDiet = btn.dataset.diet;
      renderCustomerMenu();
    });
  });

  // ==========================================================================
  // CUSTOMIZE MODAL
  // ==========================================================================
  const customizeModal = document.getElementById("modal-customize");
  const customizeTitle = document.getElementById("customize-modal-title");
  const customizeDesc = document.getElementById("customize-modal-desc");
  const customizeOptionsContainer = document.getElementById("customize-options-container");
  const customizeNotesInput = document.getElementById("customize-notes");
  const customizeQtyEl = document.getElementById("customize-qty");
  const customizeTotalBtn = document.getElementById("customize-add-btn");
  let customizeQty = 1;

  function openCustomizeModal(itemId) {
    const item = store.getMenu().find((i) => i.id === itemId);
    if (!item) return;
    selectedCustomizeItem = item;
    customizeQty = 1;
    if (customizeQtyEl) customizeQtyEl.textContent = "1";
    if (customizeNotesInput) customizeNotesInput.value = "";

    customizeTitle.textContent = item.name;
    customizeDesc.textContent = item.description;

    let optionsHTML = "";
    if (item.customizations) {
      item.customizations.forEach((group, gIdx) => {
        optionsHTML += `
          <div class="mb-4">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">${group.name}</label>
            <div class="space-y-2">
              ${group.options
                .map((opt, oIdx) => {
                  const inputType = group.multiple ? "checkbox" : "radio";
                  const nameAttr = group.multiple ? `opt_${gIdx}_${oIdx}` : `group_${gIdx}`;
                  const isChecked = !group.multiple && oIdx === 0 ? "checked" : "";
                  return `
                  <label class="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
                    <div class="flex items-center gap-2.5">
                      <input 
                        type="${inputType}" 
                        name="${nameAttr}" 
                        value="${opt.label}" 
                        data-price="${opt.price}"
                        class="customize-option text-emerald-600 focus:ring-emerald-500 rounded" 
                        ${isChecked}
                      />
                      <span class="text-sm font-medium text-slate-800">${opt.label}</span>
                    </div>
                    <span class="text-xs font-semibold text-slate-500">${
                      opt.price > 0 ? `+₹${opt.price}` : "Free"
                    }</span>
                  </label>
                `;
                })
                .join("")}
            </div>
          </div>
        `;
      });
    }

    customizeOptionsContainer.innerHTML = optionsHTML;
    calculateCustomizeTotal();

    // Listen to changes in options
    customizeOptionsContainer.querySelectorAll(".customize-option").forEach((input) => {
      input.addEventListener("change", calculateCustomizeTotal);
    });

    customizeModal.classList.remove("hidden");
  }

  function calculateCustomizeTotal() {
    if (!selectedCustomizeItem) return;
    let basePrice = selectedCustomizeItem.price;
    const selectedInputs = customizeOptionsContainer.querySelectorAll(".customize-option:checked");
    selectedInputs.forEach((input) => {
      basePrice += parseFloat(input.dataset.price || 0);
    });
    const total = basePrice * customizeQty;
    if (customizeTotalBtn) {
      customizeTotalBtn.textContent = `Add to Order • ₹${total.toFixed(2)}`;
    }
  }

  const btnIncCustQty = document.getElementById("btn-inc-cust-qty");
  const btnDecCustQty = document.getElementById("btn-dec-cust-qty");
  if (btnIncCustQty) {
    btnIncCustQty.addEventListener("click", () => {
      customizeQty++;
      customizeQtyEl.textContent = customizeQty;
      calculateCustomizeTotal();
    });
  }
  if (btnDecCustQty) {
    btnDecCustQty.addEventListener("click", () => {
      if (customizeQty > 1) {
        customizeQty--;
        customizeQtyEl.textContent = customizeQty;
        calculateCustomizeTotal();
      }
    });
  }

  if (customizeTotalBtn) {
    customizeTotalBtn.addEventListener("click", () => {
      if (!selectedCustomizeItem) return;
      const selectedAddons = [];
      const selectedInputs = customizeOptionsContainer.querySelectorAll(".customize-option:checked");
      selectedInputs.forEach((input) => {
        selectedAddons.push({
          label: input.value,
          price: parseFloat(input.dataset.price || 0)
        });
      });

      const notes = customizeNotesInput ? customizeNotesInput.value.trim() : "";
      addToCart(selectedCustomizeItem, selectedAddons, customizeQty, notes);
      customizeModal.classList.add("hidden");
    });
  }

  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal-wrapper");
      if (modal) modal.classList.add("hidden");
    });
  });

  // ==========================================================================
  // CART OPERATIONS
  // ==========================================================================
  function addToCart(item, customizations = [], qty = 1, notes = "") {
    const extraPrice = customizations.reduce((acc, curr) => acc + curr.price, 0);
    const unitPrice = item.price + extraPrice;

    // Check if identical item already exists in cart
    const customSummary = customizations.map((c) => c.label).sort().join(", ");
    const existingIndex = cart.findIndex(
      (c) => c.itemId === item.id && c.customSummary === customSummary && c.notes === notes
    );

    if (existingIndex > -1) {
      cart[existingIndex].qty += qty;
    } else {
      cart.push({
        cartId: "cart-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
        itemId: item.id,
        name: item.name,
        diet: item.diet,
        unitPrice: unitPrice,
        qty: qty,
        customizations: customizations,
        customSummary: customSummary,
        notes: notes
      });
    }

    soundFX.playClick();
    renderCart();
    showToast(`Added ${item.name} to cart`, "success");
  }

  function updateCartItemQty(cartId, delta) {
    const item = cart.find((c) => c.cartId === cartId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter((c) => c.cartId !== cartId);
    }
    soundFX.playClick();
    renderCart();
  }

  function getCartCalculations() {
    const subtotal = cart.reduce((acc, curr) => acc + curr.unitPrice * curr.qty, 0);
    let discount = 0;
    if (appliedPromo) {
      if (appliedPromo.type === "percent") {
        discount = (subtotal * appliedPromo.value) / 100;
      } else if (appliedPromo.type === "flat") {
        discount = Math.min(appliedPromo.value, subtotal);
      }
    }
    const taxable = Math.max(0, subtotal - discount);
    const tax = taxable * 0.05; // 5% GST on canteen food
    const total = taxable + tax;
    return { subtotal, discount, tax, total };
  }

  function renderCart() {
    const totalCount = cart.reduce((acc, curr) => acc + curr.qty, 0);
    if (cartBadge) {
      cartBadge.textContent = totalCount;
      cartBadge.classList.toggle("hidden", totalCount === 0);
    }

    const { subtotal, discount, tax, total } = getCartCalculations();

    if (cartSubtotalEl) cartSubtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (cartDiscountEl) cartDiscountEl.textContent = `-₹${discount.toFixed(2)}`;
    if (cartTaxEl) cartTaxEl.textContent = `₹${tax.toFixed(2)}`;
    if (cartTotalEl) cartTotalEl.textContent = `₹${total.toFixed(2)}`;

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="py-16 text-center text-slate-400">
          <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
            <i data-lucide="shopping-bag" class="w-8 h-8"></i>
          </div>
          <p class="font-medium text-slate-600">Your tray is empty</p>
          <p class="text-xs text-slate-400 mt-1">Select your favorite food items to start ordering</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    cartItemsContainer.innerHTML = cart
      .map(
        (c) => `
      <div class="p-3 bg-white rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between gap-3">
        <div class="flex-1">
          <div class="flex items-center gap-1.5">
            <span class="diet-badge ${c.diet}"></span>
            <span class="font-semibold text-slate-800 text-sm">${c.name}</span>
          </div>
          ${
            c.customSummary
              ? `<p class="text-[11px] text-slate-500 mt-0.5"><span class="text-emerald-700 font-medium">Add-ons:</span> ${c.customSummary}</p>`
              : ""
          }
          ${
            c.notes
              ? `<p class="text-[11px] text-amber-600 italic mt-0.5">Note: "${c.notes}"</p>`
              : ""
          }
          <div class="text-xs font-bold text-slate-900 mt-1">₹${(c.unitPrice * c.qty).toFixed(2)}</div>
        </div>

        <!-- Quantity Controls -->
        <div class="flex items-center bg-slate-100 rounded-lg p-1">
          <button data-cart-dec="${c.cartId}" class="w-6 h-6 flex items-center justify-center rounded-md bg-white text-slate-700 shadow-sm hover:bg-slate-200 transition font-bold text-xs">
            -
          </button>
          <span class="w-7 text-center text-xs font-bold text-slate-800">${c.qty}</span>
          <button data-cart-inc="${c.cartId}" class="w-6 h-6 flex items-center justify-center rounded-md bg-white text-slate-700 shadow-sm hover:bg-slate-200 transition font-bold text-xs">
            +
          </button>
        </div>
      </div>
    `
      )
      .join("");

    lucide.createIcons();

    cartItemsContainer.querySelectorAll("[data-cart-inc]").forEach((btn) => {
      btn.addEventListener("click", () => updateCartItemQty(btn.dataset.cartInc, 1));
    });
    cartItemsContainer.querySelectorAll("[data-cart-dec]").forEach((btn) => {
      btn.addEventListener("click", () => updateCartItemQty(btn.dataset.cartDec, -1));
    });
  }

  // Cart Drawer open/close
  const btnOpenCart = document.getElementById("btn-open-cart");
  const btnCloseCart = document.getElementById("btn-close-cart");

  function toggleCart(open) {
    if (open) {
      cartDrawer.classList.remove("translate-x-full");
      cartBackdrop.classList.remove("hidden");
    } else {
      cartDrawer.classList.add("translate-x-full");
      cartBackdrop.classList.add("hidden");
    }
  }

  if (btnOpenCart) btnOpenCart.addEventListener("click", () => toggleCart(true));
  if (btnCloseCart) btnCloseCart.addEventListener("click", () => toggleCart(false));
  if (cartBackdrop) cartBackdrop.addEventListener("click", () => toggleCart(false));

  // Promo Code
  const promoInput = document.getElementById("promo-input");
  const btnApplyPromo = document.getElementById("btn-apply-promo");
  if (btnApplyPromo) {
    btnApplyPromo.addEventListener("click", () => {
      const code = promoInput.value.trim().toUpperCase();
      if (!code) return;
      if (PROMO_CODES[code]) {
        const promo = PROMO_CODES[code];
        const { subtotal } = getCartCalculations();
        if (subtotal < promo.minOrder) {
          showToast(`Requires minimum order of ₹${promo.minOrder}`, "warning");
          return;
        }
        appliedPromo = promo;
        renderCart();
        showToast(`Promo "${code}" applied successfully!`, "success");
      } else {
        showToast("Invalid Promo Code", "error");
      }
    });
  }

  // ==========================================================================
  // CHECKOUT MODAL & ORDER SUBMISSION
  // ==========================================================================
  const checkoutModal = document.getElementById("modal-checkout");
  const btnProceedCheckout = document.getElementById("btn-proceed-checkout");
  const checkoutTotalEl = document.getElementById("checkout-total");
  const checkoutWalletBalEl = document.getElementById("checkout-wallet-balance");
  const checkoutStudentIdInput = document.getElementById("checkout-student-id");
  const checkoutCustomerNameInput = document.getElementById("checkout-customer-name");
  const paymentMethodRadios = document.querySelectorAll("input[name='payment-method']");
  const btnConfirmOrder = document.getElementById("btn-confirm-order");
  const upiQrContainer = document.getElementById("upi-qr-container");

  if (btnProceedCheckout) {
    btnProceedCheckout.addEventListener("click", () => {
      if (cart.length === 0) {
        showToast("Your cart is empty!", "warning");
        return;
      }
      toggleCart(false);

      const { total } = getCartCalculations();
      const studentId = store.getActiveStudentId();
      const wallet = store.getStudentWallet(studentId);

      if (checkoutTotalEl) checkoutTotalEl.textContent = `₹${total.toFixed(2)}`;
      if (checkoutWalletBalEl) checkoutWalletBalEl.textContent = `₹${wallet.balance.toFixed(2)}`;
      if (checkoutStudentIdInput) checkoutStudentIdInput.value = studentId;
      if (checkoutCustomerNameInput) checkoutCustomerNameInput.value = wallet.name || "Student User";

      checkoutModal.classList.remove("hidden");
    });
  }

  paymentMethodRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (upiQrContainer) {
        upiQrContainer.classList.toggle("hidden", e.target.value !== "upi");
      }
    });
  });

  if (btnConfirmOrder) {
    btnConfirmOrder.addEventListener("click", () => {
      const { subtotal, discount, tax, total } = getCartCalculations();
      const studentId = checkoutStudentIdInput.value.trim() || store.getActiveStudentId();
      const customerName = checkoutCustomerNameInput.value.trim() || "Student";
      const selectedPayment = document.querySelector("input[name='payment-method']:checked")?.value || "wallet";

      // If wallet selected, verify balance
      if (selectedPayment === "wallet") {
        const wallet = store.getStudentWallet(studentId);
        if (wallet.balance < total) {
          showToast(`Insufficient balance (₹${wallet.balance.toFixed(2)}). Please recharge or pay via UPI.`, "error");
          return;
        }
        store.debitWallet(studentId, total, "Meal Checkout");
      }

      // Create Order
      const newOrder = store.createOrder({
        customerName: customerName,
        studentId: studentId,
        items: cart.map((c) => ({
          name: c.name,
          qty: c.qty,
          price: c.unitPrice * c.qty,
          notes: [c.customSummary, c.notes].filter(Boolean).join(" | ")
        })),
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        total: total,
        paymentMethod: selectedPayment === "wallet" ? "Canteen Wallet" : selectedPayment === "upi" ? "UPI QR" : "Cash at Counter",
        paymentStatus: selectedPayment === "cash" ? "Unpaid (Pay at Counter)" : "Paid",
        estimatedMinutes: Math.max(6, Math.min(18, cart.length * 4))
      });

      // Clear Cart
      cart = [];
      appliedPromo = null;
      renderCart();
      updateWalletBadge();

      checkoutModal.classList.add("hidden");
      soundFX.playOrderPlaced();

      // Show Order Success Modal
      showOrderSuccessModal(newOrder);
    });
  }

  // ==========================================================================
  // ORDER SUCCESS & LIVE TRACKER
  // ==========================================================================
  const orderSuccessModal = document.getElementById("modal-order-success");
  const successTokenEl = document.getElementById("success-token");
  const successEstTimeEl = document.getElementById("success-est-time");
  const btnTrackOrder = document.getElementById("btn-track-order");
  let lastPlacedOrder = null;

  function showOrderSuccessModal(order) {
    lastPlacedOrder = order;
    if (successTokenEl) successTokenEl.textContent = order.token;
    if (successEstTimeEl) successEstTimeEl.textContent = `${order.estimatedMinutes} Mins`;
    if (orderSuccessModal) orderSuccessModal.classList.remove("hidden");
  }

  if (btnTrackOrder) {
    btnTrackOrder.addEventListener("click", () => {
      if (orderSuccessModal) orderSuccessModal.classList.add("hidden");
      if (lastPlacedOrder) {
        openOrderTracker(lastPlacedOrder.id);
      }
    });
  }

  const trackerModal = document.getElementById("modal-order-tracker");
  const trackerTokenEl = document.getElementById("tracker-token");
  const trackerItemsList = document.getElementById("tracker-items-list");
  const trackerStep1 = document.getElementById("tracker-step-1");
  const trackerStep2 = document.getElementById("tracker-step-2");
  const trackerStep3 = document.getElementById("tracker-step-3");
  const trackerStep4 = document.getElementById("tracker-step-4");
  const btnPrintInvoice = document.getElementById("btn-print-invoice");

  function openOrderTracker(orderId) {
    activeTrackingOrderId = orderId;
    updateTrackerUI();
    if (trackerModal) trackerModal.classList.remove("hidden");
  }

  function updateTrackerUI() {
    if (!activeTrackingOrderId) return;
    const order = store.getOrders().find((o) => o.id === activeTrackingOrderId);
    if (!order) return;

    if (trackerTokenEl) trackerTokenEl.textContent = order.token;

    if (trackerItemsList) {
      trackerItemsList.innerHTML = order.items
        .map(
          (i) => `
        <li class="flex justify-between text-xs py-1 border-b border-slate-100 last:border-0">
          <span class="font-medium text-slate-800">${i.qty}x ${i.name}</span>
          <span class="text-slate-500 font-semibold">₹${i.price.toFixed(2)}</span>
        </li>
      `
        )
        .join("");
    }

    const stepStatuses = {
      pending: 1,
      preparing: 2,
      ready: 3,
      completed: 4
    };

    const currentStepNum = stepStatuses[order.status] || 1;

    const setStepState = (el, active, completed) => {
      if (!el) return;
      const dot = el.querySelector(".step-dot");
      const text = el.querySelector(".step-text");
      if (completed) {
        dot.className = "step-dot w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow";
        dot.innerHTML = "✓";
        text.className = "step-text text-xs font-bold text-emerald-700";
      } else if (active) {
        dot.className = "step-dot w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold ring-4 ring-amber-100 shadow";
        dot.innerHTML = "●";
        text.className = "step-text text-xs font-bold text-amber-800";
      } else {
        dot.className = "step-dot w-7 h-7 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-bold";
        dot.innerHTML = "○";
        text.className = "step-text text-xs font-medium text-slate-400";
      }
    };

    setStepState(trackerStep1, currentStepNum === 1, currentStepNum > 1);
    setStepState(trackerStep2, currentStepNum === 2, currentStepNum > 2);
    setStepState(trackerStep3, currentStepNum === 3, currentStepNum > 3);
    setStepState(trackerStep4, currentStepNum === 4, false);
  }

  if (btnPrintInvoice) {
    btnPrintInvoice.addEventListener("click", () => {
      const order = store.getOrders().find((o) => o.id === activeTrackingOrderId);
      if (order) printOrderSlip(order);
    });
  }

  // ==========================================================================
  // KITCHEN DISPLAY SYSTEM (KDS)
  // ==========================================================================
  const kdsPendingCol = document.getElementById("kds-col-pending");
  const kdsPreparingCol = document.getElementById("kds-col-preparing");
  const kdsReadyCol = document.getElementById("kds-col-ready");
  const kdsCountPending = document.getElementById("kds-count-pending");
  const kdsCountPreparing = document.getElementById("kds-count-preparing");
  const kdsCountReady = document.getElementById("kds-count-ready");
  const kdsFilterBtns = document.querySelectorAll("[data-kds-filter]");

  kdsFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      kdsFilterBtns.forEach((b) => b.classList.remove("bg-slate-900", "text-white"));
      btn.classList.add("bg-slate-900", "text-white");
      kdsStationFilter = btn.dataset.kdsFilter;
      renderKitchenKDS();
    });
  });

  function renderKitchenKDS() {
    const orders = store.getOrders();
    const pending = orders.filter((o) => o.status === "pending");
    const preparing = orders.filter((o) => o.status === "preparing");
    const ready = orders.filter((o) => o.status === "ready");

    if (kdsCountPending) kdsCountPending.textContent = pending.length;
    if (kdsCountPreparing) kdsCountPreparing.textContent = preparing.length;
    if (kdsCountReady) kdsCountReady.textContent = ready.length;

    const renderTicket = (order, nextAction, nextLabel, nextColor) => {
      const elapsedMins = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
      const isUrgent = elapsedMins > order.estimatedMinutes;

      return `
        <div class="bg-white rounded-xl border ${
          isUrgent ? "border-rose-400 ring-2 ring-rose-100" : "border-slate-200"
        } shadow-sm overflow-hidden flex flex-col justify-between p-4">
          <div>
            <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div class="flex items-center gap-2">
                <span class="text-xl font-black text-slate-900 font-mono">${order.token}</span>
                <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  order.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }">
                  ${order.paymentStatus}
                </span>
              </div>
              <div class="text-right">
                <span class="text-xs font-bold ${isUrgent ? "text-rose-600 animate-pulse" : "text-slate-500"}">
                  ⏱️ ${elapsedMins}m ago
                </span>
              </div>
            </div>

            <!-- Customer & Time -->
            <div class="mt-2 text-xs text-slate-600 flex justify-between">
              <span class="font-semibold text-slate-800">${order.customerName}</span>
              <span class="text-slate-400">${order.studentId || ""}</span>
            </div>

            <!-- Items -->
            <div class="mt-3 space-y-2">
              ${order.items
                .map(
                  (i) => `
                <div class="text-xs border-b border-dashed border-slate-100 pb-1.5 last:border-0">
                  <div class="flex justify-between font-bold text-slate-900">
                    <span>${i.qty}x ${i.name}</span>
                  </div>
                  ${
                    i.notes
                      ? `<div class="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-0.5 font-medium">⚡ ${i.notes}</div>`
                      : ""
                  }
                </div>
              `
                )
                .join("")}
            </div>
          </div>

          <!-- Action buttons -->
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button data-kot-print="${order.id}" class="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs" title="Print Kitchen Slip">
              <i data-lucide="printer" class="w-4 h-4"></i>
            </button>
            <button 
              data-order-next-status="${nextAction}" 
              data-order-id="${order.id}"
              class="flex-1 py-2 px-3 text-xs font-bold rounded-lg ${nextColor} text-white shadow-sm hover:opacity-90 transition text-center"
            >
              ${nextLabel}
            </button>
          </div>
        </div>
      `;
    };

    if (kdsPendingCol) {
      kdsPendingCol.innerHTML = pending.length
        ? pending.map((o) => renderTicket(o, "preparing", "Start Cooking →", "bg-amber-600")).join("")
        : `<div class="py-12 text-center text-xs text-slate-400 font-medium">No pending orders in queue</div>`;
    }

    if (kdsPreparingCol) {
      kdsPreparingCol.innerHTML = preparing.length
        ? preparing.map((o) => renderTicket(o, "ready", "Mark Ready 🔔", "bg-blue-600")).join("")
        : `<div class="py-12 text-center text-xs text-slate-400 font-medium">No items currently cooking</div>`;
    }

    if (kdsReadyCol) {
      kdsReadyCol.innerHTML = ready.length
        ? ready.map((o) => renderTicket(o, "completed", "Delivered / Hand Over ✓", "bg-emerald-600")).join("")
        : `<div class="py-12 text-center text-xs text-slate-400 font-medium">No orders waiting for pickup</div>`;
    }

    lucide.createIcons();

    // Attach Status Action buttons
    document.querySelectorAll("[data-order-next-status]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const orderId = btn.dataset.orderId;
        const newStatus = btn.dataset.orderNextStatus;
        const updated = store.updateOrderStatus(orderId, newStatus);
        if (newStatus === "ready") {
          soundFX.playOrderReady();
          showToast(`Order ${updated.token} is ready for collection!`, "success");
        } else {
          soundFX.playClick();
        }
        renderKitchenKDS();
      });
    });

    document.querySelectorAll("[data-kot-print]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const orderId = btn.dataset.kotPrint;
        const order = store.getOrders().find((o) => o.id === orderId);
        if (order) printKOTSlip(order);
      });
    });
  }

  // ==========================================================================
  // PUBLIC TV TOKEN BOARD
  // ==========================================================================
  const tvPreparingContainer = document.getElementById("tv-board-preparing");
  const tvReadyContainer = document.getElementById("tv-board-ready");
  const btnTvFullscreen = document.getElementById("btn-tv-fullscreen");

  function renderTVBoard() {
    const orders = store.getOrders();
    const preparing = orders.filter((o) => o.status === "preparing");
    const ready = orders.filter((o) => o.status === "ready");

    if (tvPreparingContainer) {
      tvPreparingContainer.innerHTML = preparing.length
        ? preparing
            .map(
              (o) => `
          <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 text-center shadow-lg">
            <span class="text-4xl md:text-5xl font-black text-amber-400 font-mono tracking-wider block">${o.token}</span>
            <div class="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium mt-2">
              <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>Cooking in Kitchen</span>
            </div>
          </div>
        `
            )
            .join("")
        : `<div class="col-span-full py-16 text-center text-slate-500 font-medium text-lg">No orders in preparation</div>`;
    }

    if (tvReadyContainer) {
      tvReadyContainer.innerHTML = ready.length
        ? ready
            .map(
              (o) => `
          <div class="token-ready-pulse bg-emerald-950/80 border-2 border-emerald-500/80 rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden">
            <div class="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
              Ready
            </div>
            <span class="text-5xl md:text-6xl font-black text-emerald-300 font-mono tracking-wider block">${o.token}</span>
            <p class="text-sm font-bold text-white mt-2">Please collect at Counter 1</p>
          </div>
        `
            )
            .join("")
        : `<div class="col-span-full py-16 text-center text-slate-500 font-medium text-lg">No orders ready for pickup</div>`;
    }
  }

  if (btnTvFullscreen) {
    btnTvFullscreen.addEventListener("click", () => {
      const elem = document.getElementById("view-tv");
      if (!document.fullscreenElement) {
        elem.requestFullscreen().catch((err) => console.log(err));
      } else {
        document.exitFullscreen();
      }
    });
  }

  // ==========================================================================
  // MANAGER ADMIN DASHBOARD
  // ==========================================================================
  const adminRevenueEl = document.getElementById("admin-stat-revenue");
  const adminOrdersCountEl = document.getElementById("admin-stat-orders");
  const adminAvgPrepEl = document.getElementById("admin-stat-avgprep");
  const adminActiveQueueEl = document.getElementById("admin-stat-queue");
  const adminTableContainer = document.getElementById("admin-menu-table-body");
  const adminOrdersTableBody = document.getElementById("admin-orders-table-body");
  const adminNavButtons = document.querySelectorAll("[data-admin-tab]");

  adminNavButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      adminNavButtons.forEach((b) => {
        b.classList.remove("border-emerald-600", "text-emerald-700", "font-bold");
        b.classList.add("border-transparent", "text-slate-500");
      });
      btn.classList.add("border-emerald-600", "text-emerald-700", "font-bold");
      btn.classList.remove("border-transparent", "text-slate-500");
      adminActiveSection = btn.dataset.adminTab;

      document.getElementById("admin-section-menu")?.classList.toggle("hidden", adminActiveSection !== "menu");
      document.getElementById("admin-section-orders")?.classList.toggle("hidden", adminActiveSection !== "orders");
      document.getElementById("admin-section-wallets")?.classList.toggle("hidden", adminActiveSection !== "wallets");
    });
  });

  function renderAdminView() {
    const orders = store.getOrders();
    const menu = store.getMenu();

    const totalRevenue = orders.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const activeQueue = orders.filter((o) => o.status === "pending" || o.status === "preparing").length;

    if (adminRevenueEl) adminRevenueEl.textContent = `₹${totalRevenue.toFixed(2)}`;
    if (adminOrdersCountEl) adminOrdersCountEl.textContent = orders.length;
    if (adminAvgPrepEl) adminAvgPrepEl.textContent = "8.4 mins";
    if (adminActiveQueueEl) adminActiveQueueEl.textContent = activeQueue;

    // Menu Table
    if (adminTableContainer) {
      adminTableContainer.innerHTML = menu
        .map(
          (item) => `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition text-sm">
          <td class="py-3 px-4 flex items-center gap-3">
            <img src="${item.image}" alt="" class="w-10 h-10 rounded-lg object-cover bg-slate-100" />
            <div>
              <div class="font-bold text-slate-800 flex items-center gap-1.5">
                <span class="diet-badge ${item.diet}"></span>
                ${item.name}
              </div>
              <div class="text-xs text-slate-400 capitalize">${item.category} • ${item.calories} kcal</div>
            </div>
          </td>
          <td class="py-3 px-4 font-bold text-slate-900">₹${item.price}</td>
          <td class="py-3 px-4">
            <button 
              data-toggle-stock="${item.id}"
              class="px-2.5 py-1 text-xs font-bold rounded-full transition ${
                item.inStock
                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  : "bg-rose-100 text-rose-800 hover:bg-rose-200"
              }"
            >
              ${item.inStock ? "● In Stock" : "○ Out of Stock"}
            </button>
          </td>
          <td class="py-3 px-4 text-xs text-slate-500">${item.prepTime} mins</td>
          <td class="py-3 px-4 text-right">
            <button data-delete-dish="${item.id}" class="p-1.5 text-slate-400 hover:text-rose-600 transition" title="Delete Dish">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </td>
        </tr>
      `
        )
        .join("");
    }

    // Orders Table
    if (adminOrdersTableBody) {
      adminOrdersTableBody.innerHTML = orders
        .map(
          (o) => `
        <tr class="border-b border-slate-100 hover:bg-slate-50 text-sm">
          <td class="py-3 px-4 font-mono font-bold text-slate-900">${o.token}</td>
          <td class="py-3 px-4">
            <div class="font-semibold text-slate-800">${o.customerName}</div>
            <div class="text-xs text-slate-400">${o.studentId || "-"}</div>
          </td>
          <td class="py-3 px-4 text-xs text-slate-600">
            ${o.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
          </td>
          <td class="py-3 px-4 font-bold text-slate-900">₹${o.total.toFixed(2)}</td>
          <td class="py-3 px-4">
            <span class="px-2.5 py-1 text-xs font-bold rounded-full capitalize ${
              o.status === "completed"
                ? "bg-emerald-100 text-emerald-800"
                : o.status === "ready"
                ? "bg-blue-100 text-blue-800"
                : o.status === "preparing"
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-100 text-slate-800"
            }">
              ${o.status}
            </span>
          </td>
          <td class="py-3 px-4 text-xs text-slate-500">${new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
        </tr>
      `
        )
        .join("");
    }

    lucide.createIcons();

    // Attach Admin Stock toggle buttons
    document.querySelectorAll("[data-toggle-stock]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.toggleStock;
        store.toggleItemStock(id);
        soundFX.playClick();
        renderAdminView();
      });
    });

    document.querySelectorAll("[data-delete-dish]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.deleteDish;
        if (confirm("Are you sure you want to remove this dish from the menu?")) {
          store.deleteMenuItem(id);
          soundFX.playClick();
          renderAdminView();
          showToast("Item deleted from menu", "info");
        }
      });
    });
  }

  // Add New Dish Modal
  const modalAddDish = document.getElementById("modal-add-dish");
  const btnOpenAddDish = document.getElementById("btn-open-add-dish");
  const formAddDish = document.getElementById("form-add-dish");

  if (btnOpenAddDish) {
    btnOpenAddDish.addEventListener("click", () => {
      modalAddDish.classList.remove("hidden");
    });
  }

  if (formAddDish) {
    formAddDish.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("new-dish-name").value.trim();
      const category = document.getElementById("new-dish-category").value;
      const price = parseFloat(document.getElementById("new-dish-price").value);
      const diet = document.getElementById("new-dish-diet").value;
      const prepTime = parseInt(document.getElementById("new-dish-preptime").value || 10, 10);
      const calories = parseInt(document.getElementById("new-dish-calories").value || 250, 10);
      const image = document.getElementById("new-dish-image").value.trim() ||
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80";
      const desc = document.getElementById("new-dish-desc").value.trim();

      store.addMenuItem({
        name,
        category,
        price,
        diet,
        prepTime,
        calories,
        image,
        description: desc
      });

      formAddDish.reset();
      modalAddDish.classList.add("hidden");
      soundFX.playClick();
      renderAdminView();
      showToast(`Added ${name} to canteen menu!`, "success");
    });
  }

  // Admin Wallet Topup Modal & Search
  const walletStudentSearch = document.getElementById("wallet-search-id");
  const btnWalletSearch = document.getElementById("btn-wallet-search");
  const walletSearchResult = document.getElementById("wallet-search-result");
  const btnRecharge200 = document.getElementById("btn-recharge-200");
  const btnRecharge500 = document.getElementById("btn-recharge-500");

  function searchStudentWallet() {
    const studentId = walletStudentSearch ? walletStudentSearch.value.trim() : "";
    if (!studentId) return;
    const wallet = store.getStudentWallet(studentId);
    if (walletSearchResult) {
      walletSearchResult.innerHTML = `
        <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl mt-3 flex items-center justify-between">
          <div>
            <div class="font-bold text-slate-800">${wallet.name || studentId}</div>
            <div class="text-xs text-slate-500 font-mono">ID: ${studentId}</div>
          </div>
          <div class="text-right">
            <span class="text-xs text-slate-400 block">Balance</span>
            <span class="text-2xl font-black text-emerald-700">₹${wallet.balance.toFixed(2)}</span>
          </div>
        </div>
      `;
    }
  }

  if (btnWalletSearch) btnWalletSearch.addEventListener("click", searchStudentWallet);

  if (btnRecharge200) {
    btnRecharge200.addEventListener("click", () => {
      const studentId = walletStudentSearch?.value.trim() || store.getActiveStudentId();
      store.topupWallet(studentId, 200);
      searchStudentWallet();
      updateWalletBadge();
      soundFX.playOrderPlaced();
      showToast(`Recharged ₹200 for ${studentId}`, "success");
    });
  }

  if (btnRecharge500) {
    btnRecharge500.addEventListener("click", () => {
      const studentId = walletStudentSearch?.value.trim() || store.getActiveStudentId();
      store.topupWallet(studentId, 500);
      searchStudentWallet();
      updateWalletBadge();
      soundFX.playOrderPlaced();
      showToast(`Recharged ₹500 for ${studentId}`, "success");
    });
  }

  // ==========================================================================
  // REAL-TIME BROADCAST SYNC LISTENERS
  // ==========================================================================
  store.on("NEW_ORDER", (newOrder, isLocal) => {
    if (!isLocal) {
      soundFX.playKitchenAlert();
      showToast(`New Order Placed: Token ${newOrder.token}`, "info");
    }
    if (currentRole === "kitchen") renderKitchenKDS();
    if (currentRole === "tv") renderTVBoard();
    if (currentRole === "admin") renderAdminView();
  });

  store.on("ORDER_STATUS_CHANGED", (updatedOrder, isLocal) => {
    if (currentRole === "kitchen") renderKitchenKDS();
    if (currentRole === "tv") renderTVBoard();
    if (currentRole === "admin") renderAdminView();
    if (activeTrackingOrderId === updatedOrder.id) {
      updateTrackerUI();
    }
  });

  store.on("MENU_UPDATED", () => {
    if (currentRole === "customer") renderCustomerMenu();
    if (currentRole === "admin") renderAdminView();
  });

  store.on("WALLET_UPDATED", () => {
    updateWalletBadge();
  });

  // ==========================================================================
  // THERMAL PRINT UTILITIES (Receipt & KOT)
  // ==========================================================================
  function printOrderSlip(order) {
    const printArea = document.getElementById("print-area");
    if (!printArea) return;
    printArea.innerHTML = `
      <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px;">
        <h2 style="font-size: 16px; margin: 0; font-weight: bold;">SMARTBITE CANTEEN</h2>
        <p style="margin: 2px 0; font-size: 10px;">Token Number: <strong style="font-size: 14px;">${order.token}</strong></p>
        <p style="margin: 2px 0; font-size: 10px;">Date: ${new Date(order.createdAt).toLocaleString()}</p>
        <p style="margin: 2px 0; font-size: 10px;">Student: ${order.customerName} (${order.studentId || "-"})</p>
      </div>
      <div style="border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px;">
        ${order.items
          .map(
            (i) => `
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
            <span>${i.qty}x ${i.name}</span>
            <span>₹${i.price.toFixed(2)}</span>
          </div>
        `
          )
          .join("")}
      </div>
      <div style="font-size: 11px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between;"><span>Subtotal:</span><span>₹${order.subtotal.toFixed(2)}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>Discount:</span><span>-₹${order.discount.toFixed(2)}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>GST (5%):</span><span>₹${order.tax.toFixed(2)}</span></div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; margin-top: 4px;">
          <span>Total Paid:</span><span>₹${order.total.toFixed(2)}</span>
        </div>
        <div style="font-size: 10px; margin-top: 4px;">Payment: ${order.paymentMethod} (${order.paymentStatus})</div>
      </div>
      <div style="text-align: center; border-top: 1px dashed #000; padding-top: 8px; font-size: 10px;">
        <p style="margin: 0;">Show Token ${order.token} at pickup counter.</p>
        <p style="margin: 2px 0;">Thank you! Have a healthy meal.</p>
      </div>
    `;
    window.print();
  }

  function printKOTSlip(order) {
    const printArea = document.getElementById("print-area");
    if (!printArea) return;
    printArea.innerHTML = `
      <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 6px;">
        <h1 style="font-size: 20px; margin: 0; font-weight: bold;">KOT: ${order.token}</h1>
        <p style="margin: 2px 0; font-size: 11px;">Time: ${new Date(order.createdAt).toLocaleTimeString()}</p>
        <p style="margin: 2px 0; font-size: 11px;">Customer: ${order.customerName}</p>
      </div>
      <div style="border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 8px;">
        ${order.items
          .map(
            (i) => `
          <div style="font-size: 13px; font-weight: bold; margin-bottom: 6px;">
            [ ] ${i.qty} x ${i.name}
            ${i.notes ? `<div style="font-size: 11px; font-weight: normal; margin-left: 14px;">⚡ ${i.notes}</div>` : ""}
          </div>
        `
          )
          .join("")}
      </div>
      <div style="text-align: center; font-size: 10px;">
        KITCHEN DISPLAY TICKET
      </div>
    `;
    window.print();
  }

  // ==========================================================================
  // TOAST NOTIFICATIONS
  // ==========================================================================
  function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const bgClasses = {
      info: "bg-slate-900 text-white",
      success: "bg-emerald-600 text-white",
      warning: "bg-amber-500 text-slate-950 font-semibold",
      error: "bg-rose-600 text-white"
    };

    const toast = document.createElement("div");
    toast.className = `toast px-4 py-2.5 rounded-xl shadow-xl text-xs flex items-center gap-2 ${bgClasses[type] || bgClasses.info}`;
    toast.innerHTML = `<span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }
  window.showToast = showToast;

  // Initial load
  renderCustomerMenu();
  renderCart();
});
