const menu = [
  { id: 'sourdough', name: 'Sourdough Loaf', description: 'Naturally fermented artisan bread.', price: 7 },
  { id: 'croissant', name: 'Butter Croissant', description: 'Flaky laminated pastry.', price: 4 },
  { id: 'choc-cake', name: 'Chocolate Celebration Cake', description: 'Rich dark chocolate sponge with ganache.', price: 38 },
  { id: 'cinnamon-roll', name: 'Cinnamon Roll Box', description: 'Box of 6 frosted cinnamon rolls.', price: 18 },
  { id: 'brownie', name: 'Fudge Brownie', description: 'Dense brownie with cocoa nibs.', price: 5 }
];

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
  menuGrid.innerHTML = '';

  for (const item of menu) {
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
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

function renderReviews() {
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

checkoutForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!Object.keys(state.cart).length) {
    orderStatus.textContent = 'Please add at least one item to your order.';
    return;
  }

  const formData = new FormData(checkoutForm);
  const order = {
    customer: formData.get('name'),
    phone: formData.get('phone'),
    notes: formData.get('notes'),
    items: { ...state.cart },
    createdAt: new Date().toISOString()
  };

  const orders = JSON.parse(localStorage.getItem('bakery-orders') || '[]');
  orders.push(order);
  localStorage.setItem('bakery-orders', JSON.stringify(orders));

  state.cart = {};
  save();
  checkoutForm.reset();
  renderCart();
  orderStatus.textContent = 'Order submitted! We will contact you shortly to confirm.';
});

reviewForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(reviewForm);

  const review = {
    reviewer: String(formData.get('reviewer')).trim(),
    rating: Number(formData.get('rating')),
    message: String(formData.get('message')).trim(),
    createdAt: new Date().toISOString()
  };

  if (!review.reviewer || !review.message || !review.rating) return;

  state.reviews.push(review);
  save();
  reviewForm.reset();
  renderReviews();
});

document.getElementById('year').textContent = new Date().getFullYear();
renderMenu();
renderCart();
renderReviews();
