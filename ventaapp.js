/* //Codex_add: Flujo de catálogo, pedido y seguimiento con datos de demostración */
(() => {
  const demo = document.querySelector('#ventaapp');
  const byId = (name) => demo.querySelector('#va-' + name);
  const products = [
    { code: 'HER-108', name: 'Llave ajustable 8 pulgadas', price: 6850, stock: 24 },
    { code: 'HER-215', name: 'Juego de puntas magnéticas', price: 4250, stock: 36 },
    { code: 'TAL-042', name: 'Broca para metal 6 mm', price: 1875, stock: 52 }
  ];
  const order = new Map();
  let nextOrder = 101;
  const money = (amount) => 'Q ' + (amount / 100).toFixed(2);
  const status = byId('status');

  function renderProducts() {
    const query = byId('search').value.trim().toLowerCase();
    const matches = products.filter(({ name, code }) => (name + ' ' + code).toLowerCase().includes(query));
    byId('products').innerHTML = matches.map(({ code, name, price, stock }) =>
      '<div class="va-item"><div><strong>' + name + '</strong><small>' + code + ' · Bodega principal · ' + stock + ' disp.</small></div><span class="va-price">' + money(price) + '</span><button type="button" data-add="' + code + '" aria-label="Agregar ' + name + '">+ Pedido</button></div>'
    ).join('') || '<p>No hay productos que coincidan con la búsqueda.</p>';
  }

  function renderOrder() {
    byId('lines').innerHTML = [...order].map(([code, qty]) => {
      const { name, stock, price } = products.find((product) => product.code === code);
      return '<div class="va-item"><div><strong>' + name + '</strong><small>' + money(price) + ' por unidad</small></div><label>Cantidad<input type="number" data-qty="' + code + '" min="1" max="' + stock + '" required value="' + qty + '"></label><button type="button" data-remove="' + code + '" aria-label="Quitar ' + name + '">Quitar</button></div>';
    }).join('') || '<p>Agrega productos desde el catálogo para iniciar el pedido.</p>';
    updateTotals();
  }

  function updateTotals() {
    const total = products.reduce((sum, { code, price }) => sum + price * (order.get(code) || 0), 0);
    byId('count').textContent = [...order.values()].reduce((sum, qty) => sum + qty, 0);
    byId('total').textContent = money(total);
    byId('save').disabled = !order.size;
  }

  function renderTracking() {
    const delivered = byId('invoice').value === 'delivered';
    byId('tracking').textContent = delivered ? 'Guía DEMO-087 · Entregada' : 'Guía DEMO-102 · En tránsito';
    byId('delivery').textContent = delivered ? 'Entregado al cliente' : 'Entrega pendiente';
  }

  demo.addEventListener('click', ({ target }) => {
    const button = target.closest('button');
    if (!button) return;
    const { panel, add, remove } = button.dataset;
    if (panel) {
      demo.querySelectorAll('[data-panel]').forEach((tab) => {
        const selected = tab === button;
        tab.setAttribute('aria-pressed', selected);
        byId(tab.dataset.panel).hidden = !selected;
      });
      status.textContent = '';
    }
    if (add) {
      const product = products.find(({ code }) => code === add);
      const qty = (order.get(add) || 0) + 1;
      if (qty > product.stock) {
        status.textContent = 'Ya agregaste toda la existencia disponible.';
        return;
      }
      order.set(add, qty);
      renderOrder();
      status.textContent = product.name + ' agregado al pedido.';
    }
    if (remove && window.confirm('¿Quitar este producto del pedido?')) {
      order.delete(remove);
      renderOrder();
      byId('lines').querySelector('button')?.focus();
    }
  });

  byId('search').addEventListener('input', renderProducts);
  byId('invoice').addEventListener('change', renderTracking);
  byId('lines').addEventListener('change', ({ target }) => {
    if (target.dataset.qty && target.validity.valid) {
      order.set(target.dataset.qty, target.valueAsNumber);
      updateTotals();
    }
  });
  byId('order').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!order.size) return;
    status.textContent = 'Pedido de prueba DEMO-' + nextOrder++ + ' · ' + byId('client').value + ' · ' + byId('payment').value + ' · ' + byId('total').textContent;
    order.clear();
    renderOrder();
  });

  renderProducts();
  renderOrder();
  renderTracking();
})();
