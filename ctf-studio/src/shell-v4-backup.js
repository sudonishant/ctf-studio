/* ============================================================
   CTF STUDIO — Shell (HTML + CSS)
   ============================================================ */
window.SHELL_HEAD = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CTF Studio — CyberChef-style Crypto Toolkit</title>
<meta name="description" content="Offline CTF toolkit: 50+ encoders, ciphers, auto-detect Magic mode, Smart Solve flag hunter. No server, 100% browser.">
<meta name="theme-color" content="#070b12">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='6' fill='%2322d3ee'/%3E%3Cpath d='M8 11V8.5a4 4 0 1 1 8 0V11' stroke='%2307131c' stroke-width='2.2' fill='none' stroke-linecap='round'/%3E%3Crect x='6.5' y='11' width='11' height='8' rx='2' fill='%2307131c'/%3E%3C/svg%3E">
<style>
  :root{
    --bg:#070b12; --bg2:#0a1019; --panel:#0d1521; --panel2:#111c2b;
    --line:#1b2b3f; --line2:#24384f;
    --ink:#dbe7f5; --dim:#7c93ab; --dim2:#516b85;
    --cy:#22d3ee; --cy2:#0ea5b7; --mg:#f472b6; --lm:#a3e635; --am:#fbbf24; --rd:#fb7185;
    --mono:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;
    --sans:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;
  }
  *{box-sizing:border-box}
  html,body{height:100%}
  body{margin:0;overflow-x:hidden;background:
      radial-gradient(1100px 500px at 85% -10%, rgba(34,211,238,.10), transparent 60%),
      radial-gradient(900px 420px at -10% 110%, rgba(244,114,182,.09), transparent 60%),
      var(--bg);
    color:var(--ink);font-family:var(--sans);font-size:14px;line-height:1.5;
    background-image:linear-gradient(rgba(34,211,238,.028) 1px, transparent 1px),linear-gradient(90deg, rgba(34,211,238,.028) 1px, transparent 1px);
    background-size:28px 28px;}
  ::selection{background:rgba(34,211,238,.30)}
  .wrap{max-width:1560px;margin:0 auto;padding:14px 16px 40px}
  /* ---------- topbar ---------- */
  .topbar{display:flex;align-items:center;gap:14px;padding:12px 16px;margin-bottom:14px;
    background:linear-gradient(180deg, rgba(17,28,43,.92), rgba(13,21,33,.88));
    border:1px solid var(--line);border-radius:14px;
    box-shadow:0 10px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.04);
    position:sticky;top:10px;z-index:40;backdrop-filter:blur(8px)}
  .logo{display:flex;align-items:center;gap:10px;user-select:none}
  .logo .glyph{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;
    background:conic-gradient(from 200deg, #22d3ee, #a3e635, #f472b6, #22d3ee);
    box-shadow:0 0 22px rgba(34,211,238,.35)}
  .logo .glyph svg{filter:drop-shadow(0 1px 1px rgba(0,0,0,.5))}
  .logo h1{font-size:17px;margin:0;letter-spacing:.12em;font-weight:800;
    background:linear-gradient(90deg,#e8f6ff,#22d3ee 55%,#f472b6);-webkit-background-clip:text;background-clip:text;color:transparent;white-space:nowrap}
  .logo small{display:block;font-size:10px;letter-spacing:.22em;color:var(--dim);font-weight:600;margin-top:1px;white-space:nowrap}
  .searchbox{flex:1;max-width:460px;position:relative}
  .searchbox input{width:100%;padding:10px 12px 10px 34px;border-radius:10px;border:1px solid var(--line2);
    background:#0a1420;color:var(--ink);outline:none;font-family:var(--sans);font-size:13px}
  .searchbox input:focus{border-color:var(--cy2);box-shadow:0 0 0 3px rgba(34,211,238,.13)}
  .searchbox .ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--dim);display:flex}
  .topbtns{display:flex;gap:8px;margin-left:auto;flex-wrap:wrap}
  .btn{border:1px solid var(--line2);background:#101c2b;color:var(--ink);padding:9px 13px;border-radius:10px;
    cursor:pointer;font-size:12.5px;font-weight:600;display:inline-flex;align-items:center;gap:7px;
    transition:all .16s ease;white-space:nowrap;font-family:var(--sans)}
  .btn:hover{border-color:var(--cy2);transform:translateY(-1px);background:#132234}
  .btn:active{transform:translateY(0)}
  .btn.primary{background:linear-gradient(180deg,#19b9d0,#0e94ad);border-color:#2ad7ef;color:#04121a;
    box-shadow:0 6px 18px rgba(34,211,238,.25);text-shadow:0 1px 0 rgba(255,255,255,.25)}
  .btn.primary:hover{filter:brightness(1.08)}
  .btn.pink{background:linear-gradient(180deg,#e0588f,#c23b72);border-color:#f472b6;color:#1a0410;box-shadow:0 6px 18px rgba(244,114,182,.22)}
  .btn.ghost{background:transparent}
  .btn.sm{padding:6px 9px;font-size:11.5px;border-radius:8px}
  .btn.icon{padding:8px}
  .btn[disabled]{opacity:.45;cursor:not-allowed;transform:none!important}
  @media (max-width:980px){
    .topbar{flex-wrap:wrap;position:static}
    .searchbox{order:3;max-width:none;width:100%}
    .topbtns{margin-left:auto}
    .logo h1{font-size:15px}
  }
  /* ---------- layout ---------- */
  .body{display:grid;grid-template-columns:300px minmax(0,1fr) 330px;gap:14px;align-items:start}
  @media (max-width:1250px){ .body{grid-template-columns:280px minmax(0,1fr)} .rail{grid-column:1/-1} }
  @media (max-width:860px){ .body{grid-template-columns:1fr} .sidebar{order:2} .main{order:1} .rail{order:3} }
  .panel{background:linear-gradient(180deg, rgba(17,28,43,.75), rgba(11,18,28,.92));
    border:1px solid var(--line);border-radius:14px;overflow:hidden;
    box-shadow:0 12px 34px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.03)}
  .panel > header{display:flex;align-items:center;gap:9px;padding:10px 13px;border-bottom:1px solid var(--line);
    background:rgba(9,15,24,.55);font-size:11px;letter-spacing:.18em;font-weight:800;color:var(--dim);text-transform:uppercase}
  .panel > header .right{margin-left:auto;display:flex;gap:6px;align-items:center;letter-spacing:0;text-transform:none}
  .badge{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:999px;
    background:#0b1622;border:1px solid var(--line2);font-size:11px;color:var(--dim);font-weight:600;letter-spacing:0}
  .badge.cy{color:var(--cy);border-color:rgba(34,211,238,.4);background:rgba(34,211,238,.08)}
  .badge.lm{color:var(--lm);border-color:rgba(163,230,53,.4);background:rgba(163,230,53,.08)}
  .badge.am{color:var(--am);border-color:rgba(251,191,36,.4);background:rgba(251,191,36,.08)}
  .badge.rd{color:var(--rd);border-color:rgba(251,113,133,.45);background:rgba(251,113,133,.08)}
  .badge.flag{color:#0a0f14;background:linear-gradient(90deg,#a3e635,#22d3ee);border:none;font-weight:800;
    box-shadow:0 0 16px rgba(163,230,53,.35);animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{box-shadow:0 0 10px rgba(163,230,53,.28)}50%{box-shadow:0 0 22px rgba(163,230,53,.55)}}
  /* ---------- sidebar ---------- */
  .sidebar{position:sticky;top:86px}
  .cats{display:flex;gap:6px;padding:10px;flex-wrap:wrap;border-bottom:1px solid var(--line);background:rgba(9,15,24,.4)}
  .cat{padding:5px 10px;border-radius:999px;font-size:11px;font-weight:700;cursor:pointer;border:1px solid var(--line2);
    background:#0b1622;color:var(--dim);letter-spacing:.03em}
  .cat.active{background:rgba(34,211,238,.14);color:var(--cy);border-color:rgba(34,211,238,.5)}
  .cat:hover{border-color:var(--cy2);color:var(--cy)}
  .oplist{max-height:calc(100vh - 240px);overflow:auto;padding:8px}
  .opgroup{margin-bottom:4px}
  .opgroup h4{font-size:10px;letter-spacing:.2em;color:var(--dim2);margin:10px 6px 6px;text-transform:uppercase;font-weight:800}
  .opitem{display:flex;align-items:center;gap:9px;width:100%;padding:6.5px 9px;border-radius:9px;border:1px solid transparent;
    background:transparent;color:var(--ink);cursor:pointer;font-size:12.5px;text-align:left;font-family:var(--sans);transition:all .12s}
  .opitem:hover{background:#12202f;border-color:var(--line2)}
  .opitem:active{background:#16283a}
  .opitem .dot{width:6px;height:6px;border-radius:50%;background:var(--dim2);flex:none}
  .opitem:hover .dot{background:var(--cy);box-shadow:0 0 8px var(--cy)}
  .opitem .add{margin-left:auto;color:var(--dim2);font-weight:800;font-family:var(--mono);font-size:14px}
  .opitem:hover .add{color:var(--cy)}
  .opitem .k{font-size:10px;color:var(--dim2);display:block}
  /* ---------- main ---------- */
  .main{display:flex;flex-direction:column;gap:14px;min-width:0}
  textarea#input{width:100%;min-height:170px;max-height:46vh;resize:vertical;border:none;outline:none;
    background:#080f18;color:#e7f2ff;font-family:var(--mono);font-size:13.5px;line-height:1.6;padding:13px 15px;display:block}
  textarea#input::placeholder{color:#3c5470}
  .chips{display:flex;gap:6px;padding:9px 12px;flex-wrap:wrap;border-top:1px solid var(--line);background:rgba(9,15,24,.35);min-height:42px;align-items:center}
  .chip{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;font-size:11.5px;cursor:pointer;
    border:1px dashed rgba(34,211,238,.45);background:rgba(34,211,238,.06);color:var(--cy);font-weight:700;transition:all .14s}
  .chip:hover{background:rgba(34,211,238,.16);border-style:solid}
  .chip.magic{border-color:rgba(244,114,182,.5);color:var(--mg);background:rgba(244,114,182,.07)}
  .chip.magic:hover{background:rgba(244,114,182,.16)}
  .chip b{font-weight:800}
  .chip .conf{opacity:.65;font-weight:600}
  .hint{color:var(--dim2);font-size:11.5px}
  .outwrap{position:relative;background:#080f18}
  .out{min-height:150px;max-height:46vh;overflow:auto;margin:0;padding:13px 15px;font-family:var(--mono);font-size:13.5px;
    line-height:1.6;white-space:pre-wrap;word-break:break-word;color:#d9ecff}
  .out.flagtext{color:#b6f36a;text-shadow:0 0 18px rgba(163,230,53,.25)}
  .out .err{color:var(--rd)}
  .out .ok{color:var(--lm)}
  .outhead{display:flex;gap:8px;align-items:center;padding:8px 12px;border-top:1px solid var(--line);background:rgba(9,15,24,.45);flex-wrap:wrap}
  .outhead .via{font-size:11.5px;color:var(--dim)}
  .outhead .via b{color:var(--cy)}
  /* ---------- recipe ---------- */
  .rail{position:sticky;top:86px;display:flex;flex-direction:column;gap:14px;max-height:calc(100vh - 96px)}
  .steps{padding:9px;display:flex;flex-direction:column;gap:8px;overflow:auto;max-height:52vh}
  .empty{padding:22px 14px;text-align:center;color:var(--dim2);font-size:12.5px}
  .empty .big{font-size:26px;margin-bottom:6px;filter:grayscale(.2)}
  .step{border:1px solid var(--line2);border-radius:11px;background:#0e1a28;overflow:hidden}
  .step.error{border-color:rgba(251,113,133,.6)}
  .step-head{display:flex;align-items:center;gap:8px;padding:8px 9px;background:rgba(34,211,238,.05)}
  .step .idx{width:20px;height:20px;border-radius:6px;display:grid;place-items:center;font-size:10.5px;font-weight:800;
    background:rgba(34,211,238,.16);color:var(--cy);font-family:var(--mono)}
  .step .nm{font-size:12px;font-weight:700;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .step .mini{border:none;background:transparent;color:var(--dim);cursor:pointer;padding:2px 4px;border-radius:6px;font-size:12px;line-height:1}
  .step .mini:hover{background:#16283a;color:var(--cy)}
  .step .mini.del:hover{color:var(--rd)}
  .args{padding:8px 9px;display:flex;flex-direction:column;gap:7px;border-top:1px dashed var(--line)}
  .arg{display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--dim)}
  .arg label{flex:0 0 auto;min-width:74px;color:var(--dim);font-weight:600}
  .arg input[type=text],.arg input[type=number],.arg select{flex:1;min-width:0;background:#0a1420;border:1px solid var(--line2);
    color:var(--ink);border-radius:7px;padding:5px 7px;font-family:var(--mono);font-size:11.5px;outline:none}
  .arg input:focus,.arg select:focus{border-color:var(--cy2)}
  .arg input[type=checkbox]{accent-color:var(--cy);width:15px;height:15px}
  .step-err{color:var(--rd);font-size:11px;padding:6px 9px;background:rgba(251,113,133,.06);border-top:1px dashed rgba(251,113,133,.3)}
  /* ---------- misc ---------- */
  .toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,20px);background:#0f2233;border:1px solid var(--cy2);
    color:var(--ink);padding:10px 16px;border-radius:11px;font-size:13px;opacity:0;pointer-events:none;transition:all .25s;z-index:99;
    box-shadow:0 12px 30px rgba(0,0,0,.5);font-weight:600}
  .toast.show{opacity:1;transform:translate(-50%,0)}
  #kbdHint{position:fixed;right:14px;bottom:12px;font-size:10.5px;color:var(--dim2);z-index:10;user-select:none}
  #kbdHint kbd{background:#0e1a28;border:1px solid var(--line2);border-radius:5px;padding:1px 5px;font-family:var(--mono);font-size:10px}
  /* scrollbars */
  ::-webkit-scrollbar{width:10px;height:10px}
  ::-webkit-scrollbar-thumb{background:#1c3147;border-radius:8px;border:2px solid #0a1019}
  ::-webkit-scrollbar-thumb:hover{background:#27465f}
  ::-webkit-scrollbar-track{background:transparent}
  /* drawer */
  .drawer{position:fixed;inset:0;background:rgba(3,6,10,.66);backdrop-filter:blur(3px);z-index:90;display:none}
  .drawer.open{display:block}
  .drawer .card{position:absolute;right:0;top:0;bottom:0;width:min(720px,94vw);background:#0a131e;border-left:1px solid var(--line2);
    padding:22px 26px;overflow:auto;box-shadow:-30px 0 60px rgba(0,0,0,.5)}
  .drawer h2{margin:0 0 4px;font-size:18px;letter-spacing:.06em}
  .drawer h3{margin:22px 0 8px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--cy)}
  .drawer p,.drawer li{color:#a9bdd2;font-size:13px}
  .drawer code{background:#0e1a28;border:1px solid var(--line2);padding:1px 6px;border-radius:5px;font-family:var(--mono);font-size:12px;color:#bfe9f5}
  .drawer table{width:100%;border-collapse:collapse;font-size:12px;margin-top:6px}
  .drawer td,.drawer th{border:1px solid var(--line);padding:5px 8px;text-align:left}
  .drawer th{background:#0e1a28;color:var(--dim);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase}
  .drawer .refmono{font-family:var(--mono);color:#cfe7f7}
  .kb-nav{display:flex;gap:6px;flex-wrap:wrap;margin:14px 0 6px;position:sticky;top:0;background:#0a131e;padding:8px 0;z-index:2;border-bottom:1px solid var(--line)}
  .kb-tab{border:1px solid var(--line2);background:#0e1a28;color:var(--dim);padding:6px 11px;border-radius:999px;font-size:12px;cursor:pointer;font-weight:700;font-family:var(--sans)}
  .kb-tab:hover{border-color:var(--cy2);color:var(--cy)}
  .kb-tab.active{background:rgba(34,211,238,.15);border-color:rgba(34,211,238,.55);color:var(--cy)}
  .closeX{position:sticky;top:0;float:right;border:1px solid var(--line2);background:#0e1a28;color:var(--ink);
    width:32px;height:32px;border-radius:9px;cursor:pointer;font-size:15px}
</style>
</head>`;

window.SHELL_BODY = `<body>
<div class="wrap">
  <header class="topbar">
    <div class="logo">
      <span class="glyph">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#07131c" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 10V7a6 6 0 1 1 12 0v3"/><rect x="4" y="10" width="16" height="11" rx="2.5"/><circle cx="12" cy="15.4" r="1.6" fill="#07131c"/>
        </svg>
      </span>
      <div>
        <h1>CTF STUDIO</h1>
        <small>CYBER CHEF · DECODE · SOLVE</small>
      </div>
    </div>
    <div class="searchbox">
      <span class="ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></span>
      <input id="opSearch" type="text" placeholder="Search operations… (base64, xor, morse, rail)" autocomplete="off">
    </div>
    <div class="topbtns">
      <button class="btn primary" id="btnSmart" title="Recursive decode — flag dhoondhta hai (Ctrl+Enter)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="3.4"/></svg>
        Smart Solve
      </button>
      <button class="btn pink" id="btnFlag" title="Flag Hunt — har encoding me flag dhoondo">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 21V4"/><path d="M4 4c4-2 8 2 12 0v9c-4 2-8-2-12 0"/></svg>
        Flag Hunt
      </button>
      <button class="btn" id="btnChLib" style="border-color:rgba(163,230,53,.55);color:#a3e635;background:rgba(163,230,53,.08)" title="CryptoHack Library — 316 challenges">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M9 7h7M9 11h7"/></svg>
        CryptoHack
      </button>
      <button class="btn ghost" id="btnRef" title="Cheatsheet / reference">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        Cheatsheet
      </button>
    </div>
  </header>

  <div class="body">
    <!-- ============ SIDEBAR ============ -->
    <aside class="panel sidebar">
      <header>Operations <span class="badge cy" id="opCount"></span></header>
      <div class="cats" id="cats"></div>
      <div class="oplist" id="oplist"></div>
    </aside>

    <!-- ============ MAIN ============ -->
    <main class="main">
      <section class="panel">
        <header>
          Input
          <span class="badge" id="inStats">0 chars</span>
          <div class="right">
            <select id="sampleSel" class="badge" style="padding:5px 8px;cursor:pointer;background:#0b1622;color:var(--dim)">
              <option value="">⚡ Sample load karo…</option>
            </select>
            <button class="btn sm" id="btnPaste">Paste</button>
            <button class="btn sm" id="btnClearIn">Clear</button>
          </div>
        </header>
        <textarea id="input" spellcheck="false" placeholder="Yahan apna ciphertext / encoded message paste karo…

Examples:  SGVsbG8gQ1RGey4uLn0=   |   666c61677b...   |   ... --- ...   |   pynffvp grkg
Tip: 'Smart Solve' dabao — tool khud saari layers decode kar lega."></textarea>
        <div class="chips" id="chips"><span class="hint">Detector yahan kaunse encodings detect karta hai wo dikhayega…</span></div>
      </section>

      <section class="panel">
        <header>
          Output
          <span class="badge" id="outStats">0 chars</span>
          <div class="right">
            <span id="scoreBadge" class="badge">—</span>
            <span id="flagBadge" class="badge lm" style="display:none">🚩 FLAG</span>
            <button class="btn sm" id="btnCopy">Copy</button>
            <button class="btn sm" id="btnSwap" title="Output ko input bana do (layered decoding)">⤵ Use as input</button>
            <button class="btn sm" id="btnClearOut">Clear</button>
          </div>
        </header>
        <div class="outwrap"><pre class="out" id="output">Output yahan aayega…</pre></div>
        <div class="outhead">
          <span class="via" id="viaInfo">No operation applied — input as-is</span>
        </div>
      </section>
    </main>

    <!-- ============ RECIPE RAIL ============ -->
    <aside class="rail">
      <section class="panel">
        <header>
          Recipe / Chain
          <span class="badge" id="recipeCount">0 steps</span>
          <div class="right">
            <button class="btn sm" id="btnAuto" title="Magic → best decoders khud lagao">✨ Auto</button>
            <button class="btn sm" id="btnRecipeClear">Clear</button>
          </div>
        </header>
        <div class="steps" id="steps">
          <div class="empty"><div class="big">🧪</div>Left se operation click karo<br>ya <b style="color:var(--cy)">Smart Solve</b> chalao —<br>chain yahan banti hai.</div>
        </div>
      </section>

      <section class="panel">
        <header>Quick Tools</header>
        <div style="padding:10px;display:flex;flex-direction:column;gap:7px">
          <button class="btn sm" data-quick="playbook" style="justify-content:flex-start;border-color:rgba(34,211,238,.5);color:var(--cy)">🧭 CTF Playbook — kya hai + kya karo</button>
          <button class="btn sm" data-quick="magic" style="justify-content:flex-start">🔮 Magic — auto-detect encoding</button>
          <button class="btn sm" data-quick="smart-solve" style="justify-content:flex-start">🧠 Smart Solve — recursive flag hunt</button>
          <button class="btn sm" data-quick="flag-hunt" style="justify-content:flex-start">🚩 Flag Hunt — input me flag dhoondo</button>
          <button class="btn sm" data-quick="xor-brute" style="justify-content:flex-start">💥 XOR Brute Force — single byte crack</button>
          <button class="btn sm" data-quick="entropy" style="justify-content:flex-start">📊 Entropy &amp; Stats — randomness check</button>
          <button class="btn sm" data-quick="vigenere-crack" style="justify-content:flex-start">🔓 Vigenère Auto-Crack — key bina decrypt</button>
          <button class="btn sm" data-quick="frequency" style="justify-content:flex-start">🔤 Frequency Analysis — substitution help</button>
          <button class="btn sm" data-quick="rsa-decrypt" style="justify-content:flex-start">🧮 RSA Decrypt — p, q, e do</button>
          <button class="btn sm" data-quick="jwt-decode" style="justify-content:flex-start">🎫 JWT Decode</button>
        </div>
      </section>
    </aside>
  </div>
</div>

<div class="toast" id="toast"></div>
<div id="kbdHint"><kbd>Ctrl</kbd>+<kbd>Enter</kbd> Smart Solve · <kbd>Ctrl</kbd>+<kbd>⇧</kbd>+<kbd>C</kbd> Copy output</div>

<div class="drawer" id="drawer">
  <div class="card">
    <button class="closeX" id="drawerClose">✕</button>
    <h2>🕵️ CTF Studio — Knowledge Base</h2>
    <p>94 offline operations + poora crypto reference. Sab kuch browser me — koi server nahi.</p>
    <div class="kb-nav" id="kbNav">
      <button class="kb-tab active" data-kb="start">🚀 Start</button>
      <button class="kb-tab" data-kb="enc">🧱 Encodings</button>
      <button class="kb-tab" data-kb="classic">🏛 Classical</button>
      <button class="kb-tab" data-kb="rsa">🔢 RSA</button>
      <button class="kb-tab" data-kb="modern">🔐 Modern</button>
      <button class="kb-tab" data-kb="stego">🖼 Stego</button>
      <button class="kb-tab" data-kb="ref">📋 Tables</button>
    </div>

    <div class="kb-page" data-kb-page="start">
      <h3>Kaise use kare</h3>
      <p>1. Input me ciphertext paste karo → detector chips dikhenge.<br>
         2. <b>Smart Solve</b> (Ctrl+Enter) — recursive decode karke flag dhoondhta hai.<br>
         3. <b>🧭 CTF Playbook</b> — input pehchan kar step-by-step guide deta hai.<br>
         4. Sidebar se operations click karke apni <b>recipe</b> banao (args live edit).<br>
         5. Output ko <b>⤵ Use as input</b> se aage chain karo (nested layers).</p>

      <h3>Universal solve flow</h3>
      <p class="refmono" style="line-height:1.9">
        Input → 🧭 Playbook (kya hai?)<br>
        → 🔮 Magic (auto-detect + confidence)<br>
        → 🧠 Smart Solve (recursive, flag hunt)<br>
        → 🚩 Flag Hunt (confirm)<br>
        → agar atak jao: 📊 Entropy → frequency / n-gram → cipher identify<br>
        → RSA hai? → RSA Attacks (auto)<br>
        → key di hai? → AES Decrypt / Vigenère / XOR key<br>
        → binary junk? → XOR Brute Force / XOR Multi-byte Crack
      </p>

      <h3>Flag formats</h3>
      <p class="refmono">flag{...} · CTF{...} · HTB{...} · THM{...} · picoCTF{...} · crypto{...} · KEY{...} · nexus{...}</p>

      <h3>Keyboard</h3>
      <p><code>Ctrl+Enter</code> Smart Solve · <code>Ctrl+Shift+C</code> Copy · <code>Esc</code> drawer band</p>

      <h3>Privacy</h3>
      <p>Koi data network par nahi jaata — air-gapped machine par bhi chalta hai.</p>
    </div>

    <div class="kb-page" data-kb-page="enc" style="display:none">
      <h3>Encoding ladder — pehchano</h3>
      <table>
        <tr><th>Dikh raha hai</th><th>Kya hai</th><th>Op</th></tr>
        <tr><td class="refmono">SGVsbG8=</td><td>Base64 (A-Za-z0-9+/=, len%4=0)</td><td>From Base64</td></tr>
        <tr><td class="refmono">SGVsbG8 (no =)</td><td>Base64URL (-_ )</td><td>From Base64URL</td></tr>
        <tr><td class="refmono">JBSWY3DP</td><td>Base32 (A-Z2-7)</td><td>From Base32</td></tr>
        <tr><td class="refmono">StV1DL6CwTryKyV</td><td>Base58 (no 0OIl)</td><td>From Base58</td></tr>
        <tr><td class="refmono">BOu!rDZ</td><td>Ascii85 / Base85</td><td>From Ascii85</td></tr>
        <tr><td class="refmono">BB8</td><td>Base45 (QR)</td><td>Base45 Decode</td></tr>
        <tr><td class="refmono">aB%c</td><td>Base91</td><td>Base91 Decode</td></tr>
        <tr><td class="refmono">ABCDEFGHIJKLMNOP…</td><td>UU/XX encode</td><td>XXEncode Decode</td></tr>
        <tr><td class="refmono">=ybegin</td><td>yEnc (Usenet)</td><td>yEnc Decode</td></tr>
        <tr><td class="refmono">666c6167</td><td>Hex (a-f letters!)</td><td>From Hex</td></tr>
        <tr><td class="refmono">01100110</td><td>Binary</td><td>From Binary</td></tr>
        <tr><td class="refmono">102 108 97 103</td><td>Decimal ASCII (0-255)</td><td>From Decimal</td></tr>
        <tr><td class="refmono">150 151 160</td><td>Octal</td><td>From Octal</td></tr>
        <tr><td class="refmono">115151950638…(80 digits)</td><td>Big Integer / long_to_bytes</td><td>From Big Integer</td></tr>
        <tr><td class="refmono">%66%6c%61%67</td><td>URL encode</td><td>URL Decode</td></tr>
        <tr><td class="refmono">&amp;#102;&amp;#108;</td><td>HTML entities</td><td>HTML Decode</td></tr>
        <tr><td class="refmono">\u0066\u006c</td><td>Unicode escape</td><td>From Unicode Escape</td></tr>
        <tr><td class="refmono">=E2=9C=93</td><td>Quoted-Printable</td><td>QP Decode</td></tr>
        <tr><td class="refmono">.... . .-.. .-.. ---</td><td>Morse</td><td>From Morse</td></tr>
        <tr><td class="refmono">1-9A-z(no 0OIl)</td><td>Base58</td><td>From Base58</td></tr>
      </table>
      <h3>⚠️ Base64 "tables" (CTF classic)</h3>
      <p>Standard alphabet ke bajaye rotated/custom alphabet (e.g. <code>ZYX…A</code>) → <b>Base64 Try Alphabets</b> op saare common variants try karta hai (standard, rot13, URL-safe, reverse, rot47).</p>
      <h3>Pro tips</h3>
      <ul>
        <li>Base64 output ko dobara base64 lagao — 2-3 layers common hain (<b>Smart Solve</b> handles).</li>
        <li>Hex odd length? → ek leading 0 add karo.</li>
        <li>Decimal 0-255 range? ASCII. 1-26? A1Z26. 0/1? Binary.</li>
        <li>Base64 me <code>==</code> padding = 1 byte, <code>=</code> = 2 bytes.</li>
      </ul>
    </div>

    <div class="kb-page" data-kb-page="classic" style="display:none">
      <h3>Classical ciphers — identification</h3>
      <table>
        <tr><th>Cipher</th><th>Property</th><th>Key</th><th>Op</th></tr>
        <tr><td>Caesar / ROT-N</td><td>Letters shifted fixed amount; IOC ~English</td><td>shift 1-25</td><td>ROT-N (all 25)</td></tr>
        <tr><td>Atbash</td><td>A↔Z mirror</td><td>none</td><td>Atbash Cipher</td></tr>
        <tr><td>Vigenère</td><td>Polyalphabetic; IOC low, letter freq flat</td><td>word</td><td>Vigenère Auto-Crack</td></tr>
        <tr><td>Affine</td><td>E(x)=ax+b mod 26</td><td>a,b coprime</td><td>Affine Cipher</td></tr>
        <tr><td>Rail Fence</td><td>Transposition zig-zag; letter freq SAME as English</td><td>rails</td><td>Rail Fence</td></tr>
        <tr><td>Columnar</td><td>Transposition by columns; freq same</td><td>key word</td><td>Columnar Transposition</td></tr>
        <tr><td>Playfair</td><td>Digraphs (even length), 5x5 matrix</td><td>key</td><td>Playfair</td></tr>
        <tr><td>Bacon</td><td>A/B groups of 5 → letters</td><td>variant</td><td>Bacon Cipher</td></tr>
        <tr><td>A1Z26</td><td>1-26 numbers</td><td>separator</td><td>A1Z26</td></tr>
        <tr><td>Substitution (monoalphabetic)</td><td>IOC ~0.066 same as English, but words wrong</td><td>26 mapping</td><td>Frequency Analysis</td></tr>
      </table>
      <h3>Kaise pehchane</h3>
      <p><b>IOC (Index of Coincidence):</b> ~0.066 = English/monoalphabetic, ~0.038 = polyalphabetic (Vigenère) ya random.<br>
      <b>Letter frequency:</b> English me E T A O I N S H R. Agar freq English jaisi hai par text padhne me galat → transposition ya substitution.<br>
      <b>Transposition vs substitution:</b> transposition me letter distribution SAME rehta hai (sirf order badalta hai).</p>
      <h3>Vigenère crack kaise kaam karta hai</h3>
      <p>1. IOC per key-length → key length guess (0.066 ke kareeb best).<br>
      2. Har column ka chi-squared/llr → shift (key letter).<br>
      3. Hill-climbing se key refine; overall readability se best length.</p>
    </div>

    <div class="kb-page" data-kb-page="rsa" style="display:none">
      <h3>RSA basics</h3>
      <p class="refmono">
        n = p × q<br>
        φ(n) = (p−1)(q−1)   λ = lcm(p−1, q−1)<br>
        e × d ≡ 1 (mod φ)<br>
        Encrypt: c = m^e mod n<br>
        Decrypt: m = c^d mod n
      </p>

      <h3>Which attack when? — decision tree</h3>
      <table>
        <tr><th>Condition</th><th>Attack</th><th>Op</th></tr>
        <tr><td>n chhota hai (&lt; 512 bits)</td><td>Factor n</td><td>RSA Factor n</td></tr>
        <tr><td>p aur q paas-paas</td><td>Fermat factorization</td><td>RSA Attacks (auto)</td></tr>
        <tr><td>e=3 aur m chhota (m^e &lt; n)</td><td>Cube root</td><td>RSA Attacks (auto)</td></tr>
        <tr><td>wahi message, alag n, e=3</td><td>Håstad broadcast (CRT)</td><td>RSA Hastad Broadcast</td></tr>
        <tr><td>d chhota (d &lt; n^0.25)</td><td>Wiener attack</td><td>RSA Attacks (auto)</td></tr>
        <tr><td>same n, alag e1,e2</td><td>Common modulus</td><td>RSA Common Modulus</td></tr>
        <tr><td>p, q diye hain</td><td>Key build + decrypt</td><td>RSA Build Key from p,q</td></tr>
        <tr><td>c ko n ke saath share kiya</td><td>gcd(c, n) = p (rare)</td><td>RSA Factor n</td></tr>
        <tr><td>e = 1</td><td>c = m directly</td><td>From Big Integer</td></tr>
      </table>

      <h3>Common CTF RSA patterns</h3>
      <ul>
        <li><b>Small n</b> — factorize karo (factordb.com / Pollard rho). 512-bit tak aaram se.</li>
        <li><b>e=3, m chhota</b> — m³ &lt; n, to c ka exact cube root lo (mod n ki zaroorat nahi).</li>
        <li><b>Håstad</b> — same m, e=3, 3 alag n → CRT se m³ nikalo → cube root.</li>
        <li><b>Wiener</b> — d chhota ho to e/n ki continued fraction se d nikalta hai.</li>
        <li><b>Common modulus</b> — gcd(e1,e2)=1, to m = c1^a × c2^b mod n.</li>
        <li><b>Padding oracle / LSB oracle</b> — tool me nahi, manual scripting chahiye.</li>
        <li><b>Bleichenbacher</b> — PKCS#1 v1.5 padding oracle — advanced.</li>
      </ul>

      <h3>Python helper (CTF standard)</h3>
      <p class="refmono">
        from Crypto.Util.number import long_to_bytes, bytes_to_long<br>
        from sympy import factorint<br>
        p, q = factorint(n).keys()<br>
        d = pow(e, -1, (p-1)*(q-1))<br>
        m = pow(c, d, n)<br>
        print(long_to_bytes(m))
      </p>
    </div>

    <div class="kb-page" data-kb-page="modern" style="display:none">
      <h3>AES</h3>
      <table>
        <tr><th>Mode</th><th>Malum cheez</th><th>Attack</th></tr>
        <tr><td>ECB</td><td>same block → same ciphertext</td><td>ECB Detect / block splicing</td></tr>
        <tr><td>CBC</td><td>IV known + bit-flip</td><td>CBC bit-flipping (manual)</td></tr>
        <tr><td>CTR</td><td>nonce reuse → XOR keystream</td><td>keystream reuse (c1 XOR c2 = m1 XOR m2)</td></tr>
        <tr><td>GCM</td><td>nonce reuse → auth key recover</td><td>advanced (manual)</td></tr>
      </table>
      <p>Key size: 16 (128-bit), 24 (192), 32 (256) bytes. IV = 16 bytes.</p>

      <h3>Hashes</h3>
      <table>
        <tr><th>Length</th><th>Algorithm</th></tr>
        <tr><td class="refmono">32 hex</td><td>MD5 / NTLM / MD4</td></tr>
        <tr><td class="refmono">40 hex</td><td>SHA-1 / RIPEMD-160</td></tr>
        <tr><td class="refmono">56 hex</td><td>SHA-224</td></tr>
        <tr><td class="refmono">64 hex</td><td>SHA-256 / SHA3-256 / Keccak-256</td></tr>
        <tr><td class="refmono">96 hex</td><td>SHA-384</td></tr>
        <tr><td class="refmono">128 hex</td><td>SHA-512 / Whirlpool</td></tr>
        <tr><td class="refmono">$2a$ / $2b$</td><td>bcrypt</td></tr>
        <tr><td class="refmono">$argon2</td><td>Argon2</td></tr>
        <tr><td class="refmono">$1$ / $5$ / $6$</td><td>MD5/SHA-256/SHA-512 crypt</td></tr>
      </table>
      <p><b>Cracking order:</b> Hash Identify → common wordlist → numbers 0-99999 → rockyou (bahar) → mask attack.</p>

      <h3>JWT</h3>
      <ul>
        <li><code>alg:none</code> → signature strip karke <code>header.payload.</code> bhejo</li>
        <li>HS256 → weak secret ko wordlist se crack karo (<code>jwt_tool</code>/hashcat)</li>
        <li>RS256 → HS256 confusion (public key ko HMAC secret samjho)</li>
      </ul>

      <h3>Diffie-Hellman</h3>
      <p><code>shared = A^b mod p = B^a mod p</code> — g chhota / p smooth ho to discrete log (Pohlig-Hellman). Tool me DH Shared Secret op.</p>

      <h3>HMAC / MAC</h3>
      <ul>
        <li>Length extension attack (MD5/SHA1/SHA256 + secret-prefix MAC)</li>
        <li>Timing attack (compare == instead of constant time)</li>
      </ul>
    </div>

    <div class="kb-page" data-kb-page="stego" style="display:none">
      <h3>Steganography quick checks</h3>
      <table>
        <tr><th>Kahan</th><th>Kya karо</th></tr>
        <tr><td>Text (zero-width chars)</td><td>Text Stego (zero-width) op</td></tr>
        <tr><td>Bits / whitespace</td><td>MSB / LSB Extract</td></tr>
        <tr><td>PNG/JPEG file</td><td>strings / exiftool / zsteg / binwalk (bahar)</td></tr>
        <tr><td>Appended after EOF</td><td>Hex me <code>FF D9</code> / <code>IEND</code> ke baad data → binwalk</td></tr>
        <tr><td>Audio</td><td>spectrogram (Audacity) / DTMF / SSTV</td></tr>
        <tr><td>QR / barcode</td><td>zbarimg / online decoder → Base45</td></tr>
      </table>
      <h3>Magic bytes (file signatures)</h3>
      <table>
        <tr><th>Hex</th><th>Format</th></tr>
        <tr><td class="refmono">89 50 4E 47</td><td>PNG</td></tr>
        <tr><td class="refmono">FF D8 FF</td><td>JPEG</td></tr>
        <tr><td class="refmono">47 49 46 38</td><td>GIF</td></tr>
        <tr><td class="refmono">25 50 44 46</td><td>PDF</td></tr>
        <tr><td class="refmono">50 4B 03 04</td><td>ZIP / DOCX / APK</td></tr>
        <tr><td class="refmono">1F 8B 08</td><td>GZIP</td></tr>
        <tr><td class="refmono">7F 45 4C 46</td><td>ELF</td></tr>
        <tr><td class="refmono">4D 5A</td><td>PE/EXE</td></tr>
        <tr><td class="refmono">52 49 46 46</td><td>RIFF (WAV/AVI/WEBP)</td></tr>
        <tr><td class="refmono">66 4C 61 43</td><td>FLAC</td></tr>
      </table>
    </div>

    <div class="kb-page" data-kb-page="ref" style="display:none">
      <h3>Morse Code Table</h3>
      <table><tr><th>A</th><td class="refmono">.-</td><th>B</th><td class="refmono">-...</td><th>C</th><td class="refmono">-.-.</td><th>D</th><td class="refmono">-..</td><th>E</th><td class="refmono">.</td></tr>
      <tr><th>F</th><td class="refmono">..-.</td><th>G</th><td class="refmono">--.</td><th>H</th><td class="refmono">....</td><th>I</th><td class="refmono">..</td><th>J</th><td class="refmono">.---</td></tr>
      <tr><th>K</th><td class="refmono">-.-</td><th>L</th><td class="refmono">.-..</td><th>M</th><td class="refmono">--</td><th>N</th><td class="refmono">-.</td><th>O</th><td class="refmono">---</td></tr>
      <tr><th>P</th><td class="refmono">.--.</td><th>Q</th><td class="refmono">--.-</td><th>R</th><td class="refmono">.-.</td><th>S</th><td class="refmono">...</td><th>T</th><td class="refmono">-</td></tr>
      <tr><th>U</th><td class="refmono">..-</td><th>V</th><td class="refmono">...-</td><th>W</th><td class="refmono">.--</td><th>X</th><td class="refmono">-..-</td><th>Y</th><td class="refmono">-.--</td></tr>
      <tr><th>Z</th><td class="refmono">--..</td><th>0</th><td class="refmono">-----</td><th>1</th><td class="refmono">.----</td><th>2</th><td class="refmono">..---</td><th>3</th><td class="refmono">...--</td></tr>
      <tr><th>4</th><td class="refmono">....-</td><th>5</th><td class="refmono">.....</td><th>6</th><td class="refmono">-....</td><th>7</th><td class="refmono">--...</td><th>8</th><td class="refmono">---..</td></tr>
      <tr><th>9</th><td class="refmono">----.</td><th>?</th><td class="refmono">..--..</td><th>!</th><td class="refmono">-.-.--</td><th>/</th><td class="refmono">-..-.</td><th>@</th><td class="refmono">.--.-.</td></tr></table>

      <h3>Numbers & bases</h3>
      <table>
        <tr><th>Base</th><th>Alphabet</th><th>Example "flag"</th></tr>
        <tr><td>2</td><td>0-1</td><td class="refmono">01100110 01101100 01100001 01100111</td></tr>
        <tr><td>8</td><td>0-7</td><td class="refmono">146 154 141 147</td></tr>
        <tr><td>10</td><td>0-9</td><td class="refmono">102 108 97 103</td></tr>
        <tr><td>16</td><td>0-9a-f</td><td class="refmono">666c6167</td></tr>
        <tr><td>32</td><td>A-Z2-7</td><td class="refmono">MZWGCZQ=</td></tr>
        <tr><td>58</td><td>1-9A-HJ-NP-Za-km-z</td><td class="refmono">(no 0 O I l)</td></tr>
        <tr><td>64</td><td>A-Za-z0-9+/</td><td class="refmono">ZmxhZw==</td></tr>
        <tr><td>85</td><td>!-u</td><td class="refmono">AoDTs</td></tr>
        <tr><td>91</td><td>A-Za-z0-9!#$%…</td><td class="refmono">fS?y</td></tr>
      </table>

      <h3>English letter frequency (top)</h3>
      <p class="refmono">E 12.70% · T 9.06% · A 8.17% · O 7.51% · I 6.97% · N 6.75% · S 6.33% · H 6.09% · R 5.99% · D 4.25% · L 4.03% · U 2.76%<br>
      Bigrams: TH HE IN ER AN RE ON AT EN ND<br>
      Trigrams: THE AND ING ENT ION HER FOR THA NTH INT</p>

      <h3>Colors in this tool</h3>
      <p><span class="badge lm">readability ≥80%</span> English jaisa · <span class="badge am">50-79%</span> partial · <span class="badge rd">&lt;50%</span> junk<br>
      🚩 badge = flag detect hua · confidence % = detection certainty</p>
    </div>
  </div>
</div>`;
