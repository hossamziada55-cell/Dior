function diorGetCart() {
  return JSON.parse(localStorage.getItem('diorCart') || '[]');
}

function diorSaveCart(cart) {
  localStorage.setItem('diorCart', JSON.stringify(cart));
}

function diorFormatCurrency(value) {
  return value.toLocaleString('ar-EG') + ' ج.م';
}

function diorParsePrice(text) {
  if (!text) return 0;
  const digits = text.replace(/[^\d]/g, '');
  return Number(digits) || 0;
}

function diorGetCartPath() {
  if (window.location.pathname.includes('/mans/') || window.location.pathname.includes('/womans/')) {
    return '../cart.html';
  }
  return 'cart.html';
}

function diorCreateToast() {
  if (document.getElementById('dior-cart-toast')) return;
  const toast = document.createElement('div');
  toast.id = 'dior-cart-toast';
  toast.className = 'dior-toast hidden';
  document.body.appendChild(toast);

  const style = document.createElement('style');
  style.textContent = `
    .dior-toast { position: fixed; bottom: 24px; left: auto; right: 24px; padding: 14px 20px; border-radius: 16px; background: rgba(20,20,20,0.92); color: #fff; font-weight: 600; letter-spacing: .3px; box-shadow: 0 18px 60px rgba(0,0,0,0.35); z-index: 2000; opacity: 0; transform: translateY(18px); transition: opacity .3s ease, transform .3s ease; }
    .dior-toast.show { opacity: 1; transform: translateY(0); }
    .dior-toast.hidden { display: none !important; }
    .cart-link { position: relative; display: inline-flex; align-items: center; gap: 6px; }
    .cart-icon { font-size: 1.05rem; }
    .cart-count { display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 28px; border-radius: 999px; background: #ffd700; color: #111; font-size: 0.82rem; font-weight: 700; margin-inline-start: 8px; padding: 0 10px; }
  `;
  document.head.appendChild(style);
}

function diorShowToast(message) {
  diorCreateToast();
  const toast = document.getElementById('dior-cart-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('show'), 20);
  clearTimeout(window.diorCartToastTimeout);
  window.diorCartToastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hidden');
  }, 2200);
}

function diorRenderCartLink() {
  const links = document.querySelector('.glass-nav .links');
  if (!links) return;
  const existing = links.querySelector('a[href="' + diorGetCartPath() + '"]');
  if (existing) {
    if (!existing.querySelector('.cart-count')) {
      const countElement = document.createElement('span');
      countElement.className = 'cart-count';
      countElement.textContent = '0';
      existing.appendChild(countElement);
    }
    return existing;
  }

  const cartLink = document.createElement('a');
  cartLink.href = diorGetCartPath();
  cartLink.className = 'cart-link';
  cartLink.innerHTML = '<span class="cart-icon">🛒</span> السلة <span class="cart-count">0</span>';
  links.appendChild(cartLink);
  return cartLink;
}

function diorRenderCartCount() {
  const count = diorGetCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
}

function diorCreateCartItem(card) {
  const title = card.querySelector('h4')?.textContent.trim() || '';
  const desc = card.querySelector('p')?.textContent.trim() || '';
  const priceText = card.querySelector('.price')?.textContent || '';
  const oldPriceText = card.querySelector('.original-price')?.textContent || '';
  const badge = card.querySelector('.product-badge')?.textContent.trim() || '';
  const imgEl = card.querySelector('img');
  const img = imgEl ? (imgEl.dataset.src || imgEl.src) : '';
  const path = window.location.pathname.replace(/^.*\//, '');
  const titleKey = title.replace(/\s+/g, '-').toLowerCase();
  const id = `${path}|${titleKey}`;
  return {
    id,
    title,
    desc,
    price: diorParsePrice(priceText),
    oldPrice: diorParsePrice(oldPriceText) || diorParsePrice(priceText),
    badge,
    img,
    quantity: 1,
    color: 'أسود'
  };
}

function diorHandleCartAction(button) {
  const card = button.closest('.product-card');
  if (!card) return;
  const item = diorCreateCartItem(card);
  const cart = diorGetCart();
  const existing = cart.find(cartItem => cartItem.id === item.id && cartItem.color === item.color);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push(item);
  }
  diorSaveCart(cart);
  diorRenderCartCount();
  diorShowToast('تمت إضافة المنتج إلى السلة. سهّل تسوقك الآن!');
}

function diorAttachAddToCart() {
  document.querySelectorAll('.product-card .add-to-cart').forEach(button => {
    if (button.dataset.diorAttached) return;
    button.dataset.diorAttached = 'true';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      diorHandleCartAction(button);
    });
  });
}

function diorInitCartModule() {
  diorCreateToast();
  diorRenderCartLink();
  diorRenderCartCount();
  diorAttachAddToCart();
}

document.addEventListener('DOMContentLoaded', diorInitCartModule);
