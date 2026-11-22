/* Galaxy Fame - global leaderboard, personal best and total-fame score.
   Lives in its own file so game builds (index.html) never overwrite it.
   index.html only needs this one line before </body>:
     <script src="leaderboard.js"></script>
   A GitHub Action (.github/workflows/keep-leaderboard-line.yml) re-adds that line if an upload drops it.
   Scores are stored in archdevious's Supabase project (table gf_scores, function gf_submit).
   Everything here fails quietly: if a hook can't find its spot, the game still works. */
(function () {
  if (window.__gfLB) return;
  window.__gfLB = 1;

  var LB_URL = 'https://bbawfdqrxqfeqadcfdqj.supabase.co',
    LB_KEY = 'sb_publishable_owcLW7JcSGVvUIcfvNYRuQ_G0arZB9Z',
    LB_BAD = ['fuck', 'shit', 'bitch', 'cunt', 'nigg', 'fagg', 'slut', 'whore', 'rape', 'nazi', 'hitler', 'dick', 'cock', 'pussy', 'asshole', 'retard'],
    DEV = window.GF_MODE == 'devious',            // Devious Mode keeps its own best, stats and board
    KEY = DEV ? 'gf_dv_lb' : 'gf_lb';

  // ---- our own save (separate from the game's save, so game code can't wipe it) ----
  var S = { best: null, by: {}, dev: '' };          // by[p] = best run played at exactly prestige p
  try { var raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw) { S.best = raw.best || null; S.by = raw.by || {}; S.dev = raw.dev || ''; S.fix146 = raw.fix146 || 0; } } catch (e) {}
  if (!S.best || !S.dev) {                        // carry over v138/v140 data kept inside the game save
    try { var old = JSON.parse(localStorage.getItem('startithe_meta') || 'null');
      if (old) { if (!S.best && old.best) S.best = old.best; if (!S.dev && old.dev) S.dev = old.dev; } } catch (e) {}
  }
  if (S.best && !S.fix146) { var bp = S.best.p || 0; if (!S.by[bp] || S.by[bp].fame < S.best.fame) S.by[bp] = S.best; }   // older single best (merged once)
  function keep() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  keep();
  // best on the board for prestige L = best run played at L or higher (same rule as the leaderboard)
  function bestAt(L) { var b = null; for (var k in S.by) if (+k >= L && S.by[k] && (!b || S.by[k].fame > b.fame)) b = S.by[k]; return b; }
  function curP() { try { return PLV() || 0; } catch (e) { return 0; } }
  function runP(g) { return g && typeof g._lbP == 'number' ? g._lbP : curP(); }
  // one-time fix (v146): wins used to be saved one prestige level too high
  if (!S.fix146) {
    var by2 = {};
    for (var k0 in S.by) { var e0 = S.by[k0]; if (!e0) continue; var lv0 = +k0;
      if (e0.goals >= 10 && lv0 > 0) { lv0--; e0.p = lv0; }
      if (!by2[lv0] || by2[lv0].fame < e0.fame) by2[lv0] = e0; }
    S.by = by2; S.fix146 = 1;
    try { var st0 = JSON.parse(localStorage.getItem(DEV ? 'gf_dv_stats' : 'gf_stats') || 'null');
      if (st0 && st0.runs && !DEV) { st0.runs.forEach(function (r0) { if (r0.end == 'win' && r0.p > 0) r0.p--; }); localStorage.setItem('gf_stats', JSON.stringify(st0)); } } catch (e) {}
    keep();
  }

  function day() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function dev() {
    if (!S.dev) { var u = ''; try { u = crypto.randomUUID(); } catch (e) {}
      if (!u) u = 'gf-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
      S.dev = u; keep(); }
    return S.dev;
  }
  function name() {
    var n = ''; try { n = localStorage.getItem('gf_name') || ''; } catch (e) {}
    n = n.replace(/[^A-Za-z0-9 _.\-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16);
    var l = n.toLowerCase().replace(/[^a-z]/g, '');
    if (n.length < 2 || !LB_BAD.every(function (w) { return l.indexOf(w) < 0; })) n = 'Anon';
    return n;
  }
  function fmt(x) { return Number(Math.round(x || 0)).toLocaleString(); }
  function G_() { return typeof G !== 'undefined' && G ? G : null; }

  window.gfSetName = function () {
    var c = name(), v = prompt('Your name on the leaderboard (2-16 letters or numbers):', c == 'Anon' ? '' : c);
    if (v == null) return;
    try { localStorage.setItem('gf_name', v); } catch (e) {}
    try { draw(); } catch (e) {}
  };

  // ---- sending a finished run (once per run) ----
  function submit(r) {
    var g = G_(); if (!g || g._lbSent) return; g._lbSent = 1;
    try { recordRun(r); } catch (e) {}
    var goals = g.t || 0, fame = Math.round(g.tot || 0), pl = runP(g), title = '';
    try { title = titleFor(M.total, M.prestige).n + (pl ? ' · played P' + pl : ''); } catch (e) {}
    g.newBest = false;
    var prev = bestAt(pl), run = { goals: goals, fame: fame, p: pl, day: day() };
    if (fame > 0 && (!S.by[pl] || fame > S.by[pl].fame)) { S.by[pl] = run; keep(); }
    if (fame > 0 && (!prev || fame > prev.fame)) { g.newBest = true; g.newBestP = pl; }
    if (fame <= 0 || typeof fetch == 'undefined') return;
    try {
      var body = { p_dev: dev(), p_name: name(), p_day: day(), p_goals: goals, p_fame: fame, p_win: r == 'win', p_title: title, p_p: pl },
        rpc = DEV ? 'gf_submit_dv' : 'gf_submit',
        send = function (b) { return fetch(LB_URL + '/rest/v1/rpc/' + rpc, { method: 'POST',
          headers: { 'apikey': LB_KEY, 'Authorization': 'Bearer ' + LB_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(b) }); };
      // if the database hasn't got the prestige version yet, send it the old way (prestige is in the title)
      send(body).then(function (res) { if (!res.ok && !DEV) { delete body.p_p; return send(body); } }).catch(function () {});   // Devious scores never fall back to the standard board
    } catch (e) {}
  }
  // the game calls postScore(r) when a run ends; take it over, and also hook finish() in case that call ever goes away
  window.postScore = function (r) { try { submit(r); } catch (e) {} };
  if (typeof window.finish == 'function') {
    var finish0 = window.finish;
    window.finish = function (r) { var g = G_(); if (g && !g.over) g._lbSent = 0; var out = finish0.apply(this, arguments); try { submit(r); } catch (e) {} return out; };
  }
  if (typeof window.newGame == 'function') {
    var newGame0 = window.newGame;
    window.newGame = function () { var out = newGame0.apply(this, arguments); var g = G_(); if (g) { g._lbSent = 0; g.newBest = false; g._lbP = curP(); } return out; };
  }


  // ---- stats tracking (kept in this browser only: gf_stats = finished runs, gf_stats_cur = the run in progress) ----
  var SK = DEV ? 'gf_dv_stats' : 'gf_stats', CK = DEV ? 'gf_dv_stats_cur' : 'gf_stats_cur', MAXRUNS = 500;
  function cur0() { return { picks: {}, sys: 0, gal: 0, spins: 0, bestSpin: 0 }; }
  var CUR = cur0();
  try { var cr = JSON.parse(localStorage.getItem(CK) || 'null'); if (cr && cr.picks) CUR = cr; } catch (e) {}
  function saveCur() { try { localStorage.setItem(CK, JSON.stringify(CUR)); } catch (e) {} }
  function stats() { var s = null; try { s = JSON.parse(localStorage.getItem(SK) || 'null'); } catch (e) {} if (!s || !s.runs) s = { since: Date.now(), runs: [] }; return s; }
  function pickName(k) { try { return nm(k); } catch (e) { return String(k); } }
  function notePick(k) { if (!k) return; var n = pickName(k); CUR.picks[n] = (CUR.picks[n] || 0) + 1; saveCur(); }
  function recordRun(r) {
    var g = G_(); if (!g || g._stSaved) return; g._stSaved = 1;
    endSpin();                                     // the run can end inside its last spin
    if (!CUR.spins && !(g.tot > 0)) { CUR = cur0(); saveCur(); return; }      // ended before playing: not a run
    var rel = (g.rel || []).map(function (id) { try { var x = RELICS.filter(function (q) { return q.id == id; })[0]; return x ? x.n : id; } catch (e) { return id; } });
    var pl = runP(g);
    var s = stats();
    s.runs.push({ at: Date.now(), score: Math.round(g.tot || 0), goals: g.t || 0, end: r || g.over || 'lose', p: pl,
      sys: CUR.sys, gal: CUR.gal, spins: CUR.spins, bestSpin: CUR.bestSpin, relics: rel, picks: CUR.picks });
    if (s.runs.length > MAXRUNS) s.runs = s.runs.slice(-MAXRUNS);
    try { localStorage.setItem(SK, JSON.stringify(s)); } catch (e) {}
    CUR = cur0(); saveCur();
  }
  function hook(fn, before, after) {
    if (typeof window[fn] != 'function') return;
    var f0 = window[fn];
    window[fn] = function () {
      var ctx = null; try { if (before) ctx = before.apply(this, arguments); } catch (e) {}
      var out = f0.apply(this, arguments);
      if (after) {
        if (out && typeof out.then == 'function') return out.then(function (v) { try { after(ctx, v); } catch (e) {} return v; });
        try { after(ctx, out); } catch (e) {}
      }
      return out;
    };
  }
  hook('startC', function (i) { var g = G_(); return g && g.offer ? g.offer[i] : null; }, function (k) { notePick(k); });
  hook('pickC', function (i) { var g = G_(); return g && g.offer ? g.offer[i] : null; }, function (k) { notePick(k); });
  hook('confirmForm', function () { var g = G_(); return g ? { t: g.formT, n: g.bag.filter(function (p) { return p.k == g.formT; }).length } : null; },
    function (c) { var g = G_(); if (!c || !g) return; var n = g.bag.filter(function (p) { return p.k == c.t; }).length;
      if (n > c.n) { if (c.t == 'gal') CUR.gal++; else CUR.sys++; saveCur(); } });
  var spinStart = null;                            // fame total when the current spin began
  function endSpin() { var g = G_(); if (spinStart == null || !g) return; var d = Math.round((g.tot || 0) - spinStart); spinStart = null;
    CUR.spins++; if (d > CUR.bestSpin) CUR.bestSpin = d; saveCur(); }
  hook('spin', function () { var g = G_(); if (g && !g.busy && g.mode == 'idle') spinStart = g.tot || 0; }, function () { endSpin(); });
  // a new run starts fresh tracking; resuming a saved run keeps it
  var resuming = false;
  hook('resumeRun', function () { resuming = true; }, function () { resuming = false; });
  hook('newGame', null, function () { var g = G_(); if (g) g._stSaved = 0; if (!resuming) { CUR = cur0(); saveCur(); } });

  // ---- screens ----
  function wrap(fn, add) {
    if (typeof window[fn] != 'function') return;
    var f0 = window[fn];
    window[fn] = function () { var h = f0.apply(this, arguments); try { var h2 = add(h); if (typeof h2 == 'string') h = h2; } catch (e) {} return h; };
  }
  // title screen: "Leaderboard" link, your best score, board name
  wrap('menuHtml', function (h) {
    var L = curP(), b = bestAt(L),
      extra = (b ? '<p class="gflb-l">Your best' + (L ? ' at P' + L : '') + ': <b style="color:var(--gd)">' + fmt(b.fame) + ' ⭐</b> <span>(' +
        (b.goals >= 10 ? '🏆 won' : b.goals + ' goal' + (b.goals == 1 ? '' : 's')) + (b.p != L ? ' · played P' + b.p : '') + ')</span></p>' : '') +
        '<p class="gflb-l gflb-s">Board name: <b style="color:#fff">' + name() + '</b> <button class="sm gflb-b" onclick="gfSetName()">change</button></p>';
    h = h.replace('Daily board →', 'Leaderboard →');
    if (DEV) h = h.replace(/href="board\.html"/g, 'href="board.html?mode=devious"');
    if (h.indexOf('board.html') < 0) extra = '<p class="gflb-l"><a href="board.html' + (DEV ? '?mode=devious' : '') + '" style="color:var(--gd)">Leaderboard →</a></p>' + extra;
    extra += '<p class="gflb-l gflb-s"><a href="stats.html' + (DEV ? '?mode=devious' : '') + '" style="color:var(--gd)">📊 Your stats →</a></p>';
    extra += DEV ? '<p class="gflb-l"><a class="gflb-mode std" href="index.html">⬅ Standard Mode</a></p>'
                 : '<a class="gflb-dv" href="devious.html" aria-label="Devious Mode">✦</a>';
    var i = h.indexOf('<button class="spin"');
    return i > -1 ? h.slice(0, i) + extra + h.slice(i) : h + extra;
  });
  // end-of-run popup: final score + personal best
  wrap('gameHtml', function (h) {
    var g = G_(); if (!g) return h;
    if (g.over) {
      var fs = '<p class="gflb-final">Final score: ' + fmt(g.tot) + ' ⭐</p>';
      var ov = h.lastIndexOf('<div class="ov">');
      if (ov > -1) {
        var e = h.indexOf('</h1>', ov);
        if (e > -1) h = h.slice(0, e + 5) + fs + h.slice(e + 5);
        if (g.newBest) {
          var sh = h.indexOf('Star Shards earned</p>', ov);
          var nb = '<p class="gflb-best">🌟 New personal best' + (g.newBestP ? ' at P' + g.newBestP : '') + '!</p>';
          if (sh > -1) h = h.slice(0, sh + 22) + nb + h.slice(sh + 22);
          else if (e > -1) h = h.replace(fs, fs + nb);
        }
      }
    }
    return h;
  });
  try {
    var css = document.createElement('style');
    css.textContent =
      '.gflb-l{color:var(--mu);font-size:13px;margin:6px 0 0}.gflb-s{font-size:12px;margin:4px 0 10px}' +
      '.gflb-b{margin:0 0 0 6px!important;padding:2px 8px!important;font-size:11px!important}' +
      '.gflb-dv{position:fixed;right:10px;bottom:8px;font-size:11px;line-height:1;padding:6px;color:#8a93b8;opacity:.28;text-decoration:none;z-index:5}.gflb-dv:hover{opacity:.7}' +
      '.gflb-mode{display:inline-block;margin-top:6px;padding:8px 16px;border-radius:999px;font-weight:800;letter-spacing:.06em;text-decoration:none;color:#1a0016;background:linear-gradient(180deg,#ff7ae6,#d4149a);box-shadow:0 0 16px #ff3fd2aa}.gflb-mode.std{color:#fff;background:#1b1440;box-shadow:0 0 0 1px #4a3c8f}' +
      '.gflb-final{font-size:22px;font-weight:800;color:var(--gd);margin:6px 0}.gflb-best{color:#7dffb0;font-weight:700}';
    document.head.appendChild(css);
  } catch (e) {}

  try { if (typeof DH !== 'undefined') DH = ''; draw(); } catch (e) {}   // redraw now that the hooks are in
})();
