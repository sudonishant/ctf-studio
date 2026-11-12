/* ============================================================
   CTF STUDIO — App logic
   ============================================================ */
(function () {
  'use strict';
  const { OPS, CAT_ORDER, quickDetect, detectFlags, scoreText } = window.CTF_OPS;
  const $ = (s) => document.querySelector(s);
  const el = {
    input: $('#input'), output: $('#output'), chips: $('#chips'), list: $('#oplist'), cats: $('#cats'),
    steps: $('#steps'), recipeCount: $('#recipeCount'), inStats: $('#inStats'), outStats: $('#outStats'),
    scoreBadge: $('#scoreBadge'), flagBadge: $('#flagBadge'), viaInfo: $('#viaInfo'),
    toast: $('#toast'), drawer: $('#drawer'), opCount: $('#opCount'), sampleSel: $('#sampleSel'),
    opSearch: $('#opSearch')
  };
  const opById = (id) => OPS.find((o) => o.id === id);

  let recipe = [];            // [{opId, args:{}}]
  let activeCat = 'ALL';
  let lastOutput = '';
  let stepErrors = {};

  /* ---------------- toast ---------------- */
  let toastTimer;
  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove('show'), 1800);
  }

  /* ---------------- op list ---------------- */
  function renderCats() {
    const cats = ['ALL', ...CAT_ORDER];
    el.cats.innerHTML = cats.map((c) =>
      `<button class="cat ${c === activeCat ? 'active' : ''}" data-cat="${c}">${c === 'ALL' ? 'Sab' : c}</button>`
    ).join('');
    el.cats.querySelectorAll('.cat').forEach((b) => b.onclick = () => { activeCat = b.dataset.cat; renderCats(); renderOps(); });
  }

  function renderOps() {
    const q = el.opSearch.value.trim().toLowerCase();
    let list = OPS.filter((o) => activeCat === 'ALL' || o.cat === activeCat);
    if (q) {
      list = list.filter((o) =>
        o.name.toLowerCase().includes(q) || o.id.includes(q) ||
        o.keywords.some((k) => k.includes(q)) || o.cat.toLowerCase().includes(q));
    }
    if (!list.length) {
      el.list.innerHTML = `<div class="empty">"${q}" ke liye kuch nahi mila<br><span style="color:var(--dim2)">try: b64, xor, morse, rot, hash, jwt</span></div>`;
      return;
    }
    let html = '';
    const groups = {};
    for (const o of list) (groups[o.cat] = groups[o.cat] || []).push(o);
    for (const cat of CAT_ORDER) {
      if (!groups[cat]) continue;
      html += `<div class="opgroup"><h4>${cat}</h4>`;
      for (const o of groups[cat]) {
        html += `<button class="opitem" data-op="${o.id}" title="${o.desc.replace(/"/g, '&quot;')}">
          <span class="dot"></span><span>${o.name}</span><span class="add">+</span></button>`;
      }
      html += `</div>`;
    }
    el.list.innerHTML = html;
    el.list.querySelectorAll('.opitem').forEach((b) => {
      b.onclick = () => addOp(b.dataset.op);
    });
  }
  el.opSearch.addEventListener('input', renderOps);
  el.opCount.textContent = OPS.length + ' ops';

  /* ---------------- recipe ---------------- */
  function defaultArgs(def) {
    const a = {};
    for (const arg of def.args) a[arg.id] = arg.def;
    return a;
  }
  function addOp(id) {
    const def = opById(id);
    if (!def) return;
    recipe.push({ opId: id, args: defaultArgs(def) });
    stepErrors = {};
    renderSteps();
    apply();
    toast(def.name + ' → recipe me add ho gaya');
  }
  function renderSteps() {
    el.recipeCount.textContent = recipe.length + ' steps';
    if (!recipe.length) {
      el.steps.innerHTML = `<div class="empty"><div class="big">🧪</div>Left se operation click karo<br>ya <b style="color:var(--cy)">Smart Solve</b> chalao —<br>chain yahan banti hai.</div>`;
      return;
    }
    el.steps.innerHTML = recipe.map((step, i) => {
      const def = opById(step.opId);
      const err = stepErrors[i];
      let argsHtml = '';
      if (def.args.length) {
        argsHtml = '<div class="args">' + def.args.map((arg) => {
          const v = step.args[arg.id];
          const id = `a-${i}-${arg.id}`;
          if (arg.type === 'select') {
            return `<div class="arg"><label for="${id}">${arg.label}</label><select data-step="${i}" data-arg="${arg.id}" id="${id}">` +
              arg.opts.map((o) => `<option ${o === v ? 'selected' : ''}>${o}</option>`).join('') + '</select></div>';
          }
          if (arg.type === 'checkbox') {
            return `<div class="arg"><label for="${id}">${arg.label}</label><input type="checkbox" id="${id}" data-step="${i}" data-arg="${arg.id}" ${v ? 'checked' : ''}></div>`;
          }
          if (arg.type === 'number') {
            return `<div class="arg"><label for="${id}">${arg.label}</label><input type="number" id="${id}" data-step="${i}" data-arg="${arg.id}" value="${String(v).replace(/"/g, '&quot;')}"></div>`;
          }
          return `<div class="arg"><label for="${id}">${arg.label}</label><input type="text" id="${id}" data-step="${i}" data-arg="${arg.id}" value="${String(v).replace(/"/g, '&quot;')}"></div>`;
        }).join('') + '</div>';
      }
      return `<div class="step ${err ? 'error' : ''}" data-stepbox="${i}">
        <div class="step-head">
          <span class="idx">${i + 1}</span>
          <span class="nm" title="${def.desc.replace(/"/g, '&quot;')}">${def.name}</span>
          <button class="mini" data-up="${i}" ${i === 0 ? 'disabled style="opacity:.25"' : ''}>↑</button>
          <button class="mini" data-down="${i}" ${i === recipe.length - 1 ? 'disabled style="opacity:.25"' : ''}>↓</button>
          <button class="mini del" data-del="${i}">✕</button>
        </div>
        ${argsHtml}
        <div class="step-err" data-err="${i}" ${err ? '' : 'style="display:none"'}>⚠ ${err || ''}</div>
      </div>`;
    }).join('');
    el.steps.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { recipe.splice(+b.dataset.del, 1); stepErrors = {}; renderSteps(); apply(); });
    el.steps.querySelectorAll('[data-up]').forEach((b) => b.onclick = () => {
      const i = +b.dataset.up; if (i < 1) return;
      [recipe[i - 1], recipe[i]] = [recipe[i], recipe[i - 1]]; stepErrors = {}; renderSteps(); apply();
    });
    el.steps.querySelectorAll('[data-down]').forEach((b) => b.onclick = () => {
      const i = +b.dataset.down; if (i >= recipe.length - 1) return;
      [recipe[i + 1], recipe[i]] = [recipe[i], recipe[i + 1]]; stepErrors = {}; renderSteps(); apply();
    });
    el.steps.querySelectorAll('[data-arg]').forEach((inp) => {
      const handler = () => {
        const i = +inp.dataset.step;
        if (!recipe[i]) return; // stale element after recipe reset
        const argId = inp.dataset.arg;
        let v;
        if (inp.type === 'checkbox') v = inp.checked;
        else if (inp.tagName === 'INPUT' && inp.type === 'number') v = inp.value === '' ? 0 : Number(inp.value);
        else v = inp.value;
        recipe[i].args[argId] = v;
        stepErrors = {};
        // re-render only error styles to keep focus
        apply();
      };
      inp.addEventListener('change', handler);
      if (inp.type === 'text' || inp.type === 'number') {
        let deb;
        inp.addEventListener('input', () => { clearTimeout(deb); deb = setTimeout(handler, 350); });
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
        errStep = i;
        break;
      }
    }
    updateErrorIndicators();
    setOutput(cur, recipe.length ? recipe.map((s) => (opById(s.opId) || {}).name).join(' → ') : null);
    if (errStep >= 0) el.viaInfo.innerHTML = `⚠ Step ${errStep + 1} failed: <span style="color:var(--rd)">${escapeHtml(stepErrors[errStep])}</span>`;
  }

  function updateErrorIndicators() {
    el.steps.querySelectorAll('[data-stepbox]').forEach((box) => {
      const i = +box.dataset.stepbox;
      const errBox = box.querySelector('[data-err]');
      const err = stepErrors[i];
      box.classList.toggle('error', !!err);
      if (errBox) {
        errBox.style.display = err ? '' : 'none';
        errBox.textContent = err ? '⚠ ' + err : '';
      }
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function setOutput(text, via) {
    lastOutput = text;
    el.output.textContent = text || (recipe.length ? '' : 'Output yahan aayega…');
    el.outStats.textContent = (text ? text.length.toLocaleString() : 0) + ' chars';
    const flags = detectFlags(text || '');
    el.flagBadge.style.display = flags.length ? 'inline-flex' : 'none';
    if (flags.length) {
      el.flagBadge.textContent = '🚩 ' + flags[0];
      el.flagBadge.title = 'Click to copy flag';
    }
    const raw = text ? scoreText(text).score : 0;
    const sc = Math.max(0, Math.min(100, Math.round(raw / 0.95)));
    el.scoreBadge.textContent = text ? 'readability ' + sc + '%' : '—';
    el.scoreBadge.className = 'badge ' + (sc >= 80 ? 'lm' : sc >= 50 ? 'am' : 'rd');
    el.scoreBadge.title = 'English-likeness score (bigram + frequency analysis)';
    el.output.classList.toggle('flagtext', flags.length > 0);
    if (via) el.viaInfo.innerHTML = 'Pipeline: <b>' + escapeHtml(via) + '</b>';
    else el.viaInfo.textContent = 'No operation applied — input as-is';
  }

  /* ---------------- detector chips ---------------- */
  let detTimer;
  el.input.addEventListener('input', () => {
    el.inStats.textContent = el.input.value.length.toLocaleString() + ' chars';
    clearTimeout(detTimer);
    detTimer = setTimeout(() => { runDetector(); apply(); }, 220);
  });

  function runDetector() {
    const val = el.input.value.trim();
    if (!val) {
      el.chips.innerHTML = '<span class="hint">Detector yahan kaunse encodings detect karta hai wo dikhayega…</span>';
      return;
    }
    const det = quickDetect(val);
    const flags = detectFlags(val);
    let html = '';
    if (flags.length) html += `<span class="chip magic" data-solve="flag-hunt">🚩 FLAG input me hai: <b>${escapeHtml(flags[0])}</b></span>`;
    for (const d of det) {
      if (d.name === 'flag') continue;
      html += `<span class="chip ${d.conf >= 80 ? 'magic' : ''}" data-op="${d.op}">Try <b>${d.name}</b> <span class="conf">${d.conf}%</span></span>`;
    }
    html += `<span class="chip" data-solve="smart-solve">🧠 Smart Solve</span>`;
    el.chips.innerHTML = html;
    el.chips.querySelectorAll('[data-op]').forEach((c) => c.onclick = () => addOp(c.dataset.op));
    el.chips.querySelectorAll('[data-solve]').forEach((c) => c.onclick = () => runSolve(c.dataset.solve));
  }

  /* ---------------- solve actions ---------------- */
  function runSolve(opId) {
    const val = el.input.value;
    if (!val || !val.trim()) { toast('Pehle input daalo!'); return; }
    const def = opById(opId);
    if (!def) return;
    const btns = Array.from(document.querySelectorAll('#btnSmart,#btnFlag'));
    btns.forEach((b) => b.disabled = true);
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
            stepErrors = {};
            renderSteps();
            await apply();
            el.viaInfo.innerHTML = `🚩 Flag: <b style="color:var(--lm)">${escapeHtml(ls.best.flags[0])}</b> · Chain recipe me load ho gayi: <b>${escapeHtml(ls.best.chain.map((c) => c.label).join(' → '))}</b>`;
            toast('🚩 Flag mil gaya! Chain recipe me load ho gayi.');
          }
        }
        if (opId === 'flag-hunt') {
          const mm = String(r).match(/[A-Za-z0-9_]{2,24}\{[^}\n]+\}/);
          if (mm) el.viaInfo.innerHTML = `🚩 Flag: <b style="color:var(--lm)">${escapeHtml(mm[0])}</b>`;
        }
      } catch (e) {
        setOutput('⚠ ' + (e.message || e), def.name);
      } finally {
        btns.forEach((b) => b.disabled = false);
      }
    }, 20);
  }

  /* ---------------- buttons ---------------- */
  $('#btnSmart').onclick = () => runSolve('smart-solve');
  $('#btnFlag').onclick = () => runSolve('flag-hunt');
  document.querySelectorAll('[data-quick]').forEach((b) => {
    b.onclick = () => {
      const id = b.dataset.quick;
      if (id === 'smart-solve' || id === 'flag-hunt') return runSolve(id);
      addOp(id);
    };
  });

  $('#btnCopy').onclick = async () => {
    try {
      await navigator.clipboard.writeText(lastOutput || '');
      toast('📋 Output copied!');
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = lastOutput || '';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('📋 Copied!'); } catch (e2) { toast('Copy fail — manually select karo'); }
      ta.remove();
    }
  };
  $('#btnSwap').onclick = () => {
    if (!lastOutput) return toast('Output khali hai');
    el.input.value = lastOutput;
    el.inStats.textContent = lastOutput.length.toLocaleString() + ' chars';
    toast('⤵ Output → input');
    runDetector();
  };
  $('#btnClearIn').onclick = () => { el.input.value = ''; el.inStats.textContent = '0 chars'; runDetector(); apply(); };
  $('#btnClearOut').onclick = () => { recipe = []; stepErrors = {}; renderSteps(); apply(); toast('Recipe + output clear'); };
  $('#btnRecipeClear').onclick = () => { recipe = []; stepErrors = {}; renderSteps(); apply(); toast('Recipe clear'); };
  $('#btnPaste').onclick = async () => {
    try {
      const t = await navigator.clipboard.readText();
      el.input.value = t;
      el.inStats.textContent = t.length.toLocaleString() + ' chars';
      runDetector(); apply();
      toast('📥 Pasted');
    } catch (e) { toast('Clipboard permission nahi mili — Ctrl+V se paste karo'); el.input.focus(); }
  };
  $('#btnAuto').onclick = () => {
    const det = quickDetect(el.input.value);
    if (!det.length) return toast('Koi encoding detect nahi hui — Smart Solve try karo');
    const best = det[0];
    if (!best.op) return toast('Input me pehle se flag hai 🚩');
    recipe.push({ opId: best.op, args: defaultArgs(opById(best.op)) });
    stepErrors = {};
    renderSteps(); apply();
    toast('✨ ' + best.name + ' (' + best.conf + '%) applied');
  };
  el.flagBadge.onclick = async () => {
    const flags = detectFlags(lastOutput || '');
    if (!flags.length) return;
    try { await navigator.clipboard.writeText(flags[0]); toast('🚩 Flag copied: ' + flags[0]); } catch (e) { toast(flags[0]); }
  };

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
        pg.style.display = pg.dataset.kbPage === btn.dataset.kb ? '' : 'none';
      });
      el.drawer.querySelector('.card').scrollTop = 0;
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
      { k: 'Base64 flag', v: b64('flag{y0u_f0und_m3_b64}') },
      { k: 'Hex → Base64 (2 layers)', v: hex(b64('CTF{d0ubl3_l4y3r_w1n}')) },
      { k: 'ROT13 text', v: rot13('the quick brown fox jumps over the lazy dog') },
      { k: 'Morse code flag-ish', v: '..-. .-.. .- --. / -.-. - ..-.' },
      { k: 'Binary', v: [...new TextEncoder().encode('THM{b1n4ry_m4st3r}')].map((b) => b.toString(2).padStart(8, '0')).join(' ') },
      { k: 'XOR single byte (key 42)', v: opById('xor').run('flag{x0r_1s_fun}', { mode: 'Single Byte', key: '42' }) },
      { k: 'Base32', v: b32('crypto{b32_3nc0d3d}') },
      { k: 'URL → Base64 chain', v: encodeURIComponent(b64('picoCTF{url_b64_chain}')) },
      { k: 'HTML entities', v: '&#102;&#108;&#97;&#103;&#123;&#104;&#116;' + '&#109;&#108;&#125;' },
      { k: 'Base58', v: opById('to-base58').run('flag{base58_0k}') },
      { k: 'Vigenère (key: KEY)', v: opById('vigenere-enc').run('flag{v1g3n3r3_cr4ck3d}', { key: 'KEY' }) },
      { k: 'Rail Fence (3 rails)', v: opById('rail-fence').run('flag{rail_f3nc3_w1n}', { rails: 3, inv: false }) },
      { k: 'JWT sample', v: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' },
      { k: 'Junk that needs XOR brute', v: opById('xor').run('HTB{s1ngl3_byt3_x0r}', { mode: 'Single Byte', key: '137' }) },
      { k: 'A1Z26 numbers', v: opById('a1z26-enc').run('FLAG A1Z26 WORKS', { sep: '-' }) },
      { k: 'Big Integer (decimal) — CryptoHack style', v: '11515195063862318899931685488813747395775516287289682636499965282714637259206269' },
      { k: 'Bacon cipher (A/B)', v: opById('bacon-enc').run('BACON', { variant: '26-letter (modern)', sep: ' ' }) },
      { k: 'Playfair (key: MONARCHY)', v: opById('playfair').run('hide the gold in the tree stump', { key: 'MONARCHY', inv: false }) },
      { k: 'Vigenère — key bina crack karo', v: opById('vigenere-enc').run('the flag is hidden somewhere in this long message so the cracker can find the key and read it', { key: 'LEMON' }) },
      { k: 'Brainfuck program', v: '++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.' },
      { k: 'RSA: decrypt c (p=61,q=53,e=17)', v: '' }
    ];
    for (const s of samples) {
      const o = document.createElement('option');
      o.value = s.v;
      o.textContent = s.k;
      el.sampleSel.appendChild(o);
    }
  }
  el.sampleSel.onchange = () => {
    if (el.sampleSel.selectedIndex <= 0) return;
    el.input.value = el.sampleSel.value;
    el.inStats.textContent = el.input.value.length.toLocaleString() + ' chars';
    recipe = []; stepErrors = {};
    renderSteps(); runDetector(); apply();
    el.sampleSel.value = '';
    if (el.input.value === '') {
      toast('🧮 RSA sample: p=61, q=53, e=17, c=2790 → RSA Decrypt args me daalo');
      addOp('rsa-decrypt');
    } else toast('⚡ Sample loaded');
  };

  /* ---------------- keyboard ---------------- */
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runSolve('smart-solve');
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      $('#btnCopy').click();
    }
    if (e.key === 'Escape') el.drawer.classList.remove('open');
  });

  /* ---------------- solve busy state ---------------- */
  const solveBtns = [$('#btnSmart'), $('#btnFlag')];
  function setBusy(on) {
    solveBtns.forEach((b) => { if (b) b.disabled = on; });
  }

  /* ---------------- boot ---------------- */
  renderCats();
  renderOps();
  renderSteps();
  buildSamples();
  // demo prefill — pehli baar kholte hi kuch interesting dikhe
  el.input.value = opById('to-base64').run('flag{smar7_50lve_w1ll_f1nd_m3}');
  el.inStats.textContent = el.input.value.length.toLocaleString() + ' chars';
  runDetector();
  apply();
})();
