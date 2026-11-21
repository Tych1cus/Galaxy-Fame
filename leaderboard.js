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
    KEY = 'gf_lb';

  // ---- our own save (separate from the game's save, so game code can't wipe it) ----
  var S = { best: null, dev: '' };
  try { var raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw) { S.best = raw.best || null; S.dev = raw.dev || ''; } } catch (e) {}
  if (!S.best || !S.dev) {                        // carry over v138/v140 data kept inside the game save
    try { var old = JSON.parse(localStorage.getItem('startithe_meta') || 'null');
      if (old) { if (!S.best && old.best) S.best = old.best; if (!S.dev && old.dev) S.dev = old.dev; } } catch (e) {}
  }
  function keep() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  keep();

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
    var goals = g.t || 0, fame = Math.round(g.tot || 0), pl = 0, title = '';
    try { pl = PLV(); } catch (e) {}
    try { title = titleFor(M.total, M.prestige).n + (pl ? ' · played P' + pl : ''); } catch (e) {}
    g.newBest = false;
    if (fame > 0 && (!S.best || fame > S.best.fame)) { S.best = { goals: goals, fame: fame, p: pl, day: day() }; g.newBest = true; keep(); }
    if (fame <= 0 || typeof fetch == 'undefined') return;
    try {
      fetch(LB_URL + '/rest/v1/rpc/gf_submit', {
        method: 'POST',
        headers: { 'apikey': LB_KEY, 'Authorization': 'Bearer ' + LB_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_dev: dev(), p_name: name(), p_day: day(), p_goals: goals, p_fame: fame, p_win: r == 'win', p_title: title })
      }).catch(function () {});
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
    window.newGame = function () { var out = newGame0.apply(this, arguments); var g = G_(); if (g) { g._lbSent = 0; g.newBest = false; } return out; };
  }

  // ---- screens ----
  function wrap(fn, add) {
    if (typeof window[fn] != 'function') return;
    var f0 = window[fn];
    window[fn] = function () { var h = f0.apply(this, arguments); try { var h2 = add(h); if (typeof h2 == 'string') h = h2; } catch (e) {} return h; };
  }
  // title screen: "Leaderboard" link, your best score, board name
  wrap('menuHtml', function (h) {
    var b = S.best,
      extra = (b ? '<p class="gflb-l">Your best score: <b style="color:var(--gd)">' + fmt(b.fame) + ' ⭐</b> <span>(' +
        (b.goals >= 10 ? '🏆 won' : b.goals + ' goal' + (b.goals == 1 ? '' : 's')) + (b.p ? ' · P' + b.p : '') + ')</span></p>' : '') +
        '<p class="gflb-l gflb-s">Board name: <b style="color:#fff">' + name() + '</b> <button class="sm gflb-b" onclick="gfSetName()">change</button></p>';
    h = h.replace('Daily board →', 'Leaderboard →');
    if (h.indexOf('board.html') < 0) extra = '<p class="gflb-l"><a href="board.html" style="color:var(--gd)">Leaderboard →</a></p>' + extra;
    var i = h.indexOf('<button class="spin"');
    return i > -1 ? h.slice(0, i) + extra + h.slice(i) : h + extra;
  });
  // game screen: Total fame box; end-of-run popup: final score + personal best
  wrap('gameHtml', function (h) {
    var g = G_(); if (!g) return h;
    var tot = Math.round((g.tot || 0) + (g.tmp || 0)),
      pill = '<div class="pill gflb-tot"><span>Total fame · score</span><b id="gflbTot">⭐ ' + fmt(tot) + '</b></div>';
    var bag = h.match(/<div class="pill"><span>Bag<\/span><b>[^<]*<\/b><\/div>/);
    if (bag) h = h.replace(bag[0], bag[0] + pill);
    else { var st = h.indexOf('<div class="stats">'); if (st > -1) h = h.slice(0, st + 19) + pill + h.slice(st + 19); }
    if (g.over) {
      var fs = '<p class="gflb-final">Final score: ' + fmt(g.tot) + ' ⭐</p>';
      var ov = h.lastIndexOf('<div class="ov">');
      if (ov > -1) {
        var e = h.indexOf('</h1>', ov);
        if (e > -1) h = h.slice(0, e + 5) + fs + h.slice(e + 5);
        if (g.newBest) {
          var sh = h.indexOf('Star Shards earned</p>', ov);
          var nb = '<p class="gflb-best">🌟 New personal best!</p>';
          if (sh > -1) h = h.slice(0, sh + 22) + nb + h.slice(sh + 22);
          else if (e > -1) h = h.replace(fs, fs + nb);
        }
      }
    }
    return h;
  });
  // keep the Total fame box counting up during the end-of-spin animation
  if (typeof window.paintBar == 'function') {
    var paint0 = window.paintBar;
    window.paintBar = function (tf, tc) {
      var out = paint0.apply(this, arguments);
      try { var el = document.getElementById('gflbTot'), g = G_(); if (el && g) el.textContent = '⭐ ' + fmt((g.tot || 0) + (tf || 0)); } catch (e) {}
      return out;
    };
  }

  try {
    var css = document.createElement('style');
    css.textContent =
      '.stats{grid-template-columns:2fr 1fr 1fr 1fr 1.6fr}.gflb-tot b{color:var(--gd)}' +
      '@media(max-width:700px){.stats{grid-template-columns:1fr 1fr}.gflb-tot{grid-column:1/-1}}' +
      '.gflb-l{color:var(--mu);font-size:13px;margin:6px 0 0}.gflb-s{font-size:12px;margin:4px 0 10px}' +
      '.gflb-b{margin:0 0 0 6px!important;padding:2px 8px!important;font-size:11px!important}' +
      '.gflb-final{font-size:22px;font-weight:800;color:var(--gd);margin:6px 0}.gflb-best{color:#7dffb0;font-weight:700}';
    document.head.appendChild(css);
  } catch (e) {}

  try { if (typeof DH !== 'undefined') DH = ''; draw(); } catch (e) {}   // redraw now that the hooks are in
})();
