(() => {
  const marketSearch = document.querySelector('[data-market-search]');
  const marketTitle = document.querySelector('[data-market-title]');
  const marketSubcategories = document.querySelector('[data-market-subcategories]');
  const marketExamples = document.querySelector('[data-market-examples]');
  const marketAnnounce = document.querySelector('[data-market-announce]');
  const marketPreview = document.querySelector('[data-market-preview]');
  const marketNote = document.querySelector('[data-market-note]');
  const marketCategoryButtons = [...document.querySelectorAll('[data-market-category]')];
  const toast = document.querySelector('[data-demo-toast-output]');

  function requestUrl(category = '') {
    const params = new URLSearchParams({ tipo: 'pedido' });
    if (category) params.set('categoria', category);
    return `/anunciar/?${params.toString()}`;
  }

  document.querySelectorAll('[data-open-request]').forEach((button) => {
    button.addEventListener('click', () => {
      window.location.href = requestUrl(button.dataset.requestCategory || '');
    });
  });

  const initialParams = new URLSearchParams(window.location.search);
  if (initialParams.get('acao') === 'preciso') {
    window.location.replace(requestUrl(initialParams.get('categoria') || ''));
    return;
  }

  const marketCategories = {
    home: {
      label: 'Casa e móveis',
      formCategory: 'Produto',
      subcategories: ['Móveis e decoração', 'Eletrodomésticos'],
      examples: [
        { icon: '▤', title: 'Cama box casal', price: '1.200.000 Gs', meta: 'Bom estado · zona aproximada' },
        { icon: '▰', title: 'Sofá de 3 lugares', price: '850.000 Gs', meta: 'Usado · retirada no local' },
        { icon: '□', title: 'Mesa com 4 cadeiras', price: 'A combinar', meta: 'Como novo · entrega possível' }
      ]
    },
    phones: {
      label: 'Celulares',
      formCategory: 'Produto',
      subcategories: ['Celular e acessórios'],
      examples: [
        { icon: '▯', title: 'Smartphone 128 GB', price: 'R$ 1.850', meta: 'Como novo · com carregador' },
        { icon: '▯', title: 'Celular Samsung', price: 'R$ 980', meta: 'Bom estado · negociável' },
        { icon: '◫', title: 'Capas e acessórios', price: 'A partir de R$ 25', meta: 'Novo · envio possível' }
      ]
    },
    electronics: {
      label: 'Eletrônicos',
      formCategory: 'Produto',
      subcategories: ['Eletrônicos e informática'],
      examples: [
        { icon: '▣', title: 'Smart TV 43 polegadas', price: 'R$ 1.400', meta: 'Bom estado · retirada' },
        { icon: '▱', title: 'Notebook para estudos', price: 'US$ 320', meta: 'Usado · funcionando' },
        { icon: '◉', title: 'Caixa de som portátil', price: 'R$ 210', meta: 'Como nova · envio possível' }
      ]
    },
    fashion: {
      label: 'Moda e acessórios',
      formCategory: 'Produto',
      subcategories: ['Moda e acessórios'],
      examples: [
        { icon: '◴', title: 'Relógio esportivo', price: 'R$ 180', meta: 'Como novo · retirada' },
        { icon: '◇', title: 'Bolsa de couro', price: 'R$ 260', meta: 'Bom estado · negociável' },
        { icon: '△', title: 'Tênis casual', price: 'R$ 150', meta: 'Pouco uso · tamanho informado' }
      ]
    },
    vehicles: {
      label: 'Veículos e peças',
      formCategory: 'Produto',
      subcategories: ['Veículos e peças'],
      examples: [
        { icon: '◇', title: 'Bicicleta urbana', price: '1.100.000 Gs', meta: 'Bom estado · retirada' },
        { icon: '◈', title: 'Capacete para moto', price: 'R$ 220', meta: 'Como novo · tamanho informado' },
        { icon: '◎', title: 'Jogo de rodas', price: 'A combinar', meta: 'Usado · Ciudad del Este' }
      ]
    },
    freight: {
      label: 'Fretes e mudanças',
      formCategory: 'Frete ou mudança',
      subcategories: ['Pequeno frete', 'Mudança completa', 'Entrega ou retirada', 'Rota CDE ↔ Foz'],
      examples: [
        { icon: '▤', title: 'Pequeno frete local', price: 'A combinar', meta: 'CDE e região · WhatsApp direto' },
        { icon: '◇', title: 'Mudança residencial', price: 'Sob consulta', meta: 'Veículo e ajudante sob consulta' },
        { icon: '↔', title: 'Entrega CDE ↔ Foz', price: 'Taxa a combinar', meta: 'Somente itens e rotas permitidos' }
      ]
    },
    services: {
      label: 'Serviços',
      formCategory: 'Serviço local',
      subcategories: ['Climatização', 'Limpeza', 'Montagem e instalação', 'Manutenção e reparo'],
      examples: [
        { icon: '✦', title: 'Reparo de ar-condicionado', price: 'Orçamento grátis', meta: 'Atendimento local · WhatsApp direto' },
        { icon: '◇', title: 'Montagem de móveis', price: 'A combinar', meta: 'CDE e região · sob consulta' },
        { icon: '◌', title: 'Limpeza residencial', price: 'Por serviço', meta: 'Agenda flexível · contato direto' }
      ]
    },
    rides: {
      label: 'Caronas compartilhadas',
      formCategory: 'Carona compartilhada',
      subcategories: ['Ofereço carona recorrente', 'Ofereço carona ocasional', 'Procuro carona recorrente', 'Procuro carona ocasional'],
      examples: [
        { icon: '⇢', title: 'Carona até a faculdade · 6h50', price: 'Ajuda de custo R$ 5', meta: 'Trajeto aproximado · combinar na véspera' },
        { icon: '↦', title: 'CDE → Foz pela manhã', price: 'Custos compartilhados', meta: 'Ponto seguro · lugares informados' },
        { icon: '⌕', title: 'Procuro carona nos dias úteis', price: 'A combinar', meta: 'Pedido ilustrativo · WhatsApp direto' }
      ]
    },
    foz: {
      label: 'Foz e fronteira',
      formCategory: 'Compra ou retirada em Foz',
      subcategories: ['Comprar em Foz', 'Retirar uma compra', 'Entregar CDE ↔ Foz', 'Documento permitido'],
      examples: [
        { icon: '↔', title: 'Retirada de compra em Foz', price: 'Taxa a combinar', meta: 'Somente itens permitidos' },
        { icon: '▤', title: 'Entrega CDE ↔ Foz', price: 'Sob consulta', meta: 'Rota e horário combinados' },
        { icon: '□', title: 'Pequena encomenda', price: 'A combinar', meta: 'Regras aduaneiras obrigatórias' }
      ]
    }
  };

  const normalizeSearch = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
  let categoryRequest = 0;

  function showMarketMessage(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showMarketMessage.timeout);
    showMarketMessage.timeout = window.setTimeout(() => { toast.hidden = true; }, 3600);
  }

  function createMarketExample(example) {
    const article = document.createElement('article');
    const visual = document.createElement('div');
    const body = document.createElement('div');
    const badge = document.createElement('small');
    const title = document.createElement('h3');
    const price = document.createElement('strong');
    const meta = document.createElement('p');
    article.className = 'nykuto-market-example';
    visual.className = 'nykuto-market-example-visual';
    body.className = 'nykuto-market-example-body';
    visual.textContent = example.icon;
    visual.setAttribute('aria-hidden', 'true');
    badge.textContent = 'Exemplo de anúncio';
    title.textContent = example.title;
    price.textContent = example.price;
    meta.textContent = example.meta;
    body.append(badge, title, price, meta);
    article.append(visual, body);
    return article;
  }

  function listingPrice(listing) {
    if (listing.priceMode === 'free') return 'Grátis';
    if (listing.priceMode === 'quote') return 'Sob consulta';
    const symbol = ({ BRL: 'R$', PYG: 'Gs.', USD: 'US$' })[listing.currency] || listing.currency;
    const amount = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(listing.priceAmount || 0);
    return `${symbol} ${amount}${listing.priceMode === 'negotiable' ? ' · negociável' : ''}`;
  }

  function createMarketListing(listing) {
    const article = document.createElement('article');
    const link = document.createElement('a');
    const visual = document.createElement('div');
    const body = document.createElement('div');
    const badge = document.createElement('small');
    const title = document.createElement('h3');
    const price = document.createElement('strong');
    const meta = document.createElement('p');
    article.className = 'nykuto-market-example nykuto-market-real-listing';
    link.href = `/anuncio/?id=${encodeURIComponent(listing.id)}`;
    link.setAttribute('aria-label', `Abrir anúncio: ${listing.title}`);
    visual.className = 'nykuto-market-example-visual';
    body.className = 'nykuto-market-example-body';
    if (listing.media?.[0]?.url) {
      const image = document.createElement('img');
      image.src = listing.media[0].url;
      image.alt = '';
      image.loading = 'lazy';
      image.width = 640;
      image.height = 480;
      visual.append(image);
    } else {
      visual.textContent = listing.category.slice(0, 1);
      visual.setAttribute('aria-hidden', 'true');
    }
    badge.textContent = listing.kind === 'request' ? 'Pedido publicado' : 'Anúncio publicado';
    title.textContent = listing.title;
    price.textContent = listingPrice(listing);
    meta.textContent = `${listing.condition} · ${listing.zone.label}`;
    body.append(badge, title, price, meta);
    link.append(visual, body);
    article.append(link);
    return article;
  }

  async function fetchListings(params) {
    const response = await fetch(`/api/local/listings?${params.toString()}`, { headers: { Accept: 'application/json' } });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || 'Catálogo indisponível');
    return payload.listings || [];
  }

  async function renderMarketCategory(categoryKey) {
    const category = marketCategories[categoryKey] || marketCategories.home;
    if (!marketTitle || !marketSubcategories || !marketExamples) return;
    const requestId = ++categoryRequest;
    marketTitle.textContent = category.label;
    marketSubcategories.replaceChildren(...category.subcategories.map((subcategory) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.textContent = subcategory;
      chip.addEventListener('click', async () => {
        marketSubcategories.querySelectorAll('button').forEach((button) => button.classList.toggle('is-active', button === chip));
        const kind = /^Procuro\b/i.test(subcategory) ? 'request' : 'offer';
        const params = new URLSearchParams({ category: category.formCategory, section: categoryKey, subcategory, kind, limit: '12' });
        try {
          const listings = await fetchListings(params);
          marketExamples.replaceChildren(...listings.map(createMarketListing));
          marketNote.textContent = listings.length ? `${listings.length} anúncio${listings.length === 1 ? '' : 's'} nesta subcategoria.` : 'Ainda não há anúncio nesta subcategoria. Você pode publicar o primeiro gratuitamente.';
        } catch (_) {
          marketNote.textContent = 'Não foi possível atualizar esta subcategoria agora.';
        }
      });
      return chip;
    }));
    marketExamples.innerHTML = '<div class="nykuto-market-loading" aria-label="Carregando anúncios"></div><div class="nykuto-market-loading"></div><div class="nykuto-market-loading"></div>';
    if (marketNote) marketNote.textContent = 'Carregando anúncios publicados…';
    if (marketAnnounce) {
      const params = new URLSearchParams({ categoria: category.formCategory });
      marketAnnounce.href = `/anunciar/?${params.toString()}`;
    }
    marketCategoryButtons.forEach((button) => {
      const active = button.dataset.marketCategory === categoryKey;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    try {
      const params = new URLSearchParams({ category: category.formCategory, section: categoryKey, kind: 'offer', limit: '12' });
      const listings = await fetchListings(params);
      if (requestId !== categoryRequest) return;
      if (listings.length) {
        marketExamples.replaceChildren(...listings.map(createMarketListing));
        if (marketNote) marketNote.textContent = `${listings.length} anúncio${listings.length === 1 ? '' : 's'} publicado${listings.length === 1 ? '' : 's'} por pessoas da região.`;
      } else {
        marketExamples.replaceChildren(...category.examples.map(createMarketExample));
        if (marketNote) marketNote.textContent = 'Ainda não há anúncios reais nesta categoria. Estes exemplos mostram o formato; publique o primeiro gratuitamente.';
      }
    } catch (_) {
      if (requestId !== categoryRequest) return;
      marketExamples.replaceChildren(...category.examples.map(createMarketExample));
      if (marketNote) marketNote.textContent = 'O catálogo ao vivo não respondeu. Os cartões abaixo são apenas exemplos de apresentação.';
    }
  }

  marketCategoryButtons.forEach((button) => {
    button.addEventListener('click', () => renderMarketCategory(button.dataset.marketCategory));
  });

  marketSearch?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = normalizeSearch(new FormData(marketSearch).get('query')).trim();
    if (!query) {
      marketSearch.querySelector('input')?.focus();
      return;
    }
    if (['imovel', 'imoveis', 'apartamento', 'aluguel', 'kitnet'].some((term) => query.includes(term))) {
      window.location.href = '/imoveis/';
      return;
    }
    try {
      const listings = await fetchListings(new URLSearchParams({ q: query, kind: 'offer', limit: '24' }));
      marketTitle.textContent = `Resultados para “${String(new FormData(marketSearch).get('query') || '').trim()}”`;
      marketSubcategories.replaceChildren();
      marketCategoryButtons.forEach((button) => { button.classList.remove('is-active'); button.setAttribute('aria-pressed', 'false'); });
      if (listings.length) {
        marketExamples.replaceChildren(...listings.map(createMarketListing));
        marketNote.textContent = `${listings.length} resultado${listings.length === 1 ? '' : 's'} encontrado${listings.length === 1 ? '' : 's'}.`;
      } else {
        marketExamples.replaceChildren();
        marketNote.textContent = 'Nenhum anúncio encontrado. Publique o que você procura ou volte às categorias.';
        showMarketMessage('Nenhum anúncio encontrado para esta busca.');
      }
      marketPreview?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } catch (_) {
      showMarketMessage('A busca não respondeu agora. Tente novamente em alguns instantes.');
    }
  });

  if (marketTitle) renderMarketCategory('home');
})();
