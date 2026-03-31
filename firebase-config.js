/* ═══════════════════════════════════════════════
   CRAFTNEST — FIREBASE CONFIGURATION
   Replace the firebaseConfig object below with
   your own project credentials from:
   https://console.firebase.google.com
   ═══════════════════════════════════════════════ */

// ─── Firebase SDK imports (CDN ESM) ───────────
// These are loaded via <script type="module"> in each HTML page.
// Copy this import block to the top of any page that needs Firebase.

/*
  HOW TO USE:
  In each HTML file add this at the bottom of <body>:

  <script type="module" src="../firebase-config.js"></script>
  or
  <script type="module" src="./firebase-config.js"></script>

  Then in your page script:
  import { auth, db, storage } from './firebase-config.js';
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

/* ─────────────────────────────────────────────
   🔥 YOUR FIREBASE CONFIG
   Replace with your project's config object.
   Get it from: Firebase Console → Project Settings → General → Your apps
───────────────────────────────────────────── */
const firebaseConfig = {
  apiKey: "AIzaSyDvhwEjR7Uk9_ER1l2XfJ5f60Q8T_8XwQk",
  authDomain: "craftnest-2bf0c.firebaseapp.com",
  projectId: "craftnest-2bf0c",
  storageBucket: "craftnest-2bf0c.firebasestorage.app",
  messagingSenderId: "718058652681",
  appId: "1:718058652681:web:387f29c0f628900c8a24d8"
};

/* ─────────────────────────────────────────────
   INITIALIZE FIREBASE
───────────────────────────────────────────── */
const app     = initializeApp(firebaseConfig);
const auth    = getAuth(app);
const db      = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

/* ─────────────────────────────────────────────
   FIRESTORE COLLECTIONS — REFERENCE HELPERS
   Use these instead of hardcoding collection names
───────────────────────────────────────────── */
const Collections = {
  USERS:    "users",       // buyer & seller profiles
  PRODUCTS: "products",   // all product listings
  ORDERS:   "orders",     // placed orders
  REVIEWS:  "reviews",    // product reviews
  CARTS:    "carts",      // per-user cart (doc id = uid)
  WISHLIST: "wishlists",  // per-user wishlist
  MESSAGES: "messages",   // buyer ↔ seller messages
  SHOPS:    "shops",      // seller shop profiles
};

/* ─────────────────────────────────────────────
   AUTH HELPERS
───────────────────────────────────────────── */

/**
 * Register a new user.
 * @param {string} email
 * @param {string} password
 * @param {string} displayName
 * @param {"buyer"|"seller"} role
 * @returns {Promise<UserCredential>}
 */
async function registerUser(email, password, displayName, role = "buyer") {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });

  // Create user document in Firestore
  await setDoc(doc(db, Collections.USERS, cred.user.uid), {
    uid:         cred.user.uid,
    email,
    displayName,
    role,                        // "buyer" | "seller"
    photoURL:    "",
    location:    "",
    bio:         "",
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
    // Buyer fields
    wishlist:    [],
    orderCount:  0,
    // Seller fields (populated after onboarding)
    shopId:      role === "seller" ? cred.user.uid : null,
    isVerified:  false,
    totalSales:  0,
    rating:      0,
    reviewCount: 0,
  });

  // If seller, create their shop document
  if (role === "seller") {
    await setDoc(doc(db, Collections.SHOPS, cred.user.uid), {
      sellerId:       cred.user.uid,
      shopName:       displayName + "'s Shop",
      shopSlug:       slugify(displayName),
      bio:            "",
      bannerURL:      "",
      avatarURL:      "",
      location:       "",
      craftTypes:     [],
      socialLinks:    {},
      policies:       "",
      totalSales:     0,
      rating:         0,
      reviewCount:    0,
      productCount:   0,
      featured:       false,
      createdAt:      serverTimestamp(),
      updatedAt:      serverTimestamp(),
    });
  }

  return cred;
}

/**
 * Sign in existing user.
 */
async function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign in with Google.
 * Creates user doc if first time.
 * @param {"buyer"|"seller"} role — only used on first sign-in
 */
async function loginWithGoogle(role = "buyer") {
  const result = await signInWithPopup(auth, googleProvider);
  const user   = result.user;

  // Check if user doc already exists
  const userSnap = await getDoc(doc(db, Collections.USERS, user.uid));
  if (!userSnap.exists()) {
    await setDoc(doc(db, Collections.USERS, user.uid), {
      uid:         user.uid,
      email:       user.email,
      displayName: user.displayName,
      role,
      photoURL:    user.photoURL || "",
      location:    "",
      bio:         "",
      createdAt:   serverTimestamp(),
      updatedAt:   serverTimestamp(),
      wishlist:    [],
      orderCount:  0,
      shopId:      role === "seller" ? user.uid : null,
      isVerified:  false,
      totalSales:  0,
      rating:      0,
      reviewCount: 0,
    });

    if (role === "seller") {
      await setDoc(doc(db, Collections.SHOPS, user.uid), {
        sellerId:     user.uid,
        shopName:     (user.displayName || "My") + "'s Shop",
        shopSlug:     slugify(user.displayName || user.uid),
        bio:          "",
        bannerURL:    "",
        avatarURL:    user.photoURL || "",
        location:     "",
        craftTypes:   [],
        socialLinks:  {},
        policies:     "",
        totalSales:   0,
        rating:       0,
        reviewCount:  0,
        productCount: 0,
        featured:     false,
        createdAt:    serverTimestamp(),
        updatedAt:    serverTimestamp(),
      });
    }
  }

  return result;
}

/**
 * Sign out current user.
 */
async function logoutUser() {
  return signOut(auth);
}

/**
 * Send password reset email.
 */
async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Get current user's Firestore profile.
 */
async function getCurrentUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;
  const snap = await getDoc(doc(db, Collections.USERS, user.uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Watch auth state. Callback receives user or null.
 * @param {function} callback
 */
function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

/* ─────────────────────────────────────────────
   PRODUCT HELPERS
───────────────────────────────────────────── */

/**
 * Create a new product listing (seller only).
 * @param {object} productData
 */
async function createProduct(productData) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const docRef = await addDoc(collection(db, Collections.PRODUCTS), {
    ...productData,
    sellerId:    user.uid,
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
    views:       0,
    sales:       0,
    rating:      0,
    reviewCount: 0,
    status:      "active",   // "active" | "draft" | "sold_out" | "removed"
  });

  // Increment seller's product count
  await updateDoc(doc(db, Collections.SHOPS, user.uid), {
    productCount: increment(1),
    updatedAt:    serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Update an existing product.
 */
async function updateProduct(productId, updates) {
  await updateDoc(doc(db, Collections.PRODUCTS, productId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a product.
 */
async function deleteProduct(productId) {
  const user = auth.currentUser;
  await deleteDoc(doc(db, Collections.PRODUCTS, productId));
  await updateDoc(doc(db, Collections.SHOPS, user.uid), {
    productCount: increment(-1),
  });
}

/**
 * Fetch a single product by ID.
 */
async function getProduct(productId) {
  const snap = await getDoc(doc(db, Collections.PRODUCTS, productId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Fetch products with optional filters.
 * @param {object} filters — { category, sellerId, minPrice, maxPrice, sort, limitN }
 */
async function getProducts(filters = {}) {
  let q = collection(db, Collections.PRODUCTS);
  const constraints = [where("status", "==", "active")];

  if (filters.category)  constraints.push(where("category", "==", filters.category));
  if (filters.sellerId)  constraints.push(where("sellerId", "==", filters.sellerId));

  // Sort
  const sortMap = {
    "newest":     ["createdAt", "desc"],
    "oldest":     ["createdAt", "asc"],
    "price_asc":  ["price", "asc"],
    "price_desc": ["price", "desc"],
    "popular":    ["sales", "desc"],
    "rating":     ["rating", "desc"],
  };
  const [sortField, sortDir] = sortMap[filters.sort || "newest"];
  constraints.push(orderBy(sortField, sortDir));
  constraints.push(limit(filters.limitN || 24));

  const snap = await getDocs(query(q, ...constraints));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Increment product view count.
 */
async function trackProductView(productId) {
  await updateDoc(doc(db, Collections.PRODUCTS, productId), {
    views: increment(1),
  });
}

/* ─────────────────────────────────────────────
   SHOP / SELLER HELPERS
───────────────────────────────────────────── */

/**
 * Get a seller's shop profile by seller UID.
 */
async function getShop(sellerId) {
  const snap = await getDoc(doc(db, Collections.SHOPS, sellerId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Update seller's shop profile.
 */
async function updateShop(updates) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  await updateDoc(doc(db, Collections.SHOPS, user.uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get featured sellers.
 */
async function getFeaturedSellers(limitN = 8) {
  const q = query(
    collection(db, Collections.SHOPS),
    where("featured", "==", true),
    orderBy("rating", "desc"),
    limit(limitN)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ─────────────────────────────────────────────
   ORDER HELPERS
───────────────────────────────────────────── */

/**
 * Place an order.
 * @param {object} orderData — { items, shippingAddress, paymentMethod, ... }
 */
async function placeOrder(orderData) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const orderRef = await addDoc(collection(db, Collections.ORDERS), {
    ...orderData,
    buyerId:   user.uid,
    status:    "pending",  // pending → confirmed → shipped → delivered
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update buyer order count
  await updateDoc(doc(db, Collections.USERS, user.uid), {
    orderCount: increment(1),
  });

  // Update each product's sales count
  for (const item of orderData.items) {
    await updateDoc(doc(db, Collections.PRODUCTS, item.productId), {
      sales: increment(item.quantity),
    });
    // Update seller total sales
    await updateDoc(doc(db, Collections.SHOPS, item.sellerId), {
      totalSales: increment(item.quantity),
    });
  }

  return orderRef.id;
}

/**
 * Get orders for current buyer.
 */
async function getBuyerOrders() {
  const user = auth.currentUser;
  if (!user) return [];
  const q = query(
    collection(db, Collections.ORDERS),
    where("buyerId", "==", user.uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Get orders received by a seller (where any item.sellerId === uid).
 */
async function getSellerOrders() {
  const user = auth.currentUser;
  if (!user) return [];
  const q = query(
    collection(db, Collections.ORDERS),
    where("sellerIds", "array-contains", user.uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Update order status (seller action).
 */
async function updateOrderStatus(orderId, status) {
  await updateDoc(doc(db, Collections.ORDERS, orderId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

/* ─────────────────────────────────────────────
   CART HELPERS (Firestore-backed, syncs across devices)
───────────────────────────────────────────── */

/**
 * Get cart for current user.
 * Returns { items: [{ productId, quantity, ... }] }
 */
async function getCart() {
  const user = auth.currentUser;
  if (!user) return getLocalCart();
  const snap = await getDoc(doc(db, Collections.CARTS, user.uid));
  return snap.exists() ? snap.data() : { items: [] };
}

/**
 * Add item to cart.
 */
async function addToCart(productId, quantity = 1, variant = null) {
  const user = auth.currentUser;
  if (!user) return addToLocalCart(productId, quantity, variant);

  const cartRef = doc(db, Collections.CARTS, user.uid);
  const snap    = await getDoc(cartRef);

  if (!snap.exists()) {
    await setDoc(cartRef, {
      items: [{ productId, quantity, variant, addedAt: Date.now() }],
      updatedAt: serverTimestamp(),
    });
  } else {
    const { items } = snap.data();
    const idx = items.findIndex(i => i.productId === productId && i.variant === variant);
    if (idx > -1) {
      items[idx].quantity += quantity;
    } else {
      items.push({ productId, quantity, variant, addedAt: Date.now() });
    }
    await updateDoc(cartRef, { items, updatedAt: serverTimestamp() });
  }
}

/**
 * Remove item from cart.
 */
async function removeFromCart(productId, variant = null) {
  const user = auth.currentUser;
  if (!user) return removeFromLocalCart(productId);

  const cartRef = doc(db, Collections.CARTS, user.uid);
  const snap    = await getDoc(cartRef);
  if (!snap.exists()) return;

  const items = snap.data().items.filter(
    i => !(i.productId === productId && i.variant === variant)
  );
  await updateDoc(cartRef, { items, updatedAt: serverTimestamp() });
}

/**
 * Clear entire cart.
 */
async function clearCart() {
  const user = auth.currentUser;
  if (!user) { localStorage.removeItem("cn_cart_v2"); return; }
  await updateDoc(doc(db, Collections.CARTS, user.uid), {
    items: [],
    updatedAt: serverTimestamp(),
  });
}

// ── Local-storage cart fallback (for guests) ──
function getLocalCart() {
  return JSON.parse(localStorage.getItem("cn_cart_v2") || '{"items":[]}');
}

function addToLocalCart(productId, quantity, variant) {
  const cart = getLocalCart();
  const idx  = cart.items.findIndex(i => i.productId === productId && i.variant === variant);
  if (idx > -1) cart.items[idx].quantity += quantity;
  else          cart.items.push({ productId, quantity, variant, addedAt: Date.now() });
  localStorage.setItem("cn_cart_v2", JSON.stringify(cart));
}

function removeFromLocalCart(productId) {
  const cart  = getLocalCart();
  cart.items  = cart.items.filter(i => i.productId !== productId);
  localStorage.setItem("cn_cart_v2", JSON.stringify(cart));
}

/**
 * Merge local guest cart into Firestore cart on login.
 */
async function mergeGuestCart(uid) {
  const local = getLocalCart();
  if (!local.items.length) return;

  for (const item of local.items) {
    await addToCart(item.productId, item.quantity, item.variant);
  }
  localStorage.removeItem("cn_cart_v2");
}

/* ─────────────────────────────────────────────
   WISHLIST HELPERS
───────────────────────────────────────────── */

async function addToWishlist(productId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login to add to wishlist");
  await updateDoc(doc(db, Collections.USERS, user.uid), {
    wishlist: arrayUnion(productId),
  });
}

async function removeFromWishlist(productId) {
  const user = auth.currentUser;
  if (!user) return;
  await updateDoc(doc(db, Collections.USERS, user.uid), {
    wishlist: arrayRemove(productId),
  });
}

/* ─────────────────────────────────────────────
   REVIEW HELPERS
───────────────────────────────────────────── */

/**
 * Submit a product review.
 */
async function submitReview(productId, { rating, text, images = [] }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Login to leave a review");

  const profile = await getCurrentUserProfile();

  await addDoc(collection(db, Collections.REVIEWS), {
    productId,
    buyerId:       user.uid,
    buyerName:     profile.displayName,
    buyerPhotoURL: profile.photoURL || "",
    rating,
    text,
    images,
    helpfulCount:  0,
    createdAt:     serverTimestamp(),
  });

  // Recalculate product rating
  const q    = query(collection(db, Collections.REVIEWS), where("productId", "==", productId));
  const snap = await getDocs(q);
  const reviews = snap.docs.map(d => d.data());
  const avg  = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  await updateDoc(doc(db, Collections.PRODUCTS, productId), {
    rating:      +avg.toFixed(2),
    reviewCount: reviews.length,
  });
}

/**
 * Get reviews for a product.
 */
async function getProductReviews(productId, limitN = 20) {
  const q = query(
    collection(db, Collections.REVIEWS),
    where("productId", "==", productId),
    orderBy("createdAt", "desc"),
    limit(limitN)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ─────────────────────────────────────────────
   IMAGE UPLOAD HELPER
───────────────────────────────────────────── */

/**
 * Upload an image to Firebase Storage.
 * @param {File}     file
 * @param {string}   path  — e.g. "products/uid_timestamp.jpg"
 * @param {function} onProgress — receives 0–100
 * @returns {Promise<string>} download URL
 */
async function uploadImage(file, path, onProgress) {
  const storageRef  = ref(storage, path);
  const uploadTask  = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      snapshot => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(pct));
      },
      error => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
}

/**
 * Delete an image from Firebase Storage by its full URL.
 */
async function deleteImage(url) {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (e) {
    console.warn("Image delete failed (may not exist):", e.message);
  }
}

/* ─────────────────────────────────────────────
   UTILITY: UI HELPERS
───────────────────────────────────────────── */

/**
 * Show a toast notification.
 * @param {string} message
 * @param {"info"|"success"|"error"} type
 */
function showToast(message, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const icons = { info: "ℹ️", success: "✅", error: "❌" };
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>${icons[type]}</span> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("exit");
    toast.addEventListener("animationend", () => toast.remove());
  }, 3500);
}

/**
 * Convert a display name to a URL-safe slug.
 */
function slugify(str = "") {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Format a price number to a locale currency string.
 * @param {number} amount
 * @param {string} currency — "INR" | "USD" | "EUR" etc.
 */
function formatPrice(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style:    "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a Firestore timestamp to a readable date string.
 */
function formatDate(timestamp) {
  if (!timestamp) return "";
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Redirect to login if not authenticated, saving intended destination.
 */
function requireAuth(redirectBack = true) {
  const user = auth.currentUser;
  if (!user) {
    if (redirectBack) {
      sessionStorage.setItem("cn_redirect", window.location.href);
    }
    window.location.href = "/pages/auth.html";
    return false;
  }
  return true;
}

/**
 * Require a specific role (buyer or seller).
 */
async function requireRole(role) {
  const profile = await getCurrentUserProfile();
  if (!profile || profile.role !== role) {
    showToast(`This page is for ${role}s only.`, "error");
    window.location.href = "/index.html";
    return false;
  }
  return true;
}

/* ─────────────────────────────────────────────
   REAL-TIME LISTENERS
───────────────────────────────────────────── */

/**
 * Watch the current user's cart in real-time.
 * @param {function} callback — receives cart data
 */
function watchCart(callback) {
  const user = auth.currentUser;
  if (!user) return;
  return onSnapshot(doc(db, Collections.CARTS, user.uid), snap => {
    callback(snap.exists() ? snap.data() : { items: [] });
  });
}

/**
 * Watch a seller's orders in real-time.
 * @param {string}   sellerId
 * @param {function} callback
 */
function watchSellerOrders(sellerId, callback) {
  const q = query(
    collection(db, Collections.ORDERS),
    where("sellerIds", "array-contains", sellerId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/* ─────────────────────────────────────────────
   EXPORTS — everything pages need
───────────────────────────────────────────── */
export {
  // Core Firebase instances
  app, auth, db, storage,

  // Collections reference map
  Collections,

  // Auth
  registerUser,
  loginUser,
  loginWithGoogle,
  logoutUser,
  resetPassword,
  getCurrentUserProfile,
  watchAuth,

  // Products
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  getProducts,
  trackProductView,

  // Shops
  getShop,
  updateShop,
  getFeaturedSellers,

  // Orders
  placeOrder,
  getBuyerOrders,
  getSellerOrders,
  updateOrderStatus,

  // Cart
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  mergeGuestCart,

  // Wishlist
  addToWishlist,
  removeFromWishlist,

  // Reviews
  submitReview,
  getProductReviews,

  // Storage
  uploadImage,
  deleteImage,

  // Utils
  showToast,
  slugify,
  formatPrice,
  formatDate,
  requireAuth,
  requireRole,

  // Real-time
  watchCart,
  watchSellerOrders,
};
