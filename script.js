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
/* Seven real character portraits are cycled across the placeholder metadata
   below purely as visual stand-ins — swap this array for real collection
   metadata (and per-token images) once it exists. */
const AXORONIN_ART = [
  "axo-bubblegum-oni",
  "axo-frostbreath-sakura",
  "axo-zipper-mouth",
  "axo-bamboo-moon",
  "axo-foxmask-sunset",
  "axo-lightning-dragon",
  "axo-mecha-oni-pipe",
];

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
].map((n, i) => ({ ...n, image: AXORONIN_ART[i % AXORONIN_ART.length] }));

function nftCardHTML(n){
  const media = n.image
    ? `<div class="nft-media has-image">
         <img src="images/${n.image}-thumb.jpg" alt="${n.name}, AXO #${n.id}" loading="lazy">
       </div>`
    : `<div class="nft-media">
         <div class="ph">[NFT IMAGE PLACEHOLDER]<br>AXO #${n.id}</div>
       </div>`;
  return `
    <article class="nft-card" tabindex="0" aria-label="${n.name}, AXO #${n.id}">
      ${media}
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
   RONIN NAME GENERATOR
   Lives on the Clan page (route "clan"). Self-contained module — no changes
   to any other page, nav, or existing feature.

   Design notes:
   - Kanji is never assembled from random characters. Every name traces back
     to one or more entries in BASE_WORDS, each a real word/kanji/meaning
     triple. Cyber/Hybrid modes only ever attach ASCII suffixes or another
     base word's romaji — the displayed kanji + meaning always belongs to a
     real base word, verbatim.
   - No backend exists on this static site, so "uniqueness" is tracked with
     localStorage (per-visitor). This is the lightweight solution appropriate
     for the current project — see the chat reply for how to swap in a real
     backend later if one gets added.
   ========================================================================== */
(function(){
  "use strict";

  const generateBtn = document.getElementById('namegenGenerateBtn');
  if(!generateBtn) return; // Clan page markup not present — nothing to wire up.

  const copyBtn = document.getElementById('namegenCopyBtn');
  const placeholder = document.getElementById('namegenPlaceholder');
  const resultEl = document.getElementById('namegenResult');
  const nameEl = document.getElementById('namegenName');
  const kanjiEl = document.getElementById('namegenKanji');
  const meaningEl = document.getElementById('namegenMeaning');
  const countEl = document.getElementById('namegenCount');
  const modeButtons = document.querySelectorAll('.namegen-modes .trait-tab');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Curated word pool — every entry is a real, verified kanji pairing ---- */
  const BASE_WORDS = [
    { r: "Kurogane", k: "黒鉄", m: "Black Iron" },
    { r: "Kuro", k: "黒", m: "Black" },
    { r: "Raiko", k: "雷光", m: "Lightning Glow" },
    { r: "Rai", k: "雷", m: "Thunder" },
    { r: "Raiken", k: "雷剣", m: "Thunder Blade" },
    { r: "Kagejin", k: "影刃", m: "Shadow Blade" },
    { r: "Kage", k: "影", m: "Shadow" },
    { r: "Yoru", k: "夜", m: "Night" },
    { r: "Yorugiri", k: "夜霧", m: "Night Fog" },
    { r: "Kiri", k: "霧", m: "Mist" },
    { r: "Akagiri", k: "赤霧", m: "Red Mist" },
    { r: "Ryuu", k: "龍", m: "Dragon" },
    { r: "Honoo", k: "炎", m: "Flame" },
    { r: "Shinkai", k: "深海", m: "Deep Sea" },
    { r: "Ginga", k: "銀河", m: "Galaxy" },
    { r: "Tsuki", k: "月", m: "Moon" },
    { r: "Tsukikage", k: "月影", m: "Moon Shadow" },
    { r: "Hikari", k: "光", m: "Light" },
    { r: "Zankou", k: "斬光", m: "Slashing Light" },
    { r: "Ken", k: "剣", m: "Sword" },
    { r: "Ookami", k: "狼", m: "Wolf" },
    { r: "Karasu", k: "烏", m: "Crow" },
    { r: "Yami", k: "闇", m: "Darkness" },
    { r: "Gin", k: "銀", m: "Silver" },
    { r: "Hai", k: "灰", m: "Ash" },
    { r: "Sen", k: "戦", m: "War" },
    { r: "Michi", k: "道", m: "Path" },
    { r: "Bushi", k: "武士", m: "Warrior" },
    { r: "Ronin", k: "浪人", m: "Wandering Warrior" },
    { r: "Sakura", k: "桜", m: "Cherry Blossom" },
    { r: "Byakko", k: "白虎", m: "White Tiger" },
  ];
  const CYBER_SUFFIXES = ["-X", "//X", "-07", "-09", "_V2", ".EXE", "-Z", "//9"];
  const CYBER_LEXICON = ["byte", "code", "net", "flux", "core", "volt", "sync", "grid"];

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  function buildRonin(){
    const w = pick(BASE_WORDS);
    return { name: w.r, kanji: w.k, meaning: w.m };
  }

  function buildCyber(){
    const w = pick(BASE_WORDS);
    const suffix = pick(CYBER_SUFFIXES);
    return { name: `${w.r.toUpperCase()}${suffix}`, kanji: w.k, meaning: w.m };
  }

  function buildHybrid(){
    const anchor = pick(BASE_WORDS);
    const strategy = Math.random();
    let name;
    if(strategy < 0.34){
      // Japanese word + cyber lexicon fragment, e.g. "Kurobyte"
      name = anchor.r + pick(CYBER_LEXICON);
    } else if(strategy < 0.67){
      // Two Japanese words fused, e.g. "Yorukage"
      let other = pick(BASE_WORDS);
      let guard = 0;
      while(other.r === anchor.r && guard++ < 10) other = pick(BASE_WORDS);
      name = anchor.r + other.r.toLowerCase();
    } else {
      // Japanese word + cyber suffix, e.g. "Raikage-X"
      name = anchor.r + pick(CYBER_SUFFIXES);
    }
    return { name, kanji: anchor.k, meaning: anchor.m };
  }

  const BUILDERS = { ronin: buildRonin, cyber: buildCyber, hybrid: buildHybrid };

  /* ---- Uniqueness tracking (localStorage — no backend on this static site) ---- */
  const HISTORY_KEY = 'axoronin-namegen-history';
  function loadHistory(){
    try{
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }
  function saveHistory(list){
    try{ localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); }catch(e){ /* storage unavailable — degrade silently */ }
  }
  let history = loadHistory();

  function generateUnique(mode){
    const build = BUILDERS[mode] || buildHybrid;
    let result = build();
    let attempts = 0;
    // Try to avoid repeats; if the mode's pool is exhausted, fall back to
    // whatever comes out rather than looping forever.
    while(history.includes(result.name) && attempts < 60){
      result = build();
      attempts++;
    }
    if(!history.includes(result.name)){
      history.push(result.name);
      saveHistory(history);
    }
    return result;
  }

  function updateCount(){
    countEl.textContent = history.length > 0
      ? `${history.length} unique Ronin name${history.length === 1 ? '' : 's'} discovered so far`
      : '';
  }

  function currentMode(){
    const active = document.querySelector('.namegen-modes .trait-tab.active');
    return active ? active.dataset.mode : 'hybrid';
  }

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    });
  });

  const GLITCH_CHARS = 'アイウエオカキクケコサシ0123456789#//_-XZ'.split('');
  function scrambleOnce(length){
    let s = '';
    for(let i = 0; i < length; i++) s += pick(GLITCH_CHARS);
    return s;
  }

  function reveal(result){
    placeholder.hidden = true;
    resultEl.hidden = false;
    nameEl.textContent = result.name;
    kanjiEl.textContent = result.kanji;
    meaningEl.textContent = result.meaning;
    copyBtn.hidden = false;
    copyBtn.textContent = 'Copy Name';
    copyBtn.classList.remove('namegen-copy-flash');
    updateCount();
  }

  function generate(){
    generateBtn.disabled = true;
    const mode = currentMode();
    const result = generateUnique(mode);

    if(reducedMotion){
      reveal(result);
      generateBtn.disabled = false;
      return;
    }

    placeholder.hidden = true;
    resultEl.hidden = false;
    nameEl.classList.add('is-glitching');
    kanjiEl.classList.add('is-glitching');

    const scrambleDuration = 480;
    const tickMs = 55;
    const ticks = Math.floor(scrambleDuration / tickMs);
    let tick = 0;
    const nameLen = Math.min(result.name.length, 14);
    const kanjiLen = result.kanji.length;

    const interval = setInterval(() => {
      nameEl.textContent = scrambleOnce(nameLen);
      kanjiEl.textContent = scrambleOnce(kanjiLen);
      tick++;
      if(tick >= ticks){
        clearInterval(interval);
        nameEl.classList.remove('is-glitching');
        kanjiEl.classList.remove('is-glitching');
        reveal(result);
        generateBtn.disabled = false;
      }
    }, tickMs);
  }

  generateBtn.addEventListener('click', () => {
    generateBtn.textContent = 'Generate Again';
    generate();
  });

  copyBtn.addEventListener('click', async () => {
    const text = nameEl.textContent;
    try{
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('namegen-copy-flash');
      setTimeout(() => {
        copyBtn.textContent = 'Copy Name';
        copyBtn.classList.remove('namegen-copy-flash');
      }, 1500);
    }catch(e){
      copyBtn.textContent = 'Copy failed';
      setTimeout(() => { copyBtn.textContent = 'Copy Name'; }, 1500);
    }
  });

  updateCount();
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

    // Every other route panel starts at display:none, so its .reveal elements
    // (opacity:0 until scrolled into view) never get a first IntersectionObserver
    // check — they'd stay invisible forever. Home is exempt: it's active by
    // default from page load, so its normal scroll-triggered reveal already
    // works and shouldn't be shortcut here.
    if(route !== 'home'){
      const panel = document.querySelector(`.route-panel[data-route="${route}"]`);
      panel?.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
      panel?.querySelectorAll('.phase').forEach(el => el.classList.add('in-view'));
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
