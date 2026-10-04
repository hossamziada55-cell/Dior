// Script for men's product pages — HTML holds product cards and image links.
// This file wires category highlighting, theme toggle and the quick-view modal
// behavior for static `.product-card` elements placed inside each HTML page.

document.addEventListener('DOMContentLoaded', function(){
  const cats = document.querySelectorAll('.category-bar .cat');
  const path = window.location.pathname.split('/').pop();
  const mapping = {
    'man-suits.html': 'البدل',
    'man-perfumes.html': 'البرفانات',
    'man-bags.html': 'الشنط',
    'man-shoes.html': 'الأحذية',
    'man-tshirts.html': 'التيشرتات',
    'man-pants.html': 'البناطيل'
  };

  const current = mapping[path];
  cats.forEach(c => {
    if(c.textContent.trim() === current) c.classList.add('active');
  });

  function createModal() {
    const modal = document.createElement('div');
    modal.className = 'product-modal hidden';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-panel">
        <button class="modal-close" type="button">×</button>
        <div class="modal-top">
          <span class="modal-badge"></span>
          <h3 class="modal-title"></h3>
        </div>
        <div class="modal-body">
          <div class="modal-image"><img src="" alt=""></div>
          <div class="modal-details">
            <p class="modal-desc"></p>
            <ul class="modal-features"></ul>
            <div class="modal-meta">
              <div><strong>تاريخ التصنيع:</strong> <span class="modal-manufacture"></span></div>
              <div><strong>بلد الصنع:</strong> <span class="modal-origin"></span></div>
            </div>
            <div class="modal-prices">
              <span class="modal-price"></span>
              <span class="modal-old-price"></span>
            </div>
            <button class="modal-add-to-cart add-to-cart" type="button">أضف إلى السلة</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  function openModalFromCard(card) {
    const modal = document.querySelector('.product-modal');
    if(!modal) return;

    const title = card.querySelector('h4')?.textContent || '';
    const desc = card.querySelector('p')?.textContent || '';
    const price = card.querySelector('.price')?.textContent || '';
    const oldPrice = card.querySelector('.original-price')?.textContent || '';
    const badge = card.querySelector('.product-badge')?.textContent || '';
    const cardImg = card.querySelector('img');
    const imgSrc = cardImg?.getAttribute('data-src') || cardImg?.getAttribute('src') || '';
    const manufacture = card.getAttribute('data-manufacture') || '';
    const origin = card.getAttribute('data-origin') || '';

    modal.querySelector('.modal-badge').textContent = badge;
    modal.querySelector('.modal-title').textContent = title;
    modal.querySelector('.modal-desc').textContent = desc;
    modal.querySelector('.modal-manufacture').textContent = manufacture;
    modal.querySelector('.modal-origin').textContent = origin;
    modal.querySelector('.modal-price').textContent = price;
    modal.querySelector('.modal-old-price').textContent = oldPrice;
    const imgEl = modal.querySelector('.modal-image img');
    imgEl.src = imgSrc;
    imgEl.alt = title;

    const featuresNode = card.querySelector('.product-features');
    const featuresList = modal.querySelector('.modal-features');
    if(featuresNode) {
      featuresList.innerHTML = Array.from(featuresNode.querySelectorAll('li')).map(li => `<li>${li.textContent}</li>`).join('');
    } else {
      featuresList.innerHTML = '';
    }

    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    const modal = document.querySelector('.product-modal');
    if(modal) {
      modal.classList.add('hidden');
      document.body.classList.remove('modal-open');
    }
  }

  // Theme toggle (masculine / chic)
  const pageTitle = document.querySelector('.page-title');
  if(pageTitle){
    const toolbar = document.createElement('div');
    toolbar.className = 'theme-toggle';
    toolbar.innerHTML = `<button class="theme-btn" data-theme="dark">داكن</button><button class="theme-btn" data-theme="light">فاتح</button>`;
    pageTitle.appendChild(toolbar);

    function applyTheme(theme){
      document.body.classList.remove('theme-dark','theme-light');
      document.body.classList.add('theme-' + theme);
      localStorage.setItem('menTheme', theme);
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === theme));
    }

    const saved = localStorage.getItem('menTheme') || 'dark';
    applyTheme(saved);

    toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('.theme-btn');
      if(btn) applyTheme(btn.dataset.theme);
    });
  }

  // Wire modal to static HTML product cards
  const grid = document.querySelector('.products-grid');
  const modal = createModal();
  if(grid) {
    grid.addEventListener('click', (event) => {
      const card = event.target.closest('.product-card');
      if(!card) return;
      if(event.target.closest('.add-to-cart')) return; // keep add-to-cart separate
      openModalFromCard(card);
    });

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
    modal.querySelector('.modal-add-to-cart').addEventListener('click', closeModal);
    document.addEventListener('keydown', (event) => {
      if(event.key === 'Escape') closeModal();
    });
  }
});
