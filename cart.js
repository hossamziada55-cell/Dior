function getCart() {
  return JSON.parse(localStorage.getItem('diorCart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('diorCart', JSON.stringify(cart));
}

function formatCurrency(value) {
  return value.toLocaleString('ar-EG') + ' ج.م';
}

function renderCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
}

function renderCartList() {
  const cartList = document.querySelector('.cart-list');
  const emptyMessage = document.querySelector('.cart-empty-message');
  const cart = getCart();
  cartList.innerHTML = '';

  if (!cart.length) {
    emptyMessage.classList.remove('hidden');
    document.querySelector('.checkout-panel').classList.add('hidden');
    renderCartCount();
    renderSummary();
    return;
  }

  emptyMessage.classList.add('hidden');
  document.querySelector('.checkout-panel').classList.remove('hidden');

  cart.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'cart-item';
    card.innerHTML = `
      <div class="cart-item-image"><img src="${item.img}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/120x120?text=Product'"></div>
      <div class="cart-item-info">
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
        <div class="cart-item-meta">
          <span class="cart-item-badge">${item.color || 'أسود'}</span>
          <span>${item.badge || ''}</span>
        </div>
        <div class="cart-item-meta">
          <span>سعر الوحدة: ${formatCurrency(item.price)}</span>
          ${item.oldPrice ? `<span>السعر السابق: ${formatCurrency(item.oldPrice)}</span>` : ''}
        </div>
      </div>
      <div class="cart-item-actions">
        <div class="quantity-control">
          <button type="button" data-index="${index}" class="change-qty" data-action="decrease">-</button>
          <input type="number" min="1" value="${item.quantity}" data-index="${index}" class="qty-input" />
          <button type="button" data-index="${index}" class="change-qty" data-action="increase">+</button>
        </div>
        <button type="button" class="btn-primary remove-item" data-index="${index}">حذف</button>
        <div class="color-picker">
          <label>اللون:</label>
          <select data-index="${index}" class="color-select">
            <option value="أسود" ${item.color === 'أسود' ? 'selected' : ''}>أسود</option>
            <option value="بيج" ${item.color === 'بيج' ? 'selected' : ''}>بيج</option>
            <option value="أبيض" ${item.color === 'أبيض' ? 'selected' : ''}>أبيض</option>
            <option value="ذهبي" ${item.color === 'ذهبي' ? 'selected' : ''}>ذهبي</option>
          </select>
        </div>
      </div>
    `;
    cartList.appendChild(card);
  });

  attachCartEvents();
  renderCartCount();
  renderSummary();
}

function renderSummary() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const original = cart.reduce((sum, item) => sum + (item.oldPrice || item.price) * item.quantity, 0);
  const savings = original - total;
  document.querySelector('.summary-count').textContent = cart.length;
  document.querySelector('.summary-total').textContent = formatCurrency(total);
  document.querySelector('.summary-savings').textContent = formatCurrency(savings);
}

function attachCartEvents() {
  document.querySelectorAll('.change-qty').forEach(button => {
    button.addEventListener('click', (e) => {
      const index = Number(e.target.dataset.index);
      const action = e.target.dataset.action;
      const cart = getCart();
      if (!cart[index]) return;
      cart[index].quantity = Math.max(1, cart[index].quantity + (action === 'increase' ? 1 : -1));
      saveCart(cart);
      renderCartList();
    });
  });

  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const index = Number(e.target.dataset.index);
      const value = Math.max(1, Number(e.target.value));
      const cart = getCart();
      if (!cart[index]) return;
      cart[index].quantity = value;
      saveCart(cart);
      renderCartList();
    });
  });

  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', (e) => {
      const index = Number(e.target.dataset.index);
      const cart = getCart();
      cart.splice(index, 1);
      saveCart(cart);
      renderCartList();
      showToast('تم حذف المنتج من السلة');
    });
  });

  document.querySelectorAll('.color-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const index = Number(e.target.dataset.index);
      const cart = getCart();
      if (!cart[index]) return;
      cart[index].color = e.target.value;
      saveCart(cart);
    });
  });
}

function showToast(message) {
  const toast = document.getElementById('cart-toast');
  toast.textContent = message;
  toast.classList.add('show');
  toast.classList.remove('hidden');
  setTimeout(() => { toast.classList.remove('show'); toast.classList.add('hidden'); }, 2200);
}

function attachCheckout() {
  const form = document.getElementById('checkout-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const cart = getCart();
    if (!cart.length) {
      showToast('السلة فارغة، أضف منتجاً أولاً');
      return;
    }
    const payment = form.querySelector('input[name="payment"]:checked').value;
    showToast('تم تأكيد الطلب! طريقة الدفع: ' + (payment === 'visa' ? 'فيزا' : payment === 'vodafone' ? 'فودافون كاش' : 'الدفع عند الاستلام'));
    localStorage.removeItem('diorCart');
    renderCartList();
  });
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(cartItem => cartItem.id === item.id && cartItem.color === item.color);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
  renderCartCount();
  showToast('تمت إضافة المنتج إلى السلة');
}

function exposeAddToCart() {
  window.diorAddToCart = function(product) {
    addToCart(product);
  };
}

function initCartPage() {
  renderCartCount();
  renderCartList();
  attachCheckout();
  exposeAddToCart();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCartPage);
} else {
  initCartPage();
}
