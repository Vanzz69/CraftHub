/**
 * ═══════════════════════════════════════════════
 * CRAFTNEST — MARKETPLACE.JS
 * Shared module: product fetching, search,
 * filtering, sorting & pagination
 * ═══════════════════════════════════════════════
 *
 * USAGE (in any page that lists products):
 *
 *   import {
 *     MarketplaceStore,
 *     ProductRenderer,
 *     SearchController,
 *     FilterController
 *   } from './marketplace.js';
 *
 *   const store    = new MarketplaceStore();
 *   const renderer = new ProductRenderer('#productsGrid');
 *   await store.load();
 *   renderer.render(store.filtered);
 */

import {
  getProducts,
  addToCart,
  addToWishlist,
  removeFromWishlist,
  showToast,
  formatPrice,
} from '../firebase-config.js';

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
export const CATEGORIES = [
  { value: 'all',      label: 'All Items',          emoji: '✦' },
  { value: 'ceramics', label: 'Ceramics & Pottery', emoji: '🏺' },
  { value: 'jewelry',  label: 'Jewelry',            emoji: '💍' },
  { value: 'textiles', label: 'Textiles & Weaving', emoji: '🧵' },
  { value: 'woodwork', label: 'Woodwork',           emoji: '🪵' },
  { value: 'candles',  label: 'Candles & Soaps',    emoji: '🕯️' },
  { value: 'art',      label: 'Art & Prints',       emoji: '🖼️' },
  { value: 'leather',  label: 'Leather Goods',      emoji: '👜' },
  { value: 'macrame',  label: 'Macramé',            emoji: '🪢' },
];

export const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'popular',    label: 'Most Popular' },
  { value: 'rating',     label: 'Highest Rated' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export const PER_PAGE = 12;

/* ─────────────────────────────────────────────
   DEFAULT FILTER STATE
───────────────────────────────────────────── */
export function defaultFilters() {
  return {
    category:   'all',
    categories: [],     // multi-select from sidebar checkboxes
    priceMin:   0,
    priceMax:   50000,
    rating:     0,
    locations:  [],
    tags:       [],
    search:     '',
    sort:       'newest',
  };
}

/* ─────────────────────────────────────────────
   MARKETPLACE STORE
   Manages all product data, filtering & sorting
───────────────────────────────────────────── */
export class MarketplaceStore {
  constructor() {
    this.all       = [];   // full dataset (from Firestore or demo)
    this.filtered  = [];   // after applying filters/sort
    this.filters   = defaultFilters();
    this.page      = 1;
    this.loading   = false;
    this._listeners = [];  // change subscribers
  }

  /* ── Subscribe to state changes ── */
  subscribe(fn) {
    this._listeners.push(fn);
    return () => { this._listeners = this._listeners.filter(l => l !== fn); };
  }

  _emit() {
    this._listeners.forEach(fn => fn(this));
  }

  /* ── Load products (Firestore or demo fallback) ── */
  async load(firestoreFilters = {}) {
    this.loading = true;
    this._emit();

    try {
      const products = await getProducts({ limitN: 100, ...firestoreFilters });
      this.all = products;
    } catch (err) {
      console.warn('Firestore unavailable, using demo data:', err.message);
      this.all = DEMO_PRODUCTS;
    }

    this.applyFilters();
    this.loading = false;
    this._emit();
  }

  /* ── Update a single filter key and re-apply ── */
  setFilter(key, value) {
    this.filters[key] = value;
    this.page = 1;
    this.applyFilters();
    this._emit();
  }

  /* ── Update multiple filters at once ── */
  setFilters(partial) {
    Object.assign(this.filters, partial);
    this.page = 1;
    this.applyFilters();
    this._emit();
  }

  /* ── Reset all filters ── */
  clearFilters() {
    this.filters = defaultFilters();
    this.page = 1;
    this.applyFilters();
    this._emit();
  }

  /* ── Core filtering + sorting logic ── */
  applyFilters() {
    let results = [...this.all];
    const f     = this.filters;

    /* ─ Search ─ */
    if (f.search.trim()) {
      const q = f.search.toLowerCase().trim();
      results = results.filter(p =>
        p.title?.toLowerCase().includes(q)    ||
        p.seller?.toLowerCase().includes(q)   ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    /* ─ Category tab ─ */
    if (f.category && f.category !== 'all') {
      results = results.filter(p => p.category === f.category);
    }

    /* ─ Category checkboxes (sidebar) ─ */
    if (f.categories.length) {
      results = results.filter(p => f.categories.includes(p.category));
    }

    /* ─ Price range ─ */
    results = results.filter(p =>
      (p.price ?? 0) >= f.priceMin &&
      (p.price ?? Infinity) <= f.priceMax
    );

    /* ─ Minimum rating ─ */
    if (f.rating > 0) {
      results = results.filter(p => (p.rating ?? 0) >= f.rating);
    }

    /* ─ Location ─ */
    if (f.locations.length) {
      results = results.filter(p =>
        f.locations.some(loc =>
          p.location?.toLowerCase().includes(loc.toLowerCase())
        )
      );
    }

    /* ─ Tags ─ */
    if (f.tags.length) {
      results = results.filter(p =>
        f.tags.some(t =>
          p.tag?.toLowerCase().includes(t.toLowerCase())
        )
      );
    }

    /* ─ Sort ─ */
    results = this._sort(results, f.sort);

    this.filtered = results;
  }

  _sort(arr, method) {
    const sorted = [...arr];
    switch (method) {
      case 'newest':     return sorted.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      case 'popular':    return sorted.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
      case 'rating':     return sorted.sort((a, b) => (b.rating  ?? 0) - (a.rating  ?? 0));
      case 'price_asc':  return sorted.sort((a, b) => (a.price   ?? 0) - (b.price   ?? 0));
      case 'price_desc': return sorted.sort((a, b) => (b.price   ?? 0) - (a.price   ?? 0));
      default:           return sorted;
    }
  }

  /* ── Pagination ── */
  get currentPage()  { return this.page; }
  get totalPages()   { return Math.ceil(this.filtered.length / PER_PAGE); }
  get hasNextPage()  { return this.page < this.totalPages; }
  get hasPrevPage()  { return this.page > 1; }

  getPageItems() {
    const start = (this.page - 1) * PER_PAGE;
    return this.filtered.slice(start, start + PER_PAGE);
  }

  nextPage() {
    if (this.hasNextPage) { this.page++; this._emit(); }
  }

  prevPage() {
    if (this.hasPrevPage) { this.page--; this._emit(); }
  }

  goToPage(n) {
    if (n >= 1 && n <= this.totalPages) { this.page = n; this._emit(); }
  }

  /* ── Append next page (infinite scroll / load more) ── */
  loadMore() {
    if (this.hasNextPage) {
      this.page++;
      this._emit('loadmore');
    }
  }

  /* ── Get active filter count (for badge) ── */
  get activeFilterCount() {
    const f = this.filters;
    let count = 0;
    if (f.category && f.category !== 'all') count++;
    count += f.categories.length;
    count += f.locations.length;
    count += f.tags.length;
    if (f.rating > 0)         count++;
    if (f.priceMax < 50000)   count++;
    if (f.priceMin > 0)       count++;
    if (f.search.trim())      count++;
    return count;
  }

  /* ── Active filter chip descriptors ── */
  get activeFilterChips() {
    const f = this.filters;
    const chips = [];

    if (f.search)   chips.push({ label: `"${f.search}"`,           key: 'search',     value: '' });
    if (f.category !== 'all') chips.push({ label: f.category,      key: 'category',   value: 'all' });
    f.categories.forEach(c => chips.push({ label: c,                key: 'categories', value: c, multi: true }));
    f.locations.forEach(l  => chips.push({ label: l,                key: 'locations',  value: l, multi: true }));
    f.tags.forEach(t       => chips.push({ label: t,                key: 'tags',       value: t, multi: true }));
    if (f.rating > 0)   chips.push({ label: `★ ${f.rating}+`,      key: 'rating',     value: 0 });
    if (f.priceMax < 50000) chips.push({ label: `Under ₹${f.priceMax.toLocaleString()}`, key: 'priceMax', value: 50000 });
    if (f.priceMin > 0)    chips.push({ label: `From ₹${f.priceMin.toLocaleString()}`,   key: 'priceMin', value: 0 });

    return chips;
  }

  /* ── Remove one chip ── */
  removeChip(chip) {
    if (chip.multi) {
      this.filters[chip.key] = this.filters[chip.key].filter(v => v !== chip.value);
    } else {
      this.filters[chip.key] = chip.value;
    }
    this.page = 1;
    this.applyFilters();
    this._emit();
  }
}

/* ─────────────────────────────────────────────
   PRODUCT RENDERER
   Renders product cards into a grid container
───────────────────────────────────────────── */
export class ProductRenderer {
  /**
   * @param {string|HTMLElement} containerSelector
   * @param {object} opts
   */
  constructor(containerSelector, opts = {}) {
    this.container = typeof containerSelector === 'string'
      ? document.querySelector(containerSelector)
      : containerSelector;
    this.opts = {
      currency:    'INR',
      currencySymbol: '₹',
      showSeller:  true,
      showRating:  true,
      linkBase:    'product.html',
      ...opts,
    };
    this._wishlistIds = new Set(
      JSON.parse(localStorage.getItem('cn_wishlist') || '[]')
    );
  }

  /* ── Render a fresh grid ── */
  render(products) {
    if (!this.container) return;
    this.container.innerHTML = '';
    if (!products.length) {
      this._renderEmpty();
      return;
    }
    products.forEach((p, i) => this._renderCard(p, i));
    this._bindIntersectionReveal();
  }

  /* ── Append more cards (load more) ── */
  append(products) {
    if (!this.container) return;
    const start = this.container.children.length;
    products.forEach((p, i) => this._renderCard(p, start + i));
    this._bindIntersectionReveal();
  }

  /* ── Single card ── */
  _renderCard(p, idx) {
    const card = document.createElement('a');
    card.href      = `${this.opts.linkBase}?id=${p.id}`;
    card.className = 'product-card reveal';
    card.style.transitionDelay = `${Math.min(idx, 7) * 0.06}s`;
    card.setAttribute('data-id', p.id);

    const isWishlisted = this._wishlistIds.has(p.id);
    const price        = this.opts.currencySymbol + (p.price ?? 0).toLocaleString('en-IN');
    const ratingStars  = p.rating ? `★ ${Number(p.rating).toFixed(1)}` : '';
    const reviewCount  = p.reviews ? `(${Number(p.reviews).toLocaleString()})` : '';

    card.innerHTML = `
      <div class="product-img-wrap">
        <img
          src="${p.img || p.images?.[0] || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80'}"
          alt="${this._escape(p.title)}"
          loading="lazy"
        />
        ${p.tag ? `<span class="product-tag">${this._escape(p.tag)}</span>` : ''}
        <button
          class="product-wishlist${isWishlisted ? ' active' : ''}"
          data-id="${p.id}"
          aria-label="${isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}"
          title="Wishlist"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <button class="product-quick-add" data-id="${p.id}" data-title="${this._escape(p.title)}">
          + Add to Cart
        </button>
      </div>
      <div class="product-info">
        ${this.opts.showSeller && p.seller
          ? `<span class="product-seller">${this._escape(p.seller)}</span>`
          : ''}
        <h3 class="product-title">${this._escape(p.title)}</h3>
        <div class="product-meta">
          ${this.opts.showRating && ratingStars
            ? `<span class="product-rating">${ratingStars} <span class="review-count">${reviewCount}</span></span>`
            : ''}
          <span class="product-price">${price}</span>
        </div>
      </div>`;

    /* Stop link navigation on button clicks */
    card.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', e => e.preventDefault());
    });

    /* Wishlist */
    card.querySelector('.product-wishlist').addEventListener('click', e => {
      e.stopPropagation();
      this._handleWishlist(p.id, e.currentTarget);
    });

    /* Quick add */
    card.querySelector('.product-quick-add').addEventListener('click', e => {
      e.stopPropagation();
      this._handleAddToCart(p.id, p.title);
    });

    this.container.appendChild(card);
  }

  /* ── Empty state ── */
  _renderEmpty() {
    this.container.innerHTML = `
      <div class="no-results" style="grid-column:1/-1;">
        <span class="no-results-icon">🔍</span>
        <h3>No items found</h3>
        <p>Try adjusting your filters or search term.</p>
      </div>`;
  }

  /* ── Scroll reveal with IntersectionObserver ── */
  _bindIntersectionReveal() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    this.container.querySelectorAll('.reveal:not(.revealed)').forEach(el => obs.observe(el));
  }

  /* ── Wishlist toggle ── */
  async _handleWishlist(productId, btn) {
    const isActive = btn.classList.toggle('active');
    const svg      = btn.querySelector('svg');
    svg.setAttribute('fill', isActive ? 'currentColor' : 'none');
    btn.setAttribute('aria-label', isActive ? 'Remove from wishlist' : 'Add to wishlist');

    if (isActive) this._wishlistIds.add(productId);
    else          this._wishlistIds.delete(productId);

    // Persist locally
    localStorage.setItem('cn_wishlist', JSON.stringify([...this._wishlistIds]));

    try {
      if (isActive) await addToWishlist(productId);
      else          await removeFromWishlist(productId);
    } catch {
      /* Not logged in — local storage is enough */
    }

    showToast(
      isActive ? 'Added to wishlist ♥' : 'Removed from wishlist',
      isActive ? 'success' : 'info'
    );
  }

  /* ── Add to cart ── */
  async _handleAddToCart(productId, title) {
    try {
      await addToCart(productId, 1);
    } catch {
      /* Fallback: localStorage */
      const cart = JSON.parse(localStorage.getItem('cn_cart_v2') || '{"items":[]}');
      const idx  = cart.items.findIndex(i => i.productId === productId);
      if (idx > -1) cart.items[idx].quantity++;
      else cart.items.push({ productId, quantity: 1, variant: null, addedAt: Date.now() });
      localStorage.setItem('cn_cart_v2', JSON.stringify(cart));
    }

    showToast(`"${title}" added to cart 🛍️`, 'success');
    updateCartBadge();
  }

  /* ── Escape HTML ── */
  _escape(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

/* ─────────────────────────────────────────────
   SEARCH CONTROLLER
   Wires a search <input> to a MarketplaceStore
───────────────────────────────────────────── */
export class SearchController {
  /**
   * @param {string} inputSelector
   * @param {MarketplaceStore} store
   * @param {number} debounceMs
   */
  constructor(inputSelector, store, debounceMs = 300) {
    this.input    = document.querySelector(inputSelector);
    this.store    = store;
    this._timer   = null;
    this._debounce = debounceMs;

    if (!this.input) return;

    this.input.addEventListener('input', () => {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this.store.setFilter('search', this.input.value);
      }, this._debounce);
    });

    /* Clear on Escape */
    this.input.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.input.value = '';
        this.store.setFilter('search', '');
      }
    });
  }

  setValue(val) {
    if (this.input) this.input.value = val;
  }

  clear() {
    this.setValue('');
    this.store.setFilter('search', '');
  }
}

/* ─────────────────────────────────────────────
   FILTER CONTROLLER
   Wires sidebar checkboxes, sliders & radios
   to a MarketplaceStore
───────────────────────────────────────────── */
export class FilterController {
  /**
   * @param {MarketplaceStore} store
   */
  constructor(store) {
    this.store = store;
    this._bind();
  }

  _bind() {
    /* ─ Category checkboxes ─ */
    document.querySelectorAll('.f-cat').forEach(cb => {
      cb.addEventListener('change', () => {
        this.store.setFilter(
          'categories',
          [...document.querySelectorAll('.f-cat:checked')].map(c => c.value)
        );
      });
    });

    /* ─ Price range slider ─ */
    const slider   = document.getElementById('priceSlider');
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');

    if (slider) {
      slider.addEventListener('input', () => {
        this.store.setFilter('priceMax', parseInt(slider.value));
        if (priceMax) priceMax.value = slider.value;
      });
    }
    if (priceMax) {
      priceMax.addEventListener('change', () => {
        const v = parseInt(priceMax.value) || 50000;
        this.store.setFilter('priceMax', v);
        if (slider) slider.value = Math.min(v, 50000);
      });
    }
    if (priceMin) {
      priceMin.addEventListener('change', () => {
        this.store.setFilter('priceMin', parseInt(priceMin.value) || 0);
      });
    }

    /* ─ Rating radios ─ */
    document.querySelectorAll('.f-rating').forEach(r => {
      r.addEventListener('change', () => {
        this.store.setFilter('rating', parseFloat(r.value) || 0);
      });
    });

    /* ─ Location checkboxes ─ */
    document.querySelectorAll('.f-loc').forEach(cb => {
      cb.addEventListener('change', () => {
        this.store.setFilter(
          'locations',
          [...document.querySelectorAll('.f-loc:checked')].map(c => c.value)
        );
      });
    });

    /* ─ Tag checkboxes ─ */
    document.querySelectorAll('.f-tag').forEach(cb => {
      cb.addEventListener('change', () => {
        this.store.setFilter(
          'tags',
          [...document.querySelectorAll('.f-tag:checked')].map(c => c.value)
        );
      });
    });

    /* ─ Sort select ─ */
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', e => {
        this.store.setFilter('sort', e.target.value);
      });
    }

    /* ─ Category tab pills ─ */
    document.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.store.setFilter('category', pill.dataset.cat);
      });
    });

    /* ─ Filter group collapse toggles ─ */
    document.querySelectorAll('.filter-group-title').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.filter-group').classList.toggle('collapsed');
      });
    });

    /* ─ Clear all ─ */
    const clearBtn = document.getElementById('clearAllFilters');
    if (clearBtn) clearBtn.addEventListener('click', () => this.reset());
  }

  reset() {
    this.store.clearFilters();
    document.querySelectorAll('.f-cat, .f-loc, .f-tag').forEach(cb => cb.checked = false);
    const anyRating = document.querySelector('.f-rating[value=""]');
    if (anyRating) anyRating.checked = true;
    const slider = document.getElementById('priceSlider');
    if (slider) slider.value = 50000;
    const priceMax = document.getElementById('priceMax');
    if (priceMax) priceMax.value = '';
    const priceMin = document.getElementById('priceMin');
    if (priceMin) priceMin.value = '';
    document.querySelectorAll('.cat-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.cat === 'all');
    });
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'newest';
  }
}

/* ─────────────────────────────────────────────
   ACTIVE CHIPS RENDERER
   Renders removable filter chip elements
───────────────────────────────────────────── */
export class ActiveChipsRenderer {
  /**
   * @param {string} containerSelector
   * @param {MarketplaceStore} store
   */
  constructor(containerSelector, store) {
    this.container = document.querySelector(containerSelector);
    this.store     = store;

    store.subscribe(() => this.render());
  }

  render() {
    if (!this.container) return;
    const chips = this.store.activeFilterChips;
    this.container.innerHTML = '';

    chips.forEach(chip => {
      const el = document.createElement('div');
      el.className = 'filter-chip';
      el.innerHTML = `
        ${this._escape(chip.label)}
        <button aria-label="Remove filter" title="Remove">✕</button>`;
      el.querySelector('button').addEventListener('click', () => {
        this.store.removeChip(chip);
      });
      this.container.appendChild(el);
    });
  }

  _escape(str = '') {
    return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

/* ─────────────────────────────────────────────
   PAGINATION RENDERER
   Renders prev / page numbers / next buttons
───────────────────────────────────────────── */
export class PaginationRenderer {
  /**
   * @param {string} containerSelector
   * @param {MarketplaceStore} store
   */
  constructor(containerSelector, store) {
    this.container = document.querySelector(containerSelector);
    this.store     = store;
    store.subscribe(() => this.render());
  }

  render() {
    if (!this.container) return;
    const { currentPage, totalPages } = this.store;
    if (totalPages <= 1) { this.container.innerHTML = ''; return; }

    this.container.innerHTML = '';

    /* Prev */
    this._btn('‹ Prev', currentPage === 1, () => {
      this.store.prevPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* Page numbers */
    const pages = this._pageRange(currentPage, totalPages);
    pages.forEach(p => {
      if (p === '…') {
        const dot = document.createElement('span');
        dot.className = 'page-btn';
        dot.style.pointerEvents = 'none';
        dot.textContent = '…';
        this.container.appendChild(dot);
      } else {
        this._btn(p, false, () => {
          this.store.goToPage(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, p === currentPage);
      }
    });

    /* Next */
    this._btn('Next ›', currentPage === totalPages, () => {
      this.store.nextPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  _btn(label, disabled, onClick, active = false) {
    const btn = document.createElement('button');
    btn.className = `page-btn${active ? ' active' : ''}`;
    btn.textContent = label;
    btn.disabled    = disabled;
    btn.addEventListener('click', onClick);
    this.container.appendChild(btn);
  }

  _pageRange(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4)   return [1, 2, 3, 4, 5, '…', total];
    if (current >= total - 3) return [1, '…', total-4, total-3, total-2, total-1, total];
    return [1, '…', current - 1, current, current + 1, '…', total];
  }
}

/* ─────────────────────────────────────────────
   RESULTS COUNT RENDERER
───────────────────────────────────────────── */
export class ResultsCountRenderer {
  constructor(selector, store) {
    this.el    = document.querySelector(selector);
    this.store = store;
    store.subscribe(() => this.render());
  }

  render() {
    if (!this.el) return;
    const total   = this.store.filtered.length;
    const { currentPage } = this.store;
    const start   = (currentPage - 1) * PER_PAGE + 1;
    const end     = Math.min(currentPage * PER_PAGE, total);

    if (!total) {
      this.el.innerHTML = '<strong>0</strong> items found';
      return;
    }

    this.el.innerHTML = `
      <strong>${start}–${end}</strong> of
      <strong>${total.toLocaleString()}</strong> items`;
  }
}

/* ─────────────────────────────────────────────
   LOAD MORE BUTTON CONTROLLER
───────────────────────────────────────────── */
export class LoadMoreController {
  /**
   * @param {string}             btnSelector
   * @param {MarketplaceStore}   store
   * @param {ProductRenderer}    renderer
   */
  constructor(btnSelector, store, renderer) {
    this.btn      = document.querySelector(btnSelector);
    this.store    = store;
    this.renderer = renderer;

    if (!this.btn) return;

    this.btn.addEventListener('click', async () => {
      this.btn.textContent = 'Loading…';
      this.btn.classList.add('loading');

      // Small delay for UX feel
      await new Promise(r => setTimeout(r, 500));

      const prevPage = store.currentPage;
      store.nextPage();
      const newItems = store.filtered.slice(prevPage * PER_PAGE, store.currentPage * PER_PAGE);
      this.renderer.append(newItems);

      this.btn.textContent = 'Load More';
      this.btn.classList.remove('loading');
    });

    store.subscribe(() => {
      if (this.btn) {
        this.btn.style.display = store.hasNextPage ? 'inline-flex' : 'none';
      }
    });
  }
}

/* ─────────────────────────────────────────────
   SKELETON LOADER
   Shows placeholder cards while loading
───────────────────────────────────────────── */
export function showSkeletons(container, count = 8) {
  if (!container) return;
  container.innerHTML = Array.from({ length: count }).map(() => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div style="padding:var(--space-md);">
        <div class="skeleton skeleton-text short" style="margin-bottom:8px;"></div>
        <div class="skeleton skeleton-text medium"></div>
        <div class="skeleton skeleton-text short" style="margin-top:8px;width:40%;"></div>
      </div>
    </div>`).join('');
}

/* ─────────────────────────────────────────────
   CART BADGE UPDATER (global helper)
───────────────────────────────────────────── */
export function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const cart  = JSON.parse(localStorage.getItem('cn_cart_v2') || '{"items":[]}');
  const count = (cart.items || []).reduce((s, i) => s + (i.quantity || 0), 0);
  badge.textContent = count;

  // Pop animation
  badge.classList.add('pop');
  setTimeout(() => badge.classList.remove('pop'), 300);
}

/* ─────────────────────────────────────────────
   URL PARAMS SYNC
   Read/write filter state to/from URL
───────────────────────────────────────────── */
export function readFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    category:  params.get('cat')     || 'all',
    search:    params.get('q')       || '',
    sort:      params.get('sort')    || 'newest',
    priceMin:  parseInt(params.get('min'))  || 0,
    priceMax:  parseInt(params.get('max'))  || 50000,
    rating:    parseFloat(params.get('rating')) || 0,
  };
}

export function writeFiltersToURL(filters) {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== 'all') params.set('cat', filters.category);
  if (filters.search)    params.set('q',      filters.search);
  if (filters.sort !== 'newest') params.set('sort', filters.sort);
  if (filters.priceMin)  params.set('min',    filters.priceMin);
  if (filters.priceMax < 50000)  params.set('max', filters.priceMax);
  if (filters.rating)    params.set('rating', filters.rating);

  const newUrl = params.toString()
    ? `${window.location.pathname}?${params}`
    : window.location.pathname;

  window.history.replaceState({}, '', newUrl);
}

/* ─────────────────────────────────────────────
   DEMO PRODUCTS
   Used as fallback when Firestore is unavailable
───────────────────────────────────────────── */
export const DEMO_PRODUCTS = [
  { id:'p1',  title:'Moon Phase Ceramic Mug',         seller:"Priya's Pottery",   price:1850, category:'ceramics', rating:4.9, reviews:128, tag:'Bestseller', img:'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80',  location:'india' },
  { id:'p2',  title:'Hand-forged Silver Ring',         seller:'Marco Forges',      price:4200, category:'jewelry',  rating:5.0, reviews:57,  tag:'Custom',     img:'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80',  location:'europe' },
  { id:'p3',  title:'Kente-pattern Wall Tapestry',     seller:'Amara Weaves',      price:6800, category:'textiles', rating:4.8, reviews:204, tag:'New',         img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',  location:'africa' },
  { id:'p4',  title:'Pressed Lavender Beeswax Candle', seller:"Suki's Botanicals", price:950,  category:'candles',  rating:4.9, reviews:340, tag:null,          img:'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80', location:'asia' },
  { id:'p5',  title:'Driftwood Serving Board',         seller:'Oak & Stone',       price:2200, category:'woodwork', rating:4.7, reviews:89,  tag:'Eco',         img:'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=400&q=80',  location:'americas' },
  { id:'p6',  title:'Macramé Plant Hanger Set',        seller:'Knotted & Kind',    price:1400, category:'macrame',  rating:4.8, reviews:176, tag:null,          img:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',  location:'europe' },
  { id:'p7',  title:'Hand-dyed Indigo Cushion Cover',  seller:'Amara Weaves',      price:1650, category:'textiles', rating:4.9, reviews:93,  tag:null,          img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',  location:'africa' },
  { id:'p8',  title:'Botanical Letterpress Print',     seller:'Studio Pressed',    price:1100, category:'art',      rating:4.6, reviews:61,  tag:'Sale',        img:'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&q=80',  location:'americas' },
  { id:'p9',  title:'Stoneware Espresso Set (×4)',     seller:"Priya's Pottery",   price:3200, category:'ceramics', rating:4.9, reviews:211, tag:null,          img:'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80',  location:'india' },
  { id:'p10', title:'Hammered Copper Earrings',        seller:'Marco Forges',      price:1800, category:'jewelry',  rating:4.8, reviews:142, tag:'New',         img:'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80',  location:'europe' },
  { id:'p11', title:'Hand-carved Neem Comb',           seller:'Oak & Stone',       price:450,  category:'woodwork', rating:4.7, reviews:388, tag:'Eco',         img:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',  location:'india' },
  { id:'p12', title:'Soy Wax Sandalwood Candle',       seller:"Suki's Botanicals", price:820,  category:'candles',  rating:5.0, reviews:52,  tag:null,          img:'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&q=80',  location:'asia' },
  { id:'p13', title:'Woven Jute Market Bag',           seller:'Knotted & Kind',    price:680,  category:'macrame',  rating:4.5, reviews:279, tag:'Eco',         img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',  location:'india' },
  { id:'p14', title:'Abstract Watercolour Print',      seller:'Studio Pressed',    price:1900, category:'art',      rating:4.7, reviews:37,  tag:null,          img:'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80',  location:'europe' },
  { id:'p15', title:'Leather Journal Cover (A5)',      seller:'Hide & Seek Co.',   price:2800, category:'leather',  rating:4.9, reviews:116, tag:'Custom',      img:'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80',  location:'india' },
  { id:'p16', title:'Hand-stamped Linen Tote',         seller:'Amara Weaves',      price:1250, category:'textiles', rating:4.6, reviews:88,  tag:'Sale',        img:'https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=400&q=80',  location:'africa' },
  { id:'p17', title:'Raku-fired Sake Set',             seller:"Priya's Pottery",   price:4800, category:'ceramics', rating:5.0, reviews:29,  tag:'New',         img:'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&q=80',  location:'india' },
  { id:'p18', title:'Felted Wool Coasters (Set of 6)', seller:'Knotted & Kind',    price:750,  category:'textiles', rating:4.8, reviews:193, tag:null,          img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',  location:'europe' },
  { id:'p19', title:'Carved Mango Wood Bowl',          seller:'Oak & Stone',       price:1600, category:'woodwork', rating:4.6, reviews:74,  tag:'Eco',         img:'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80',  location:'india' },
  { id:'p20', title:'Minimalist Gold Leaf Ring',       seller:'Marco Forges',      price:3500, category:'jewelry',  rating:4.9, reviews:61,  tag:null,          img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80',  location:'europe' },
  { id:'p21', title:'Linocut Bird Print',              seller:'Studio Pressed',    price:850,  category:'art',      rating:4.5, reviews:44,  tag:'Sale',        img:'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=400&q=80',  location:'americas' },
  { id:'p22', title:'Patchwork Throw Blanket',         seller:'Amara Weaves',      price:5200, category:'textiles', rating:4.9, reviews:156, tag:null,          img:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',  location:'africa' },
  { id:'p23', title:'Rose & Clary Sage Soap Bar',      seller:"Suki's Botanicals", price:380,  category:'candles',  rating:4.8, reviews:421, tag:'Bestseller',  img:'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80',  location:'asia' },
  { id:'p24', title:'Hand-tooled Leather Wallet',      seller:'Hide & Seek Co.',   price:3100, category:'leather',  rating:4.9, reviews:87,  tag:null,          img:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',  location:'india' },
];
