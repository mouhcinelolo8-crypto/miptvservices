// Main interactive logic for miptvservices (English Only, USD Only, Multi-User Connections 1-5)
document.addEventListener('DOMContentLoaded', () => {
  // State management
  let selectedConnections = 1;
  let selectedPlan = '12 Months Pass';
  let selectedPrice = '$59.99';
  let displayLimit = 36;
  let realChannelsData = [];

  // Background fetch full catalog without blocking page rendering
  function fetchChannelsCatalog() {
    if (realChannelsData.length > 0) return;
    fetch('assets/js/channels_data.json')
      .then(res => res.json())
      .then(data => {
        realChannelsData = data;
        const activeTab = document.querySelector('.channel-tab-btn.active');
        const cat = activeTab ? activeTab.getAttribute('data-cat') : 'all';
        const searchInput = document.getElementById('channel-search-input');
        renderChannels(cat, searchInput ? searchInput.value : '', true);
      })
      .catch(() => { /* Fallback to sample channels */ });
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(fetchChannelsCatalog, { timeout: 3000 });
  } else {
    setTimeout(fetchChannelsCatalog, 1500);
  }

  // Multi-User Connections Pricing Matrix (USD $)
  const connectionPrices = {
    1: { p1: '9.99',  p3: '24.99', p6: '39.99', p12: '59.99', label: '1 User / Connection' },
    2: { p1: '16.99', p3: '39.99', p6: '64.99', p12: '94.99', label: '2 Users / Connections' },
    3: { p1: '22.99', p3: '52.99', p6: '84.99', p12: '124.99', label: '3 Users / Connections' },
    4: { p1: '27.99', p3: '64.99', p6: '104.99', p12: '149.99', label: '4 Users / Connections' },
    5: { p1: '32.99', p3: '74.99', p6: '119.99', p12: '169.99', label: '5 Users / Connections' }
  };

  // Sample Channels fallback if data script isn't loaded
  const sampleFallbackChannels = [
    { n: 'Canal+ 4K UHD', g: 'France Sports & Cinema', i: '', t: 'Live TV', c: 'all sports cinema', q: '4K 60fps' },
    { n: 'BeIN Sports 1 4K', g: 'Sports Premium', i: '', t: 'Live TV', c: 'all sports', q: '4K UHD' },
    { n: 'Sky Sports Main Event', g: 'UK Sports', i: '', t: 'Live TV', c: 'all sports', q: 'FHD 60fps' },
    { n: 'TNT Sports 1 4K', g: 'UK Sports', i: '', t: 'Live TV', c: 'all sports', q: '4K UHD' },
    { n: 'DAZN 1 HD', g: 'Germany / Spain Sports', i: '', t: 'Live TV', c: 'all sports', q: 'FHD' },
    { n: 'HBO Max Cinema', g: 'Movies & Entertainment', i: '', t: 'Live TV', c: 'all cinema', q: '4K UHD' },
    { n: 'Netflix 4K Movie Releases', g: 'VOD Movies', i: '', t: 'VOD', c: 'all cinema vodMovies', q: '4K Dolby' },
    { n: 'Top Series Collection 2026', g: 'VOD TV Shows', i: '', t: 'VOD', c: 'all cinema vodSeries', q: '4K Ultra HD' },
    { n: 'Disney+ Cinema HD', g: 'Kids & Family', i: '', t: 'Live & VOD', c: 'all cinema kids', q: '4K UHD' },
    { n: 'National Geographic 4K', g: 'Documentaries', i: '', t: 'Live TV', c: 'all documentary', q: '4K UHD' },
    { n: 'Cartoon Network HD', g: 'Animation', i: '', t: 'Live TV', c: 'all kids', q: 'FHD' },
    { n: 'RMC Sport 1 4K', g: 'France Sports', i: '', t: 'Live TV', c: 'all sports', q: '4K UHD' }
  ];

  // 1. Multi-User Connection Selector Function
  function setConnections(count) {
    selectedConnections = count;
    const pData = connectionPrices[count] || connectionPrices[1];

    // Update Price Tags
    document.getElementById('price-val-1').textContent = `$${pData.p1}`;
    document.getElementById('price-val-3').textContent = `$${pData.p3}`;
    document.getElementById('price-val-6').textContent = `$${pData.p6}`;
    document.getElementById('price-val-12').textContent = `$${pData.p12}`;

    // Update Feature Connection Count text
    document.querySelectorAll('.conn-count-feature').forEach(el => {
      el.textContent = `${count} Simultaneous Connection${count > 1 ? 's' : ''} / Device${count > 1 ? 's' : ''}`;
    });

    // Update Connection Selector Buttons UI
    document.querySelectorAll('.conn-selector-btn').forEach(btn => {
      const btnCount = parseInt(btn.getAttribute('data-users'));
      if (btnCount === count) {
        btn.classList.add('bg-blue-600', 'text-white', 'border-blue-500', 'shadow-lg', 'shadow-blue-500/30');
        btn.classList.remove('bg-slate-900/80', 'text-slate-400', 'border-slate-800');
      } else {
        btn.classList.remove('bg-blue-600', 'text-white', 'border-blue-500', 'shadow-lg', 'shadow-blue-500/30');
        btn.classList.add('bg-slate-900/80', 'text-slate-400', 'border-slate-800');
      }
    });
  }

  // Connection selector button listeners
  document.querySelectorAll('.conn-selector-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const users = parseInt(btn.getAttribute('data-users'));
      setConnections(users);
    });
  });

  // 2. Channels & VOD Explorer
  function renderChannels(categoryFilter = 'all', searchQuery = '', resetLimit = true) {
    const container = document.getElementById('channels-grid');
    if (!container) return;

    if (resetLimit) displayLimit = 36;

    const dataList = (typeof realChannelsData !== 'undefined' && realChannelsData.length > 0) 
      ? realChannelsData 
      : sampleFallbackChannels;

    const query = searchQuery.toLowerCase().trim();

    const filtered = dataList.filter(item => {
      const catString = item.c || 'all';
      const matchCat = categoryFilter === 'all' || catString.includes(categoryFilter);
      const matchSearch = !query || 
        item.n.toLowerCase().includes(query) || 
        (item.g && item.g.toLowerCase().includes(query)) ||
        (item.t && item.t.toLowerCase().includes(query));
      return matchCat && matchSearch;
    });

    container.innerHTML = '';

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 text-slate-400">
          <div class="text-4xl mb-3">🔍</div>
          <p class="text-lg font-bold text-slate-200">No channels found matching "${searchQuery}"</p>
          <p class="text-xs mt-1 text-slate-500">Try searching for BeIN, Canal+, TF1, Sky, DAZN, or HBO</p>
        </div>
      `;
      return;
    }

    const headerInfo = document.createElement('div');
    headerInfo.className = 'col-span-full flex items-center justify-between text-xs text-slate-400 pb-2';
    headerInfo.innerHTML = `
      <span class="font-semibold text-blue-400">Showing ${Math.min(displayLimit, filtered.length)} of ${filtered.length.toLocaleString()} channels & VODs</span>
      <span class="text-emerald-400 flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live Package Connected</span>
    `;
    container.appendChild(headerInfo);

    const itemsToDisplay = filtered.slice(0, displayLimit);

    itemsToDisplay.forEach(ch => {
      const card = document.createElement('div');
      card.className = 'glass-panel glass-panel-hover rounded-2xl p-4 flex items-center justify-between transition-all';
      
      let imgSrc = ch.i || '';
      if (imgSrc.startsWith('http://') && window.location.protocol === 'https:') {
        imgSrc = imgSrc.replace('http://', 'https://');
      }

      const logoHtml = (imgSrc && (imgSrc.startsWith('http') || imgSrc.startsWith('assets/')))
        ? `<img src="${imgSrc}" alt="${ch.n}" class="w-10 h-10 object-contain rounded-lg bg-slate-900/50 p-0.5 border border-slate-800" onerror="this.onerror=null; this.outerHTML='<div class=\\'w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-xl shadow-inner\\'>📺</div>';">`
        : `<div class="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-xl shadow-inner">📺</div>`;

      card.innerHTML = `
        <div class="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
          ${logoHtml}
          <div class="min-w-0 flex-1">
            <h4 class="font-bold text-white text-sm truncate" title="${ch.n}">${ch.n}</h4>
            <div class="flex items-center gap-2 mt-0.5 truncate">
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold shrink-0">${ch.t || 'Live TV'}</span>
              <span class="text-[11px] text-slate-400 truncate">${ch.g || 'Package Channel'}</span>
            </div>
          </div>
        </div>
        <div class="text-right shrink-0">
          <span class="inline-block text-[10px] font-extrabold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ${ch.q || '4K UHD'}
          </span>
        </div>
      `;
      container.appendChild(card);
    });

    if (filtered.length > displayLimit) {
      const loadMoreContainer = document.createElement('div');
      loadMoreContainer.className = 'col-span-full text-center pt-4';
      const loadMoreBtn = document.createElement('button');
      loadMoreBtn.className = 'btn-neon-primary px-6 py-3 rounded-xl text-white font-bold text-xs shadow-lg';
      loadMoreBtn.textContent = `Load More Channels (${filtered.length - displayLimit} remaining)`;
      
      loadMoreBtn.addEventListener('click', () => {
        displayLimit += 36;
        renderChannels(categoryFilter, searchQuery, false);
      });

      loadMoreContainer.appendChild(loadMoreBtn);
      container.appendChild(loadMoreContainer);
    }
  }

  // Channel tab listeners
  const tabBtns = document.querySelectorAll('.channel-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active', 'bg-blue-600', 'text-white'));
      tabBtns.forEach(b => b.classList.add('text-slate-400', 'bg-slate-800/50'));
      btn.classList.add('active', 'bg-blue-600', 'text-white');
      btn.classList.remove('text-slate-400', 'bg-slate-800/50');
      
      const cat = btn.getAttribute('data-cat');
      const searchInput = document.getElementById('channel-search-input');
      renderChannels(cat, searchInput ? searchInput.value : '', true);
    });
  });

  const searchInput = document.getElementById('channel-search-input');
  if (searchInput) {
    searchInput.addEventListener('focus', fetchChannelsCatalog);
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const activeTab = document.querySelector('.channel-tab-btn.active');
        const cat = activeTab ? activeTab.getAttribute('data-cat') : 'all';
        renderChannels(cat, e.target.value, true);
      }, 150);
    });
  }

  // 3. Device Setup Tabs
  const setupTabs = document.querySelectorAll('.setup-tab-btn');
  const setupContents = document.querySelectorAll('.setup-content');

  setupTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      setupTabs.forEach(t => t.classList.remove('bg-blue-600', 'text-white', 'shadow-lg', 'shadow-blue-500/30'));
      setupTabs.forEach(t => t.classList.add('bg-slate-800/50', 'text-slate-400'));
      tab.classList.add('bg-blue-600', 'text-white', 'shadow-lg', 'shadow-blue-500/30');
      tab.classList.remove('bg-slate-800/50', 'text-slate-400');

      const target = tab.getAttribute('data-target');
      setupContents.forEach(c => {
        if (c.id === target) {
          c.classList.remove('hidden');
        } else {
          c.classList.add('hidden');
        }
      });
    });
  });

  // 4. Interactive Speed Test Simulator
  const speedSlider = document.getElementById('speed-slider');
  const speedValDisplay = document.getElementById('speed-val-display');
  const speedResDisplay = document.getElementById('speed-res-display');
  const speedRiskDisplay = document.getElementById('speed-risk-display');

  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      const speed = parseInt(e.target.value);
      if (speedValDisplay) speedValDisplay.textContent = speed;

      if (speed >= 30) {
        if (speedResDisplay) speedResDisplay.textContent = '4K Ultra HD (60fps) + HDR';
        if (speedRiskDisplay) {
          speedRiskDisplay.textContent = '0% (Optimal Smooth 4K)';
          speedRiskDisplay.className = 'font-semibold text-emerald-400';
        }
      } else if (speed >= 15) {
        if (speedResDisplay) speedResDisplay.textContent = '1080p Full HD (60fps)';
        if (speedRiskDisplay) {
          speedRiskDisplay.textContent = 'Low (1080p Smooth)';
          speedRiskDisplay.className = 'font-semibold text-blue-400';
        }
      } else {
        if (speedResDisplay) speedResDisplay.textContent = '720p HD Ready';
        if (speedRiskDisplay) {
          speedRiskDisplay.textContent = 'Moderate (720p HD recommended)';
          speedRiskDisplay.className = 'font-semibold text-amber-400';
        }
      }
    });
  }

  // 5. FAQ Accordion Toggle
  const accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      accordionItems.forEach(i => i.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });

  // 6. Direct WhatsApp Order Trigger & Modal
  const whatsappModal = document.getElementById('whatsapp-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalPlanTitle = document.getElementById('modal-plan-title');
  const modalSendBtn = document.getElementById('modal-send-whatsapp');

  window.triggerOrderWhatsApp = function(planName, priceTag) {
    selectedPlan = planName || '12 Months Pass';
    selectedPrice = priceTag || '$59.99';
    
    if (modalPlanTitle) {
      modalPlanTitle.textContent = `${selectedPlan} for ${selectedConnections} User${selectedConnections > 1 ? 's' : ''} (${selectedPrice})`;
    }
    if (whatsappModal) {
      whatsappModal.classList.remove('hidden');
      whatsappModal.classList.add('flex');
    }
  };

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (whatsappModal) {
        whatsappModal.classList.add('hidden');
        whatsappModal.classList.remove('flex');
      }
    });
  }

  if (modalSendBtn) {
    modalSendBtn.addEventListener('click', () => {
      const noteInput = document.getElementById('modal-user-note');
      const userNote = noteInput ? noteInput.value.trim() : '';

      const greeting = `Hello miptvservices! I want to subscribe to: ${selectedPlan} for ${selectedConnections} User${selectedConnections > 1 ? 's' : ''} / Connection${selectedConnections > 1 ? 's' : ''} (${selectedPrice}).`;
      
      const extra = userNote ? `%0A%0ARequest: ${encodeURIComponent(userNote)}` : '';
      const waUrl = `https://wa.me/447476941777?text=${encodeURIComponent(greeting)}${extra}`;
      
      window.open(waUrl, '_blank');
      if (whatsappModal) whatsappModal.classList.add('hidden');
    });
  }

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Initialize Connection count to 1
  setConnections(1);
  renderChannels();
});
