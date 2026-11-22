// Quick health check of the game after every upload (run by the "Keep fixes applied" robot).
// Opens the standard game and Devious Mode in a headless browser, checks a few simple scores
// and plays one spin. Writes the result to tools/GAME-CHECK.md; exits 1 if anything failed.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });

// [what, kind, check(value) -> ok, expected text]
const SCORES = [
  ['A lone Verdant', 'g', v => v == 1, '1'],
  ['A lone Forest', 'r', v => v == 1, '1'],
  ['3 Forests (each)', 'r3', v => v == 2, '2'],
  ['A lone Supernova', 'b', v => v == 5, '5'],
  ['A lone Cradle', 'c', v => v == 1, '1'],
];

(async () => {
  srv.listen(8790); const b = await chromium.launch(); const lines = []; let bad = 0;
  for (const [file, name] of [['index.html', 'Standard game'], ['devious.html', 'Devious Mode']]) {
    if (!fs.existsSync(path.join(ROOT, file))) continue;
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } }); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.route(/supabase/, r => r.fulfill({ status: 200, body: '[]', contentType: 'application/json' }));
    const res = [];
    try {
      await p.goto('http://localhost:8790/' + file, { waitUntil: 'load', timeout: 30000 }); await p.waitForTimeout(800);
      await p.evaluate(() => { newGame(); for (let i = 0; i < 4 && G.mode == 'start'; i++) startC(0); try { closeTip(); } catch (e) {} });
      for (const [what, k, ok, exp] of SCORES) {
        const v = await p.evaluate(k => { const n = k == 'r3' ? 3 : 1, kk = k[0]; G.bag = []; for (let i = 0; i < n; i++) G.bag.push(mk(kk)); const cs = Array(20).fill(null); G.bag.forEach((x, i) => cs[i * 4] = x); return score(cs).f[0]; }, k);
        const good = ok(v); if (!good) bad++; res.push((good ? '✅ ' : '❌ ') + what + ' scores ' + v + (good ? '' : ' (should be ' + exp + ')'));
      }
      const spun = await p.evaluate(async () => { newGame(); for (let i = 0; i < 4 && G.mode == 'start'; i++) startC(0); try { closeTip(); } catch (e) {} SP = 5; ['g', 'r', 'p', 'h', 'b', 'c'].forEach(k => G.bag.push(mk(k))); G.mode = 'idle'; draw();
        const n = G.n; spinSafe(); const t0 = Date.now(); while (!(G.n > n && !G.busy) && Date.now() - t0 < 60000) await new Promise(r => setTimeout(r, 100)); return G.n > n && !G.busy; });
      if (!spun) bad++; res.push((spun ? '✅ ' : '❌ ') + 'A spin ' + (spun ? 'plays to the end' : 'did not finish within 60 seconds'));
    } catch (e) { bad++; res.push('❌ Could not run the check: ' + String(e.message || e).split('\n')[0]); }
    if (errs.length) { bad++; res.push('❌ Script errors: ' + errs.slice(0, 3).join(' · ')); } else res.push('✅ No script errors');
    lines.push('### ' + name + ' (' + file + ')', ...res.map(x => '- ' + x), '');
    await p.close();
  }
  await b.close(); srv.close();
  const out = ['# Game check', '', 'Automatic check after the latest upload (' + new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC). ' + (bad ? '**' + bad + ' problem' + (bad > 1 ? 's' : '') + ' found.**' : 'Everything passed.'), '', ...lines].join('\n');
  fs.writeFileSync(path.join(__dirname, 'GAME-CHECK.md'), out); console.log(out); process.exit(bad ? 1 : 0);
})();
