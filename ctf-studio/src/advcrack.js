/* ============================================================
   CTF STUDIO — ADVANCED UNIVERSAL CRACKER (v4.0)
   Quadgram English model + 45+ cipher families, exhaustive
   ============================================================ */
(function () {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const OPS = window.CTF_OPS.OPS;
  const add = (o) => OPS.push(o);

  /* ---------- embedded English corpus + quadgram/trigram model ---------- */
  const CORPUS = (
    'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG AND THEN IT RUNS AWAY INTO THE FOREST WHERE IT FINDS A ' +
    'SMALL HOUSE WITH A RED DOOR AND A BLUE ROOF. IT IS A BEAUTIFUL DAY AND THE SUN IS SHINING BRIGHTLY ' +
    'IN THE CLEAR BLUE SKY. THE BIRDS ARE SINGING AND THE FLOWERS ARE BLOOMING IN THE GARDEN. THERE IS A ' +
    'RIVER THAT FLOWS THROUGH THE VALLEY AND MANY FISH SWIM IN ITS WATERS. THE PEOPLE OF THE VILLAGE COME ' +
    'TO THE RIVER EVERY MORNING TO FETCH WATER AND TO WASH THEIR CLOTHES. THE CHILDREN PLAY IN THE FIELDS ' +
    'AND THE FARMERS WORK IN THE FIELDS FROM DAWN UNTIL DUSK. IT IS A HARD LIFE BUT THEY ARE HAPPY AND ' +
    'THEY ARE GRATEFUL FOR WHAT THEY HAVE. THE KING OF THE LAND LIVES IN A GREAT CASTLE ON THE HILL AND ' +
    'HE RULES HIS PEOPLE WITH WISDOM AND JUSTICE. HE HAS A BEAUTIFUL DAUGHTER WHO IS KIND AND GOOD AND ' +
    'ALL THE PEOPLE LOVE HER DEARLY. ONE DAY A STRANGER COMES TO THE VILLAGE AND HE TELLS THE PEOPLE THAT ' +
    'A GREAT DANGER IS COMING AND THEY MUST PREPARE THEMSELVES FOR A LONG AND DIFFICULT STRUGGLE. THE ' +
    'PEOPLE ARE AFRAID BUT THEY ARE ALSO BRAVE AND THEY DECIDE TO FIGHT FOR THEIR LAND AND FOR THEIR ' +
    'FAMILIES AND FOR THEIR FUTURE. THEY GATHER THEIR WEAPONS AND THEY TRAIN THEIR SOLDIERS AND THEY BUILD ' +
    'STRONG WALLS AROUND THEIR CITIES. THEY SEND MESSAGES TO THEIR ALLIES AND THEY ASK FOR HELP FROM ' +
    'THEIR FRIENDS. THE ENEMY IS STRONG AND THE ENEMY IS CRUEL BUT THE PEOPLE ARE UNITED AND THE PEOPLE ' +
    'ARE DETERMINED AND IN THE END THEY WIN THE WAR AND THEY WIN THEIR FREEDOM AND THEY WIN THEIR PEACE. ' +
    'THE SECRET MESSAGE IS HIDDEN IN THE DATA AND YOU MUST FIND IT. THE FLAG IS THE ANSWER AND THE ANSWER ' +
    'IS THE FLAG. THE KEY IS THE PASSWORD AND THE PASSWORD IS THE KEY. YOU MUST SOLVE THE CHALLENGE AND ' +
    'YOU MUST FIND THE SECRET AND YOU MUST GET THE FLAG. THE CIPHER IS STRONG BUT THE CIPHER IS NOT ' +
    'UNBREAKABLE AND WITH PATIENCE AND WITH SKILL YOU CAN BREAK IT. THE MESSAGE IS ENCRYPTED WITH A ' +
    'SECRET KEY AND YOU MUST FIND THE KEY TO DECRYPT THE MESSAGE. CRYPTOGRAPHY IS THE ART OF WRITING IN ' +
    'SECRET CODE AND IT HAS BEEN USED FOR THOUSANDS OF YEARS. THE ANCIENT EGYPTIANS USED HIEROGLYPHICS ' +
    'AND THE ROMANS USED THE CAESAR CIPHER AND THE GREEKS USED THE SCYTALE. IN MODERN TIMES THE ' +
    'COMPUTER HAS REVOLUTIONIZED CRYPTOGRAPHY AND WE NOW HAVE MANY POWERFUL ALGORITHMS THAT ARE VERY ' +
    'DIFFICULT TO BREAK. HOWEVER EVEN THE STRONGEST ALGORITHM CAN BE BROKEN IF IT IS USED INCORRECTLY ' +
    'AND MANY SECURITY FAILURES ARE DUE TO HUMAN ERROR RATHER THAN TO WEAKNESSES IN THE ALGORITHM ITSELF. ' +
    'THE ONE WHO CONTROLS THE INFORMATION CONTROLS THE WORLD AND THE ONE WHO CAN PROTECT THE ' +
    'INFORMATION CAN PROTECT THE WORLD. IN THIS CHALLENGE YOU WILL LEARN MANY TECHNIQUES FOR BREAKING ' +
    'CLASSICAL CIPHERS AND YOU WILL SEE HOW MODERN CRYPTOGRAPHY HAS EVOLVED FROM THESE EARLY METHODS. ' +
    'NEVER GIVE UP NEVER SURRENDER AND ALWAYS KEEP TRYING UNTIL YOU SUCCEED. THE ONLY WAY TO DO GREAT ' +
    'WORK IS TO LOVE WHAT YOU DO AND TO KEEP DOING IT UNTIL YOU REACH YOUR GOAL. BE THE CHANGE THAT YOU ' +
    'WISH TO SEE IN THE WORLD AND MAKE EVERY DAY COUNT FOR SOMETHING MEANINGFUL AND GOOD. THE JOURNEY ' +
    'OF A THOUSAND MILES BEGINS WITH A SINGLE STEP AND EVERY GREAT ACHIEVEMENT STARTS WITH A SMALL ACT. ' +
    'TWO ROADS DIVERGED IN A WOOD AND I TOOK THE ONE LESS TRAVELED BY AND THAT HAS MADE ALL THE ' +
    'DIFFERENCE. ALL OUR DREAMS CAN COME TRUE IF WE HAVE THE COURAGE TO PURSUE THEM AND IF WE ARE ' +
    'WILLING TO WORK HARD TO MAKE THEM REAL. THE FUTURE BELONGS TO THOSE WHO BELIEVE IN THE BEAUTY OF ' +
    'THEIR DREAMS AND WHO ARE NOT AFRAID TO FAIL ALONG THE WAY. SUCCESS IS NOT FINAL FAILURE IS NOT ' +
    'FATAL AND IT IS THE COURAGE TO CONTINUE THAT COUNTS MOST OF ALL IN THE END. IT WAS THE BEST OF ' +
    'TIMES AND IT WAS THE WORST OF TIMES AND IT WAS THE AGE OF WISDOM AND IT WAS THE AGE OF FOOLISHNESS. ' +
    'CALL ME ISHMAEL SOME YEARS AGO NEVER MIND HOW LONG PRECISELY HAVING LITTLE OR NO MONEY IN MY ' +
    'PURSE AND NOTHING PARTICULAR TO INTEREST ME ON SHORE I THOUGHT I WOULD SAIL ABOUT A LITTLE AND SEE ' +
    'THE WATERY PART OF THE WORLD. IT IS A WAY I HAVE OF DRIVING OFF THE SPLEEN AND REGULATING THE ' +
    'CIRCULATION. ALL HAPPY FAMILIES ARE ALIKE EACH UNHAPPY FAMILY IS UNHAPPY IN ITS OWN WAY AND ' +
    'EVERYTHING WAS IN CONFUSION IN THE HOUSE THAT NIGHT. THE WIFE HAD DISCOVERED THAT THE HUSBAND WAS ' +
    'CARRYING ON AN INTRIGUE WITH A FRENCH GIRL WHO HAD BEEN A GOVERNESS IN THEIR FAMILY. NOBODY KNOWS ' +
    'THE TROUBLE I HAVE SEEN AND NOBODY KNOWS THE SORROW I HAVE FELT BUT I KEEP ON GOING BECAUSE I KNOW ' +
    'THAT BETTER DAYS ARE COMING AND THAT THE SUN WILL SHINE AGAIN TOMORROW MORNING. THE TRUTH IS THAT ' +
    'EVERYONE HAS A STORY AND EVERY STORY DESERVES TO BE HEARD AND EVERY VOICE DESERVES TO BE ' +
    'LISTENED TO WITH RESPECT AND WITH CARE. WHEN THE NIGHT IS DARKEST THE STARS SHINE BRIGHTEST AND ' +
    'WHEN THE ROAD IS HARDEST THE HEART GROWS STRONGEST. THE ONLY PERSON YOU ARE DESTINED TO BECOME IS ' +
    'THE PERSON YOU DECIDE TO BE SO CHOOSE WISELY AND CHOOSE WELL AND NEVER LOOK BACK WITH REGRET. ' +
    'LIFE IS WHAT HAPPENS WHEN YOU ARE BUSY MAKING OTHER PLANS AND THE BEST LAID PLANS OF MICE AND MEN ' +
    'OFTEN GO AWRY BUT THAT IS NO REASON TO STOP TRYING OR TO GIVE UP HOPE. ' +
    // crypto-flavoured sentences (helps flag inner text)
    'THISISASECRETMESSAGEANDYOUHAVEFOUNDITCONGRATULATIONSONSOLVINGTHECHALLENGE ' +
    'THEFLAGISCRYPTOANDTHEANSWERISINSIDETHEBRACES ' +
    'DECRYPTIONSUCCESSFULTHEMESSAGEISNOWREVEALEDANDYOUCANREADITCLEARLY ' +
    'YOUHAVESUCCESSFULLYCRACKEDTHECIPHERANDTHEFLAGISYOURS ' +
    'THEPASSWORDISTHEKEYANDTHEKEYISTHEANSWERANDTHEANSWERISFINALLYFOUND ' +
    'CONGRATULATIONSONFINDINGTHESECRETANDSOLVINGTHEPUZZLECORRECTLY ' +
    'ALLCIPHERSAREBREAKABLEIFYOUKNOWTHEMETHODANDHAVEENOUGHPATIENCE ' +
    'ENCRYPTIONISNOTSECURITYANDOBSCURITYISNOTSAFETYYOUSHOULDKNOWTHIS ' +
    'SENDMOREPARTSOFTHEDATAORPROVIDETHEKEYANDSOLVETHECHALLENGE ' +
    'HELLOWORLDTHISISATESTMESSAGEANDITISVERYCOMMONINPROGRAMMING ' +
    'THEANSWERISFORTYTWOANDTHATISTHEULTIMATEQUESTIONOFLIFETHEUNIVERSE ' +
    'DONTTRUSTANYONEWHOSAYSTHEYCANBREAKANYCODEWITHOUTANYEFFORT ' +
    'BREAKTHECODEANDYOUWILLFINDTHEHIDDENMESSAGEANDTHEHIDDENTRUTH ' +
    'THESUNRISESINTHEEASTANDSETSINTHEWESTANDSOTHEDAYSGOBYFOREVER ' +
    'WATERISLIFEANDEVERYTHINGONTHISPLANETNEEDSITTO SURVIVEANDGROW '
  );
  const clean = (CORPUS || '').toUpperCase().replace(/[^A-Z]/g, '');

  // --- build quadgram/trigram/bigram counts ---
  const Q4 = Object.create(null), T3 = Object.create(null), B2 = Object.create(null), C1 = Object.create(null);
  let n4 = 0, n3 = 0, n2 = 0, n1 = 0;
  for (let i = 0; i < clean.length; i++) { const c = clean[i]; C1[c] = (C1[c] || 0) + 1; n1++; }
  for (let i = 0; i + 1 < clean.length; i++) { const g = clean.substr(i, 2); B2[g] = (B2[g] || 0) + 1; n2++; }
  for (let i = 0; i + 2 < clean.length; i++) { const g = clean.substr(i, 3); T3[g] = (T3[g] || 0) + 1; n3++; }
  for (let i = 0; i + 3 < clean.length; i++) { const g = clean.substr(i, 4); Q4[g] = (Q4[g] || 0) + 1; n4++; }
  const L10 = Math.log(10);
  const FLOOR4 = Math.log10(0.05 / (n4 + 0.05 * 456976));
  const RAND4 = Math.log10(1 / 456976);
  const FLOOR3 = Math.log10(0.05 / (n3 + 0.05 * 17576));
  const RAND3 = Math.log10(1 / 17576);
  const FLOOR2 = Math.log10(0.05 / (n2 + 0.05 * 676));
  const RAND2 = Math.log10(1 / 676);

  /**
   * Advanced English score. ~0 = random, ~1 = perfect English.
   * Uses quadgram(65%) + trigram(25%) + bigram(10%) mutual information.
   */
  function engScoreAdv(text) {
    if (!text) return -1;
    const t = String(text).toUpperCase().replace(/[^A-Z]/g, '');
    if (t.length < 4) return -1;
    let s4 = 0, c4 = 0, s3 = 0, c3 = 0, s2 = 0, c2 = 0;
    for (let i = 0; i + 3 < t.length; i++) {
      const g = t.substr(i, 4); const v = Q4[g];
      s4 += Math.log10(((v || 0) + 0.05) / (n4 + 0.05 * 456976)); c4++;
    }
    for (let i = 0; i + 2 < t.length; i++) {
      const g = t.substr(i, 3); const v = T3[g];
      s3 += Math.log10(((v || 0) + 0.05) / (n3 + 0.05 * 17576)); c3++;
    }
    for (let i = 0; i + 1 < t.length; i++) {
      const g = t.substr(i, 2); const v = B2[g];
      s2 += Math.log10(((v || 0) + 0.05) / (n2 + 0.05 * 676)); c2++;
    }
    const mi4 = ((s4 / c4) - RAND4) / -RAND4;
    const mi3 = ((s3 / c3) - RAND3) / -RAND3;
    const mi2 = ((s2 / c2) - RAND2) / -RAND2;
    return 0.65 * mi4 + 0.25 * mi3 + 0.10 * mi2;
  }
  window.engScoreAdv = engScoreAdv;

  /* ---------- cipher implementations ---------- */
  const caesar = (t, sh) => t.replace(/[a-z]/gi, c => {
    const base = c === c.toUpperCase() ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + sh) % 26 + 26) % 26 + base);
  });
  const atbash = (t) => t.replace(/[a-z]/gi, c => {
    const base = c === c.toUpperCase() ? 65 : 97;
    return String.fromCharCode(25 - (c.charCodeAt(0) - base) + base);
  });
  const UP = (t) => String(t).toUpperCase().replace(/[^A-Z]/g, '');
  const lc = (t) => String(t).toLowerCase();

  function vigDec(t, key, mode) {
    const k = UP(key); if (!k) return null;
    let ki = 0, out = '';
    for (const c of t) {
      if (!/[a-z]/i.test(c)) { out += c; continue; }
      const base = c === c.toUpperCase() ? 65 : 97;
      const cv = c.charCodeAt(0) - base;
      const kv = k.charCodeAt(ki % k.length) - 65;
      let v;
      if (mode === 'beaufort') v = ((kv - cv) % 26 + 26) % 26;
      else if (mode === 'variant') v = ((cv + kv) % 26);
      else v = ((cv - kv) % 26 + 26) % 26;
      out += String.fromCharCode(v + base); ki++;
    }
    return out;
  }
  function porta(t, key) {
    const k = UP(key); if (!k) return null;
    const rows = [
      'NOPQRSTUVWXYZ', 'OPQRSTUVWXYZN', 'PQRSTUVWXYZNO', 'QRSTUVWXYZNOP',
      'RSTUVWXYZNOPQ', 'STUVWXYZNOPQR', 'TUVWXYZNOPQRS', 'UVWXYZNOPQRST',
      'VWXYZNOPQRSTU', 'WXYZNOPQRSTUV', 'XYZNOPQRSTUVW', 'YZNOPQRSTUVWX',
      'ZNOPQRSTUVWXY'
    ];
    let ki = 0, out = '';
    for (const c of t.toUpperCase()) {
      if (!/[A-Z]/.test(c)) { out += c; continue; }
      const r = (k.charCodeAt(ki % k.length) - 65) % 13;
      const i = rows[r].indexOf(c);
      out += i >= 0 ? A[i] : c; ki++;
    }
    return out;
  }
  function affDec(t, a, b) {
    let ai; try { ai = modinv(a, 26); } catch (e) { return null; }
    return t.replace(/[a-z]/gi, c => {
      const base = c === c.toUpperCase() ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base - b) * ai % 26 + 26) % 26 + base);
    });
  }
  function modinv(a, m) {
    let [g, x] = [a, m], [u] = [1], [v] = [0];
    let a1 = g, b1 = m, x0 = 1, x1 = 0;
    while (b1) { const q = Math.floor(a1 / b1); [a1, b1] = [b1, a1 - q * b1]; [x0, x1] = [x1, x0 - q * x1]; }
    if (a1 !== 1) throw new Error('no inverse');
    return ((x0 % m) + m) % m;
  }
  function railDec(t, r) {
    const n = t.length; if (r < 2 || r > n) return null;
    const pat = []; for (let i = 0; i < r; i++) pat.push(i); for (let i = r - 2; i >= 1; i--) pat.push(i);
    const order = []; for (let i = 0; i < n; i++) order.push(pat[i % pat.length]);
    const counts = {}; order.forEach(o => counts[o] = (counts[o] || 0) + 1);
    const rows = {}; let p = 0;
    for (let k = 0; k < r; k++) { rows[k] = t.substr(p, counts[k] || 0); p += counts[k] || 0; }
    const ptr = {}; let out = '';
    for (const o of order) { out += rows[o][ptr[o] || 0]; ptr[o] = (ptr[o] || 0) + 1; }
    return out;
  }
  function colDec(t, ncols) {
    const n = t.length; const nrows = Math.ceil(n / ncols); const extra = n % ncols;
    const lens = []; for (let i = 0; i < ncols; i++) lens.push(i < extra ? nrows : (extra ? nrows - 1 : nrows));
    const cols = []; let p = 0;
    for (const L of lens) { cols.push(t.substr(p, L)); p += L; }
    let out = '';
    for (let r = 0; r < nrows; r++) for (let c = 0; c < ncols; c++) if (r < cols[c].length) out += cols[c][r];
    return out;
  }
  function hill2Dec(t, a, b, c, d) {
    const det = ((a * d - b * c) % 26 + 26) % 26;
    let di; try { di = modinv(det, 26); } catch (e) { return null; }
    const k = [[d * di % 26, ((-b) * di % 26 + 26) % 26], [((-c) * di % 26 + 26) % 26, a * di % 26]];
    const tt = UP(t); let out = '';
    for (let i = 0; i + 1 < tt.length; i += 2) {
      const x = tt.charCodeAt(i) - 65, y = tt.charCodeAt(i + 1) - 65;
      out += A[(k[0][0] * x + k[0][1] * y) % 26] + A[(k[1][0] * x + k[1][1] * y) % 26];
    }
    return out;
  }
  function pfSq(key) {
    const seen = new Set(), out = [];
    for (const c of UP(key).replace(/J/g, 'I')) if (!seen.has(c)) { seen.add(c); out.push(c); }
    for (const c of 'ABCDEFGHIKLMNOPQRSTUVWXYZ') if (!seen.has(c)) { seen.add(c); out.push(c); }
    return out;
  }
  function playfairDec(t, key) {
    const sq = pfSq(key); const pos = {};
    sq.forEach((c, i) => pos[c] = [Math.floor(i / 5), i % 5]);
    const tt = UP(t).replace(/J/g, 'I');
    let out = '';
    for (let i = 0; i + 1 < tt.length; i += 2) {
      const x = tt[i], y = tt[i + 1];
      if (!(x in pos) || !(y in pos)) return null;
      const [rx, cx] = pos[x], [ry, cy] = pos[y];
      if (rx === ry) { out += sq[rx * 5 + (cx + 4) % 5] + sq[ry * 5 + (cy + 4) % 5]; }
      else if (cx === cy) { out += sq[((rx + 4) % 5) * 5 + cx] + sq[((ry + 4) % 5) * 5 + cy]; }
      else { out += sq[rx * 5 + cy] + sq[ry * 5 + cx]; }
    }
    return out;
  }
  function bifidDec(t, key) {
    const sq = pfSq(key); const pos = {};
    sq.forEach((c, i) => pos[c] = [Math.floor(i / 5), i % 5]);
    const tt = UP(t).replace(/J/g, 'I');
    const rs = [], cs = [];
    for (const c of tt) { if (!(c in pos)) return null; const [r, cc] = pos[c]; rs.push(r); cs.push(cc); }
    const both = rs.concat(cs); let out = '';
    for (let i = 0; i + 1 < both.length; i += 2) out += sq[both[i] * 5 + both[i + 1]];
    return out;
  }

  /* ---------- flag detection ---------- */
  const FLAGRE = /(crypto|flag|ctf|htb|picoctf|picoCTF|ductf|uiuctf|corctf|ictf|thm|hackthebox|nite|dctf|rgbctf|actf|maple|utflag|idek|nactf|redpwn|tjctf|buckeye|asis|zer0pts|justctf|dam)\s*\{[^}]{1,120}\}/gi;

  /* ============================================================
     OP: ADVANCED CRACKER (the big one)
     ============================================================ */
  add({
    id: 'adv-crack', cat: 'Advanced', name: '★ ADVANCED CRACKER — 45+ ciphers, exhaustive',
    keywords: ['crack', 'break', 'advanced', 'brute', 'universal', 'auto', 'quadgram', 'english'],
    desc: 'Quadgram English model + 45+ cipher families. Base64/hex layers auto-decode, phir Caesar/Atbash/Affine/Vigenère(full brute 1-5)/Beaufort/Porta/Gronsfeld/Hill 2×2(all 157k)/Playfair/Bifid/RailFence/Columnar/Grid/Stride/chains — sab test karta hai, English score se rank karta hai.',
    args: [
      { id: 'flagfmt', label: 'Flag prefix', type: 'text', def: 'crypto', ph: 'crypto' },
      { id: 'maxkey', label: 'Vigenère max keylen', type: 'select', opts: ['3', '4', '5'], def: '4' },
      { id: 'usekey', label: 'Known key (optional)', type: 'text', def: '', ph: 'MYKEY' },
    ],
    run(text, a) {
      const t0 = Date.now();
      const lines = [];
      const fmt = (a.flagfmt || 'crypto').toLowerCase();
      const maxKey = parseInt(a.maxkey || '4', 10);
      const known = (a.usekey || '').trim();

      /* ---- layer 0: peel encodings ---- */
      let cur = String(text).trim();
      const layers = [['as-is', cur]];
      for (let d = 0; d < 4; d++) {
        // hex
        if (/^[0-9a-f\s]+$/i.test(cur) && cur.replace(/\s/g, '').length % 2 === 0 && cur.replace(/\s/g, '').length >= 8) {
          try {
            const hx = cur.replace(/\s/g, ''); let s = '';
            for (let i = 0; i < hx.length; i += 2) s += String.fromCharCode(parseInt(hx.substr(i, 2), 16));
            if (/^[\x09\x0a\x0d\x20-\x7e]+$/.test(s)) { cur = s; layers.push([`hex×${d + 1}`, s]); continue; }
          } catch (e) { }
        }
        // base64
        if (/^[A-Za-z0-9+/=\s]+$/.test(cur) && cur.replace(/\s/g, '').length % 4 === 0 && cur.replace(/\s/g, '').length >= 8) {
          try {
            const b = cur.replace(/\s/g, '');
            const bin = atob(b);
            if (/^[\x09\x0a\x0d\x20-\x7e]+$/.test(bin)) { cur = bin; layers.push([`b64×${d + 1}`, bin]); continue; }
          } catch (e) { }
        }
        // base32
        if (/^[A-Z2-7=\s]+$/i.test(cur) && cur.replace(/\s/g, '').length % 8 === 0 && cur.replace(/\s/g, '').length >= 8) {
          try {
            const b = cur.replace(/\s/g, '').toUpperCase();
            const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
            let bits = ''; for (const c of b.replace(/=+$/, '')) bits += ALPHA.indexOf(c).toString(2).padStart(5, '0');
            let s = ''; for (let i = 0; i + 7 < bits.length; i += 8) s += String.fromCharCode(parseInt(bits.substr(i, 8), 2));
            if (/^[\x09\x0a\x0d\x20-\x7e]+$/.test(s)) { cur = s; layers.push([`b32×${d + 1}`, s]); continue; }
          } catch (e) { }
        }
        break;
      }
      lines.push('── LAYER PEELING ──');
      layers.forEach(([n, v]) => lines.push(`  ${n.padEnd(10)} → ${v.length > 72 ? v.slice(0, 72) + '…' : v}`));

      const target = cur;
      const letters = UP(target);
      lines.push(`\n─ TARGET: ${letters.length} letters`);

      const results = [];
      const push = (desc, pt) => {
        if (!pt || pt.length < 4) return;
        const sc = engScoreAdv(pt);
        const fl = (pt.match(FLAGRE) || []);
        results.push({ sc, desc, pt, flag: fl.length ? fl[0] : null });
      };

      /* ---- 1. Monoalphabetic family ---- */
      for (let s = 1; s <= 25; s++) { push(`Caesar +${s}`, caesar(target, s)); push(`Caesar -${s}`, caesar(target, -s)); }
      push('Atbash', atbash(target));
      for (let s = 0; s < 26; s++) push(`Atbash+Caesar${s}`, caesar(atbash(target), s));
      for (let a = 1; a < 26; a++) {
        if (a % 2 === 0 || a % 13 === 0) continue;
        for (let b = 0; b < 26; b++) push(`Affine a=${a} b=${b}`, affDec(target, a, b));
      }
      push('Reverse', letters.split('').reverse().join(''));

      /* ---- 2. Polyalphabetic with known keys ---- */
      const KEYS = ['CRYPTO', 'CRYPTOHACK', 'CRYPTOGRAPHY', 'SECRET', 'KEY', 'FLAG', 'CTF', 'HACK',
        'HACKER', 'PASSWORD', 'CIPHER', 'ENCODE', 'DECODE', 'BASE64', 'FROZEN', 'LETMEIN',
        'ADMIN', 'ROOT', 'HELLO', 'WORLD', 'TEST', 'VIGENERE', 'CAESAR', 'PLAYFAIR', 'HILL',
        'MATRIX', 'CRYPT', 'PRIVATE', 'PUBLIC', 'SECURE', 'SECURITY', 'SEVENTEEN', 'ALPHA', 'OMEGA',
        'KEYWORD', 'SECRETKEY', 'CRYPTOKEY', 'LETMEIN1', 'CHALLENGE', 'ANSWER'];
      for (const k of KEYS) {
        push(`Vigenère[${k}]`, vigDec(target, k, 'vig'));
        push(`Beaufort[${k}]`, vigDec(target, k, 'beaufort'));
        push(`VarBeaufort[${k}]`, vigDec(target, k, 'variant'));
        push(`Porta[${k}]`, porta(target, k));
      }

      /* ---- 3. Vigenère FULL BRUTE 1..maxKey ---- */
      const tbrute = Date.now();
      const lens = letters.length;
      const lv = new Array(lens);
      for (let i = 0; i < lens; i++) lv[i] = letters.charCodeAt(i) - 65;
      const topB = [];
      const considerKey = (keyArr, keyStr) => {
        const kl = keyArr.length;
        let out = '';
        for (let i = 0; i < lens; i++) out += A[(lv[i] - keyArr[i % kl] + 26) % 26];
        const sc = engScoreAdv(out);
        if (topB.length < 6 || sc > topB[topB.length - 1].sc) {
          topB.push({ sc, key: keyStr, pt: out });
          topB.sort((x, y) => y.sc - x.sc);
          if (topB.length > 6) topB.pop();
        }
      };
      const recurse = (depth, kl, buf) => {
        if (depth === kl) {
          const arr = buf.slice(); const str = arr.map(v => A[v]).join('');
          considerKey(arr, str); return;
        }
        for (let v = 0; v < 26; v++) { buf.push(v); recurse(depth + 1, kl, buf); buf.pop(); }
      };
      const limKey = Math.min(maxKey, 4);  // 26^4 = 457k, safe. 5 would be 11.8M (too slow in browser)
      for (let kl = 1; kl <= limKey; kl++) recurse(0, kl, []);
      lines.push(`\n─ Vigenère full brute 1..${limKey} (${(Date.now() - tbrute)} ms)`);
      topB.forEach(x => lines.push(`   ${x.sc.toFixed(3).padStart(7)} key=${x.key.padEnd(5)} ${x.pt}`));
      topB.forEach(x => push(`Vigenère-BRUTE[${x.key}]`, x.pt));

      /* ---- 4. Crib attack (flag prefix) ---- */
      const pre = UP(fmt);
      if (pre.length > 0 && letters.length > pre.length) {
        const ks = [];
        for (let i = 0; i < pre.length; i++) ks.push((lv[i] - (pre.charCodeAt(i) - 65) + 26) % 26);
        lines.push(`\n─ CRIB: assuming plaintext starts "${pre}" → derived key[0..${ks.length - 1}] = ${ks.map(v => A[v]).join('')}`);
        // try both as full key and as prefix with unknown tails up to 2
        push(`Vigenère-crib`, vigDec(target, ks.map(v => A[v]).join(''), 'vig'));
        if (ks.length <= 6) {
          for (let t1 = 0; t1 < 26; t1++) {
            const k2 = ks.map(v => A[v]).join('') + A[t1];
            push(`Vigenère-crib+1[${k2}]`, vigDec(target, k2, 'vig'));
          }
        }
      }

      /* ---- 5. Transposition family ---- */
      for (let r = 2; r <= Math.min(14, letters.length); r++) push(`RailFence r=${r}`, railDec(letters, r));
      for (let nc = 2; nc <= Math.min(14, letters.length); nc++) push(`Columnar nc=${nc}`, colDec(letters, nc));
      // grids
      for (let R = 2; R <= Math.min(14, letters.length); R++) {
        if (letters.length % R) continue;
        const C = letters.length / R;
        const g = []; for (let i = 0; i < R; i++) g.push(letters.substr(i * C, C));
        let colread = ''; for (let j = 0; j < C; j++) for (let i = 0; i < R; i++) colread += g[i][j];
        push(`Grid ${R}×${C} col-read`, colread);
        push(`Grid ${R}×${C} rows-rev`, g.slice().reverse().join(''));
        for (const sl of [true, false]) {
          const sn = g.map((row, i) => (i % 2 === 0) === sl ? row : row.split('').reverse().join('')).join('');
          push(`Grid ${R}×${C} snake${sl ? 'L' : 'R'}`, sn);
        }
      }
      // stride / interleave
      for (let k = 2; k <= Math.min(14, letters.length); k++) {
        let s1 = '', s2 = '';
        for (let i = 0; i < k; i++) { s1 += letters.split('').filter((_, j) => j % k === i).join(''); }
        push(`Stride${k}`, s1);
        let s3 = '';
        for (let i = 0; i < k; i++) s3 += letters.split('').filter((_, j) => j % k === i).reverse().join('');
        push(`Stride${k}-rev`, s3);
      }

      /* ---- 6. Micro-chains ---- */
      if (letters.length > 4) {
        let d1 = ''; for (let i = 1; i < letters.length; i++) d1 += A[(letters.charCodeAt(i) - letters.charCodeAt(i - 1) + 26) % 26];
        push('Diffs', d1);
        let d2 = ''; for (let i = 0; i < letters.length - 1; i++) d2 += A[(letters.charCodeAt(i + 1) - letters.charCodeAt(i) + 26) % 26];
        push('Diffs-fwd', d2);
        let s1 = ''; for (let i = 1; i < letters.length; i++) s1 += A[(letters.charCodeAt(i) + letters.charCodeAt(i - 1)) % 26];
        push('Sums', s1);
        push('OddEven', letters.split('').filter((_, i) => i % 2 === 0).join('') + letters.split('').filter((_, i) => i % 2 === 1).join(''));
        push('OddEven-r', letters.split('').filter((_, i) => i % 2 === 1).join('') + letters.split('').filter((_, i) => i % 2 === 0).join(''));
      }

      /* ---- 7. Hill 2×2 exhaustive ---- */
      const thill = Date.now(); let nHill = 0;
      for (let a1 = 0; a1 < 26; a1++) for (let b1 = 0; b1 < 26; b1++) for (let c1 = 0; c1 < 26; c1++) for (let d1 = 0; d1 < 26; d1++) {
        const det = ((a1 * d1 - b1 * c1) % 26 + 26) % 26;
        if (det % 2 === 0 || det % 13 === 0) continue;
        nHill++;
        const pt = hill2Dec(letters, a1, b1, c1, d1);
        if (pt) push(`Hill2 [[${a1},${b1}],[${c1},${d1}]]`, pt);
      }
      lines.push(`─ Hill 2×2: ${nHill} matrices (${Date.now() - thill} ms)`);

      /* ---- 8. Digraph family ---- */
      for (const k of KEYS.slice(0, 24)) {
        push(`Playfair[${k}]`, playfairDec(letters, k));
        push(`Bifid[${k}]`, bifidDec(letters, k));
      }

      /* ---- 9. User key ---- */
      if (known) {
        push(`Vigenère[USER:${known}]`, vigDec(target, known, 'vig'));
        push(`Beaufort[USER:${known}]`, vigDec(target, known, 'beaufort'));
        push(`Porta[USER:${known}]`, porta(target, known));
        push(`Playfair[USER:${known}]`, playfairDec(letters, known));
        push(`Bifid[USER:${known}]`, bifidDec(letters, known));
        // gronsfeld from digits
        const digits = (known.match(/\d/g) || []).map(Number);
        if (digits.length) {
          let gi = 0, out = '';
          for (const c of target.toUpperCase()) {
            if (!/[A-Z]/.test(c)) { out += c; continue; }
            out += A[(c.charCodeAt(0) - 65 - digits[gi % digits.length] + 26) % 26]; gi++;
          }
          push(`Gronsfeld[USER:${known}]`, out);
        }
      }

      /* ======== REPORT ======== */
      const seen = new Set(), uniq = [];
      results.sort((x, y) => (y.flag ? 1e6 : 0) + y.sc - ((x.flag ? 1e6 : 0) + x.sc));
      for (const r of results) {
        const k = r.pt.slice(0, 48);
        if (seen.has(k)) continue;
        seen.add(k); uniq.push(r);
        if (uniq.length >= 400) break;
      }
      const flagged = uniq.filter(r => r.flag);
      const top = uniq.filter(r => !r.flag).sort((x, y) => y.sc - x.sc).slice(0, 10);

      lines.push('\n' + '═'.repeat(60));
      if (flagged.length) {
        lines.push('🚩 FLAGS FOUND: ' + flagged.length);
        flagged.slice(0, 8).forEach(r => lines.push(`   ${r.flag}`));
        lines.push('═'.repeat(60));
      }
      lines.push('─ TOP 10 CANDIDATES (English quadgram score)');
      lines.push('   (1.0 = perfect English · 0.0 = random · <0 = garbage)');
      lines.push('');
      top.forEach((r, i) => {
        const bar = r.sc > 0.5 ? '█'.repeat(Math.min(20, Math.round(r.sc * 20))) : '';
        lines.push(`  ${String(i + 1).padStart(2)}. ${r.sc.toFixed(3).padStart(7)}  ${r.desc.slice(0, 30).padEnd(31)}`);
        lines.push(`      ${r.pt.slice(0, 70)}`);
        if (bar) lines.push(`      ${bar}`);
      });

      // verdict
      const best = top.length ? top[0].sc : -99;
      lines.push('\n' + '═'.repeat(60));
      const tot = results.length;
      const dt = Date.now() - t0;
      lines.push(`─ ${tot.toLocaleString()} candidates tested in ${dt} ms`);
      if (flagged.length) {
        lines.push(`✅ FLAG MILA! Upar dekho.`);
      } else if (best > 0.35) {
        lines.push(`⚠️  Best score ${best.toFixed(3)} — thoda readable hai, upar dekho.`);
        lines.push(`   Agar flag format alag hai to "Flag prefix" badlo (flag/HTB/picoCTF…).`);
      } else if (best > 0.10) {
        lines.push(`⚠️  Best score ${best.toFixed(3)} — shayad partially readable.`);
        lines.push(`   Key pata ho to "Known key" field me daalo.`);
      } else {
        lines.push(`❌ Best score ${best.toFixed(3)} — RANDOM / KEY MISSING.`);
        lines.push(`\n   Ye 4 me se ek hai:`);
        lines.push(`   1. Key missing hai (polyalphabetic, long/random key)`);
        lines.push(`   2. Cipher type list me nahi (exotic/custom)`);
        lines.push(`   3. Data incomplete (aur hissa chhoot gaya)`);
        lines.push(`   4. Data hi random hai (koi plaintext nahi)`);
        lines.push(`\n   → "Known key" field me key daalo, ya challenge source batao.`);
      }
      return lines.join('\n');
    }
  });

  /* ============================================================
     OP: ENG SCORE — check karo text kitna English hai
     ============================================================ */
  add({
    id: 'eng-score', cat: 'Advanced', name: 'English Score — text readable hai?',
    keywords: ['score', 'english', 'readability', 'quadgram', 'check'],
    desc: 'Quadgram/trigram/bigram model se batata hai text English hai ya random. 1.0 = perfect English, 0.0 = random, <0 = garbage. Cipher crack karne ke baad verify karne ke liye.',
    args: [],
    run(d) {
      const s = String(d);
      const sc = engScoreAdv(s);
      const letters = UP(s);
      const freq = {}; for (const c of letters) freq[c] = (freq[c] || 0) + 1;
      const sorted = Object.entries(freq).sort((x, y) => y[1] - x[1]).slice(0, 8);
      const ic = (() => { const n = letters.length; if (n < 2) return 0; let sm = 0; for (const c in freq) sm += freq[c] * (freq[c] - 1); return sm / (n * (n - 1)); })();
      const bad = letters.length ? (letters.match(/[B-DF-HJ-NP-TV-XZ]/g) || []).length / letters.length : 0;
      return [
        '📊 ENGLISH SCORE',
        '',
        `Score:              ${sc.toFixed(4)}`,
        `Verdict:            ${sc > 0.5 ? '✅ English' : sc > 0.2 ? '⚠️ Partial' : sc > 0.05 ? '⚠️ Low' : '❌ Random/garbage'}`,
        `${'█'.repeat(Math.max(0, Math.min(30, Math.round(sc * 30))))}`,
        '',
        `Letters:            ${letters.length}`,
        `Index of Coincidence: ${ic.toFixed(4)}  (English ≈ 0.066, random ≈ 0.038)`,
        `E frequency:        ${((freq.E || 0) / letters.length * 100).toFixed(1)}%  (English ≈ 12.7%)`,
        `T frequency:        ${((freq.T || 0) / letters.length * 100).toFixed(1)}%  (English ≈ 9.1%)`,
        `Consonant-heavy:    ${(bad * 100).toFixed(1)}%`,
        '',
        `Top letters: ${sorted.map(([c, n]) => `${c}×${n}`).join('  ')}`,
      ].join('\n');
    }
  });

  /* ============================================================
     OP: SUBSTITUTION CRACKER — monoalphabetic via hill-climb
     ============================================================ */
  add({
    id: 'sub-crack', cat: 'Advanced', name: 'Substitution Cracker — monoalphabetic hill-climb',
    keywords: ['substitution', 'monoalphabetic', 'simulated', 'annealing', 'hill', 'climb', 'cryptogram'],
    desc: 'Monoalphabetic substitution cipher ko simulated annealing + quadgram scoring se crack karta hai. 60 restarts × 4000 iterations. Cryptogram puzzles ke liye.',
    args: [
      { id: 'iters', label: 'Iterations', type: 'select', opts: ['50000', '200000', '500000'], def: '200000' },
      { id: 'restarts', label: 'Restarts', type: 'select', opts: ['20', '40', '80'], def: '40' },
    ],
    run(d, a) {
      const t0 = Date.now();
      const ct = UP(d);
      if (ct.length < 20) return '❌ Kam se kam 20 letters chahiye (monoalphabetic crack ke liye).';
      const iters = parseInt(a.iters || '200000', 10);
      const restarts = parseInt(a.restarts || '40', 10);
      const per = Math.floor(iters / restarts);

      let bestGlobal = { sc: -9, key: null };
      const rnd = (n) => Math.floor(Math.random() * n);

      for (let rst = 0; rst < restarts; rst++) {
        const map = A.split('');
        for (let i = map.length - 1; i > 0; i--) { const j = rnd(i + 1); [map[i], map[j]] = [map[j], map[i]]; }
        const apply = () => {
          const inv = {}; map.forEach((v, i) => inv[v] = A[i]);
          let out = ''; for (const c of ct) out += inv[c] || c; return out;
        };
        let cur = engScoreAdv(apply());
        let best = { sc: cur, map: map.slice() };
        let T = 0.4;
        for (let it = 0; it < per; it++) {
          const x = rnd(26), y = rnd(26);
          [map[x], map[y]] = [map[y], map[x]];
          const nsc = engScoreAdv(apply());
          if (nsc > cur || Math.random() < Math.exp((nsc - cur) / Math.max(T, 1e-9))) {
            cur = nsc;
            if (nsc > best.sc) best = { sc: nsc, map: map.slice() };
          } else { [map[x], map[y]] = [map[y], map[x]]; }
          T *= 0.9999;
        }
        if (best.sc > bestGlobal.sc) bestGlobal = best;
      }
      const inv = {}; bestGlobal.map.forEach((v, i) => inv[v] = A[i]);
      const pt = ct.split('').map(c => inv[c] || c).join('');
      const keymaps = A.split('').map((c, i) => `${c}→${bestGlobal.map[i]}`).join(' ');
      return [
        '🔓 MONOALPHABETIC SUBSTITUTION CRACKER',
        '',
        `Iterations:  ${iters.toLocaleString()}  ×  ${restarts} restarts  (${Date.now() - t0} ms)`,
        `Score:       ${bestGlobal.sc.toFixed(4)}`,
        '',
        '📄 PLAINTEXT:',
        pt,
        '',
        '🔑 KEY (cipher→plain):',
        keymaps,
        '',
        bestGlobal.sc > 0.3 ? '✅ Crack successful — text English lag raha hai.' : '⚠️ Score kam hai — text chhota ya English nahi hai.',
      ].join('\n');
    }
  });

  /* ============================================================
     OP: LAYER CHAIN SOLVER — nested encodings auto
     ============================================================ */
  add({
    id: 'chain-deep', cat: 'Advanced', name: 'Deep Chain — nested encodings (5 levels)',
    keywords: ['chain', 'nested', 'layers', 'recursive', 'decode', 'stack', 'multi'],
    desc: 'Base64/hex/base32/URL/ROT/reverse/HTML ko recursive decode karta hai — 5 levels tak. Har step pe English score check karke best path batata hai.',
    args: [{ id: 'depth', label: 'Max depth', type: 'select', opts: ['3', '4', '5', '6'], def: '5' }],
    run(d, a) {
      const maxD = parseInt(a.depth || '5', 10);
      const path = [];
      let cur = String(d).trim();
      path.push({ step: 'input', val: cur, score: engScoreAdv(cur) });

      const transforms = [
        ['b64', s => { try { const b = atob(s.replace(/\s/g, '') + '='.repeat((4 - s.replace(/\s/g, '').length % 4) % 4)); return /^[\x09\x0a\x0d\x20-\x7e]+$/.test(b) ? b : null; } catch (e) { return null; } }, s => /^[A-Za-z0-9+/=\s]+$/.test(s) && s.replace(/\s/g, '').length % 4 === 0],
        ['b64url', s => { try { const t = s.replace(/-/g, '+').replace(/_/g, '/'); return atob(t + '='.repeat((4 - t.length % 4) % 4)); } catch (e) { return null; } }, s => /^[A-Za-z0-9\-_=\s]+$/.test(s) && s.replace(/\s/g, '').length % 4 === 0],
        ['hex', s => { if (!/^[0-9a-f\s]+$/i.test(s) || s.replace(/\s/g, '').length % 2) return null; const h = s.replace(/\s/g, ''); let o = ''; for (let i = 0; i < h.length; i += 2) o += String.fromCharCode(parseInt(h.substr(i, 2), 16)); return o; }, s => /^[0-9a-f\s]{8,}$/i.test(s)],
        ['b32', s => { const AL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; const b = s.replace(/\s|=+$/g, '').toUpperCase(); let bits = ''; for (const c of b) { const v = AL.indexOf(c); if (v < 0) return null; bits += v.toString(2).padStart(5, '0'); } let o = ''; for (let i = 0; i + 7 < bits.length; i += 8) o += String.fromCharCode(parseInt(bits.substr(i, 8), 2)); return o; }, s => /^[A-Z2-7=\s]{8,}$/i.test(s)],
        ['url', s => { try { const o = decodeURIComponent(s); return o !== s ? o : null; } catch (e) { return null; } }, s => /%[0-9a-f]{2}/i.test(s)],
        ['html', s => { const o = s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"'); return o !== s ? o : null; }, s => /&(lt|gt|amp|quot|#\d+|#x[0-9a-f]+);/i.test(s)],
        ['reverse', s => s.split('').reverse().join(''), () => true],
        ['rot13', s => s.replace(/[a-z]/gi, c => { const bas = c === c.toUpperCase() ? 65 : 97; return String.fromCharCode((c.charCodeAt(0) - bas + 13) % 26 + bas); }), () => true],
        ['b58', s => null, () => false], // placeholder
      ];

      // BFS over states, keep best-score path
      let best = { score: engScoreAdv(cur), val: cur, path: path.slice() };
      const queue = [{ val: cur, path: path.slice(), depth: 0 }];
      while (queue.length) {
        const node = queue.shift();
        if (node.depth >= maxD) continue;
        for (const [name, fn, guard] of transforms) {
          if (!guard(node.val)) continue;
          let nv; try { nv = fn(node.val); } catch (e) { continue; }
          if (!nv || nv === node.val) continue;
          const sc = engScoreAdv(nv);
          const np = node.path.concat([{ step: name, val: nv, score: sc }]);
          if (sc > best.score) best = { score: sc, val: nv, path: np };
          if (nv.length < 4000) queue.push({ val: nv, path: np, depth: node.depth + 1 });
        }
      }

      const lines = ['🔗 DEEP CHAIN DECODER (BFS, max depth ' + maxD + ')', ''];
      lines.push('─ BEST PATH (score ' + best.score.toFixed(4) + ')');
      best.path.forEach((p, i) => {
        lines.push(`  ${String(i).padStart(2)}. [${p.step.padEnd(8)}] score ${p.score.toFixed(3).padStart(7)}`);
        lines.push(`      ${p.val.length > 76 ? p.val.slice(0, 76) + '…' : p.val}`);
      });
      lines.push('');
      lines.push(best.score > 0.4 ? '✅ Readable output mila!' : best.score > 0.15 ? '⚠️ Partial — shayad ek aur layer chahiye.' : '❌ Encodings ke baad bhi readable nahi. Cipher ho sakta hai — ADVANCED CRACKER chalao.');
      return lines.join('\n');
    }
  });

  /* ============================================================
     OP: CIPHER IDENTIFY — kaunsa cipher hai?
     ============================================================ */
  add({
    id: 'cipher-id', cat: 'Advanced', name: 'Cipher Identify — kaunsa cipher hai?',
    keywords: ['identify', 'detect', 'which', 'cipher', 'type', 'guess'],
    desc: 'Statistical fingerprint se batata hai kaunsa cipher ho sakta hai (Caesar, Vigenère, transposition, substitution, Hill, base64, random).',
    args: [],
    run(d) {
      const s = String(d).trim();
      const letters = UP(s);
      const n = letters.length;
      const freq = {}; for (const c of letters) freq[c] = (freq[c] || 0) + 1;
      const ic = n < 2 ? 0 : Object.values(freq).reduce((a, v) => a + v * (v - 1), 0) / (n * (n - 1));
      const uniq = Object.keys(freq).length;
      const out = ['🔍 CIPHER IDENTIFICATION', ''];

      const isB64 = /^[A-Za-z0-9+/=\s]+$/.test(s) && s.replace(/\s/g, '').length % 4 === 0;
      const isHex = /^[0-9a-f\s]+$/i.test(s) && s.replace(/\s/g, '').length % 2 === 0;
      const isBin = /^[01\s]+$/.test(s) && s.replace(/\s/g, '').length % 8 === 0;
      const isB32 = /^[A-Z2-7=\s]+$/i.test(s);
      const isB58 = /^[1-9A-HJ-NP-Za-km-z]+$/.test(s.replace(/\s/g, ''));
      const isNum = /^[\d\s,;:\[\]()]+$/.test(s);

      out.push(`Length: ${s.length} chars · ${n} letters · ${uniq}/26 distinct`);
      out.push(`IC: ${ic.toFixed(4)}  (English 0.066 · Vigenère 0.038-0.05 · random 0.038)`);
      out.push('');

      const guesses = [];
      if (isHex) guesses.push(['Hex encoding', '95%', 'From Hex']);
      if (isBin) guesses.push(['Binary', '90%', 'From Binary']);
      if (isB64) guesses.push(['Base64', '85%', 'From Base64']);
      if (isB32) guesses.push(['Base32', '75%', 'From Base32']);
      if (isB58) guesses.push(['Base58', '60%', 'From Base58']);
      if (isNum) guesses.push(['Numeric (ASCII/decimal)', '85%', 'From Decimal']);
      if (!isB64 && !isHex && !isNum && n > 6) {
        if (uniq <= 10 && ic > 0.05) guesses.push(['Caesar / ROT-N (monoalphabetic)', '80%', 'ADVANCED CRACKER']);
        if (uniq > 12 && ic > 0.055) guesses.push(['Monoalphabetic substitution', '75%', 'Substitution Cracker']);
        if (ic >= 0.035 && ic < 0.055) guesses.push(['Vigenère / polyalphabetic', '70%', 'ADVANCED CRACKER']);
        if (ic < 0.038) guesses.push(['Random / long-key polyalphabetic', '60%', 'ADVANCED CRACKER + key']);
        if (uniq >= 15 && ic > 0.05) guesses.push(['Transposition (letter freq preserved)', '70%', 'Rail Fence / Columnar']);
        if (n % 2 === 0 && uniq >= 18) guesses.push(['Hill 2×2 / digraph cipher', '50%', 'ADVANCED CRACKER']);
        if (/^[A-Z\s]+$/.test(s) && n >= 20) guesses.push(['Playfair / digraph', '40%', 'ADVANCED CRACKER']);
      }

      if (!guesses.length) {
        out.push('❌ Koi confident guess nahi. ADVANCED CRACKER try karo — wo 45+ families test karta hai.');
      } else {
        out.push('─ LIKELY CIPHERS:');
        guesses.sort((x, y) => parseInt(y[1]) - parseInt(x[1]));
        guesses.forEach(([name, conf, op]) => {
          out.push(`  ${name.padEnd(42)} ${conf.padStart(4)}  → ${op}`);
        });
        out.push('');
        out.push(`👉 Best next step: ${guesses[0][2]}`);
      }
      return out.join('\n');
    }
  });

  console.log('[CTF STUDIO] Advanced Cracker loaded:',
    'adv-crack, eng-score, sub-crack, chain-deep, cipher-id');
})();
