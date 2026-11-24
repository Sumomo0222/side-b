/* ============================================================
   SIDE B · 应用逻辑
   路由 / 唱片墙拖拽 / 筛选 / 详情 / 收藏 / 购物车 / 优惠码 / 结算 / 试听
   ============================================================ */
(() => {
  'use strict';
  const D = window.SIDEB;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const yuan = n => '¥' + Number(n).toLocaleString('zh-CN');
  const coverURL = r => D.assets.coverBase + r.cover;
  const audioURL = r => D.assets.audioBase + r.preview;

  /* ---------- 持久化状态 ---------- */
  const LS = 'sideb_v1';
  const state = Object.assign({
    cart: [],        // [{id, qty}]
    favs: [],        // [id]
    promo: null,     // code
    filters: { genre: 'all', decade: 'all', price: 'all', condition: 'all', sort: 'featured' }
  }, JSON.parse(localStorage.getItem(LS) || '{}'));
  const save = () => localStorage.setItem(LS, JSON.stringify(state));

  /* ---------- 通用 ---------- */
  function toast(html) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = html;
    $('#toasts').appendChild(t);
    setTimeout(() => t.remove(), 2900);
  }
  function promoOf(code) { return D.promoCodes[String(code || '').trim().toUpperCase()] || (code && D.promoCodes[String(code).trim()]) || null; }

  function totals() {
    const items = state.cart.map(ci => ({ rec: D.find(ci.id), qty: ci.qty })).filter(x => x.rec);
    const subtotal = items.reduce((s, x) => s + x.rec.price * x.qty, 0);
    let discount = 0, shipFreeByPromo = false;
    const p = state.promo && promoOf(state.promo);
    if (p) {
      if (p.type === 'percent') discount = Math.round(subtotal * p.value / 100);
      if (p.type === 'fixed' && subtotal >= 100) discount = Math.min(p.value, subtotal);
      if (p.type === 'shipping') shipFreeByPromo = true;
    }
    const after = subtotal - discount;
    const freeShip = subtotal > 0 && (after >= D.store.freeShippingOver || shipFreeByPromo);
    const shipping = freeShip ? 0 : (subtotal > 0 ? D.store.shippingFee : 0);
    return { items, subtotal, discount, shipping, total: after + shipping, freeShip, promo: p };
  }

  /* ============================================================
     路由
     ============================================================ */
  function parseHash() {
    const h = location.hash || '#/';
    if (h.startsWith('#/vinyl/')) return { view: 'product', id: decodeURIComponent(h.slice(8)) };
    const sec = h.includes('limited') ? 'limitedGrid' : h.includes('about') ? 'about' : null;
    return { view: 'wall', sec };
  }
  function route() {
    closeAll();
    const r = parseHash();
    $('#view-wall').hidden = r.view !== 'wall';
    $('#view-product').hidden = r.view !== 'product';
    if (r.view === 'product') renderProduct(r.id);
    requestAnimationFrame(() => {
      if (r.sec) { const el = document.getElementById(r.sec); el && el.scrollIntoView({ behavior: 'smooth' }); }
      else window.scrollTo(0, 0);
    });
  }
  window.addEventListener('hashchange', route);

  /* ============================================================
     筛选
     ============================================================ */
  function applyFilters(list) {
    const f = state.filters;
    let out = list.filter(r =>
      (f.genre === 'all' || r.genre === f.genre) &&
      (f.decade === 'all' || r.decade === f.decade) &&
      (f.condition === 'all' ||
        (f.condition === 'used' ? ['nm', 'vg+', 'vg'].includes(r.condition) : r.condition === f.condition)));
    if (f.price === 'lt150') out = out.filter(r => r.price < 150);
    if (f.price === '150-250') out = out.filter(r => r.price >= 150 && r.price <= 250);
    if (f.price === '250-500') out = out.filter(r => r.price > 250 && r.price <= 500);
    if (f.price === 'gte500') out = out.filter(r => r.price > 500);
    const by = {
      featured: (a, b) => (a.featured ?? 99) - (b.featured ?? 99) || a.id.localeCompare(b.id),
      priceAsc: (a, b) => a.price - b.price,
      priceDesc: (a, b) => b.price - a.price,
      yearDesc: (a, b) => b.year - a.year,
      yearAsc: (a, b) => a.year - b.year
    }[f.sort] || (() => 0);
    return out.sort(by);
  }

  function initFilters() {
    const F = D.facets;
    $('#genreChips').innerHTML =
      `<button class="chip on" data-genre="all">全部曲风</button>` +
      F.genres.map(g => `<button class="chip" data-genre="${esc(g)}">${esc(g)}</button>`).join('');
    $('#genreChips').addEventListener('click', e => {
      const b = e.target.closest('[data-genre]'); if (!b) return;
      state.filters.genre = b.dataset.genre; save();
      $$('#genreChips .chip').forEach(c => c.classList.toggle('on', c === b));
      renderWall();
    });
    const fill = (sel, opts) => $(sel).innerHTML = opts.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('');
    fill('#selDecade', [['all', '全部年代'], ...F.decades.map(d => [d, d])]);
    fill('#selPrice', F.priceBands.map(p => [p.key, p.label]));
    fill('#selCondition', F.conditions.map(c => [c.key, c.label]));
    fill('#selSort', F.sorts.map(s => [s.key, s.label]));
    const bind = (sel, key) => {
      $(sel).value = state.filters[key];
      $(sel).addEventListener('change', e => { state.filters[key] = e.target.value; save(); renderWall(); });
    };
    bind('#selDecade', 'decade'); bind('#selPrice', 'price'); bind('#selCondition', 'condition'); bind('#selSort', 'sort');
    $('#btnClear').addEventListener('click', () => {
      state.filters = { genre: 'all', decade: 'all', price: 'all', condition: 'all', sort: 'featured' }; save();
      ['selDecade', 'selPrice', 'selCondition', 'selSort'].forEach((s, i) => $(`#${s}`).value = 'all');
      $$('#genreChips .chip').forEach(c => c.classList.toggle('on', c.dataset.genre === 'all'));
      renderWall();
    });
  }

  /* ============================================================
     唱片墙
     ============================================================ */
  function recordHTML(r, i) {
    const tilt = (((r.id.charCodeAt(4) * 7 + i * 13) % 9) - 4) * 0.7;
    const used = ['nm', 'vg+', 'vg'].includes(r.condition);
    return `
    <article class="record${used ? ' used' : ''}" data-id="${r.id}" tabindex="0" role="link"
             aria-label="${esc(r.artist)}《${esc(r.album)}》，前往详情"
             style="--tilt:${tilt}deg; --vinyl:${esc(r.vinyl.hex)}; --label:${esc(r.vinyl.hex)}">
      <div class="sleeve"><img src="${coverURL(r)}" alt="${esc(r.artist)}《${esc(r.album)}》唱片封面" loading="lazy" draggable="false"></div>
      <div class="vinyl" aria-hidden="true"></div>
      ${r.limited ? `<div class="stamp" aria-label="限量发售">限量<i>№ ${r.limited.total - r.limited.remaining + 1}起</i></div>` : ''}
      <div class="price-tag">${yuan(r.price)}</div>
      <div class="info-card">
        <div class="ic-artist">${esc(r.artist)} · ${r.year}</div>
        <h4>《${esc(r.album)}》</h4>
        <dl>
          <dt>曲风</dt><dd>${esc(r.genre)}</dd>
          <dt>曲目</dt><dd>${r.tracks} 首</dd>
          <dt>版本</dt><dd>${esc(r.vinyl.name)}</dd>
          <dt>品相</dt><dd>${esc(r.conditionLabel)}</dd>
        </dl>
        <div class="ic-foot">
          <span class="ic-price">${yuan(r.price)}</span>
          <span class="ic-go">点击看详情 →</span>
        </div>
      </div>
    </article>`;
  }

  function renderWall() {
    const wall = $('#wall');
    const list = applyFilters(D.records.slice());
    $('#wallCount').textContent = `共 ${list.length} 张 · 按住任意处，左右拖动`;
    $('#btnClear').hidden = Object.entries(state.filters).every(([k, v]) => v === 'all' || (k === 'sort' && v === 'featured'));

    if (!list.length) {
      wall.innerHTML = `<div class="drawer-empty" style="width:100%"><div class="de-disc"></div>
        <p>这面墙上暂时没有符合条件的唱片</p>
        <button class="btn ghost small" onclick="document.getElementById('btnClear').click()">清除筛选</button></div>`;
      return;
    }
    const rows = list.length >= 8 ? 2 : 1;
    const per = Math.ceil(list.length / rows);
    let html = '';
    for (let r = 0; r < rows; r++) {
      const slice = list.slice(r * per, (r + 1) * per);
      if (!slice.length) continue;
      html += `<div class="shelf-row">${slice.map((rec, i) => recordHTML(rec, i)).join('')}</div>
               <div class="shelf-board" style="width:${slice.length * 256 + 120}px"></div>`;
    }
    wall.innerHTML = html;
    wall.scrollLeft = 0;
  }

  function openRecord(id) { location.hash = '#/vinyl/' + id; }

  /* 拖动浏览（鼠标惯性 + 触屏原生滚动 + 滚轮横移） */
  function initWallDrag() {
    const wall = $('#wall');
    let down = null, moved = false, vel = 0, lastX = 0, lastT = 0, raf = null;

    wall.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse') return;
      down = { x: e.clientX, sl: wall.scrollLeft };
      moved = false; vel = 0; lastX = e.clientX; lastT = performance.now();
      cancelAnimationFrame(raf);
      wall.classList.add('dragging');
    });
    wall.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - down.x;
      if (Math.abs(dx) > 5) moved = true;
      wall.scrollLeft = down.sl - dx;
      const t = performance.now();
      if (t - lastT > 12) { vel = (e.clientX - lastX) / (t - lastT); lastX = e.clientX; lastT = t; }
    });
    const endDrag = () => {
      if (!down) return;
      down = null;
      wall.classList.remove('dragging');
      const step = () => {
        wall.scrollLeft -= vel * 14;
        vel *= 0.93;
        if (Math.abs(vel) > 0.06) raf = requestAnimationFrame(step);
      };
      if (Math.abs(vel) > 0.3) raf = requestAnimationFrame(step);
    };
    wall.addEventListener('pointerup', endDrag);
    wall.addEventListener('pointerleave', endDrag);
    wall.addEventListener('click', e => {
      if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; return; }
      const rec = e.target.closest('.record');
      if (rec) openRecord(rec.dataset.id);
    }, true);
    wall.addEventListener('keydown', e => {
      if (e.key === 'Enter') { const rec = e.target.closest('.record'); rec && openRecord(rec.dataset.id); }
      if (e.key === 'ArrowRight') wall.scrollBy({ left: 300, behavior: 'smooth' });
      if (e.key === 'ArrowLeft') wall.scrollBy({ left: -300, behavior: 'smooth' });
    });
    wall.addEventListener('wheel', e => {
      const d = e.deltaY || e.deltaX;
      const max = wall.scrollWidth - wall.clientWidth;
      const canGo = d > 0 ? wall.scrollLeft < max - 2 : wall.scrollLeft > 2;
      if (Math.abs(d) > Math.abs(e.deltaX) && canGo) { e.preventDefault(); wall.scrollLeft += d; }
    }, { passive: false });

    $('#wallPrev').addEventListener('click', () => wall.scrollBy({ left: -Math.max(320, wall.clientWidth * .7), behavior: 'smooth' }));
    $('#wallNext').addEventListener('click', () => wall.scrollBy({ left: Math.max(320, wall.clientWidth * .7), behavior: 'smooth' }));

    const hint = $('#dragHint');
    const hideHint = () => hint.classList.add('hide');
    wall.addEventListener('pointerdown', hideHint, { once: true });
    $('#wallNext').addEventListener('click', hideHint, { once: true });
  }

  /* ============================================================
     限量卡片
     ============================================================ */
  function renderLimited() {
    const ltd = D.records.filter(r => r.limited);
    $('#limitedGrid').innerHTML = ltd.map(r => {
      const sold = r.limited.total - r.limited.remaining;
      const pct = Math.round(sold / r.limited.total * 100);
      return `
      <a class="ltd-card" href="#/vinyl/${r.id}">
        <div class="ltd-thumb">
          <img src="${coverURL(r)}" alt="《${esc(r.album)}》封面">
          <span class="ltd-num">№ ${sold + 1} 起</span>
        </div>
        <div class="ltd-info">
          <h3>《${esc(r.album)}》</h3>
          <div class="ltd-artist">${esc(r.artist)} · ${r.year} · ${esc(r.genre)}</div>
          <div class="ltd-progress">
            <div class="lp-track"><i class="lp-fill" style="width:${pct}%"></i></div>
            <div class="lp-label"><span>已售 <b>${sold}</b> / ${r.limited.total}</span><span>仅剩 <b>${r.limited.remaining}</b> 张</span></div>
          </div>
          <p class="ltd-note">${esc(r.limited.note)}</p>
          <div class="ltd-foot"><span class="ltd-price">${yuan(r.price)}</span><span class="ltd-go">查看详情 →</span></div>
        </div>
      </a>`;
    }).join('');
  }

  /* ============================================================
     商品详情
     ============================================================ */
  function metaRow(dt, dd) { return `<div><dt>${dt}</dt><dd>${dd}</dd></div>`; }

  function renderProduct(id) {
    const rec = D.find(id);
    const view = $('#view-product');
    if (!rec) { view.innerHTML = `<div class="drawer-empty" style="padding-top:80px"><p>没有找到这张唱片，可能已被买走了。</p><a class="btn small" style="margin-top:14px" href="#/">回到唱片墙</a></div>`; return; }
    const used = ['nm', 'vg+', 'vg'].includes(rec.condition);
    const ltd = rec.limited;
    const sold = ltd ? ltd.total - ltd.remaining : 0;
    const pct = ltd ? Math.round(sold / ltd.total * 100) : 0;
    const stockTxt = rec.stock <= 3 ? `<b class="low">仅剩 ${rec.stock} 张</b>` : `<b>有货</b>（剩 ${rec.stock} 张）`;
    const rel = D.records.filter(r => r.id !== rec.id && (r.genre === rec.genre || r.decade === rec.decade)).slice(0, 6);
    const faved = state.favs.includes(rec.id);

    const trackCol = (side, arr) => `
      <div>
        <span class="side-label"><i>${side}</i>${side} 面 · ${arr.length} 首</span>
        ${arr.map(([n, d], i) => `<div class="track"><span class="t-no">${side}${i + 1}</span><span class="t-name">${esc(n)}</span><span class="t-dots"></span><span class="t-dur">${d}</span></div>`).join('')}
      </div>`;

    view.innerHTML = `
    <nav class="crumb"><a href="#/">← 唱片墙</a> ／ ${esc(rec.genre)} ／ ${esc(rec.artist)}</nav>
    <div class="product-wrap">
      <div class="p-stage">
        <div class="p-stage-inner" id="pStage" title="点击抽出唱片">
          <div class="p-disc" id="pDisc" style="--vinyl:${esc(rec.vinyl.hex)}; --label:${esc(rec.vinyl.hex)}">
            <div class="vinyl" aria-hidden="true"></div>
            <div class="sleeve"><img src="${coverURL(rec)}" alt="《${esc(rec.album)}》封面"></div>
          </div>
          <div class="p-hint" id="pHint">点击封面 · 抽出唱片</div>
        </div>
        <div class="p-thumbs">
          <button class="p-thumb on" id="thSleeve"><img src="${coverURL(rec)}" alt="封面缩略"></button>
          <button class="p-thumb vinyl-th" id="thVinyl" title="${esc(rec.vinyl.name)}"><i style="--vinyl:${esc(rec.vinyl.hex)}; --label:${esc(rec.vinyl.hex)}"></i></button>
          <div style="align-self:center; font-size:12.5px; color:var(--ink-soft); letter-spacing:.08em; margin-left:6px">
            本碟：${esc(rec.vinyl.name)} · ${esc(rec.edition.split('·')[0].trim())}
          </div>
        </div>
      </div>

      <div class="p-info">
        <div class="p-artist">${esc(rec.artist)}</div>
        <h1 class="p-title">《${esc(rec.album)}》<span style="font-size:.4em; color:var(--ink-soft); font-weight:400"> ${rec.year}</span></h1>
        <div class="p-catalog">${esc(rec.label)} · 编号 ${esc(rec.catalog)} · ${rec.tracks} 首曲目</div>
        <div class="p-badges">
          ${ltd ? `<span class="p-badge hot">限量 ${ltd.total} 张 · 编号发售</span>` : ''}
          <span class="p-badge">${esc(rec.conditionLabel)}</span>
          ${rec.originalPrice ? `<span class="p-badge warn">特价中</span>` : ''}
          <span class="p-badge">${esc(rec.genre)} / ${rec.decade}</span>
        </div>
        <p class="p-desc">${esc(rec.description)}</p>

        <dl class="p-meta">
          ${metaRow('发行年份', rec.year + ' 年')}
          ${metaRow('曲风', esc(rec.genre))}
          ${metaRow('厂牌', esc(rec.label) + '（虚构）')}
          ${metaRow('碟片颜色', `<span class="swatch" style="--sw:${esc(rec.vinyl.hex)}"><i></i>${esc(rec.vinyl.name)}</span>`)}
          ${metaRow('版本', esc(rec.edition))}
          ${metaRow('品相', `${esc(rec.conditionLabel)} · <a href="#" data-info="grading" style="font-size:12.5px; color:var(--ink-soft)">品相等级说明</a>`)}
        </dl>

        ${ltd ? `
        <div class="p-limited">
          <h5>限量编号发售 · 已售 ${sold} ／ ${ltd.total} 张</h5>
          <div class="lp-track"><i class="lp-fill" style="width:${pct}%"></i></div>
          <div class="lp-label"><span>库存编号 № ${String(sold + 1).padStart(3, '0')} – ${String(ltd.total).padStart(3, '0')}</span><span>仅剩 <b>${ltd.remaining}</b> 张</span></div>
          <p class="ltd-note" style="margin-top:6px">${esc(ltd.note)}</p>
        </div>` : ''}

        <div class="p-buy">
          <div class="p-price"><small>¥</small>${rec.price.toLocaleString('zh-CN')}${rec.originalPrice ? `<s>${yuan(rec.originalPrice)}</s>` : ''}</div>
          <div class="p-stock">${stockTxt}<br><span style="font-size:12px">满 ${yuan(D.store.freeShippingOver)} 免运费</span></div>
        </div>
        <div class="p-actions">
          <span class="qty">
            <button id="qMinus" aria-label="减少数量">−</button>
            <output id="qVal">1</output>
            <button id="qPlus" aria-label="增加数量">＋</button>
          </span>
          <button class="btn" id="btnAdd">加入购物车</button>
          <button class="btn ghost ${faved ? 'faved' : ''}" id="btnFavToggle">${faved ? '♥ 已收藏' : '♡ 收藏'}</button>
          <button class="btn ghost" id="btnPreview">▶ 试听片段</button>
        </div>

        <div class="p-tracks">
          <div class="track-cols">${trackCol('A', rec.tracklist.A)}${trackCol('B', rec.tracklist.B)}</div>
          <p class="track-note">▶ 本页试听为店铺自制 12 秒片段（虚构旋律），正版音质请以实体唱片为准。</p>
        </div>
      </div>
    </div>

    <div class="p-related">
      <h3>同好也在听</h3>
      <div class="rel-row">${rel.map(r => `
        <a class="rel-card" href="#/vinyl/${r.id}">
          <div class="rel-thumb"><img src="${coverURL(r)}" alt="《${esc(r.album)}》封面"></div>
          <h5>《${esc(r.album)}》</h5>
          <span>${esc(r.artist)} · ${r.year}</span>
          <div class="rp">${yuan(r.price)}</div>
        </a>`).join('')}</div>
    </div>`;

    /* --- 详情页交互 --- */
    let qty = 1;
    const qVal = $('#qVal');
    $('#qMinus').addEventListener('click', () => { qty = Math.max(1, qty - 1); qVal.textContent = qty; });
    $('#qPlus').addEventListener('click', () => { qty = Math.min(Math.min(rec.stock, 9), qty + 1); qVal.textContent = qty; });

    const stage = $('#pStage'), disc = $('#pDisc'), hint = $('#pHint');
    const pull = on => { disc.classList.toggle('pulled', on); hint.textContent = on ? '点击收回 · 唱片' : '点击封面 · 抽出唱片'; };
    stage.addEventListener('click', () => pull(!disc.classList.contains('pulled')));

    $('#thSleeve').addEventListener('click', () => pull(false));
    $('#thVinyl').addEventListener('click', () => pull(true));

    $('#btnAdd').addEventListener('click', () => {
      addToCart(rec.id, qty);
      openDrawer('cart');
    });
    $('#btnFavToggle').addEventListener('click', () => {
      toggleFav(rec.id);
      const now = state.favs.includes(rec.id);
      $('#btnFavToggle').textContent = now ? '♥ 已收藏' : '♡ 收藏';
      $('#btnFavToggle').classList.toggle('faved', now);
    });
    $('#btnPreview').addEventListener('click', () => player.play(rec));
  }

  /* ============================================================
     试听播放器（音频文件缺失时自动切换合成音源）
     ============================================================ */
  const player = (() => {
    let audio = null, cur = null, synth = null, raf = null;
    const el = $('#player');
    function ui(rec, on) {
      el.hidden = !on;
      el.classList.toggle('on', on);
      $('#playerTitle').textContent = rec ? `《${rec.album}》试听` : '';
      $('#playerArtist').textContent = rec ? `${rec.artist} · 12s 片段` : '';
    }
    function stop() {
      if (audio) { audio.pause(); }
      if (synth) { try { synth.stop(); } catch (_) {} synth = null; }
      cancelAnimationFrame(raf);
      cur = null;
      el.hidden = true; el.classList.remove('on');
      document.querySelectorAll('.vinyl.spinning').forEach(v => v.classList.remove('spinning'));
    }
    function tick() {
      let pct = 0;
      if (audio && audio.duration) pct = audio.currentTime / audio.duration;
      else if (synth) pct = synth.progress();
      $('#playerBar').style.width = (pct * 100).toFixed(1) + '%';
      if (cur) raf = requestAnimationFrame(tick);
    }
    function play(rec) {
      if (cur && cur.id === rec.id) { stop(); return; }
      stop();
      cur = rec;
      $('#playerDisc').style.setProperty('--wine-2', rec.vinyl.hex);
      $('#playerDisc').style.background =
        `radial-gradient(circle at 32% 28%, rgba(255,255,255,.28), transparent 40%),` +
        `repeating-radial-gradient(circle, color-mix(in srgb, ${rec.vinyl.hex} 60%, #111) 0 1px, #241d17 1px 2.4px), #191512`;
      ui(rec, true);
      audio = audio || new Audio();
      audio.src = audioURL(rec);
      const pDisc = document.querySelector('#pDisc .vinyl');
      audio.addEventListener('error', () => { if (cur === rec) { synth = synthPlay(rec); if (pDisc) { pDisc.classList.add('pulled'); } } }, { once: true });
      audio.play().then(() => { if (pDisc) { pDisc.classList.add('spinning'); document.querySelector('#pDisc').classList.add('pulled'); } })
        .catch(() => { if (cur === rec) { synth = synthPlay(rec); } });
      audio.addEventListener('ended', stop, { once: true });
      tick();
    }
    $('#playerStop').addEventListener('click', stop);
    return { play, stop };
  })();

  /* 简易合成音源（兜底）：两小节氛围和弦 + 黑胶噪声 */
  function synthPlay(rec) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return { stop() {}, progress: () => 0 };
    const ctx = new AC();
    const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(.5, ctx.currentTime + .3);
    const dur = 12, t0 = ctx.currentTime;
    const rootM = 45 + (rec.id.charCodeAt(4) % 9);
    const chords = [[0, 3, 7, 10], [5, 8, 12, 15], [3, 7, 10, 14], [0, 3, 7, 10]];
    const oscs = [];
    chords.forEach((ch, i) => {
      const tb = t0 + i * 3;
      ch.forEach(iv => {
        const f = 440 * Math.pow(2, (rootM + iv - 69) / 12);
        [0, 1.7].forEach(det => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'triangle'; o.frequency.value = f * (1 + det / 700);
          g.gain.setValueAtTime(0, tb);
          g.gain.linearRampToValueAtTime(.05, tb + .5);
          g.gain.linearRampToValueAtTime(0, tb + 3.2);
          o.connect(g); g.connect(master); o.start(tb); o.stop(tb + 3.4);
          oscs.push(o);
        });
      });
    });
    // 唱针噪声
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let lp = 0;
    for (let i = 0; i < data.length; i++) {
      lp += (Math.random() * 2 - 1 - lp) * .03;
      data[i] = lp * .12 + (Math.random() < .0004 ? (Math.random() * 2 - 1) * .3 : 0);
    }
    const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
    noise.connect(master); noise.start(t0);
    const start = ctx.currentTime;
    return {
      progress: () => Math.min(1, (ctx.currentTime - start) / dur),
      stop() { try { master.gain.linearRampToValueAtTime(0, ctx.currentTime + .1); oscs.forEach(o => o.stop(ctx.currentTime + .15)); noise.stop(ctx.currentTime + .15); setTimeout(() => ctx.close(), 300); } catch (_) {} }
    };
  }

  /* ============================================================
     收藏
     ============================================================ */
  function toggleFav(id) {
    const i = state.favs.indexOf(id);
    const rec = D.find(id);
    if (i >= 0) { state.favs.splice(i, 1); toast(`已从收藏移除 <b>《${esc(rec.album)}》</b>`); }
    else { state.favs.push(id); toast(`已收藏 <b>《${esc(rec.album)}》</b> ♥`); }
    save(); syncBadges();
  }
  function renderFavs() {
    const box = $('#favList');
    if (!state.favs.length) {
      box.innerHTML = `<div class="drawer-empty"><div class="de-disc"></div><p>还没有收藏的唱片</p><p style="font-size:12.5px">在唱片墙上逛一逛，心动的先收起来。</p></div>`;
      return;
    }
    box.innerHTML = state.favs.map(id => {
      const r = D.find(id); if (!r) return '';
      const inCart = state.cart.some(c => c.id === id);
      return `<div class="fav-item">
        <a href="#/vinyl/${r.id}" data-close-drawer-link><img class="ci-thumb" style="transform:rotate(-2deg); border-radius:2px" src="${coverURL(r)}" alt=""></a>
        <div>
          <h4 style="font-size:14.5px">《${esc(r.album)}》</h4>
          <div class="ci-artist">${esc(r.artist)} · ${yuan(r.price)}</div>
          <div style="margin-top:8px; display:flex; gap:14px; align-items:center">
            <button class="btn small ${inCart ? 'ghost' : ''}" data-fav-add="${r.id}" ${inCart ? 'disabled style="opacity:.5"' : ''}>${inCart ? '已在购物车' : '加入购物车'}</button>
            <button class="ci-remove" data-fav-remove="${r.id}">移除收藏</button>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  /* ============================================================
     购物车
     ============================================================ */
  function addToCart(id, qty = 1) {
    const rec = D.find(id);
    const line = state.cart.find(c => c.id === id);
    const have = line ? line.qty : 0;
    const next = Math.min(have + qty, Math.min(rec.stock, 9));
    if (line) line.qty = next; else state.cart.push({ id, qty: next });
    save(); syncBadges();
    toast(`已加入购物车 <b>《${esc(rec.album)}》</b> × ${next - have || qty}`);
  }
  function setQty(id, qty) {
    const line = state.cart.find(c => c.id === id); if (!line) return;
    line.qty = Math.max(1, Math.min(qty, 9));
    save(); syncBadges(); renderCart();
  }
  function removeFromCart(id) {
    state.cart = state.cart.filter(c => c.id !== id);
    if (state.promo && !totals().items.length) state.promo = null;
    save(); syncBadges(); renderCart();
  }
  function renderCart() {
    const t = totals();
    const list = $('#cartList'), foot = $('#cartFoot');
    $('#cartDrawerCount').textContent = t.items.length ? `(${t.items.reduce((s, x) => s + x.qty, 0)} 件)` : '';
    if (!t.items.length) {
      list.innerHTML = `<div class="drawer-empty"><div class="de-disc"></div><p>购物车还是空的</p>
        <a class="btn small" href="#/" data-close-drawer-link>去唱片墙逛逛</a></div>`;
      foot.innerHTML = '';
      return;
    }
    list.innerHTML = t.items.map(({ rec, qty }) => `
      <div class="cart-item">
        <a href="#/vinyl/${rec.id}" data-close-drawer-link><span class="ci-thumb"><img src="${coverURL(rec)}" alt=""></span></a>
        <div class="ci-info">
          <h4>《${esc(rec.album)}》</h4>
          <div class="ci-artist">${esc(rec.artist)} · ${esc(rec.vinyl.name)}</div>
          <div class="ci-qty">
            <button data-dec="${rec.id}" aria-label="减少">−</button><b>${qty}</b><button data-inc="${rec.id}" aria-label="增加">＋</button>
            <button class="ci-remove" data-rm="${rec.id}" style="margin-left:auto">移除</button>
          </div>
        </div>
        <div class="ci-price">${yuan(rec.price * qty)}</div>
      </div>`).join('');

    const missing = t.subtotal - t.discount < D.store.freeShippingOver && !t.freeShip;
    foot.innerHTML = `
      ${state.promo && t.promo ? `
        <div class="promo-applied"><span>已用优惠码 <b>${esc(String(state.promo).toUpperCase())}</b> · ${esc(t.promo.label)}</span>
        <button id="promoRm">移除</button></div>` : `
        <div class="promo-row">
          <input id="promoInput" placeholder="输入优惠码，如 SIDEB10" autocomplete="off">
          <button class="btn ghost small" id="promoApply">使用</button>
        </div>
        <p class="drawer-note" id="promoMsg" style="margin:0 0 10px; text-align:left">试试 <b>SIDEB10</b>（9 折）或 <b>FREESHIP</b>（免运费）</p>`}
      <div class="sum-row"><span>小计</span><span>${yuan(t.subtotal)}</span></div>
      ${t.discount ? `<div class="sum-row"><span>优惠</span><span style="color:var(--wine)">−${yuan(t.discount)}</span></div>` : ''}
      <div class="sum-row"><span>运费${t.freeShip ? '（已免）' : ''}</span><span class="${t.freeShip ? 'free' : ''}">${t.freeShip ? 'FREE' : yuan(t.shipping)}</span></div>
      ${missing ? `<div class="sum-row" style="font-size:12px"><span>再买 ${yuan(D.store.freeShippingOver - (t.subtotal - t.discount))} 即可免运费</span><span></span></div>` : ''}
      <div class="sum-row total"><span>合计</span><span class="val">${yuan(t.total)}</span></div>
      <button class="btn" id="btnCheckout" style="width:100%; margin-top:14px">去结算</button>
      <p class="drawer-note">演示结算 · 不会产生真实扣款</p>`;

    foot.querySelector('#promoApply') && foot.querySelector('#promoApply').addEventListener('click', applyPromo);
    foot.querySelector('#promoInput') && foot.querySelector('#promoInput').addEventListener('keydown', e => { if (e.key === 'Enter') applyPromo(); });
    foot.querySelector('#promoRm') && foot.querySelector('#promoRm').addEventListener('click', () => { state.promo = null; save(); renderCart(); });
    foot.querySelector('#btnCheckout').addEventListener('click', openCheckout);
  }
  function applyPromo() {
    const input = $('#promoInput'), msg = $('#promoMsg');
    const code = (input.value || '').trim();
    if (!code) { msg.innerHTML = '先输入一个优惠码吧'; return; }
    const p = promoOf(code);
    if (!p) { msg.innerHTML = `<span style="color:#b3452e">「${esc(code)}」不是有效优惠码</span>`; return; }
    const t = totals();
    if (p.type === 'fixed' && t.subtotal < 100) { msg.innerHTML = `<span style="color:#b3452e">该码满 ¥100 可用</span>`; return; }
    state.promo = code.toUpperCase() in D.promoCodes ? code.toUpperCase() : code;
    save(); renderCart();
    toast(`优惠码已生效：<b>${esc(p.label)}</b>`);
  }

  /* ============================================================
     结算（模拟）
     ============================================================ */
  const CO = { step: 1, pay: 'cod', form: {} };
  function openCheckout() {
    const t = totals();
    if (!t.items.length) { toast('购物车还是空的'); return; }
    CO.step = 1;
    closeAll();
    $('#checkoutModal').hidden = false;
    $('#overlay').classList.add('show');
    renderCheckout();
  }
  function stepBar() {
    return `<div class="steps">
      ${[1, 2, 3].map(n => `<span class="step ${CO.step >= n ? 'on' : ''}" data-n="${n}">${['收货信息', '支付方式', '确认订单'][n - 1]}</span>`).join('')}
    </div>`;
  }
  function orderSummaryRows() {
    const t = totals();
    return `
      <div class="sum-row"><span>唱片 × ${t.items.reduce((s, x) => s + x.qty, 0)}</span><span>${yuan(t.subtotal)}</span></div>
      ${t.discount ? `<div class="sum-row"><span>优惠（${esc(String(state.promo).toUpperCase())}）</span><span style="color:var(--wine)">−${yuan(t.discount)}</span></div>` : ''}
      <div class="sum-row"><span>运费</span><span class="${t.freeShip ? 'free' : ''}">${t.freeShip ? 'FREE' : yuan(t.shipping)}</span></div>
      <div class="sum-row total"><span>应付</span><span class="val">${yuan(t.total)}</span></div>`;
  }
  function renderCheckout() {
    const body = $('#checkoutBody');
    const t = totals();
    if (CO.step === 1) {
      body.innerHTML = `
        <h3>收货信息</h3><p style="color:var(--ink-soft); font-size:13px">唱片会竖着躺在防压纸箱里来见你。</p>
        ${stepBar()}
        <div class="form-grid">
          <div class="form-row">
            <div class="field"><label>收货人 *</label><input id="fName" value="${esc(CO.form.name || '')}" placeholder="名字"></div>
            <div class="field"><label>手机号 *</label><input id="fPhone" value="${esc(CO.form.phone || '')}" placeholder="11 位手机号" inputmode="tel"></div>
          </div>
          <div class="field"><label>收货地址 *</label><textarea id="fAddr" rows="2" placeholder="省 / 市 / 区 · 街道门牌">${esc(CO.form.addr || '')}</textarea></div>
          <div class="field"><label>留言（选填）</label><input id="fNote" value="${esc(CO.form.note || '')}" placeholder="如：包装加固 / 周末送达"></div>
        </div>
        <div class="chk-actions">
          <button class="btn ghost" data-close-modal>返回购物车</button>
          <button class="btn" id="coNext1">下一步：支付方式</button>
        </div>`;
      $('#coNext1').addEventListener('click', () => {
        const name = $('#fName').value.trim(), phone = $('#fPhone').value.trim(), addr = $('#fAddr').value.trim();
        let ok = true;
        const mark = (id, bad) => { $(id).closest('.field').classList.toggle('invalid', bad); if (bad) ok = false; };
        mark('#fName', name.length < 1);
        mark('#fPhone', !/^1[\d- ]{8,}$/.test(phone.replace(/\s/g, '')) && phone.replace(/\D/g, '').length < 7);
        mark('#fAddr', addr.length < 5);
        if (!ok) return;
        CO.form = { name, phone, addr, note: $('#fNote').value.trim() };
        CO.step = 2; renderCheckout();
      });
    } else if (CO.step === 2) {
      const pays = [
        ['cod', '货到付款', '配送员上门，当面验货后付款'],
        ['bank', '银行转账', '下单后 48 小时内转账至店account，备注订单号'],
        ['wallet', '叮当钱包（虚构）', '演示用电子钱包，秒到账']
      ];
      body.innerHTML = `
        <h3>支付方式</h3><p style="color:var(--ink-soft); font-size:13px">演示站点 · 不会产生真实扣款。</p>
        ${stepBar()}
        <div class="pay-options">${pays.map(([k, n, d]) => `
          <button class="pay-opt ${CO.pay === k ? 'on' : ''}" data-pay="${k}"><i></i>
            <span>${n}<small>${d}</small></span>
          </button>`).join('')}</div>
        <div class="chk-actions">
          <button class="btn ghost" id="coBack2">上一步</button>
          <button class="btn" id="coNext2">下一步：确认订单</button>
        </div>`;
      $$('[data-pay]', body).forEach(b => b.addEventListener('click', () => { CO.pay = b.dataset.pay; renderCheckout(); }));
      $('#coBack2').addEventListener('click', () => { CO.step = 1; renderCheckout(); });
      $('#coNext2').addEventListener('click', () => { CO.step = 3; renderCheckout(); });
    } else if (CO.step === 3) {
      body.innerHTML = `
        <h3>确认订单</h3><p style="color:var(--ink-soft); font-size:13px">最后核对一遍，唱片就打包。</p>
        ${stepBar()}
        <div class="review-box"><h5>收货信息</h5>
          <p>${esc(CO.form.name)} · ${esc(CO.form.phone)}</p><p>${esc(CO.form.addr)}</p>
          ${CO.form.note ? `<p style="color:var(--ink-soft)">留言：${esc(CO.form.note)}</p>` : ''}</div>
        <div class="review-box"><h5>支付方式</h5><p>${ { cod: '货到付款', bank: '银行转账', wallet: '叮当钱包' }[CO.pay] }</p></div>
        <div class="review-box"><h5>商品</h5>
          ${t.items.map(({ rec, qty }) => `<p>《${esc(rec.album)}》× ${qty} — ${yuan(rec.price * qty)}</p>`).join('')}
          <div style="margin-top:8px">${orderSummaryRows()}</div></div>
        <div class="chk-actions">
          <button class="btn ghost" id="coBack3">上一步</button>
          <button class="btn" id="coPlace">提交订单 · ${yuan(t.total)}</button>
        </div>`;
      $('#coBack3').addEventListener('click', () => { CO.step = 2; renderCheckout(); });
      $('#coPlace').addEventListener('click', () => {
        $('#coPlace').textContent = '正在打包…';
        $('#coPlace').disabled = true;
        setTimeout(() => {
          const no = 'SB' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + String(1000 + Math.floor(Math.random() * 9000));
          body.innerHTML = `
            <div class="order-done">
              <div class="order-stamp">订单<br>已确认</div>
              <h3>谢谢，${esc(CO.form.name)}！</h3>
              <div class="order-no">订单号 ${no}</div>
              <p>${t.items.reduce((s, x) => s + x.qty, 0)} 张唱片将在 2 天内发出<br>支付方式：${ { cod: '货到付款', bank: '银行转账', wallet: '叮当钱包' }[CO.pay] } · 应付 <b style="color:var(--wine)">${yuan(t.total)}</b></p>
              <p style="margin-top:10px; font-size:12.5px">演示订单已生成，未发生真实交易。</p>
              <button class="btn" id="coDone" style="margin-top:18px">继续淘盘</button>
            </div>`;
          state.cart = []; state.promo = null; save(); syncBadges(); renderCart();
          $('#coDone').addEventListener('click', () => { closeAll(); location.hash = '#/'; });
        }, 900);
      });
    }
  }

  /* ============================================================
     抽屉 / 弹层 开合
     ============================================================ */
  function openDrawer(which) {
    closeAll();
    if (which === 'cart') renderCart(); else renderFavs();
    $(which === 'cart' ? '#cartDrawer' : '#favDrawer').classList.add('show');
    $('#overlay').classList.add('show');
  }
  function closeAll() {
    $$('.drawer').forEach(d => d.classList.remove('show'));
    $$('.modal').forEach(m => m.hidden = true);
    $('#overlay').classList.remove('show');
  }
  function openInfo(key) {
    const C = {
      grading: `<h3>品相等级说明</h3><p style="color:var(--ink-soft); font-size:13px">本店按国际通行的 Goldmine 分级标注每一张二手唱片。</p>
        <h4>SS / 全新未拆（Sealed）</h4><p>出厂原封，膜完整。适合收藏与送礼。</p>
        <h4>M / NM 近乎全新</h4><p>拆封但几乎无使用痕迹，播放无瑕疵。</p>
        <h4>VG+ 佳品</h4><p>有轻微使用痕迹，偶尔几声轻微炒豆，不影响聆听。</p>
        <h4>VG 良好</h4><p>明显使用痕迹，有可闻噪声，价格友好——适合真正会去听它的人。</p>
        <p style="margin-top:14px; font-size:12.5px; color:var(--ink-soft)">注：本店所有分级均针对虚构唱片，仅供参考玩法演示。</p>`,
      shipping: `<h3>运费与包装</h3>
        <h4>运费</h4><ul><li>订单满 ${yuan(D.store.freeShippingOver)} 免运费</li><li>未满收 ${yuan(D.store.shippingFee)}（虚构快递「蜗牛快跑」承运）</li><li>限量编号唱片默认保价寄出</li></ul>
        <h4>包装</h4><ul><li>唱片一律竖放，牛皮纸 + 硬纸角 + 防潮内袋</li><li>雨天发货额外加防水袋</li></ul>`,
      faq: `<h3>常见问题</h3>
        <h4>二手唱片可以退吗？</h4><p>收货 7 天内，若实物与品相描述不符，包退包换；因个人喜好退货需自付运费。</p>
        <h4>试听片段是什么？</h4><p>本页试听均为店主自制的 12 秒原创虚构片段，仅作演示；站点全部内容均为虚构。</p>
        <h4>限量编号怎么算？</h4><p>按下单顺序发放编号，页面上的「剩余编号」实时更新，售完即止。</p>
        <h4>可以到店试听吗？</h4><p>可以，退线市旧港街 33⅓ 号，每天 13:00–23:00，欢迎带咖啡来坐。</p>`
    }[key];
    if (!C) return;
    closeAll();
    $('#infoBody').innerHTML = C;
    $('#infoModal').hidden = false;
    $('#overlay').classList.add('show');
  }

  /* ============================================================
     徽标 / 启动
     ============================================================ */
  function syncBadges() {
    const cq = state.cart.reduce((s, x) => s + x.qty, 0);
    const cb = $('#cartCount'), fb = $('#favCount');
    cb.hidden = !cq; cb.textContent = cq;
    fb.hidden = !state.favs.length; fb.textContent = state.favs.length;
  }

  function boot() {
    initFilters();
    renderWall();
    renderLimited();
    initWallDrag();
    syncBadges();

    $('#btnCart').addEventListener('click', () => openDrawer('cart'));
    $('#btnFav').addEventListener('click', () => openDrawer('fav'));
    $('#overlay').addEventListener('click', closeAll);
    document.addEventListener('click', e => {
      if (e.target.closest('[data-close-drawer]')) { closeAll(); return; }
      if (e.target.closest('[data-close-modal]')) { closeAll(); return; }
      const link = e.target.closest('[data-close-drawer-link]');
      if (link) setTimeout(closeAll, 60);
      const info = e.target.closest('[data-info]');
      if (info) { e.preventDefault(); openInfo(info.dataset.info); }
      const favAdd = e.target.closest('[data-fav-add]');
      if (favAdd) { addToCart(favAdd.dataset.favAdd, 1); renderFavs(); openDrawer('cart'); }
      const favRm = e.target.closest('[data-fav-remove]');
      if (favRm) { state.favs = state.favs.filter(f => f !== favRm.dataset.favRemove); save(); syncBadges(); renderFavs(); }
      const inc = e.target.closest('[data-inc]');
      if (inc) setQty(inc.dataset.inc, (state.cart.find(c => c.id === inc.dataset.inc) || {}).qty + 1);
      const dec = e.target.closest('[data-dec]');
      if (dec) { const l = state.cart.find(c => c.id === dec.dataset.dec); if (l && l.qty <= 1) removeFromCart(dec.dataset.dec); else setQty(dec.dataset.dec, l.qty - 1); }
      const rm = e.target.closest('[data-rm]');
      if (rm) removeFromCart(rm.dataset.rm);
    });
    $('#btnMenu').addEventListener('click', toggleMobileNav);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
    route();
  }
  function toggleMobileNav() {
    let nav = $('#mobileNav');
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'mobile-nav'; nav.id = 'mobileNav';
      nav.innerHTML = `<a href="#/">唱片墙</a><a href="#/#limited">限量发售</a><a href="#/#about">关于 SIDE B</a>`;
      document.body.appendChild(nav);
      nav.addEventListener('click', e => { if (e.target.tagName === 'A') nav.classList.remove('show'); });
    }
    nav.classList.toggle('show');
  }

  boot();
})();
