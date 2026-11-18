/* A local, explicitly labelled design preview. No customer requests leave this site. */
(() => {
  const db = window.__eliCatalog;
  const key = 'eli-design-cart-v1';
  const demoMessage = 'Это дизайн-копия. Отправка заявок, оплата и настоящая авторизация ещё не подключены. Данные никуда не отправлены.';
  const readCart = () => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  const saveCart = items => localStorage.setItem(key, JSON.stringify(items));
  const cart = () => {
    const items = readCart().filter(i => db.products.some(p => p.id === i.productId)).map(i => {
      const product = db.products.find(p => p.id === i.productId);
      return { ...i, product, price: Number(product.price) };
    });
    return { items, totalAmount: items.reduce((s, i) => s + i.price * i.quantity, 0) };
  };
  const fail = (config, message = demoMessage, status = 400) => {
    const error = new Error(message);
    Object.assign(error, { config, isAxiosError: true, response: { status, data: { message } } });
    throw error;
  };
  window.__eliPreviewAdapter = async config => {
    const url = new URL(config.url, location.origin);
    const path = url.pathname.replace(/^\/api/, '');
    const method = (config.method || 'get').toLowerCase();
    const params = { ...Object.fromEntries(url.searchParams), ...config.params };
    let body = {}; try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {}; } catch {}
    let data;
    if (path === '/cart' || path.startsWith('/cart/items')) {
      let items = readCart();
      if (method === 'post') {
        const product = db.products.find(p => p.id === body.productId);
        if (!product) return fail(config, 'Товар не найден.', 404);
        const quantity = Math.max(1, Math.min(99, Number(body.quantity) || 1));
        const item = items.find(i => i.productId === product.id);
        if (item) item.quantity = Math.min(99, item.quantity + quantity);
        else items.push({ id: product.id, productId: product.id, quantity });
      } else if (method === 'put') {
        const id = path.split('/').pop();
        items = items.map(i => i.id === id ? { ...i, quantity: Math.max(1, Math.min(99, Number(body.quantity) || 1)) } : i);
      } else if (method === 'delete') {
        items = path === '/cart' ? [] : items.filter(i => i.id !== path.split('/').pop());
      }
      saveCart(items); data = cart();
    } else if (method !== 'get') return fail(config);
    else if (path === '/products') {
      const editorialScore = p => (p.images.length ? 20 : 0) + (/Пихта Нордмана Премиум/.test(p.name) ? 5 : 0) - (/^тест/i.test(p.name) ? 50 : 0);
      let list = [...db.products].sort((a,b) => editorialScore(b)-editorialScore(a));
      if (params.categoryId) list = list.filter(p => p.categoryId === params.categoryId || p.category?.slug === params.categoryId);
      if (params.search) list = list.filter(p => p.name.toLowerCase().includes(String(params.search).toLowerCase()));
      if (params.sort === 'price_asc') list.sort((a,b) => a.price-b.price);
      if (params.sort === 'price_desc') list.sort((a,b) => b.price-a.price);
      if (params.sort === 'new') list.sort((a,b) => Number(b.isNew)-Number(a.isNew));
      if (params.sort === 'popularity') list.sort((a,b) => Number(b.isHit)-Number(a.isHit));
      data = params.page ? { items: list, total: list.length, page: Number(params.page), totalPages: 1, limit: list.length } : list;
    } else if (/^\/products\/[^/]+\/related$/.test(path)) {
      const product = db.products.find(p => p.id === path.split('/')[2]);
      data = db.products.filter(p => p.categoryId === product?.categoryId && p.id !== product?.id).slice(0,4);
    } else if (path.startsWith('/products/')) {
      data = db.products.find(p => p.id === path.split('/')[2]);
      if (!data) return fail(config, 'Товар не найден.', 404);
    } else if (path === '/categories') data = db.categories;
    else if (path.startsWith('/categories/')) data = db.categories.find(c => c.id === path.split('/')[2]);
    else if (path === '/sale-points') data = db.points.filter(p => !params.isActive || p.isActive !== false);
    else if (path.startsWith('/sale-points/')) data = db.points.find(p => p.id === path.split('/')[2]);
    else if (path === '/reviews/published') data = db.reviews;
    else if (path === '/wholesale/prices/public') data = db.wholesale;
    else if (path === '/auth/me' && sessionStorage.getItem('token') === 'design-preview') data = { user: JSON.parse(sessionStorage.getItem('user')), token: 'design-preview' };
    else if (path === '/orders/my' || path === '/orders/history' || path === '/partner-applications/my') data = [];
    else return fail(config, path === '/auth/me' ? 'Войдите в демо-кабинет для просмотра.' : demoMessage, 401);
    return { data, status: 200, statusText: 'OK', headers: {}, config, request: null };
  };
})();
