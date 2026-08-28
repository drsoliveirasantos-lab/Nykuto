(() => {
  const dialog = document.querySelector('[data-request-dialog]');
  const form = document.querySelector('[data-request-form]');
  const fozNotice = document.querySelector('[data-foz-notice]');
  const phone = document.body.dataset.whatsappPhone || '33768345608';

  const marketSearch = document.querySelector('[data-market-search]');
  const marketTitle = document.querySelector('[data-market-title]');
  const marketSubcategories = document.querySelector('[data-market-subcategories]');
  const marketExamples = document.querySelector('[data-market-examples]');
  const marketAnnounce = document.querySelector('[data-market-announce]');
  const marketPreview = document.querySelector('[data-market-preview]');
  const marketCategoryButtons = [...document.querySelectorAll('[data-market-category]')];
  const toast = document.querySelector('[data-demo-toast-output]');

  const marketCategories = {
    home: {
      label: 'Casa e móveis',
      formCategory: 'Produto',
      subcategories: ['Camas e colchões', 'Sofás', 'Mesas e cadeiras', 'Eletrodomésticos'],
      examples: [
        { icon: '▤', title: 'Cama box casal', price: '1.200.000 Gs', meta: 'Bom estado · zona aproximada' },
        { icon: '▰', title: 'Sofá de 3 lugares', price: '850.000 Gs', meta: 'Usado · retirada no local' },
        { icon: '□', title: 'Mesa com 4 cadeiras', price: 'A combinar', meta: 'Como novo · entrega possível' }
      ]
    },
    phones: {
      label: 'Celulares',
      formCategory: 'Produto',
      subcategories: ['iPhone', 'Samsung', 'Outras marcas', 'Acessórios'],
      examples: [
        { icon: '▯', title: 'Smartphone 128 GB', price: 'R$ 1.850', meta: 'Como novo · com carregador' },
        { icon: '▯', title: 'Celular Samsung', price: 'R$ 980', meta: 'Bom estado · negociável' },
        { icon: '◫', title: 'Capas e acessórios', price: 'A partir de R$ 25', meta: 'Novo · envio possível' }
      ]
    },
    electronics: {
      label: 'Eletrônicos',
      formCategory: 'Produto',
      subcategories: ['TV e vídeo', 'Informática', 'Áudio', 'Games'],
      examples: [
        { icon: '▣', title: 'Smart TV 43 polegadas', price: 'R$ 1.400', meta: 'Bom estado · retirada' },
        { icon: '▱', title: 'Notebook para estudos', price: 'US$ 320', meta: 'Usado · funcionando' },
        { icon: '◉', title: 'Caixa de som portátil', price: 'R$ 210', meta: 'Como nova · envio possível' }
      ]
    },
    fashion: {
      label: 'Moda e acessórios',
      formCategory: 'Produto',
      subcategories: ['Roupas', 'Calçados', 'Relógios', 'Bolsas'],
      examples: [
        { icon: '◴', title: 'Relógio esportivo', price: 'R$ 180', meta: 'Como novo · retirada' },
        { icon: '◇', title: 'Bolsa de couro', price: 'R$ 260', meta: 'Bom estado · negociável' },
        { icon: '△', title: 'Tênis casual', price: 'R$ 150', meta: 'Pouco uso · tamanho informado' }
      ]
    },
    vehicles: {
      label: 'Veículos e peças',
      formCategory: 'Produto',
      subcategories: ['Carros', 'Motos', 'Bicicletas', 'Peças e acessórios'],
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
      subcategories: ['Ar-condicionado', 'Limpeza', 'Montagem de móveis', 'Reparos'],
      examples: [
        { icon: '✦', title: 'Reparo de ar-condicionado', price: 'Orçamento grátis', meta: 'Atendimento local · WhatsApp direto' },
        { icon: '◇', title: 'Montagem de móveis', price: 'A combinar', meta: 'CDE e região · sob consulta' },
        { icon: '◌', title: 'Limpeza residencial', price: 'Por serviço', meta: 'Agenda flexível · contato direto' }
      ]
    },
    foz: {
      label: 'Foz e fronteira',
      formCategory: 'Compra ou retirada em Foz',
      subcategories: ['Compras em Foz', 'Retiradas', 'Entregas CDE ↔ Foz', 'Documentos permitidos'],
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

  function renderMarketCategory(categoryKey) {
    const category = marketCategories[categoryKey] || marketCategories.home;
    if (!marketTitle || !marketSubcategories || !marketExamples) return;
    marketTitle.textContent = category.label;
    marketSubcategories.replaceChildren(...category.subcategories.map((subcategory) => {
      const chip = document.createElement('span');
      chip.textContent = subcategory;
      return chip;
    }));
    marketExamples.replaceChildren(...category.examples.map(createMarketExample));
    if (marketAnnounce) {
      const params = new URLSearchParams({ categoria: category.formCategory });
      marketAnnounce.href = `/anunciar/?${params.toString()}`;
    }
    marketCategoryButtons.forEach((button) => {
      const active = button.dataset.marketCategory === categoryKey;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  marketCategoryButtons.forEach((button) => {
    button.addEventListener('click', () => renderMarketCategory(button.dataset.marketCategory));
  });

  marketSearch?.addEventListener('submit', (event) => {
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
    const match = Object.entries(marketCategories).find(([, category]) => {
      const values = [category.label, ...category.subcategories, ...category.examples.map((item) => item.title)];
      return values.some((value) => normalizeSearch(value).includes(query));
    });
    if (!match) {
      showMarketMessage('Ainda não há uma categoria para essa busca. Use “Não encontrou?” para publicar seu pedido.');
      return;
    }
    renderMarketCategory(match[0]);
    marketPreview?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  if (marketTitle) renderMarketCategory('home');

  if (!dialog || !form) return;

  const categoryField = form.elements.category;

  function updateFozNotice() {
    if (!fozNotice) return;
    fozNotice.hidden = categoryField.value !== 'Compra ou retirada em Foz';
  }

  function openRequest(category = '') {
    if (category) categoryField.value = category;
    updateFozNotice();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function closeRequest() {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  document.querySelectorAll('[data-open-request]').forEach((button) => {
    button.addEventListener('click', () => openRequest(button.dataset.requestCategory || ''));
  });

  document.querySelectorAll('[data-close-request]').forEach((button) => {
    button.addEventListener('click', closeRequest);
  });

  categoryField.addEventListener('change', updateFozNotice);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeRequest();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const category = String(data.get('category') || '').trim();
    const need = String(data.get('need') || '').trim();
    const origin = String(data.get('origin') || '').trim();
    const destination = String(data.get('destination') || '').trim();
    const when = String(data.get('when') || '').trim();
    const budget = String(data.get('budget') || '').trim();
    const details = String(data.get('details') || '').trim();

    const lines = [
      'Olá! Quero cadastrar um pedido gratuito no Nykuto Local.',
      '',
      `Categoria: ${category}`,
      `Preciso de: ${need}`,
      `Local / origem: ${origin}`,
      destination ? `Destino: ${destination}` : '',
      `Quando: ${when}`,
      budget ? `Orçamento: ${budget}` : '',
      details ? `Detalhes: ${details}` : '',
      '',
      'Pode avaliar meu cadastro para a fase de lançamento? Entendo que o envio não garante publicação.'
    ].filter(Boolean);

    if (category === 'Compra ou retirada em Foz') {
      lines.push('Confirmo que se trata de produto permitido e que respeitarei as regras fiscais e aduaneiras aplicáveis.');
    }

    closeRequest();
    const message = lines.join('\n');
    if (window.NykutoWhatsApp?.open) window.NykutoWhatsApp.open(phone, message);
    else window.location.href = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get('acao') === 'preciso') {
    window.setTimeout(() => openRequest(params.get('categoria') || ''), 0);
  }
})();
