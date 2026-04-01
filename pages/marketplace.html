<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Explore Handmade Goods — CraftNest</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../styles/main.css" />
  <link rel="stylesheet" href="../styles/components.css" />
  <style>
    /* ── Marketplace Layout ── */
    .marketplace-page {
      padding-top: var(--nav-h);
      min-height: 100svh;
      background: var(--cream);
    }

    /* ── Category Hero Strip ── */
    .cat-hero-strip {
      background: var(--linen);
      border-bottom: 1px solid var(--border);
      padding: var(--space-xl) 0 0;
      overflow: hidden;
    }

    .cat-hero-inner {
      max-width: var(--max-width);
      margin: 0 auto;
      padding: 0 var(--space-xl);
    }

    .cat-hero-text {
      margin-bottom: var(--space-lg);
    }

    .cat-hero-text h1 {
      font-size: clamp(1.6rem, 3vw, 2.4rem);
      margin-bottom: var(--space-xs);
    }

    .cat-hero-text p {
      font-size: 0.9rem;
      color: var(--text-muted);
      font-family: var(--font-ui);
    }

    /* Category pill tabs */
    .cat-pill-tabs {
      display: flex;
      gap: var(--space-sm);
      overflow-x: auto;
      scrollbar-width: none;
      padding-bottom: 1px;
    }

    .cat-pill-tabs::-webkit-scrollbar { display: none; }

    .cat-pill {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      padding: 0.6rem 1.1rem;
      border-radius: var(--radius-full) var(--radius-full) 0 0;
      font-family: var(--font-ui);
      font-size: 0.82rem;
      font-weight: 500;
      color: var(--text-muted);
      cursor: pointer;
      white-space: nowrap;
      border: 1px solid transparent;
      border-bottom: none;
      background: transparent;
      transition: color var(--dur-fast), background var(--dur-fast), border-color var(--dur-fast);
      position: relative;
      bottom: -1px;
    }

    .cat-pill:hover { color: var(--clay); background: rgba(196,98,45,0.04); }

    .cat-pill.active {
      color: var(--clay);
      background: var(--cream);
      border-color: var(--border);
      font-weight: 600;
    }

    .cat-pill .cat-pill-emoji { font-size: 1rem; }

    /* ── Main Layout: sidebar + grid ── */
    .marketplace-body {
      max-width: var(--max-width);
      margin: 0 auto;
      padding: var(--space-2xl) var(--space-xl);
      display: flex;
      gap: var(--space-2xl);
      align-items: flex-start;
    }

    /* ── Filter Sidebar Override ── */
    .filter-sidebar {
      background: var(--parchment);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: var(--space-xl);
    }

    /* ── Products Area ── */
    .products-area { flex: 1; min-width: 0; }

    /* Search bar in toolbar */
    .toolbar-search { flex: 1; max-width: 360px; }

    /* Grid variants */
    .products-grid.list-view {
      grid-template-columns: 1fr;
    }

    .products-grid.list-view .product-card {
      display: grid;
      grid-template-columns: 160px 1fr;
      aspect-ratio: auto;
    }

    .products-grid.list-view .product-img-wrap {
      aspect-ratio: 1;
      height: 160px;
    }

    .products-grid.list-view .product-info {
      padding: var(--space-lg);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .products-grid.list-view .product-quick-add {
      position: static;
      transform: none;
      margin-top: var(--space-md);
      border-radius: var(--radius-full);
      width: fit-content;
      padding: 0.5rem 1.25rem;
      font-size: 0.78rem;
    }

    /* No results */
    .no-results {
      grid-column: 1 / -1;
      text-align: center;
      padding: var(--space-4xl) var(--space-xl);
    }

    .no-results-icon {
      font-size: 3.5rem;
      display: block;
      margin-bottom: var(--space-lg);
      animation: floatCard 4s ease-in-out infinite;
    }

    .no-results h3 {
      font-size: 1.3rem;
      margin-bottom: var(--space-sm);
      color: var(--text-primary);
    }

    .no-results p {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-bottom: var(--space-xl);
      font-family: var(--font-ui);
    }

    /* Load more */
    .load-more-wrap {
      text-align: center;
      padding: var(--space-2xl) 0;
    }

    .btn-load-more {
      display: inline-flex;
      align-items: center;
      gap: var(--space-sm);
      background: var(--parchment);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-full);
      padding: 0.75rem 2rem;
      font-family: var(--font-ui);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      transition: border-color var(--dur-med), color var(--dur-med), transform var(--dur-fast) var(--ease-spring);
    }

    .btn-load-more:hover {
      border-color: var(--clay);
      color: var(--clay);
      transform: translateY(-2px);
    }

    .btn-load-more.loading { opacity: 0.6; pointer-events: none; }

    /* ── Mobile filter overlay backdrop ── */
    .filter-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(42,26,14,0.5);
      z-index: 1400;
      backdrop-filter: blur(4px);
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--dur-med);
    }
    .filter-backdrop.show { opacity: 1; pointer-events: auto; }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .marketplace-body { padding: var(--space-lg); }
      .filter-sidebar-wrap { display: none; } /* hidden, shown as drawer via JS */
    }

    @media (max-width: 640px) {
      .marketplace-body { padding: var(--space-md); }
      .toolbar-search { display: none; }
    }

    /* ── Product card hover badge enhancement ── */
    .product-card .product-img-wrap::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(42,26,14,0.15), transparent 60%);
      opacity: 0;
      transition: opacity var(--dur-med);
      pointer-events: none;
    }

    .product-card:hover .product-img-wrap::after { opacity: 1; }

    /* ── Skeleton grid ── */
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-lg);
    }

    @media (max-width: 1100px) { .skeleton-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px)  { .skeleton-grid { grid-template-columns: 1fr; } }

    .skeleton-card {
      background: var(--parchment);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    /* ── Filter sidebar close (mobile) ── */
    .filter-sidebar-close {
      display: none;
      width: 100%;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-xl);
      font-family: var(--font-ui);
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .filter-sidebar-close button {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: var(--sand);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      font-size: 1.1rem;
    }

    @media (max-width: 900px) {
      .filter-sidebar-close { display: flex; }
    }
  </style>
</head>
<body>

<!-- ───────────── NAVBAR ───────────── -->
<nav class="navbar scrolled" id="navbar">
  <div class="nav-inner">
    <a href="../index.html" class="nav-logo">
      <span class="logo-icon">🪡</span>
      <span class="logo-text">CraftNest</span>
    </a>
    <ul class="nav-links">
      <li><a href="marketplace.html" style="color:var(--clay)">Explore</a></li>
      <li><a href="../index.html#categories">Categories</a></li>
      <li><a href="../index.html#sellers">Artisans</a></li>
    </ul>
    <div class="nav-actions">
      <a href="cart.html" class="nav-cart-btn" aria-label="Cart">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <span class="cart-badge" id="cartBadge">0</span>
      </a>
      <a href="auth.html" class="btn-nav-login" id="navAuthBtn">Sign in</a>
      <a href="auth.html?mode=register" class="btn-nav-join" id="navJoinBtn">Join Free</a>
    </div>
    <button class="nav-hamburger" id="hamburger"><span></span><span></span><span></span></button>
  </div>
  <div class="mobile-menu" id="mobileMenu">
    <a href="marketplace.html">Explore</a>
    <a href="../index.html#categories">Categories</a>
    <a href="../index.html#sellers">Artisans</a>
    <div class="mobile-menu-divider"></div>
    <a href="auth.html">Sign in</a>
    <a href="auth.html?mode=register" class="mobile-join">Join Free</a>
  </div>
</nav>

<!-- ───────────── CATEGORY STRIP ───────────── -->
<div class="cat-hero-strip">
  <div class="cat-hero-inner">
    <div class="cat-hero-text">
      <h1 id="pageTitle">All Handmade Goods</h1>
      <p id="pageSubtitle">Discover unique pieces crafted by independent makers worldwide</p>
    </div>
    <div class="cat-pill-tabs" id="catTabs" role="tablist">
      <button class="cat-pill active" data-cat="all" role="tab">
        <span class="cat-pill-emoji">✦</span> All Items
      </button>
      <button class="cat-pill" data-cat="ceramics" role="tab">
        <span class="cat-pill-emoji">🏺</span> Ceramics
      </button>
      <button class="cat-pill" data-cat="jewelry" role="tab">
        <span class="cat-pill-emoji">💍</span> Jewelry
      </button>
      <button class="cat-pill" data-cat="textiles" role="tab">
        <span class="cat-pill-emoji">🧵</span> Textiles
      </button>
      <button class="cat-pill" data-cat="woodwork" role="tab">
        <span class="cat-pill-emoji">🪵</span> Woodwork
      </button>
      <button class="cat-pill" data-cat="candles" role="tab">
        <span class="cat-pill-emoji">🕯️</span> Candles & Soaps
      </button>
      <button class="cat-pill" data-cat="art" role="tab">
        <span class="cat-pill-emoji">🖼️</span> Art & Prints
      </button>
      <button class="cat-pill" data-cat="leather" role="tab">
        <span class="cat-pill-emoji">👜</span> Leather
      </button>
      <button class="cat-pill" data-cat="macrame" role="tab">
        <span class="cat-pill-emoji">🪢</span> Macramé
      </button>
    </div>
  </div>
</div>

<!-- ───────────── MARKETPLACE BODY ───────────── -->
<div class="marketplace-page">
  <div class="marketplace-body">

    <!-- Filter Backdrop (mobile) -->
    <div class="filter-backdrop" id="filterBackdrop"></div>

    <!-- ── FILTER SIDEBAR ── -->
    <aside class="filter-sidebar filter-sidebar-wrap" id="filterSidebar">
      <div class="filter-sidebar-close">
        <span>Filters</span>
        <button id="closeSidebar" aria-label="Close filters">✕</button>
      </div>

      <div class="filter-header">
        <h3>Filters</h3>
        <button class="filter-clear" id="clearAllFilters">Clear all</button>
      </div>

      <!-- Category -->
      <div class="filter-group" id="fgCategory">
        <button class="filter-group-title">
          Category
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="filter-group-body">
          <label class="filter-option"><input type="checkbox" value="ceramics" class="f-cat" /><span class="filter-option-label">Ceramics & Pottery</span><span class="filter-option-count">3,241</span></label>
          <label class="filter-option"><input type="checkbox" value="jewelry" class="f-cat" /><span class="filter-option-label">Jewelry</span><span class="filter-option-count">8,109</span></label>
          <label class="filter-option"><input type="checkbox" value="textiles" class="f-cat" /><span class="filter-option-label">Textiles & Weaving</span><span class="filter-option-count">5,422</span></label>
          <label class="filter-option"><input type="checkbox" value="woodwork" class="f-cat" /><span class="filter-option-label">Woodwork</span><span class="filter-option-count">2,711</span></label>
          <label class="filter-option"><input type="checkbox" value="candles" class="f-cat" /><span class="filter-option-label">Candles & Soaps</span><span class="filter-option-count">4,503</span></label>
          <label class="filter-option"><input type="checkbox" value="art" class="f-cat" /><span class="filter-option-label">Art & Prints</span><span class="filter-option-count">6,812</span></label>
          <label class="filter-option"><input type="checkbox" value="leather" class="f-cat" /><span class="filter-option-label">Leather Goods</span><span class="filter-option-count">1,834</span></label>
          <label class="filter-option"><input type="checkbox" value="macrame" class="f-cat" /><span class="filter-option-label">Macramé</span><span class="filter-option-count">2,189</span></label>
        </div>
      </div>

      <!-- Price -->
      <div class="filter-group" id="fgPrice">
        <button class="filter-group-title">
          Price Range
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="filter-group-body">
          <div class="price-range-wrap">
            <div class="price-range-inputs">
              <input class="price-input" type="number" id="priceMin" placeholder="₹0" min="0" />
              <span style="color:var(--text-muted);align-self:center;font-family:var(--font-ui);font-size:0.85rem;">to</span>
              <input class="price-input" type="number" id="priceMax" placeholder="₹50,000" min="0" />
            </div>
            <input class="range-slider" type="range" id="priceSlider" min="0" max="50000" value="50000" step="100" />
          </div>
        </div>
      </div>

      <!-- Rating -->
      <div class="filter-group" id="fgRating">
        <button class="filter-group-title">
          Minimum Rating
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="filter-group-body">
          <label class="filter-option"><input type="radio" name="rating" value="4.5" class="f-rating" /><span class="filter-option-label">★★★★★ 4.5 & up</span></label>
          <label class="filter-option"><input type="radio" name="rating" value="4.0" class="f-rating" /><span class="filter-option-label">★★★★ 4.0 & up</span></label>
          <label class="filter-option"><input type="radio" name="rating" value="3.5" class="f-rating" /><span class="filter-option-label">★★★½ 3.5 & up</span></label>
          <label class="filter-option"><input type="radio" name="rating" value="" class="f-rating" checked /><span class="filter-option-label">Any rating</span></label>
        </div>
      </div>

      <!-- Seller location -->
      <div class="filter-group" id="fgLocation">
        <button class="filter-group-title">
          Maker's Location
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="filter-group-body">
          <label class="filter-option"><input type="checkbox" value="india" class="f-loc" /><span class="filter-option-label">India</span></label>
          <label class="filter-option"><input type="checkbox" value="europe" class="f-loc" /><span class="filter-option-label">Europe</span></label>
          <label class="filter-option"><input type="checkbox" value="africa" class="f-loc" /><span class="filter-option-label">Africa</span></label>
          <label class="filter-option"><input type="checkbox" value="americas" class="f-loc" /><span class="filter-option-label">Americas</span></label>
          <label class="filter-option"><input type="checkbox" value="asia" class="f-loc" /><span class="filter-option-label">Asia Pacific</span></label>
        </div>
      </div>

      <!-- Special tags -->
      <div class="filter-group" id="fgTags">
        <button class="filter-group-title">
          Special
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="filter-group-body">
          <label class="filter-option"><input type="checkbox" value="custom" class="f-tag" /><span class="filter-option-label">Accepts Custom Orders</span></label>
          <label class="filter-option"><input type="checkbox" value="eco" class="f-tag" /><span class="filter-option-label">Eco Friendly</span></label>
          <label class="filter-option"><input type="checkbox" value="sale" class="f-tag" /><span class="filter-option-label">On Sale</span></label>
          <label class="filter-option"><input type="checkbox" value="new" class="f-tag" /><span class="filter-option-label">New Arrivals</span></label>
        </div>
      </div>

      <button class="btn-primary w-full" id="applyFiltersBtn" style="margin-top:var(--space-lg);">Apply Filters</button>
    </aside>

    <!-- ── PRODUCTS AREA ── -->
    <div class="products-area">

      <!-- Toolbar -->
      <div class="marketplace-toolbar">
        <div class="toolbar-left">
          <!-- Mobile filter toggle -->
          <button class="filter-toggle-btn" id="filterToggleBtn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            Filters
            <span class="filter-active-count" id="activeFilterCount" style="display:none">0</span>
          </button>

          <div class="search-bar toolbar-search">
            <input type="text" id="searchInput" placeholder="Search handmade goods…" autocomplete="off" />
            <span class="search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
          </div>

          <span class="results-count" id="resultsCount"><strong>89,000+</strong> items</span>
        </div>

        <div style="display:flex;align-items:center;gap:var(--space-md);">
          <select class="sort-select" id="sortSelect">
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          <div class="view-toggle">
            <button class="view-btn active" id="viewGrid" title="Grid view" aria-label="Grid view">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </button>
            <button class="view-btn" id="viewList" title="List view" aria-label="List view">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Active filter chips -->
      <div class="active-filters" id="activeFilters"></div>

      <!-- Product Grid -->
      <div class="products-grid" id="productsGrid">
        <!-- Skeleton loaders shown while loading -->
      </div>

      <!-- Load more -->
      <div class="load-more-wrap" id="loadMoreWrap" style="display:none;">
        <button class="btn-load-more" id="loadMoreBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          Load More
        </button>
      </div>

      <!-- Pagination -->
      <div class="pagination" id="pagination"></div>
    </div>

  </div>
</div>

<!-- Bottom nav (mobile) -->
<nav class="bottom-nav">
  <a href="../index.html" class="bottom-nav-item">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    Home
  </a>
  <a href="marketplace.html" class="bottom-nav-item active">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
    Explore
  </a>
  <a href="cart.html" class="bottom-nav-item">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
    Cart
  </a>
  <a href="auth.html" class="bottom-nav-item">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    Account
  </a>
</nav>

<script type="module">
  import { getProducts, watchAuth, getCurrentUserProfile, addToCart, showToast } from '../firebase-config.js';

  /* ══════════════════════════════════════════
     DEMO PRODUCT DATA (replaces Firestore in demo)
     Remove this and use getProducts() when Firebase
     is configured with real data.
  ══════════════════════════════════════════ */
  const DEMO_PRODUCTS = [
    { id:'p1',  title:'Moon Phase Ceramic Mug',         seller:'Priya\'s Pottery',    price:1850, category:'ceramics', rating:4.9, reviews:128, tag:'Bestseller', img:'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80', location:'india' },
    { id:'p2',  title:'Hand-forged Silver Ring',         seller:'Marco Forges',        price:4200, category:'jewelry',  rating:5.0, reviews:57,  tag:'Custom',     img:'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80', location:'europe' },
    { id:'p3',  title:'Kente-pattern Wall Tapestry',     seller:'Amara Weaves',        price:6800, category:'textiles', rating:4.8, reviews:204, tag:'New',         img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', location:'africa' },
    { id:'p4',  title:'Pressed Lavender Beeswax Candle', seller:'Suki\'s Botanicals',  price:950,  category:'candles',  rating:4.9, reviews:340, tag:null,          img:'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80', location:'asia' },
    { id:'p5',  title:'Driftwood Serving Board',         seller:'Oak & Stone',         price:2200, category:'woodwork', rating:4.7, reviews:89,  tag:'Eco',         img:'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=400&q=80', location:'americas' },
    { id:'p6',  title:'Macramé Plant Hanger Set',        seller:'Knotted & Kind',      price:1400, category:'macrame',  rating:4.8, reviews:176, tag:null,          img:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80', location:'europe' },
    { id:'p7',  title:'Hand-dyed Indigo Cushion Cover',  seller:'Amara Weaves',        price:1650, category:'textiles', rating:4.9, reviews:93,  tag:null,          img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80', location:'africa' },
    { id:'p8',  title:'Botanical Letterpress Print',     seller:'Studio Pressed',      price:1100, category:'art',      rating:4.6, reviews:61,  tag:'Sale',        img:'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&q=80', location:'americas' },
    { id:'p9',  title:'Stoneware Espresso Set (×4)',     seller:'Priya\'s Pottery',    price:3200, category:'ceramics', rating:4.9, reviews:211, tag:null,          img:'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80', location:'india' },
    { id:'p10', title:'Hammered Copper Earrings',        seller:'Marco Forges',        price:1800, category:'jewelry',  rating:4.8, reviews:142, tag:'New',         img:'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80', location:'europe' },
    { id:'p11', title:'Hand-carved Neem Comb',           seller:'Oak & Stone',         price:450,  category:'woodwork', rating:4.7, reviews:388, tag:'Eco',         img:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', location:'india' },
    { id:'p12', title:'Soy Wax Sandalwood Candle',       seller:'Suki\'s Botanicals',  price:820,  category:'candles',  rating:5.0, reviews:52,  tag:null,          img:'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&q=80', location:'asia' },
    { id:'p13', title:'Woven Jute Market Bag',           seller:'Knotted & Kind',      price:680,  category:'macrame',  rating:4.5, reviews:279, tag:'Eco',         img:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', location:'india' },
    { id:'p14', title:'Abstract Watercolour Print',      seller:'Studio Pressed',      price:1900, category:'art',      rating:4.7, reviews:37,  tag:null,          img:'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80', location:'europe' },
    { id:'p15', title:'Leather Journal Cover (A5)',      seller:'Hide & Seek Co.',     price:2800, category:'leather',  rating:4.9, reviews:116, tag:'Custom',      img:'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80', location:'india' },
    { id:'p16', title:'Hand-stamped Linen Tote',         seller:'Amara Weaves',        price:1250, category:'textiles', rating:4.6, reviews:88,  tag:'Sale',        img:'https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=400&q=80', location:'africa' },
    { id:'p17', title:'Raku-fired Sake Set',             seller:'Priya\'s Pottery',    price:4800, category:'ceramics', rating:5.0, reviews:29,  tag:'New',         img:'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&q=80', location:'india' },
    { id:'p18', title:'Felted Wool Coasters (Set of 6)', seller:'Knotted & Kind',      price:750,  category:'textiles', rating:4.8, reviews:193, tag:null,          img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', location:'europe' },
    { id:'p19', title:'Carved Mango Wood Bowl',          seller:'Oak & Stone',         price:1600, category:'woodwork', rating:4.6, reviews:74,  tag:'Eco',         img:'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80', location:'india' },
    { id:'p20', title:'Minimalist Gold Leaf Ring',       seller:'Marco Forges',        price:3500, category:'jewelry',  rating:4.9, reviews:61,  tag:null,          img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80', location:'europe' },
    { id:'p21', title:'Linocut Bird Print',              seller:'Studio Pressed',      price:850,  category:'art',      rating:4.5, reviews:44,  tag:'Sale',        img:'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=400&q=80', location:'americas' },
    { id:'p22', title:'Patchwork Throw Blanket',         seller:'Amara Weaves',        price:5200, category:'textiles', rating:4.9, reviews:156, tag:null,          img:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80', location:'africa' },
    { id:'p23', title:'Rose & Clary Sage Soap Bar',      seller:'Suki\'s Botanicals',  price:380,  category:'candles',  rating:4.8, reviews:421, tag:'Bestseller',  img:'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80', location:'asia' },
    { id:'p24', title:'Hand-tooled Leather Wallet',      seller:'Hide & Seek Co.',     price:3100, category:'leather',  rating:4.9, reviews:87,  tag:null,          img:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80', location:'india' },
  ];

  /* ══════════════════════════════════════════
     STATE
  ══════════════════════════════════════════ */
  let state = {
    allProducts: [...DEMO_PRODUCTS],
    filtered:    [...DEMO_PRODUCTS],
    page:        1,
    perPage:     12,
    view:        'grid',
    sort:        'newest',
    search:      '',
    filters: {
      categories: [],
      priceMax:   50000,
      priceMin:   0,
      rating:     0,
      locations:  [],
      tags:       [],
      cat:        'all', // from tab
    },
  };

  /* ══════════════════════════════════════════
     RENDER PRODUCTS
  ══════════════════════════════════════════ */
  const grid = document.getElementById('productsGrid');

  function renderProducts(products, append = false) {
    if (!append) grid.innerHTML = '';

    if (!products.length && !append) {
      grid.innerHTML = `
        <div class="no-results">
          <span class="no-results-icon">🔍</span>
          <h3>No items found</h3>
          <p>Try adjusting your filters or search term.</p>
          <button class="btn-primary" onclick="clearAllFilters()">Clear Filters</button>
        </div>`;
      document.getElementById('loadMoreWrap').style.display = 'none';
      document.getElementById('resultsCount').innerHTML = '<strong>0</strong> items';
      return;
    }

    const start = (state.page - 1) * state.perPage;
    const slice = products.slice(start, start + state.perPage);

    slice.forEach((p, i) => {
      const card = document.createElement('a');
      card.href = `product.html?id=${p.id}`;
      card.className = 'product-card reveal';
      card.style.animationDelay = `${i * 0.05}s`;
      card.innerHTML = `
        <div class="product-img-wrap">
          <img src="${p.img}" alt="${p.title}" loading="lazy" />
          ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ''}
          <button class="product-wishlist" data-id="${p.id}" onclick="event.preventDefault();toggleWishlist(this,'${p.id}')" aria-label="Add to wishlist">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button class="product-quick-add" onclick="event.preventDefault();handleAddToCart('${p.id}','${p.title}')">+ Add to Cart</button>
        </div>
        <div class="product-info">
          <span class="product-seller">${p.seller}</span>
          <h3 class="product-title">${p.title}</h3>
          <div class="product-meta">
            <span class="product-rating">★ ${p.rating} <span class="review-count">(${p.reviews})</span></span>
            <span class="product-price">₹${p.price.toLocaleString('en-IN')}</span>
          </div>
        </div>`;
      grid.appendChild(card);

      // Trigger reveal
      requestAnimationFrame(() => {
        setTimeout(() => card.classList.add('revealed'), i * 60);
      });
    });

    // Update count
    document.getElementById('resultsCount').innerHTML =
      `<strong>${products.length.toLocaleString()}</strong> items`;

    // Load more
    const hasMore = products.length > start + state.perPage;
    document.getElementById('loadMoreWrap').style.display = hasMore ? 'block' : 'none';
  }

  /* ══════════════════════════════════════════
     FILTERING & SORTING
  ══════════════════════════════════════════ */
  function applyFilters() {
    let results = [...state.allProducts];
    const f = state.filters;

    // Search
    if (state.search) {
      const q = state.search.toLowerCase();
      results = results.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.seller.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Category tab
    if (f.cat && f.cat !== 'all') {
      results = results.filter(p => p.category === f.cat);
    }

    // Category checkboxes
    if (f.categories.length) {
      results = results.filter(p => f.categories.includes(p.category));
    }

    // Price
    results = results.filter(p => p.price >= f.priceMin && p.price <= f.priceMax);

    // Rating
    if (f.rating) {
      results = results.filter(p => p.rating >= f.rating);
    }

    // Location
    if (f.locations.length) {
      results = results.filter(p => f.locations.includes(p.location));
    }

    // Tags
    if (f.tags.length) {
      results = results.filter(p => f.tags.some(t => p.tag && p.tag.toLowerCase().includes(t)));
    }

    // Sort
    const sorts = {
      newest:     (a, b) => b.id.localeCompare(a.id),
      popular:    (a, b) => b.reviews - a.reviews,
      rating:     (a, b) => b.rating - a.rating,
      price_asc:  (a, b) => a.price - b.price,
      price_desc: (a, b) => b.price - a.price,
    };
    if (sorts[state.sort]) results.sort(sorts[state.sort]);

    state.filtered = results;
    state.page = 1;
    renderProducts(results);
    updateActiveFilterChips();
    updateActiveFilterCount();
  }

  /* ══════════════════════════════════════════
     ACTIVE FILTER CHIPS
  ══════════════════════════════════════════ */
  function updateActiveFilterChips() {
    const container = document.getElementById('activeFilters');
    container.innerHTML = '';
    const f = state.filters;

    const addChip = (label, onRemove) => {
      const chip = document.createElement('div');
      chip.className = 'filter-chip';
      chip.innerHTML = `${label}<button onclick="(${onRemove.toString()})()">✕</button>`;
      container.appendChild(chip);
    };

    f.categories.forEach(c => addChip(c, () => {
      f.categories = f.categories.filter(x => x !== c);
      document.querySelector(`.f-cat[value="${c}"]`).checked = false;
      applyFilters();
    }));

    if (f.priceMax < 50000) addChip(`Under ₹${f.priceMax.toLocaleString()}`, () => {
      f.priceMax = 50000;
      document.getElementById('priceMax').value = '';
      document.getElementById('priceSlider').value = 50000;
      applyFilters();
    });

    if (f.rating) addChip(`★ ${f.rating}+`, () => {
      f.rating = 0;
      document.querySelector('.f-rating[value=""]').checked = true;
      applyFilters();
    });

    f.locations.forEach(l => addChip(l, () => {
      f.locations = f.locations.filter(x => x !== l);
      document.querySelector(`.f-loc[value="${l}"]`).checked = false;
      applyFilters();
    }));

    f.tags.forEach(t => addChip(t, () => {
      f.tags = f.tags.filter(x => x !== t);
      document.querySelector(`.f-tag[value="${t}"]`).checked = false;
      applyFilters();
    }));

    if (state.search) addChip(`"${state.search}"`, () => {
      state.search = '';
      document.getElementById('searchInput').value = '';
      applyFilters();
    });
  }

  function updateActiveFilterCount() {
    const f = state.filters;
    const count = f.categories.length + f.locations.length + f.tags.length +
      (f.rating ? 1 : 0) + (f.priceMax < 50000 ? 1 : 0) + (state.search ? 1 : 0);
    const badge = document.getElementById('activeFilterCount');
    badge.textContent = count;
    badge.style.display = count ? 'inline-flex' : 'none';
  }

  /* ══════════════════════════════════════════
     FILTER GROUP COLLAPSE
  ══════════════════════════════════════════ */
  document.querySelectorAll('.filter-group-title').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.filter-group').classList.toggle('collapsed');
    });
  });

  /* ══════════════════════════════════════════
     FILTER EVENTS
  ══════════════════════════════════════════ */
  // Category checkboxes
  document.querySelectorAll('.f-cat').forEach(cb => {
    cb.addEventListener('change', () => {
      state.filters.categories = [...document.querySelectorAll('.f-cat:checked')].map(c => c.value);
      applyFilters();
    });
  });

  // Price slider
  const slider = document.getElementById('priceSlider');
  const priceMax = document.getElementById('priceMax');
  const priceMin = document.getElementById('priceMin');

  slider.addEventListener('input', () => {
    state.filters.priceMax = parseInt(slider.value);
    priceMax.value = slider.value;
    applyFilters();
  });

  priceMax.addEventListener('change', () => {
    const v = parseInt(priceMax.value) || 50000;
    state.filters.priceMax = v;
    slider.value = Math.min(v, 50000);
    applyFilters();
  });

  priceMin.addEventListener('change', () => {
    state.filters.priceMin = parseInt(priceMin.value) || 0;
    applyFilters();
  });

  // Rating
  document.querySelectorAll('.f-rating').forEach(r => {
    r.addEventListener('change', () => {
      state.filters.rating = parseFloat(r.value) || 0;
      applyFilters();
    });
  });

  // Location
  document.querySelectorAll('.f-loc').forEach(cb => {
    cb.addEventListener('change', () => {
      state.filters.locations = [...document.querySelectorAll('.f-loc:checked')].map(c => c.value);
      applyFilters();
    });
  });

  // Tags
  document.querySelectorAll('.f-tag').forEach(cb => {
    cb.addEventListener('change', () => {
      state.filters.tags = [...document.querySelectorAll('.f-tag:checked')].map(c => c.value);
      applyFilters();
    });
  });

  // Clear all
  document.getElementById('clearAllFilters').addEventListener('click', clearAllFilters);
  function clearAllFilters() {
    state.filters = { categories:[], priceMax:50000, priceMin:0, rating:0, locations:[], tags:[], cat:'all' };
    state.search = '';
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('.f-cat, .f-loc, .f-tag').forEach(cb => cb.checked = false);
    document.querySelector('.f-rating[value=""]').checked = true;
    slider.value = 50000;
    priceMax.value = '';
    priceMin.value = '';
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.toggle('active', p.dataset.cat === 'all'));
    applyFilters();
  }
  window.clearAllFilters = clearAllFilters;

  // Apply button (mobile)
  document.getElementById('applyFiltersBtn').addEventListener('click', () => {
    closeSidebar();
    applyFilters();
  });

  /* ══════════════════════════════════════════
     CATEGORY TABS
  ══════════════════════════════════════════ */
  const catTitles = {
    all:'All Handmade Goods', ceramics:'Ceramics & Pottery', jewelry:'Jewelry',
    textiles:'Textiles & Weaving', woodwork:'Woodwork', candles:'Candles & Soaps',
    art:'Art & Prints', leather:'Leather Goods', macrame:'Macramé'
  };

  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.filters.cat = pill.dataset.cat;
      document.getElementById('pageTitle').textContent = catTitles[pill.dataset.cat] || 'All Items';
      applyFilters();
    });
  });

  // URL param: ?cat=ceramics
  const urlCat = new URLSearchParams(window.location.search).get('cat');
  if (urlCat) {
    const pill = document.querySelector(`.cat-pill[data-cat="${urlCat}"]`);
    if (pill) pill.click();
  }

  /* ══════════════════════════════════════════
     SEARCH
  ══════════════════════════════════════════ */
  let searchDebounce;
  document.getElementById('searchInput').addEventListener('input', e => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      state.search = e.target.value.trim();
      applyFilters();
    }, 300);
  });

  /* ══════════════════════════════════════════
     SORT
  ══════════════════════════════════════════ */
  document.getElementById('sortSelect').addEventListener('change', e => {
    state.sort = e.target.value;
    applyFilters();
  });

  /* ══════════════════════════════════════════
     VIEW TOGGLE
  ══════════════════════════════════════════ */
  document.getElementById('viewGrid').addEventListener('click', () => {
    state.view = 'grid';
    grid.classList.remove('list-view');
    document.getElementById('viewGrid').classList.add('active');
    document.getElementById('viewList').classList.remove('active');
  });

  document.getElementById('viewList').addEventListener('click', () => {
    state.view = 'list';
    grid.classList.add('list-view');
    document.getElementById('viewList').classList.add('active');
    document.getElementById('viewGrid').classList.remove('active');
  });

  /* ══════════════════════════════════════════
     LOAD MORE
  ══════════════════════════════════════════ */
  document.getElementById('loadMoreBtn').addEventListener('click', () => {
    state.page++;
    const btn = document.getElementById('loadMoreBtn');
    btn.classList.add('loading');
    btn.textContent = 'Loading…';
    setTimeout(() => {
      renderProducts(state.filtered, true);
      btn.classList.remove('loading');
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg> Load More`;
    }, 600);
  });

  /* ══════════════════════════════════════════
     WISHLIST
  ══════════════════════════════════════════ */
  window.toggleWishlist = async (btn, productId) => {
    btn.classList.toggle('active');
    const isActive = btn.classList.contains('active');
    try {
      const { addToWishlist, removeFromWishlist } = await import('../firebase-config.js');
      if (isActive) { await addToWishlist(productId); showToast('Added to wishlist ♥', 'success'); }
      else          { await removeFromWishlist(productId); showToast('Removed from wishlist', 'info'); }
    } catch {
      // Not logged in — store locally
      let wl = JSON.parse(localStorage.getItem('cn_wishlist') || '[]');
      if (isActive) wl = [...new Set([...wl, productId])];
      else          wl = wl.filter(id => id !== productId);
      localStorage.setItem('cn_wishlist', JSON.stringify(wl));
      if (isActive) showToast('Added to wishlist ♥', 'success');
    }
  };

  /* ══════════════════════════════════════════
     ADD TO CART — uses cn_cart_v2 (same key as cart.html)
  ══════════════════════════════════════════ */
  window.handleAddToCart = function(productId, title) {
    var data = JSON.parse(localStorage.getItem('cn_cart_v2') || '{"items":[]}');
    if (!data.items) data.items = [];
    var idx = data.items.findIndex(function(i) { return i.productId === String(productId); });
    if (idx > -1) data.items[idx].quantity++;
    else data.items.push({ productId: String(productId), quantity: 1, variant: null, addedAt: Date.now() });
    localStorage.setItem('cn_cart_v2', JSON.stringify(data));
    var count = data.items.reduce(function(s,i){ return s + i.quantity; }, 0);
    var badge = document.getElementById('cartBadge');
    if (badge) { badge.textContent = count; badge.classList.add('pop'); setTimeout(function(){ badge.classList.remove('pop'); }, 300); }
    showToast('"' + (title||'Item') + '" added to cart 🛍️', 'success');
  };

  function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cn_cart_v2') || '{"items":[]}');
    const count = cart.items.reduce((s, i) => s + i.quantity, 0);
    document.getElementById('cartBadge').textContent = count;
  }
  updateCartBadge();

  /* ══════════════════════════════════════════
     MOBILE FILTER SIDEBAR
  ══════════════════════════════════════════ */
  const sidebar  = document.getElementById('filterSidebar');
  const backdrop = document.getElementById('filterBackdrop');

  document.getElementById('filterToggleBtn').addEventListener('click', () => {
    sidebar.classList.add('open');
    backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
  });

  function closeSidebar() {
    sidebar.classList.remove('open');
    backdrop.classList.remove('show');
    document.body.style.overflow = '';
  }

  document.getElementById('closeSidebar').addEventListener('click', closeSidebar);
  backdrop.addEventListener('click', closeSidebar);

  /* ══════════════════════════════════════════
     AUTH STATE → update nav
  ══════════════════════════════════════════ */
  watchAuth(async user => {
    if (user) {
      const profile = await getCurrentUserProfile();
      const navAuth = document.getElementById('navAuthBtn');
      const navJoin = document.getElementById('navJoinBtn');
      if (navAuth) navAuth.textContent = profile?.displayName?.split(' ')[0] || 'Account';
      if (navAuth) navAuth.href = profile?.role === 'seller' ? 'seller-dashboard.html' : '#';
      if (navJoin) navJoin.style.display = 'none';
    }
  });

  /* ══════════════════════════════════════════
     NAVBAR SCROLL
  ══════════════════════════════════════════ */
  document.getElementById('hamburger').addEventListener('click', function() {
    this.classList.toggle('open');
    document.getElementById('mobileMenu').classList.toggle('open');
  });

  /* ══════════════════════════════════════════
     INITIAL RENDER
  ══════════════════════════════════════════ */
  applyFilters();
</script>

<script src="../js/cursor.js"></script>
</body>
</html>
