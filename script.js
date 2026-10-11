/* ============================================================
   AXORONIN — script.js
   Config, artwork data, core UI behavior, page logic
   (home, collection, clan, mint), and the single-page hash router.
   ============================================================ */

/* ==========================================================================
   CENTRAL CONFIGURATION
   Edit this block to update project data across the entire site.
   Anything wrapped in [BRACKETS] is a placeholder: visitors never see the
   bracket text. Placeholders render as "To be announced" (or are hidden,
   e.g. the Clan stats) until you replace them with official values.
   ========================================================================== */
const AXORONIN_CONFIG = {
  PROJECT_NAME: "AxoRonin",
  COMMUNITY_NAME: "The Ronin Clan",
  TAGLINE: "Honor the Code. Embrace the Chaos.",

  COLLECTION_SUPPLY: "[COLLECTION SUPPLY]",
  REMAINING_SUPPLY: "[REMAINING SUPPLY]",
  BLOCKCHAIN: "[BLOCKCHAIN]",
  MINT_PRICE: "[MINT PRICE]",
  MINT_URL: "https://exclusivo.one/collection/axoronin?tab=items",
  MARKETPLACE_URL: "https://exclusivo.one/collection/axoronin?tab=items",
  CONTRACT_ADDRESS: "[CONTRACT ADDRESS]",

  // Clan stats: each card stays hidden until its value is real.
  CLAN_MEMBERS: "[CLAN MEMBERS]",
  COLLABORATIONS: "[COLLABORATIONS]",
  COMMUNITY_EVENTS: "[COMMUNITY EVENTS]",

  DISCORD_URL: "https://discord.gg/pBqjT6BPS",
  X_URL: "https://x.com/axoroninnft",
  X_HANDLE: "@AxoRoninNFT",

  // Mint status: true = minting is open on Exclusivo (MINT_URL).
  // Set to false to show "Mint Coming Soon" across the mint page instead.
  MINT_LIVE: true,

  COPYRIGHT_YEAR: 2026,
};
Object.freeze(AXORONIN_CONFIG);

const TBA = "To be announced";
/** True when a config value is still a [PLACEHOLDER]. */
function isPlaceholder(v){ return typeof v !== "string" || v.trim() === "" || /^\[.*\]$/.test(v.trim()); }
/** Visitor-facing text for a config value. */
function configText(v){ return isPlaceholder(v) ? TBA : v; }
function escapeHTML(str){
  return String(str).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
}


/* ==========================================================================
   ARTWORK
   The seven official character portraits currently in /images. Add entries
   here as new artwork is released; every gallery on the site reads from it.
   ========================================================================== */
const AXORONIN_ART = [
  { file: "axo-frostbreath-sakura", name: "Frostbreath",      note: "Cherry blossoms, moonlit shrine" },
  { file: "axo-bubblegum-oni",      name: "Bubblegum Oni",    note: "Red oni mask, katana" },
  { file: "axo-foxmask-sunset",     name: "Kitsune Dusk",     note: "Fox mask, Tokyo sunset" },
  { file: "axo-bamboo-moon",        name: "Bamboo Moon",      note: "Moonlit bamboo grove" },
  { file: "axo-lightning-dragon",   name: "Lightning Dragon", note: "Storm-forged souvenir jacket" },
  { file: "axo-zipper-mouth",       name: "Zipper Grin",      note: "Techwear, silent smile" },
  { file: "axo-mecha-oni-pipe",     name: "Mecha Oni",        note: "Mecha oni mask, bamboo pipe" },
];

function artCardHTML(a){
  return `
    <button class="nft-card" type="button" data-art="${a.file}" aria-label="View ${escapeHTML(a.name)} artwork larger">
      <div class="nft-media">
        <img src="images/${a.file}-thumb.jpg" alt="" loading="lazy" decoding="async" width="600" height="600">
      </div>
      <div class="nft-info">
        <h3>${escapeHTML(a.name)}</h3>
        <p>${escapeHTML(a.note)}</p>
      </div>
    </button>`;
}

function artCtaTileHTML(){
  return `
    <a class="nft-card nft-card-cta" href="${AXORONIN_CONFIG.MARKETPLACE_URL}" target="_blank" rel="noopener">
      <span class="cta-glyph" aria-hidden="true">浪</span>
      <strong>See every Ronin</strong>
      <span>Browse the full collection on Exclusivo</span>
      <span class="cta-arrow" aria-hidden="true">→</span>
    </a>`;
}


/* ==========================================================================
   CORE UI: theme, loader, nav, reveals, FAQ, tabs, lightbox, sakura
   ========================================================================== */
(function(){
  "use strict";
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const c = AXORONIN_CONFIG;

  /* ---------------- THEME ---------------- */
  const THEME_KEY = 'axoronin-theme';
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    if(themeMeta) themeMeta.setAttribute('content', theme === 'light' ? '#f7f3fb' : '#08060c');
    document.querySelectorAll('#themeToggle, #mobileThemeToggle').forEach(btn => {
      btn.setAttribute('aria-pressed', String(theme === 'light'));
    });
  }
  function toggleTheme(){
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try{ localStorage.setItem(THEME_KEY, next); }catch(e){ /* storage unavailable */ }
  }
  // The inline <head> script already set data-theme before first paint.
  applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  document.getElementById('mobileThemeToggle')?.addEventListener('click', toggleTheme);

  /* ---------------- LOADER ----------------
     Short, never blocking: hides shortly after load, with a hard cap so a
     slow image or font can never keep visitors staring at a splash screen. */
  const loader = document.getElementById('loader');
  if(loader){
    const hide = () => loader.classList.add('hide');
    if(document.readyState === 'complete') setTimeout(hide, 150);
    else window.addEventListener('load', () => setTimeout(hide, reducedMotion ? 0 : 250));
    setTimeout(hide, 2500);
  }

  /* ---------------- NAVBAR ---------------- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar?.classList.toggle('scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });

  /* ---------------- MOBILE MENU ---------------- */
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeBtn = document.getElementById('mobileMenuClose');

  function openMenu(){
    if(!mobileMenu) return;
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    hamburger?.setAttribute('aria-expanded', 'true');
    setTimeout(() => closeBtn?.focus(), 50);
  }
  function closeMenu(restoreFocus){
    if(!mobileMenu || !mobileMenu.classList.contains('open')) return;
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    hamburger?.setAttribute('aria-expanded', 'false');
    if(restoreFocus) hamburger?.focus();
  }
  window.AXORONIN_closeMenu = closeMenu;
  hamburger?.addEventListener('click', () => mobileMenu.classList.contains('open') ? closeMenu(true) : openMenu());
  closeBtn?.addEventListener('click', () => closeMenu(true));
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu(false)));
  // Keep keyboard focus inside the open menu.
  mobileMenu?.addEventListener('keydown', e => {
    if(e.key !== 'Tab') return;
    const items = mobileMenu.querySelectorAll('a, button');
    const first = items[0], last = items[items.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });
  window.matchMedia('(min-width: 901px)').addEventListener?.('change', e => { if(e.matches) closeMenu(false); });

  /* Skip link: focus <main> without changing the hash (which drives routing). */
  document.querySelector('.skip-link')?.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('main')?.focus();
  });

  /* ---------------- SCROLL REVEALS ---------------- */
  if('IntersectionObserver' in window && !reducedMotion){
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    const phaseIo = new IntersectionObserver(entries => {
      entries.forEach(en => { if(en.isIntersecting){ en.target.classList.add('in-view'); phaseIo.unobserve(en.target); } });
    }, { threshold: 0.25 });
    document.querySelectorAll('.phase').forEach(el => phaseIo.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    document.querySelectorAll('.phase').forEach(el => el.classList.add('in-view'));
  }

  /* ---------------- FAQ ACCORDION ---------------- */
  function bindFaq(){
    document.querySelectorAll('.faq-item').forEach(item => {
      if(item.dataset.bound) return;
      item.dataset.bound = '1';
      const q = item.querySelector('.faq-q');
      const a = item.querySelector('.faq-a');
      q?.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        item.parentElement.querySelectorAll('.faq-item.open').forEach(other => {
          if(other === item) return;
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
          other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        });
        item.classList.toggle('open', !isOpen);
        a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : null;
        q.setAttribute('aria-expanded', String(!isOpen));
      });
    });
  }
  window.AXORONIN_bindFaq = bindFaq;

  /** Render a FAQ list into a container. Answers may contain trusted HTML. */
  window.AXORONIN_renderFaq = function(container, items, prefix){
    if(!container) return;
    container.innerHTML = items.map(([q, a], i) => `
      <div class="faq-item">
        <h3 class="faq-h">
          <button class="faq-q" type="button" aria-expanded="false" id="${prefix}-q${i}" aria-controls="${prefix}-a${i}">
            <span>${q}</span><span class="plus" aria-hidden="true"></span>
          </button>
        </h3>
        <div class="faq-a" id="${prefix}-a${i}" role="region" aria-labelledby="${prefix}-q${i}"><p>${a}</p></div>
      </div>`).join('');
    bindFaq();
  };

  /* ---------------- TRAIT TABS ---------------- */
  document.querySelectorAll('[data-trait-tabs]').forEach(wrap => {
    const tabs = Array.from(wrap.querySelectorAll('.trait-tab'));
    const panels = wrap.querySelectorAll('[data-trait-panel]');
    function select(tab){
      tabs.forEach(t => {
        const on = t === tab;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(p => { p.hidden = p.dataset.traitPanel !== tab.dataset.tab; if(!p.hidden) p.classList.add('in'); });
    }
    tabs.forEach((tab, i) => {
      tab.tabIndex = tab.classList.contains('active') ? 0 : -1;
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', e => {
        const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if(!dir) return;
        e.preventDefault();
        const next = tabs[(i + dir + tabs.length) % tabs.length];
        select(next); next.focus();
      });
    });
  });

  /* ---------------- ARTWORK LIGHTBOX ---------------- */
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbCap = document.getElementById('lightboxCaption');
  const lbClose = document.getElementById('lightboxClose');
  let lbReturnFocus = null;

  function openLightbox(file, trigger){
    const art = AXORONIN_ART.find(a => a.file === file);
    if(!art || !lightbox) return;
    lbReturnFocus = trigger || null;
    lbImg.src = `images/${art.file}-large.jpg`;
    lbImg.alt = `${art.name}: ${art.note}`;
    lbCap.innerHTML = `<strong>${escapeHTML(art.name)}</strong><span>${escapeHTML(art.note)}</span>`;
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add('open'));
    document.body.classList.add('no-scroll');
    lbClose.focus();
  }
  function closeLightbox(){
    if(!lightbox || lightbox.hidden) return;
    lightbox.classList.remove('open');
    document.body.classList.remove('no-scroll');
    setTimeout(() => { lightbox.hidden = true; lbImg.removeAttribute('src'); }, reducedMotion ? 0 : 250);
    lbReturnFocus?.focus();
  }
  document.addEventListener('click', e => {
    const card = e.target.closest('[data-art]');
    if(card) openLightbox(card.dataset.art, card);
  });
  lbClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', e => { if(e.target === lightbox) closeLightbox(); });
  lightbox?.addEventListener('keydown', e => { if(e.key === 'Tab'){ e.preventDefault(); lbClose.focus(); } });

  window.addEventListener('keydown', e => {
    if(e.key !== 'Escape') return;
    if(lightbox && !lightbox.hidden) closeLightbox();
    else closeMenu(true);
  });

  /* ---------------- CONFIG-DRIVEN TEXT ---------------- */
  document.querySelectorAll('[data-config]').forEach(el => {
    const v = c[el.dataset.config];
    el.textContent = configText(v);
    el.classList.toggle('is-tba', isPlaceholder(v));
  });
  const yearEl = document.getElementById('copyrightYear');
  if(yearEl) yearEl.textContent = c.COPYRIGHT_YEAR;

  /* ---------------- SAKURA PARTICLES ----------------
     Only animates while the hero is actually on screen and the tab is
     visible, so it costs nothing while reading the rest of the site. */
  function initSakura(canvasId){
    const canvas = document.getElementById(canvasId);
    if(!canvas || reducedMotion) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, petals = [], running = false, onScreen = true, rafId = 0;

    function resize(){
      w = canvas.width = Math.max(1, canvas.offsetWidth * dpr);
      h = canvas.height = Math.max(1, canvas.offsetHeight * dpr);
    }
    function makePetal(initial){
      return {
        x: Math.random() * w, y: initial ? Math.random() * h : -20 * dpr,
        r: (Math.random() * 4 + 3) * dpr,
        speed: (Math.random() * 0.6 + 0.3) * dpr,
        drift: Math.random() * 0.6 - 0.3,
        sway: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.45 + 0.25,
      };
    }
    resize();
    const count = Math.max(12, Math.min(Math.round((w * h) / (900000 * dpr)), 40));
    for(let i = 0; i < count; i++) petals.push(makePetal(true));
    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });

    function draw(){
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#ffb3d1';
      for(const p of petals){
        p.y += p.speed; p.sway += 0.01; p.rot += p.rotSpeed;
        p.x += Math.sin(p.sway) * 0.4 + p.drift * 0.2;
        if(p.y > h + 20) Object.assign(p, makePetal(false));
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r, p.r * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      rafId = requestAnimationFrame(draw);
    }
    function sync(){
      const should = onScreen && !document.hidden && canvas.offsetParent !== null;
      if(should && !running){ running = true; if(!w || !h) resize(); rafId = requestAnimationFrame(draw); }
      else if(!should && running){ running = false; cancelAnimationFrame(rafId); }
    }
    if('IntersectionObserver' in window){
      new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; sync(); }).observe(canvas);
    }
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('hashchange', () => setTimeout(sync, 0));
    sync();
  }
  initSakura('sakura-canvas');
})();


/* ==========================================================================
   HOME: featured artwork + FAQ
   ========================================================================== */
(function(){
  const c = AXORONIN_CONFIG;
  const link = (url, label) => `<a class="text-link" href="${url}" target="_blank" rel="noopener">${label}</a>`;

  const homeGrid = document.getElementById('home-nft-grid');
  if(homeGrid) homeGrid.innerHTML = AXORONIN_ART.slice(0, 4).map(artCardHTML).join('');

  const collectionGrid = document.getElementById('collection-nft-grid');
  if(collectionGrid) collectionGrid.innerHTML = AXORONIN_ART.map(artCardHTML).join('') + artCtaTileHTML();

  const FAQ = [
    ["What is AxoRonin?", `AxoRonin is a community-driven NFT collection inspired by Japanese culture, cyberpunk aesthetics, and the unique charm of axolotls. It blends original art, storytelling and a growing community into one universe.`],
    ["What is the Ronin Clan?", `The Ronin Clan is the AxoRonin community: the people who follow the lore, join ${link(c.DISCORD_URL, "Discord")}, shape decisions through voting, and help build the universe over time.`],
    ["How many NFTs will there be?", isPlaceholder(c.COLLECTION_SUPPLY)
      ? `See the live supply on the official ${link(c.MINT_URL, "Exclusivo collection page")}. Official figures are also shared on Discord and X.`
      : `The total collection supply is ${escapeHTML(c.COLLECTION_SUPPLY)}.`],
    ["What blockchain is AxoRonin built on?", isPlaceholder(c.BLOCKCHAIN)
      ? `Network details are listed on the official ${link(c.MINT_URL, "Exclusivo collection page")}.`
      : `AxoRonin is built on ${escapeHTML(c.BLOCKCHAIN)}.`],
    ["Where can I mint or buy AxoRonin?", `On the official AxoRonin collection page on ${link(c.MINT_URL, "Exclusivo")}. Always double-check you are on exclusivo.one and only trust links shared from our official Discord and X.`],
    ["What do holders receive?", `Holder benefits are expected to include community access, early announcements, voting opportunities, digital rewards and selected campaign perks. Specific benefits will be confirmed officially. See the <a class="text-link" href="#clan">Ronin Clan page</a> for details.`],
    ["Will there be physical collectibles?", `Selected campaigns and milestones may feature limited physical AxoRonin collectibles, including 3D-printed pieces. These are not guaranteed for every holder or every drop.`],
    ["Is there a roadmap?", `Yes. The Ronin Journey outlines five phases from The Awakening through Legacy. See the <a class="text-link" href="#roadmap">Roadmap page</a> for the full timeline.`],
    ["Can the roadmap change?", `Yes. Roadmap milestones represent the current direction of AxoRonin and may evolve based on development, community feedback and project conditions.`],
  ];
  window.AXORONIN_renderFaq(document.getElementById('home-faqList'), FAQ, 'faq');
})();


/* ==========================================================================
   CLAN: stats (each card only appears once its figure is official)
   ========================================================================== */
(function(){
  const c = AXORONIN_CONFIG;
  const section = document.getElementById('clan-stats');
  if(!section) return;
  let shown = 0;
  section.querySelectorAll('[data-stat]').forEach(card => {
    const v = c[card.dataset.stat];
    if(isPlaceholder(v)){ card.hidden = true; return; }
    card.querySelector('.val').textContent = v;
    shown++;
  });
  if(shown === 0) section.hidden = true;
  else section.querySelector('.stat-grid').style.setProperty('--stat-cols', String(Math.min(shown, 4)));
})();


/* ==========================================================================
   MINT: data + FAQ
   ========================================================================== */
(function(){
  const c = AXORONIN_CONFIG;

  /* Collection facts: rows with a real value are shown; placeholder rows are
     hidden (Exclusivo shows the live figures). The note only appears when
     at least one row is still missing. */
  let missing = 0;
  document.querySelectorAll('[data-mint-row]').forEach(row => {
    const v = c[row.dataset.mintRow];
    if(isPlaceholder(v)){ row.hidden = true; missing++; return; }
    row.lastElementChild.textContent = v;
  });
  const note = document.getElementById('mintNote');
  if(note) note.hidden = missing === 0;

  /* Contract address: only shown once it is official. */
  const contractBox = document.getElementById('contractBox');
  const contractAddr = document.getElementById('contractAddr');
  if(contractBox && contractAddr){
    if(isPlaceholder(c.CONTRACT_ADDRESS)) contractBox.hidden = true;
    else contractAddr.textContent = c.CONTRACT_ADDRESS;
  }
  const copyBtn = document.getElementById('copyContract');
  copyBtn?.addEventListener('click', async () => {
    try{
      await navigator.clipboard.writeText(c.CONTRACT_ADDRESS);
      copyBtn.textContent = 'Copied';
    }catch(e){ copyBtn.textContent = 'Copy failed'; }
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
  });

  /* Mint call-to-action + status, driven by MINT_LIVE. */
  const cta = document.getElementById('mintCta');
  const status = document.getElementById('mintStatus');
  const statusText = document.getElementById('mintStatusText');
  if(cta){
    cta.href = c.MINT_URL;
    if(!c.MINT_LIVE){
      cta.textContent = 'Mint Coming Soon';
      cta.classList.add('is-disabled');
      cta.setAttribute('aria-disabled', 'true');
      cta.removeAttribute('href');
    }
  }
  if(status && statusText){
    status.classList.toggle('is-live', !!c.MINT_LIVE);
    statusText.textContent = c.MINT_LIVE
      ? 'Minting is live. Only mint through exclusivo.one or links shared on our official Discord and X.'
      : 'Minting is not yet live. Follow Discord and X for the official mint announcement.';
  }

  const MINT_FAQ = [
    ["Where can I mint?", `Tap "Mint" anywhere on the site. It takes you straight to the official AxoRonin collection on <a class="text-link" href="${c.MINT_URL}" target="_blank" rel="noopener">Exclusivo</a>, where minting is live.`],
    ["What do I need to mint?", isPlaceholder(c.BLOCKCHAIN)
      ? `A compatible crypto wallet and enough funds to cover the mint price plus network fees. Exclusivo shows the supported network and wallets on the mint page.`
      : `A compatible wallet for ${escapeHTML(c.BLOCKCHAIN)} and enough funds to cover the mint price${isPlaceholder(c.MINT_PRICE) ? '' : ` (${escapeHTML(c.MINT_PRICE)})`} plus network fees.`],
    ["Is there a limit per wallet?", `Any per-wallet or per-transaction limits are shown on the Exclusivo mint page before you confirm.`],
    ["What happens after I mint?", `Your AxoRonin will appear in your wallet and on the official Exclusivo collection page. Then come say hi in the Ronin Clan on <a class="text-link" href="${c.DISCORD_URL}" target="_blank" rel="noopener">Discord</a>.`],
  ];
  window.AXORONIN_renderFaq(document.getElementById('mintFaqList'), MINT_FAQ, 'mintfaq');
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
   ROUTER: single-file navigation between AxoRonin's sections
   Hash format:  #route            e.g. #collection
                 #route:anchorId   e.g. #home:home-faq, #whitepaper:wp-vision
   ========================================================================== */
(function(){
  "use strict";
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TITLES = {
    home: 'AxoRonin: Honor the Code. Embrace the Chaos.',
    lore: 'The Legend of the Ronin · AxoRonin',
    shinkai: 'The Lore of Shinkai · AxoRonin',
    collection: 'Collection · AxoRonin',
    roadmap: 'Roadmap · AxoRonin',
    clan: 'Join the Ronin Clan · AxoRonin',
    whitepaper: 'Whitepaper · AxoRonin',
    mint: 'Mint · AxoRonin',
  };

  function parseHash(){
    const raw = decodeURIComponent((location.hash || '#home').slice(1));
    const [route, anchor] = raw.split(':');
    return { route: route || 'home', anchor: anchor || null };
  }

  function showRoute(route, anchor, isInitial){
    const panels = document.querySelectorAll('.route-panel');
    let matched = false;
    panels.forEach(p => {
      const isMatch = p.dataset.route === route;
      p.classList.toggle('active', isMatch);
      if(isMatch) matched = true;
    });
    if(!matched){
      // Unknown route (or a plain in-page anchor): fall back to home.
      document.querySelector('.route-panel[data-route="home"]')?.classList.add('active');
      if(!anchor && document.getElementById(route)) anchor = route;
      route = 'home';
    }

    // Non-home panels start at display:none, so reveal their content right
    // away instead of waiting on scroll observers that may never fire.
    if(route !== 'home'){
      const panel = document.querySelector(`.route-panel[data-route="${route}"]`);
      panel?.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
      panel?.querySelectorAll('.phase').forEach(el => el.classList.add('in-view'));
    }

    const currentHash = anchor ? `${route}:${anchor}` : route;
    document.querySelectorAll('.nav-links a, .mobile-links a, .footer-links a').forEach(a => {
      const linkHash = (a.getAttribute('href') || '').replace('#', '');
      const active = linkHash === currentHash;
      a.classList.toggle('active', active);
      if(active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });

    window.AXORONIN_closeMenu?.(false);

    if(anchor){
      requestAnimationFrame(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: reducedMotion || isInitial ? 'auto' : 'smooth', block: 'start' });
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
      // Move focus to the new page for keyboard / screen-reader users.
      if(!isInitial) document.getElementById('main')?.focus({ preventScroll: true });
    }

    document.title = TITLES[route] || TITLES.home;
  }

  window.addEventListener('hashchange', () => {
    const { route, anchor } = parseHash();
    showRoute(route, anchor, false);
  });

  const start = () => { const { route, anchor } = parseHash(); showRoute(route, anchor, true); };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
