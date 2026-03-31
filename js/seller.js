/**
 * ═══════════════════════════════════════════════
 * CRAFTNEST — SELLER.JS
 * Shared module: seller profile logic, shop data
 * loading, follow/unfollow, and messaging
 * ═══════════════════════════════════════════════
 *
 * USAGE:
 *   import { SellerProfileController } from './seller.js';
 *   const ctrl = new SellerProfileController('seller1');
 *   await ctrl.init();
 */

import {
  getShop,
  getProducts,
  watchAuth,
  getCurrentUserProfile,
  showToast,
  formatDate,
} from '../firebase-config.js';

/* ─────────────────────────────────────────────
   SELLER PROFILE CONTROLLER
   Orchestrates all data loading and UI for
   a public seller/shop profile page
───────────────────────────────────────────── */
export class SellerProfileController {
  /**
   * @param {string} sellerId  — Firestore doc ID / URL param
   * @param {object} opts
   */
  constructor(sellerId, opts = {}) {
    this.sellerId   = sellerId;
    this.shop       = null;
    this.products   = [];
    this.currentUser = null;
    this.isFollowing = false;
    this.opts = {
      demoData:      null,       // pass demo shop object to skip Firestore
      onShopLoaded:  null,       // callback(shop)
      onProductsLoaded: null,    // callback(products)
      ...opts,
    };
  }

  /* ── Boot ── */
  async init() {
    await this._loadShop();
    await this._loadProducts();
    this._loadFollowState();
    this._bindAuthState();
    return this;
  }

  /* ─────────────────────────────────────────
     DATA LOADING
  ───────────────────────────────────────── */

  async _loadShop() {
    try {
      if (this.opts.demoData) {
        this.shop = this.opts.demoData;
      } else {
        this.shop = await getShop(this.sellerId);
        if (!this.shop) throw new Error('Shop not found');
      }
      if (this.opts.onShopLoaded) this.opts.onShopLoaded(this.shop);
    } catch (err) {
      console.warn('Shop load failed:', err.message);
      this.shop = null;
    }
  }

  async _loadProducts() {
    try {
      if (this.opts.demoData?.products) {
        this.products = this.opts.demoData.products;
      } else {
        this.products = await getProducts({
          sellerId: this.sellerId,
          limitN:   48,
          sort:     'popular',
        });
      }
      if (this.opts.onProductsLoaded) this.opts.onProductsLoaded(this.products);
    } catch (err) {
      console.warn('Products load failed:', err.message);
      this.products = [];
    }
  }

  /* ─────────────────────────────────────────
     FOLLOW / UNFOLLOW
  ───────────────────────────────────────── */

  _loadFollowState() {
    const follows = JSON.parse(localStorage.getItem('cn_follows') || '[]');
    this.isFollowing = follows.includes(this.sellerId);
  }

  _saveFollowState() {
    let follows = JSON.parse(localStorage.getItem('cn_follows') || '[]');
    if (this.isFollowing) {
      follows = [...new Set([...follows, this.sellerId])];
    } else {
      follows = follows.filter(id => id !== this.sellerId);
    }
    localStorage.setItem('cn_follows', JSON.stringify(follows));
  }

  async toggleFollow() {
    this.isFollowing = !this.isFollowing;
    this._saveFollowState();

    const shopName = this.shop?.shopName || 'this seller';
    if (this.isFollowing) {
      showToast(`Following ${shopName} ♥`, 'success');
    } else {
      showToast(`Unfollowed ${shopName}`, 'info');
    }

    return this.isFollowing;
  }

  get followCount() {
    // In production this comes from Firestore shop.followCount
    return (this.shop?.followCount ?? 0) + (this.isFollowing ? 1 : 0);
  }

  /* ─────────────────────────────────────────
     MESSAGING
  ───────────────────────────────────────── */

  /**
   * Send a message to the seller.
   * In production, writes to Firestore messages collection.
   * @param {string} subject
   * @param {string} body
   */
  async sendMessage(subject, body) {
    if (!subject.trim() || !body.trim()) {
      showToast('Please fill in both subject and message.', 'error');
      return false;
    }

    // In production: await addDoc(collection(db, 'messages'), { ... })
    // For now: simulate success
    await new Promise(r => setTimeout(r, 600));
    showToast('Message sent! The maker will reply within 24 hours. 📬', 'success');
    return true;
  }

  /* ─────────────────────────────────────────
     AUTH STATE
  ───────────────────────────────────────── */

  _bindAuthState() {
    watchAuth(async user => {
      this.currentUser = user;
      if (user) {
        this.currentUserProfile = await getCurrentUserProfile();
      } else {
        this.currentUserProfile = null;
      }
    });
  }

  get isOwnShop() {
    return this.currentUser?.uid === this.sellerId;
  }
}

/* ─────────────────────────────────────────────
   SHOP HEADER RENDERER
   Populates all DOM elements in the profile header
───────────────────────────────────────────── */
export class ShopHeaderRenderer {
  /**
   * @param {object} shop — shop data object
   */
  render(shop) {
    if (!shop) return;

    this._set('shopName',      shop.shopName);
    this._set('shopLocation',  shop.location);
    this._set('memberSince',   `Since ${shop.memberSince || 'recently'}`);
    this._set('shopBio',       shop.bio);
    this._set('shopStory',     shop.story ? `"${shop.story}"` : '');

    this._setSrc('profileAvatar', shop.avatarURL);
    this._setSrc('bannerImg',     shop.bannerURL);

    /* Verified badge */
    const badge = document.getElementById('verifiedBadge');
    if (badge) badge.style.display = shop.isVerified ? 'flex' : 'none';

    /* Featured banner */
    const featBanner = document.getElementById('featuredBanner');
    if (featBanner) featBanner.style.display = shop.isFeatured ? 'flex' : 'none';

    /* Craft type tags */
    this._renderCraftTags(shop.craftTypes || []);

    /* Stats */
    this._animateStat('statSales',    shop.totalSales   || 0);
    this._animateStat('statReviews',  shop.reviewCount  || 0);
    this._animateStat('statProducts', shop.productCount || 0);
    this._setRating('statRating', shop.rating || 0);
    this._set('statResponse', shop.responseTime || '< 1 day');

    /* Review summary */
    this._set('shopAvgRating', (shop.rating || 0).toFixed(1));
    this._set('shopRevCount',  `${shop.reviewCount || 0} reviews`);
    this._setStars('shopStars', shop.rating || 0);

    /* Social links */
    this._renderSocialLinks(shop.socialLinks || {});

    /* Full story + process steps */
    this._renderFullStory(shop.fullStory || shop.story || '');
    this._renderProcessSteps(shop.process || []);

    /* Workshop photos */
    this._renderWorkshopPhotos(shop.workshopPhotos || []);

    /* Page title */
    document.title = `${shop.shopName} — CraftNest`;

    /* Modal seller name */
    this._set('modalSellerName', shop.shopName);
  }

  _set(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text || '';
  }

  _setSrc(id, src) {
    const el = document.getElementById(id);
    if (el && src) el.src = src;
  }

  _animateStat(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    const dur  = 1600;
    const step = target / (dur / 16);
    let cur    = 0;
    const tick = () => {
      cur = Math.min(cur + step, target);
      el.textContent = Math.floor(cur).toLocaleString('en-IN');
      if (cur < target) requestAnimationFrame(tick);
    };
    setTimeout(() => requestAnimationFrame(tick), 200);
  }

  _setRating(id, rating) {
    const el = document.getElementById(id);
    if (el) el.textContent = rating.toFixed(2) + ' ★';
  }

  _setStars(id, rating) {
    const el = document.getElementById(id);
    if (!el) return;
    const full  = Math.floor(rating);
    const half  = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    el.textContent = '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  _renderCraftTags(tags) {
    const el = document.getElementById('craftTags');
    if (!el) return;
    el.innerHTML = '';
    tags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'craft-tag';
      span.textContent = tag;
      el.appendChild(span);
    });
  }

  _renderSocialLinks(links) {
    const el = document.getElementById('socialLinks');
    if (!el) return;
    el.innerHTML = '';

    const ICONS   = { instagram: '📸', pinterest: '📌', website: '🌐', twitter: '𝕏', tiktok: '🎵' };
    const LABELS  = { instagram: 'Instagram', pinterest: 'Pinterest', website: 'Website', twitter: 'Twitter/X', tiktok: 'TikTok' };

    Object.entries(links).forEach(([platform, url]) => {
      el.innerHTML += `
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="social-link">
          <span class="social-link-icon">${ICONS[platform] || '🔗'}</span>
          ${LABELS[platform] || platform}
          <svg style="margin-left:auto;opacity:0.4" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>`;
    });
  }

  _renderFullStory(story) {
    const el = document.getElementById('shopFullStory');
    if (!el) return;
    el.innerHTML = story
      .split('\n\n')
      .map(para => `<p style="margin-bottom:1.25rem;">${para.trim()}</p>`)
      .join('');
  }

  _renderProcessSteps(steps) {
    const el = document.getElementById('shopProcess');
    if (!el) return;
    el.innerHTML = '';
    steps.forEach(step => {
      el.innerHTML += `
        <div style="display:flex;gap:var(--space-lg);padding:var(--space-lg);
          background:var(--parchment);border:1px solid var(--border);
          border-radius:var(--radius-lg);">
          <span style="font-size:1.8rem;flex-shrink:0;">${step.icon || '🔨'}</span>
          <div>
            <strong style="font-family:var(--font-ui);font-size:0.9rem;
              display:block;margin-bottom:4px;color:var(--text-primary);">
              ${this._escape(step.title)}
            </strong>
            <p style="font-size:0.875rem;color:var(--text-muted);line-height:1.6;">
              ${this._escape(step.desc)}
            </p>
          </div>
        </div>`;
    });
  }

  _renderWorkshopPhotos(photos) {
    const el = document.getElementById('workshopGrid');
    if (!el) return;
    el.innerHTML = '';
    photos.forEach(src => {
      const div = document.createElement('div');
      div.className = 'workshop-photo';
      div.innerHTML = `<img src="${src}" alt="Workshop" loading="lazy" />`;
      el.appendChild(div);
    });
  }

  _escape(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

/* ─────────────────────────────────────────────
   SHOP PRODUCTS RENDERER
   Renders the seller's product cards in their
   profile shop tab
───────────────────────────────────────────── */
export class ShopProductsRenderer {
  /**
   * @param {string} gridId  — id of the grid element
   * @param {string} shopName
   */
  constructor(gridId, shopName = '') {
    this.grid     = document.getElementById(gridId);
    this.shopName = shopName;
  }

  render(products, sort = 'popular') {
    if (!this.grid) return;

    const sorted = this._sort([...products], sort);
    this.grid.innerHTML = '';

    if (!sorted.length) {
      this.grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:var(--space-3xl);
          color:var(--text-muted);font-family:var(--font-ui);font-size:0.875rem;">
          No products listed yet. Check back soon!
        </div>`;
      return;
    }

    sorted.forEach((p, i) => this._renderCard(p, i));
    this._bindReveal();
  }

  _sort(arr, method) {
    switch (method) {
      case 'newest':     return arr.sort((a, b) => String(b.id).localeCompare(String(a.id)));
      case 'price_asc':  return arr.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price_desc': return arr.sort((a, b) => (b.price || 0) - (a.price || 0));
      default:           return arr.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    }
  }

  _renderCard(p, i) {
    const card = document.createElement('a');
    card.href      = `product.html?id=${p.id}`;
    card.className = 'product-card reveal';
    card.innerHTML = `
      <div class="product-img-wrap">
        <img src="${p.img || p.images?.[0] || ''}" alt="${this._escape(p.title)}" loading="lazy" />
        ${p.tag ? `<span class="product-tag">${this._escape(p.tag)}</span>` : ''}
        <button class="product-quick-add"
          onclick="event.preventDefault();window._shopAddToCart('${p.id}','${this._escape(p.title)}')"
        >+ Add to Cart</button>
      </div>
      <div class="product-info">
        <span class="product-seller">${this._escape(this.shopName)}</span>
        <h3 class="product-title">${this._escape(p.title)}</h3>
        <div class="product-meta">
          <span class="product-rating">★ ${(p.rating || 0).toFixed(1)}
            <span class="review-count">(${p.reviews || 0})</span>
          </span>
          <span class="product-price">₹${(p.price || 0).toLocaleString('en-IN')}</span>
        </div>
      </div>`;
    this.grid.appendChild(card);
    setTimeout(() => card.classList.add('revealed'), i * 65 + 50);
  }

  _bindReveal() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    this.grid.querySelectorAll('.reveal:not(.revealed)').forEach(el => obs.observe(el));
  }

  _escape(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

/* ─────────────────────────────────────────────
   SHOP REVIEWS RENDERER
   Renders review cards for a seller's reviews tab
───────────────────────────────────────────── */
export class ShopReviewsRenderer {
  constructor(listId) {
    this.list = document.getElementById(listId);
  }

  render(reviews = []) {
    if (!this.list) return;
    if (!reviews.length) {
      this.list.innerHTML = `
        <p style="font-family:var(--font-ui);font-size:0.875rem;
          color:var(--text-muted);padding:var(--space-xl) 0;">
          No reviews yet. Be the first to leave one!
        </p>`;
      return;
    }
    this.list.innerHTML = reviews.map(r => this._cardHTML(r)).join('');
  }

  _cardHTML(r) {
    const stars  = '★'.repeat(r.rating || 0) + '☆'.repeat(5 - (r.rating || 0));
    const date   = r.date || (r.createdAt ? formatDate(r.createdAt) : '');
    const avatar = r.avatar || r.buyerPhotoURL || '';
    const name   = r.name   || r.buyerName    || 'Anonymous';

    return `
      <div class="review-card">
        <div class="review-header">
          <div class="reviewer-info">
            ${avatar
              ? `<img class="reviewer-avatar" src="${avatar}" alt="${this._escape(name)}" />`
              : `<div class="reviewer-avatar" style="background:var(--clay);color:white;display:flex;align-items:center;justify-content:center;font-family:var(--font-ui);font-weight:700;">
                   ${name.charAt(0).toUpperCase()}
                 </div>`
            }
            <div>
              <span class="reviewer-name">${this._escape(name)}</span>
              <span class="reviewer-date">
                ${date}
                ${r.product ? ` · <em style="color:var(--clay);font-style:normal;">${this._escape(r.product)}</em>` : ''}
              </span>
            </div>
          </div>
          <div class="review-stars">${stars}</div>
        </div>
        <p class="review-text">${this._escape(r.text || '')}</p>
        ${r.images?.length
          ? `<div class="review-images">
               ${r.images.map(src => `<img class="review-img" src="${src}" alt="Review photo" />`).join('')}
             </div>`
          : ''}
      </div>`;
  }

  _escape(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

/* ─────────────────────────────────────────────
   FOLLOW BUTTON CONTROLLER
   Manages the follow/unfollow button state
───────────────────────────────────────────── */
export class FollowButtonController {
  /**
   * @param {string}                   btnId
   * @param {string}                   textId   — span inside button
   * @param {SellerProfileController}  ctrl
   */
  constructor(btnId, textId, ctrl) {
    this.btn  = document.getElementById(btnId);
    this.text = document.getElementById(textId);
    this.ctrl = ctrl;

    if (!this.btn) return;

    this._render();
    this.btn.addEventListener('click', async () => {
      await this.ctrl.toggleFollow();
      this._render();
    });
  }

  _render() {
    if (!this.btn || !this.text) return;
    const following = this.ctrl.isFollowing;
    this.btn.classList.toggle('following', following);
    this.text.textContent = following ? 'Following ♥' : 'Follow';
    this.btn.setAttribute('aria-pressed', following);
  }
}

/* ─────────────────────────────────────────────
   MESSAGE MODAL CONTROLLER
   Opens/closes the contact modal & handles submit
───────────────────────────────────────────── */
export class MessageModalController {
  /**
   * @param {object} ids — { backdropId, openBtnId, closeBtnId, cancelBtnId, formId }
   * @param {SellerProfileController} ctrl
   */
  constructor(ids, ctrl) {
    this.backdrop  = document.getElementById(ids.backdropId);
    this.openBtn   = document.getElementById(ids.openBtnId);
    this.closeBtn  = document.getElementById(ids.closeBtnId);
    this.cancelBtn = document.getElementById(ids.cancelBtnId);
    this.form      = document.getElementById(ids.formId);
    this.ctrl      = ctrl;

    this._bind();
  }

  _bind() {
    if (this.openBtn)   this.openBtn.addEventListener('click',   () => this.open());
    if (this.closeBtn)  this.closeBtn.addEventListener('click',  () => this.close());
    if (this.cancelBtn) this.cancelBtn.addEventListener('click', () => this.close());
    if (this.backdrop) {
      this.backdrop.addEventListener('click', e => {
        if (e.target === this.backdrop) this.close();
      });
    }
    if (this.form) {
      this.form.addEventListener('submit', async e => {
        e.preventDefault();
        const subject = document.getElementById('msgSubject')?.value || '';
        const body    = document.getElementById('msgBody')?.value    || '';
        const ok = await this.ctrl.sendMessage(subject, body);
        if (ok) {
          this.close();
          if (this.form) this.form.reset();
        }
      });
    }
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.close();
    });
  }

  open() {
    if (!this.backdrop) return;
    this.backdrop.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('msgSubject')?.focus();
  }

  close() {
    if (!this.backdrop) return;
    this.backdrop.style.display = 'none';
    document.body.style.overflow = '';
  }
}

/* ─────────────────────────────────────────────
   SHOP TAB CONTROLLER
   Handles the Products / Reviews / About tab nav
───────────────────────────────────────────── */
export class ShopTabController {
  /**
   * @param {string} tabSelector  — CSS selector for tab buttons
   * @param {object} panelMap     — { tabDataValue: panelElementId }
   * @param {function} onSwitch   — optional callback(tabName)
   */
  constructor(tabSelector, panelMap, onSwitch = null) {
    this.tabs      = document.querySelectorAll(tabSelector);
    this.panelMap  = panelMap;
    this.onSwitch  = onSwitch;

    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.show(tab.dataset.stab));
    });
  }

  show(name) {
    this.tabs.forEach(t => t.classList.toggle('active', t.dataset.stab === name));
    Object.entries(this.panelMap).forEach(([key, id]) => {
      const el = document.getElementById(id);
      if (el) el.style.display = key === name ? 'block' : 'none';
    });
    if (this.onSwitch) this.onSwitch(name);
  }

  showDefault() {
    const first = this.tabs[0];
    if (first) this.show(first.dataset.stab);
  }
}

/* ─────────────────────────────────────────────
   CART ADD HELPER (global, used by shop product cards)
───────────────────────────────────────────── */
import { addToCart, addToWishlist, removeFromWishlist } from '../firebase-config.js';

/**
 * Sets up the global window._shopAddToCart function
 * called by quick-add buttons in ShopProductsRenderer
 */
export function registerShopCartHelper() {
  window._shopAddToCart = async (productId, title) => {
    try {
      await addToCart(productId, 1);
    } catch {
      const cart = JSON.parse(localStorage.getItem('cn_cart_v2') || '{"items":[]}');
      const idx  = cart.items.findIndex(i => i.productId === productId);
      if (idx > -1) cart.items[idx].quantity++;
      else cart.items.push({ productId, quantity: 1, variant: null, addedAt: Date.now() });
      localStorage.setItem('cn_cart_v2', JSON.stringify(cart));
    }
    showToast(`"${title}" added to cart 🛍️`, 'success');
    updateCartBadge();
  };
}

/* ─────────────────────────────────────────────
   NAV AUTH UPDATER
   Updates the navbar to show user's name when
   logged in, and hides the Join button
───────────────────────────────────────────── */
export function bindNavAuth(opts = {}) {
  const {
    authBtnId  = 'navAuthBtn',
    joinBtnId  = 'navJoinBtn',
    authHref   = '#',
    sellerHref = 'seller-dashboard.html',
  } = opts;

  watchAuth(async user => {
    if (!user) return;
    const profile  = await getCurrentUserProfile();
    const authBtn  = document.getElementById(authBtnId);
    const joinBtn  = document.getElementById(joinBtnId);
    if (authBtn) {
      authBtn.textContent = profile?.displayName?.split(' ')[0] || 'Account';
      authBtn.href = profile?.role === 'seller' ? sellerHref : authHref;
    }
    if (joinBtn) joinBtn.style.display = 'none';
  });
}

/* ─────────────────────────────────────────────
   CART BADGE UPDATER
───────────────────────────────────────────── */
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const cart  = JSON.parse(localStorage.getItem('cn_cart_v2') || '{"items":[]}');
  const count = (cart.items || []).reduce((s, i) => s + (i.quantity || 0), 0);
  badge.textContent = count;
  badge.classList.add('pop');
  setTimeout(() => badge.classList.remove('pop'), 300);
}

/* ─────────────────────────────────────────────
   SELLER CARD RENDERER
   Renders a grid of seller/shop cards
   (used on landing page and marketplace)
───────────────────────────────────────────── */
export class SellerCardRenderer {
  /**
   * @param {string} gridSelector
   */
  constructor(gridSelector) {
    this.grid = document.querySelector(gridSelector);
  }

  render(sellers) {
    if (!this.grid) return;
    this.grid.innerHTML = '';
    sellers.forEach((s, i) => this._renderCard(s, i));
    this._bindReveal();
  }

  _renderCard(s, i) {
    const card = document.createElement('a');
    card.href      = `seller-profile.html?id=${s.id || s.sellerId}`;
    card.className = 'seller-card reveal';

    const badgeHTML = s.badge
      ? `<div class="seller-badge">${this._escape(s.badge)}</div>`
      : '';

    card.innerHTML = `
      <div class="seller-img-wrap">
        <img src="${s.avatarURL || s.img || ''}" alt="${this._escape(s.shopName)}" loading="lazy" />
        ${badgeHTML}
      </div>
      <div class="seller-info">
        <h3>${this._escape(s.shopName)}</h3>
        <span class="seller-location">📍 ${this._escape(s.location || '')}</span>
        <p>${this._escape(s.bio || '')}</p>
        <div class="seller-meta">
          <span>${(s.totalSales || 0).toLocaleString()} sales</span>
          <span>·</span>
          <span>★ ${(s.rating || 0).toFixed(2)}</span>
        </div>
      </div>`;

    this.grid.appendChild(card);
    setTimeout(() => card.classList.add('revealed'), i * 80 + 50);
  }

  _bindReveal() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    this.grid.querySelectorAll('.reveal:not(.revealed)').forEach(el => obs.observe(el));
  }

  _escape(str = '') {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

/* ─────────────────────────────────────────────
   SELLER SEARCH / FILTER
   Simple client-side filter for seller grids
───────────────────────────────────────────── */
export class SellerFilterController {
  /**
   * @param {object[]}           sellers  — full seller list
   * @param {SellerCardRenderer} renderer
   */
  constructor(sellers, renderer) {
    this.all      = sellers;
    this.renderer = renderer;
    this.query    = '';
    this.craft    = 'all';
  }

  search(query) {
    this.query = query.toLowerCase().trim();
    this._apply();
  }

  filterByCraft(craft) {
    this.craft = craft;
    this._apply();
  }

  _apply() {
    let results = [...this.all];

    if (this.query) {
      results = results.filter(s =>
        s.shopName?.toLowerCase().includes(this.query) ||
        s.bio?.toLowerCase().includes(this.query)      ||
        s.location?.toLowerCase().includes(this.query) ||
        s.craftTypes?.some(c => c.toLowerCase().includes(this.query))
      );
    }

    if (this.craft !== 'all') {
      results = results.filter(s =>
        s.craftTypes?.some(c => c.toLowerCase().includes(this.craft))
      );
    }

    this.renderer.render(results);
  }
}

/* ─────────────────────────────────────────────
   SHOP SORT CONTROLLER
   Wires a sort <select> to the shop products grid
───────────────────────────────────────────── */
export class ShopSortController {
  /**
   * @param {string}               selectId
   * @param {object[]}             products
   * @param {ShopProductsRenderer} renderer
   */
  constructor(selectId, products, renderer) {
    this.select   = document.getElementById(selectId);
    this.products = products;
    this.renderer = renderer;

    if (!this.select) return;
    this.select.addEventListener('change', () => {
      this.renderer.render(this.products, this.select.value);
    });
  }
}

/* ─────────────────────────────────────────────
   SHARE UTILITIES (used on seller & product pages)
───────────────────────────────────────────── */
export const ShareUtils = {
  twitter(text, url) {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank', 'noopener,width=550,height=420'
    );
  },

  whatsapp(text, url) {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      '_blank', 'noopener'
    );
  },

  copyLink(url) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('Link copied to clipboard! 🔗', 'success');
    }).catch(() => {
      showToast('Could not copy link.', 'error');
    });
  },

  native(title, text, url) {
    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => {});
    } else {
      this.copyLink(url);
    }
  },
};

/* ─────────────────────────────────────────────
   SHOP ANALYTICS STUB
   In production, records shop page views
   to Firestore for the seller's dashboard
───────────────────────────────────────────── */
export async function recordShopView(sellerId) {
  try {
    // In production: await updateDoc(doc(db, 'shops', sellerId), { views: increment(1) });
    // For now: no-op
    if (process.env.NODE_ENV !== 'production') return;
    const { doc, updateDoc, increment, db } = await import('../firebase-config.js');
    await updateDoc(doc(db, 'shops', sellerId), { views: increment(1) });
  } catch {
    /* Silently ignore — analytics should never break the page */
  }
}
