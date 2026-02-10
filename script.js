checkoutForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!Object.keys(state.cart).length) {
    orderStatus.textContent = 'Please add at least one item to your order.';
    return;
  }

  orderStatus.textContent = 'Submitting your order...';

  const formData = new FormData(checkoutForm);
  formData.set('order_items', getOrderSummary());
  formData.set('order_total', money(getCartTotal()));

  try {
    const response = await fetch(checkoutForm.action, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error("Formspree error:", response.status, data);
      throw new Error(data?.error || 'Order submission failed');
    }

    state.cart = {};
    save();
    checkoutForm.reset();
    renderCart();
    orderStatus.textContent = 'Order submitted! We will contact you shortly to confirm.';
  } catch (error) {
    console.error(error);
    orderStatus.textContent = 'Sorry, we could not submit your order. Please try again.';
  }
});
