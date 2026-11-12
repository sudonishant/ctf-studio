/* ============================================================
   CTF STUDIO v5.0 — Shell (HTML + CSS) — PRO UI
   Redesign: command palette, 4 themes, tabs, history, resizable,
   mobile-first responsive, keyboard-first
   ============================================================ */
window.SHELL_HEAD = `<!DOCTYPE html>
<html lang="en" data-theme="cyber">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>CTF Studio v5 — Universal Crypto Workbench</title>
<meta name="description" content="Offline CTF toolkit: 123 operations, universal cipher cracker, quadgram English model, CryptoHack library. 100% browser, no server.">
<meta name="theme-color" content="#070b12">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%2322d3ee'/%3E%3Cstop offset='1' stop-color='%23a78bfa'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='32' height='32' rx='9' fill='url(%23g)'/%3E%3Cpath d='M10 14V11a6 6 0 1 1 12 0v3' stroke='%2307131c' stroke-width='2.6' fill='none' stroke-linecap='round'/%3E%3Crect x='8' y='14' width='16' height='11' rx='3' fill='%2307131c'/%3E%3Ccircle cx='16' cy='19.4' r='1.9' fill='%2322d3ee'/%3E%3C/svg%3E">
<style>
/* ==================== THEMES ==================== */
:root, [data-theme="cyber"]{
  --bg:#060910; --bg2:#080d16; --panel:#0c1420; --panel2:#111c2b; --panel3:#16243a;
  --line:#18273b; --line2:#22374f; --line3:#2c4560;
  --ink:#dfeaf7; --dim:#8096ae; --dim2:#546c86; --dim3:#3a4f66;
  --ac1:#22d3ee; --ac2:#a78bfa; --ac3:#f472b6; --ok:#34d399; --warn:#fbbf24; --err:#fb7185;
  --glow:rgba(34,211,238,.16);
}
[data-theme="matrix"]{
  --bg:#030804; --bg2:#05100a; --panel:#07160d; --panel2:#0a1f13; --panel3:#0d2818;
  --line:#103a22; --line2:#17512f; --line3:#1f6b3f;
  --ink:#c9f5d8; --dim:#5fa97a; --dim2:#3d7d55; --dim3:#2a5c3d;
  --ac1:#22c55e; --ac2:#84cc16; --ac3:#a3e635; --ok:#22c55e; --warn:#eab308; --err:#f87171;
  --glow:rgba(34,197,94,.16);
}
[data-theme="amber"]{
  --bg:#0b0904; --bg2:#120e06; --panel:#171207; --panel2:#1f1809; --panel3:#291f0d;
  --line:#33270f; --line2:#473618; --line3:#5c4a22;
  --ink:#f5e9cd; --dim:#b09a6b; --dim2:#877350; --dim3:#5f5238;
  --ac1:#f59e0b; --ac2:#fbbf24; --ac3:#fcd34d; --ok:#84cc16; --warn:#fbbf24; --err:#f87171;
  --glow:rgba(245,158,11,.15);
}
[data-theme="light"]{
  --bg:#f3f6fb; --bg2:#eaeff7; --panel:#ffffff; --panel2:#f7f9fd; --panel3:#eef3fa;
  --line:#dce4ef; --line2:#c8d4e4; --line3:#aebdd1;
  --ink:#0e1a2b; --dim:#5b6f88; --dim2:#7e91a8; --dim3:#9fafc2;
  --ac1:#0891b2; --ac2:#7c3aed; --ac3:#db2777; --ok:#059669; --warn:#b45309; --err:#dc2626;
  --glow:rgba(8,145,178,.12);
}
:root{
  --mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace;
  --sans:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  --r:14px; --r2:10px; --r3:8px;
  --sh:0 18px 44px -18px rgba(0,0,0,.65), 0 2px 8px -2px rgba(0,0,0,.4);
  --shs:0 8px 22px -12px rgba(0,0,0,.5);
  --tr:.18s cubic-bezier(.4,0,.2,1);
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{height:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:14px;line-height:1.55;
  overflow-x:hidden;transition:background var(--tr),color var(--tr)}
body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(900px 480px at 88% -8%, var(--glow), transparent 62%),
    radial-gradient(760px 400px at -6% 104%, color-mix(in srgb, var(--ac2) 12%, transparent), transparent 62%);
}
body::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.55;
  background-image:linear-gradient(color-mix(in srgb, var(--ac1) 6%, transparent) 1px, transparent 1px),
                   linear-gradient(90deg, color-mix(in srgb, var(--ac1) 6%, transparent) 1px, transparent 1px);
  background-size:32px 32px;
  -webkit-mask-image:radial-gradient(ellipse 80% 70% at 50% 0%, #000 30%, transparent 100%);
          mask-image:radial-gradient(ellipse 80% 70% at 50% 0%, #000 30%, transparent 100%);}
::selection{background:color-mix(in srgb, var(--ac1) 34%, transparent);color:var(--ink)}
::-webkit-scrollbar{width:11px;height:11px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--line2);border-radius:8px;border:3px solid var(--bg)}
::-webkit-scrollbar-thumb:hover{background:var(--line3)}
a{color:var(--ac1);text-decoration:none}
button{font-family:inherit}
:focus-visible{outline:2px solid var(--ac1);outline-offset:2px}

/* ==================== APP GRID ==================== */
.app{position:relative;z-index:1;display:flex;flex-direction:column;height:100vh;height:100dvh}
.wrap{flex:1;min-height:0;display:grid;grid-template-columns:286px minmax(0,1fr) 330px;
  grid-template-rows:minmax(0,1fr);gap:12px;padding:0 14px 14px;max-width:1920px;width:100%;margin:0 auto}

/* ==================== TOPBAR ==================== */
.topbar{display:flex;align-items:center;gap:12px;padding:9px 14px;margin:10px 14px 12px;
  background:color-mix(in srgb, var(--panel) 88%, transparent);border:1px solid var(--line);
  border-radius:var(--r);box-shadow:var(--sh);backdrop-filter:blur(14px) saturate(1.2);
  position:relative;z-index:60;flex-shrink:0}
.logo{display:flex;align-items:center;gap:10px;user-select:none;flex-shrink:0}
.logo .glyph{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;position:relative;
  background:linear-gradient(135deg, var(--ac1), var(--ac2) 55%, var(--ac3));
  box-shadow:0 0 22px -4px color-mix(in srgb, var(--ac1) 55%, transparent);flex-shrink:0}
.logo .glyph::after{content:"";position:absolute;inset:1px;border-radius:10px;
  background:linear-gradient(160deg, rgba(255,255,255,.22), transparent 45%)}
.logo .glyph svg{position:relative;z-index:1}
.logo-txt h1{font-size:15px;margin:0;letter-spacing:.1em;font-weight:800;line-height:1.1;white-space:nowrap;
  background:linear-gradient(95deg, var(--ink), var(--ac1) 62%, var(--ac2));
  -webkit-background-clip:text;background-clip:text;color:transparent}
.logo-txt small{display:block;font-size:9px;letter-spacing:.19em;color:var(--dim2);font-weight:700;margin-top:2px;white-space:nowrap}
.ver{font-size:9px;font-weight:800;padding:2px 6px;border-radius:5px;margin-left:5px;
  background:color-mix(in srgb, var(--ac1) 16%, transparent);color:var(--ac1);
  border:1px solid color-mix(in srgb, var(--ac1) 32%, transparent);vertical-align:2px}

/* command trigger */
.cmdtrigger{flex:1;max-width:520px;display:flex;align-items:center;gap:9px;padding:8px 11px;
  border-radius:var(--r2);border:1px solid var(--line2);background:var(--bg2);color:var(--dim);
  cursor:pointer;transition:all var(--tr);font-size:12.5px;text-align:left;min-width:120px}
.cmdtrigger:hover{border-color:var(--ac1);background:var(--panel2);color:var(--ink);
  box-shadow:0 0 0 3px color-mix(in srgb, var(--ac1) 10%, transparent)}
.cmdtrigger .k{margin-left:auto;display:flex;gap:3px;flex-shrink:0}

.topbtns{display:flex;gap:7px;margin-left:auto;flex-wrap:nowrap;align-items:center}
.btn{border:1px solid var(--line2);background:var(--panel2);color:var(--ink);padding:8px 12px;
  border-radius:var(--r2);cursor:pointer;font-size:12.5px;font-weight:600;
  display:inline-flex;align-items:center;gap:6px;transition:all var(--tr);white-space:nowrap;
  position:relative;overflow:hidden}
.btn:hover{border-color:var(--line3);background:var(--panel3);transform:translateY(-1px)}
.btn:active{transform:translateY(0) scale(.985)}
.btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn.primary{background:linear-gradient(180deg, var(--ac1), color-mix(in srgb, var(--ac1) 74%, #000));
  border-color:color-mix(in srgb, var(--ac1) 68%, #fff);color:#04121a;font-weight:800;
  box-shadow:0 6px 18px -6px color-mix(in srgb, var(--ac1) 62%, transparent)}
.btn.primary:hover{filter:brightness(1.07);box-shadow:0 8px 24px -6px color-mix(in srgb, var(--ac1) 72%, transparent)}
.btn.accent{background:linear-gradient(180deg, var(--ac2), color-mix(in srgb, var(--ac2) 74%, #000));
  border-color:color-mix(in srgb, var(--ac2) 68%, #fff);color:#0d0618;font-weight:800}
.btn.accent:hover{filter:brightness(1.07)}
.btn.ghost{background:transparent;border-color:var(--line2);color:var(--dim)}
.btn.ghost:hover{color:var(--ink);background:var(--panel2)}
.btn.sm{padding:5px 9px;font-size:11.5px;border-radius:var(--r3);gap:5px}
.btn.icon{padding:8px;width:34px;height:34px;justify-content:center}
.btn.sm.icon{padding:5px;width:26px;height:26px}
.btn.run{background:linear-gradient(135deg, var(--ac1), var(--ac2));color:#05121a;border:none;
  font-weight:800;letter-spacing:.02em;box-shadow:0 6px 20px -8px var(--ac1)}
.btn.run:hover{filter:brightness(1.08)}
kbd{font-family:var(--mono);font-size:9.5px;padding:2px 5px;border-radius:4px;background:var(--panel3);
  border:1px solid var(--line2);color:var(--dim);border-bottom-width:2px;line-height:1;white-space:nowrap}

/* ==================== PANELS ==================== */
.panel{background:color-mix(in srgb, var(--panel) 92%, transparent);border:1px solid var(--line);
  border-radius:var(--r);box-shadow:var(--shs);display:flex;flex-direction:column;min-height:0;
  overflow:hidden;transition:border-color var(--tr)}
.panel>header{display:flex;align-items:center;gap:7px;padding:9px 12px;font-size:11px;
  font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--dim);
  border-bottom:1px solid var(--line);background:color-mix(in srgb, var(--panel3) 42%, transparent);
  flex-shrink:0;min-height:41px}
.panel>header .right{margin-left:auto;display:flex;gap:5px;align-items:center;text-transform:none;letter-spacing:0}
.badge{font-size:9.5px;font-weight:700;padding:2px 7px;border-radius:6px;background:var(--panel3);
  color:var(--dim);border:1px solid var(--line2);letter-spacing:.03em;text-transform:none;white-space:nowrap}
.badge.cy{color:var(--ac1);border-color:color-mix(in srgb, var(--ac1) 38%, transparent);
  background:color-mix(in srgb, var(--ac1) 12%, transparent)}
.badge.lm{color:var(--ok);border-color:color-mix(in srgb, var(--ok) 38%, transparent);
  background:color-mix(in srgb, var(--ok) 12%, transparent)}
.badge.am{color:var(--warn);border-color:color-mix(in srgb, var(--warn) 38%, transparent);
  background:color-mix(in srgb, var(--warn) 12%, transparent)}
.badge.rd{color:var(--err);border-color:color-mix(in srgb, var(--err) 38%, transparent);
  background:color-mix(in srgb, var(--err) 12%, transparent)}

/* ==================== SIDEBAR ==================== */
.sidebar{grid-column:1}
.cats{display:flex;gap:5px;flex-wrap:wrap;padding:9px 10px;border-bottom:1px solid var(--line);flex-shrink:0}
.cat{font-size:10.5px;font-weight:700;padding:4px 9px;border-radius:20px;border:1px solid var(--line2);
  background:transparent;color:var(--dim);cursor:pointer;transition:all var(--tr);white-space:nowrap}
.cat:hover{color:var(--ink);border-color:var(--line3);background:var(--panel2)}
.cat.active{background:linear-gradient(135deg, var(--ac1), var(--ac2));border-color:transparent;
  color:#04121a;box-shadow:0 3px 12px -4px var(--ac1)}
.oplist{overflow-y:auto;flex:1;padding:6px;min-height:0}
.opitem{display:flex;align-items:center;gap:9px;padding:7px 9px;border-radius:var(--r3);cursor:pointer;
  transition:all var(--tr);border:1px solid transparent;position:relative}
.opitem:hover{background:var(--panel2);border-color:var(--line)}
.opitem.active{background:color-mix(in srgb, var(--ac1) 13%, transparent);
  border-color:color-mix(in srgb, var(--ac1) 42%, transparent)}
.opitem.active::before{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);
  width:2.5px;height:60%;border-radius:2px;background:var(--ac1)}
.opitem .oi{width:24px;height:24px;border-radius:7px;display:grid;place-items:center;flex-shrink:0;
  background:var(--panel3);color:var(--ac1);font-size:11px;font-weight:800;border:1px solid var(--line2)}
.opitem .on{font-size:12px;font-weight:600;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.opitem .oc{font-size:9.5px;color:var(--dim2);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.opitem .star{margin-left:auto;opacity:0;font-size:11px;color:var(--warn);transition:opacity var(--tr)}
.opitem:hover .star,.opitem .star.on{opacity:1}

/* ==================== MAIN ==================== */
.main{grid-column:2;display:flex;flex-direction:column;gap:12px;min-height:0;min-width:0}
.io{flex:1;display:flex;flex-direction:column;min-height:0;gap:0}
.io .panel{flex:1;min-height:0}
.io.split{display:grid;grid-template-rows:1fr auto 1fr;gap:0}

textarea#input,.out{width:100%;flex:1;min-height:0;resize:none;border:none;outline:none;
  background:transparent;color:var(--ink);font-family:var(--mono);font-size:13px;line-height:1.65;
  padding:13px 15px;display:block;overflow-y:auto;word-break:break-word;white-space:pre-wrap;
  tab-size:2}
textarea#input{height:100%}
textarea#input::placeholder{color:var(--dim3);font-family:var(--sans);font-size:12.5px;line-height:1.8}
.out{margin:0;font-size:12.5px;white-space:pre-wrap;word-break:break-word}
.out.empty{color:var(--dim2);font-family:var(--sans);font-size:12.5px}
.chips{display:flex;gap:5px;flex-wrap:wrap;padding:0 12px 10px;min-height:0;flex-shrink:0}
.chips:empty{display:none}
.chip{font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;cursor:pointer;
  border:1px solid color-mix(in srgb, var(--ac1) 34%, transparent);
  background:color-mix(in srgb, var(--ac1) 10%, transparent);color:var(--ac1);transition:all var(--tr)}
.chip:hover{background:color-mix(in srgb, var(--ac1) 22%, transparent);transform:translateY(-1px)}
.chip.hint{cursor:default;border-color:var(--line2);background:transparent;color:var(--dim2);font-weight:500}
.outhead{display:flex;align-items:center;gap:8px;padding:7px 13px;border-top:1px solid var(--line);
  font-size:11px;color:var(--dim2);flex-shrink:0;background:color-mix(in srgb, var(--panel3) 30%, transparent)}
.via{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* resizer */
.rz{height:9px;display:flex;align-items:center;justify-content:center;cursor:row-resize;flex-shrink:0;
  background:transparent;position:relative;z-index:5;margin:-4px 0}
.rz::after{content:"";width:44px;height:3px;border-radius:2px;background:var(--line2);transition:background var(--tr)}
.rz:hover::after{background:var(--ac1)}
.rz:active::after{background:var(--ac1);box-shadow:0 0 12px var(--ac1)}

/* ==================== RAIL ==================== */
.rail{grid-column:3;display:flex;flex-direction:column;gap:12px;min-height:0;overflow-y:auto;padding-right:1px}
.rail .panel{flex-shrink:0}
.rail .panel.grow{flex:1;min-height:180px}
.steps{padding:8px;overflow-y:auto;flex:1;min-height:0;display:flex;flex-direction:column;gap:6px}
.step{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:var(--r3);
  background:var(--panel2);border:1px solid var(--line);font-size:11.5px;transition:all var(--tr);
  position:relative;animation:slideIn .22s ease}
@keyframes slideIn{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:none}}
.step:hover{border-color:var(--line3)}
.step .sn{width:17px;height:17px;border-radius:50%;display:grid;place-items:center;flex-shrink:0;
  background:color-mix(in srgb, var(--ac1) 20%, transparent);color:var(--ac1);font-size:9px;font-weight:800}
.step .st{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}
.step .sx{cursor:pointer;color:var(--dim2);font-size:13px;line-height:1;padding:0 2px;transition:color var(--tr)}
.step .sx:hover{color:var(--err)}
.step .sarg{font-size:9.5px;color:var(--dim2);font-weight:500;display:block;margin-top:1px}
.quicklist{padding:8px;display:flex;flex-direction:column;gap:4px;overflow-y:auto;min-height:0}
.qbtn{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:var(--r3);cursor:pointer;
  border:1px solid transparent;background:transparent;color:var(--ink);font-size:11.5px;
  font-weight:600;text-align:left;transition:all var(--tr);width:100%}
.qbtn:hover{background:var(--panel2);border-color:var(--line);transform:translateX(2px)}
.qbtn .qe{font-size:13px;flex-shrink:0;width:18px;text-align:center}
.qbtn .qd{font-size:9.5px;color:var(--dim2);font-weight:500;display:block}

/* ==================== TABS ==================== */
.tabs{display:flex;gap:2px;padding:0 8px;border-bottom:1px solid var(--line);flex-shrink:0;
  background:color-mix(in srgb, var(--panel3) 28%, transparent);overflow-x:auto;scrollbar-width:none}
.tabs::-webkit-scrollbar{display:none}
.tab{font-size:10.5px;font-weight:700;padding:8px 11px;cursor:pointer;border:none;background:transparent;
  color:var(--dim2);border-bottom:2px solid transparent;transition:all var(--tr);white-space:nowrap;
  display:flex;align-items:center;gap:5px;letter-spacing:.02em}
.tab:hover{color:var(--ink);background:var(--panel2)}
.tab.active{color:var(--ac1);border-bottom-color:var(--ac1);background:transparent}

/* ==================== HISTORY ==================== */
.hist{padding:6px;overflow-y:auto;flex:1;min-height:0;display:flex;flex-direction:column;gap:4px}
.hitem{padding:7px 9px;border-radius:var(--r3);border:1px solid var(--line);background:var(--panel2);
  cursor:pointer;transition:all var(--tr);font-size:11px;position:relative}
.hitem:hover{border-color:var(--ac1);transform:translateX(2px)}
.hitem .ht{font-size:9.5px;color:var(--dim2);margin-bottom:2px;display:flex;justify-content:space-between}
.hitem .hb{font-family:var(--mono);font-size:10.5px;color:var(--dim);overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.hitem .hf{color:var(--ok);font-size:9.5px;font-weight:700}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
  padding:22px 14px;text-align:center;color:var(--dim2);font-size:11.5px;line-height:1.7;flex:1}
.empty .big{font-size:26px;opacity:.5;margin-bottom:2px}
.empty b{color:var(--ac1)}

/* ==================== COMMAND PALETTE ==================== */
.cmdk{position:fixed;inset:0;z-index:200;display:none;align-items:flex-start;justify-content:center;
  padding:12vh 16px 16px;background:rgba(0,0,0,.62);backdrop-filter:blur(5px)}
.cmdk.open{display:flex;animation:fadeIn .16s ease}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.cmdk-box{width:100%;max-width:620px;background:var(--panel);border:1px solid var(--line2);
  border-radius:16px;box-shadow:0 32px 80px -20px rgba(0,0,0,.85), 0 0 0 1px rgba(255,255,255,.04);
  overflow:hidden;display:flex;flex-direction:column;max-height:min(70vh,560px);
  animation:popIn .2s cubic-bezier(.2,1.1,.4,1)}
@keyframes popIn{from{opacity:0;transform:translateY(-14px) scale(.97)}to{opacity:1;transform:none}}
.cmdk-in{display:flex;align-items:center;gap:10px;padding:13px 16px;border-bottom:1px solid var(--line)}
.cmdk-in input{flex:1;border:none;outline:none;background:transparent;color:var(--ink);
  font-size:15px;font-family:var(--sans);font-weight:500}
.cmdk-in input::placeholder{color:var(--dim3)}
.cmdk-res{overflow-y:auto;padding:6px;flex:1;min-height:0}
.cmdk-grp{font-size:9.5px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;
  color:var(--dim3);padding:9px 10px 4px}
.cmdk-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:9px;
  cursor:pointer;transition:background .1s;font-size:12.5px}
.cmdk-item.sel{background:color-mix(in srgb, var(--ac1) 15%, transparent);
  box-shadow:inset 2px 0 0 var(--ac1)}
.cmdk-item .ci{width:22px;height:22px;border-radius:6px;display:grid;place-items:center;
  background:var(--panel3);font-size:10px;color:var(--ac1);flex-shrink:0;font-weight:800}
.cmdk-item .cn{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cmdk-item .cc{font-size:9.5px;color:var(--dim2);margin-left:auto;flex-shrink:0}
.cmdk-foot{display:flex;gap:12px;padding:8px 14px;border-top:1px solid var(--line);
  font-size:10px;color:var(--dim2);background:var(--panel2);flex-wrap:wrap}
.cmdk-foot span{display:flex;align-items:center;gap:4px}

/* ==================== TOAST ==================== */
.toast{position:fixed;bottom:22px;left:50%;transform:translate(-50%,90px);z-index:300;
  background:var(--panel3);border:1px solid var(--line3);color:var(--ink);padding:10px 18px;
  border-radius:11px;font-size:12.5px;font-weight:600;box-shadow:var(--sh);
  opacity:0;transition:all .28s cubic-bezier(.4,0,.2,1);pointer-events:none;max-width:86vw;text-align:center}
.toast.show{transform:translate(-50%,0);opacity:1}
.toast.ok{border-color:color-mix(in srgb, var(--ok) 55%, transparent);
  background:color-mix(in srgb, var(--ok) 14%, var(--panel3))}
.toast.err{border-color:color-mix(in srgb, var(--err) 55%, transparent);
  background:color-mix(in srgb, var(--err) 14%, var(--panel3))}

/* ==================== DRAWER ==================== */
.drawer{position:fixed;inset:0;z-index:150;display:none;background:rgba(0,0,0,.66);backdrop-filter:blur(6px);
  padding:3vh 14px;overflow-y:auto}
.drawer.open{display:block;animation:fadeIn .18s ease}
.drawer .card{max-width:960px;margin:0 auto;background:var(--panel);border:1px solid var(--line2);
  border-radius:18px;padding:24px 26px 34px;position:relative;box-shadow:var(--sh);
  animation:popIn .24s cubic-bezier(.2,1.1,.4,1)}
.drawer h2{font-size:18px;margin:0 0 4px;font-weight:800}
.drawer h3{font-size:13px;margin:20px 0 7px;color:var(--ac1);font-weight:800;
  letter-spacing:.05em;text-transform:uppercase}
.drawer p,.drawer li{font-size:12.5px;color:var(--dim);line-height:1.75}
.drawer code{background:var(--bg2);padding:1px 5px;border-radius:4px;font-family:var(--mono);
  font-size:11.5px;color:var(--ac1);border:1px solid var(--line)}
.closeX{position:absolute;top:14px;right:14px;width:32px;height:32px;border-radius:9px;
  border:1px solid var(--line2);background:var(--panel2);color:var(--dim);cursor:pointer;
  font-size:15px;display:grid;place-items:center;transition:all var(--tr);z-index:2}
.closeX:hover{color:var(--err);border-color:var(--err);transform:rotate(90deg)}
.kb-nav{display:flex;gap:6px;flex-wrap:wrap;margin:16px 0 18px;padding-bottom:14px;
  border-bottom:1px solid var(--line)}
.kb-tab{font-size:11.5px;font-weight:700;padding:6px 12px;border-radius:8px;border:1px solid var(--line2);
  background:transparent;color:var(--dim);cursor:pointer;transition:all var(--tr)}
.kb-tab:hover{color:var(--ink);border-color:var(--line3)}
.kb-tab.active{background:color-mix(in srgb, var(--ac1) 15%, transparent);color:var(--ac1);
  border-color:color-mix(in srgb, var(--ac1) 42%, transparent)}
.kb-page{display:none}.kb-page.active{display:block}
.drawer table{width:100%;border-collapse:collapse;font-size:12px;margin:10px 0}
.drawer th,.drawer td{padding:5px 9px;border-bottom:1px solid var(--line);text-align:left}
.drawer th{color:var(--ac1);font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;font-weight:800}
.drawer td{color:var(--dim)}
.refmono{font-family:var(--mono);font-size:11px;color:var(--ink)!important}

/* ==================== MOBILE ==================== */
.mobbar{display:none;position:fixed;bottom:0;left:0;right:0;z-index:80;
  background:color-mix(in srgb, var(--panel) 96%, transparent);border-top:1px solid var(--line2);
  backdrop-filter:blur(14px);padding:6px 8px calc(6px + env(safe-area-inset-bottom));
  justify-content:space-around;gap:4px;box-shadow:0 -8px 24px -12px rgba(0,0,0,.7)}
.mobbar button{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;
  background:transparent;border:none;color:var(--dim2);font-size:9px;font-weight:700;
  padding:5px 2px;border-radius:9px;cursor:pointer;transition:all var(--tr)}
.mobbar button.on{color:var(--ac1);background:color-mix(in srgb, var(--ac1) 12%, transparent)}
.mobbar svg{width:19px;height:19px}

@media(max-width:1180px){
  .wrap{grid-template-columns:250px minmax(0,1fr) 290px}
  .logo-txt small{display:none}
}
@media(max-width:940px){
  .wrap{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(0,1fr);
    padding:0 10px 76px;gap:10px}
  .sidebar,.rail{position:fixed;top:0;bottom:0;z-index:120;width:min(88vw,330px);
    display:none;margin:0;border-radius:0;padding-top:8px;
    background:var(--panel);box-shadow:0 0 60px rgba(0,0,0,.7)}
  .sidebar{left:0;border-right:1px solid var(--line2)}
  .rail{right:0;border-left:1px solid var(--line2)}
  .sidebar.open,.rail.open{display:flex;animation:slideL .22s ease}
  @keyframes slideL{from{transform:translateX(-100%);opacity:.4}to{transform:none;opacity:1}}
  .rail.open{animation:slideR .22s ease}
  @keyframes slideR{from{transform:translateX(100%);opacity:.4}to{transform:none;opacity:1}}
  .main{grid-column:1}
  .mobbar{display:flex}
  .topbar{margin:8px 10px 10px;padding:8px 10px;gap:8px;flex-wrap:wrap}
  .cmdtrigger{order:3;flex-basis:100%;max-width:none;margin-top:2px}
  .topbtns .btn span.lbl{display:none}
  .topbtns .btn{padding:8px;width:34px;height:34px;justify-content:center}
  .toast{bottom:82px}
  textarea#input,.out{font-size:12.5px;padding:11px 13px}
}
@media(max-width:520px){
  .logo-txt h1{font-size:13px}
  .ver{display:none}
  .topbar{margin:6px 8px 8px}
  .wrap{padding:0 8px 76px}
}
@media(min-width:941px){.mobbar{display:none!important}}
@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}

/* busy shimmer */
.busy{position:relative;pointer-events:none}
.busy::after{content:"";position:absolute;inset:0;border-radius:inherit;
  background:linear-gradient(90deg,transparent,color-mix(in srgb, var(--ac1) 15%, transparent),transparent);
  background-size:200% 100%;animation:shimmer 1.1s linear infinite}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.spin{animation:sp .9s linear infinite;transform-origin:center}
@keyframes sp{to{transform:rotate(360deg)}}
</style>
</head>`;

window.SHELL_BODY = `<body>
<div class="app">
<div class="wrap">

  <!-- ============ TOPBAR ============ -->
  <header class="topbar" style="grid-column:1/-1">
    <div class="logo">
      <span class="glyph">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#05121a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6.5 10.5V7.5a5.5 5.5 0 1 1 11 0v3"/><rect x="4" y="10.5" width="16" height="10.5" rx="2.6"/><circle cx="12" cy="15.6" r="1.7" fill="#05121a"/>
        </svg>
      </span>
      <div class="logo-txt">
        <h1>CTF STUDIO<span class="ver">v5</span></h1>
        <small>UNIVERSAL CRYPTO WORKBENCH</small>
      </div>
    </div>

    <button class="cmdtrigger" id="cmdOpen">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
      <span>Search 123 operations…</span>
      <span class="k"><kbd>⌘</kbd><kbd>K</kbd></span>
    </button>

    <div class="topbtns">
      <button class="btn primary" id="btnSmart" title="Recursive decode — flag dhoondhta hai (Ctrl+Enter)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="3.4"/></svg>
        <span class="lbl">Smart Solve</span>
      </button>
      <button class="btn accent" id="btnFlag" title="Flag Hunt — har encoding me flag dhoondo">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M4 21V4"/><path d="M4 4c4-2 8 2 12 0v9c-4 2-8-2-12 0"/></svg>
        <span class="lbl">Flag Hunt</span>
      </button>
      <button class="btn ghost" id="btnChLib" title="CryptoHack Library — 316 challenges" style="border-color:color-mix(in srgb,var(--ok) 45%,transparent);color:var(--ok);background:color-mix(in srgb,var(--ok) 9%,transparent)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        <span class="lbl">CryptoHack</span>
      </button>
      <button class="btn ghost icon" id="btnTheme" title="Theme badlo (4 themes)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>
      </button>
      <button class="btn ghost icon" id="btnRef" title="Cheatsheet / reference">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M9 7h7M9 11h5"/></svg>
      </button>
    </div>
  </header>

  <!-- ============ SIDEBAR ============ -->
  <aside class="panel sidebar" id="sidebar">
    <header>
      <span>Operations</span>
      <span class="badge cy" id="opCount"></span>
      <div class="right">
        <button class="btn sm icon" id="btnFav" title="Sirf favourites dikhao">★</button>
      </div>
    </header>
    <div class="cats" id="cats"></div>
    <div class="oplist" id="oplist"></div>
  </aside>

  <!-- ============ MAIN ============ -->
  <main class="main">
    <div class="io" id="io">

      <section class="panel" id="panelIn">
        <header>
          <span>Input</span>
          <span class="badge" id="inStats">0 chars</span>
          <div class="right">
            <select id="sampleSel" class="badge" style="padding:4px 7px;cursor:pointer;background:var(--bg2);color:var(--dim);border-color:var(--line2);max-width:130px">
              <option value="">⚡ Sample…</option>
            </select>
            <button class="btn sm" id="btnPaste">Paste</button>
            <button class="btn sm icon" id="btnClearIn" title="Clear">✕</button>
          </div>
        </header>
        <textarea id="input" spellcheck="false" placeholder="Ciphertext / encoded message yahan paste karo…

  SGVsbG8gQ1RGey4uLn0=   ·   666c61677b…   ·   ... --- ...
  pynffvp grkg   ·   aGVsbG8gd29ybGQ=

Ctrl+K se command palette · Smart Solve se auto-decode"></textarea>
        <div class="chips" id="chips"><span class="chip hint">Detector kaunse encodings pehchanta hai — yahan dikhega…</span></div>
      </section>

      <div class="rz" id="rz" title="Drag to resize"></div>

      <section class="panel" id="panelOut">
        <header>
          <span>Output</span>
          <span class="badge" id="outStats">0 chars</span>
          <div class="right">
            <span id="scoreBadge" class="badge">—</span>
            <span id="flagBadge" class="badge lm" style="display:none">🚩 FLAG</span>
            <button class="btn sm" id="btnCopy" title="Copy (Ctrl+Shift+C)">Copy</button>
            <button class="btn sm" id="btnSwap" title="Output ko input bana do — layered decoding">⤵ Input</button>
            <button class="btn sm icon" id="btnClearOut" title="Clear output">✕</button>
          </div>
        </header>
        <pre class="out empty" id="output">Output yahan aayega…

Koi operation choose karo, ya Smart Solve chalao.</pre>
        <div class="outhead">
          <span class="via" id="viaInfo">No operation applied — input as-is</span>
        </div>
      </section>

    </div>
  </main>

  <!-- ============ RAIL ============ -->
  <aside class="rail" id="rail">
    <section class="panel">
      <div class="tabs" id="railTabs">
        <button class="tab active" data-tab="recipe">🧪 Recipe<span class="badge" id="recipeCount" style="margin-left:2px">0</span></button>
        <button class="tab" data-tab="quick">⚡ Quick</button>
        <button class="tab" data-tab="hist">🕘 History</button>
      </div>
      <div id="tab-recipe" style="display:flex;flex-direction:column;min-height:0;flex:1">
        <div style="display:flex;gap:5px;padding:8px 8px 0">
          <button class="btn sm" id="btnAuto" style="flex:1;justify-content:center">✨ Auto-magic</button>
          <button class="btn sm" id="btnRecipeClear" style="flex:1;justify-content:center">Clear</button>
        </div>
        <div class="steps" id="steps">
          <div class="empty"><div class="big">🧪</div>Left se operation click karo<br>ya <b>Smart Solve</b> chalao —<br>chain yahan banti hai.</div>
        </div>
      </div>
      <div id="tab-quick" style="display:none;flex:1;min-height:0">
        <div class="quicklist">
          <button class="qbtn" data-quick="playbook"><span class="qe">🧭</span><span>CTF Playbook<span class="qd">Kya hai + kya karo</span></span></button>
          <button class="qbtn" data-quick="magic"><span class="qe">🔮</span><span>Magic<span class="qd">Auto-detect encoding</span></span></button>
          <button class="qbtn" data-quick="smart-solve"><span class="qe">🧠</span><span>Smart Solve<span class="qd">Recursive flag hunt</span></span></button>
          <button class="qbtn" data-quick="flag-hunt"><span class="qe">🚩</span><span>Flag Hunt<span class="qd">Input me flag dhoondo</span></span></button>
          <button class="qbtn" data-quick="xor-brute"><span class="qe">💥</span><span>XOR Brute<span class="qd">Single-byte crack</span></span></button>
          <button class="qbtn" data-quick="entropy"><span class="qe">📊</span><span>Entropy<span class="qd">Randomness check</span></span></button>
          <button class="qbtn" data-quick="adv-crack"><span class="qe">🚀</span><span>Universal Cracker<span class="qd">45+ cipher families</span></span></button>
          <button class="qbtn" data-quick="sub-crack"><span class="qe">🔤</span><span>Substitution Crack<span class="qd">Quadgram hill-climb</span></span></button>
          <button class="qbtn" data-quick="chain-deep"><span class="qe">🕳</span><span>Deep Chain<span class="qd">5 layers tak decode</span></span></button>
          <button class="qbtn" data-quick="cipher-id"><span class="qe">🔎</span><span>Cipher ID<span class="qd">Kaunsa cipher hai?</span></span></button>
          <button class="qbtn" data-quick="frequency"><span class="qe">📈</span><span>Frequency<span class="qd">Substitution help</span></span></button>
          <button class="qbtn" data-quick="vigenere-crack"><span class="qe">🔓</span><span>Vigenère Crack<span class="qd">Key ke bina</span></span></button>
          <button class="qbtn" data-quick="jwt-decode"><span class="qe">🎫</span><span>JWT Decode<span class="qd">header + payload</span></span></button>
          <button class="qbtn" data-quick="rsa-mini-auto"><span class="qe">🧮</span><span>RSA Auto<span class="qd">factor → decrypt</span></span></button>
        </div>
      </div>
      <div id="tab-hist" style="display:none;flex:1;min-height:0;flex-direction:column">
        <div class="hist" id="hist"><div class="empty"><div class="big">🕘</div>Abhi koi history nahi<br><span style="font-size:10.5px">Har solve yahan save hoga</span></div></div>
      </div>
    </section>
  </aside>
</div>
</div>

<!-- ============ MOBILE BAR ============ -->
<nav class="mobbar" id="mobbar">
  <button data-mob="ops"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 6h16M4 12h16M4 18h10"/></svg>Ops</button>
  <button data-mob="solve"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M13 2 4.5 13H11l-1 9 9.5-12H13l1-8z"/></svg>Solve</button>
  <button data-mob="cmd"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>Search</button>
  <button data-mob="recipe"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 2v6l-4 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-4-9V2"/><path d="M7 2h10"/></svg>Chain</button>
</nav>

<!-- ============ COMMAND PALETTE ============ -->
<div class="cmdk" id="cmdk">
  <div class="cmdk-box">
    <div class="cmdk-in">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ac1)" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
      <input id="cmdInput" type="text" placeholder="Operation dhundo… (base64, xor, caesar, crack)" autocomplete="off" spellcheck="false">
      <kbd>ESC</kbd>
    </div>
    <div class="cmdk-res" id="cmdRes"></div>
    <div class="cmdk-foot">
      <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
      <span><kbd>↵</kbd> run</span>
      <span><kbd>⇧</kbd><kbd>↵</kbd> add to chain</span>
      <span style="margin-left:auto" id="cmdCount"></span>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<div class="drawer" id="drawer">
  <div class="card">
    <button class="closeX" id="drawerClose">✕</button>
    <h2>🕵️ CTF Studio v5 — Knowledge Base</h2>
    <p>123 offline operations · universal cracker · poora crypto reference. Sab browser me — koi server, koi tracking nahi.</p>
    <div class="kb-nav" id="kbNav">
      <button class="kb-tab active" data-kb="start">🚀 Start</button>
      <button class="kb-tab" data-kb="enc">🧱 Encodings</button>
      <button class="kb-tab" data-kb="classic">🏛 Classical</button>
      <button class="kb-tab" data-kb="rsa">🔢 RSA</button>
      <button class="kb-tab" data-kb="modern">🔐 Modern</button>
      <button class="kb-tab" data-kb="stego">🖼 Stego</button>
      <button class="kb-tab" data-kb="ref">📋 Tables</button>
    </div>

    <div class="kb-page active" data-kb-page="start">
      <h3>3 second ka workflow</h3>
      <p><b>1.</b> Ciphertext paste karo input me.<br>
         <b>2.</b> Detector chips dekho — kya lagta hai wahan dikhega.<br>
         <b>3.</b> <kbd>Ctrl</kbd>+<kbd>Enter</kbd> = Smart Solve. Flag mile to 🚩 badge.<br>
         <b>4.</b> Nahi mila? <b>Universal Cracker</b> (Ctrl+K → "crack") chalao.</p>
      <h3>Keyboard shortcuts</h3>
      <table>
        <tr><th>Key</th><th>Kya karta hai</th></tr>
        <tr><td><kbd>⌘/Ctrl</kbd><kbd>K</kbd></td><td>Command palette — 123 ops me se instant search</td></tr>
        <tr><td><kbd>Ctrl</kbd><kbd>Enter</kbd></td><td>Smart Solve</td></tr>
        <tr><td><kbd>Ctrl</kbd><kbd>⇧</kbd><kbd>C</kbd></td><td>Output copy</td></tr>
        <tr><td><kbd>Ctrl</kbd><kbd>⇧</kbd><kbd>V</kbd></td><td>Output → Input swap</td></tr>
        <tr><td><kbd>Ctrl</kbd><kbd>⇧</kbd><kbd>L</kbd></td><td>Theme cycle</td></tr>
        <tr><td><kbd>Esc</kbd></td><td>Close palette / drawer</td></tr>
      </table>
      <h3>Recipe (chain) kaise banao</h3>
      <p>Har op click karne pe right side chain me judta hai — jaise CyberChef. Output pe <b>⤵ Input</b> dabao to output next layer ka input ban jata hai. Chain me × dabao step hatane ke liye.</p>
    </div>

    <div class="kb-page" data-kb-page="enc">
      <h3>Encodings — 100% auto, koi key nahi</h3>
      <p>Base64 · Base64URL · Base32 · Base32hex · Base58 · Base85/Ascii85 · Base91 · Base45 · Hex · Binary · Decimal · Octal · BigInt · URL · HTML entity · Unicode escape · Quoted-printable · JWT · UUID · Morse.</p>
      <h3>Pehchaan kaise kare</h3>
      <table>
        <tr><th>Pattern</th><th>Kya hai</th></tr>
        <tr><td class="refmono">A-Za-z0-9+/ , = se end</td><td>Base64</td></tr>
        <tr><td class="refmono">A-Z2-7 , = se end</td><td>Base32</td></tr>
        <tr><td class="refmono">0-9a-f , even length</td><td>Hex</td></tr>
        <tr><td class="refmono">0/1 + spaces , 8 se multiple</td><td>Binary</td></tr>
        <tr><td class="refmono">1-9A-HJ-NP-Za-km-z</td><td>Base58 (0/O/I/l nahi)</td></tr>
        <tr><td class="refmono">!-u , symbols allowed</td><td>Base85 / Base91</td></tr>
        <tr><td class="refmono">xxx.yyy.zzz</td><td>JWT (3 b64url parts)</td></tr>
      </table>
      <p><b>Tip:</b> nested encodings common hain — b64 ke andar hex, hex ke andar b64. <b>Deep Chain</b> op 5 layers tak khud khol deta hai.</p>
    </div>

    <div class="kb-page" data-kb-page="classic">
      <h3>Classical ciphers — bina key solve hote hain</h3>
      <table>
        <tr><th>Cipher</th><th>Keyspace</th><th>Tool</th></tr>
        <tr><td>Caesar / ROT-N</td><td>25</td><td class="refmono">adv-crack, rot-n</td></tr>
        <tr><td>Atbash</td><td>1</td><td class="refmono">atbash</td></tr>
        <tr><td>Affine</td><td>312</td><td class="refmono">adv-crack</td></tr>
        <tr><td>Rail Fence</td><td>rails 2-14</td><td class="refmono">adv-crack</td></tr>
        <tr><td>Columnar</td><td>perm 2-14</td><td class="refmono">adv-crack</td></tr>
        <tr><td>Vigenère</td><td>key ≤ 4</td><td class="refmono">adv-crack (9s)</td></tr>
        <tr><td>Hill 2×2</td><td>157,248</td><td class="refmono">adv-crack (3s)</td></tr>
        <tr><td>Substitution</td><td>26!</td><td class="refmono">sub-crack (≥50 letters)</td></tr>
        <tr><td>Playfair / Bifid</td><td>key chahiye</td><td class="refmono">playfair, bifid</td></tr>
      </table>
      <h3>Quadgram scoring</h3>
      <p>4,000+ word corpus se quadgram/trigram/bigram MI nikala jata hai. Score: <b>&gt;0.5</b> English · <b>0.2–0.5</b> partial · <b>0.05–0.2</b> weak · <b>&lt;0.05</b> random. Isi se brute-force me best candidate chunta hai.</p>
    </div>

    <div class="kb-page" data-kb-page="rsa">
      <h3>RSA — attacks jab weakness ho</h3>
      <table>
        <tr><th>Attack</th><th>Kab chalta hai</th><th>Op</th></tr>
        <tr><td>Factor small n</td><td>n &lt; 2^53 ya close primes</td><td class="refmono">rsa-factor</td></tr>
        <tr><td>p,q diye hain</td><td>hamesha</td><td class="refmono">rsa-pq-phi</td></tr>
        <tr><td>e=3 broadcast</td><td>same m, 3 alag n</td><td class="refmono">rsa-hastad</td></tr>
        <tr><td>Common modulus</td><td>same n, do coprime e</td><td class="refmono">rsa-common-modulus</td></tr>
        <tr><td>Auto mini</td><td>chhota n, auto factor</td><td class="refmono">rsa-mini-auto</td></tr>
      </table>
      <h3>Kya nahi chalta</h3>
      <p>2048-bit random RSA — factoring infeasible. Koi tool nahi tod sakta. Agar n me koi weakness nahi (inferius style balanced 100-bit primes), to honest answer: <b>key missing</b>.</p>
      <p><b>PEM/SSH:</b> public key paste karo → n, e nikal ke attacks try karo.</p>
    </div>

    <div class="kb-page" data-kb-page="modern">
      <h3>AES / DH / BIP39</h3>
      <ul>
        <li><b>AES-CBC/CTR/ECB:</b> key + IV chahiye (hex). Key ke bina possible nahi.</li>
        <li><b>AES-ECB detect:</b> duplicate blocks scan — bina key pata chal jata hai mode.</li>
        <li><b>DH:</b> chhote p pe discrete log. p &gt; 2^40 practically infeasible.</li>
        <li><b>BIP39:</b> mnemonic → seed (PBKDF2).</li>
        <li><b>Password strength:</b> entropy bits + crack-time estimate.</li>
      </ul>
      <h3>Hashes</h3>
      <p>MD5 · SHA-1 · SHA-256 · SHA-384 · SHA-512 · HMAC. Identifier length se algorithm batata hai. <b>Crack:</b> built-in wordlist + 0–99,999 numeric. bcrypt/Argon2 design se slow — brute impossible.</p>
    </div>

    <div class="kb-page" data-kb-page="stego">
      <h3>Text stego (tool me hai)</h3>
      <ul>
        <li><b>Zero-width:</b> U+200B/200C/200D/FEFF ko bits me convert → text.</li>
        <li><b>MSB/LSB:</b> bit string → text (8-bit groups).</li>
        <li><b>Bit-flip stego:</b> text ke andar chhupi bits.</li>
      </ul>
      <h3>Image / audio stego (tool me NAHI)</h3>
      <p>Iske liye alag tools: <code>zsteg</code>, <code>steghide</code>, <code>binwalk</code>, <code>aperisolve</code>, <code>exiftool</code>. Tool sirf offline crypto kar sakta hai — image pixels me nahi jaata.</p>
    </div>

    <div class="kb-page" data-kb-page="ref">
      <h3>Morse code</h3>
      <table>
        <tr><th>A</th><td class="refmono">.-</td><th>B</th><td class="refmono">-...</td><th>C</th><td class="refmono">-.-.</td><th>D</th><td class="refmono">-..</td><th>E</th><td class="refmono">.</td></tr>
        <tr><th>F</th><td class="refmono">..-.</td><th>G</th><td class="refmono">--.</td><th>H</th><td class="refmono">....</td><th>I</th><td class="refmono">..</td><th>J</th><td class="refmono">.---</td></tr>
        <tr><th>K</th><td class="refmono">-.-</td><th>L</th><td class="refmono">.-..</td><th>M</th><td class="refmono">--</td><th>N</th><td class="refmono">-.</td><th>O</th><td class="refmono">---</td></tr>
        <tr><th>P</th><td class="refmono">.--.</td><th>Q</th><td class="refmono">--.-</td><th>R</th><td class="refmono">.-.</td><th>S</th><td class="refmono">...</td><th>T</th><td class="refmono">-</td></tr>
        <tr><th>U</th><td class="refmono">..-</td><th>V</th><td class="refmono">...-</td><th>W</th><td class="refmono">.--</td><th>X</th><td class="refmono">-..-</td><th>Y</th><td class="refmono">-.--</td></tr>
        <tr><th>Z</th><td class="refmono">--..</td><th>0</th><td class="refmono">-----</td><th>1</th><td class="refmono">.----</td><th>2</th><td class="refmono">..---</td><th>3</th><td class="refmono">...--</td></tr>
      </table>
      <h3>Number bases</h3>
      <table>
        <tr><th>Base</th><th>Alphabet</th><th>"flag" example</th></tr>
        <tr><td>2</td><td>0-1</td><td class="refmono">01100110 01101100 01100001 01100111</td></tr>
        <tr><td>8</td><td>0-7</td><td class="refmono">146 154 141 147</td></tr>
        <tr><td>10</td><td>0-9</td><td class="refmono">102 108 97 103</td></tr>
        <tr><td>16</td><td>0-9a-f</td><td class="refmono">666c6167</td></tr>
        <tr><td>32</td><td>A-Z2-7</td><td class="refmono">MZWGCZQ=</td></tr>
        <tr><td>58</td><td>1-9A-HJ-NP-Za-km-z</td><td class="refmono">(no 0 O I l)</td></tr>
        <tr><td>64</td><td>A-Za-z0-9+/</td><td class="refmono">ZmxhZw==</td></tr>
        <tr><td>85</td><td>!-u</td><td class="refmono">AoDTs</td></tr>
      </table>
      <h3>English letter frequency</h3>
      <p class="refmono">E 12.70% · T 9.06% · A 8.17% · O 7.51% · I 6.97% · N 6.75% · S 6.33% · H 6.09% · R 5.99% · D 4.25%<br>
      Bigrams: TH HE IN ER AN RE ON AT EN ND<br>
      Trigrams: THE AND ING ENT ION HER FOR THA NTH INT</p>
      <h3>Colors</h3>
      <p><span class="badge lm">≥80% readable</span> English · <span class="badge am">50-79%</span> partial · <span class="badge rd">&lt;50%</span> junk<br>
      🚩 = flag detect hua</p>
    </div>
  </div>
</div>`;
