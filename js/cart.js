/**
 * ═══════════════════════════════════════════════
 * CRAFTNEST — CART.JS
 * Shared cart module: state management,
 * localStorage ↔ Firestore sync, quantity
 * management, coupon logic, order helpers
 * ═══════════════════════════════════════════════
 *
 * USAGE:
 *   import { CartStore, CartRenderer, CheckoutController } from './cart.js';
 *
 *   const cart     = new CartStore();
 *   const renderer = new CartRenderer('#cartItems', cart);
 *   await cart.init();
 */

import {
  auth,
  db,
  addToCart      as fbAddToCart,
  removeFromCart as fbRemoveFromCart,
  clearCart      as fbClearCart,
  getCart        as fbGetCart,
  placeOrder     as fbPlaceOrder,
  watchCart,
  watchAuth,
  getCurrentUserProfile,
  showToast,
  formatPrice,
} from '../firebase-config.js';

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
export const SHIPPING_OPTIONS = [
  { value: 'standard', label: 'Standard Shipping', time: '7–14 business days', cost: 0 },
  { value: 'express',  label: 'Express Shipping',  time: '3–5 business days',  cost: 299 },
];

export const COUPON_CODES = {
  CRAFT10:    { type: 'percent', amount: 10, label: '10% off your order' },
  HANDMADE20: { type: 'percent', amount: 20, label: '20% off your order' },
  NEST15:     { type: 'percent', amount: 15, label: '15% off your order' },
  FREESHIP:   { type: 'shipping', amount: 0, label: 'Free shipping upgrade' },
  WELCOME50:  { type: 'fixed',   amount: 50, label: '₹50 off your first order' },
};

export const GST_RATE    = 0.18;  // inclusive GST rate
export const STORAGE_KEY = 'cn_cart_v2';

/* ─────────────────────────────────────────────
   CART STORE
   Single source of truth for cart state
───────────────────────────────────────────── */
export class CartStore {
  constructor() {
    this.items          = [];   // [{ productId, quantity, variant, addedAt }]
    this.catalogue      = {};   // { [productId]: { title, price, img, seller, ... } }
    this.coupon         = null; // applied coupon object
    this.shippingMethod = 'standard';
    this._listeners     = [];
    this._unsubCart     = null;
    this._user          = null;
  }

  /* ── Subscribe to changes ── */
  subscribe(fn) {
    this._listeners.push(fn);
    return () => { this._listeners = this._listeners.filter(l => l !== fn); };
  }

  _emit() {
    this._listeners.forEach(fn => fn(this));
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  async init() {
    // Watch auth — switch between local and Firestore cart
    watchAuth(async user => {
      this._user = user;

      // Unsubscribe previous real-time listener
      if (this._unsubCart) { this._unsubCart(); this._unsubCart = null; }

      if (user) {
        await this._mergeLocalToFirestore();
        // Subscribe to real-time Firestore cart
        this._unsubCart = watchCart(cartData => {
          this.items = cartData?.items || [];
          this._emit();
        });
      } else {
        this._loadLocal();
        this._emit();
      }
    });

    return this;
  }

  /* ─────────────────────────────────────────
     LOCAL STORAGE
  ───────────────────────────────────────── */
  _loadLocal() {
    const raw  = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : { items: [] };
    this.items = data.items || [];
  }

  _saveLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: this.items }));
  }

  /* Merge guest cart into Firestore on login */
  async _mergeLocalToFirestore() {
    const raw   = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const local = JSON.parse(raw);
    if (!local?.items?.length) return;

    for (const item of local.items) {
      try {
        await fbAddToCart(item.productId, item.quantity, item.variant);
      } catch { /* ignore */ }
    }
    localStorage.removeItem(STORAGE_KEY);
  }

  /* ─────────────────────────────────────────
     CATALOGUE (product details cache)
  ───────────────────────────────────────── */
  loadCatalogue(catalogue) {
    this.catalogue = catalogue;
  }

  getProduct(productId) {
    return this.catalogue[productId] || null;
  }

  /* ─────────────────────────────────────────
     CART ACTIONS
  ───────────────────────────────────────── */

  /** Add item to cart */
  async add(productId, quantity = 1, variant = null) {
    try {
      await fbAddToCart(productId, quantity, variant);
    } catch {
      // Fallback: local
      const idx = this.items.findIndex(i =>
        i.productId === productId && i.variant === variant
      );
      if (idx > -1) this.items[idx].quantity += quantity;
      else this.items.push({ productId, quantity, variant, addedAt: Date.now() });
      this._saveLocal();
      this._emit();
    }

    const prod = this.getProduct(productId);
    showToast(
      `${prod?.title ? `"${prod.title}" ` : ''}added to cart 🛍️`,
      'success'
    );
    updateCartBadge(this.totalQuantity);
  }

  /** Update quantity for an item */
  async updateQuantity(productId, quantity, variant = null) {
    quantity = Math.max(1, Math.min(99, quantity));

    if (this._user) {
      try {
        // Firestore: get cart, update qty, write back
        const cartData = await fbGetCart();
        const items    = cartData?.items || [];
        const idx      = items.findIndex(i =>
          i.productId === productId && i.variant === variant
        );
        if (idx > -1) items[idx].quantity = quantity;
        await this._writeFirestoreItems(items);
        return;
      } catch { /* fallback */ }
    }

    const idx = this.items.findIndex(i =>
      i.productId === productId && i.variant === variant
    );
    if (idx > -1) this.items[idx].quantity = quantity;
    this._saveLocal();
    this._emit();
  }

  /** Remove a specific item */
  async remove(productId, variant = null) {
    try {
      await fbRemoveFromCart(productId, variant);
    } catch {
      this.items = this.items.filter(i =>
        !(i.productId === productId && i.variant === variant)
      );
      this._saveLocal();
      this._emit();
    }
    showToast('Item removed from cart', 'info');
    updateCartBadge(this.totalQuantity);
  }

  /** Clear the entire cart */
  async clear() {
    try {
      await fbClearCart();
    } catch {
      this.items = [];
      this._saveLocal();
      this._emit();
    }
    updateCartBadge(0);
  }

  /** Move item to wishlist and remove from cart */
  async moveToWishlist(productId, variant = null) {
    let wl = JSON.parse(localStorage.getItem('cn_wishlist') || '[]');
    if (!wl.includes(productId)) wl.push(productId);
    localStorage.setItem('cn_wishlist', JSON.stringify(wl));

    try {
      const { addToWishlist } = await import('../firebase-config.js');
      await addToWishlist(productId);
    } catch { /* not logged in */ }

    await this.remove(productId, variant);
    showToast('Saved to wishlist ♥', 'success');
  }

  /* Firestore write helper */
  async _writeFirestoreItems(items) {
    const { doc, updateDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    await updateDoc(doc(db, 'carts', this._user.uid), {
      items,
      updatedAt: serverTimestamp(),
    });
  }

  /* ─────────────────────────────────────────
     COUPON
  ───────────────────────────────────────── */

  applyCoupon(code) {
    const coupon = COUPON_CODES[code?.toUpperCase()?.trim()];
    if (!coupon) {
      showToast('Invalid or expired coupon code.', 'error');
      return false;
    }
    this.coupon = { code: code.toUpperCase(), ...coupon };
    showToast(`Coupon applied! ${coupon.label} 🎉`, 'success');
    this._emit();
    return true;
  }

  removeCoupon() {
    this.coupon = null;
    showToast('Coupon removed.', 'info');
    this._emit();
  }

  /* ─────────────────────────────────────────
     SHIPPING
  ───────────────────────────────────────── */

  setShippingMethod(method) {
    this.shippingMethod = method;
    this._emit();
  }

  get shippingCost() {
    const option = SHIPPING_OPTIONS.find(o => o.value === this.shippingMethod);
    const base   = option?.cost ?? 0;
    // Free shipping coupon overrides
    if (this.coupon?.type === 'shipping') return 0;
    return base;
  }

  /* ─────────────────────────────────────────
     COMPUTED TOTALS
  ───────────────────────────────────────── */

  get enrichedItems() {
    return this.items
      .map(item => {
        const prod = this.getProduct(item.productId);
        if (!prod) return null;
        return {
          ...item,
          ...prod,
          lineTotal: (prod.price || 0) * item.quantity,
        };
      })
      .filter(Boolean);
  }

  get totalQuantity() {
    return this.items.reduce((s, i) => s + (i.quantity || 0), 0);
  }

  get isEmpty() {
    return this.items.length === 0;
  }

  get subtotal() {
    return this.enrichedItems.reduce((s, i) => s + i.lineTotal, 0);
  }

  get discountAmount() {
    if (!this.coupon) return 0;
    if (this.coupon.type === 'percent') {
      return Math.round(this.subtotal * (this.coupon.amount / 100));
    }
    if (this.coupon.type === 'fixed') {
      return Math.min(this.coupon.amount, this.subtotal);
    }
    return 0;
  }

  get discountedSubtotal() {
    return this.subtotal - this.discountAmount;
  }

  /** GST is inclusive in Indian prices (extracted, not added) */
  get gstAmount() {
    return Math.round(this.discountedSubtotal * GST_RATE / (1 + GST_RATE));
  }

  get total() {
    return this.discountedSubtotal + this.shippingCost;
  }

  get formattedSubtotal()   { return '₹' + this.subtotal.toLocaleString('en-IN'); }
  get formattedDiscount()   { return '-₹' + this.discountAmount.toLocaleString('en-IN'); }
  get formattedShipping()   { return this.shippingCost ? '₹' + this.shippingCost.toLocaleString('en-IN') : 'FREE'; }
  get formattedGst()        { return '₹' + this.gstAmount.toLocaleString('en-IN'); }
  get formattedTotal()      { return '₹' + this.total.toLocaleString('en-IN'); }

  /** Group items by seller for the cart UI */
  get groupedBySeller() {
    const groups = {};
    this.enrichedItems.forEach(item => {
      const sid = item.sellerId || 'unknown';
      if (!groups[sid]) {
        groups[sid] = {
          sellerId:     sid,
          sellerName:   item.seller || 'CraftNest Seller',
          sellerAvatar: item.sellerAvatar || '',
          items:        [],
        };
      }
      groups[sid].items.push(item);
    });
    return Object.values(groups);
  }

  /* ─────────────────────────────────────────
     ORDER PLACEMENT
  ───────────────────────────────────────── */

  /**
   * Build the order payload for Firestore.
   * @param {object} shippingAddress
   * @param {string} paymentMethod
   */
  buildOrderPayload(shippingAddress, paymentMethod) {
    return {
      items: this.enrichedItems.map(item => ({
        productId: item.productId,
        title:     item.title,
        price:     item.price,
        quantity:  item.quantity,
        variant:   item.variant,
        sellerId:  item.sellerId || '',
        img:       item.img || '',
      })),
      sellerIds:       [...new Set(this.enrichedItems.map(i => i.sellerId).filter(Boolean))],
      subtotal:        this.subtotal,
      discountAmount:  this.discountAmount,
      shippingCost:    this.shippingCost,
      gstAmount:       this.gstAmount,
      total:           this.total,
      couponCode:      this.coupon?.code || null,
      shippingMethod:  this.shippingMethod,
      shippingAddress,
      paymentMethod,
      currency:        'INR',
    };
  }

  async placeOrder(shippingAddress, paymentMethod) {
    const payload = this.buildOrderPayload(shippingAddress, paymentMethod);

    try {
      const orderId = await fbPlaceOrder(payload);
      await this.clear();
      return orderId;
    } catch (err) {
      // Not logged in or Firestore unavailable — generate local order ID
      console.warn('Firestore order failed, local fallback:', err.message);
      await this.clear();
      return 'CN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
  }
}

/* ─────────────────────────────────────────────
   CART RENDERER
   Renders cart items grouped by seller
───────────────────────────────────────────── */
export class CartRenderer {
  /**
   * @param {string}    containerSelector
   * @param {CartStore} store
   */
  constructor(containerSelector, store) {
    this.container = document.querySelector(containerSelector);
    this.store     = store;
    store.subscribe(() => this.render());
  }

  render() {
    if (!this.container) return;

    if (this.store.isEmpty) {
      this._renderEmpty();
      return;
    }

    this.container.innerHTML = '';
    this.store.groupedBySeller.forEach(group => {
      this.container.appendChild(this._groupEl(group));
    });
  }

  _groupEl(group) {
    const wrap = document.createElement('div');
    wrap.className = 'seller-group';
    wrap.innerHTML = `
      <div class="seller-group-header">
        <img class="seller-group-avatar" src="${group.sellerAvatar}" alt="${this._escape(group.sellerName)}" />
        <span class="seller-group-name">${this._escape(group.sellerName)}</span>
        <a href="seller-profile.html?id=${group.sellerId}" class="seller-group-link">Visit Shop →</a>
      </div>
      <div class="seller-group-items" id="sg-${group.sellerId}"></div>`;

    const itemsEl = wrap.querySelector(`#sg-${group.sellerId}`);
    group.items.forEach(item => itemsEl.appendChild(this._itemEl(item)));
    return wrap;
  }

  _itemEl(item) {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.id = `ci-${item.productId}`;
    el.innerHTML = `
      <a href="product.html?id=${item.productId}">
        <img class="cart-item-img"
          src="${item.img || ''}"
          alt="${this._escape(item.title)}"
          loading="lazy"
        />
      </a>
      <div class="cart-item-info">
        <span class="cart-item-seller">${this._escape(item.seller)}</span>
        <a href="product.html?id=${item.productId}"
          class="cart-item-name"
          style="text-decoration:none;">
          ${this._escape(item.title)}
        </a>
        ${item.variant
          ? `<span class="cart-item-variant">${this._escape(item.variant)}</span>`
          : ''}
        <div class="cart-item-actions">
          <div class="qty-selector" style="transform:scale(0.9);transform-origin:left;">
            <button class="qty-btn" data-action="dec"
              data-id="${item.productId}" data-variant="${item.variant || ''}">−</button>
            <input class="qty-input" type="number"
              value="${item.quantity}" min="1" max="99"
              data-id="${item.productId}" data-variant="${item.variant || ''}" />
            <button class="qty-btn" data-action="inc"
              data-id="${item.productId}" data-variant="${item.variant || ''}">+</button>
          </div>
          <button class="cart-item-remove"
            data-action="remove"
            data-id="${item.productId}"
            data-variant="${item.variant || ''}">Remove</button>
          <button class="cart-item-remove"
            style="color:var(--clay);"
            data-action="wishlist"
            data-id="${item.productId}"
            data-variant="${item.variant || ''}">♥ Save</button>
        </div>
      </div>
      <div class="cart-item-price-col">
        <span class="cart-item-price">₹${item.lineTotal.toLocaleString('en-IN')}</span>
        ${item.quantity > 1
          ? `<span class="cart-item-unit-price">₹${item.price.toLocaleString('en-IN')} each</span>`
          : ''}
      </div>`;

    this._bindItemEvents(el, item);
    return el;
  }

  _bindItemEvents(el, item) {
    el.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const action  = btn.dataset.action;
        const id      = btn.dataset.id;
        const variant = btn.dataset.variant || null;

        if (action === 'dec') {
          const cur = this.store.items.find(i => i.productId === id)?.quantity || 1;
          if (cur > 1) await this.store.updateQuantity(id, cur - 1, variant);
          else         await this.store.remove(id, variant);
        }
        if (action === 'inc') {
          const cur = this.store.items.find(i => i.productId === id)?.quantity || 1;
          await this.store.updateQuantity(id, cur + 1, variant);
        }
        if (action === 'remove')   await this.store.remove(id, variant);
        if (action === 'wishlist') await this.store.moveToWishlist(id, variant);
      });
    });

    // Quantity input direct edit
    el.querySelectorAll('input.qty-input').forEach(input => {
      input.addEventListener('change', async () => {
        const id      = input.dataset.id;
        const variant = input.dataset.variant || null;
        await this.store.updateQuantity(id, parseInt(input.value) || 1, variant);
      });
    });
  }

  _renderEmpty() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="cart-empty">
        <span class="cart-empty-icon">🛍️</span>
        <h2>Your cart is empty</h2>
        <p>Discover handmade goods from independent makers worldwide.</p>
        <a href="marketplace.html" class="btn-primary">Start Exploring</a>
      </div>`;
  }

  _escape(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

/* ─────────────────────────────────────────────
   ORDER SUMMARY RENDERER
   Keeps the sidebar summary in sync with cart state
───────────────────────────────────────────── */
export class OrderSummaryRenderer {
  /**
   * @param {CartStore} store
   */
  constructor(store) {
    this.store = store;
    store.subscribe(() => this.render());
  }

  render() {
    const s = this.store;

    this._set('summaryItemCount', s.totalQuantity);
    this._set('summarySubtotal',  s.formattedSubtotal);
    this._set('summaryGst',       s.formattedGst);
    this._set('summaryTotal',     s.formattedTotal);
    this._set('finalTotal',       s.formattedTotal);

    // Shipping
    const shippingEl = document.getElementById('summaryShipping');
    if (shippingEl) {
      shippingEl.textContent = s.formattedShipping;
      shippingEl.style.color = s.shippingCost === 0 ? 'var(--moss)' : 'var(--text-primary)';
      shippingEl.style.fontWeight = s.shippingCost === 0 ? '600' : '400';
    }

    // Discount row
    const discRow = document.getElementById('discountRow');
    const discEl  = document.getElementById('summaryDiscount');
    if (discRow && discEl) {
      discRow.style.display = s.discountAmount > 0 ? 'flex' : 'none';
      discEl.textContent    = s.formattedDiscount;
    }

    // Coupon badge
    const couponBadge = document.getElementById('appliedCoupon');
    if (couponBadge) {
      couponBadge.style.display = s.coupon ? 'flex' : 'none';
      couponBadge.querySelector('span')?.setAttribute('data-text', s.coupon?.label || '');
    }

    // Thumbnails strip
    this._renderThumbs();

    // Update cart badge in nav
    updateCartBadge(s.totalQuantity);
  }

  _renderThumbs() {
    const el = document.getElementById('summaryThumbs');
    if (!el) return;
    el.innerHTML = '';
    const items = this.store.enrichedItems.slice(0, 6);
    items.forEach(item => {
      const img = document.createElement('img');
      img.className = 'summary-thumb';
      img.src = item.img || '';
      img.alt = item.title || '';
      el.appendChild(img);
    });
    if (this.store.enrichedItems.length > 6) {
      const more = document.createElement('div');
      more.className = 'summary-thumb';
      more.style.cssText = `
        display:flex;align-items:center;justify-content:center;
        font-family:var(--font-ui);font-size:0.72rem;font-weight:700;
        color:var(--text-muted);background:var(--sand);`;
      more.textContent = '+' + (this.store.enrichedItems.length - 6);
      el.appendChild(more);
    }
  }

  _set(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text ?? '';
  }
}

/* ─────────────────────────────────────────────
   COUPON CONTROLLER
───────────────────────────────────────────── */
export class CouponController {
  /**
   * @param {object} ids   — { inputId, applyBtnId, removeBtnId }
   * @param {CartStore} store
   */
  constructor(ids, store) {
    this.input     = document.getElementById(ids.inputId);
    this.applyBtn  = document.getElementById(ids.applyBtnId);
    this.removeBtn = document.getElementById(ids.removeBtnId);
    this.store     = store;

    if (this.applyBtn) {
      this.applyBtn.addEventListener('click', () => this._apply());
    }
    if (this.input) {
      this.input.addEventListener('keydown', e => {
        if (e.key === 'Enter') this._apply();
      });
    }
    if (this.removeBtn) {
      this.removeBtn.addEventListener('click', () => {
        store.removeCoupon();
        if (this.input) this.input.value = '';
      });
    }
  }

  _apply() {
    const code = this.input?.value?.trim();
    if (!code) { showToast('Please enter a coupon code.', 'error'); return; }
    const ok = this.store.applyCoupon(code);
    if (ok && this.input) this.input.value = '';
  }
}

/* ─────────────────────────────────────────────
   SHIPPING METHOD CONTROLLER
───────────────────────────────────────────── */
export class ShippingController {
  /**
   * @param {string}    groupSelector — CSS selector for shipping method labels
   * @param {CartStore} store
   */
  constructor(groupSelector, store) {
    this.store = store;
    document.querySelectorAll(groupSelector).forEach(label => {
      label.addEventListener('click', () => {
        document.querySelectorAll(groupSelector).forEach(l => l.classList.remove('selected'));
        label.classList.add('selected');
        const radio  = label.querySelector('input[type="radio"]');
        if (radio) store.setShippingMethod(radio.value);
      });
    });
  }
}

/* ─────────────────────────────────────────────
   CHECKOUT CONTROLLER
   Manages the multi-step checkout form
───────────────────────────────────────────── */
export class CheckoutController {
  /**
   * @param {CartStore} store
   * @param {object} opts
   */
  constructor(store, opts = {}) {
    this.store       = store;
    this.currentStep = 0;
    this.totalSteps  = 4;
    this.opts = {
      onStepChange:  null,     // callback(stepIndex)
      onOrderPlaced: null,     // callback(orderId)
      ...opts,
    };
  }

  /* ── Navigate to a step ── */
  goTo(step) {
    if (step < 0 || step >= this.totalSteps) return;
    if (step > 0 && this.store.isEmpty) {
      showToast('Your cart is empty.', 'error');
      return;
    }

    this.currentStep = step;
    this._updateStepUI(step);
    if (this.opts.onStepChange) this.opts.onStepChange(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  next() { this.goTo(this.currentStep + 1); }
  back() { this.goTo(this.currentStep - 1); }

  /* ── Update step indicator UI ── */
  _updateStepUI(step) {
    document.querySelectorAll('.checkout-step').forEach((s, i) => {
      s.classList.remove('active', 'done');
      if (i < step)  s.classList.add('done');
      if (i === step) s.classList.add('active');
      const circle = s.querySelector('.step-circle');
      if (circle) circle.textContent = i < step ? '✓' : String(i + 1);
    });

    // Connector fills
    ['fill01', 'fill12', 'fill23'].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.style.width = i < step ? '100%' : '0%';
    });

    // Panels
    document.querySelectorAll('.checkout-step-panel').forEach((p, i) => {
      p.classList.toggle('active', i === step);
    });
  }

  /* ── Validate shipping form ── */
  validateShipping() {
    const fields = [
      { id: 'shipFirst', label: 'First name' },
      { id: 'shipLast',  label: 'Last name' },
      { id: 'shipAddr1', label: 'Address' },
      { id: 'shipCity',  label: 'City' },
      { id: 'shipState', label: 'State' },
      { id: 'shipPin',   label: 'PIN code' },
      { id: 'shipPhone', label: 'Phone number' },
    ];

    for (const { id, label } of fields) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (!el.value.trim()) {
        el.classList.add('error');
        el.focus();
        showToast(`Please enter your ${label}.`, 'error');
        el.addEventListener('input', () => el.classList.remove('error'), { once: true });
        return false;
      }
    }
    return true;
  }

  /* ── Collect shipping address from form ── */
  getShippingAddress() {
    return {
      firstName: document.getElementById('shipFirst')?.value?.trim()   || '',
      lastName:  document.getElementById('shipLast')?.value?.trim()    || '',
      address1:  document.getElementById('shipAddr1')?.value?.trim()   || '',
      address2:  document.getElementById('shipAddr2')?.value?.trim()   || '',
      city:      document.getElementById('shipCity')?.value?.trim()    || '',
      state:     document.getElementById('shipState')?.value?.trim()   || '',
      pin:       document.getElementById('shipPin')?.value?.trim()     || '',
      country:   document.getElementById('shipCountry')?.value        || 'IN',
      phone:     document.getElementById('shipPhone')?.value?.trim()   || '',
    };
  }

  /* ── Collect selected payment method ── */
  getPaymentMethod() {
    const checked = document.querySelector('input[name="payMethod"]:checked');
    return checked?.value || 'card';
  }

  /* ── Place the order ── */
  async placeOrder() {
    const btn = document.getElementById('placeOrderBtn');
    if (btn) { btn.textContent = 'Processing…'; btn.disabled = true; }

    // Simulated processing delay (in production, real payment gateway)
    await new Promise(r => setTimeout(r, 1800));

    const address       = this.getShippingAddress();
    const paymentMethod = this.getPaymentMethod();

    const orderId = await this.store.placeOrder(address, paymentMethod);

    // Show confirmation
    const orderDisplay = document.getElementById('orderIdDisplay');
    if (orderDisplay) orderDisplay.textContent = '#' + orderId;

    this.goTo(3);

    if (this.opts.onOrderPlaced) this.opts.onOrderPlaced(orderId);

    if (btn) { btn.textContent = 'Place Order'; btn.disabled = false; }
    return orderId;
  }
}

/* ─────────────────────────────────────────────
   CART BADGE UPDATER
───────────────────────────────────────────── */
export function updateCartBadge(count) {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  badge.textContent = count ?? 0;
  badge.classList.add('pop');
  setTimeout(() => badge.classList.remove('pop'), 300);
}

/* ─────────────────────────────────────────────
   GET BADGE COUNT FROM STORAGE
   (used on initial page load before CartStore init)
───────────────────────────────────────────── */
export function getStoredCartCount() {
  const raw  = localStorage.getItem(STORAGE_KEY);
  if (!raw) return 0;
  const data = JSON.parse(raw);
  return (data?.items || []).reduce((s, i) => s + (i.quantity || 0), 0);
}

/* ─────────────────────────────────────────────
   QUICK ADD (standalone, no CartStore needed)
   Drop-in for product card quick-add buttons
───────────────────────────────────────────── */
export async function quickAddToCart(productId, title) {
  try {
    await fbAddToCart(productId, 1);
  } catch {
    const cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"items":[]}');
    const idx  = cart.items.findIndex(i => i.productId === productId);
    if (idx > -1) cart.items[idx].quantity++;
    else cart.items.push({ productId, quantity: 1, variant: null, addedAt: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  showToast(`${title ? `"${title}" ` : ''}added to cart 🛍️`, 'success');
  const count = getStoredCartCount();
  updateCartBadge(count);
}

/* ─────────────────────────────────────────────
   PERSIST CART ACROSS TABS
   Listens for storage events to keep carts
   in sync across multiple open tabs
───────────────────────────────────────────── */
export function enableCrossTabSync(store) {
  window.addEventListener('storage', e => {
    if (e.key === STORAGE_KEY && !auth.currentUser) {
      store._loadLocal();
      store._emit();
    }
  });
}

/* ─────────────────────────────────────────────
   WISHLIST HELPERS (standalone)
───────────────────────────────────────────── */
export function getWishlistIds() {
  return JSON.parse(localStorage.getItem('cn_wishlist') || '[]');
}

export function isWishlisted(productId) {
  return getWishlistIds().includes(productId);
}

export async function toggleWishlistItem(productId) {
  let ids = getWishlistIds();
  const wasIn = ids.includes(productId);

  if (wasIn) {
    ids = ids.filter(id => id !== productId);
    try {
      const { removeFromWishlist } = await import('../firebase-config.js');
      await removeFromWishlist(productId);
    } catch { /* not logged in */ }
    showToast('Removed from wishlist', 'info');
  } else {
    ids = [...new Set([...ids, productId])];
    try {
      const { addToWishlist } = await import('../firebase-config.js');
      await addToWishlist(productId);
    } catch { /* not logged in */ }
    showToast('Added to wishlist ♥', 'success');
  }

  localStorage.setItem('cn_wishlist', JSON.stringify(ids));
  return !wasIn; // returns new state (true = now wishlisted)
}
