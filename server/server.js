// Galaxy Fame - game + daily leaderboard.
// No dependencies at all: plain Node, a JSON file for storage.
//
//   npm start             run it   (http://localhost:3000)
//   PORT=8080 npm start   on another port
//
// Serves the game files from the repo root (index.html, board.html, wiki.html, ...).
// Scores are stored in data/scores.json, created on first run.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const SCORES = path.join(DATA, 'scores.json');
const MAX_BODY = 4 * 1024;          // a score is a few hundred bytes
const KEEP_DAYS = 60;

fs.mkdirSync(DATA, { recursive: true });
if (!fs.existsSync(SCORES)) fs.writeFileSync(SCORES, '[]');

function load() {
  try { return JSON.parse(fs.readFileSync(SCORES, 'utf8')); } catch (e) { return []; }
}
function saveAll(rows) {
  const tmp = SCORES + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(rows));
  fs.renameSync(tmp, SCORES);                     // never leave a half-written file
}
function today() {
  const d = new Date();
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
}
// strip tags and quotes, then drop anything that is not a letter, number, space or basic punctuation
const clean = (s, n) => String(s == null ? '' : s)
  .replace(/<[^>]*>/g, '')
  .replace(/[<>&"'`\\]/g, '')
  .replace(/[^\p{L}\p{N} ._:\-☀-➿]/gu, '')
  .trim().slice(0, n);
const num = (v) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0; };

// better run = more goals reached, then more total fame
const better = (a, b) => a.goals - b.goals || a.fame - b.fame;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.webp': 'image/webp',
};

function send(res, code, body, type) {
  if (res.headersSent) return;
  res.writeHead(code, {
    'Content-Type': type || 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(body);
}

function handle(req, res) {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;

  // ---- POST a finished run -------------------------------------------------
  if (p === '/api/score' && req.method === 'POST') {
    let body = '', tooBig = false;
    req.on('data', (c) => {
      if (tooBig) return;
      body += c;
      if (body.length > MAX_BODY) { tooBig = true; send(res, 413, 'Too big'); req.destroy(); }
    });
    req.on('end', () => {
      if (tooBig) return;
      let d;
      try { d = JSON.parse(body); } catch (e) { return send(res, 400, 'Bad JSON'); }
      if (!d || typeof d !== 'object') return send(res, 400, 'Bad JSON');
      const row = {
        name: clean(d.name, 16) || 'Anon',
        day: clean(d.day, 10) || today(),
        fame: num(d.fame),          // the run's total fame
        goals: num(d.goals),
        win: d.win ? 1 : 0,
        total: num(d.total),
        prestige: num(d.prestige),
        title: clean(d.title, 40),
        file: clean(d.file, 60) || 'index.html',
        at: Date.now(),
      };
      const rows = load();
      rows.push(row);
      const cutoff = Date.now() - KEEP_DAYS * 864e5;   // keep the last 60 days
      saveAll(rows.filter((r) => r.at >= cutoff).slice(-5000));
      send(res, 200, 'ok');
    });
    return;
  }

  // ---- read the board ------------------------------------------------------
  if (p === '/api/board' && req.method === 'GET') {
    const day = url.searchParams.get('day') || '';
    const file = url.searchParams.get('file') || '';
    let rows = load();
    if (day) rows = rows.filter((r) => r.day === day);
    if (file) rows = rows.filter((r) => r.file === file);
    const best = new Map();                            // one row per player: their best run
    for (const r of rows) {
      const k = r.name.toLowerCase();
      const cur = best.get(k);
      if (!cur || better(r, cur) > 0) best.set(k, r);
    }
    const out = [...best.values()].sort((a, b) => better(b, a)).slice(0, 100);
    send(res, 200, JSON.stringify({ rows: out }), 'application/json; charset=utf-8');
    return;
  }

  // ---- static game files: only plain files in the repo root ----------------
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
  let name;
  try { name = decodeURIComponent(p).replace(/^\/+/, ''); } catch (e) { return send(res, 400, 'Bad request'); }
  if (name === '') name = 'index.html';
  // no folders (keeps server/, data/ and .git private), no hidden files
  if (/[\\/]/.test(name) || name.startsWith('.') || !MIME[path.extname(name).toLowerCase()]) return send(res, 404, 'Not found');
  fs.readFile(path.join(ROOT, name), (err, buf) => {
    if (err) return send(res, 404, 'Not found');
    send(res, 200, buf, MIME[path.extname(name).toLowerCase()]);
  });
}

const server = http.createServer((req, res) => {
  try { handle(req, res); } catch (e) { console.error(e); send(res, 500, 'Server error'); }
});

server.listen(PORT, () => {
  console.log('Galaxy Fame running on http://localhost:' + PORT);
  console.log('  game  : http://localhost:' + PORT + '/');
  console.log('  board : http://localhost:' + PORT + '/board.html');
});
