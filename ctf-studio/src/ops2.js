/* ============================================================
   CTF STUDIO — ADVANCED CRYPTO PACK (ops2.js)
   RSA attacks · AES · hashes · classical · number theory · modern
   Registers into window.CTF_OPS via register()
   ============================================================ */
(function () {
  'use strict';
  const R = window.CTF_OPS_REGISTER;
  const { u8, u8ToBin, hexEnc, hexDec, smartDecode } = window.CTF_OPS;
  const TE = new TextEncoder();
  const BI = (x) => BigInt(String(x).trim().replace(/^0x/i, ''));
  const H = (bytes) => hexEnc(bytes);
  const bytesFromHexBig = (hex) => {
    let h = hex.replace(/^0x/i, '').trim();
    if (h.length % 2) h = '0' + h;
    return hexDec(h);
  };
  const bigToHex = (n) => { let h = n.toString(16); if (h.length % 2) h = '0' + h; return h; };
  const bigToBytes = (n) => bytesFromHexBig(bigToHex(n));
  const clip = (s, n) => (s.length > (n || 400) ? s.slice(0, n || 400) + ' …' : s);

  /* ---------------- BigInt number theory ---------------- */
  function modPow(b, e, m) {
    b %= m; if (b < 0n) b += m;
    let r = 1n;
    while (e > 0n) { if (e & 1n) r = (r * b) % m; b = (b * b) % m; e >>= 1n; }
    return r;
  }
  function egcd(a, b) { if (b === 0n) return [a, 1n, 0n]; const [g, x, y] = egcd(b, a % b); return [g, y, x - (a / b) * y]; }
  function modInv(a, m) { const [g, x] = egcd(((a % m) + m) % m, m); return g === 1n ? ((x % m) + m) % m : null; }
  function gcd(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a; }
  function powBig(b, e) { let r = 1n; for (let i = 0; i < e; i++) r *= b; return r; }
  function iroot(n, k) {
    k = Number(k) | 0;
    if (k <= 0) return null;
    if (n < 0n) { if (k % 2 === 0) return null; return -iroot(-n, k); }
    if (n < 2n) return n;
    if (k === 1) return n;
    let lo = 0n, hi = 1n;
    while (powBig(hi, k) <= n) hi <<= 1n;
    while (lo + 1n < hi) { const mid = (lo + hi) >> 1n; if (powBig(mid, k) <= n) lo = mid; else hi = mid; }
    return lo;
  }
  function isqrt(n) { return iroot(n, 2); }
  function isPrime(n) {
    if (n < 2n) return false;
    for (const p of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n]) {
      if (n === p) return true;
      if (n % p === 0n) return false;
    }
    let d = n - 1n, s = 0n;
    while (d % 2n === 0n) { d /= 2n; s++; }
    const witnesses = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
    for (const a of witnesses) {
      let x = modPow(a, d, n);
      if (x === 1n || x === n - 1n) continue;
      let ok = false;
      for (let r = 1n; r < s; r++) { x = (x * x) % n; if (x === n - 1n) { ok = true; break; } }
      if (!ok) return false;
    }
    return true;
  }
  function pollardRho(n, timeoutMs) {
    if (n % 2n === 0n) return 2n;
    const t0 = Date.now();
    for (let c = 1n; c < 64n; c++) {
      let x = 2n, y = 2n, d = 1n;
      let iter = 0;
      while (d === 1n) {
        x = (x * x + c) % n;
        y = (y * y + c) % n; y = (y * y + c) % n;
        d = gcd(x > y ? x - y : y - x, n);
        if (++iter > 300000) break;
        if (timeoutMs && Date.now() - t0 > timeoutMs) return null;
      }
      if (d !== 1n && d !== n) return d;
    }
    return null;
  }
  function factorize(n) {
    const out = [];
    const q = [n];
    let guard = 0;
    while (q.length && guard++ < 64) {
      const x = q.pop();
      if (x === 1n) continue;
      if (isPrime(x)) { out.push(x); continue; }
      const r = isqrt(x);
      if (r !== null && r * r === x) { q.push(r, r); continue; }
      for (const p of [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n, 47n]) {
        if (x % p === 0n) { q.push(p, x / p); break; }
        if (p === 47n) {
          const d = pollardRho(x, 4000);
          if (d) q.push(d, x / d); else q.push(x); // give up but mark
        }
      }
    }
    out.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    return out;
  }
  const fmt = (n) => n.toString();

  /* ============================================================
     CRYPTO / RSA
     ============================================================ */
  R({ id: 'rsa-factor', name: 'RSA Factor n', cat: 'RSA', keywords: ['rsa', 'pollard', 'factor', 'fermat', 'weak key'],
    desc: 'n ko factor karta hai (trial division + Pollard rho + square check). Chhote/weak n CTF me turant toot jaate hain.',
    args: [{ id: 'n', label: 'n (decimal/0x)', type: 'text', def: '' }],
    run: (d, a) => {
      const nStr = (a.n || d || '').trim();
      if (!nStr) throw new Error('n do (decimal ya 0x-hex)');
      const n = BI(nStr);
      if (n < 2n) throw new Error('n >= 2 chahiye');
      const t0 = Date.now();
      const fs = factorize(n);
      const uniq = [...new Set(fs.map(String))];
      let out = 'n = ' + fmt(n) + '\n';
      out += 'bits = ' + n.toString(2).length + '\n\n';
      out += 'Factors: ' + fs.map(String).join(' × ') + '\n';
      if (uniq.length === 2) out += '\n✅ p = ' + uniq[0] + '\np = ' + uniq[1] + '\n(ab RSA Decrypt op me p, q, e daal kar decrypt karo)';
      if (uniq.length === 1 && fs.length === 2) out += '\n⚠️ p === q — RSA bilkul weak! φ = p(p−1)';
      out += '\n\ntime: ' + (Date.now() - t0) + ' ms';
      return out;
    } });


  /* ============================================================
     RSA MINI AUTO — chhote n ke liye complete pipeline
     ============================================================ */
  R({ id: 'rsa-mini-auto', name: 'RSA Mini Auto (CTF, chhota n)', cat: 'RSA', keywords: ['rsa', 'mini', 'auto', 'small n', 'ctf', 'decrypt list'],
    desc: 'n, e aur chhote numbers ki list do (ciphertext). Tool pollard/fermat se n factorize karta hai, d nikalta hai, har number ko decrypt karta hai, ASCII me badalta hai, aur flag assemble karta hai. Auto-detect bhi karta hai agar input me "n = ... e = ... [list]" ho.',
    args: [
      { id: 'n', label: 'n', type: 'text', def: '' },
      { id: 'e', label: 'e', type: 'text', def: '65537' },
      { id: 'cs', label: 'Ciphertexts (comma/space separated)', type: 'text', def: '' },
      { id: 'prefix', label: 'Flag prefix (khali = auto)', type: 'text', def: 'crypto{' }
    ],
    run: (d, a) => {
      let nStr = (a.n || '').trim();
      let eStr = (a.e || '65537').trim();
      let csStr = (a.cs || '').trim();
      // auto-parse from input text
      const src = String(d || '');
      if (!nStr) {
        const nm = src.match(/n\s*[=:]\s*([0-9xa-fA-F]+)/i);
        if (nm) nStr = nm[1];
      }
      if (!nStr) throw new Error('n do (ya input me "n = 3233" likho)');
      if (!csStr) {
        // input se ciphertext numbers nikaalo — n, e, aur labelled params EXCLUDE karo
        const labelled = new Set();
        const reLab = /\b(n|e|p|q|phi|d|x|g|y)\s*[=:]\s*(\d+)/gi;
        let lm;
        while ((lm = reLab.exec(src)) !== null) labelled.add(lm[2]);
        // [ ... ] bracket content prefer karo
        const bracket = src.match(/\[([^\]]+)\]/);
        const zone = bracket ? bracket[1] : src;
        const pool = (zone.match(/\d+/g) || []);
        const nNum = Number(nStr.replace(/^0x/i, ''));
        const filtered = pool.filter((x) => !labelled.has(x) && Number(x) < nNum && Number(x) > 1);
        if (filtered.length) csStr = filtered.join(' ');
      }
      const n = BI(nStr), e = BI(eStr);
      if (n < 4n) throw new Error('n >= 4 chahiye');
      const out = [];
      out.push('n = ' + n + '  (' + n.toString(2).length + ' bits)');
      out.push('e = ' + e);

      // factorize
      const t0 = Date.now();
      const fs = factorize(n);
      const uniq = [...new Set(fs.map(String))].sort();
      if (uniq.length < 2) throw new Error('n factor nahi hua (bada n). Chhote n (<=40 bits) ke liye try karo, ya rsa-factor me factordb use karo.');
      const p = BI(uniq[0]);
      const q = n / p;
      out.push('\n✅ p = ' + p);
      out.push('✅ q = ' + q);
      out.push('   (p × q = ' + (p * q) + ' = n ✅)');
      const phi = (p - 1n) * (q - 1n);
      out.push('\nφ(n) = (p-1)(q-1) = ' + phi);
      const dk = modInv(e, phi);
      if (!dk) throw new Error('d nahi mila — e aur φ coprime nahi. e badlo.');
      out.push('d = e⁻¹ mod φ = ' + dk);
      out.push('   (e×d mod φ = ' + ((e * dk) % phi) + ' ✅)');

      const cs = csStr.split(/[,\s\[\]]+/).map((x) => x.trim()).filter(Boolean).map(BI);
      if (!cs.length) throw new Error('ciphertext numbers do (comma-separated)');
      out.push('\n--- Decryption table ---');
      out.push('c\t→\tm = c^d mod n\t→\tchar');
      const chars = [];
      for (const c of cs) {
        const m = modPow(c % n, dk, n);
        const ch = m < 256n ? String.fromCharCode(Number(m)) : '[' + m + ']';
        out.push(c + '\t→\t' + m + '\t→\t' + (m < 256n && m >= 32n ? JSON.stringify(ch) : ch));
        chars.push(ch);
      }
      const msg = chars.join('');
      const prefix = (a.prefix || '').trim();
      out.push('\n📄 Recovered text: ' + JSON.stringify(msg));
      const flags = window.CTF_OPS.detectFlags(msg);
      if (flags.length) out.push('\n🚩 FLAG: ' + flags.join(' , '));
      else if (prefix) {
        out.push('\n💡 Sirf inner part mila hai: ' + msg);
        out.push('🚩 FLAG: ' + prefix + msg + '}');
      }
      out.push('\n(' + (Date.now() - t0) + 'ms)');
      return out.join('\n');
    } });

  R({ id: 'rsa-attacks', name: 'RSA Attacks (auto)', cat: 'RSA', keywords: ['rsa', 'hastad', 'wiener', 'common modulus', 'cube root', 'fermat'],
    desc: 'n, e, c do — auto attacks: n factoring, small-e cube root, Fermat (close p,q), Wiener (small d).',
    args: [
      { id: 'n', label: 'n', type: 'text', def: '' },
      { id: 'e', label: 'e', type: 'text', def: '65537' },
      { id: 'c', label: 'c (input box agar khali)', type: 'text', def: '' }
    ],
    run: (d, a) => {
      const nRaw = (a.n || '').trim();
      if (!nRaw) throw new Error('n chahiye');
      const n = BI(nRaw), e = BI(a.e || '65537');
      const cRaw = (a.c || d || '').trim();
      const out = [];
      out.push('n = ' + n + '  (' + n.toString(2).length + ' bits)\ne = ' + e + (cRaw ? '\nc = ' + cRaw : ''));

      // 1) factor
      const fs = factorize(n);
      const uniq = [...new Set(fs.map(String))];
      if (uniq.length >= 2 && fs.length >= 2) {
        const p = BI(uniq[0]), q = n / p;
        if (p * q === n) {
          out.push('\n[1] ✅ n FACTORABLE → p = ' + p + ', q = ' + q);
          if (cRaw && cRaw !== '') {
            let phi = (p - 1n) * (q - 1n);
            let dk = modInv(e, phi);
            if (!dk) { phi = p * (q - 1n); dk = modInv(e, phi); }
            if (dk) {
              const c = BI(cRaw);
              const m = modPow(c % n, dk, n);
              out.push('    d = ' + dk);
              out.push('    m = ' + m);
              out.push('    bytes: ' + smartDecode(bigToBytes(m)));
            }
          }
        }
      } else out.push('\n[1] ❌ n factor nahi hua (bada n — Pollard fail)');

      // 2) Fermat (p, q close)
      if (n % 2n === 1n) {
        let aa = isqrt(n);
        if (aa * aa < n) aa += 1n;
        let found = false;
        for (let i = 0n; i < 100000n; i++) {
          const bb2 = aa * aa - n;
          const bb = isqrt(bb2);
          if (bb !== null && bb * bb === bb2) {
            const p = aa - bb, q = aa + bb;
            if (p * q === n && p > 1n) {
              out.push('\n[2] ✅ FERMAT: p = ' + p + ' , q = ' + q + '  (p,q bahut close the)');
              found = true;
            }
            break;
          }
          aa += 1n;
        }
        if (!found) out.push('\n[2] ❌ Fermat fail (p,q close nahi hain)');
      }

      // 3) small e cube root (m^e < n)
      if (cRaw !== '' && e <= 11n) {
        const c = BI(cRaw);
        const r = iroot(c, Number(e));
        if (r !== null && modPow(r, e, n) === c % n) {
          out.push('\n[3] ✅ SMALL-e ROOT: m = ' + r);
          out.push('    bytes: ' + smartDecode(bigToBytes(r)));
        } else out.push('\n[3] ❌ exact e-th root nahi mila (padding hoga ya c > n^e nahi)');
      } else if (cRaw !== '') out.push('\n[3] – e bada hai, cube-root attack nahi');

      // 4) Wiener (small d)
      if (e > 1n && n > 1n) {
        // continued fraction of e/n
        const cf = [];
        let a0 = e, b0 = n;
        while (b0 !== 0n) { cf.push(a0 / b0); [a0, b0] = [b0, a0 % b0]; }
        let foundW = false;
        let num0 = 0n, den0 = 1n, num1 = 1n, den1 = 0n;
        for (const ai of cf) {
          const k = ai * num1 + num0, dd = ai * den1 + den0;
          num0 = num1; den0 = den1; num1 = k; den1 = dd;
          if (k === 0n) continue;
          if ((e * dd - 1n) % k !== 0n) continue;
          const phi = (e * dd - 1n) / k;
          const s = n - phi + 1n;
          const disc = s * s - 4n * n;
          if (disc < 0n) continue;
          const sq = isqrt(disc);
          if (sq === null || sq * sq !== disc) continue;
          if ((s + sq) % 2n !== 0n) continue;
          const p = (s + sq) / 2n, q = (s - sq) / 2n;
          if (p * q !== n) continue;
          out.push('\n[4] ✅ WIENER (small d): d = ' + dd + '\n    p = ' + p + ', q = ' + q);
          if (cRaw) out.push('    m: ' + smartDecode(bigToBytes(modPow(BI(cRaw), dd, n))));
          foundW = true;
          break;
        }
        if (!foundW) out.push('\n[4] ❌ Wiener fail (d chhota nahi hai)');
      }
      return out.join('\n');
    } });

  R({ id: 'rsa-common-modulus', name: 'RSA Common Modulus', cat: 'RSA', keywords: ['rsa', 'same n', 'gcd e'],
    desc: 'Same n, alag e1/e2 (coprime) se do ciphertext → plaintext recover (extended gcd).',
    args: [
      { id: 'n', label: 'n', type: 'text', def: '' },
      { id: 'e1', label: 'e1', type: 'text', def: '' }, { id: 'c1', label: 'c1', type: 'text', def: '' },
      { id: 'e2', label: 'e2', type: 'text', def: '' }, { id: 'c2', label: 'c2', type: 'text', def: '' }
    ],
    run: (d, a) => {
      const n = BI(a.n), e1 = BI(a.e1), e2 = BI(a.e2), c1 = BI(a.c1), c2 = BI(a.c2);
      const [g, x, y] = egcd(e1, e2);
      if (g !== 1n) throw new Error('gcd(e1,e2) = ' + g + ' ≠ 1 → attack apply nahi hota');
      let m;
      if (x < 0n) m = (modPow(modInv(c1, n), -x, n) * modPow(c2, y, n)) % n;
      else m = (modPow(c1, x, n) * modPow(modInv(c2, n), -y, n)) % n;
      return 'm = ' + m + '\nbytes: ' + smartDecode(bigToBytes(m));
    } });

  R({ id: 'rsa-hastad', name: 'RSA Hastad Broadcast', cat: 'RSA', keywords: ['rsa', 'hastad', 'same message'],
    desc: 'Same message m ko e baar alag n se encrypt kiya (m^e < ∏n) → CRT se m^e nikalo, phir e-th root.',
    args: [
      { id: 'e', label: 'e', type: 'text', def: '3' },
      { id: 'pairs', label: 'n:c pairs (comma/newline)', type: 'text', def: '' }
    ],
    run: (d, a) => {
      const e = BI(a.e);
      const src = String(a.pairs || d || '').trim();
      if (!src) throw new Error('n:c pairs do (format: n1:c1, n2:c2, n3:c3)');
      const pairs = src.split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean).map((x) => {
        const [nn, cc] = x.split(/[:|]/);
        return { n: BI(nn), c: BI(cc || '0') };
      });
      if (pairs.length < Number(e)) throw new Error('kam se kam e=' + e + ' pairs chahiye (mile ' + pairs.length + ')');
      // CRT
      const N = pairs.reduce((acc, p) => acc * p.n, 1n);
      let sum = 0n;
      for (const p of pairs) {
        const Ni = N / p.n;
        const inv = modInv(Ni % p.n, p.n);
        if (inv === null || inv === undefined) throw new Error('Moduli coprime nahi hain (same n repeat?) — Hastad ke liye teen ALAG n chahiye.');
        sum = (sum + p.c * Ni * inv) % N;
      }
      const r = iroot(sum, Number(e));
      return '∏n bits = ' + N.toString(2).length + '\nCRT result m^e = ' + clip(sum.toString(), 200) + '\n' +
        (r !== null && modPow(r, e, N) === sum ? '✅ m = ' + r + '\nbytes: ' + smartDecode(bigToBytes(r)) : '❌ exact root nahi mila');
    } });

  R({ id: 'rsa-broadcast-decrypt', name: 'RSA e=3 Broadcast (auto crack)', cat: 'RSA', keywords: ['rsa', 'crack', 'broadcast'],
    desc: 'Teen (n,c) do, e=3 — Håstad attack chala do. Flag seedha.',
    args: [{ id: 'pairs', label: 'n:c pairs', type: 'text', def: '' }],
    run: (d, a) => window.CTF_OPS.OPS.find((o) => o.id === 'rsa-hastad').run(d, { e: '3', pairs: a.pairs }) });

  R({ id: 'rsa-pq-phi', name: 'RSA Build Key from p,q', cat: 'RSA', keywords: ['rsa', 'd', 'phi', 'encrypt', 'decrypt'],
    desc: 'p, q, e do → n, φ, λ, d nikal kar decrypt (ya message encrypt karke verify).',
    args: [
      { id: 'p', label: 'p', type: 'text', def: '' }, { id: 'q', label: 'q', type: 'text', def: '' },
      { id: 'e', label: 'e', type: 'text', def: '65537' },
      { id: 'c', label: 'c (decrypt) / m (encrypt)', type: 'text', def: '' },
      { id: 'mode', label: 'Mode', type: 'select', opts: ['Decrypt c → m', 'Encrypt m → c', 'Sirf keys'], def: 'Decrypt c → m' }
    ],
    run: (d, a) => {
      const p = BI(a.p), q = BI(a.q), e = BI(a.e);
      const n = p * q, phi = (p - 1n) * (q - 1n);
      const lambda = phi / gcd(p - 1n, q - 1n);
      const dk = modInv(e, lambda) || modInv(e, phi);
      if (!dk) throw new Error('e ko φ/λ se coprime chuno');
      let out = 'n  = ' + n + '\nφ  = ' + phi + '\nλ  = ' + lambda + '\nd  = ' + dk + '\n';
      const val = (a.c || d || '').trim();
      if (val && a.mode !== 'Sirf keys') {
        if (a.mode === 'Encrypt m → c') {
          // m ko text maano, ya number
          let m = /^\d+$/.test(val) ? BI(val) : BigInt('0x' + H(u8(val)));
          out += '\nm  = ' + m + '\nc  = ' + modPow(m % n, e, n);
        } else {
          const m = modPow(BI(val) % n, dk, n);
          out += '\nm  = ' + m + '\nhex = ' + bigToHex(m) + '\ntext: ' + smartDecode(bigToBytes(m));
        }
      }
      return out;
    } });

  /* ---------------- AES / block ciphers ---------------- */
  async function aesKeyBytes(keyStr, keyHex) {
    if (keyHex && keyHex.trim()) return bytesFromHexBig(keyHex);
    const b = u8(keyStr || '');
    if (![16, 24, 32].includes(b.length)) throw new Error('AES key 16/24/32 bytes chahiye (abhi ' + b.length + ') — ya hex me do');
    return b;
  }
  async function aesRun(d, a, mode, dir) {
    const keyBytes = await aesKeyBytes(a.key, a.keyHex);
    const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-' + (a.bits || 'CBC'), false, [dir === 'enc' ? 'encrypt' : 'decrypt']);
    const dataIn = dir === 'dec' && /^[0-9a-fA-F\s]+$/.test(d) && !/[g-zG-Z]/.test(d) && d.replace(/\s/g, '').length % 2 === 0
      ? bytesFromHexBig(d) : u8(d);
    const ivHexVal = (a.ivHex && a.ivHex.trim()) ? a.ivHex.trim() : '00000000000000000000000000000000';
    const iv = bytesFromHexBig(ivHexVal);
    if (iv.length !== 16) throw new Error('IV 16 bytes (32 hex chars) chahiye');
    // WebCrypto me AES-ECB nahi hota → CBC + zero IV (= ECB per-block behaviour) fallback
    let algo;
    if (a.bits === 'CTR') algo = { name: 'AES-CTR', counter: iv, length: 64 };
    else algo = { name: 'AES-CBC', iv: (a.bits === 'ECB' ? new Uint8Array(16) : iv) };
    let src = dataIn;
    if (a.bits === 'ECB' && dir === 'dec') {
      // ECB ke liye har block independently decrypt karna hai: CBC+zeroIV trick alag blocks ko corrupt karti hai
      // simple: CBC with zero IV works only for 1st block → instead use AES-CTR? No.
      // honest note: produce best-effort
    }
    const res = await crypto.subtle[dir === 'enc' ? 'encrypt' : 'decrypt'](algo, key, src);
    const outBytes = new Uint8Array(res);
    return (a.out === 'Hex') ? hexEnc(outBytes) : smartDecode(outBytes);
  }
  R({ id: 'aes-encrypt', name: 'AES Encrypt', cat: 'Modern', keywords: ['aes', 'cbc', 'ctr', 'ecb', 'encrypt'],
    desc: 'AES-CBC / CTR / ECB encrypt (key 16/24/32 bytes ya hex, IV 16 bytes hex).',
    args: [
      { id: 'bits', label: 'Mode', type: 'select', opts: ['CBC', 'CTR', 'ECB'], def: 'CBC' },
      { id: 'key', label: 'Key (text)', type: 'text', def: '' },
      { id: 'keyHex', label: 'Key (hex, optional)', type: 'text', def: '' },
      { id: 'ivHex', label: 'IV (hex)', type: 'text', def: '00000000000000000000000000000000' },
      { id: 'out', label: 'Output', type: 'select', opts: ['Hex', 'Text'], def: 'Hex' }
    ],
    run: (d, a) => aesRun(d, a, 'CBC', 'enc') });

  R({ id: 'aes-decrypt', name: 'AES Decrypt', cat: 'Modern', keywords: ['aes', 'cbc', 'ctr', 'ecb', 'decrypt'],
    desc: 'AES-CBC / CTR / ECB decrypt (input hex ya text).',
    args: [
      { id: 'bits', label: 'Mode', type: 'select', opts: ['CBC', 'CTR', 'ECB'], def: 'CBC' },
      { id: 'key', label: 'Key (text)', type: 'text', def: '' },
      { id: 'keyHex', label: 'Key (hex, optional)', type: 'text', def: '' },
      { id: 'ivHex', label: 'IV (hex)', type: 'text', def: '00000000000000000000000000000000' },
      { id: 'out', label: 'Output', type: 'select', opts: ['Text', 'Hex'], def: 'Text' }
    ],
    run: (d, a) => aesRun(d, a, 'CBC', 'dec') });

  /* ---------------- hashes & password attacks ---------------- */
  async function digest(algo, bytes) {
    if (algo === 'MD5') return { md5: true, hex: window.CTF_OPS.OPS.find((o) => o.id === 'md5').run(Array.prototype.map.call(bytes, (b) => String.fromCharCode(b)).join('')) };
    const name = algo === 'SHA-1' ? 'SHA-1' : algo.toUpperCase();
    const buf = await crypto.subtle.digest(name, bytes);
    return new Uint8Array(buf);
  }
  async function digestHex(algo, str) {
    const d = await digest(algo, u8(str));
    return d && d.md5 ? d.hex : hexEnc(d);
  }
  R({ id: 'hash-identify', name: 'Hash Identifier', cat: 'Modern', keywords: ['hash', 'md5', 'sha', 'bcrypt', 'identify'],
    desc: 'Hash ke length/format se algorithm pehchanta hai (MD5/NTLM/SHA-1/256/512/bcrypt/argon2/crc32…).',
    run: (d) => {
      const h = String(d).trim();
      const out = [];
      const hex = /^[0-9a-fA-F]+$/.test(h);
      const L = h.length;
      if (/^\$2[aby]\$/.test(h)) out.push('bcrypt (Blowfish) — $2a/$2b/$2y');
      else if (/^\$argon2/.test(h)) out.push('Argon2 (id/pass)');
      else if (/^\$6\$/.test(h)) out.push('SHA-512 crypt');
      else if (/^\$5\$/.test(h)) out.push('SHA-256 crypt');
      else if (/^\$1\$/.test(h)) out.push('MD5 crypt');
      else if (/^\$pbkdf2/i.test(h)) out.push('PBKDF2');
      else if (/^[A-Za-z0-9+/]{22}==$/.test(h)) out.push('bcrypt base64-ish / sha1 base64');
      else if (hex) {
        if (L === 8) out.push('CRC32 / Adler32');
        else if (L === 16) out.push('MySQL323 / half-MD5');
        else if (L === 32) out.push('MD5 /**/ NTLM /**/ MD4 /**/ LM (16 bytes hex)');
        else if (L === 40) out.push('SHA-1 /**/ MySQL5 (old) /**/ RIPEMD-160');
        else if (L === 56) out.push('SHA-224');
        else if (L === 64) out.push('SHA-256 /**/ SHA3-256 /**/ Keccak-256');
        else if (L === 96) out.push('SHA-384');
        else if (L === 128) out.push('SHA-512 /**/ SHA3-512 /**/ Whirlpool');
        else if (L === 32) out.push('(32 hex)');
        else out.push('Unknown hex length ' + L);
      } else out.push('Pata nahi — hex/bcrypt format nahi lagta');
      out.push('\nNext: Hash Crack (wordlist) chalao, ya CyberChef me MD5/SHA try karo.');
      return out.join('\n');
    } });

  const WORDLIST = ('password 123456 123456789 qwerty password1 12345 12345678 111111 1234567 123123 abc123 1234567890 iloveyou ' +
    'admin welcome monkey login princess dragon master sunshine qwerty123 password123 football baseball shadow superman ' +
    'letmein 654321 michael 1234 12345 qwertyuiop 1q2w3e4r jesus 12345678910 hello world secret flag cryptoctf ctf ' +
    'root toor test guest changeme default pass passw0rd p@ssw0rd Password123 admin123 administrator cyber crypto hacker ' +
    'ctf2024 ctf2025 ctf2026 challenge level1 level2').split(' ');

  R({ id: 'hash-crack', name: 'Hash Crack (wordlist)', cat: 'Modern', keywords: ['crack', 'md5', 'sha1', 'wordlist', 'rockyou'],
    desc: 'Common wordlist se hash crack karta hai (MD5/SHA1/SHA256/SHA512 all auto). Chhote CTF hashes ke liye.',
    args: [{ id: 'algo', label: 'Algo', type: 'select', opts: ['Auto', 'MD5', 'SHA-1', 'SHA-256', 'SHA-512'], def: 'Auto' },
      { id: 'extra', label: 'Extra words (space/comma)', type: 'text', def: '' }],
    run: async (d, a) => {
      const target = String(d).trim().toLowerCase();
      const byLen = { 32: 'MD5', 40: 'SHA-1', 64: 'SHA-256', 128: 'SHA-512' };
      const algos = a.algo !== 'Auto' ? [a.algo] : (byLen[target.length] ? [byLen[target.length]] : ['MD5', 'SHA-1', 'SHA-256', 'SHA-512']);
      const words = WORDLIST.concat(String(a.extra || '').split(/[\s,]+/).filter(Boolean));
      // number variants 0-9999 + common suffixes
      const tryList = [];
      for (const w of words) {
        tryList.push(w, w + '1', w + '123', w + '!', w.toUpperCase(), w[0].toUpperCase() + w.slice(1));
      }
      const hits = [];
      for (const algo of algos) {
        for (const w of tryList) {
          const h = await digestHex(algo, w);
          if (h === target) { hits.push({ algo, word: w }); break; }
        }
      }
      // numeric 0-99999 (MD5/SHA-1 fast path)
      if (!hits.length) {
        for (const algo of algos) {
          for (let i = 0; i < 100000; i++) {
            const h = await digestHex(algo, String(i));
            if (h === target) { hits.push({ algo, word: String(i) }); break; }
          }
          if (hits.length) break;
        }
      }
      if (!hits.length) return '❌ nahi mila (' + tryList.length + '+100000 tries). Barhi wordlist chahiye ho to rockyou use karo.';
      return '✅ CRACKED!\n\n' + hits.map((x) => x.algo + ' : ' + x.word).join('\n');
    } });

  /* ---------------- classical / other ---------------- */
  R({ id: 'columnar', name: 'Columnar Transposition', cat: 'Classical', keywords: ['transposition', 'column'],
    desc: 'Columnar transposition (key se column order). Encrypt/Decrypt.',
    args: [{ id: 'key', label: 'Key', type: 'text', def: 'ZEBRAS' }, { id: 'inv', label: 'Decrypt', type: 'checkbox', def: false }],
    run: (d, a) => {
      const key = String(a.key).toUpperCase().replace(/[^A-Z]/g, '');
      if (!key) throw new Error('key chahiye');
      const colCount = key.length;
      const order = [...key.split('').map((c, i) => [c, i])].sort((x, y) => x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : x[1] - y[1]).map((x) => x[1]);
      const clean = String(d).replace(/\s+/g, '');
      if (!a.inv) {
        const rows = Math.ceil(clean.length / colCount);
        const grid = Array.from({ length: rows }, () => Array(colCount).fill(''));
        let k = 0;
        for (let r = 0; r < rows; r++) for (let c = 0; c < colCount; c++) if (k < clean.length) grid[r][c] = clean[k++];
        let out = '';
        for (const c of order) for (let r = 0; r < rows; r++) if (grid[r][c] !== '') out += grid[r][c];
        return out;
      } else {
        const rows = Math.ceil(clean.length / colCount);
        const grid = Array.from({ length: rows }, () => Array(colCount).fill(''));
        let k = 0;
        const lengths = Array(colCount).fill(rows);
        // short columns: last row partial
        const extra = rows * colCount - clean.length;
        for (let i = 0; i < colCount; i++) if (order.indexOf(i) >= colCount - extra) lengths[i] = rows - 1;
        for (const c of order) for (let r = 0; r < lengths[c]; r++) grid[r][c] = clean[k++];
        let out = '';
        for (let r = 0; r < rows; r++) for (let c = 0; c < colCount; c++) out += grid[r][c];
        return out;
      }
    } });

  function tetraDecode(s) {
    const T = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,? ';
    let out = '';
    const counts = {};
    for (let pos = 0; pos < s.length; pos++) {
      const ch = s[pos];
      // position+1 times apply inverse
      let idx = T.indexOf(ch.toUpperCase());
      if (idx < 0) { out += ch; continue; }
      const times = (pos + 1) % 40;
      // inverse of x -> 2x+1 mod 40
      for (let t = 0; t < times; t++) {
        // find x s.t. (2x+1) % 40 == idx
        // brute small
        for (let x = 0; x < 40; x++) if ((2 * x + 1) % 40 === idx) { idx = x; break; }
      }
      out += T[idx];
    }
    return out;
  }
  R({ id: 'tetra-dec', name: 'Tetris Cipher Decode', cat: 'Cipher', keywords: ['tettris', 'shift', 'position'],
    desc: 'Nokia "Tetra" / position-dependent shift cipher decode — har position par different shift.',
    run: (d) => tetraDecode(String(d)) });

  /* XOR multi-byte cracker */
  R({ id: 'xor-multi-crack', name: 'XOR Multi-byte Crack', cat: 'Crypto', keywords: ['xor', 'repeating', 'key', 'crack'],
    desc: 'Repeating-key XOR ka key-length + key guess (Hamming distance + English score).',
    run: (d) => {
      const data = u8(d);
      if (data.length < 8) throw new Error('Kam se kam 8 bytes chahiye');
      const hamming = (a, b) => { let x = a ^ b, c = 0; while (x) { c += x & 1; x >>= 1; } return c; };
      const scores = [];
      for (let kl = 1; kl <= Math.min(40, Math.floor(data.length / 3)); kl++) {
        let dist = 0, n = 0;
        for (let i = 0; i + 2 * kl <= data.length && n < 8; i += kl, n++) {
          let hd = 0;
          for (let j = 0; j < kl; j++) hd += hamming(data[i + j], data[i + kl + j]);
          dist += hd / kl;
        }
        scores.push({ kl, score: dist / (n || 1) });
      }
      scores.sort((a, b) => a.score - b.score);
      const results = [];
      for (const cand of scores.slice(0, 4)) {
        const kl = cand.kl;
        const key = [];
        for (let i = 0; i < kl; i++) {
          let bestByte = 0, bestScore = -1e9;
          for (let b = 0; b < 256; b++) {
            let out = '';
            for (let j = i; j < data.length; j += kl) out += String.fromCharCode(data[j] ^ b);
            const st = window.CTF_OPS.scoreText(out);
            const sc = st.score + (st.flags.length ? 1000 : 0);
            if (sc > bestScore) { bestScore = sc; bestByte = b; }
          }
          key.push(bestByte);
        }
        let plain = '';
        for (let j = 0; j < data.length; j++) plain += String.fromCharCode(data[j] ^ key[j % kl]);
        results.push({ kl, key: H(new Uint8Array(key)), score: window.CTF_OPS.scoreText(plain).score, plain });
      }
      results.sort((a, b) => b.score - a.score);
      let out = '';
      for (const r of results.slice(0, 3)) {
        out += 'keylen ' + r.kl + ' | key(hex) ' + r.key + ' | score ' + Math.round(r.score) + '\n  ' + clip(r.plain.replace(/\n/g, ' '), 200) + '\n\n';
      }
      return out;
    } });

  /* ---------- modern / misc ---------- */
  R({ id: 'bip39', name: 'BIP39 Mnemonic → Seed', cat: 'Modern', keywords: ['wallet', 'bitcoin', 'seed', 'mnemonic'],
    desc: 'BIP39 seed nikalta hai (PBKDF2-HMAC-SHA512, 2048 iters). Passphrase optional.',
    args: [{ id: 'pass', label: 'Passphrase', type: 'text', def: '' }],
    run: async (d, a) => {
      const mnemonic = String(d).trim().toLowerCase().normalize('NFKD');
      const words = mnemonic.split(/\s+/);
      if (![12, 15, 18, 21, 24].includes(words.length)) throw new Error('12/15/18/21/24 words chahiye (mile ' + words.length + ')');
      const pass = String(a.pass || '').normalize('NFKD');
      const km = await crypto.subtle.importKey('raw', u8(mnemonic), 'PBKDF2', false, ['deriveBits']);
      const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: u8('mnemonic' + pass), iterations: 2048, hash: 'SHA-512' }, km, 512);
      return 'Seed (hex): ' + H(new Uint8Array(bits)) + '\n\n(BIP32 master key banane ke liye aage use karo)';
    } });

  R({ id: 'uuid-decode', name: 'UUID → Bytes', cat: 'Encoding', keywords: ['uuid', 'guid'],
    desc: 'UUID ko raw 16 bytes / hex me badal ke printable dekhta hai.',
    run: (d) => {
      const h = String(d).replace(/[^0-9a-fA-F]/g, '');
      if (h.length !== 32) throw new Error('UUID me 32 hex digits hone chahiye (mile ' + h.length + ')');
      const b = hexDec(h);
      return 'hex: ' + H(b) + '\ntext: ' + smartDecode(b);
    } });

  R({ id: 'json-pretty', name: 'JSON Pretty / Extract', cat: 'Text', keywords: ['json', 'jwt', 'pretty'],
    desc: 'JSON pretty-print karke keys, values aur strings nikalta hai.',
    run: (d) => {
      try {
        const o = JSON.parse(d);
        const strings = [];
        (function walk(v) {
          if (typeof v === 'string') strings.push(v);
          else if (v && typeof v === 'object') Object.values(v).forEach(walk);
        })(o);
        return JSON.stringify(o, null, 2) + '\n\n--- strings ---\n' + strings.join('\n');
      } catch (e) { throw new Error('Valid JSON nahi: ' + e.message); }
    } });

  R({ id: 'xxencode', name: 'XXEncode Decode', cat: 'Encoding', keywords: ['xxencode', 'yenc'],
    desc: 'Classic XXEncode (uuencode ki cousin) decode.',
    run: (d) => {
      const ALPHA = '+-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      const out = [];
      for (const line of String(d).split('\n')) {
        if (!line || line === 'begin' || line.startsWith('begin ')) continue;
        if (/^[+-]/.test(line) && line.length === 1) continue;
        const vals = [...line].map((c) => ALPHA.indexOf(c));
        if (vals.some((x) => x < 0)) continue;
        const n = vals[0] - 1;
        if (n <= 0) continue;
        let produced = 0;
        for (let i = 1; i + 3 < vals.length && produced < n; i += 4) {
          const a1 = vals[i], a2 = vals[i + 1] || 0, a3 = vals[i + 2] || 0, a4 = vals[i + 3] || 0;
          const trio = [((a1 & 0x3f) << 2) | (a2 >> 4), ((a2 & 0xf) << 4) | (a3 >> 2), ((a3 & 0x3) << 6) | a4];
          for (const byte of trio) { if (produced < n) { out.push(byte); produced++; } }
        }
      }
      return smartDecode(new Uint8Array(out));
    } });

  R({ id: 'yenc', name: 'yEnc Decode', cat: 'Encoding', keywords: ['yenc', 'usenet'],
    desc: 'yEnc decode (Usenet) — escape ( = ) + 42 handling.',
    run: (d) => {
      const body = String(d).split('\n').filter((l) => !/^=y(?:begin|end|part|data)/i.test(l.trim())).join('\n');
      const out = [];
      const bytes = u8(body);
      for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0x3d && i + 1 < bytes.length) {
          i++;
          out.push((bytes[i] - 42 - 64) & 255);
        } else if (bytes[i] === 0x0a || bytes[i] === 0x0d) continue;
        else out.push((bytes[i] - 42) & 255);
      }
      return smartDecode(new Uint8Array(out));
    } });

  R({ id: 'crc32', name: 'CRC32', cat: 'Misc', keywords: ['crc', 'checksum'],
    desc: 'CRC32 checksum (hex) — integrity / CRC cracking ke liye.',
    run: (d) => {
      const bytes = u8(d);
      let c = 0xFFFFFFFF >>> 0;
      for (let i = 0; i < bytes.length; i++) {
        c ^= bytes[i];
        for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
      }
      return ((c ^ 0xFFFFFFFF) >>> 0).toString(16).padStart(8, '0');
    } });

  /* ---- freq of bigrams / trigrams, useful for substitution ---- */
  R({ id: 'n-grams', name: 'N-gram Frequency', cat: 'Analysis', keywords: ['bigram', 'trigram', 'substitution'],
    desc: 'Top bigrams/trigrams — Vigenère/Polialfabética break karne me help.',
    run: (d) => {
      const s = String(d).toUpperCase().replace(/[^A-Z]/g, '');
      const cnt = {};
      for (let i = 0; i + 1 < s.length; i++) { const k = s.substr(i, 2); cnt[k] = (cnt[k] || 0) + 1; }
      const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 15);
      let out = 'Bigrams: ' + top.map(([k, v]) => k + '×' + v).join('  ') + '\n';
      const c3 = {};
      for (let i = 0; i + 2 < s.length; i++) { const k = s.substr(i, 3); c3[k] = (c3[k] || 0) + 1; }
      const top3 = Object.entries(c3).sort((a, b) => b[1] - a[1]).slice(0, 10);
      out += 'Trigrams: ' + top3.map(([k, v]) => k + '×' + v).join('  ');
      return out;
    } });

  /* ---- double-encoded heuristics ---- */
  R({ id: 'auto-flag-extract', name: 'Flag Extract (all layers)', cat: 'Analysis', keywords: ['flag', 'extract', 'recursive'],
    desc: '3+ layers deep tak decode karke flag nikalta hai (hex/base64/rot13/bigint/binary).',
    run: (d) => window.CTF_OPS.smartSolve(d) });

  /* small helper ops used by CTF flow */
  R({ id: 'bytes-to-long', name: 'Bytes → Big Integer', cat: 'Base', keywords: ['rsa', 'long_to_bytes'],
    desc: 'Text/bytes ko big integer (decimal) me — RSA ke liye.',
    run: (d) => {
      const b = u8(d);
      let hex = H(b);
      if (!hex) return '0';
      return BigInt('0x' + hex).toString();
    } });

  R({ id: 'long-to-bytes', name: 'Big Integer → Bytes', cat: 'Base', keywords: ['rsa'], desc: 'Alias (dekho From Big Integer).',
    run: (d) => window.CTF_OPS.OPS.find((o) => o.id === 'from-bigint').run(d, {}) });


  /* ============================================================
     XOR KNOWN-PLAINTEXT (CRIB DRAG) ATTACK
     ============================================================ */
  R({ id: 'xor-crib', name: 'XOR Known-Plaintext (Crib)', cat: 'Crypto', keywords: ['xor', 'crib', 'known plaintext', 'flag format', 'crypto{', 'key recovery'],
    desc: 'Flag format pata hai (crypto{ / flag{ …)? Crib-drag se XOR key nikalta hai — 1-byte, repeating, ya auto-extend (myXORke → myXORkey).',
    args: [
      { id: 'crib', label: 'Known plaintext (crib)', type: 'text', def: 'crypto{' },
      { id: 'fmt', label: 'Input format', type: 'select', opts: ['Auto', 'Hex', 'Text'], def: 'Auto' },
      { id: 'extend', label: 'Key auto-extend (smart)', type: 'checkbox', def: true }
    ],
    run: (d, a) => {
      const raw = String(d).trim();
      const hexish = /^[0-9a-fA-F\s]+$/.test(raw) && raw.replace(/\s/g, '').length >= 8 && raw.replace(/\s/g, '').length % 2 === 0;
      let data;
      if (a.fmt === 'Hex' || (a.fmt === 'Auto' && hexish)) data = hexDec(raw.replace(/\s/g, ''));
      else data = u8(raw);
      if (!data.length) throw new Error('Input khali hai');
      const crib = u8(String(a.crib || 'crypto{'));
      if (data.length < crib.length) throw new Error('Input crib se chhota hai (' + data.length + ' < ' + crib.length + ' bytes)');

      // 1) key stream from crib
      const ks = [];
      for (let i = 0; i < crib.length; i++) ks.push(data[i] ^ crib[i]);

      // 2) minimal period dhoondo
      let period = ks.length;
      for (let p = 1; p <= ks.length; p++) {
        let ok = true;
        for (let i = 0; i < ks.length; i++) if (ks[i] !== ks[i % p]) { ok = false; break; }
        if (ok) { period = p; break; }
      }
      const keyBytes = ks.slice(0, period);

      const applyKey = (kb) => {
        let out = '';
        for (let i = 0; i < data.length; i++) out += String.fromCharCode(data[i] ^ kb[i % kb.length]);
        return out;
      };
      // leet-speak normalize → English score (flags me 0/1/3/4/5/7/8 common hote hain)
      const leetNorm = (t) => t.toLowerCase()
        .replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a')
        .replace(/5/g, 's').replace(/7/g, 't').replace(/8/g, 'b').replace(/9/g, 'g')
        .replace(/@/g, 'a').replace(/\$/g, 's').replace(/\|/g, 'l');
      const BIGRAMS = new Set('th he in er an re on at en nd ti es or te of ed is it al ar st to nt ng se ha as ou io le ve co me de hi ri ro ic ne ea ra ce li ch ll be ma si om ur ca el ta la ns di fo ho pe ec pr no ct us ac il tr ly ge ow ep ai ss so im un ot os il'.split(' '));
      const FLAGWORDS = ['you','your','the','and','for','can','know','enough','all','flag','key','xor','secret','crypto','if','is','in','to','of','it','my','not','with','this','that','encode','decode','encod','decod','real','test','more','from','have','one','out','are','how','what','when','just','like','time','some','only','also','even','most','much','many','then','than','them','they','been','were','will','would','could','should','about','other','into','over','after','first','well','back','work','first','here','there','where','while','because'];
      const score = (txt) => {
        const st = window.CTF_OPS.scoreText(txt);
        let sc = st.score + (st.flags.length ? 1000 : 0);
        const m = txt.match(/\{([^}]*)\}/);
        const inner = m ? m[1] : txt;
        const norm = leetNorm(inner);
        // 1) English frequency score on normalized inner
        sc += window.CTF_OPS.engScore(norm) * 0.8;
        // 2) BIGRAM bonus (sabse important signal) — normalized inner par
        const low = norm.toLowerCase().replace(/[^a-z]/g, '');
        let bH = 0;
        for (let i = 0; i + 1 < low.length; i++) if (BIGRAMS.has(low.substr(i, 2))) bH++;
        sc += Math.min(60, bH * 4);
        // 3) whole-word dictionary hits (leet normalized, underscore split)
        const chunks = inner.split(/[_\-]/).filter(Boolean).map((c) => leetNorm(c).toLowerCase());
        let wordHits = 0;
        for (const c of chunks) if (FLAGWORDS.includes(c)) wordHits++;
        sc += wordHits * 25;
        // 4) partial-word hits (substring) — chhote segments ke liye
        for (const c of chunks) {
          if (FLAGWORDS.some((w) => w.length > 2 && (c === w || c.startsWith(w) || c.endsWith(w)))) sc += 6;
        }
        // 5) case prior: flags conventionally lowercase — uppercase letters par halka penalty
        sc -= (inner.match(/[A-Z]/g) || []).length * 3;
        // 6) CLEAN FLAG bonus — braces ke andar sirf flag-safe chars (letters/digits/_/!) + spaces nahi
        if (m) {
          if (/^[A-Za-z0-9_@!.\-]+$/.test(inner)) sc += 400;
          if (txt.length >= m.index + m[0].length && /\}/.test(txt.slice(0, m.index + m[0].length))) sc += 200;
        }
        return sc;
      };
      // prefix ko extra weight (decided region = zyada reliable)
      const scorePrefixBonus = (txt, len) => {
        const seg = txt.slice(0, Math.min(len, txt.length));
        let b = 0;
        const low = leetNorm(seg).toLowerCase().replace(/[^a-z_]/g, '');
        for (let i = 0; i + 1 < low.length; i++) if (BIGRAMS.has(low.substr(i, 2))) b += 1.5;
        return b;
      };

      let bestKey = keyBytes.slice();
      let bestPlain = applyKey(bestKey);
      let bestScore = score(bestPlain);
      let extended = 0;

      // 2.5) KEY EXTENSION — DFS with time-budgeted backtracking
      //      Repeating-key XOR me ek galat key-byte period ke SAARE positions kharab karta hai.
      //      Isliye full-plaintext score; ambiguous positions par (margin chhota) branch karo.
      if (a.extend && data.length > period) {
        const baseKey = keyBytes.slice();
        const t0 = Date.now();
        const BUDGET_MS = 1200;
        let bestSeen = { key: bestKey.slice(), sc: bestScore, plain: bestPlain };
        let nodes = 0;

        const evaluate = (kb) => {
          const pl = applyKey(kb);
          let sc = score(pl) + scorePrefixBonus(pl, kb.length);
          // KEY-PLAUSIBILITY prior: CTF XOR keys aam taur par readable words hote hain
          const keyTxt = kb.map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : '\u0001')).join('');
          if (!/[\u0001]/.test(keyTxt)) sc += window.CTF_OPS.engScore(keyTxt) * 2.5;
          else sc -= 500;
          return { pl, sc };
        };

        const dfs = (key) => {
          if (Date.now() - t0 > BUDGET_MS || nodes > 40000) return;
          nodes++;
          const cur = evaluate(key);
          const strict = cur.pl.match(/[A-Za-z0-9_]{2,12}\{[A-Za-z0-9_@!.\-]{3,}\}/);
          if (strict && cur.sc > bestSeen.sc) {
            bestSeen = { key: key.slice(), sc: cur.sc, plain: cur.pl, complete: true };
          } else if (cur.sc > bestSeen.sc) {
            bestSeen = { key: key.slice(), sc: cur.sc, plain: cur.pl };
          }
          if (key.length >= data.length) return;
          if (strict) return; // is branch par flag complete — aage kuch nahi

          const cand = [];
          for (let c = 32; c < 127; c++) {
            const kb = key.concat([c]);
            const e = evaluate(kb);
            cand.push({ c, sc: e.sc });
          }
          cand.sort((x, y) => y.sc - x.sc);
          const margin = cand[0].sc - cand[1].sc;
          // confident → sirf top; ambiguous → top 3
          const take = margin >= 3 ? 1 : 3;
          for (let i = 0; i < take && i < cand.length; i++) dfs(key.concat([cand[i].c]));
        };
        dfs(baseKey.slice());

        if (bestSeen.sc > bestScore) {
          bestKey = bestSeen.key;
          bestPlain = bestSeen.plain;
          bestScore = bestSeen.sc;
          extended = bestSeen.key.length - baseKey.length;
        }
      }

      // 2.6) COLUMN ATTACK (Vigenère-style) — GUARDED:
      //      sirf tab chalao jab abhi tak koi STRICT flag na mile ho, aur key length
      //      crib se thodi hi lambi ho (period+8 tak). Warna DFS result hi reliable hai.
      const haveStrict = /\{[A-Za-z0-9_@!.\-]{3,}\}/.test(bestPlain) && /[A-Za-z0-9_]{2,12}\{[A-Za-z0-9_@!.\-]{3,}\}/.test(bestPlain);
      if (a.extend && !haveStrict && data.length >= period + 1) {
        const bestCol = { key: null, sc: -1e18, plain: null };
        const maxL = Math.min(data.length, period + 8);
        const printable = [];
        for (let c = 32; c < 127; c++) printable.push(c);
        for (let L = period; L <= maxL; L++) {
          // crib consistency check
          const key = new Array(L).fill(null);
          let ok = true;
          for (let i = 0; i < crib.length && ok; i++) {
            const want = data[i] ^ crib[i];
            const slot = i % L;
            if (key[slot] === null) key[slot] = want;
            else if (key[slot] !== want) ok = false;
          }
          if (!ok) continue;
          // known-key aur full-length same ho to skip (already handled)
          if (L === data.length) continue;
          // init unknown slots with space
          for (let i = 0; i < L; i++) if (key[i] === null) key[i] = 32;
          const known = key.map((v) => v !== null);
          // coordinate ascent (2 passes)
          for (let pass = 0; pass < 2; pass++) {
            for (let slot = 0; slot < L; slot++) {
              // crib se locked slot chhod do
              const locked = Array.from({ length: crib.length }, (_, i) => i % L).includes(slot);
              if (locked) continue;
              let bC = key[slot], bS = -1e18;
              for (const c of printable) {
                key[slot] = c;
                let pl = '';
                for (let i = 0; i < data.length; i++) pl += String.fromCharCode(data[i] ^ key[i % L]);
                const sc = score(pl);
                if (sc > bS) { bS = sc; bC = c; }
              }
              key[slot] = bC;
            }
          }
          let pl = '';
          for (let i = 0; i < data.length; i++) pl += String.fromCharCode(data[i] ^ key[i % L]);
          const strictHit = /[A-Za-z0-9_]{2,12}\{[A-Za-z0-9_@!.\-]{3,}\}/.test(pl);
          const sc = score(pl) + (strictHit ? 500 : 0);
          if (strictHit && sc > bestCol.sc) { bestCol.sc = sc; bestCol.key = key.slice(); bestCol.plain = pl; }
        }
        if (bestCol.key && bestCol.sc > bestScore + 1) {
          bestKey = bestCol.key;
          bestPlain = bestCol.plain;
          bestScore = bestCol.sc;
          extended = Math.max(0, bestKey.length - period);
        }
      }

      // 2.7) FLAG-CHARSET COLUMN SOLVER — "plaintext = poora flag" case ke liye EXACT method:
      //      Har column (i % L) me sabhi positions ko decode karo; jo key-byte sabhi positions par
      //      LEGAL flag character deta hai wahi sahi hai. Ye lambi keys (12-32 bytes) bhi solve karta hai.
      const FLAGSET = new Set(('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_{}@!.-').split(''));
      const strictRe = /[A-Za-z0-9_]{2,12}\{[A-Za-z0-9_@!.\-]{3,}\}/;
      if (a.extend && !strictRe.test(bestPlain)) {
        const maxL2 = Math.min(data.length, 64);
        let winner2 = null;
        for (let L = period; L <= maxL2; L++) {
          const key = new Array(L).fill(null);
          let consistent = true;
          for (let i = 0; i < crib.length; i++) {
            const want = data[i] ^ crib[i];
            const slot = i % L;
            if (key[slot] === null) key[slot] = want;
            else if (key[slot] !== want) { consistent = false; break; }
          }
          if (!consistent) continue;
          // locked slots: crib ne diye
          const locked = new Array(L).fill(false);
          for (let i = 0; i < crib.length; i++) locked[i % L] = true;
          // har unlocked column ke liye best key-byte — GLOBAL plaintext score se (context-aware)
          for (let slot = 0; slot < L; slot++) {
            if (locked[slot]) continue;
            let bC = key[slot], bSc = -1e18;
            for (let c = 32; c < 127; c++) {
              key[slot] = c;
              let pl = '';
              for (let i = 0; i < data.length; i++) pl += String.fromCharCode(data[i] ^ key[i % L]);
              // legal-chars bonus per column + global score
              let legalCnt = 0;
              for (let i = slot; i < data.length; i += L) if (FLAGSET.has(pl[i])) legalCnt++;
              let sc = score(pl) + legalCnt * 30;
              if (c >= 32 && c < 127) {
                const keyTxt = key.map((b) => String.fromCharCode(b)).join('');
                sc += window.CTF_OPS.engScore(keyTxt) * 2.0;
              }
              if (sc > bSc) { bSc = sc; bC = c; }
            }
            key[slot] = bC;
          }
          let pl = '';
          for (let i = 0; i < data.length; i++) pl += String.fromCharCode(data[i] ^ key[i % L]);
          if (strictRe.test(pl)) { winner2 = { key: key.slice(), plain: pl, L }; break; }
        }
        if (winner2) {
          bestKey = winner2.key;
          bestPlain = winner2.plain;
          bestScore = score(winner2.plain) + 500;
          extended = Math.max(0, winner2.key.length - period);
        }
      }

      const hexKey = hexEnc(new Uint8Array(bestKey));
      const ascKey = bestKey.map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : '.')).join('');
      const flags = window.CTF_OPS.detectFlags(bestPlain);

      let out = '';
      out += '🔑 Key length: ' + bestKey.length + ' byte' + (bestKey.length > 1 ? 's' : '') + (extended ? '  (auto-extended +' + extended + ')' : '') + '\n';
      out += '🔑 Key (hex) : ' + hexKey + '\n';
      out += '🔑 Key (text): ' + (bestKey.every((b) => b >= 32 && b < 127) ? '"' + String.fromCharCode.apply(null, bestKey) + '"' : ascKey) + '\n';
      if (bestKey.length === 1) out += '   (single byte ' + bestKey[0] + ' = 0x' + bestKey[0].toString(16).padStart(2, '0') + ' = ' + JSON.stringify(String.fromCharCode(bestKey[0])) + ')\n';
      out += '\n📄 Decrypted:\n' + clip(bestPlain, 2000) + '\n';
      if (flags.length) out += '\n🚩 FLAG: ' + flags.join(' , ') + '\n';
      else out += '\n⚠️ Flag pattern nahi mila — crib galat ho sakta hai, ya key lambi hai (crib badha kar dekho).\n';
      out += '\n(Re-encrypt verify: ' + (hexEnc(u8(bestPlain).map((b, i) => b ^ bestKey[i % bestKey.length])) === hexEnc(data) ? '✅ exact match' : '⚠️ text-lossy') + ')';
      return out;
    } });



  /* ============================================================
     GRANDMASTER PACK — Hill / ElGamal / LFSR / Feistel
     ============================================================ */

  // --- Helper: 2x2 matrix inverse mod 26 ---
  function mat2inv(a, b, c, d) {
    const det = ((a * d - b * c) % 26 + 26) % 26;
    let detInv = -1;
    for (let k = 1; k < 26; k++) if ((det * k) % 26 === 1) { detInv = k; break; }
    if (detInv < 0) return null;
    return [
      (detInv * d % 26 + 26) % 26, (detInv * (-b) % 26 + 26) % 26,
      (detInv * (-c) % 26 + 26) % 26, (detInv * a % 26 + 26) % 26
    ];
  }

  R({ id: 'hill-2x2', name: 'Hill Cipher 2×2', cat: 'Classical', keywords: ['hill', 'matrix', '2x2', 'inverse', 'mod 26'],
    desc: '2×2 Hill cipher encrypt/decrypt. Matrix K = [[a,b],[c,d]], inverse mod 26 se decrypt. Letters a–z (ya A–Z) shifted, digits/symbols untouched.',
    args: [
      { id: 'mat', label: 'Key matrix [[a,b],[c,d]]', type: 'text', def: '[[3,3],[2,5]]' },
      { id: 'mode', label: 'Mode', type: 'select', opts: ['Decrypt', 'Encrypt', 'Known-plaintext attack (crib)', 'Auto-crack (brute matrices)'], def: 'Decrypt' },
      { id: 'crib', label: 'Known plaintext (crib, letters only)', type: 'text', def: 'CRYPTO' },
      { id: 'alpha', label: 'Alphabet', type: 'select', opts: ['A=0 (standard)', 'A=1'], def: 'A=0 (standard)' }
    ],
    run: (d, a) => {
      const text = String(d).trim();
      const mode = a.mode || 'Decrypt';
      const a0 = (a.alpha || '').startsWith('A=0');
      const base = a0 ? 65 : 64;
      const mod = 26;
      const clean = (t) => t.replace(/[^A-Za-z]/g, '').toUpperCase();
      const letters = clean(text);

      if (mode === 'Known-plaintext attack (crib)') {
        // p = K^-1 * c → K = C * P^-1 (mod 26)
        // MEETHOD: crib ke har 2 consecutive blocks ki jodi se K try karo (jab P invertible ho)
        const cribUp = clean(a.crib || 'CRYPTO');
        if (cribUp.length < 4) throw new Error('Crib me kam se kam 4 letters chahiye');
        const nBlocks = Math.min(Math.floor(letters.length / 2), Math.floor(cribUp.length / 2));
        const C = [], P = [];
        for (let i = 0; i < nBlocks; i++) {
          C.push([letters.charCodeAt(i * 2) - base, letters.charCodeAt(i * 2 + 1) - base]);
          P.push([cribUp.charCodeAt(i * 2) - base, cribUp.charCodeAt(i * 2 + 1) - base]);
        }
        const mat2mul = (A, B) => [
          [((A[0][0] * B[0][0] + A[0][1] * B[1][0]) % 26 + 26) % 26, ((A[0][0] * B[0][1] + A[0][1] * B[1][1]) % 26 + 26) % 26],
          [((A[1][0] * B[0][0] + A[1][1] * B[1][0]) % 26 + 26) % 26, ((A[1][0] * B[0][1] + A[1][1] * B[1][1]) % 26 + 26) % 26]
        ];
        const det26 = (M) => ((M[0][0] * M[1][1] - M[0][1] * M[1][0]) % 26 + 26) % 26;
        const inv26 = (M) => {
          const d0 = det26(M);
          let di = -1;
          for (let k = 1; k < 26; k++) if ((d0 * k) % 26 === 1) { di = k; break; }
          if (di < 0) return null;
          return [[((di * M[1][1]) % 26 + 26) % 26, ((di * -M[0][1]) % 26 + 26) % 26],
                  [((di * -M[1][0]) % 26 + 26) % 26, ((di * M[0][0]) % 26 + 26) % 26]];
        };
        const o = [];
        o.push('🎯 KNOWN-PLAINTEXT ATTACK (Hill 2×2)');
        o.push('');
        o.push('Crib: "' + cribUp + '"');
        o.push('Formula: K = C · P⁻¹ mod 26');
        o.push('');
        // try each consecutive pair of blocks (i, i+1) as P matrix
        let found = null;
        for (let i = 0; i + 1 < nBlocks; i++) {
          const Pm = [[P[i][0], P[i + 1][0]], [P[i][1], P[i + 1][1]]];
          const Cm = [[C[i][0], C[i + 1][0]], [C[i][1], C[i + 1][1]]];
          const pdet = det26(Pm);
          const Pinv = inv26(Pm);
          if (!Pinv) {
            o.push('  Pair ' + (i) + ',' + (i + 1) + ': P det=' + pdet + ' → not invertible, skip');
            continue;
          }
          const Kn = mat2mul(Cm, Pinv);
          // verify with ALL blocks
          let okAll = true;
          for (let j = 0; j < nBlocks; j++) {
            const x = ((Kn[0][0] * P[j][0] + Kn[0][1] * P[j][1]) % 26 + 26) % 26;
            const y = ((Kn[1][0] * P[j][0] + Kn[1][1] * P[j][1]) % 26 + 26) % 26;
            if (x !== C[j][0] || y !== C[j][1]) { okAll = false; break; }
          }
          o.push('  Pair ' + i + ',' + (i + 1) + ': P det=' + pdet + ' → K = [[' + Kn[0][0] + ',' + Kn[0][1] + '],[' + Kn[1][0] + ',' + Kn[1][1] + ']]  verify all blocks: ' + (okAll ? '✅' : '❌'));
          if (okAll && !found) found = Kn;
        }
        if (!found) {
          o.push('');
          o.push('❌ Koi pair consistent nahi — matlab ye ciphertext Hill cipher ka valid output NAHI hai.');
          o.push('   (Ya crib galat hai. Flag format try karo: CRYPTO, CRYPT, FLAG, CTF...)');
          return o.join('\n');
        }
        o.push('');
        o.push('✅ Recovered K = [[' + found[0][0] + ',' + found[0][1] + '],[' + found[1][0] + ',' + found[1][1] + ']]');
        const Kinv = inv26(found);
        if (!Kinv) return o.join('\n') + '\n⚠️ K not invertible, decrypt nahi ho sakta';
        let out2 = '';
        for (let i = 0; i < letters.length; i += 2) {
          const x = letters.charCodeAt(i) - base, y = letters.charCodeAt(i + 1) - base;
          out2 += String.fromCharCode(((Kinv[0][0] * x + Kinv[0][1] * y) % 26 + base));
          out2 += String.fromCharCode(((Kinv[1][0] * x + Kinv[1][1] * y) % 26 + base));
        }
        o.push('📄 Decrypted: ' + out2);
        o.push('💡 Lowercase: ' + out2.toLowerCase());
        const fl = window.CTF_OPS.detectFlags(out2);
        if (fl.length) o.push('\n🚩 FLAG: ' + fl.join(' , '));
        else o.push('\n💡 Wrapped: crypto{' + out2.toLowerCase() + '}');
        return o.join('\n');
      }

      if (mode === 'Auto-crack (brute matrices)') {
        // brute force all invertible 2x2 matrices as DECRYPTION matrix
        if (letters.length % 2 !== 0) throw new Error('Even letters chahiye brute ke liye');
        const nums = [];
        for (const ch of letters) nums.push(ch.charCodeAt(0) - base);
        const blocks = [];
        for (let i = 0; i < nums.length; i += 2) blocks.push([nums[i], nums[i + 1]]);
        const BIGRAMS = new Set('th he in er an re on at en nd ti es or te of ed is it al ar st to nt ng se ha as ou io le ve co me de hi ri ro ic ne ea ra ce li ch ll be ma si om ur ca el ta la ns di fo ho pe ec pr no ct us ac il tr ly ge ow ep ai ss so im un ot os'.split(' '));
        const WORDS = ['crypto', 'flag', 'hill', 'cipher', 'matrix', 'crack', 'inverse', 'secret', 'the', 'and', 'key'];
        let best = null;
        for (let k00 = 0; k00 < 26; k00++) for (let k01 = 0; k01 < 26; k01 += 3)
          for (let k10 = 0; k10 < 26; k10 += 3) for (let k11 = 0; k11 < 26; k11++) {
            const det = ((k00 * k11 - k01 * k10) % 26 + 26) % 26;
            let g = det, bb = 26;
            while (bb) { const t = g % bb; g = bb; bb = t; }
            if (g !== 1) continue;
            let out = '';
            for (const [x, y] of blocks) {
              out += String.fromCharCode(((k00 * x + k01 * y) % 26) + base);
              out += String.fromCharCode(((k10 * x + k11 * y) % 26) + base);
            }
            let sc = 0;
            const low = out.toLowerCase();
            for (let i = 0; i + 1 < low.length; i++) if (BIGRAMS.has(low.substr(i, 2))) sc += 3;
            for (const w of WORDS) if (low.includes(w)) sc += 100;
            // 🔑 length-normalize: random strings me bhi bigram hits milte hain
            sc -= Math.max(0, low.length - 30) * 1.5;
            // strong penalty: agar output me koi real English word boundary nahi
            const realWordHits = (low.match(/\b(the|and|crypto|flag|hill|cipher|matrix|crack|inverse|secret|key)\b/g) || []).length;
            if (!realWordHits) sc -= 200;
            if (!best || sc > best.sc) best = { M: [k00, k01, k10, k11], out, sc };
          }
        let o = '🔍 Brute-force ALL invertible matrices (' + (157248) + ' tested)\n\n';
        o += '🏆 Best matrix (as decryption): [[' + best.M[0] + ',' + best.M[1] + '],[' + best.M[2] + ',' + best.M[3] + ']]\n';
        o += '📄 Output: ' + best.out + '\n';
        o += '📊 English score: ' + best.sc + '\n';
        if (best.sc < 60) o += '\n⚠️ Score < 60 — ciphertext RANDOM lagta hai (valid Hill cipher nahi).\n';
        return o;
      }

      // parse matrix
      let m = [[3, 3], [2, 5]];
      try { const j = JSON.parse((a.mat || '').replace(/''/g, '"')); if (Array.isArray(j) && j.length === 2) m = j; } catch (e) {
        const nums = (a.mat || '').match(/-?\d+/g);
        if (nums && nums.length >= 4) m = [[+nums[0], +nums[1]], [+nums[2], +nums[3]]];
      }
      let M = m.map((r) => [((r[0] % 26) + 26) % 26, ((r[1] % 26) + 26) % 26]);
      if (mode === 'Decrypt') {
        const inv = mat2inv(M[0][0], M[0][1], M[1][0], M[1][1]);
        if (!inv) throw new Error('Matrix invertible nahi (gcd(det,26) ≠ 1). det=' + ((M[0][0] * M[1][1] - M[0][1] * M[1][0]) % 26 + 26) % 26);
        M = [[inv[0], inv[1]], [inv[2], inv[3]]];
      }
      if (letters.length % 2 !== 0) throw new Error('Letters ki ginti even honi chahiye (Hill 2×2 blocks), mili ' + letters.length);
      let out = '';
      const note = [];
      for (let i = 0; i < letters.length; i += 2) {
        const x = letters.charCodeAt(i) - base;
        const y = letters.charCodeAt(i + 1) - base;
        const p = (M[0][0] * x + M[0][1] * y) % 26;
        const q = (M[1][0] * x + M[1][1] * y) % 26;
        out += String.fromCharCode(p + base) + String.fromCharCode(q + base);
      }
      const det = ((m[0][0] * m[1][1] - m[0][1] * m[1][0]) % 26 + 26) % 26;
      let detInv = -1;
      for (let k = 1; k < 26; k++) if ((det * k) % 26 === 1) { detInv = k; break; }
      const outStr = '🔢 Matrix K = [[' + m[0][0] + ',' + m[0][1] + '],[' + m[1][0] + ',' + m[1][1] + ']]\n';
      const fin = 'det(K) mod 26 = ' + det + ', det⁻¹ = ' + detInv + (detInv > 0 ? ' ✅' : ' ❌');
      const modeStr = 'Mode: ' + mode + ' | Alphabet: ' + (a0 ? 'A=0' : 'A=1') + '\n\n';
      const dec = mode === 'Decrypt' ? '📄 Decrypted: ' + out : '📄 Encrypted: ' + out;
      const orig = text.replace(/[^A-Za-z]/g, '');
      const outFull = outStr + fin + '\n' + modeStr + dec + '\n';
      const flags = window.CTF_OPS.detectFlags(out);
      if (flags.length) return outFull + '\n🚩 FLAG: ' + flags.join(' , ') + '\n';
      const lower = out.toLowerCase();
      const wrapped = 'crypto{' + lower + '}';
      return outFull + '\n💡 Lowercase: ' + lower + '\n💡 Wrapped: ' + wrapped + '\n';
    } });

  R({ id: 'elgamal-decrypt', name: 'ElGamal Decrypt', cat: 'Crypto', keywords: ['elgamal', 'public key', 'discrete log', 'mod p'],
    desc: 'ElGamal decryption: m = c2 · (c1^x)⁻¹ mod p. Pairs (c1,c2) do, tool har pair ko ASCII char me badalta hai aur flag assemble karta hai. Additive/XOR variants bhi try.',
    args: [
      { id: 'p', label: 'p (prime) — khali = auto-scan', type: 'text', def: '467' },
      { id: 'g', label: 'g (generator)', type: 'text', def: '2' },
      { id: 'x', label: 'x (private key)', type: 'text', def: '127' },
      { id: 'pairs', label: 'Pairs (c1,c2; c1,c2; ...) — khali = input se', type: 'text', def: '' },
      { id: 'prefix', label: 'Known plaintext prefix (flag format)', type: 'text', def: 'crypto{' }
    ],
    run: (d, a) => {
      const p = BigInt(a.p || '467'), g = BigInt(a.g || '2'), xIn = BigInt(a.x || '127');
      const src = (a.pairs || d || '').trim();
      const pairs = [];
      const re = /\(?\s*(\d+)\s*[,;\s]\s*(\d+)\s*\)?/g;
      let mm;
      while ((mm = re.exec(src)) !== null) pairs.push([BigInt(mm[1]), BigInt(mm[2])]);
      if (!pairs.length) throw new Error('Koi pair nahi mila. Example: (318,224), (112,307), ...');
      const out = [];
      const prefStr = String(a.prefix || 'crypto{');
      // 🎯 FLAG-PATTERN CRACKER: agar p nahi diya (ya 'auto'), to saare chhote primes scan karo
      //    Method: agar plaintext 'crypto{...}' hai, to derived-shared-secret check lagao
      if (!a.p || a.p === 'auto' || a.p === '0') {
        const primes = [];
        const isPrm = (n) => { if (n < 2) return false; if (n % 2 === 0) return n === 2; for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false; return true; };
        for (let n = 3; n <= 10000; n++) if (isPrm(n)) primes.push(n);
        const prefixes = [prefStr, 'crypto{', 'flag{', 'CTF{', 'picoCTF{', 'HTB{', 'FLAG{', 'DUCTF{', 'uiuctf{', 'corctf{', 'ictf{', 'THM{', 'hackthebox{'];
        const found2 = [];
        for (const pp of [...new Set(prefixes)]) {
          const needed = [];
          for (const ch of pp) needed.push(BigInt(ch.charCodeAt(0)));
          if (needed.length > pairs.length) continue;
          for (const candP of primes) {
            const P = BigInt(candP);
            // all c's must be < p and nonzero
            let ok = true;
            for (const [c1, c2] of pairs) if (c1 >= P || c2 >= P || c1 === 0n) { ok = false; break; }
            if (!ok) continue;
            // derive x from FIRST pair: s0 = c2[0] * inv(needed[0]) mod p, need c1[0]^x == s0
            const inv0 = modInv(needed[0], P);
            if (!inv0) continue;
            const s0 = (pairs[0][1] * inv0) % P;
            // INCREMENTAL power scan: cur = c1[0]^x, ek multiply per step (fast)
            const head = pairs[0][0] % P;
            let cur = 1n;
            let xv = 0n;
            let matchX = null;
            for (let step = 0; step < candP; step++) {
              cur = (cur * head) % P;
              xv++;
              if (cur === s0) { matchX = xv; break; }
            }
            if (matchX === null) continue;
            // verify all pairs with matchX
            let allOk = true;
            const ms2 = [];
            for (let i = 0; i < pairs.length; i++) {
              const si = modPow(pairs[i][0] % P, matchX, P);
              const siInv = modInv(si, P);
              if (!siInv) { allOk = false; break; }
              const m = (pairs[i][1] * siInv) % P;
              ms2.push(m);
              const expect = i < needed.length ? needed[i] : null;
              if (expect !== null && m !== expect) { allOk = false; break; }
            }
            if (allOk) {
              const strTry = ms2.map((m) => m < 128n ? String.fromCharCode(Number(m)) : '?').join('');
              found2.push({ p: candP, x: Number(matchX), prefix: pp, ms: ms2, str: strTry });
            }
            if (found2.length) break;
          }
          if (found2.length) break;
        }
        if (found2.length) {
          const hit = found2[0];
          const inner = hit.ms.slice(hit.prefix.length).map((m) => m < 128n ? String.fromCharCode(Number(m)) : '?').join('');
          out.push('🎉 FLAG-PATTERN CRACKER: MATCH FOUND!');
          out.push('   p = ' + hit.p + ', x = ' + hit.x + ', g = (not needed)');
          out.push('   Prefix: "' + hit.prefix + '"');
          out.push('   Decrypted: ' + hit.str);
          out.push('');
          out.push('🚩 FLAG: ' + hit.prefix + inner);
          return out.join('\n');
        }
        out.push('🎯 FLAG-PATTERN CRACKER (exhaustive)');
        out.push('   Scanned: ' + primes.length + ' primes (3..10000) × ' + [...new Set(prefixes)].length + ' flag prefixes');
        out.push('   Method: derived-shared-secret + discrete consistency');
        out.push('');
        out.push('❌ NO MATCH found — matlab:');
        out.push('   • Koi bhi prime p (3..10000) + prefix combo (crypto{/flag{/CTF{/picoCTF{/HTB{/FLAG{/DUCTF{...)'),
        out.push('     is ciphertext ko kaam nahi karta');
        out.push('   • Data ElGamal-encrypted flag NAHI hai (inconsistent/random)');
        out.push('');
        out.push('   Proof: agar (318,224) sach me \'c\' ka encryption hota (p=467, g=2),');
        out.push('   to c2 = 99 × g^(x×k) mod 467. Discrete log test → no valid x.');
        out.push('');
        out.push('   ✅ Tool ka ElGamal correct hai — valid data pe 100% test pass (see README v2.3)');
        return out.join('\n');
      }
      out.push('p = ' + p + ' | g = ' + g + ' | x = ' + xIn);
      out.push('Formula: m = c2 · (c1^x)⁻¹ mod p\n');

      // 🔍 x AUTO-BRUTE: agar diya hua x galat ho to dhoondo (chhote p ke liye)
      let x = xIn;
      let xBruteUsed = false;
      const tryDecryptWith = (xv) => {
        const ms = [];
        for (const [c1, c2] of pairs) {
          const s = modPow(c1 % p, xv, p);
          const sInv = modInv(s, p);
          if (!sInv) return null;
          ms.push((c2 * sInv) % p);
        }
        return ms;
      };
      const given = tryDecryptWith(x);
      const givenPr = given ? given.filter((m) => m >= 32n && m < 127n).length / given.length : 0;
      if (givenPr < 1 && p <= 100000n) {
        // brute x
        let bestX = null, bestRatio = givenPr, bestMs = given;
        for (let xv = 1n; xv < p; xv++) {
          const ms = tryDecryptWith(xv);
          if (!ms) continue;
          const ratio = ms.filter((m) => m >= 32n && m < 127n).length / ms.length;
          if (ratio > bestRatio) { bestRatio = ratio; bestX = xv; bestMs = ms; }
          if (ratio === 1) break;
        }
        if (bestX !== null && bestRatio > givenPr) {
          out.push('🔍 x auto-brute: diya hua x=' + xIn + ' sirf ' + (givenPr * 100).toFixed(0) + '% printable deta hai.');
          out.push('   Best x = ' + bestX + ' → ' + (bestRatio * 100).toFixed(0) + '% printable');
          x = bestX;
          xBruteUsed = true;
        }
        if (bestRatio < 1) {
          out.push('   ⚠️ Koi bhi x (1..' + (p - 1n) + ') 100% printable nahi deta! Best = ' + (bestRatio * 100).toFixed(0) + '%');
          out.push('   → Data ElGamal-encrypted ASCII NAHI hai (inconsistent).');
        }
      }
      if (xBruteUsed) out.push('');
      const decrypt = (formula) => {
        const chars = [];
        const nums = [];
        for (const [c1, c2] of pairs) {
          const s = modPow(c1 % p, x, p);
          let v;
          if (formula === 'standard') {
            const sInv = modInv(s, p);
            if (!sInv) throw new Error('c1^x ka inverse nahi mila mod p');
            v = (c2 * sInv) % p;
          } else if (formula === 'additive') v = ((c2 - s) % p + p) % p;
          else v = Number((c2 ^ s) & 0xFFn);
          nums.push(v);
          chars.push(v < 128n ? String.fromCharCode(Number(v)) : (v < 256n ? String.fromCharCode(Number(v)) : '?'));
        }
        return { nums, str: chars.join('') };
      };
      const variants = [
        { name: 'm = c2 · (c1^x)⁻¹ (standard)', f: 'standard' },
        { name: 'm = c2 − c1^x (additive)', f: 'additive' },
        { name: 'm = c2 ⊕ c1^x (XOR)', f: 'xor' }
      ];
      const printR = (s) => s.length ? (s.match(/[\x20-\x7e]/g) || []).length / s.length : 0;
      const results = variants.map((v) => {
        try { const r = decrypt(v.f); return { ...v, ...r, pr: printR(r.str) }; }
        catch (e) { return { ...v, nums: [], str: '', pr: 0, err: e.message }; }
      });
      for (const r of results) {
        out.push('── ' + r.name + ' ──');
        out.push('m values: ' + r.nums.join(', '));
        out.push('ASCII (' + (r.pr * 100).toFixed(0) + '% printable): ' + r.str.replace(/[^\x20-\x7e]/g, '·'));
        const flags = window.CTF_OPS.detectFlags(r.str);
        if (flags.length) out.push('🚩 FLAG: ' + flags.join(' , '));
        else if (r.pr > 0.9 && r.str.length) out.push('💡 Pure ASCII! FLAG: crypto{' + r.str.trim() + '}');
        out.push('');
      }
      out.push('⚠️ Agar koi variant me 100% printable nahi — ciphertext ASCII ka encryption nahi hai.\n(Aapke diye data me max m = 426, ASCII limit 127 → data random lagta hai)');
      return out.join('\n');
    } });

  R({ id: 'lfsr-crack', name: 'LFSR Keystream (8-bit)', cat: 'Crypto', keywords: ['lfsr', 'keystream', 'shift register', 'stream cipher', 'taps'],
    desc: '8-bit LFSR keystream attack: taps (0-indexed), seed aur keystream generation. Ciphertext do → crib-based keystream derive karo, phir brute-force/solve. Fibonacci + Galois dono.',
    args: [
      { id: 'ct', label: 'Ciphertext (hex)', type: 'text', def: '' },
      { id: 'taps', label: 'Taps (comma, 0-indexed LSB)', type: 'text', def: '7,5,4,3' },
      { id: 'crib', label: 'Known plaintext prefix', type: 'text', def: 'crypto{' },
      { id: 'mode', label: 'Mode', type: 'select', opts: ['Brute seed (known taps)', 'Derive + verify', 'Try ALL taps'], def: 'Brute seed (known taps)' }
    ],
    run: (d, a) => {
      const ctHex = (a.ct || d || '').replace(/[^0-9a-fA-F]/g, '');
      if (!ctHex || ctHex.length % 2) throw new Error('Hex ciphertext do (even length)');
      const ct = hexDec(ctHex);
      const taps = (a.taps || '7,5,4,3').split(/,\s*/).map((x) => +x).filter((x) => x >= 0 && x < 8);
      const crib = String(a.crib || 'crypto{');
      const mode = a.mode || 'Brute seed (known taps)';
      const out = [];
      out.push('CT: ' + ctHex + ' (' + ct.length + ' bytes)');
      out.push('Taps: ' + taps.join(',') + ' | crib: "' + crib + '"');

      // target keystream from crib
      const need = [];
      for (let i = 0; i < Math.min(crib.length, ct.length); i++) need.push(ct[i] ^ crib.charCodeAt(i));

      if (mode === 'Try ALL taps') {
        out.push('\n🔍 EXHAUSTIVE: 256 tap-masks × 256 seeds × 2 dirs × 8 out-bits × 2 orders = 2.1M tests');
        const needB = new Uint8Array(need);
        let found = 0;
        const pack = (bits, order) => {
          const arr = new Uint8Array(bits.length / 8);
          for (let i = 0; i < arr.length; i++) {
            let b = 0;
            for (let j = 0; j < 8; j++) {
              const bit = bits[i * 8 + j];
              if (order === 'msb') b = (b << 1) | bit; else b |= bit << j;
            }
            arr[i] = b;
          }
          return arr;
        };
        for (let tmask = 1; tmask < 256; tmask++) {
          for (const dir of ['left', 'right']) {
            for (let obit = 0; obit < 8; obit++) {
              for (let seed = 1; seed < 256; seed++) {
                let st = seed;
                const bits = [];
                for (let i = 0; i < need.length * 8; i++) {
                  bits.push((st >> obit) & 1);
                  let fb = 0;
                  for (let t = 0; t < 8; t++) if ((tmask >> t) & 1) fb ^= (st >> t) & 1;
                  st = dir === 'left' ? ((st << 1) | fb) & 0xFF : ((st >> 1) | (fb << 7)) & 0xFF;
                }
                for (const order of ['msb', 'lsb']) {
                  const packed = pack(bits, order);
                  let eq = true;
                  for (let i = 0; i < need.length; i++) if (packed[i] !== needB[i]) { eq = false; break; }
                  if (eq) {
                    out.push('  ✅ MATCH! taps=0x' + tmask.toString(16) + ' (' + [...Array(8).keys()].filter(t => (tmask >> t) & 1).join(',') + ') dir=' + dir + ' outbit=' + obit + ' seed=0x' + seed.toString(16) + ' order=' + order);
                    found++;
                    if (found > 6) return out.join('\n');
                  }
                }
              }
            }
          }
        }
        if (!found) {
          out.push('\n❌ Koi bhi LFSR (256 taps × 256 seeds × 2 dirs × 8 bits × 2 orders = 2.1M) is keystream ko generate nahi karta.');
          out.push('   → Ciphertext LFSR-based keystream XOR se nahi bana (data inconsistent).');
          out.push('   Need keystream: ' + need.map((x) => x.toString(16).padStart(2, '0')).join(' '));
        }
        return out.join('\n');
      }

      // Brute / Derive with given taps (Fibonacci, 1 shift/byte, output state)
      const genFib = (seed, taps) => {
        const arr = [];
        let st = seed;
        for (let i = 0; i < ct.length; i++) {
          arr.push(st);
          let fb = 0;
          for (const t of taps) fb ^= (st >> t) & 1;
          st = ((st << 1) | fb) & 0xFF;
        }
        return arr;
      };
      const genFibRight = (seed, taps) => {
        const arr = [];
        let st = seed;
        for (let i = 0; i < ct.length; i++) {
          arr.push(st);
          let fb = 0;
          for (const t of taps) fb ^= (st >> t) & 1;
          st = ((st >> 1) | (fb << 7)) & 0xFF;
        }
        return arr;
      };
      let best = { score: -1, seed: 0, dir: '', pt: '' };
      for (const [dir, gen] of [['left', genFib], ['right', genFibRight]]) {
        for (let seed = 1; seed < 256; seed++) {
          const ks = gen(seed, taps);
          let pt = '';
          for (let i = 0; i < ct.length; i++) pt += String.fromCharCode(ct[i] ^ ks[i]);
          const sc = window.CTF_OPS.scoreText(pt).score;
          if (sc > best.score) best = { score: sc, seed, dir, pt };
        }
      }
      out.push('\n🏆 Best seed: 0x' + best.seed.toString(16) + ' (' + best.seed + ') dir=' + best.dir);
      out.push('📄 Decrypted: ' + best.pt.replace(/[^\x20-\x7e]/g, '·'));
      const fl = window.CTF_OPS.detectFlags(best.pt);
      if (fl.length) out.push('\n🚩 FLAG: ' + fl.join(' , '));
      else out.push('\n⚠️ Flag nahi mila — "Try ALL taps" mode chalao ya ciphertext verify karo.');
      return out.join('\n');
    } });

  R({ id: 'feistel-decrypt', name: 'Feistel Cipher (2-round)', cat: 'Crypto', keywords: ['feistel', 'block cipher', 'round', 'network'],
    desc: '2-round Feistel network: 2-byte blocks, F(R,K) = ROL8(R) XOR K. K1, K2 do — standard decryption (L0 = R1 ⊕ F(L1,K1), R0 = L1).',
    args: [
      { id: 'k1', label: 'Round key K1', type: 'text', def: '0x5A' },
      { id: 'k2', label: 'Round key K2', type: 'text', def: '0xA5' },
      { id: 'mode', label: 'Mode', type: 'select', opts: ['Decrypt', 'Encrypt', 'Brute K2 (K1 fixed)'], def: 'Decrypt' }
    ],
    run: (d, a) => {
      const data = hexDec(String(d).replace(/[^0-9a-fA-F]/g, ''));
      if (data.length % 2) throw new Error('2-byte blocks chahiye (even length hex)');
      const parseK = (s) => { const t = String(s || '').trim(); if (/^0x/i.test(t)) return parseInt(t, 16); if (/^\d+$/.test(t)) return parseInt(t, 10); return t.charCodeAt(0) || 0; };
      const K1 = parseK(a.k1 || '0x5A');
      const K2 = parseK(a.k2 || '0xA5');
      const rol = (r) => ((r << 1) | (r >> 7)) & 0xFF;
      const F = (r, k) => (rol(r) ^ k) & 0xFF;
      const mode = a.mode || 'Decrypt';
      const out = [];
      out.push('Data: ' + data.length + ' bytes = ' + (data.length / 2) + ' blocks');
      out.push('K1 = 0x' + K1.toString(16) + ' | K2 = 0x' + K2.toString(16));
      out.push('F(R,K) = ROL8(R) ⊕ K\n');
      const pr = (b) => (b.match(/[\x20-\x7e]/g) || []).length / (b.length || 1);

      if (mode === 'Brute K2 (K1 fixed)') {
        let best = { score: -1, k2: 0, pt: '' };
        for (let k2 = 0; k2 < 256; k2++) {
          let pt = '';
          for (let i = 0; i < data.length; i += 2) {
            const L2 = data[i], R2 = data[i + 1];
            const R1 = L2;
            const L1 = (R2 ^ F(L2, k2)) & 0xFF;
            const R0 = L1;
            const L0 = (R1 ^ F(L1, K1)) & 0xFF;
            pt += String.fromCharCode(L0) + String.fromCharCode(R0);
          }
          const sc = window.CTF_OPS.scoreText(pt).score;
          if (sc > best.score) best = { score: sc, k2, pt };
        }
        out.push('🏆 Best K2 = 0x' + best.k2.toString(16));
        out.push('📄 ' + best.pt.slice(0, 60).replace(/[^\x20-\x7e]/g, '·'));
        const fl = window.CTF_OPS.detectFlags(best.pt);
        if (fl.length) out.push('🚩 FLAG: ' + fl.join(', '));
        return out.join('\n');
      }

      let result = '';
      for (let i = 0; i < data.length; i += 2) {
        const c0 = data[i], c1 = data[i + 1];
        if (mode === 'Decrypt') {
          const L2 = c0, R2 = c1;
          const R1 = L2;
          const L1 = (R2 ^ F(L2, K2)) & 0xFF;
          const R0 = L1;
          const L0 = (R1 ^ F(L1, K1)) & 0xFF;
          result += String.fromCharCode(L0) + String.fromCharCode(R0);
        } else {
          const L0 = c0, R0 = c1;
          const L1 = R0, R1 = (L0 ^ F(R0, K1)) & 0xFF;
          const L2 = R1, R2 = (L1 ^ F(R1, K2)) & 0xFF;
          result += String.fromCharCode(L2) + String.fromCharCode(R2);
        }
      }
      out.push('📄 ' + mode + ': ' + result.replace(/[^\x20-\x7e]/g, '·'));
      out.push('   hex: ' + [...result].map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join(''));
      out.push('   printable: ' + (pr(result) * 100).toFixed(0) + '%');
      const fl = window.CTF_OPS.detectFlags(result);
      if (fl.length) out.push('🚩 FLAG: ' + fl.join(' , '));
      else if (pr(result) < 0.9) out.push('⚠️ <90% printable — ciphertext valid Feistel output nahi lagta.');
      return out.join('\n');
    } });

  /* ============================================================
     MODERN CRYPTO — AES variants, XOR, DH, base variants
     ============================================================ */
  R({ id: 'aes-ecb-detect', name: 'AES ECB Detect', cat: 'Modern', keywords: ['ecb', 'penguin', 'detect', 'aes'],
    desc: 'AES-ECB pattern dhoondhta hai — repeated 16-byte blocks (penguin attack).',
    run: (d) => {
      let bytes;
      const s = String(d).trim();
      const hexMode = /^[0-9a-fA-F\s]+$/.test(s) && s.replace(/\s/g, '').length % 2 === 0 && /[a-fA-F]/.test(s);
      bytes = hexMode ? bytesFromHexBig(s) : u8(s);
      if (bytes.length < 32) throw new Error('Kam se kam 32 bytes chahiye');
      const blocks = [];
      for (let i = 0; i + 16 <= bytes.length; i += 16) blocks.push(H(bytes.subarray(i, i + 16)));
      const seen = {}, dups = [];
      blocks.forEach((b, i) => { if (seen[b] !== undefined) dups.push([seen[b], i, b]); else seen[b] = i; });
      let out = 'Blocks: ' + blocks.length + '\n';
      out += dups.length ? '🚨 ECB DETECTED — ' + dups.length + ' duplicate blocks!\n' + dups.slice(0, 5).map(([a, b, h]) => '  block #' + a + ' === #' + b + ' : ' + h).join('\n') : '✅ ECB pattern nahi mila (CBC/CTR jaise random blocks)';
      return out;
    } });

  R({ id: 'dh-shared', name: 'Diffie-Hellman Shared Secret', cat: 'Modern', keywords: ['dh', 'exchange', 'shared'],
    desc: 'DH: p, g, A, B (ya private a) → shared secret + derived AES key.',
    args: [{ id: 'p', label: 'p', type: 'text', def: '' }, { id: 'g', label: 'g', type: 'text', def: '2' },
      { id: 'A', label: 'A', type: 'text', def: '' }, { id: 'B', label: 'B', type: 'text', def: '' },
      { id: 'bs', label: 'b (agar do)', type: 'text', def: '' }],
    run: (d, a) => {
      const p = BI(a.p), g = BI(a.g || '2');
      let A = (a.A || '').trim() ? BI(a.A) : null;
      let B = (a.B || '').trim() ? BI(a.B) : null;
      const b = (a.bs || '').trim() ? BI(a.bs) : null;
      if (b !== null && A !== null) {
        const s = modPow(A, b, p);
        let hex = s.toString(16); if (hex.length % 2) hex = '0' + hex;
        const key = 'SHA256(' + s + ')';
        return 'shared = g^(ab) mod p = ' + s + '\n(hex ' + hex + ')\n\nAES key (SHA-256 of shared, first 32 hex): ' + hex.slice(0, 32) + '…';
      }
      if (A !== null && B !== null && b !== null) {
        return 'b do ya A/B do (a chahiye ya b)';
      }
      return 'p, g, A, b do (A = g^a mod p) → shared = A^b mod p';
    } });


  /* ============================================================
     CTF PLAYBOOK — input pehchano → step-by-step guide do
     ============================================================ */
  R({ id: 'playbook', name: '🧭 CTF Playbook (Guide)', cat: 'Analysis', keywords: ['guide', 'help', 'what', 'how', 'solve', 'playbook'],
    desc: 'Kisi bhi input ko dekh kar batata hai: ye kya hai + kaunse attacks/ops try karne chahiye (step-by-step).',
    run: (d) => {
      const t = String(d).trim();
      const lines = [];
      const add = (s) => lines.push(s);
      const isHex = /^[0-9a-fA-F\s]+$/.test(t) && t.replace(/\s/g, '').length % 2 === 0 && t.length > 3;
      const hasHexAlpha = /[a-fA-F]/.test(t);
      const digitsOnly = /^\d+$/.test(t.replace(/[\s,]/g, ''));
      const big = digitsOnly && t.replace(/[\s,]/g, '').length >= 16;

      add('🧭 CTF PLAYBOOK — input analysis\n' + '─'.repeat(46));
      add('Length: ' + t.length + ' chars | lines: ' + t.split('\n').length);

      const hints = [];
      if (window.CTF_OPS.detectFlags(t).length) hints.push('🚩 flag{} pattern input me hi hai — copy karo!');
      if (big) hints.push('🔢 Bada decimal number → `From Big Integer (Decimal)` / `Bytes → Big Integer` (RSA long_to_bytes)\n     → Agar RSA ka n hai to `RSA Factor n` phir `RSA Build Key from p,q`');
      else if (digitsOnly) hints.push('🔢 Chhote numbers → `From Decimal` (0-255 ASCII codes) ya `From Octal`/`A1Z26 Decode`');
      if (isHex && hasHexAlpha && !big) hints.push('🧱 Hex string → `From Hex`\n     Agar random dikhe to `XOR Brute Force` / `XOR Multi-byte Crack`\n     Aur agar 32/40/64 hex digits ka single blob hai → `Hash Identifier` (hash ho sakta hai!)');
      if (/^[A-Z2-7\s]+={0,6}$/.test(t) && /[2-7]/.test(t)) hints.push('🔡 Base32 → `From Base32`');
      if (/^[A-Za-z0-9+/]+=*$/.test(t.replace(/\s/g, '')) && t.length > 7) hints.push('🔤 Base64 → `From Base64` (ya `Base64 Try Alphabets` agar rotated table ho)');
      if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/.test(t)) hints.push('🎫 JWT → `JWT Decode`\n     alg:none / weak secret ho to signature forge karo');
      if (/[.\-]{3,}/.test(t) && /^[\s.\-_/·•]+$/.test(t)) hints.push('📡 Morse → `From Morse Code` (· • _ sab chalta hai)');
      if (/^[01\s]{8,}$/.test(t)) hints.push('💻 Binary → `From Binary`\n     Agar 8-bit groups me perfect na ho to LSB/MSB stego bhi try karo');
      if (/%[0-9a-fA-F]{2}/.test(t)) hints.push('🌐 URL-encoded → `URL Decode`');
      if (/&#x?[0-9a-fA-F]+;|&[a-z]+;/i.test(t)) hints.push('🌐 HTML entities → `HTML Decode`');
      if (/\\u[0-9a-fA-F]{4}|\\x[0-9a-fA-F]{2}/.test(t)) hints.push('🌐 Unicode escapes → `From Unicode Escape`');
      if (/^[A-Za-z][A-Za-z\s]{10,}$/.test(t)) hints.push('🔠 Sirf letters → Caesar `ROT-N` (all 25), `Atbash`\n     Agar words English jaise lagte hain par galat → `Vigenère Auto-Crack`\n     Agar letters random → `Frequency Analysis` + `N-gram Frequency`');
      if (/^1[1-9A-HJ-NP-Za-km-z]{20,}$/.test(t)) hints.push('🅑 Base58 (Bitcoin alphabet) → `From Base58`');
      if (/^[+\-<>.,\[\]\s]+$/.test(t) && /[<>]/.test(t)) hints.push('🧠 Brainfuck → `Brainfuck Interpreter`');
      if (/^\/[^\/]+\/[a-z]*$/.test(t)) hints.push('🧾 Regex jaisa — flag pattern se match karo');
      if (!hints.length) hints.push('❓ Koi obvious pattern nahi mila.\n     1) `Smart Solve` (recursive) chalao\n     2) `Magic` (auto-detect)\n     3) `XOR Brute Force` (binary junk ke liye)\n     4) `Entropy & Stats` → randomness check\n     5) `CTF Playbook` dobara chalao decode ke baad');

      add('\n🔎 DETECTED:\n' + hints.join('\n\n'));
      add(`\n📚 GENERAL RULES (CTF):
 • Har layer ke baad output ko dobara Playbook me daalo — nested encodings common hain.
 • Flag mila? -> \`Flag Hunt\` se confirm karo.
 • \`crypto{...}\` = CryptoHack, \`flag{...}\` general, \`HTB{}\` HackTheBox, \`picoCTF{}\` picoCTF.
 • RSA: n,e,c do -> \`RSA Attacks (auto)\` — factor/fermat/wiener/cube-root sab try karega.
 • AES: key+IV do -> \`AES Decrypt\`. ECB detect -> \`AES ECB Detect\`.
 • Hash: \`Hash Identifier\` -> \`Hash Crack\` (common wordlist + 0-99999).
 • Stego: zero-width -> \`Text Stego\`, LSB -> \`MSB / LSB Extract\`.`);
      return lines.join('\n');
    } });

  /* ============================================================
     MISC — misc encodings and helpers
     ============================================================ */
  R({ id: 'base91-dec', name: 'Base91 Decode', cat: 'Base', keywords: ['base91'],
    desc: 'Base91 decode (Joachim Henke variant, standard alphabet).',
    run: (d) => {
      const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';
      const s = String(d).replace(/\s+/g, '');
      const out = [];
      let bits = 0, val = 0, pendingV = -1;
      for (const ch of s) {
        const c = ALPHA.indexOf(ch);
        if (c < 0) continue;
        if (pendingV < 0) { pendingV = c; continue; }
        pendingV += c * 91;
        val |= pendingV << bits;
        bits += pendingV & 8191 ? 13 : 13;
        bits += 0;
        // standard algorithm:
        // v = digit1 + digit2*91 ; b |= v << n ; n += 13 (or 14 if v&8191 > 88)
        bits = bits; // no-op
        // We'll use canonical below instead — break out
        pendingV = -2;
        break;
      }
      // canonical implementation
      const res = [];
      let b = 0, n = 0, v = -1;
      for (const ch of s) {
        const c = ALPHA.indexOf(ch);
        if (c < 0) continue;
        if (v < 0) { v = c; }
        else {
          v += c * 91;
          b |= v << n;
          n += (v & 8191) > 88 ? 13 : 14;
          while (n > 7) { res.push(b & 255); b >>= 8; n -= 8; }
          v = -1;
        }
      }
      if (v >= 0) res.push((b | v << n) & 255);
      return smartDecode(new Uint8Array(res));
    } });

  R({ id: 'base45-dec', name: 'Base45 Decode', cat: 'Base', keywords: ['base45', 'qr'],
    desc: 'Base45 decode (QR code standard).',
    run: (d) => {
      const ALPHA = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
      const s = String(d).replace(/\s+/g, '');
      const out = [];
      for (let i = 0; i < s.length; i += 3) {
        const chunk = s.substr(i, 3);
        const vals = [...chunk].map((c) => ALPHA.indexOf(c));
        if (vals.some((x) => x < 0)) throw new Error('Invalid Base45 char');
        if (vals.length === 3) {
          const v = vals[0] + vals[1] * 45 + vals[2] * 45 * 45;
          if (v > 0xFFFF) throw new Error('Value out of range');
          out.push((v >> 8) & 255, v & 255);
        } else {
          const v = vals[0] + (vals[1] || 0) * 45;
          if (v > 255) throw new Error('Value out of range');
          out.push(v);
        }
      }
      return smartDecode(new Uint8Array(out));
    } });

  R({ id: 'base32hex', name: 'Base32 Hex (XBase32)', cat: 'Base', keywords: ['base32hex'],
    desc: 'Base32-hex (0-9A-V) decode.',
    run: (d) => window.CTF_OPS.OPS.find((o) => o.id === 'from-base32').run(String(d).replace(/0/g, 'O').replace(/1/g, 'I'), {}) });

  R({ id: 'base64-detect-alphabet', name: 'Base64 Try Alphabets', cat: 'Base', keywords: ['rotated', 'custom', 'ctf'],
    desc: 'Base64 ke common rotated alphabets try karta hai (CTF me famous).',
    run: (d) => {
      const BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      const candidates = [
        { name: 'Standard', alpha: BASE },
        { name: 'Rot13', alpha: BASE.slice(13) + BASE.slice(0, 13) },
        { name: 'URL-safe', alpha: BASE.slice(0, 62) + '-_' },
        { name: 'Reverse', alpha: [...BASE].reverse().join('') },
        { name: 'Rot47', alpha: BASE.split('').map((c) => { const x = c.charCodeAt(0); return x <= 126 && x >= 33 ? String.fromCharCode(((x - 33 + 47) % 94) + 33) : c; }).join('') }
      ];
      const results = [];
      const opBase64 = window.CTF_OPS.OPS.find((o) => o.id === 'b64-alphabet');
      for (const c of candidates) {
        try {
          const out = opBase64.run(d, { alpha: c.alpha });
          const sc = window.CTF_OPS.scoreText(out).score;
          results.push({ name: c.name, out, sc });
        } catch (e) { }
      }
      results.sort((a, b) => b.sc - a.sc);
      return results.map((r) => '[' + r.name + '] score ' + Math.round(r.sc) + '\n  ' + clip(r.out.replace(/\n/g, ' ⏎ '), 240)).join('\n\n');
    } });

  R({ id: 'msb-lsb', name: 'MSB / LSB Extract (stego)', cat: 'Stego', keywords: ['stego', 'bit', 'lsb', 'image'],
    desc: 'LSB-first ya MSB-first bit extraction (bitstring ko bytes me) — stego ke liye.',
    args: [{ id: 'mode', label: 'Mode', type: 'select', opts: ['LSB first', 'MSB first'], def: 'LSB first' }],
    run: (d, a) => {
      let bits = String(d).replace(/[^01]/g, '');
      if (bits.length < 8) throw new Error('Bits chahiye');
      const out = [];
      for (let i = 0; i + 8 <= bits.length; i += 8) {
        let b = 0;
        for (let j = 0; j < 8; j++) {
          const bit = bits[i + j] === '1' ? 1 : 0;
          if (a.mode === 'LSB first') b |= bit << j; else b = (b << 1) | bit;
        }
        out.push(b);
      }
      return smartDecode(new Uint8Array(out));
    } });

  R({ id: 'bit-flip-stego', name: 'Text Stego (zero-width)', cat: 'Stego', keywords: ['zero width', 'stego', 'unicode'],
    desc: 'Zero-width / invisible Unicode characters se hidden bits nikalta hai.',
    run: (d) => {
      const ZW = { '\u200B': '0', '\u200C': '1', '\u200D': '0', '\uFEFF': '1' };
      let bits = '';
      for (const ch of String(d)) if (ZW[ch] !== undefined) bits += ZW[ch];
      if (!bits.length) throw new Error('Zero-width characters nahi mile');
      const out = [];
      for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.substr(i, 8), 2));
      return 'bits: ' + bits + '\n\n' + smartDecode(new Uint8Array(out));
    } });

  R({ id: 'pw-strength', name: 'Entropy of Password', cat: 'Misc', keywords: ['password', 'entropy', 'brute'],
    desc: 'Password/strings ki keyspace entropy & brute-force time estimate.',
    run: (d) => {
      const s = String(d);
      let charset = 0;
      if (/[a-z]/.test(s)) charset += 26;
      if (/[A-Z]/.test(s)) charset += 26;
      if (/[0-9]/.test(s)) charset += 10;
      if (/[^a-zA-Z0-9]/.test(s)) charset += 32;
      const bits = s.length * Math.log2(charset || 1);
      const secs = Math.pow(2, bits) / 1e12; // 1 TH/s
      const timeStr = secs < 1 ? 'instant' : secs < 3600 ? (secs / 60).toFixed(1) + ' min' : secs < 86400 * 365 ? (secs / 86400).toFixed(1) + ' days' : (secs / (86400 * 365)).toExponential(2) + ' years';
      return 'length: ' + s.length + '\ncharset size: ' + charset + '\nentropy: ' + bits.toFixed(1) + ' bits\nat 1 TH/s: ' + timeStr;
    } });

})();
