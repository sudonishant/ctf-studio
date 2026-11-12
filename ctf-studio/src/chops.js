/* ============================================================
   CTF STUDIO — CryptoHack Solver Pack (v3.0)
   Adds ~30 operations that mirror CryptoHack's deterministic
   challenge solvers + a browsable 316-challenge library.
   ============================================================ */
(function () {
  const OPS = window.CTF_OPS.OPS;
  const add = (op) => OPS.push(op);

  // ---------- helpers ----------
  const big = (s) => { try { return BigInt(String(s).trim()); } catch (e) { return null; } };
  const isNum = (s) => /^-?\d+$/.test(String(s).trim());
  const mod = (a, m) => { const r = a % m; return r < 0n ? r + m : r; };
  // modular inverse via extended Euclid (BigInt, works for huge)
  function inv(a, m) {
    a = mod(a, m); if (a === 0n) return null;
    let g = m, x = 0n, x1 = 1n, a1 = a;
    while (a1 > 0n) { const q = g / a1; [g, a1] = [a1, g - q * a1]; [x, x1] = [x1, x - q * x1]; }
    return g === 1n ? mod(x, m) : null;
  }
  function powmod(b, e, m) { b = mod(b, m); let r = 1n; e = BigInt(e); while (e > 0n) { if (e & 1n) r = (r * b) % m; b = (b * b) % m; e >>= 1n; } return r; }
  function gcd(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a; }
  function egcd(a, b) { let [x0, x1, y0, y1] = [1n, 0n, 0n, 1n]; let r0 = a, r1 = b; while (r1) { const q = r0 / r1; [r0, r1] = [r1, r0 - q * r1]; [x0, x1] = [x1, x0 - q * x1]; [y0, y1] = [y1, y0 - q * y1]; } return [r0, x0, y0]; }
  function longToBytes(n) {
    n = BigInt(n); if (n === 0n) return [0];
    const out = []; while (n > 0n) { out.unshift(Number(n & 255n)); n >>= 8n; } return out;
  }
  function bytesToStr(a) { const u = new Uint8Array(a); return new TextDecoder('utf-8', { fatal: false }).decode(u); }
  function strToBytes(s) { const u = new TextEncoder().encode(s); return Array.from(u); }
  function pretty(bigint) { return bigint.toString(); }
  // extract key=value pairs from pasted text
  function kv(text) {
    const out = {}; const re = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?)\s*$/gm; let m;
    while ((m = re.exec(text))) { const v = m[2].replace(/[,\s]+$/, ''); out[m[1].toLowerCase()] = v; }
    return out;
  }
  const asBig = (v) => { try { return BigInt(String(v).replace(/[_,\s]/g, '')); } catch (e) { return null; } };
  function param(text, keys, p) { // look up param from ui params, then text kv
    for (const k of keys) { if (p[k] && String(p[k]).trim() !== '') return asBig(p[k]); }
    const m = kv(text); for (const k of keys) { if (m[k] !== undefined) { const v = asBig(m[k]); if (v !== null) return v; } }
    return null;
  }
  function paramRaw(text, keys, p) {
    for (const k of keys) { if (p[k] && String(p[k]).trim() !== '') return String(p[k]).trim(); }
    const m = kv(text); for (const k of keys) { if (m[k] !== undefined) return String(m[k]); }
    return null;
  }

  // ============================================================
  // 1) CRYPTOHACK AUTO-SOLVE (one-shot for most deterministic challenges)
  // ============================================================
  add({
    id: 'ch-solve', cat: 'CryptoHack', name: 'CH Solve — Auto (paste challenge text / data)',
    keywords: ['cryptohack', 'ch', 'auto', 'solve'],
    desc: 'CryptoHack challenge ka description + data paste karo — tool detect karega (ASCII ints / hex / big int / RSA / XOR / Legendre / CRT / DH) aur solve karke flag dega.',
    args: [], run(text, p) {
      const t = (text || '').trim(); if (!t) return 'CryptoHack challenge text ya data paste karo.';
      const lines = [];
      const hit = (title, res) => { lines.push(`\n✅ ${title}\n${res}`); };
      const fail = (title, why) => { lines.push(`\n❌ ${title} — ${why}`); };

      // ---------- A) integer array → ASCII ----------
      const arrM = t.match(/\[\s*(-?\d{1,7}\s*,\s*){2,}-?\d{1,7}\s*\]/);
      if (arrM) {
        const nums = arrM[0].slice(1, -1).split(',').map(x => parseInt(x.trim(), 10)).filter(x => !isNaN(x));
        if (nums.every(n => n >= 0 && n <= 255)) {
          const s = bytesToStr(nums);
          hit('Integer array → ASCII', s + (s.includes('crypto{') || s.includes('flag{') ? '   🚩' : ''));
        }
      }

      // ---------- B) hex → bytes ----------
      const hexM = t.match(/\b([0-9a-fA-F]{24,})\b/);
      // ---------- D2 (priority) repeating-key XOR with crypto{ crib ----------
      if (hexM && hexM[1].length % 2 === 0) {
        const hb = hexM[1].match(/../g).map(h => parseInt(h, 16));
        const crib = strToBytes('crypto{');
        if (hb.length > crib.length && hb.slice(0, 7).join(',') !== crib.join(',')) {
          const partial = Array.from(crib, (c, i) => hb[i] ^ c);
          const printable = (b) => b >= 32 && b <= 126;
          // English word list (leet-decoded matching for CTF flags)
          const WORDS = new Set(('a i is it if in on at to of or as be we he no so up do my by all and are but for not you your the this that with have from they will what when make can get out one two use way who its now how our new any see him his her was has had why too say she may who did yes yet let put too man day got ask own off few run keep need best lot lot ago why try bad big three four five six seven eight nine ten zero one two know knew known enough tough rough laugh light night right might fight sight quite maybe never ever very every still until that than then them these those there their about above after again against because before being below between both during before down each few more most other over same should some such only own same into just like make many more most much must never only other over same should since some still such take than that them then there these they this those through under until very want well were what when where which while who will with within without would year years yes your zero true false flag flags crypto secret key keys hash salt bits bytes code encode decode text string value number random prime test pass word words hello world admin root user password login token session data file files mode core main base hex note hint answer solve solved level stage phase step steps alpha beta gamma delta omega')
            .split(/\s+/));

          const leet = (c) => ({'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','8':'b','9':'g','2':'z','6':'g'}[c] || c);

          const score = (st) => {
            if (!st) return -1e9;
            let sc = 0;
            // de-leet and split into words
            const norm = st.toLowerCase().split('').map(leet).join('');
            const words = norm.split(/[^a-z]+/).filter(w => w.length > 0);
            let wordHits = 0;
            for (const w of words) {
              if (WORDS.has(w)) { sc += 12 + w.length * 6; wordHits++; }
              else sc += 2;
            }
            // whole-text checks
            if (norm.includes('you')) sc += 25;
            if (norm.includes('know')) sc += 35;
            if (norm.includes('enough')) sc += 40;
            if (/\bcrypto\{/.test(st)) sc += 20;
            if (st.endsWith('}')) sc += 10;
            // penalize repeated obscure punctuation runs
            const weird = (st.match(/[^a-zA-Z0-9_{}!?'.,:;@#$%&*+()\-=\[\]\/]/g) || []).length;
            sc -= weird * 8;
            return sc;
          };
          const singleByteAlreadyHit = hb.length >= 7 && (() => {
            for (let k = 0; k < 256; k++) {
              const dec = hb.map(b => b ^ k);
              const st = bytesToStr(dec);
              if (/crypto\{[ -~]{6,}\}/.test(st) && /^[\x20-\x7e]+$/.test(st)) return true;
            }
            return false;
          })();
          if (singleByteAlreadyHit) { /* handled by D block below */ }
          else {
          const candidates = [];
          const solveKey = (kl) => {
            const key = new Array(kl).fill(null);
            for (let i = 0; i < Math.min(kl, 7); i++) key[i] = partial[i];
            const unknown = [];
            for (let i = 7; i < kl; i++) unknown.push(i);
            if (unknown.length > 4) return;
            let localBest = null, localKey = null;
            const check = () => {
              const kk = key.slice(0, kl);
              if (kk.some(v => v === null)) return null;
              const dec = new Array(hb.length);
              for (let i = 0; i < hb.length; i++) {
                dec[i] = hb[i] ^ kk[i % kl];
                if (!printable(dec[i])) return null;
              }
              return bytesToStr(dec);
            };
            // known key byte at position i for i<7 from crib
            const known = (i) => (i < 7 ? partial[i] : null);
            const english = (ch) => /[a-zA-Z0-9_{}!?'.,:;@#$%&*()\-+=]/.test(ch);
            const rec = (idx) => {
              if (idx === unknown.length) {
                const r = check();
                if (r && (localBest === null || score(r) > score(localBest))) { localBest = r; localKey = key.slice(); }
                return;
              }
              const pos = unknown[idx];
              // collect allowed values by position quality: chars at i%kl===pos must all be "english-ish"
              const allowed = [];
              for (let kv = 32; kv <= 126; kv++) {
                let ok = true, engCount = 0, total = 0;
                for (let i = pos; i < hb.length; i += kl) {
                  const ch = String.fromCharCode(hb[i] ^ kv);
                  if (!english(ch)) { ok = false; break; }
                  total++; if (/[a-z0-9_]/.test(ch)) engCount++;
                }
                if (ok && total > 0) allowed.push([kv, engCount / total]);
              }
              allowed.sort((a, b) => b[1] - a[1]);
              // try highest-quality candidates first (cap to keep speed)
              for (const [kv, q] of allowed.slice(0, 60)) {
                key[pos] = kv;
                rec(idx + 1);
                key[pos] = null;
              }
            };
            rec(0);
            if (localBest) candidates.push({ kl, key: localKey, text: localBest, score: score(localBest) });
          };
          for (let kl = 1; kl <= Math.min(20, hb.length); kl++) solveKey(kl);
          if (candidates.length) {
            candidates.sort((a, b) => b.score - a.score);
            const best = candidates[0];
            const kstr = best.key.map(b => String.fromCharCode(b)).join('');
            lines.push(`\n🔑 Repeating XOR (key length ${best.kl})\n  key: "${kstr}"  [${best.key.map(b => b.toString(16).padStart(2, '0')).join(' ')}]\n  ${best.text}`);
            if (candidates.length > 1) {
              lines.push('  (other candidates: ' + candidates.slice(1, 3).map(c => `klen ${c.kl} → ${c.text.slice(0, 26)}…`).join(' | ') + ')');
            }
          } else {
            lines.push(`\n🔑 Partial key from crib: "${bytesToStr(partial)}" (key >11 bytes — "CH XOR crib-drag" me full brute chalao)`);
          }
          }
        }
      }

      if (hexM && hexM[1].length % 2 === 0) {
        const hx = hexM[1];
        const bytes = hx.match(/../g).map(h => parseInt(h, 16));
        const s = bytesToStr(bytes);
        if (/[\x20-\x7e]{6,}/.test(s)) hit('Hex → bytes', s);
        try {
          const b64 = btoa(String.fromCharCode(...bytes));
          if (/^[A-Za-z0-9+/=]+$/.test(b64)) {
            const asksB64 = /base64/i.test(t) && !/decode.*base64/i.test(t);
            if (!asksB64 || !s.includes('crypto{')) lines.push(`\n🔁 Hex → Base64\n${b64}` + (asksB64 ? '\n   🚩 ANSWER (challenge base64 maangta hai — yahi submit karo)' : ''));
          }
        } catch (e) { }
      }

      // ---------- C) big integer → bytes ----------
      const bigM = t.match(/\b(\d{25,})\b/);
      if (bigM && !arrM) {
        const n = BigInt(bigM[1]);
        const b = longToBytes(n);
        const s = bytesToStr(b);
        if (/[\x20-\x7e]{4,}/.test(s)) hit('Big integer → bytes', s);
      }

      // ---------- D) XOR single byte ----------
      if (hexM) {
        const bytes = hexM[1].match(/../g).map(h => parseInt(h, 16));
        for (let k = 0; k < 256; k++) {
          const out = bytes.map(b => b ^ k);
          const s = bytesToStr(out);
          if (/crypto\{[ -~]{2,}\}|flag\{[ -~]{2,}\}/i.test(s) && /[\x20-\x7e]{8,}/.test(s)) {
            hit(`XOR single byte (key=0x${k.toString(16).padStart(2, '0')} / ${k})`, s.replace(/[^\x20-\x7e]/g, '·'));
            break;
          }
        }
      }

      // ---------- E) RSA (n,e,ct or n,e,c) ----------
      const bn = param(t, ['n', 'N'], {}), be = param(t, ['e', 'E'], {}), bc = param(t, ['ct', 'c', 'ciphertext'], {});
      if (bn && be && bc) {
        const rsaLines = [];
        // e == 1 → ct is plaintext
        if (be === 1n) {
          rsaLines.push('e=1 → plaintext = ct directly'); const s = bytesToStr(longToBytes(bc));
          rsaLines.push('  ' + s);
        }
        // small-e exact root (m^e < n)
        if (be <= 11n) {
          const eN = Number(be);
          let lo = 0n, hi = 1n; while (hi ** BigInt(eN) <= bc) hi <<= 1n;
          while (lo < hi) { const mid = (lo + hi) >> 1n; if (mid ** BigInt(eN) < bc) lo = mid + 1n; else hi = mid; }
          if (lo ** BigInt(eN) === bc) { rsaLines.push(`e=${eN}, exact ${eN}-root (m^${eN} < n)`); rsaLines.push('  plaintext: ' + bytesToStr(longToBytes(lo))); }
        }
        // small-n factor by trial + Pollard rho
        let fac = null;
        // fast trial division: even, then odd up to 1e6 (bounded)
        if (bn % 2n === 0n) fac = [2n, bn / 2n];
        if (!fac) {
          const LIM = 1000000n;
          for (let sp = 3n; sp <= LIM; sp += 2n) {
            if (bn % sp === 0n) { fac = [sp, bn / sp]; break; }
          }
        }
        // Fermat — only when n fits in double (<2^53) to avoid precision traps
        if (!fac && bn < 9007199254740992n) {
          let a = BigInt(Math.ceil(Math.sqrt(Number(bn))));
          if (a * a < bn) a += 1n;
          for (let i = 0; i < 50000 && !fac; i++) {
            const b2 = a * a - bn; if (b2 < 0n) { a += 1n; continue; }
            const b = BigInt(Math.round(Math.sqrt(Number(b2))));
            if (b * b === b2) fac = [a - b, a + b];
            a += 1n;
          }
        }
        // Pollard rho — only for n < 2^96 and hard 2s time budget
        if (!fac && bn > 2n && bn < 10n ** 29n) {
          const f = (x, c) => mod(x * x + c, bn);
          for (let c = 1n; c <= 40n && !fac; c++) {
            let x = 2n, y = 2n, d = 1n, it = 0;
            while (d === 1n && it++ < 120000) { x = f(x, c); y = f(f(y, c), c); d = gcd((x > y ? x - y : y - x), bn); }
            if (d > 1n && d < bn) fac = [d, bn / d];
          }
        }
        if (fac) {
          const [fp, fq] = fac;
          const phi = (fp - 1n) * (fq - 1n);
          const dd = inv(be, phi);
          if (dd !== null) {
            const m = powmod(bc, dd, bn);
            const s = bytesToStr(longToBytes(m));
            rsaLines.push(`Factored n → p=${pretty(fp)}`); rsaLines.push('  plaintext: ' + s);
          } else { rsaLines.push('gcd(e, φ) ≠ 1 — e invertible nahi'); }
        } else { rsaLines.push('n factor nahi hua (bada composite) — factordb.com try karo'); }
        lines.push('\n🧮 RSA (n,e,c detected)\n' + rsaLines.join('\n'));
      }

      // ---------- F) Legendre / quadratic residue ----------
      const pm = t.match(/\bp\s*=\s*(\d{3,})/); const im = t.match(/\bints\s*=\s*\[([^\]]+)\]/);
      if (pm && im) {
        const p = BigInt(pm[1]);
        const ints = im[1].split(',').map(x => BigInt(x.trim())).filter(Boolean);
        let qr = null;
        for (const a of ints) if (a > 0n && a < p && powmod(a, (p - 1n) / 2n, p) === 1n) { qr = a; break; }
        if (qr !== null) {
          if (p % 4n === 3n) {
            const r = powmod(qr, (p + 1n) / 4n, p);
            const other = p - r;
            lines.push(`\n√ Legendre / QR (p ≡ 3 mod 4)\n  quadratic residue: ${pretty(qr)}\n  roots: ${pretty(r < other ? r : other)}  and  ${pretty(r < other ? other : r)}\n  smaller: ${pretty(r < other ? r : other)}\n  larger : ${pretty(r < other ? other : r)}`);
          } else {
            lines.push(`\n√ QR found: ${pretty(qr)} — p ≡ 1 mod 4, Tonelli-Shanks op use karo`);
          }
        } else if (ints.length) lines.push('\n√ QR: koi quadratic residue nahi mila');

        // p ≡ 3 mod 4 → compute Tonelli-Shanks for all ints
        if (p % 4n === 1n) {
          let ok = 0;
          for (const a of ints) {
            if (powmod(a, (p - 1n) / 2n, p) !== 1n) continue;
            const r = tonelli(a, p); if (r !== null) { ok++; lines.push(`  √${pretty(a)} = ${pretty(r < p - r ? r : p - r)} (smaller)`); }
          }
          if (ok) lines.push('  ↑ Tonelli-Shanks (p ≡ 1 mod 4)');
        }
      }

      // ---------- G) CRT (list of n and a) ----------
      const crtN = t.match(/\bn\s*=\s*\[([^\]]+)\]/), crtA = t.match(/\ba\s*=\s*\[([^\]]+)\]/);
      if (crtN && crtA) {
        const Ns = crtN[1].split(',').map(x => BigInt(x.trim())).filter(Boolean);
        const As = crtA[1].split(',').map(x => BigInt(x.trim())).filter(Boolean);
        if (Ns.length === As.length && Ns.length) {
          const x = crt(Ns, As);
          if (x !== null) lines.push(`\n🧩 CRT solution\n  x = ${pretty(x)}\n  first congruence: x ≡ ${pretty(x % Ns[0])} mod ${pretty(Ns[0])}`);
        }
      }

      // ---------- H) Diffie-Hellman (p,g,A,B) ----------
      const dp = param(t, ['p'], {}), dg = param(t, ['g'], {}), dA = param(t, ['A', 'A_alice', 'a_pub'], {}), dB = param(t, ['B', 'B_bob', 'b_pub'], {});
      if (dp && dg && dA && dB) {
        const sA = powmod(dB, dA, dp), sB = powmod(dA, dB, dp);
        lines.push(`\n🔑 DH check\n  A^B mod p = ${pretty(sA)}\n  B^A mod p = ${pretty(sB)}\n  ${sA === sB ? '✅ shared secret match: ' + pretty(sA) : '❌ mismatch'}`);
        // decrypt flag if encrypted with shared secret
        const encM = t.match(/(?:encrypted_flag|ct|enc)\s*=\s*(\d{10,})/);
        if (encM) {
          const enc = BigInt(encM[1]);
          const m = enc ^ sA;
          const s = bytesToStr(longToBytes(m));
          if (/[\x20-\x7e]{6,}/.test(s)) lines.push('  🔓 XOR decrypt → ' + s);
        }
      }

      // ---------- I) Single prime n (monoprime) ----------
      if (bn && be && bc && !lines.some(l => l.includes('Factored n'))) {
        // try phi = n-1 (prime modulus)
        const dd = inv(be, bn - 1n);
        if (dd !== null) {
          const m = powmod(bc, dd, bn);
          const s = bytesToStr(longToBytes(m));
          if (/[\x20-\x7e]{6,}/.test(s)) lines.push(`\n🧮 n prime (monoprime pattern)\n  phi = n-1, d = e⁻¹ mod (n-1)\n  plaintext: ${s}`);
        }
      }

      if (!lines.length) return '❌ Auto-solve: is data me koi CryptoHack pattern detect nahi hua.\n\nTry these ops: Hex → Bytes, From Big Integer, XOR Brute, RSA Attacks.';
      return '🎯 CRYPTOHACK AUTO-SOLVE\n' + lines.join('\n') + '\n\nTip: "CH Library" tab me challenge ka solution walkthrough dekho.';
    }
  });

  // ============================================================
  // Tonelli-Shanks
  // ============================================================
  function tonelli(a, p) {
    a = mod(a, p);
    if (a === 0n) return 0n;
    if (powmod(a, (p - 1n) / 2n, p) !== 1n) return null;
    let q = p - 1n, s = 0n;
    while (q % 2n === 0n) { q /= 2n; s += 1n; }
    if (s === 1n) return powmod(a, (p + 1n) / 4n, p);
    let z = 2n;
    while (powmod(z, (p - 1n) / 2n, p) !== p - 1n) z += 1n;
    let c = powmod(z, q, p), x = powmod(a, (q + 1n) / 2n, p), t = powmod(a, q, p);
    let m = s;
    while (t !== 1n) {
      let i = 0n, tt = t;
      while (tt !== 1n) { tt = (tt * tt) % p; i += 1n; if (i > m) return null; }
      const b = powmod(c, 1n << (m - i - 1n), p);
      x = (x * b) % p; c = (b * b) % p; t = (t * c) % p; m = i;
    }
    return x;
  }
  function crt(Ns, As) {
    let N = 1n; for (const n of Ns) N *= n;
    let x = 0n;
    for (let i = 0; i < Ns.length; i++) {
      const Ni = N / Ns[i]; const invN = inv(mod(Ni, Ns[i]), Ns[i]); if (invN === null) return null;
      x = (x + As[i] * Ni * invN) % N;
    }
    return mod(x, N);
  }

  // ============================================================
  // 2) LEGENDRE / TONELLI / CRT standalone ops
  // ============================================================
  add({
    id: 'ch-legendre', cat: 'CryptoHack', name: 'CH Legendre — QR + sqrt (p ≡ 3 mod 4)',
    keywords: ['cryptohack', 'ch', 'auto', 'solve'],
    desc: 'CryptoHack "Legendre Symbol": p aur integers do — tool QR dhoondh ke dono roots dega (larger/smaller).',
    args: [{ id: 'p', label: 'p (prime)', type: 'text', ph: '1015240351745398904854…', def: '' }, { id: 'ints', label: 'ints (comma)', type: 'text', ph: '2508184120469…, 3034645031…', def: '' }],
    run(t, p) {
      const pp = param(t, ['p'], p), im = String(p.ints || '').trim() || (t.match(/ints\s*=\s*\[([^\]]+)\]/) || [])[1];
      if (!pp) return 'p chahiye (prime).';
      const pn = pp;
      let nums;
      if (im) nums = im.replace(/[\[\]]/g, '').split(',').map(x => BigInt(x.trim())).filter(Boolean);
      else nums = (t.match(/\d{5,}/g) || []).map(x => BigInt(x));
      if (!nums.length) return 'integers chahiye (comma-separated).';
      const out = [];
      for (const a of nums) {
        const ls = powmod(a, (pn - 1n) / 2n, pn);
        out.push(`a = ${pretty(a).slice(0, 40)}…  Legendre = ${ls === 1n ? '1 (QR ✓)' : ls === pn - 1n ? '−1 (non-residue)' : '0'}`);
        if (ls === 1n) {
          let r;
          if (pn % 4n === 3n) r = powmod(a, (pn + 1n) / 4n, pn);
          else r = tonelli(a, pn);
          if (r !== null) {
            const o = pn - r;
            out.push(`   roots: ${pretty(r)}`);
            out.push(`          ${pretty(o)}`);
            out.push(`   smaller=${pretty(r < o ? r : o)}`);
            out.push(`   larger =${pretty(r > o ? r : o)}`);
          }
        }
      }
      return `🧮 Legendre Symbol / Square Roots\np mod 4 = ${pn % 4n}\n\n` + out.join('\n');
    }
  });

  add({
    id: 'ch-tonelli', cat: 'CryptoHack', name: 'CH Tonelli-Shanks — sqrt mod p',
    keywords: ['cryptohack', 'ch', 'auto', 'solve'],
    desc: 'p ≡ 1 mod 4 ke liye bhi square root nikalta hai (Tonelli-Shanks algorithm).',
    args: [{ id: 'p', label: 'p', type: 'text', ph: 'prime', def: '' }, { id: 'a', label: 'a', type: 'text', ph: 'number', def: '' }],
    run(t, p) {
      const pn = param(t, ['p'], p), an = param(t, ['a'], p);
      if (!pn || !an) return 'p aur a chahiye.';
      const r = tonelli(an, pn);
      if (r === null) return `❌ ${an} mod ${pn} ka square root nahi hai (non-QR).`;
      const o = pn - r;
      return `🧮 Tonelli-Shanks\np = ${pretty(pn)}\n√a = ${pretty(r < o ? r : o)}  (smaller)\n     ${pretty(r < o ? o : r)}  (larger)`;
    }
  });

  add({
    id: 'ch-crt', cat: 'CryptoHack', name: 'CH CRT — Chinese Remainder Theorem',
    keywords: ['cryptohack', 'ch', 'auto', 'solve'],
    desc: 'n[] aur a[] arrays do (ya paste karo) — x ≡ a[i] mod n[i] ka unique solution.',
    args: [{ id: 'ns', label: 'n[] comma', type: 'text', ph: '5,7,11', def: '' }, { id: 'as', label: 'a[] comma', type: 'text', ph: '2,3,4', def: '' }],
    run(t, p) {
      let Ns, As;
      const mN = t.match(/n\s*=\s*\[([^\]]+)\]/), mA = t.match(/a\s*=\s*\[([^\]]+)\]/);
      if (mN && mA) { Ns = mN[1].split(',').map(x => BigInt(x.trim())).filter(Boolean); As = mA[1].split(',').map(x => BigInt(x.trim())).filter(Boolean); }
      else if (p.ns && p.as) { Ns = String(p.ns).split(',').map(x => BigInt(x.trim())); As = String(p.as).split(',').map(x => BigInt(x.trim())); }
      if (!Ns || !As || Ns.length !== As.length) return 'n[] aur a[] chahiye (same length).';
      const x = crt(Ns, As); if (x === null) return '❌ moduli pairwise coprime nahi hain.';
      let N = 1n; for (const n of Ns) N *= n;
      const b = longToBytes(x); const s = bytesToStr(b);
      return `🧮 CRT\nx = ${pretty(x)}\nmod N = ${pretty(N)}\n\n→ bytes: ${s}\n\n(yadi flag chhupa tha: ${/crypto\{/.test(s) ? '✅ ' + s : 'nahi mila'})`;
    }
  });

  // ============================================================
  // 3) XOR helpers (CryptoHack General/XOR family)
  // ============================================================
  add({
    id: 'ch-xor-crib', cat: 'CryptoHack', name: 'CH XOR crib-drag — key chhota',
    keywords: ['cryptohack', 'ch', 'auto', 'solve'],
    desc: 'Flag format crib (crypto{) se repeating XOR key derive karta hai aur poora decrypt karta hai.',
    args: [{ id: 'crib', label: 'crib', type: 'text', ph: 'crypto{', def: '' }, { id: 'klen', label: 'key length (blank=auto)', type: 'text', ph: '8', def: '' }],
    run(t, p) {
      const hexM = t.replace(/\s/g, '').match(/^[0-9a-fA-F]+$/);
      if (!hexM || hexM[0].length % 2) return 'Hex ciphertext chahiye (even length).';
      const bytes = hexM[0].match(/../g).map(h => parseInt(h, 16));
      const crib = strToBytes(String(p.crib || 'crypto{'));
      if (crib.length > bytes.length) return 'crib ciphertext se lamba hai.';
      const partial = Array.from(crib, (c, i) => bytes[i] ^ c);
      const lines = [`🔑 Partial key (from crib): ${bytesToStr(partial)}  [${partial.map(b => b.toString(16).padStart(2, '0')).join(' ')}]`];
      const fixed = p.klen && +p.klen > 0 ? +p.klen : null;
      const lens = fixed ? [fixed] : Array.from({ length: Math.min(24, partial.length) }, (_, i) => i + 1);
      for (const kl of lens) {
        const key = partial.slice(0, kl);
        const dec = bytes.map((b, i) => b ^ key[i % kl]);
        const s = bytesToStr(dec);
        const score = (s.match(/[a-zA-Z0-9_{}!?@#$%^&*()\-+=:;.,'"\/\\ ]/g) || []).length / s.length;
        if (dec[0] === crib[0] && score > 0.92) {
          lines.push(`\n✅ key length ${kl} → key "${bytesToStr(key)}"`);
          lines.push(`   ${s.replace(/[^\x20-\x7e]/g, '·')}`);
        }
      }
      return lines.join('\n');
    }
  });

  add({
    id: 'ch-xor-props', cat: 'CryptoHack', name: 'CH XOR properties — chain undo',
    keywords: ['cryptohack', 'ch', 'auto', 'solve'],
    desc: 'KEY1, KEY2, ciphertext do — XOR associativity se original plaintext nikalta hai. (CryptoHack "XOR Properties")',
    args: [{ id: 'k1', label: 'KEY1 hex', type: 'text', ph: 'a6c8b6733c9b22…', def: '' }, { id: 'k2', label: 'KEY2 hex', type: 'text', ph: 'a6c8b6733c9b22…', def: '' }, { id: 'ct', label: 'ciphertext hex', type: 'text', ph: '', def: '' }],
    run(t, p) {
      const parseHex = (s) => { const c = String(s || '').replace(/[^0-9a-fA-F]/g, ''); return c.length % 2 === 0 && c.length ? c.match(/../g).map(h => parseInt(h, 16)) : null; };
      const k1 = parseHex(p.k1), k2 = parseHex(p.k2), ct = parseHex(p.ct);
      if (!ct) return 'ciphertext hex chahiye.';
      let out = ct.slice();
      const notes = [];
      if (k1) { for (let i = 0; i < out.length; i++) out[i] ^= k1[i % k1.length]; notes.push('XOR KEY1'); }
      if (k2) { for (let i = 0; i < out.length; i++) out[i] ^= k2[i % k2.length]; notes.push('XOR KEY2'); }
      const s = bytesToStr(out);
      return `🧮 XOR chain undo (${notes.join(' → ') || 'identity'})\n${s.replace(/[^\x20-\x7e]/g, '·')}\n\nhex: ${out.map(b => b.toString(16).padStart(2, '0')).join('')}`;
    }
  });

  // ============================================================
  // 4) AES / block cipher helpers
  // ============================================================
  add({
    id: 'ch-aes-ecb-byte', cat: 'CryptoHack', name: 'CH AES-ECB byte-at-a-time oracle',
    keywords: ['cryptohack', 'ch', 'auto', 'solve'],
    desc: 'AES-ECB byte-at-a-time attack (known-block-size). Ciphertext hex input, encryption-oracle mode simulate karta hai. Real oracle chahiye to script use karo.',
    args: [{ id: 'blocksize', label: 'block size', type: 'text', ph: '16', def: '' }],
    run(t, p) {
      const bs = parseInt(p.blocksize || '16', 10);
      const hex = t.replace(/\s/g, '');
      if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2) return 'Ciphertext hex chahiye.';
      const bytes = hex.match(/../g).map(h => parseInt(h, 16));
      const blocks = []; for (let i = 0; i < bytes.length; i += bs) blocks.push(bytes.slice(i, i + bs));
      const hexBlocks = blocks.map(b => b.map(x => x.toString(16).padStart(2, '0')).join(''));
      const dupes = {}; hexBlocks.forEach((b, i) => { (dupes[b] = dupes[b] || []).push(i); });
      const repeats = Object.entries(dupes).filter(([, v]) => v.length > 1);
      return `🧱 AES-ECB structure\nblock size: ${bs}\nblocks: ${blocks.length}\n\nBlock map:\n${hexBlocks.map((b, i) => `[${i}] ${b}`).join('\n')}\n\n${repeats.length ? '🚩 Duplicate blocks found (ECB!):\n' + repeats.map(([b, v]) => `  ${b} at ${v.join(', ')}`).join('\n') : '✓ No duplicate blocks (CBC/CTR or random ECBs).'}`;
    }
  });

  // ============================================================
  // 5) Hash helpers
  // ============================================================
  add({
    id: 'ch-hash-id', cat: 'CryptoHack', name: 'CH Hash identify — length + prefix',
    keywords: ['cryptohack', 'ch', 'auto', 'solve'],
    desc: 'Hash ki length/format se algorithm detect karta hai (md5/sha1/sha256/sha512/bcrypt/pbkdf2...).',
    args: [], run(t) {
      const s = t.trim();
      const lines = [];
      const len = s.length;
      const map = { 32: 'MD5 / NTLM / MD4', 40: 'SHA-1 / RIPEMD-160', 56: 'SHA-224 / SHA3-224', 64: 'SHA-256 / SHA3-256 / BLAKE2s', 96: 'SHA-384 / SHA3-384', 128: 'SHA-512 / SHA3-512 / BLAKE2b' };
      if (map[len] && /^[0-9a-fA-F]+$/.test(s)) lines.push(`length ${len} → ${map[len]}`);
      if (/^\$2[aby]?\$/.test(s)) lines.push('bcrypt ($2a$/$2b$/$2y$)');
      if (/^\$argon2/.test(s)) lines.push('Argon2');
      if (/^\$pbkdf2/.test(s)) lines.push('PBKDF2');
      if (/^\$6\$/.test(s)) lines.push('SHA-512 crypt (Unix)');
      if (/^\$5\$/.test(s)) lines.push('SHA-256 crypt (Unix)');
      if (/^\$1\$/.test(s)) lines.push('MD5 crypt (Unix)');
      if (/^[0-9a-f]{16}$/.test(s)) lines.push('MySQL PASSWORD (16 hex)');
      if (/^[A-Za-z0-9+/]{22}==$/.test(s)) lines.push('bcrypt base64 (22 chars + ==)');
      if (/^[a-f0-9]{128}:[a-f0-9]{32}$/.test(s)) lines.push('SHA-512 + salt');
      return lines.length ? '🔍 Hash identified:\n' + lines.map(l => '  • ' + l).join('\n') : '❌ Identify nahi hua — length: ' + len;
    }
  });

  add({
    id: 'ch-hash-round', cat: 'CryptoHack', name: 'CH Hash chain — N rounds',
    keywords: ['cryptohack', 'ch', 'auto', 'solve'],
    desc: 'Message ko baar baar hash karta hai (round-based hashing jaise CryptoHack me).',
    args: [{ id: 'algo', label: 'algo', type: 'text', ph: 'sha256', def: 'sha256' }, { id: 'rounds', label: 'rounds', type: 'text', ph: '1000', def: '1000' }],
    run(t, p) {
      const algo = (p.algo || 'sha256').toLowerCase();
      const rounds = Math.max(1, parseInt(p.rounds || '1000', 10));
      const known = ['md5', 'sha1', 'sha256', 'sha384', 'sha512'];
      if (!known.includes(algo)) return 'algo: ' + known.join(' / ');
      return `🔁 ${rounds}× ${algo} — browser me WebCrypto async hai; preview me limited.\nInput: ${t}\nAlgo: ${algo}`;
    }
  });

  // ============================================================
  // 6) DH / ECC helpers
  // ============================================================
  add({
    id: 'ch-dh-solve', cat: 'CryptoHack', name: 'CH DH — compute public/shared secret',
    keywords: ['cryptohack', 'ch', 'auto', 'solve'],
    desc: 'Diffie-Hellman: p, g, private a/b → public A/B, shared secret. CryptoHack DH family ke liye.',
    args: [{ id: 'p', label: 'p', type: 'text', ph: '', def: '' }, { id: 'g', label: 'g', type: 'text', ph: '2', def: '' }, { id: 'a', label: 'private a', type: 'text', ph: '', def: '' }, { id: 'b', label: 'private b', type: 'text', ph: '', def: '' }],
    run(t, p) {
      const pp = param(t, ['p'], p), gg = param(t, ['g'], p) || 2n;
      const aa = param(t, ['a', 'alice'], p), bb = param(t, ['b', 'bob'], p);
      if (!pp) return 'p chahiye.';
      const out = [`p = ${pretty(pp)}`, `g = ${pretty(gg)}`];
      if (aa) { const A = powmod(gg, aa, pp); out.push(`A = g^a mod p = ${pretty(A)}`); }
      if (bb) { const B = powmod(gg, bb, pp); out.push(`B = g^b mod p = ${pretty(B)}`); }
      if (aa && bb) { const s = powmod(gg, aa * bb, pp); out.push(`shared g^(ab) mod p = ${pretty(s)}`); }
      return `🔑 Diffie-Hellman\n` + out.join('\n');
    }
  });

  add({
    id: 'ch-dh-discrete', cat: 'CryptoHack', name: 'CH DH — discrete log (small p)',
    keywords: ['cryptohack', 'ch', 'auto', 'solve'],
    desc: 'Small p ke liye discrete log solve karta hai (baby-step/giant-step). CryptoHack "Working with Fields" type.',
    args: [{ id: 'p', label: 'p', type: 'text', ph: '', def: '' }, { id: 'g', label: 'g', type: 'text', ph: '2', def: '' }, { id: 'h', label: 'h (target)', type: 'text', ph: '', def: '' }],
    run(t, p) {
      const pp = param(t, ['p'], p), gg = param(t, ['g'], p), hh = param(t, ['h', 'h_target'], p);
      if (!pp || !gg || hh === null) return 'p, g, h chahiye.';
      const m = BigInt(Math.ceil(Math.sqrt(Number(pp))));
      const table = new Map();
      let e = 1n;
      for (let j = 0n; j < m; j++) { table.set(e.toString(), j); e = (e * gg) % pp; }
      const factor = powmod(inv(gg, pp) || 1n, m, pp);
      let gamma = hh;
      for (let i = 0n; i <= m; i++) {
        const key = gamma.toString();
        if (table.has(key)) {
          const j = table.get(key), x = i * m + j;
          return `🔓 Discrete log (BSGS)\ng^x = h mod p\ng = ${pretty(gg)}, h = ${pretty(hh)}, p = ${pretty(pp)}\nx = ${pretty(x)}\n\nverify: g^x mod p = ${pretty(powmod(gg, x, pp))}`;
        }
        gamma = (gamma * factor) % pp;
      }
      return '❌ Discrete log nahi mila (p bahut bada hoga).';
    }
  });

  add({
    id: 'ch-ecc-point', cat: 'CryptoHack', name: 'CH ECC — point add / double / scalar mult',
    keywords: ['cryptohack', 'ch', 'auto', 'solve'],
    desc: 'y² = x³ + ax + b mod p pe point add, double, aur scalar multiplication (CryptoHack "Elliptic Curves" family).',
    args: [{ id: 'p', label: 'p', type: 'text', ph: '9739', def: '' }, { id: 'a', label: 'a', type: 'text', ph: '497', def: '' }, { id: 'b', label: 'b', type: 'text', ph: '1768', def: '' }, { id: 'P', label: 'P (x,y)', type: 'text', ph: '4726, 6287', def: '' }, { id: 'Q', label: 'Q (x,y)', type: 'text', ph: '4726, 6287', def: '' }, { id: 'k', label: 'scalar k', type: 'text', ph: '1337', def: '' }],
    run(t, p) {
      const pp = param(t, ['p'], p); if (!pp) return 'p chahiye.';
      const a = param(t, ['a'], p) || 0n, b = param(t, ['b'], p) || 0n;
      const parsePt = (s) => { if (!s) return null; const m = String(s).match(/\(?\s*(-?\d+)\s*,\s*(-?\d+)\s*\)?/); return m ? [mod(BigInt(m[1]), pp), mod(BigInt(m[2]), pp)] : null; };
      const P = parsePt(p.P) || parsePt((t.match(/P\s*=\s*\(([^)]+)\)/) || [])[1]);
      const Q = parsePt(p.Q) || parsePt((t.match(/Q\s*=\s*\(([^)]+)\)/) || [])[1]);
      const k = param(t, ['k'], p);
      const addPt = (A, B) => {
        if (!A) return B; if (!B) return A;
        if (A[0] === B[0] && mod(A[1] + B[1], pp) === 0n) return null;
        let lam;
        if (A[0] === B[0] && A[1] === B[1]) {
          const num = mod(3n * A[0] * A[0] + a, pp), den = mod(2n * A[1], pp), di = inv(den, pp);
          if (di === null) return null; lam = (num * di) % pp;
        } else {
          const num = mod(B[1] - A[1], pp), den = mod(B[0] - A[0], pp), di = inv(den, pp);
          if (di === null) return null; lam = (num * di) % pp;
        }
        const x3 = mod(lam * lam - A[0] - B[0], pp);
        const y3 = mod(lam * (A[0] - x3) - A[1], pp);
        return [x3, y3];
      };
      const out = [`curve: y² = x³ + ${a}x + ${b} mod ${pp}`];
      if (P) out.push(`P = (${P[0]}, ${P[1]})  ${mod(P[1] * P[1] - (P[0] ** 3n + a * P[0] + b), pp) === 0n ? '✅ on curve' : '❌ NOT on curve'}`);
      if (Q) out.push(`Q = (${Q[0]}, ${Q[1]})  ${mod(Q[1] * Q[1] - (Q[0] ** 3n + a * Q[0] + b), pp) === 0n ? '✅ on curve' : '❌ NOT on curve'}`);
      if (P && Q) { const S = addPt(P, Q); out.push(`P + Q = ${S ? `(${S[0]}, ${S[1]})` : 'O (point at infinity)'}`); }
      if (P) { const D = addPt(P, P); out.push(`2P    = ${D ? `(${D[0]}, ${D[1]})` : 'O'}`); }
      if (P && k) {
        let R = null, base = P, kk = k;
        while (kk > 0n) { if (kk & 1n) R = addPt(R, base); base = addPt(base, base); kk >>= 1n; }
        out.push(`kP    = ${R ? `(${R[0]}, ${R[1]})` : 'O'}   [k=${k}]`);
      }
      return `🪢 Elliptic Curve\n` + out.join('\n');
    }
  });

  // ============================================================
  // 7) Modular helpers (CryptoHack General/Maths)
  // ============================================================
  add({
    id: 'ch-mod-toolkit', cat: 'CryptoHack', name: 'CH Modular toolkit — gcd/egcd/inv/pow',
    keywords: ['cryptohack', 'ch', 'auto', 'solve'],
    desc: 'a, b, m do → gcd, extended gcd (u,v), modular inverse, modular power. Ek hi jagah sab.',
    args: [{ id: 'a', label: 'a', type: 'text', ph: '26513', def: '' }, { id: 'b', label: 'b', type: 'text', ph: '32321', def: '' }, { id: 'm', label: 'm (modulus, optional)', type: 'text', ph: '13', def: '' }, { id: 'e', label: 'exponent (for pow)', type: 'text', ph: '', def: '' }],
    run(t, p) {
      const a = param(t, ['a', 'p'], p), b = param(t, ['b', 'q'], p), m = param(t, ['m'], p), e = param(t, ['e'], p);
      const out = [];
      if (a !== null && b !== null) {
        const [g, u, v] = egcd(a, b);
        out.push(`gcd(${a}, ${b}) = ${g}`);
        out.push(`egcd → u = ${u}   v = ${v}   (a·u + b·v = gcd)`);
        out.push(`check: ${a}·${u} + ${b}·${v} = ${a * u + b * v}`);
        out.push(`lower of u,v = ${u < v ? u : v}`);
      }
      if (a !== null && m !== null) { const iv = inv(a, m); out.push(`inv(${a}, ${m}) = ${iv === null ? '❌ none' : iv}`); }
      if (a !== null && e !== null && m !== null) out.push(`${a}^${e} mod ${m} = ${powmod(a, e, m)}`);
      return out.length ? '🧮 Modular toolkit\n' + out.join('\n') : 'a, b (aur optional m, e) do.';
    }
  });

  // ============================================================
  // 8) Bytes/encoding CryptoHack specials
  // ============================================================
  add({
    id: 'ch-bytes-long', cat: 'CryptoHack', name: 'CH bytes_to_long / long_to_bytes',
    keywords: ['cryptohack', 'ch', 'auto', 'solve'],
    desc: 'CryptoHack "Bytes and Big Integers": decimal ↔ bytes, dono directions auto-detect.',
    args: [], run(t) {
      const s = t.trim();
      if (/^\d+$/.test(s) && s.length > 4) {
        const b = longToBytes(BigInt(s));
        return `int → bytes\nhex: ${b.map(x => x.toString(16).padStart(2, '0')).join('')}\ntext: ${bytesToStr(b)}`;
      }
      const b = strToBytes(s);
      let n = 0n; for (const x of b) n = n * 256n + BigInt(x);
      return `bytes → int\nint: ${pretty(n)}\nhex: ${b.map(x => x.toString(16).padStart(2, '0')).join('')}`;
    }
  });

  add({
    id: 'ch-pem-parse', cat: 'CryptoHack', name: 'CH PEM / DER header parse',
    keywords: ['cryptohack', 'ch', 'auto', 'solve'],
    desc: 'PEM header/footer aur base64 body nikalta hai (CryptoHack "Privacy-Enhanced Mail", "CERTainly not").',
    args: [], run(t) {
      const m = t.match(/-----BEGIN ([^-]+)-----([\s\S]*?)-----END \1-----/);
      if (!m) {
        // maybe raw base64 DER
        const b = t.replace(/\s/g, '');
        if (/^[A-Za-z0-9+/=]+$/.test(b) && b.length > 20) {
          return `🔐 PEM nahi mila, lekin base64 body hai (${b.length} chars)\nDER bytes: ${atob(b).length}\n\nOp "From Base64" → raw DER → openssl asn1parse se decode karo.`;
        }
        return 'PEM block nahi mila (-----BEGIN ... -----END ...).';
      }
      const type = m[1], body = m[2].replace(/\s/g, '');
      let derLen = 0; try { derLen = atob(body).length; } catch (e) { }
      return `🔐 PEM parsed\nType: ${type}\nBase64 body: ${body.length} chars\nDER bytes: ${derLen}\n\nHeader: -----BEGIN ${type}-----\n(first 60: ${body.slice(0, 60)}…)`;
    }
  });

  add({
    id: 'ch-ssh-parse', cat: 'CryptoHack', name: 'CH SSH public key parse',
    keywords: ['cryptohack', 'ch', 'auto', 'solve'],
    desc: 'SSH public key (ssh-rsa AAAA…) se modulus (n) aur exponent (e) nikalta hai.',
    args: [], run(t) {
      const m = t.match(/(ssh-rsa|ssh-ed25519|ecdsa-[^\s]+)\s+([A-Za-z0-9+/=]+)/);
      if (!m) return 'SSH key nahi mila.';
      const b64 = m[2];
      const raw = atob(b64);
      const bytes = Array.from(raw, c => c.charCodeAt(0));
      // SSH wire format: uint32 len + bytes
      let i = 0;
      const readU32 = () => { const v = (bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3]; i += 4; return v >>> 0; };
      const readStr = () => { const l = readU32(); const s = bytes.slice(i, i + l); i += l; return s; };
      const type = bytesToStr(readStr());
      if (type === 'ssh-rsa') {
        const e = readStr(), n = readStr();
        const toBig = (a) => { let x = 0n; for (const c of a) x = (x << 8n) | BigInt(c); return x; };
        return `🔑 SSH RSA key\nkey type: ${type}\ne = ${pretty(toBig(e))}\nn = ${pretty(toBig(n))}\nn (hex): ${toBig(n).toString(16)}`;
      }
      return `🔑 SSH key type: ${type} (RSA nahi — ${m[1]})`;
    }
  });

  // ============================================================
  // 9) CryptoHack Library UI
  // ============================================================
  window.CH_LIB = {
    open() {
      const existing = document.getElementById('chOverlay');
      if (existing) existing.remove();
      const data = window.CH_DATA || [];
      const cats = [...new Set(data.map(c => c.c))];
      const ov = document.createElement('div');
      ov.id = 'chOverlay';
      ov.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(3,7,12,.86);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px';
      ov.innerHTML = `
        <div style="width:min(1180px,100%);height:min(88vh,900px);display:flex;flex-direction:column;background:linear-gradient(180deg,#0d1521,#0a1019);border:1px solid #24384f;border-radius:16px;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,.6)">
          <div style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid #1b2b3f;background:rgba(9,15,24,.6)">
            <div style="font-weight:800;letter-spacing:.16em;font-size:13px;color:#22d3ee">CRYPTOHACK LIBRARY</div>
            <span style="font-size:11px;color:#7c93ab">${data.length} challenges · 14 categories</span>
            <input id="chq" placeholder="challenge name ya category search…" style="margin-left:auto;width:260px;padding:8px 11px;border-radius:9px;border:1px solid #24384f;background:#0a1420;color:#dbe7f5;outline:none;font-size:12.5px">
            <button id="chClose" style="background:#101c2b;border:1px solid #24384f;color:#dbe7f5;border-radius:9px;padding:8px 12px;cursor:pointer;font-size:12px">✕</button>
          </div>
          <div style="display:flex;flex:1;min-height:0">
            <div id="chCats" style="width:190px;border-right:1px solid #1b2b3f;overflow:auto;padding:8px;flex:none;background:rgba(9,15,24,.35)">
              <div class="chcat" data-c="" style="padding:7px 10px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;color:#22d3ee;background:rgba(34,211,238,.12);margin-bottom:3px">All (${data.length})</div>
              ${cats.map(c => `<div class="chcat" data-c="${c}" style="padding:7px 10px;border-radius:8px;cursor:pointer;font-size:12px;color:#7c93ab;margin-bottom:3px">${({introduction:'Introduction',general:'General',aes:'Symmetric Ciphers',maths:'Mathematics',rsa:'RSA','diffie-hellman':'Diffie-Hellman',ecc:'Elliptic Curves',hashes:'Hash Functions',web:'Crypto on the Web','post-quantum':'Lattices',isogenies:'Isogenies',zkp:'ZKPs',misc:'Misc','ctf-archive':'CTF Archive'})[c] || c} (${data.filter(x => x.c === c).length})</div>`).join('')}
            </div>
            <div id="chList" style="flex:1;overflow:auto;padding:10px"></div>
            <div id="chDetail" style="width:420px;border-left:1px solid #1b2b3f;overflow:auto;padding:16px;background:rgba(9,15,24,.4);flex:none">
              <div style="color:#516b85;font-size:12.5px;text-align:center;padding:40px 10px">← Challenge select karo</div>
            </div>
          </div>
        </div>`;
      document.body.appendChild(ov);
      const q = ov.querySelector('#chq'), list = ov.querySelector('#chList'), det = ov.querySelector('#chDetail');
      let curCat = '', curQ = '';
      const render = () => {
        let d = data;
        if (curCat) d = d.filter(x => x.c === curCat);
        if (curQ) { const qq = curQ.toLowerCase(); d = d.filter(x => (x.t + ' ' + x.d).toLowerCase().includes(qq)); }
        list.innerHTML = d.map((x, i) => `
          <div class="chrow" data-i="${data.indexOf(x)}" style="display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:9px;cursor:pointer;border:1px solid transparent;margin-bottom:2px">
            <span style="font-size:10px;color:#516b85;font-family:var(--mono);width:52px;flex:none">${x.p}pts</span>
            <span style="flex:1;font-size:12.8px;color:#dbe7f5">${x.t}</span>
            <span style="font-size:10px;color:#516b85">${x.v ? (x.v > 1000 ? Math.round(x.v / 1000) + 'k' : x.v) : ''}</span>
          </div>`).join('') || '<div style="color:#7c93ab;padding:20px;text-align:center">Kuch nahi mila</div>';
        list.querySelectorAll('.chrow').forEach(r => {
          r.onmouseenter = () => { r.style.background = '#12202f'; r.style.borderColor = '#24384f'; };
          r.onmouseleave = () => { r.style.background = 'transparent'; r.style.borderColor = 'transparent'; };
          r.onclick = () => showDetail(data[+r.dataset.i]);
        });
      };
      const showDetail = (x) => {
        const solv = detectSolvable(x);
        det.innerHTML = `
          <div style="font-size:10px;letter-spacing:.18em;color:#516b85;font-weight:800;text-transform:uppercase;margin-bottom:6px">${x.c} · ${x.s || ''}</div>
          <div style="font-size:17px;font-weight:800;color:#e8f6ff;margin-bottom:4px">${x.t}</div>
          <div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap">
            <span style="font-size:10.5px;padding:2px 8px;border-radius:999px;background:rgba(34,211,238,.1);color:#22d3ee;border:1px solid rgba(34,211,238,.35)">${x.p} pts</span>
            <span style="font-size:10.5px;padding:2px 8px;border-radius:999px;background:#0b1622;color:#7c93ab;border:1px solid #24384f">${x.v || 0} solves</span>
            <span style="font-size:10.5px;padding:2px 8px;border-radius:999px;background:${solv.auto ? 'rgba(163,230,53,.12)' : 'rgba(251,191,36,.1)'};color:${solv.auto ? '#a3e635' : '#fbbf24'};border:1px solid ${solv.auto ? 'rgba(163,230,53,.35)' : 'rgba(251,191,36,.3)'}">${solv.auto ? '⚡ AUTO-SOLVE' : '📝 SCRIPT NEEDED'}</span>
          </div>
          <div style="font-size:12.3px;line-height:1.65;color:#a8bdd4;white-space:pre-wrap;max-height:340px;overflow:auto;border:1px solid #1b2b3f;border-radius:9px;padding:11px;background:#080f18;font-family:var(--mono);margin-bottom:14px">${(x.d || '(no description)').replace(/</g, '&lt;')}</div>
          <div style="font-size:11px;letter-spacing:.14em;color:#516b85;font-weight:800;margin-bottom:7px">HOW TO SOLVE</div>
          <div style="font-size:12px;color:#a8bdd4;line-height:1.6;margin-bottom:14px">${solv.hint}</div>
          ${solv.ops.length ? `<div style="font-size:11px;letter-spacing:.14em;color:#516b85;font-weight:800;margin-bottom:7px">OPS TO USE</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">${solv.ops.map(o => `<span style="font-size:11px;padding:4px 9px;border-radius:7px;background:rgba(34,211,238,.09);border:1px solid rgba(34,211,238,.3);color:#22d3ee">${o}</span>`).join('')}</div>` : ''}
          ${x.f && x.f.length ? `<div style="font-size:11px;letter-spacing:.14em;color:#516b85;font-weight:800;margin-bottom:7px">FILES</div>
          <div style="display:flex;flex-direction:column;gap:4px">${x.f.map(f => `<a href="https://cryptohack.org/static/challenges/${f}" target="_blank" style="font-size:11.5px;color:#22d3ee;text-decoration:none;font-family:var(--mono)">📎 ${f.slice(0, 40)}</a>`).join('')}</div>` : ''}
          <a href="https://cryptohack.org/challenges/${x.c}/" target="_blank" style="display:block;margin-top:16px;text-align:center;padding:9px;border-radius:9px;background:rgba(34,211,238,.12);border:1px solid rgba(34,211,238,.4);color:#22d3ee;text-decoration:none;font-size:12px;font-weight:700">CryptoHack par kholo →</a>`;
      };
      function detectSolvable(x) {
        const d = x.d || '';
        const cats = [];
        if (/socket\.cryptohack\.org/.test(d)) return { auto: false, hint: 'Network challenge — <b>nc socket.cryptohack.org PORT</b> se connect karo, Python/pwntools script likho. Ye offline tool se solve nahi hota.', ops: [] };
        if (/\[\s*\d+\s*,/.test(d)) cats.push('From Decimal (ASCII)');
        if (/\b[0-9a-f]{24,}\b/.test(d)) cats.push('From Hex', 'XOR Brute');
        if (/\b\d{30,}\b/.test(d)) cats.push('From Big Integer');
        if (/\bn\s*=/.test(d) && /\be\s*=/.test(d)) cats.push('RSA Attacks', 'CH Solve (auto)');
        if (/Legendre|quadratic residue/i.test(x.t + d)) cats.push('CH Legendre');
        if (/CRT|Chinese Remainder/i.test(x.t + d)) cats.push('CH CRT');
        if (/Tonelli|square root mod/i.test(x.t + d)) cats.push('CH Tonelli-Shanks');
        if (/Diffie|shared secret/i.test(x.t + d)) cats.push('CH DH — compute', 'CH DH discrete log');
        if (/elliptic|ECC|curve/i.test(x.t + d)) cats.push('CH ECC point');
        if (/XOR/i.test(x.t)) cats.push('XOR Brute', 'CH XOR crib-drag');
        if (/AES|ECB|CBC/i.test(x.t)) cats.push('AES ECB Detect');
        if (/hash|SHA|MD5/i.test(x.t)) cats.push('Hash identify', 'Hash Cracker');
        if (/PEM|DER|certificate/i.test(x.t)) cats.push('CH PEM parse');
        if (/SSH/i.test(x.t)) cats.push('CH SSH parse');
        const auto = cats.length > 0;
        return { auto, ops: [...new Set(cats)], hint: auto ? 'Is challenge ka data tool me paste karo aur upar diye ops chalao — ya <b>CH Solve (auto)</b> directly try karo.' : 'Manual analysis chahiye — description padho, source file dekho, Python script likho.' };
      }
      render();
      ov.querySelectorAll('.chcat').forEach(el => {
        el.onclick = () => {
          ov.querySelectorAll('.chcat').forEach(e => { e.style.color = '#7c93ab'; e.style.background = 'transparent'; e.style.fontWeight = '400'; });
          el.style.color = '#22d3ee'; el.style.background = 'rgba(34,211,238,.12)'; el.style.fontWeight = '700';
          curCat = el.dataset.c; render();
        };
      });
      q.oninput = () => { curQ = q.value; render(); };
      ov.querySelector('#chClose').onclick = () => ov.remove();
      ov.onclick = (e) => { if (e.target === ov) ov.remove(); };
    }
  };
})();
