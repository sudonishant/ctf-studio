const fs = require('fs');
const path = require('path');
const read = (f) => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');

const shellCode = read('shell5.js');
const sandbox = { window: {} };
new Function('window', shellCode)(sandbox.window);
const HEAD = sandbox.window.SHELL_HEAD;
const BODY = sandbox.window.SHELL_BODY;

const out = HEAD + '\n' + BODY +
  '\n<noscript><div style="padding:30px;color:#fff;font-family:sans-serif">JavaScript chahiye.</div></noscript>\n' +
  '<script>\n' + read('chdata.js') + '\n</script>\n' +
  '<script>\n' + read('ops.js') + '\n</script>\n' +
  '<script>\n' + read('ops2.js') + '\n</script>\n' +
  '<script>\n' + read('chops.js') + '\n</script>\n' +
  '<script>\n' + read('advcrack.js') + '\n</script>\n' +
  '<script>\n' + read('app5.js') + '\n</script>\n' +
  '</body>\n</html>\n';

fs.writeFileSync(path.join(__dirname, '..', 'ctf-studio.html'), out);
console.log('Built ctf-studio.html:', (out.length / 1024).toFixed(1) + ' KB');
