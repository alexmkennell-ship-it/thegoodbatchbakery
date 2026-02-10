let menu = [];

async function loadMenu() {
  const res = await fetch('./menu.json', { cache: 'no-store' });
  menu = await res.json();
}

const state = {
  cart: JSON.parse(localStorage.getItem('bakery-cart') || '{}'),
  reviews: JSON.parse(localStorage.getItem('bakery-reviews') || '[]')
};

const menuGrid = document.getElementById('menu-grid');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutForm = document.getElementById('checkout-form');
const orderStatus = document.getElementById('order-status');
const reviewForm = document.getElementById('review-form');
const reviewList = document.getElementById('review-list');

function money(value) {
  return `$${value.toFixed(2)}`;
}

function save() {
  localStorage.setItem('bakery-cart', JSON.stringify(state.cart));
  localStorage.setItem('bakery-reviews', JSON.stringify(state.reviews));
}

function addToCart(itemId) {
  state.cart[itemId] = (state.cart[itemId] || 0) + 1;
  save();
  renderCart();
}

function removeFromCart(itemId) {
  if (!state.cart[itemId]) return;
  state.cart[itemId] -= 1;
  if (state.cart[itemId] <= 0) delete state.cart[itemId];
  save();
  renderCart();
}

function renderMenu() {
  if (!menuGrid) return;
  menuGrid.innerHTML = '';

  for (const item of menu) {
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <img class="menu-img" src="${item.image}" alt="${item.name}" loading="lazy" />
      <div class="item-title">
        <h3>${item.name}</h3>
        <span class="price">${money(item.price)}</span>
      </div>
      <p class="muted">${item.description}</p>
      <button class="btn" data-id="${item.id}">Add to order</button>
    `;
    el.querySelector('button').addEventListener('click', () => addToCart(item.id));
    menuGrid.appendChild(el);
  }
}

function renderCart() {
  if (!cartItems || !cartTotal) return;

  const entries = Object.entries(state.cart);

  if (!entries.length) {
    cartItems.innerHTML = '<p class="muted">Your cart is empty. Add items from the menu above.</p>';
    cartTotal.textContent = 'Total: $0.00';
    return;
  }

  let total = 0;
  const fragment = document.createDocumentFragment();

  for (const [id, quantity] of entries) {
    const item = menu.find((m) => m.id === id);
    if (!item) continue;

    total += item.price * quantity;

    const row = document.createElement('div');
    row.className = 'item-title';
    row.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <small>× ${quantity}</small>
      </div>
      <div>
        <span class="price">${money(item.price * quantity)}</span>
        <button class="btn" data-remove="${item.id}" style="margin-left:8px; padding:0.3rem 0.6rem;">−</button>
      </div>
    `;

    row.querySelector('button').addEventListener('click', () => removeFromCart(item.id));
    fragment.appendChild(row);
  }

  cartItems.innerHTML = '';
  cartItems.appendChild(fragment);
  cartTotal.textContent = `Total: ${money(total)}`;
}

function getOrderSummary() {
  const entries = Object.entries(state.cart);
  return entries
    .map(([id, quantity]) => {
      const item = menu.find((m) => m.id === id);
      return item ? `${item.name} x${quantity}` : null;
    })
    .filter(Boolean)
    .join(', ');
}

function getCartTotal() {
  return Object.entries(state.cart).reduce((sum, [id, quantity]) => {
    const item = menu.find((m) => m.id === id);
    return item ? sum + item.price * quantity : sum;
  }, 0);
}

function renderReviews() {
  if (!reviewList) return;

  reviewList.innerHTML = '';
  if (!state.reviews.length) {
    reviewList.innerHTML = '<p class="muted">No reviews yet. Be the first to share feedback!</p>';
    return;
  }

  for (const review of [...state.reviews].reverse()) {
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <div class="item-title">
        <strong>${review.reviewer}</strong>
        <span>${'⭐'.repeat(review.rating)}</span>
      </div>
      <p>${review.message}</p>
      <small>${new Date(review.createdAt).toLocaleString()}</small>
    `;
    reviewList.appendChild(el);
  }
}

// ✅ Checkout submit -> Formspree
if (checkoutForm) {
  checkoutForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!Object.keys(state.cart).length) {
      if (orderStatus) orderStatus.textContent = 'Please add at least one item to your order.';
      return;
    }

    if (orderStatus) orderStatus.textContent = 'Submitting your order...';

    const formData = new FormData(checkoutForm);
    formData.set('order_items', getOrderSummary());
    formData.set('order_total', money(getCartTotal()));

    try {
      const response = await fetch(checkoutForm.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });

      const data = await response.json().catch(() => ({}));
      console.log("Formspree status:", response.status, data);

      if (!response.ok) {
        if (orderStatus) {
          orderStatus.textContent = data?.error || `Submission blocked (HTTP ${response.status}).`;
        }
        return;
      }

      // ✅ success: clear cart + save "last order" flag
      state.cart = {};
      save();
      localStorage.setItem("bakery-last-order", new Date().toISOString());

      checkoutForm.reset();
      renderCart();

      if (orderStatus) {
        orderStatus.textContent = 'Order submitted! We will contact you shortly to confirm.';
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      if (orderStatus) orderStatus.textContent = 'Network error. Please try again.';
    }
  });
}

// ✅ Review submit (local only)
if (reviewForm) {
  reviewForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(reviewForm);

    const review = {
      reviewer: String(formData.get('reviewer') || '').trim(),
      rating: Number(formData.get('rating')),
      message: String(formData.get('message') || '').trim(),
      createdAt: new Date().toISOString()
    };

    if (!review.reviewer || !review.message || !review.rating) return;

    state.reviews.push(review);
    save();
    reviewForm.reset();
    renderReviews();
  });
}

// Footer year (optional)
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Initial renders
(async function init() {
  await loadMenu();
  renderMenu();
  renderCart();
  renderReviews();
})();

// ✅ Show "order placed" message once when user returns
(function showOrderConfirmationOnReturn() {
  const last = localStorage.getItem("bakery-last-order");
  if (!last) return;

  if (orderStatus) {
    orderStatus.textContent = "✅ Your order has been placed. We’ll reach out to confirm.";
  }

  // Show it once, then clear the flag
  localStorage.removeItem("bakery-last-order");
})();

