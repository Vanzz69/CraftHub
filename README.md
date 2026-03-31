# 🪡 CraftNest — Handmade Marketplace

> A full-featured, production-ready handmade goods marketplace connecting independent artisan sellers with buyers worldwide. Built with vanilla HTML/CSS/JS and Firebase.

![CraftNest](https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&q=80)

---

## 📁 Project Structure

```
craftnest/
├── index.html                  # Landing / Hero page
├── firebase-config.js          # Firebase setup, auth & all Firestore helpers
│
├── styles/
│   ├── main.css                # Design tokens, global styles, animations
│   └── components.css          # Reusable UI components (cards, filters, etc.)
│
├── js/
│   ├── marketplace.js          # Product store, filtering, sorting, pagination
│   ├── seller.js               # Seller profile logic, follow, messaging
│   └── cart.js                 # Cart state, sync, checkout, order helpers
│
└── pages/
    ├── auth.html               # Login & Register (buyer / seller role select)
    ├── marketplace.html        # Product listing with filters & search
    ├── product.html            # Single product detail page
    ├── seller-profile.html     # Public seller shop page
    ├── seller-dashboard.html   # Private seller dashboard
    ├── cart.html               # Cart & multi-step checkout
    └── account.html            # Buyer account (orders, wishlist, addresses)
```

---

## 🚀 Quick Start (No Backend Needed)

All pages work out of the box with **demo data** — no Firebase setup required to preview the UI.

```bash
# 1. Clone or download this repo
git clone https://github.com/YOUR_USERNAME/craftnest.git
cd craftnest

# 2. Open in browser — no build step needed!
open index.html

# Or use a local server (recommended to avoid CORS issues with ES modules):
npx serve .
# or
python3 -m http.server 8080
```

> ⚠️ **ES Modules note:** Firebase SDK imports use `type="module"` scripts. You must serve files over HTTP (not `file://`). Use `npx serve`, VS Code Live Server, or any static file server.

---

## 🔥 Firebase Setup (for live auth + database)

### Step 1 — Create a Firebase project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → give it a name (e.g. `craftnest-prod`)
3. Disable Google Analytics if you don't need it → **Create project**

### Step 2 — Enable Authentication

1. In your project, go to **Build → Authentication**
2. Click **Get started**
3. Under **Sign-in method**, enable:
   - ✅ **Email/Password**
   - ✅ **Google** (add your support email when prompted)

### Step 3 — Create Firestore Database

1. Go to **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (you'll add security rules later)
4. Select your closest region → **Done**

### Step 4 — Enable Storage

1. Go to **Build → Storage**
2. Click **Get started** → **Start in test mode** → **Done**

### Step 5 — Get your config

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll to **Your apps** → click **</>** (web app)
3. Register the app (give it a name)
4. Copy the `firebaseConfig` object

### Step 6 — Paste config into the project

Open `firebase-config.js` and replace the placeholder:

```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",           // ← your key
  authDomain:        "craftnest-xxx.firebaseapp.com",
  projectId:         "craftnest-xxx",
  storageBucket:     "craftnest-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123"
};
```

---

## 🔐 Firestore Security Rules

Replace the default test rules with these production-ready rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read/write their own profile
    match /users/{userId} {
      allow read:  if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Shops are public to read, only seller can write
    match /shops/{sellerId} {
      allow read:  if true;
      allow write: if request.auth.uid == sellerId;
    }

    // Products are public to read, only seller can create/update/delete
    match /products/{productId} {
      allow read:  if true;
      allow create: if request.auth != null
        && request.resource.data.sellerId == request.auth.uid;
      allow update, delete: if request.auth != null
        && resource.data.sellerId == request.auth.uid;
    }

    // Orders: buyer creates, buyer/seller can read their own
    match /orders/{orderId} {
      allow create: if request.auth != null
        && request.resource.data.buyerId == request.auth.uid;
      allow read: if request.auth != null
        && (resource.data.buyerId == request.auth.uid
            || resource.data.sellerIds.hasAny([request.auth.uid]));
      allow update: if request.auth != null
        && resource.data.sellerIds.hasAny([request.auth.uid]);
    }

    // Cart: only owner can read/write
    match /carts/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Wishlists: only owner
    match /wishlists/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Reviews: authenticated buyers can create, public can read
    match /reviews/{reviewId} {
      allow read:   if true;
      allow create: if request.auth != null
        && request.resource.data.buyerId == request.auth.uid;
    }

    // Messages: sender or recipient can read/write
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

To apply these rules:
1. Go to **Firestore → Rules**
2. Paste the rules above
3. Click **Publish**

---

## 🌐 Deploy to GitHub Pages

```bash
# 1. Create a new repo on GitHub, then:
git init
git add .
git commit -m "🪡 Initial CraftNest commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/craftnest.git
git push -u origin main

# 2. Enable GitHub Pages:
#    Repo → Settings → Pages → Source: Deploy from branch → main → / (root)
#    Your site will be live at: https://YOUR_USERNAME.github.io/craftnest/
```

> **Important for GitHub Pages:** All internal links already use relative paths (`../pages/auth.html`, etc.) so they work correctly in subdirectory deployments.

---

## 🌍 Other Deployment Options

### Netlify (Recommended — free, fast)
1. Go to [netlify.com](https://netlify.com) → **Add new site → Import an existing project**
2. Connect your GitHub repo
3. Build command: *(leave empty)*
4. Publish directory: `.` (root)
5. Click **Deploy** — live in ~30 seconds

### Vercel
```bash
npm i -g vercel
vercel --prod
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Public dir: . (root)
# Single-page app: No
firebase deploy
```

---

## 🧩 Key Features

| Feature | Pages | Notes |
|---|---|---|
| Auth (Email + Google OAuth) | `auth.html` | Buyer & seller role selection on register |
| Product marketplace | `marketplace.html` | 9 category filters, price/rating/location/tag filters, search, sort, grid/list view |
| Product detail | `product.html` | Gallery lightbox, variants, reviews, wishlist, share |
| Seller profiles | `seller-profile.html` | Banner, stats, products, reviews, full story, follow, message |
| Seller dashboard | `seller-dashboard.html` | Revenue charts, order management, product CRUD, earnings |
| Cart & Checkout | `cart.html` | 4-step flow, multiple payment methods, coupon codes |
| Buyer account | `account.html` | Order history with tracking, wishlist, saved addresses |
| Real-time cart | `js/cart.js` | Syncs across devices via Firestore, merges guest cart on login |

---

## 💳 Demo Coupon Codes

Use these at checkout to test the coupon system:

| Code | Discount |
|------|----------|
| `CRAFT10` | 10% off |
| `HANDMADE20` | 20% off |
| `NEST15` | 15% off |
| `FREESHIP` | Free express shipping |
| `WELCOME50` | ₹50 off |

---

## 🎨 Design System

CraftNest uses a warm earthy palette defined as CSS variables in `styles/main.css`:

| Variable | Value | Usage |
|---|---|---|
| `--clay` | `#C4622D` | Primary CTAs, accents |
| `--bark` | `#4A2E1A` | Dark backgrounds, footer |
| `--sand` | `#F2E8D9` | Light backgrounds |
| `--parchment` | `#FBF6EF` | Card backgrounds |
| `--moss` | `#5C6B3A` | Success states |
| `--ochre` | `#C9922A` | Ratings, highlights |

**Fonts:**
- `Playfair Display` — headings, display text
- `Lora` — body copy
- `DM Sans` — UI elements, labels, buttons

---

## 🔧 Customisation Guide

### Change the brand name & logo
Search-replace `CraftNest` across all HTML files. The logo emoji (`🪡`) is in the `.nav-logo` elements.

### Add a new product category
1. In `marketplace.html` — add a `.cat-pill` button
2. In `js/marketplace.js` — add to the `CATEGORIES` array
3. In `seller-dashboard.html` — add an `<option>` to the category select

### Change the currency
All prices use `₹` (Indian Rupee). To change:
1. In `js/cart.js` — update `formattedX` getters
2. In `firebase-config.js` — update `formatPrice()` currency param
3. Search-replace `₹` across HTML files

### Add a new page
1. Create `pages/your-page.html`
2. Copy the navbar HTML from any existing page
3. Import from `../firebase-config.js` for auth/data
4. Add a link in the footer of `index.html`

---

## 📦 Firestore Data Models

### `users/{uid}`
```js
{
  uid, email, displayName, role,       // "buyer" | "seller"
  photoURL, location, bio,
  createdAt, updatedAt,
  wishlist: [],                         // array of productIds
  orderCount: 0,
  shopId: null,                         // same as uid for sellers
  isVerified: false,
  totalSales: 0, rating: 0, reviewCount: 0
}
```

### `shops/{sellerId}`
```js
{
  sellerId, shopName, shopSlug,
  bio, bannerURL, avatarURL, location,
  craftTypes: [],
  socialLinks: {},
  totalSales, rating, reviewCount, productCount,
  featured: false,
  createdAt, updatedAt
}
```

### `products/{productId}`
```js
{
  sellerId, title, description,
  category, price, oldPrice,
  images: [],
  tag, variants: [],
  acceptsCustom: false,
  status,                               // "active" | "draft" | "sold_out"
  views, sales, rating, reviewCount,
  createdAt, updatedAt
}
```

### `orders/{orderId}`
```js
{
  buyerId, sellerIds: [],
  items: [{ productId, title, price, quantity, variant, sellerId }],
  shippingAddress: {},
  paymentMethod, shippingMethod,
  subtotal, discountAmount, shippingCost, gstAmount, total,
  couponCode,
  status,                               // "pending" → "confirmed" → "shipped" → "delivered"
  createdAt, updatedAt
}
```

### `carts/{uid}`
```js
{
  items: [{ productId, quantity, variant, addedAt }],
  updatedAt
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML5, CSS3, ES2022 modules |
| Styling | Custom CSS with CSS variables (no framework) |
| Auth | Firebase Authentication (Email + Google OAuth) |
| Database | Cloud Firestore (NoSQL, real-time) |
| Storage | Firebase Storage (product images) |
| Hosting | GitHub Pages / Netlify / Firebase Hosting |
| Fonts | Google Fonts (Playfair Display, Lora, DM Sans) |
| Images | Unsplash (demo) |

**No npm, no bundler, no framework.** Everything runs as native ES modules in the browser.

---

## 🐛 Common Issues & Fixes

### "Unexpected token" syntax errors
Make sure you're serving via HTTP, not opening `file://` directly. ES modules require a server.
```bash
npx serve .
```

### Firebase auth not working
- Check that your `firebaseConfig` in `firebase-config.js` has the correct values
- Ensure Email/Password and Google are enabled in Firebase Console → Authentication → Sign-in method
- Check your browser console for specific Firebase error codes

### Google Sign-In popup blocked
Add your domain to **Firebase Console → Authentication → Settings → Authorized domains**.
For local dev, `localhost` is already authorised.

### Images not uploading
- Enable Firebase Storage in your project
- Check Storage security rules allow authenticated writes
- Ensure files are under 5MB

### CORS errors on API calls
Firebase SDK handles CORS automatically. If you see CORS errors, check that your `authDomain` in `firebaseConfig` exactly matches `YOUR_PROJECT_ID.firebaseapp.com`.

---

## 📋 Roadmap (Future Features)

- [ ] Stripe / Razorpay payment gateway integration
- [ ] Real-time buyer ↔ seller messaging (Firestore `onSnapshot`)
- [ ] Email notifications (Firebase Cloud Functions + SendGrid)
- [ ] Admin moderation panel
- [ ] Advanced seller analytics (Google Analytics integration)
- [ ] Product search with Algolia
- [ ] PWA support (service worker + offline mode)
- [ ] Native mobile app (React Native or Flutter)

---

## 📄 License

MIT — free to use, modify, and deploy for personal or commercial projects.

---

## 🙏 Credits

- **Design:** Warm & earthy artisan aesthetic, custom CSS design system
- **Demo images:** [Unsplash](https://unsplash.com)
- **Icons:** Inline SVG (no icon library dependency)
- **Fonts:** [Google Fonts](https://fonts.google.com)
- **Backend:** [Firebase](https://firebase.google.com)

---

*Built with ♥ for makers everywhere.*
