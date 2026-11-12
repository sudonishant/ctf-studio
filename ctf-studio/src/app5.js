/* ============================================================
   CTF STUDIO v5.0 — App logic (PRO UI)
   Adds: command palette, themes, favourite ops, history,
          resizable panes, mobile nav, tabbed rail
   ============================================================ */
(function () {
  'use strict';
  const { OPS, CAT_ORDER, quickDetect, detectFlags, scoreText } = window.CTF_OPS;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const el = {
    input: $('#input'), output: $('#output'), chips: $('#chips'), list: $('#oplist'), cats: $('#cats'),
    steps: $('#steps'), recipeCount: $('#recipeCount'), inStats: $('#inStats'), outStats: $('#outStats'),
    scoreBadge: $('#scoreBadge'), flagBadge: $('#flagBadge'), viaInfo: $('#viaInfo'),
    toast: $('#toast'), drawer: $('#drawer'), opCount: $('#opCount'), sampleSel: $('#sampleSel'),
    cmdk: $('#cmdk'), cmdInput: $('#cmdInput'), cmdRes: $('#cmdRes'), cmdCount: $('#cmdCount'),
    hist: $('#hist'), sidebar: $('#sidebar'), rail: $('#rail'), io: $('#io'), rz: $('#rz')
  };
  const opById = (id) => OPS.find((o) => o.id === id);
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('ctf5.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('ctf5.' + k, JSON.stringify(v)); } catch (e) {} }
  };

  let recipe = [];
  let activeCat = 'ALL';
  let lastOutput = '';
  let stepErrors = {};
  let favOnly = false;
  let favs = new Set(LS.get('favs', []));
  let history = LS.get('hist', []);
  let theme = LS.get('theme', 'cyber');
  let activeTab = 'recipe';
  let cmdSel = 0, cmdResults = [];

  /* ---------------- toast ---------------- */
  let toastTimer;
  function toast(msg, kind) {
    el.toast.textContent = msg;
    el.toast.className = 'toast show' + (kind ? ' ' + kind : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove('show'), 2100);
  }

  /* ---------------- theme ---------------- */
  const THEMES = ['cyber', 'matrix', 'amber', 'light'];
  function applyTheme(t) {
    theme = t;
    document.documentElement.dataset.theme = t;
    LS.set('theme', t);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = ({ cyber: '#060910', matrix: '#030804', amber: '#0b0904', light: '#f3f6fb' })[t];
    const btn = $('#btnTheme');
    if (btn) btn.title = 'Theme: ' + t + ' (Ctrl+Shift+L)';
  }
  function cycleTheme() {
    const i = THEMES.indexOf(theme);
    applyTheme(THEMES[(i + 1) % THEMES.length]);
    toast('🎨 Theme: ' + theme);
  }
  $('#btnTheme').onclick = cycleTheme;

  /* ---------------- op list ---------------- */
  function catIcon(cat) {
    return ({ Advanced: '🚀', CryptoHack: '🎓', Base: '🔢', Encoding: '🧱', Cipher: '🔐', Classical: '🏛', Crypto: '⚙️', RSA: '🧮', Modern: '🛡', Analysis: '🔬', Text: '📝', Misc: '🧩', Stego: '🖼' })[cat] || '•';
  }

  function renderCats() {
    const cats = ['ALL', ...CAT_ORDER];
    el.cats.innerHTML = cats.map((c) =>
      `<button class="cat ${c === activeCat ? 'active' : ''}" data-cat="${c}">${c === 'ALL' ? 'Sab' : c}</button>`
    ).join('');
    el.cats.querySelectorAll('.cat').forEach((b) => b.onclick = () => { activeCat = b.dataset.cat; renderCats(); renderOps(); });
  }

  function renderOps() {
    const q = ($('#opSearch') && $('#opSearch').value || '').trim().toLowerCase();
    let list = OPS.filter((o) => (activeCat === 'ALL' || o.cat === activeCat) && (!favOnly || favs.has(o.id)));
    if (q) {
      list = list.filter((o) =>
        o.name.toLowerCase().includes(q) || o.id.includes(q) ||
        (o.keywords || []).some((k) => k.includes(q)) || o.cat.toLowerCase().includes(q));
    }
    if (!list.length) {
      el.list.innerHTML = `<div class="empty"><div class="big">🔍</div>Kuch nahi mila${favOnly ? '<br><span style="font-size:10.5px">Favourites khali hain</span>' : ''}</div>`;
      return;
    }
    let html = '';
    const groups = {};
    for (const o of list) (groups[o.cat] = groups[o.cat] || []).push(o);
    for (const cat of CAT_ORDER) {
      if (!groups[cat]) continue;
      for (const o of groups[cat]) {
        const isFav = favs.has(o.id);
        html += `<div class="opitem" data-op="${o.id}" title="${(o.desc || '').replace(/"/g, '&quot;')}">
          <span class="oi">${catIcon(o.cat)}</span>
          <span style="min-width:0;flex:1">
            <span class="on">${o.name}</span>
            <span class="oc">${o.cat}</span>
          </span>
          <span class="star ${isFav ? 'on' : ''}" data-fav="${o.id}" title="Favourite">★</span>
        </div>`;
      }
    }
    el.list.innerHTML = html;
    el.list.querySelectorAll('.opitem').forEach((b) => {
      b.onclick = (ev) => {
        if (ev.target.dataset.fav) return;
        addOp(b.dataset.op);
      };
    });
    el.list.querySelectorAll('[data-fav]').forEach((s) => {
      s.onclick = (ev) => {
        ev.stopPropagation();
        const id = s.dataset.fav;
        if (favs.has(id)) { favs.delete(id); toast('☆ Favourite hataya'); }
        else { favs.add(id); toast('★ Favourite add hua'); }
        LS.set('favs', [...favs]);
        renderOps();
      };
    });
    el.opCount.textContent = list.length + '/' + OPS.length;
  }
  $('#btnFav').onclick = () => {
    favOnly = !favOnly;
    $('#btnFav').style.color = favOnly ? 'var(--warn)' : '';
    $('#btnFav').style.borderColor = favOnly ? 'var(--warn)' : '';
    renderOps();
    toast(favOnly ? '★ Sirf favourites' : 'Saare ops');
  };

  /* ---------------- recipe ---------------- */
  function defaultArgs(def) {
    const a = {};
    for (const arg of (def.args || [])) a[arg.id] = arg.def;
    return a;
  }

  function addOp(id) {
    const def = opById(id);
    if (!def) { toast('Op nahi mila: ' + id, 'err'); return; }
    recipe.push({ opId: id, args: defaultArgs(def) });
    stepErrors = {};
    renderSteps();
    apply();
    toast(def.name + ' → chain me add');
  }

  function renderSteps() {
    el.recipeCount.textContent = recipe.length;
    if (!recipe.length) {
      el.steps.innerHTML = `<div class="empty"><div class="big">🧪</div>Operation click karo<br>ya <b>Smart Solve</b> chalao —<br>chain yahan banti hai.</div>`;
      return;
    }
    el.steps.innerHTML = recipe.map((step, i) => {
      const def = opById(step.opId);
      if (!def) return '';
      const err = stepErrors[i];
      let argsHtml = '';
      if ((def.args || []).length) {
        argsHtml = '<div class="sargs" style="padding:2px 0 2px 25px;display:flex;flex-direction:column;gap:4px">' + def.args.map((arg) => {
          const v = step.args[arg.id];
          const id = `a-${i}-${arg.id}`;
          const st = 'style="font-size:9.5px;padding:2px 5px;background:var(--bg2);border:1px solid var(--line2);border-radius:5px;color:var(--ink);font-family:var(--mono);width:100%;outline:none"';
          if (arg.type === 'select') {
            return `<select data-step="${i}" data-arg="${arg.id}" id="${id}" ${st}>` + arg.opts.map((o) => `<option ${o === v ? 'selected' : ''}>${o}</option>`).join('') + '</select>';
          }
          if (arg.type === 'checkbox') {
            return `<label style="display:flex;align-items:center;gap:5px;font-size:9.5px;color:var(--dim);cursor:pointer"><input type="checkbox" id="${id}" data-step="${i}" data-arg="${arg.id}" ${v ? 'checked' : ''} style="accent-color:var(--ac1);width:12px;height:12px">${arg.label}</label>`;
          }
          const t = arg.type === 'number' ? 'number' : 'text';
          return `<div style="display:flex;align-items:center;gap:5px"><label for="${id}" style="font-size:9px;color:var(--dim2);min-width:52px;flex-shrink:0;text-transform:uppercase;letter-spacing:.04em;font-weight:700">${arg.label}</label><input type="${t}" id="${id}" data-step="${i}" data-arg="${arg.id}" value="${String(v == null ? '' : v).replace(/"/g, '&quot;')}" ${st} style="flex:1;font-size:10px;padding:2px 5px;background:var(--bg2);border:1px solid var(--line2);border-radius:5px;color:var(--ink);font-family:var(--mono);outline:none;min-width:0"></div>`;
        }).join('') + '</div>';
      }
      return `<div class="step ${err ? 'err' : ''}" data-stepbox="${i}" style="flex-direction:column;align-items:stretch;gap:3px${err ? ';border-color:var(--err)' : ''}">
        <div style="display:flex;align-items:center;gap:7px">
          <span class="sn">${i + 1}</span>
          <span class="st" title="${(def.desc || '').replace(/"/g, '&quot;')}">${def.name}</span>
          <button class="sx" data-del="${i}" title="Remove">✕</button>
        </div>
        ${argsHtml}
        ${err ? `<div style="font-size:9.5px;color:var(--err);padding-left:25px">⚠ ${escapeHtml(err)}</div>` : ''}
      </div>`;
    }).join('');
    el.steps.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => {
      recipe.splice(+b.dataset.del, 1); stepErrors = {}; renderSteps(); apply();
    });
    el.steps.querySelectorAll('[data-arg]').forEach((inp) => {
      const handler = () => {
        const i = +inp.dataset.step;
        if (!recipe[i]) return;
        let v;
        if (inp.type === 'checkbox') v = inp.checked;
        else if (inp.type === 'number') v = inp.value === '' ? 0 : Number(inp.value);
        else v = inp.value;
        recipe[i].args[inp.dataset.arg] = v;
        stepErrors = {};
        apply();
      };
      inp.addEventListener('change', handler);
      if (inp.type === 'text' || inp.type === 'number') {
        let deb; inp.addEventListener('input', () => { clearTimeout(deb); deb = setTimeout(handler, 350); });
      }
    });
  }

  /* ---------------- pipeline ---------------- */
  async function apply() {
    let cur = el.input.value;
    let errStep = -1;
    stepErrors = {};
    for (let i = 0; i < recipe.length; i++) {
      const step = recipe[i];
      const def = opById(step.opId);
      if (!def) continue;
      try {
        let r = def.run(cur, step.args || {});
        if (r && typeof r.then === 'function') r = await r;
        cur = String(r);
      } catch (e) {
        stepErrors[i] = e.message || String(e);
        errStep = i; break;
      }
    }
    updateErrorIndicators();
    setOutput(cur, recipe.length ? recipe.map((s) => (opById(s.opId) || {}).name).join(' → ') : null);
    if (errStep >= 0) el.viaInfo.innerHTML = `⚠ Step ${errStep + 1} fail: <span style="color:var(--err)">${escapeHtml(stepErrors[errStep])}</span>`;
  }

  function updateErrorIndicators() {
    el.steps.querySelectorAll('[data-stepbox]').forEach((box) => {
      const i = +box.dataset.stepbox;
      const err = stepErrors[i];
      box.style.borderColor = err ? 'var(--err)' : '';
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function setOutput(text, via) {
    lastOutput = text;
    const empty = !text;
    el.output.textContent = text || 'Output yahan aayega…';
    el.output.classList.toggle('empty', empty);
    el.outStats.textContent = (text ? text.length.toLocaleString() : 0) + ' chars';
    const flags = detectFlags(text || '');
    el.flagBadge.style.display = flags.length ? 'inline-flex' : 'none';
    if (flags.length) { el.flagBadge.textContent = '🚩 ' + flags[0].slice(0, 26); el.flagBadge.title = 'Click to copy: ' + flags[0]; }
    const raw = text ? scoreText(text).score : 0;
    const sc = Math.max(0, Math.min(100, Math.round(raw / 0.95)));
    el.scoreBadge.textContent = text ? sc + '%' : '—';
    el.scoreBadge.className = 'badge ' + (sc >= 80 ? 'lm' : sc >= 50 ? 'am' : 'rd');
    el.scoreBadge.title = 'English-likeness (bigram + frequency)';
    if (via) el.viaInfo.innerHTML = 'Chain: <b>' + escapeHtml(via) + '</b>';
    else el.viaInfo.textContent = 'No operation applied — input as-is';
  }

  /* ---------------- detector ---------------- */
  let detTimer;
  el.input.addEventListener('input', () => {
    el.inStats.textContent = el.input.value.length.toLocaleString() + ' chars';
    clearTimeout(detTimer);
    detTimer = setTimeout(() => { runDetector(); apply(); }, 220);
  });

  function runDetector() {
    const val = el.input.value.trim();
    if (!val) {
      el.chips.innerHTML = '<span class="chip hint">Detector kaunse encodings pehchanta hai — yahan dikhega…</span>';
      return;
    }
    const det = quickDetect(val);
    const flags = detectFlags(val);
    let html = '';
    if (flags.length) html += `<span class="chip" data-solve="flag-hunt" style="border-color:var(--ok);color:var(--ok);background:color-mix(in srgb,var(--ok) 14%,transparent)">🚩 FLAG: <b>${escapeHtml(flags[0].slice(0, 30))}</b></span>`;
    for (const d of det) {
      if (d.name === 'flag') continue;
      html += `<span class="chip" data-op="${d.op}">${d.name} <span style="opacity:.62">${d.conf}%</span></span>`;
    }
    html += `<span class="chip" data-solve="smart-solve" style="border-color:var(--ac2);color:var(--ac2);background:color-mix(in srgb,var(--ac2) 14%,transparent)">🧠 Smart Solve</span>`;
    el.chips.innerHTML = html;
    el.chips.querySelectorAll('[data-op]').forEach((c) => c.onclick = () => addOp(c.dataset.op));
    el.chips.querySelectorAll('[data-solve]').forEach((c) => c.onclick = () => runSolve(c.dataset.solve));
  }

  /* ---------------- solve ---------------- */
  function runSolve(opId) {
    const val = el.input.value;
    if (!val || !val.trim()) { toast('Pehle input daalo!', 'err'); return; }
    const def = opById(opId);
    if (!def) return;
    const btns = [$('#btnSmart'), $('#btnFlag')];
    btns.forEach((b) => b.disabled = true);
    if ($('#btnSmart')) $('#btnSmart').classList.add('busy');
    recipe = []; stepErrors = {};
    renderSteps();
    setTimeout(async () => {
      try {
        let r = def.run(val, {});
        if (r && typeof r.then === 'function') r = await r;
        setOutput(String(r), def.name);
        renderSteps();
        if (opId === 'smart-solve') {
          const ls = window.CTF_OPS.getLastSolve && window.CTF_OPS.getLastSolve();
          if (ls && ls.found && ls.best && ls.best.chain.length) {
            recipe = ls.best.chain.map((c) => ({ opId: c.opId, args: Object.assign({}, c.args) }));
            stepErrors = {}; renderSteps(); await apply();
            el.viaInfo.innerHTML = `🚩 Flag: <b style="color:var(--ok)">${escapeHtml(ls.best.flags[0])}</b> · Chain load: <b>${escapeHtml(ls.best.chain.map((c) => c.label).join(' → '))}</b>`;
            toast('🚩 Flag mil gaya!', 'ok');
            pushHistory(val, ls.best.flags[0], ls.best.chain.map((c) => c.label).join(' → '));
          } else {
            toast('Koi flag nahi mila — Universal Cracker try karo', 'err');
            pushHistory(val, null, 'smart-solve (no flag)');
          }
        }
        if (opId === 'flag-hunt') {
          const mm = String(r).match(/[A-Za-z0-9_]{2,24}\{[^}\n]+\}/);
          if (mm) { el.viaInfo.innerHTML = `🚩 Flag: <b style="color:var(--ok)">${escapeHtml(mm[0])}</b>`; pushHistory(val, mm[0], 'flag-hunt'); }
        }
      } catch (e) {
        setOutput('⚠ ' + (e.message || e), def.name);
        toast('Error: ' + (e.message || e), 'err');
      } finally {
        btns.forEach((b) => b.disabled = false);
        if ($('#btnSmart')) $('#btnSmart').classList.remove('busy');
      }
    }, 20);
  }

  /* ---------------- history ---------------- */
  function pushHistory(input, flag, chain) {
    history.unshift({
      t: Date.now(),
      in: String(input).slice(0, 200),
      flag: flag || null,
      chain: chain || ''
    });
    history = history.slice(0, 40);
    LS.set('hist', history);
    renderHistory();
  }
  function renderHistory() {
    if (!el.hist) return;
    if (!history.length) {
      el.hist.innerHTML = `<div class="empty"><div class="big">🕘</div>Abhi koi history nahi<br><span style="font-size:10.5px">Har solve yahan save hoga</span></div>`;
      return;
    }
    el.hist.innerHTML = history.map((h, i) => {
      const d = new Date(h.t);
      const time = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' +
        d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      return `<div class="hitem" data-h="${i}">
        <div class="ht"><span>${time}</span>${h.flag ? '<span class="hf">🚩 FLAG</span>' : ''}</div>
        <div class="hb">${escapeHtml(h.in.slice(0, 60))}</div>
        ${h.chain ? `<div class="hb" style="color:var(--dim3);font-size:9.5px">${escapeHtml(h.chain.slice(0, 52))}</div>` : ''}
      </div>`;
    }).join('');
    el.hist.querySelectorAll('[data-h]').forEach((n) => n.onclick = () => {
      const h = history[+n.dataset.h];
      el.input.value = h.in;
      el.inStats.textContent = h.in.length.toLocaleString() + ' chars';
      recipe = []; stepErrors = {}; renderSteps(); runDetector(); apply();
      toast('History se load hua');
      closeMob();
    });
  }
  const btnHistClear = document.createElement('button');
  if (el.hist) {
    el.hist.addEventListener('dblclick', () => { history = []; LS.set('hist', []); renderHistory(); toast('History clear'); });
  }

  /* ---------------- rail tabs ---------------- */
  const railTabs = $('#railTabs');
  if (railTabs) {
    railTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab');
      if (!btn) return;
      activeTab = btn.dataset.tab;
      railTabs.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b === btn));
      ['recipe', 'quick', 'hist'].forEach((k) => {
        const p = document.getElementById('tab-' + k);
        if (p) p.style.display = k === activeTab ? 'flex' : 'none';
      });
      if (activeTab === 'hist') renderHistory();
    });
  }

  /* ---------------- buttons ---------------- */
  $('#btnSmart').onclick = () => runSolve('smart-solve');
  $('#btnFlag').onclick = () => runSolve('flag-hunt');
  $$('[data-quick]').forEach((b) => {
    b.onclick = () => {
      const id = b.dataset.quick;
      if (id === 'smart-solve' || id === 'flag-hunt') return runSolve(id);
      addOp(id);
      closeMob();
    };
  });

  $('#btnCopy').onclick = async () => {
    try {
      await navigator.clipboard.writeText(lastOutput || '');
      toast('📋 Output copied!', 'ok');
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = lastOutput || '';
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('📋 Copied!', 'ok'); } catch (e2) { toast('Copy fail — manually select', 'err'); }
      ta.remove();
    }
  };
  $('#btnSwap').onclick = () => {
    if (!lastOutput) return toast('Output khali hai', 'err');
    el.input.value = lastOutput;
    el.inStats.textContent = lastOutput.length.toLocaleString() + ' chars';
    toast('⤵ Output → input');
    runDetector(); apply();
  };
  $('#btnClearIn').onclick = () => { el.input.value = ''; el.inStats.textContent = '0 chars'; runDetector(); apply(); };
  $('#btnClearOut').onclick = () => { recipe = []; stepErrors = {}; renderSteps(); apply(); toast('Recipe + output clear'); };
  $('#btnRecipeClear').onclick = () => { recipe = []; stepErrors = {}; renderSteps(); apply(); toast('Chain clear'); };
  $('#btnPaste').onclick = async () => {
    try {
      const t = await navigator.clipboard.readText();
      el.input.value = t;
      el.inStats.textContent = t.length.toLocaleString() + ' chars';
      runDetector(); apply(); toast('📥 Pasted', 'ok');
    } catch (e) { toast('Clipboard permission nahi — Ctrl+V karo', 'err'); el.input.focus(); }
  };
  $('#btnAuto').onclick = () => {
    const det = quickDetect(el.input.value);
    if (!det.length) return toast('Koi encoding detect nahi hui — Smart Solve try karo', 'err');
    const best = det[0];
    if (!best.op) return toast('Input me flag already hai 🚩');
    recipe.push({ opId: best.op, args: defaultArgs(opById(best.op)) });
    stepErrors = {}; renderSteps(); apply();
    toast('✨ ' + best.name + ' (' + best.conf + '%) applied');
  };
  el.flagBadge.onclick = async () => {
    const flags = detectFlags(lastOutput || '');
    if (!flags.length) return;
    try { await navigator.clipboard.writeText(flags[0]); toast('🚩 Flag copied!', 'ok'); } catch (e) { toast(flags[0]); }
  };

  /* ---------------- resizer ---------------- */
  (function resizer() {
    if (!el.rz || !el.io) return;
    let dragging = false;
    const KEY = 'paneSplit';
    let pct = LS.get(KEY, 50);
    function setPct(p) {
      pct = Math.max(18, Math.min(82, p));
      el.io.style.gridTemplateRows = pct + 'fr 9px ' + (100 - pct) + 'fr';
      LS.set(KEY, pct);
    }
    setPct(pct);
    el.rz.addEventListener('mousedown', (e) => { dragging = true; e.preventDefault(); document.body.style.cursor = 'row-resize'; });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const r = el.io.getBoundingClientRect();
      setPct(((e.clientY - r.top) / r.height) * 100);
    });
    document.addEventListener('mouseup', () => { dragging = false; document.body.style.cursor = ''; });
    el.rz.addEventListener('dblclick', () => setPct(50));
    el.rz.addEventListener('touchstart', (e) => { dragging = true; }, { passive: true });
    document.addEventListener('touchmove', (e) => {
      if (!dragging || !e.touches[0]) return;
      const r = el.io.getBoundingClientRect();
      setPct(((e.touches[0].clientY - r.top) / r.height) * 100);
    }, { passive: true });
    document.addEventListener('touchend', () => { dragging = false; });
  })();

  /* ---------------- command palette ---------------- */
  function openCmd() {
    el.cmdk.classList.add('open');
    el.cmdInput.value = '';
    cmdSel = 0;
    renderCmd('');
    setTimeout(() => el.cmdInput.focus(), 30);
  }
  function closeCmd() { el.cmdk.classList.remove('open'); }

  function cmdScore(o, q) {
    const n = o.name.toLowerCase();
    const id = o.id.toLowerCase();
    let s = 0;
    if (id === q) s += 100;
    if (n === q) s += 90;
    if (n.startsWith(q)) s += 60;
    if (id.startsWith(q)) s += 55;
    if (n.includes(q)) s += 30;
    if (id.includes(q)) s += 26;
    for (const k of (o.keywords || [])) {
      if (k === q) s += 22;
      else if (k.startsWith(q)) s += 14;
      else if (k.includes(q)) s += 7;
    }
    if (o.cat.toLowerCase().includes(q)) s += 9;
    return s;
  }

  function renderCmd(q) {
    q = q.trim().toLowerCase();
    let list;
    if (!q) {
      // default: favourites + popular
      const pop = ['adv-crack', 'smart-solve', 'from-base64', 'xor-brute', 'caesar', 'sub-crack', 'chain-deep', 'cipher-id', 'flag-hunt', 'md5'];
      list = [...new Set([...favs, ...pop])].map(opById).filter(Boolean).slice(0, 10);
      cmdResults = list;
      el.cmdRes.innerHTML = '<div class="cmdk-grp">⭐ Favourites & Popular</div>' + list.map((o, i) =>
        `<div class="cmdk-item ${i === cmdSel ? 'sel' : ''}" data-i="${i}">
          <span class="ci">${catIcon(o.cat)}</span>
          <span class="cn">${o.name}</span>
          <span class="cc">${o.cat}</span>
        </div>`).join('');
    } else {
      list = OPS.map((o) => ({ o, s: cmdScore(o, q) })).filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s).slice(0, 40).map((x) => x.o);
      cmdResults = list;
      if (!list.length) {
        el.cmdRes.innerHTML = `<div class="empty"><div class="big">🔍</div>"${escapeHtml(q)}" ke liye kuch nahi<br><span style="font-size:10.5px">try: b64, xor, caesar, crack, rsa, hash</span></div>`;
        el.cmdCount.textContent = '0 results';
        return;
      }
      el.cmdRes.innerHTML = '<div class="cmdk-grp">' + list.length + ' operations</div>' + list.map((o, i) =>
        `<div class="cmdk-item ${i === cmdSel ? 'sel' : ''}" data-i="${i}">
          <span class="ci">${catIcon(o.cat)}</span>
          <span class="cn">${escapeHtml(o.name)}</span>
          <span class="cc">${o.cat}</span>
        </div>`).join('');
    }
    el.cmdCount.textContent = cmdResults.length + ' results';
    el.cmdRes.querySelectorAll('[data-i]').forEach((n) => {
      n.onclick = () => { addOp(cmdResults[+n.dataset.i].id); closeCmd(); };
    });
  }

  $('#cmdOpen').onclick = openCmd;
  el.cmdInput.addEventListener('input', () => { cmdSel = 0; renderCmd(el.cmdInput.value); });
  el.cmdk.addEventListener('click', (e) => { if (e.target === el.cmdk) closeCmd(); });
  el.cmdInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      cmdSel = Math.min(cmdSel + 1, cmdResults.length - 1);
      scrollCmd();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      cmdSel = Math.max(cmdSel - 1, 0);
      scrollCmd();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const o = cmdResults[cmdSel];
      if (!o) return;
      addOp(o.id);
      if (!e.shiftKey) closeCmd();
    } else if (e.key === 'Escape') {
      closeCmd();
    }
  });
  function scrollCmd() {
    const items = el.cmdRes.querySelectorAll('[data-i]');
    items.forEach((n, i) => n.classList.toggle('sel', i === cmdSel));
    const cur = items[cmdSel];
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
  }

  /* ---------------- mobile ---------------- */
  function closeMob() {
    el.sidebar.classList.remove('open');
    el.rail.classList.remove('open');
    $$('.mobbar button').forEach((b) => b.classList.remove('on'));
  }
  $$('.mobbar button').forEach((b) => {
    b.onclick = () => {
      const a = b.dataset.mob;
      if (a === 'ops') {
        const open = el.sidebar.classList.contains('open');
        closeMob();
        if (!open) { el.sidebar.classList.add('open'); b.classList.add('on'); }
      } else if (a === 'recipe') {
        const open = el.rail.classList.contains('open');
        closeMob();
        if (!open) { el.rail.classList.add('open'); b.classList.add('on'); }
      } else if (a === 'cmd') {
        closeMob(); openCmd();
      } else if (a === 'solve') {
        closeMob(); runSolve('smart-solve');
      }
    };
  });

  /* ---------------- drawer ---------------- */
  $('#btnChLib').onclick = () => window.CH_LIB && window.CH_LIB.open();
  $('#btnRef').onclick = () => el.drawer.classList.add('open');
  const kbNav = document.getElementById('kbNav');
  if (kbNav) {
    kbNav.addEventListener('click', (e) => {
      const btn = e.target.closest('.kb-tab');
      if (!btn) return;
      kbNav.querySelectorAll('.kb-tab').forEach((b) => b.classList.toggle('active', b === btn));
      document.querySelectorAll('[data-kb-page]').forEach((pg) => {
        pg.classList.toggle('active', pg.dataset.kbPage === btn.dataset.kb);
      });
      const card = el.drawer.querySelector('.card');
      if (card && card.scrollIntoView) card.scrollIntoView({ block: 'start' });
    });
  }
  $('#drawerClose').onclick = () => el.drawer.classList.remove('open');
  el.drawer.addEventListener('click', (e) => { if (e.target === el.drawer) el.drawer.classList.remove('open'); });

  /* ---------------- samples ---------------- */
  function buildSamples() {
    const enc = (id, args) => (t) => opById(id).run(t, args || {});
    const b64 = enc('to-base64');
    const hex = enc('to-hex', { upper: false, sep: 'None' });
    const b32 = enc('to-base32', { pad: true });
    const rot13 = enc('rot-n', { n: 13, all: false });
    const samples = [
      { k: '🔵 Base64 flag', v: b64('flag{y0u_f0und_m3_b64}') },
      { k: '🟣 Hex → Base64 (2 layers)', v: hex(b64('CTF{d0ubl3_l4y3r_w1n}')) },
      { k: '🟢 ROT13 text', v: rot13('the quick brown fox jumps over the lazy dog') },
      { k: '🟡 Morse code', v: '..-. .-.. .- --. / -.-. - ..-.' },
      { k: '🔴 Binary', v: [...new TextEncoder().encode('THM{b1n4ry_m4st3r}')].map((b) => b.toString(2).padStart(8, '0')).join(' ') },
      { k: '💥 XOR single byte', v: opById('xor').run('flag{x0r_1s_fun}', { mode: 'Single Byte', key: '42' }) },
      { k: '🔢 Base32', v: b32('crypto{b32_3nc0d3d}') },
      { k: '🌐 URL → Base64', v: encodeURIComponent(b64('picoCTF{url_b64_chain}')) },
      { k: '🏷 HTML entities', v: '&#102;&#108;&#97;&#103;&#123;&#104;&#116;&#109;&#108;&#125;' },
      { k: '🅱 Base58', v: opById('to-base58').run('flag{base58_0k}') },
      { k: '🏛 Vigenère (KEY)', v: opById('vigenere-enc').run('flag{v1g3n3r3_cr4ck3d}', { key: 'KEY' }) },
      { k: '🚂 Rail Fence (3)', v: opById('rail-fence').run('flag{rail_f3nc3_w1n}', { rails: 3, inv: false }) },
      { k: '🎫 JWT sample', v: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' },
      { k: '🗝 A1Z26 numbers', v: opById('a1z26-enc').run('FLAG A1Z26 WORKS', { sep: '-' }) },
      { k: '🧮 CryptoHack BigInt', v: '11515195063862318899931685488813747395775516287289682636499965282714637259206269' },
      { k: '🥓 Bacon cipher', v: opById('bacon-enc').run('BACON', { variant: '26-letter (modern)', sep: ' ' }) },
      { k: '♟ Playfair (MONARCHY)', v: opById('playfair').run('hide the gold in the tree stump', { key: 'MONARCHY', inv: false }) },
      { k: '🔓 Vigenère — key bina crack', v: opById('vigenere-enc').run('the flag is hidden somewhere in this long message so the cracker can find the key and read it', { key: 'LEMON' }) },
      { k: '🧠 Brainfuck', v: '++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.' },
      { k: '🐍 Caesar crack test', v: 'WKH TXLFN EURZQ IRA MXPSV RYHU WKH ODCB GRJ' }
    ];
    el.sampleSel.innerHTML = '<option value="">⚡ Sample…</option>' +
      samples.map((s, i) => `<option value="${i}">${s.k}</option>`).join('');
    el.sampleSel.onchange = () => {
      const i = el.sampleSel.value;
      if (i === '') return;
      el.input.value = samples[+i].v;
      el.inStats.textContent = el.input.value.length.toLocaleString() + ' chars';
      recipe = []; stepErrors = {}; renderSteps(); runDetector(); apply();
      el.sampleSel.value = '';
      toast('⚡ Sample loaded');
    };
  }

  /* ---------------- keyboard ---------------- */
  document.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && !e.shiftKey && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault(); openCmd(); return;
    }
    if (mod && e.key === 'Enter') { e.preventDefault(); runSolve('smart-solve'); return; }
    if (mod && e.shiftKey && (e.key === 'C' || e.key === 'c')) { e.preventDefault(); $('#btnCopy').click(); return; }
    if (mod && e.shiftKey && (e.key === 'V' || e.key === 'v')) { e.preventDefault(); $('#btnSwap').click(); return; }
    if (mod && e.shiftKey && (e.key === 'L' || e.key === 'l')) { e.preventDefault(); cycleTheme(); return; }
    if (e.key === 'Escape') {
      closeCmd();
      el.drawer.classList.remove('open');
      closeMob();
    }
    if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      e.preventDefault(); openCmd();
    }
  });

  /* ---------------- boot ---------------- */
  applyTheme(theme);
  renderCats();
  renderOps();
  renderSteps();
  buildSamples();
  renderHistory();
  el.input.value = opById('to-base64').run('flag{smar7_50lve_w1ll_f1nd_m3}');
  el.inStats.textContent = el.input.value.length.toLocaleString() + ' chars';
  runDetector();
  apply();
})();
