/* ============================================================
   AXORONIN — script.js
   Combined: config, NFT data, core UI behavior, page logic
   (home, collection, mint), and the single-page hash router.
   ============================================================ */

/* ===== config.js ===== */
/* ==========================================================================
   AXORONIN — CENTRAL CONFIGURATION
   Edit this file to update project data across the entire site.
   Anything wrapped in [BRACKETS] is a placeholder — replace with official
   information/assets when available. Nothing here is invented "official"
   data; unknowns are explicit placeholders.
   ========================================================================== */

const AXORONIN_CONFIG = {
  PROJECT_NAME: "AxoRonin",
  COMMUNITY_NAME: "The Ronin Clan",
  TAGLINE: "Honor the Code. Embrace the Chaos.",

  COLLECTION_SUPPLY: "[COLLECTION SUPPLY]",
  BLOCKCHAIN: "[BLOCKCHAIN]",
  MINT_PRICE: "[MINT PRICE]",
  MINT_URL: "https://linktr.ee/AxoRonin",
  MARKETPLACE_URL: "[MARKETPLACE URL]",
  CONTRACT_ADDRESS: "[CONTRACT ADDRESS]",
  WHITEPAPER_URL: "whitepaper.html",

  DISCORD_URL: "https://discord.gg/pBqjT6BPS",
  X_URL: "https://x.com/axoroninnft",
  X_HANDLE: "@AxoRoninNFT",

  // Web3 status flag — flip to true once wallet functionality is wired up.
  MINT_LIVE: false,

  COPYRIGHT_YEAR: 2026,
};

// Freeze so pages can't accidentally mutate shared config at runtime.
Object.freeze(AXORONIN_CONFIG);


/* ===== nft-data.js ===== */
/* Placeholder NFT metadata — no real rarity % or imagery invented.
   Swap this array for real collection metadata when available; the
   render functions in home-data.js / collection.js only expect this shape. */
const AXORONIN_NFTS = [
  { id: "0042", name: "Neon Ronin",     background: "Neo Tokyo",       armor: "Ronin",   eyes: "Neon",    accessory: "Katana" },
  { id: "0107", name: "Sakura Wanderer",background: "Sakura Night",    armor: "Samurai", eyes: "Crimson", accessory: "Mask" },
  { id: "0219", name: "Void Katana",    background: "Shadow District", armor: "Shadow",  eyes: "Void",    accessory: "Katana" },
  { id: "0334", name: "Cyber Dojo",     background: "Dojo",            armor: "Cyber",   eyes: "Laser",   accessory: "Cyber Gear" },
  { id: "0427", name: "Crimson Blade",  background: "Cyber Alley",     armor: "Crimson", eyes: "Crimson", accessory: "Katana" },
  { id: "0518", name: "Alley Ghost",    background: "Cyber Alley",     armor: "Shadow",  eyes: "Void",    accessory: "Mask" },
  { id: "0603", name: "Clan Sentinel",  background: "Dojo",            armor: "Samurai", eyes: "Neon",    accessory: "Clan Symbols" },
  { id: "0711", name: "Laser Ronin",    background: "Neo Tokyo",       armor: "Ronin",   eyes: "Laser",   accessory: "Cyber Gear" },
  { id: "0788", name: "Bloom Shadow",   background: "Sakura Night",    armor: "Shadow",  eyes: "Crimson", accessory: "Hats" },
  { id: "0842", name: "Circuit Samurai",background: "Cyber Alley",     armor: "Cyber",   eyes: "Neon",    accessory: "Katana" },
  { id: "0905", name: "Ashen Blade",    background: "Shadow District", armor: "Crimson", eyes: "Void",    accessory: "Mask" },
  { id: "0961", name: "Lotus Ronin",    background: "Dojo",            armor: "Ronin",   eyes: "Laser",   accessory: "Clan Symbols" },
];

function nftCardHTML(n){
  return `
    <article class="nft-card" tabindex="0" aria-label="${n.name}, AXO #${n.id}">
      <div class="nft-media">
        <div class="ph">[NFT IMAGE PLACEHOLDER]<br>AXO #${n.id}</div>
      </div>
      <div class="nft-info">
        <div class="id">AXO #${n.id}</div>
        <h4>${n.name}</h4>
        <div class="nft-traits">
          <span class="trait-chip">${n.background}</span>
          <span class="trait-chip">${n.armor}</span>
          <span class="trait-chip">${n.eyes}</span>
          <span class="trait-chip">${n.accessory}</span>
        </div>
      </div>
    </article>`;
}


/* ===== main.js (theme, loader, cursor, reveals, FAQ, trait tabs, sakura) ===== */
(function(){
  "use strict";
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- THEME ---------------- */
  const THEME_KEY = 'axoronin-theme';
  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    const icon = theme === 'light' ? '☀️' : '🌙';
    document.querySelectorAll('#themeToggle, #mobileThemeIcon').forEach(el=>{
      if(el.id === 'mobileThemeIcon') el.textContent = icon; else el.textContent = icon;
    });
  }
  function initTheme(){
    const saved = localStorage.getItem(THEME_KEY);
    if(saved){ applyTheme(saved); }
    else{
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      applyTheme(prefersLight ? 'light' : 'dark');
    }
  }
  function toggleTheme(){
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  }
  initTheme();

  /* ---------------- LOADER ---------------- */
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if(!loader) return;
    const delay = reducedMotion ? 200 : 900;
    setTimeout(()=> loader.classList.add('hide'), delay);
  });

  /* ---------------- NAV WIRING (nav is static markup, runs immediately) ---------------- */
  function initNav(){
    applyTheme(document.documentElement.getAttribute('data-theme') || 'dark');

    const navbar = document.getElementById('navbar');
    const onScroll = () => {
      if(!navbar) return;
      navbar.classList.toggle('scrolled', window.scrollY > 30);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive:true });

    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    document.getElementById('mobileThemeToggle')?.addEventListener('click', toggleTheme);

    const hamburger = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeBtn = document.getElementById('mobileMenuClose');

    function openMenu(){
      mobileMenu.classList.add('open');
      document.body.classList.add('no-scroll');
      hamburger.textContent = '✕';
      hamburger.setAttribute('aria-expanded','true');
    }
    function closeMenu(){
      mobileMenu.classList.remove('open');
      document.body.classList.remove('no-scroll');
      hamburger.textContent = '☰';
      hamburger.setAttribute('aria-expanded','false');
    }
    hamburger?.addEventListener('click', () => {
      mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
    });
    closeBtn?.addEventListener('click', closeMenu);
    mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    window.addEventListener('keydown', e => { if(e.key === 'Escape') closeMenu(); });
  }
  initNav();

  /* ---------------- CUSTOM CURSOR (desktop only) ---------------- */
  if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    const dot = document.createElement('div'); dot.className = 'cursor-dot';
    const ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.append(dot, ring);
    let rx=0, ry=0, mx=0, my=0;
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx+'px'; dot.style.top = my+'px';
      const target = e.target.closest('a,button,.nft-card,.feature-card');
      ring.classList.toggle('active', !!target);
    });
    (function loop(){
      rx += (mx-rx)*0.18; ry += (my-ry)*0.18;
      ring.style.left = rx+'px'; ring.style.top = ry+'px';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------- SCROLL REVEALS ---------------- */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en => { if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  const phaseIo = new IntersectionObserver((entries)=>{
    entries.forEach(en => { if(en.isIntersecting){ en.target.classList.add('in-view'); } });
  }, { threshold: 0.3 });
  document.querySelectorAll('.phase').forEach(el => phaseIo.observe(el));

  /* ---------------- FAQ ACCORDION ---------------- */
  function bindFaq(){
    document.querySelectorAll('.faq-item').forEach(item => {
      if(item.dataset.bound) return;
      item.dataset.bound = '1';
      const q = item.querySelector('.faq-q');
      const a = item.querySelector('.faq-a');
      q?.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(other => {
          if(other !== item){ other.classList.remove('open'); other.querySelector('.faq-a').style.maxHeight = null; }
        });
        item.classList.toggle('open', !isOpen);
        a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : null;
        q.setAttribute('aria-expanded', String(!isOpen));
      });
    });
  }
  window.AXORONIN_bindFaq = bindFaq;
  bindFaq();

  /* ---------------- TRAIT TABS (traits section) ---------------- */
  document.querySelectorAll('[data-trait-tabs]').forEach(wrap => {
    const tabs = wrap.querySelectorAll('.trait-tab');
    const panels = wrap.querySelectorAll('[data-trait-panel]');
    tabs.forEach(tab => tab.addEventListener('click', () => {
      tabs.forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const key = tab.dataset.tab;
      panels.forEach(p => p.style.display = (p.dataset.traitPanel === key) ? 'grid' : 'none');
    }));
  });

  /* ---------------- SAKURA PARTICLES ---------------- */
  function initSakura(canvasId, density){
    const canvas = document.getElementById(canvasId);
    if(!canvas || reducedMotion) return;
    const ctx = canvas.getContext('2d');
    let w, h, petals = [];
    function resize(){
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    }
    function makePetal(){
      return {
        x: Math.random()*w, y: Math.random()*-h,
        r: (Math.random()*4+3) * devicePixelRatio,
        speed: (Math.random()*0.6+0.3) * devicePixelRatio,
        drift: Math.random()*0.6-0.3,
        sway: Math.random()*Math.PI*2,
        rot: Math.random()*Math.PI,
        rotSpeed: (Math.random()-0.5)*0.02,
        opacity: Math.random()*0.5+0.3,
      };
    }
    resize();
    const count = Math.round((w*h)/(900000/density));
    for(let i=0;i<Math.max(10,Math.min(count,50));i++) petals.push(makePetal());
    window.addEventListener('resize', resize);

    function draw(){
      ctx.clearRect(0,0,w,h);
      petals.forEach(p => {
        p.y += p.speed; p.sway += 0.01; p.rot += p.rotSpeed;
        p.x += Math.sin(p.sway)*0.4 + p.drift*0.2;
        if(p.y > h + 20){ Object.assign(p, makePetal(), { y: -20 }); }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = '#ffb3d1';
        ctx.beginPath();
        ctx.ellipse(0,0, p.r, p.r*0.6, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }
  initSakura('sakura-canvas', 1);

})();


/* ===== home-data.js (homepage NFT preview + FAQ) ===== */
(function(){
  const c = AXORONIN_CONFIG;

  const gridEl = document.getElementById('home-nft-grid');
  if(gridEl){
    gridEl.innerHTML = AXORONIN_NFTS.slice(0, 8).map(nftCardHTML).join('');
  }

  const FAQ = [
    ["What is AxoRonin?", `AxoRonin is a community-driven NFT collection inspired by Japanese culture, cyberpunk aesthetics, and the unique charm of axolotls. It blends original art, storytelling and a growing community into one universe.`],
    ["What is the Ronin Clan?", `The Ronin Clan is the AxoRonin community — the people who follow the lore, join Discord, shape decisions through voting, and help build the universe over time.`],
    ["How many NFTs will there be?", `The total collection supply is ${c.COLLECTION_SUPPLY}. This figure will be confirmed officially before mint.`],
    ["What blockchain is AxoRonin built on?", `AxoRonin will be built on ${c.BLOCKCHAIN}. Official confirmation will be shared through Discord and X before launch.`],
    ["Where can I mint?", `All official mint links and announcements are shared through our Linktree: ${c.MINT_URL}.`],
    ["Where can I buy AxoRonin?", `After mint, AxoRonin will be available on the secondary marketplace listed at ${c.MARKETPLACE_URL}.`],
    ["What do holders receive?", `Holder benefits are expected to include community access, early announcements, voting opportunities, digital rewards and selected campaign perks. Specific benefits will be confirmed officially — see the Ronin Clan page for details.`],
    ["Will there be physical collectibles?", `Selected campaigns and milestones may feature limited physical AxoRonin collectibles, including 3D-printed pieces. These are not guaranteed for every holder or every drop.`],
    ["Is there a roadmap?", `Yes — the Ronin Journey roadmap outlines five phases from The Awakening through Legacy. See the Roadmap page for the full timeline.`],
    ["Can the roadmap change?", `Yes. Roadmap milestones represent the current direction of AxoRonin and may evolve based on development, community feedback and project conditions.`],
  ];

  const faqList = document.getElementById('home-faqList');
  if(faqList){
    faqList.innerHTML = FAQ.map(([q,a], i) => `
      <div class="faq-item">
        <button class="faq-q" aria-expanded="false" id="faqq-${i}">
          <span>${q}</span><span class="plus">+</span>
        </button>
        <div class="faq-a"><p>${a}</p></div>
      </div>
    `).join('');
    window.AXORONIN_bindFaq && window.AXORONIN_bindFaq();
  }
})();


/* ===== collection.js (search / filter / sort / modal) ===== */
(function(){
  const grid = document.getElementById('fullNftGrid');
  const resultCount = document.getElementById('resultCount');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const fBackground = document.getElementById('filterBackground');
  const fArmor = document.getElementById('filterArmor');
  const fEyes = document.getElementById('filterEyes');
  const sortSelect = document.getElementById('sortSelect');

  function uniqueOptions(field){
    return [...new Set(AXORONIN_NFTS.map(n => n[field]))].sort();
  }
  function populateSelect(el, field, label){
    uniqueOptions(field).forEach(val => {
      const opt = document.createElement('option');
      opt.value = val; opt.textContent = `${label}: ${val}`;
      el.appendChild(opt);
    });
  }
  populateSelect(fBackground, 'background', 'BG');
  populateSelect(fArmor, 'armor', 'Armor');
  populateSelect(fEyes, 'eyes', 'Eyes');

  function currentResults(){
    const q = searchInput.value.trim().toLowerCase();
    let results = AXORONIN_NFTS.filter(n => {
      const matchesQ = !q || n.name.toLowerCase().includes(q) || n.id.includes(q.replace('#',''));
      const matchesBg = !fBackground.value || n.background === fBackground.value;
      const matchesArmor = !fArmor.value || n.armor === fArmor.value;
      const matchesEyes = !fEyes.value || n.eyes === fEyes.value;
      return matchesQ && matchesBg && matchesArmor && matchesEyes;
    });
    const [key, dir] = sortSelect.value.split('-');
    results.sort((a,b) => {
      let av = key === 'id' ? a.id : a.name.toLowerCase();
      let bv = key === 'id' ? b.id : b.name.toLowerCase();
      return (av < bv ? -1 : av > bv ? 1 : 0) * (dir === 'desc' ? -1 : 1);
    });
    return results;
  }

  function render(){
    const results = currentResults();
    resultCount.textContent = `${results.length} of ${AXORONIN_NFTS.length} Ronin shown`;
    grid.innerHTML = results.map(nftCardHTML).join('');
    emptyState.hidden = results.length !== 0;
    grid.style.display = results.length === 0 ? 'none' : 'grid';
    grid.querySelectorAll('.nft-card').forEach((card, i) => {
      card.addEventListener('click', () => openModal(results[i]));
      card.addEventListener('keypress', e => { if(e.key === 'Enter') openModal(results[i]); });
    });
  }

  [searchInput, fBackground, fArmor, fEyes, sortSelect].forEach(el => {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });
  render();

  /* -------- Modal -------- */
  const overlay = document.getElementById('modalOverlay');
  function openModal(n){
    document.getElementById('modalId').textContent = `AXO #${n.id}`;
    document.getElementById('modalTitle').textContent = n.name;
    document.getElementById('modalMedia').innerHTML = `[NFT IMAGE PLACEHOLDER]<br>AXO #${n.id}`;
    document.getElementById('modalTraits').innerHTML = `
      <div class="modal-trait-row"><span>Background</span><span>${n.background}</span></div>
      <div class="modal-trait-row"><span>Armor</span><span>${n.armor}</span></div>
      <div class="modal-trait-row"><span>Eyes</span><span>${n.eyes}</span></div>
      <div class="modal-trait-row"><span>Accessory</span><span>${n.accessory}</span></div>
    `;
    const mp = document.getElementById('modalMarketplace');
    mp.href = AXORONIN_CONFIG.MARKETPLACE_URL.startsWith('[') ? '#' : AXORONIN_CONFIG.MARKETPLACE_URL;
    mp.textContent = AXORONIN_CONFIG.MARKETPLACE_URL.startsWith('[') ? 'Marketplace Coming Soon' : 'View on Marketplace';
    overlay.classList.add('open');
    document.body.classList.add('no-scroll');
  }
  function closeModal(){
    overlay.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }
  document.getElementById('modalClose').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if(e.target === overlay) closeModal(); });
  window.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });
})();


/* ===== mint.js (mint page data + FAQ) ===== */
(function(){
  const c = AXORONIN_CONFIG;

  document.getElementById('mintPrice').textContent = c.MINT_PRICE;
  document.getElementById('mintSupply').textContent = c.COLLECTION_SUPPLY;
  document.getElementById('mintNetwork').textContent = c.BLOCKCHAIN;
  document.getElementById('contractAddr').textContent = c.CONTRACT_ADDRESS;

  document.getElementById('copyContract').addEventListener('click', () => {
    if(c.CONTRACT_ADDRESS.startsWith('[')) return;
    navigator.clipboard?.writeText(c.CONTRACT_ADDRESS);
  });

  /* ---------------------------------------------------------------
     Quantity selector — wired up but intentionally inert until
     MINT_LIVE is true, so there is no fake mint interaction.
     --------------------------------------------------------------- */
  let qty = 1;
  const qtyVal = document.getElementById('qtyVal');
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  const MAX_QTY = 10;

  function renderQty(){
    qtyVal.textContent = qty;
    qtyMinus.disabled = !c.MINT_LIVE || qty <= 1;
    qtyPlus.disabled = !c.MINT_LIVE || qty >= MAX_QTY;
  }
  qtyMinus.addEventListener('click', () => { if(qty>1){ qty--; renderQty(); } });
  qtyPlus.addEventListener('click', () => { if(qty<MAX_QTY){ qty++; renderQty(); } });
  renderQty();

  /* ---------------------------------------------------------------
     Wallet connection stub. Intentionally does NOT connect to any
     real wallet or request permissions. Replace connectWallet() with
     real logic (e.g. wagmi/ethers/viem) once mint is ready, and flip
     AXORONIN_CONFIG.MINT_LIVE to true.
     --------------------------------------------------------------- */
  const connectBtn = document.getElementById('connectBtn');
  async function connectWallet(){
    // TODO: integrate real wallet connection (never request unnecessary
    // permissions, never handle private keys client-side beyond what a
    // standard wallet provider like MetaMask/WalletConnect exposes).
    console.log('Wallet connection not yet configured.');
  }
  if(c.MINT_LIVE){
    connectBtn.disabled = false;
    connectBtn.textContent = 'Connect Wallet';
    connectBtn.addEventListener('click', connectWallet);
  } else {
    connectBtn.disabled = true;
    connectBtn.textContent = 'Mint Coming Soon';
  }

  /* ---------------------------------------------------------------
     Mint FAQ
     --------------------------------------------------------------- */
  const MINT_FAQ = [
    ["Where can I mint?", `Tap "Mint" anywhere on the site — it takes you straight to our Linktree (${c.MINT_URL}) with the official, up-to-date mint link.`],
    ["What do I need to mint?", `A compatible wallet for ${c.BLOCKCHAIN} and enough funds to cover the mint price (${c.MINT_PRICE}) plus network gas fees. Full instructions will be shared before mint.`],
    ["Is there a limit per wallet?", `Any per-wallet or per-transaction limits will be confirmed officially before the mint goes live.`],
    ["What happens after I mint?", `Minted AxoRonin will appear in your connected wallet and become visible on the marketplace listed at ${c.MARKETPLACE_URL}.`],
  ];
  const list = document.getElementById('mintFaqList');
  list.innerHTML = MINT_FAQ.map(([q,a],i) => `
    <div class="faq-item">
      <button class="faq-q" aria-expanded="false"><span>${q}</span><span class="plus">+</span></button>
      <div class="faq-a"><p>${a}</p></div>
    </div>`).join('');
  window.AXORONIN_bindFaq && window.AXORONIN_bindFaq();
})();


/* ==========================================================================
   ROUTER — single-file navigation between AxoRonin's sections
   Hash format:  #route            e.g. #collection
                 #route:anchorId   e.g. #home:home-faq, #whitepaper:wp-vision
   ========================================================================== */
(function(){
  "use strict";
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function parseHash(){
    const raw = (location.hash || '#home').slice(1);
    const [route, anchor] = raw.split(':');
    return { route: route || 'home', anchor: anchor || null };
  }

  function closeMobileMenu(){
    const menu = document.getElementById('mobileMenu');
    const hamburger = document.getElementById('hamburgerBtn');
    if(!menu || !menu.classList.contains('open')) return;
    menu.classList.remove('open');
    document.body.classList.remove('no-scroll');
    if(hamburger){ hamburger.textContent = '☰'; hamburger.setAttribute('aria-expanded','false'); }
  }

  function showRoute(route, anchor){
    const panels = document.querySelectorAll('.route-panel');
    let matched = false;
    panels.forEach(p => {
      const isMatch = p.dataset.route === route;
      p.classList.toggle('active', isMatch);
      if(isMatch) matched = true;
    });
    if(!matched){
      // Unknown route in the URL — fall back to home instead of a blank page.
      document.querySelector('.route-panel[data-route="home"]')?.classList.add('active');
      route = 'home';
    }

    const currentHash = anchor ? `${route}:${anchor}` : route;
    document.querySelectorAll('.nav-links a, .mobile-links a, .footer-links a').forEach(a => {
      const linkHash = a.getAttribute('href').replace('#','');
      a.classList.toggle('active', linkHash === currentHash || (linkHash === route && !anchor));
    });

    closeMobileMenu();

    if(anchor){
      requestAnimationFrame(() => {
        const target = document.getElementById(anchor);
        target?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    document.title = route === 'home'
      ? 'AxoRonin — Honor the Code. Embrace the Chaos.'
      : `${route.charAt(0).toUpperCase()}${route.slice(1)} — AxoRonin`;
  }

  window.addEventListener('hashchange', () => {
    const { route, anchor } = parseHash();
    showRoute(route, anchor);
  });

  document.addEventListener('DOMContentLoaded', () => {
    const { route, anchor } = parseHash();
    showRoute(route, anchor);
  });
})();

