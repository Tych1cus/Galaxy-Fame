/* Galaxy Fame · Devious Mode (archdevious) — effects layer.
   Loaded only by devious.html, which tools/build_devious.py builds from the game's index.html.
   Adds: slot-machine reels with a pull lever, sound effects, evolving music, light-ups,
   explosions on big scores. The game rules themselves come from index.html (+ the Devious
   fixes in tools/devious_patches.json). Everything here fails quietly: if a hook can't find
   its spot, the game still plays normally. */
(function () {
  if (window.DV) return;
  var DV = window.DV = {};
  // devious.html = full Devious Mode; the standard game (index.html) gets everything except the slot machine and the password
  var DEVM = window.GF_MODE == 'devious'; DV.devious = DEVM;

  // ===================================================================== password lock
  // A simple lock (the site has no server, so it only keeps casual players out). Remembered per device.
  (function () {
    function h(s) { var a = 0xdeadbeef ^ 7, b = 0x41c6ce57 ^ 7; for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); a = Math.imul(a ^ c, 2654435761); b = Math.imul(b ^ c, 1597334677); }
      a = Math.imul(a ^ (a >>> 16), 2246822507) ^ Math.imul(b ^ (b >>> 13), 3266489909); b = Math.imul(b ^ (b >>> 16), 2246822507) ^ Math.imul(a ^ (a >>> 13), 3266489909); return (4294967296 * (2097151 & b) + (a >>> 0)).toString(36); }
    if (!DEVM) return;
    var KEY = '17gnq1hzxh6', ok = false; try { ok = localStorage.getItem('gf_dv_ok') == KEY; } catch (e) {}
    if (ok) return;
    var d = document.createElement('div'); d.id = 'dv-lock';
    d.innerHTML = '<form><div style="font-size:44px">🛠️</div><h2>Developer Mode</h2><p>Enter the password</p><input type="password" autocomplete="current-password" autofocus><button type="submit">Enter</button><small></small><a href="index.html">⬅ Back to the standard game</a></form>';
    d.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:radial-gradient(900px 600px at 50% 0%,#2a1450,#07040f 70%);color:#f3e9ff;font:16px -apple-system,Segoe UI,Roboto,sans-serif;padding:16px';
    var st = document.createElement('style'); st.textContent = '#dv-lock form{display:flex;flex-direction:column;align-items:center;gap:10px;max-width:320px;width:100%;text-align:center}#dv-lock h2{margin:0;font-size:26px;color:#ff7ae0}#dv-lock p{margin:0;color:#c9b7e6}#dv-lock input{width:100%;font-size:18px;padding:12px;border-radius:12px;border:1px solid #6b3fa0;background:#140a26;color:#fff;text-align:center}#dv-lock button{width:100%;font-size:17px;font-weight:800;padding:12px;border-radius:12px;border:0;background:linear-gradient(#ff7ae0,#a43cff);color:#fff;cursor:pointer}#dv-lock small{color:#ff8a8a;min-height:1em}#dv-lock a{color:#c9b7e6;font-size:14px}@keyframes dvno{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}';
    document.head.appendChild(st); document.body.appendChild(d);
    var inp = d.querySelector('input'); setTimeout(function () { try { inp.focus(); } catch (e) {} }, 50);
    d.querySelector('form').onsubmit = function (e) { e.preventDefault();
      if (h(inp.value.trim().toLowerCase()) == KEY) { try { localStorage.setItem('gf_dv_ok', KEY); } catch (x) {} d.remove(); }
      else { d.querySelector('small').textContent = 'Wrong password'; inp.value = ''; d.querySelector('form').style.animation = 'none'; void d.offsetWidth; d.querySelector('form').style.animation = 'dvno .3s'; } };
  })();

  // ===================================================================== speed: planet pictures
  // The game writes each planet's full picture (≈200 KB of text) into the page every time the
  // screen redraws, so a full board was a ~10 MB page rebuilt many times per spin, and it got
  // slower as the bag grew. Turn each picture into a short link to one shared copy instead.
  (function () {
    var cache = {};
    function link(d) {
      if (typeof d != 'string' || d.indexOf('data:image/') != 0 || d.indexOf(';base64,') < 0) return d;
      if (cache[d]) return cache[d];
      try { var i = d.indexOf(','), bin = atob(d.slice(i + 1)), u = new Uint8Array(bin.length); for (var j = 0; j < bin.length; j++) u[j] = bin.charCodeAt(j);
        return cache[d] = URL.createObjectURL(new Blob([u], { type: d.slice(5, d.indexOf(';')) })); } catch (e) { return d; }
    }
    // Solar System pictures draw the small planets inside an SVG, which can't load shared links,
    // so they keep their own copy of the pictures (PLANET_MINI used to be the same object)
    try { if (window.PLANET_ART) { var mini = {}; for (var k0 in PLANET_ART) mini[k0] = PLANET_ART[k0]; window.PLANET_MINI = mini; } } catch (e) {}
    try { if (window.PLANET_ART) for (var k in PLANET_ART) PLANET_ART[k] = link(PLANET_ART[k]); } catch (e) {}
    // and each finished Solar System picture is turned into one small shared image too
    try { if (typeof window.cosArt == 'function') { var cos0 = window.cosArt, cosC = {}, pend = {};
      window.cosArt = function (p) {
        var key = p && p.k == 'sys' ? (p.comp || []).join('') + '|' + (p.dom || '') + '|' + (p.cg ? Math.round(p.cg * 10) : 0) : null;
        if (key && cosC[key]) return cosC[key];
        var s = cos0.apply(this, arguments);
        if (key && typeof s == 'string' && s.length > 20000 && !pend[key]) { pend[key] = 1;
          var img = new Image(); img.onload = function () { try { var c = document.createElement('canvas'); c.width = c.height = 400; c.getContext('2d').drawImage(img, 0, 0, 400, 400);
            c.toBlob(function (b) { if (b) { cosC[key] = URL.createObjectURL(b); try { DH = ''; draw(); } catch (e) {} } }); } catch (e) {} };
          img.src = s; }
        return s;
      }; } } catch (e) {}
    try { if (typeof AST_ART == 'string') AST_ART = link(AST_ART); } catch (e) {}
    try { if (window.IM) for (var q in IM) if (typeof IM[q] == 'string' && IM[q].length > 20000) IM[q] = link(IM[q]); } catch (e) {}
    DV.link = link;
  })();
  var reduced = false;
  try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  try { if (SP > 1 && SP < 2) SP = 1; } catch (e) {}
  function speed() { var s = 1; try { s = SP || 1; } catch (e) {} try { if (G && G.fast) s *= 4; } catch (e) {} return s; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function sfxOn() { try { return SFX.on !== false; } catch (e) { return true; } }

  // ===================================================================== save picks and shop visits too
  // The game saves only at the end of a spin, so closing the page while picking a planet, in the
  // shop or choosing what to find more often lost that step. Save those screens as well.
  (function () {
    if (typeof window.saveRun != 'function' || typeof window.resumeRun != 'function') return;
    var KEEP = { pick: 1, remove: 1, shop: 1, boost: 1 }, last = '';
    var sv0 = window.saveRun;
    window.saveRun = function () {
      var o = sv0.apply(this, arguments);
      try { if (G && !G.over && SCR == 'game' && KEEP[G.mode]) { var r = JSON.parse(localStorage.getItem('gf_run') || 'null');
        if (r) { r.x = { mode: G.mode == 'remove' ? 'pick' : G.mode, offer: G.offer, shop: G.shop, boostLeft: G.boostLeft, boostThis: G.boostThis, freeRoll: G.freeRoll, msg: G.msg }; localStorage.setItem('gf_run', JSON.stringify(r)); } } } catch (e) {}
      return o;
    };
    var rr0 = window.resumeRun;
    window.resumeRun = function () {
      var x = null; try { x = (JSON.parse(localStorage.getItem('gf_run') || 'null') || {}).x || null; } catch (e) {}
      var ok = rr0.apply(this, arguments);
      if (ok && x && KEEP[x.mode]) { try { G.mode = x.mode; G.offer = x.offer || []; G.shop = x.shop || []; G.boostLeft = x.boostLeft; G.boostThis = x.boostThis || {}; G.freeRoll = x.freeRoll || 0;
        if (x.mode == 'pick' && !G.offer.length) G.mode = 'idle'; G.msg = 'Welcome back. Your run is where you left it.'; DH = ''; draw(); } catch (e) {} }
      return ok;
    };
    // save after every step taken outside a spin (a pick, a purchase, a reroll, leaving the shop...)
    var dr0 = window.draw;
    window.draw = function () {
      var o = dr0.apply(this, arguments);
      try { if (G && !G.busy && !G.over && SCR == 'game' && G.mode != 'start' && G.bag && G.bag.length) {
        var sig = G.mode + '|' + G.n + '|' + G.t + '|' + G.bag.length + '|' + G.credits + '|' + (G.rel || []).length + '|' + JSON.stringify(G.offer) + '|' + JSON.stringify(G.shop && G.shop.map(function (s) { return s.id; })) + '|' + G.boostLeft;
        if (sig != last) { last = sig; window.saveRun(); } } } catch (e) {}
      return o;
    };
  })();

  // ===================================================================== audio
  var AC = null, master = null, sfxBus = null, musicBus = null, noiseBuf = null;
  function ac() {
    if (!AC) {
      try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
      var comp = AC.createDynamicsCompressor(); comp.threshold.value = -10; comp.knee.value = 6; comp.ratio.value = 4; comp.attack.value = .003; comp.release.value = .2; comp.connect(AC.destination);
      master = AC.createGain(); master.gain.value = 1.15; master.connect(comp);
      sfxBus = AC.createGain(); sfxBus.gain.value = (typeof sLv == 'string' && sLv == 'quiet') ? .35 : 1; sfxBus.connect(master);
      musicBus = AC.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
    }
    if (AC.state == 'suspended') AC.resume();
    return AC;
  }
  function tone(f, t0, dur, type, vol, dest, f2) {
    var o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(vol || .2, t0 + .01); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    o.connect(g); g.connect(dest || sfxBus); o.start(t0); o.stop(t0 + dur + .05); return o;
  }
  function noise() {
    if (noiseBuf) return noiseBuf; var n = AC.sampleRate * 2, b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return noiseBuf = b;
  }
  function nz(t0, dur, vol, ftype, f1, f2, q, dest) {
    var s = AC.createBufferSource(); s.buffer = noise(); var f = AC.createBiquadFilter(); f.type = ftype || 'lowpass';
    f.frequency.setValueAtTime(f1, t0); if (f2) f.frequency.exponentialRampToValueAtTime(f2, t0 + dur); f.Q.value = q || 1;
    var g = AC.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(dest || sfxBus); s.start(t0); s.stop(t0 + dur + .05);
  }
  var SND = {
    click: function (i) { var t = AC.currentTime; tone(1700 + (i || 0) * 110, t, .03, 'square', .05); nz(t, .03, .12, 'highpass', 3000); },
    clunk: function () { var t = AC.currentTime; tone(150, t, .25, 'triangle', .35, null, 60); nz(t, .12, .35, 'lowpass', 900); },
    whir: function (dur) { var t = AC.currentTime; nz(t, dur, .1, 'bandpass', 2400, 380, 3); tone(220, t, dur, 'sawtooth', .025, null, 90); },
    land: function (c) { var t = AC.currentTime; tone(110 - c * 6, t, .18, 'sine', .45, null, 45); nz(t, .05, .2, 'highpass', 1800); tone(660 + c * 80, t + .02, .12, 'triangle', .07); },
    ding: function (n, big) { var sc = [0, 2, 4, 5, 7, 9, 11], k = 12 * Math.floor(n / 7) + sc[n % 7], f = 261.63 * Math.pow(2, k / 12), t = AC.currentTime;
      tone(f, t, big ? .5 : .3, 'sine', big ? .2 : .14); tone(f * 2, t, .18, 'triangle', .04); if (big) tone(f * 1.5, t + .04, .4, 'sine', .08); },
    boom: function (big) { var t = AC.currentTime; nz(t, big ? 1.8 : 1.1, big ? .8 : .55, 'lowpass', big ? 2200 : 1500, 60); tone(big ? 70 : 90, t, big ? 1.4 : .9, 'sine', .7, null, 28); nz(t + .05, .3, .25, 'highpass', 2500); },
    fanfare: function () { var t = AC.currentTime; [0, 4, 7, 12, 16, 19, 24].forEach(function (n, i) { var f = 392 * Math.pow(2, n / 12); tone(f, t + i * .07, .45, 'square', .05); tone(f, t + i * .07, .45, 'triangle', .07); }); },
    goal: function () { var t = AC.currentTime; [0, 7, 12, 16, 19, 24, 28, 31].forEach(function (n, i) { tone(523 * Math.pow(2, n / 12), t + i * .06, .5, 'triangle', .08); }); nz(t, .9, .2, 'highpass', 6000, 2000); },
    lose: function () { var t = AC.currentTime; [0, -3, -6, -10].forEach(function (n, i) { tone(392 * Math.pow(2, n / 12), t + i * .22, .5, 'sawtooth', .06, null, 392 * Math.pow(2, (n - 1) / 12)); }); },
    merge: function () { var t = AC.currentTime; tone(420, t, .25, 'triangle', .1, null, 840); tone(630, t + .08, .3, 'sine', .08, null, 1260); nz(t, .4, .08, 'bandpass', 800, 4000, 4); },
    build: function () { var t = AC.currentTime; [0, 4, 7, 11, 14].forEach(function (n, i) { tone(392 * Math.pow(2, n / 12), t + i * .08, .6, 'triangle', .09); }); tone(98, t, 1, 'sine', .2); },
    buy: function () { var t = AC.currentTime; tone(988, t, .08, 'square', .05); tone(1319, t + .07, .14, 'square', .05); tone(1976, t + .14, .2, 'sine', .05); },
    plant: function () { var t = AC.currentTime; tone(330, t, .2, 'sine', .1, null, 660); }
  };
  var lastUi = 0;
  SND.ui = function () { var t = AC.currentTime; tone(1100, t, .06, 'triangle', .28, null, 650); nz(t, .025, .18, 'bandpass', 2500, 2500, 2); };
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('button,.btn,[onclick]'); if (!b || b.closest('.dv-lever') || b.disabled) return; lastUi = performance.now(); play('ui'); }, true);
  function play(name) { if (name == 'click' && performance.now() - lastUi < 150) return; if (!sfxOn() || !ac() || !SND[name]) return; try { SND[name].apply(null, [].slice.call(arguments, 1)); } catch (e) {} }
  DV.play = play;
  // the game's own sound calls play the Devious versions
  if (typeof window.sfx == 'function') {
    var sfx0 = window.sfx;
    window.sfx = function (n) {
      if (n == 'spin') return;                       // the lever and reels make their own sound
      if (n == 'boom') { play('boom', false); return; }
      if (SND[n] && sfxOn() && ac()) { play(n); return; }
      return sfx0.apply(this, arguments);
    };
  }
  function firstTouch() { ac(); if (musicOn) startMusic(); removeEventListener('pointerdown', firstTouch, true); removeEventListener('keydown', firstTouch, true); }
  addEventListener('pointerdown', firstTouch, true); addEventListener('keydown', firstTouch, true);

  // ===================================================================== music
  // A generated space-disco score that keeps changing: sections (intro, groove, melody,
  // breakdown, lift), several chord progressions, new melodies per section, drum fills,
  // and a key change each time round.
  var mLv = ls('gf_dv_mvol') || (ls('gf_dv_music') == '0' ? 'off' : 'loud'), sLv = ls('gf_dv_svol') || 'loud';
  var NEXTLV = { loud: 'quiet', quiet: 'off', off: 'loud' };
  function mGain() { return mLv == 'quiet' ? .5 : 1.4; }
  function sGain() { return sLv == 'quiet' ? .35 : 1; }
  function mLabel() { return mLv == 'off' ? '🔕 Music off' : '🎵 Music ' + mLv; }
  try { SFX.on = sLv != 'off'; } catch (e) {}
  var musicOn = mLv != 'off', mTimer = null, nextT = 0, step = 0, BPM = 112;
  var PROGS = [[0, 5, 3, 4], [0, 3, 5, 4], [0, 6, 5, 3], [0, 4, 5, 3], [5, 3, 0, 4], [0, 2, 3, 4]];
  var SCALE = [0, 2, 3, 5, 7, 8, 10], echoIn = null;                 // natural minor, root A
  var SECTIONS = ['intro', 'groove', 'melody', 'groove2', 'break', 'lift', 'melody2', 'outro'];
  var song = null;
  // several game songs (each builds with the fame goals) and several calm songs for the menu, shop and between goals
  var GSTY = ['disco', 'synth', 'chip', 'pulse'], gIdx = -1;
  var GSCALE = { disco: [0, 2, 3, 5, 7, 8, 10], synth: [0, 2, 3, 5, 7, 9, 10], chip: [0, 2, 4, 5, 7, 9, 11], pulse: [0, 1, 3, 5, 7, 8, 10] };
  var CALM = {
    drift:  { bpm: 84, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 3, 4, 0, 3, 5, 6] },
    box:    { bpm: 72, scale: [0, 2, 4, 5, 7, 9, 11], prog: [0, 3, 4, 0, 5, 3, 1, 4] },
    nebula: { bpm: 60, scale: [0, 2, 4, 6, 7, 9, 11], prog: [0, 1, 0, 4, 0, 1, 5, 4] },
    lofi:   { bpm: 76, scale: [0, 2, 3, 5, 7, 9, 10], prog: [0, 3, 1, 4, 0, 3, 6, 4] },
    harp:   { bpm: 92, scale: [0, 2, 4, 5, 7, 9, 10], prog: [0, 6, 3, 0, 4, 6, 3, 4] }
  };
  var CNAMES = Object.keys(CALM), cIdx = -1, calmS = null, calmBars = 0, calmMel = null;
  function pickNext(n, cur) { var i; do { i = Math.floor(Math.random() * n); } while (n > 1 && i === cur); return i; }
  function newCalm() { cIdx = pickNext(CNAMES.length, cIdx); calmS = CNAMES[cIdx]; calmBars = 0; ilBar = 0; calmMel = motif(); }
  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  function newSong() {
    gIdx = pickNext(GSTY.length, gIdx);
    song = { style: GSTY[gIdx], key: rnd([45, 47, 48, 50, 43]), sec: 0, bar: 0, prog: rnd(PROGS), mel: motif(), arp: rnd(['up', 'down', 'updown', 'skip']), drums: rnd([0, 1, 2]) };
  }
  function motif() {             // 2 bars of 8th notes: scale steps, with rests
    var m = [], last = 4; for (var i = 0; i < 16; i++) { if (Math.random() < .28) { m.push(null); continue; } last = Math.max(0, Math.min(9, last + rnd([-2, -1, -1, 0, 1, 1, 2, 3, -3]))); m.push(last); }
    m[0] = m[0] == null ? 4 : m[0]; return m;
  }
  function sdeg(d) { var o = Math.floor(d / 7), r = ((d % 7) + 7) % 7; return SCALE[r] + 12 * o; }
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function chordNotes(root, deg) { return [sdeg(deg), sdeg(deg + 2), sdeg(deg + 4)].map(function (x) { return root + x; }); }
  function mVoice(f, t, dur, type, vol, cutoff) {
    var o = AC.createOscillator(), g = AC.createGain(), fl = AC.createBiquadFilter(); o.type = type; o.frequency.value = f;
    fl.type = 'lowpass'; fl.frequency.value = cutoff || 3000; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .015);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(fl); fl.connect(g); g.connect(musicBus); o.start(t); o.stop(t + dur + .05);
    if (arguments[6] && echoIn) { var e = AC.createGain(); e.gain.value = arguments[6]; g.connect(e); e.connect(echoIn); }
  }
  // slow-swelling pad voice
  function pad(f, t, dur, type, vol, cutoff) {
    var o = AC.createOscillator(), g = AC.createGain(), fl = AC.createBiquadFilter(); o.type = type; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = cutoff;
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol, t + dur * .4); g.gain.linearRampToValueAtTime(.0001, t + dur);
    o.connect(fl); fl.connect(g); g.connect(musicBus); if (echoIn) g.connect(echoIn); o.start(t); o.stop(t + dur + .05);
  }
  function kick(t) { var o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + .14);
    g.gain.setValueAtTime(.5, t); g.gain.exponentialRampToValueAtTime(.0001, t + .22); o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + .25); }
  function hat(t, v) { nz(t, .05, v || .06, 'highpass', 7500, null, 1, musicBus); }
  function snare(t) { nz(t, .16, .18, 'bandpass', 1900, 900, .8, musicBus); mVoice(190, t, .1, 'triangle', .08, 2000); }
  // how intense the music is: builds with each fame goal, peaks on the last one; calm in the shop / between goals
  function mood() {
    try {
      if (SCR != 'game' || !G || G.over || G.mode == 'shop' || G.mode == 'boost' || G.mode == 'start') return { calm: 1, I: 0 };
      var I = Math.min(1, (G.t || 0) / 9); if (G.n >= PER - 1) I = Math.min(1, I + .15);
      return { calm: 0, I: I, final: (G.t || 0) >= 9 };
    } catch (e) { return { calm: 1, I: 0 }; }
  }
  var MD = { calm: 1, I: 0 }, wasCalm = false;
  function scheduleStep(t) {
    if (step % 16 == 0) MD = mood();
    if (step % 16 == 0) {
      if (MD.calm) { if (!calmS || !wasCalm || calmBars >= 16) newCalm(); calmBars++; SCALE = CALM[calmS].scale; }
      else SCALE = GSCALE[song.style] || GSCALE.disco;
      if (AC && musicOn) musicBus.gain.setTargetAtTime(mGain() * (MD.calm ? 1 : (song.style == 'chip' ? 2.4 : 1) * (2.2 - 1.2 * MD.I)), AC.currentTime, .5);
      wasCalm = MD.calm;
    }
    if (MD.calm) return CALMF[calmS](t);
    if (song.style != 'disco') return GAMEF[song.style](t);
    var s = step % 16, sec = SECTIONS[song.sec], deg = song.prog[song.bar % 4], root = song.key, ch = chordNotes(root + 12, deg), I = MD.I, cut = 1100 + 3200 * I;
    var lastBar = song.bar == 7, fill = lastBar && s >= 12;
    // pad: chord held each bar
    if (s == 0 && (sec != 'groove' || I > .6)) ch.forEach(function (n) { mVoice(mtof(n), t, 60 / bpm() * 4 * .95, 'sawtooth', sec == 'break' ? .028 : .018, sec == 'break' ? 900 + song.bar * 180 : cut); });
    // bass
    if (sec != 'intro' && sec != 'break') {
      var bp = song.drums == 1 ? [0, 0, 1, 0, 0, 1, 0, 1] : [0, 1, 0, 1, 0, 1, 0, 1];
      if (s % 2 == 0 && (bp[s / 2] || s == 0)) { var bn = root + sdeg(deg) - 12 + (s == 6 || s == 14 ? 12 : 0); mVoice(mtof(bn), t, .2, 'sawtooth', .06, 700); mVoice(mtof(bn) / 2, t, .22, 'sine', .1, 400); }
    }
    // arpeggio
    if (sec != 'outro' && s % 2 == 0) {
      var idx = s / 2, seq = song.arp == 'up' ? [0, 1, 2, 3] : song.arp == 'down' ? [3, 2, 1, 0] : song.arp == 'updown' ? [0, 1, 2, 3, 2, 1] : [0, 2, 1, 3];
      var tones = ch.concat([ch[0] + 12]), n = tones[seq[idx % seq.length]] + 12;
      mVoice(mtof(n), t, .16, I > .7 ? 'sawtooth' : 'triangle', sec == 'intro' ? .03 : .04 + .02 * I, cut + 800); if (I > .85 && s % 4 == 2) mVoice(mtof(n + 12), t, .1, 'square', .02, cut);
    }
    // lead melody
    if ((sec == 'melody' || sec == 'melody2' || sec == 'lift' || (I > .55 && sec != 'break' && sec != 'intro')) && s % 2 == 0) {
      var mi = ((song.bar % 2) * 8 + s / 2), d = song.mel[mi];
      if (d != null) { var ln = root + 24 + sdeg(d + deg) + (sec == 'lift' ? 12 : 0); mVoice(mtof(ln), t, .24, 'square', .028, 2000 + 1600 * I); mVoice(mtof(ln) * 1.005, t, .24, 'sawtooth', .015, 2600 + 1600 * I); if (I > .8) mVoice(mtof(ln + 12), t, .2, 'triangle', .02, 5000); }
    }
    // drums
    if (sec != 'intro' && sec != 'break' && sec != 'outro' || I > .7) {
      if (I < .15 ? s % 8 == 0 : s % 4 == 0) kick(t);
      if ((song.drums == 2 || I > .6) && s == 10) kick(t);
      if (I > .9 && (s == 14 || s == 7)) kick(t);
      if (I >= .15 && s % 8 == 4) snare(t);
      if (I > .3 && (s % 2 == 1 || song.drums == 1)) hat(t, s % 4 == 2 ? .08 : .04);
      if (I > .7 && s % 2 == 0) hat(t, .025);
      if ((fill || (I > .8 && song.bar % 4 == 3 && s >= 12)) && s % 1 == 0) snare(t + .01);
    }
    if (MD.final && s % 8 == 0) mVoice(mtof(root + 36 + (song.bar % 2 ? 3 : 0)), t, .45, 'sawtooth', .02, 6000);   // final-goal siren else if (sec == 'break' && song.bar >= 4 && s % 4 == 0) { kick(t); }
    else if (sec == 'outro' && s % 8 == 0) { kick(t); }
  }
  function schedule() {
    if (!AC) return;
    while (nextT < AC.currentTime + .15) {
      scheduleStep(nextT);
      if (MD.calm) { nextT += 60 / bpm() / 4; step++; continue; }
      nextT += 60 / bpm() / 4 * ((step % 2) ? .94 : 1.06);    // a little swing
      step++;
      if (step % 16 == 0) {
        song.bar++;
        if (song.bar >= 8) {
          song.bar = 0; song.sec++;
          if (song.sec % 2 == 0) song.prog = rnd(PROGS);
          song.mel = Math.random() < .5 ? song.mel.map(function (x) { return x == null ? x : x + rnd([0, 0, 1, -1, 2]); }) : motif();
          song.arp = rnd(['up', 'down', 'updown', 'skip']); song.drums = rnd([0, 1, 2]);
          if (song.sec >= SECTIONS.length) { var k = song.key; newSong(); song.key = (k + rnd([2, 3, 5, -2])) % 12 + 43; }
        }
      }
    }
  }
  function bpm() { return MD.calm ? (calmS ? CALM[calmS].bpm : 84) : 104 + 36 * MD.I; }
  var ilBar = 0;
  function cch(deg) { return chordNotes((song ? song.key : 45) + 12, deg); }
  var CALMF = {
    // soft chords and a slow, sparse arpeggio
    drift: function (t) {
      var s = step % 16, root = (song ? song.key : 45), deg = CALM.drift.prog[ilBar % 8], ch = cch(deg), b = 60 / bpm() * 4;
      if (s == 0) ch.forEach(function (n, i) { mVoice(mtof(n), t + i * .03, b * 1.1, 'triangle', .03, 900); mVoice(mtof(n) * 1.003, t, b, 'sine', .025, 700); });
      if (s == 0) mVoice(mtof(root + sdeg(deg) - 12), t, b * .75, 'sine', .07, 300);
      if (s % 4 == 2) { var n = ch[(s / 4 | 0) % 3] + 24; mVoice(mtof(n), t, .9, 'sine', .02, 2400); }
      if (s == 15) ilBar++;
    },
    // music box: a little major-key tune with echoes
    box: function (t) {
      var s = step % 16, root = (song ? song.key : 45) + 3, deg = CALM.box.prog[ilBar % 8], ch = chordNotes(root + 12, deg), b = 60 / bpm() * 4;
      if (s == 0) ch.forEach(function (n) { pad(mtof(n), t, b * 1.05, 'sine', .022, 1200); });
      if (s == 0 && ilBar % 2 == 0) mVoice(mtof(root + sdeg(deg) - 12), t, b * 1.6, 'sine', .06, 300);
      if (s % 2 == 0) { var d = calmMel[((ilBar % 2) * 8 + s / 2)]; if (d != null) { var f = mtof(root + 36 + sdeg(d + deg)); mVoice(f, t, .7, 'sine', .035, 6000, .45); mVoice(f * 2, t, .25, 'sine', .008, 6000); } }
      if (s == 15) { ilBar++; if (ilBar % 8 == 0) calmMel = Math.random() < .5 ? motif() : calmMel.map(function (x) { return x == null ? x : x + rnd([0, 1, -1]); }); }
    },
    // nebula: long swelling pads and the odd distant bell
    nebula: function (t) {
      var s = step % 16, root = (song ? song.key : 45), deg = CALM.nebula.prog[ilBar % 8], b = 60 / bpm() * 4;
      if (s == 0 && ilBar % 2 == 0) [0, 2, 4, 6].forEach(function (k, i) { var f = mtof(root + 12 + sdeg(deg + k)); pad(f, t + i * .2, b * 2.2, i % 2 ? 'triangle' : 'sine', .03, 700 + 300 * i); pad(f * 1.004, t, b * 2.2, 'sine', .015, 900); });
      if (s == 0 && ilBar % 2 == 0) pad(mtof(root + sdeg(deg) - 12), t, b * 2.2, 'sine', .07, 250);
      if (s % 4 == 0 && Math.random() < .3) mVoice(mtof(root + 36 + sdeg(rnd([0, 2, 4, 6, 7, 9]))), t, 1.6, 'sine', .025, 5000, .55);
      if (s == 15) ilBar++;
    },
    // lo-fi: warm electric-piano chords, soft kick and brushes
    lofi: function (t) {
      var s = step % 16, root = (song ? song.key : 45), deg = CALM.lofi.prog[ilBar % 8], ch = [0, 2, 4, 6].map(function (k) { return root + 12 + sdeg(deg + k); });
      var sw = s % 2 ? 60 / bpm() / 4 * .12 : 0; t += sw;
      if (s == 0 || s == 7 || (s == 11 && ilBar % 2)) ch.forEach(function (n, i) { mVoice(mtof(n), t + i * .012, s == 0 ? 1.4 : .5, 'sine', .028, 2200); mVoice(mtof(n) * 2.001, t, .3, 'sine', .006, 3000); });
      if (s == 0 || s == 8) { mVoice(mtof(root + sdeg(deg) - 12), t, .6, 'sine', .09, 260); }
      if (s == 0 || s == 10) { var o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(45, t + .12); g.gain.setValueAtTime(.22, t); g.gain.exponentialRampToValueAtTime(.0001, t + .2); o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + .25); }
      if (s == 4 || s == 12) nz(t, .12, .05, 'bandpass', 2400, 1200, .7, musicBus);
      if (s % 2 == 0) nz(t, .04, .018, 'highpass', 6000, null, 1, musicBus);
      if (s % 4 == 2 && Math.random() < .35) mVoice(mtof(root + 24 + sdeg(deg + rnd([2, 4, 6, 7]))), t, .5, 'triangle', .02, 2400, .3);
      if (s == 15) ilBar++;
    },
    // harp: rolling arpeggios over a soft pad
    harp: function (t) {
      var s = step % 16, root = (song ? song.key : 45) + 5, deg = CALM.harp.prog[ilBar % 8], b = 60 / bpm() * 4;
      var tones = [0, 2, 4, 7, 9, 11, 14, 11, 9, 7, 4, 2], d = tones[(s + (ilBar % 2) * 4) % tones.length];
      mVoice(mtof(root + 12 + sdeg(deg + d)), t, .9, 'triangle', .03, 3200, .2);
      if (s == 0) { pad(mtof(root + sdeg(deg)), t, b, 'sine', .05, 400); [0, 2, 4].forEach(function (k) { pad(mtof(root + 12 + sdeg(deg + k)), t, b, 'sine', .012, 900); }); }
      if (s == 15) ilBar++;
    }
  };
  function fillRoll(t, s, lastBar) { if (lastBar && s >= 12) snare(t + .01); }
  var GAMEF = {
    // synthwave: pulsing 8th-note bass, big snare, gliding lead with echo
    synth: function (t) {
      var s = step % 16, sec = SECTIONS[song.sec], deg = song.prog[song.bar % 4], root = song.key, ch = chordNotes(root + 12, deg), I = MD.I, b = 60 / bpm() * 4, lastBar = song.bar == 7;
      if (s == 0 && sec != 'outro') ch.forEach(function (n) { pad(mtof(n), t, b, 'sawtooth', .014 + .008 * I, 900 + 2600 * I); pad(mtof(n) * 1.006, t, b, 'sawtooth', .01, 1400 + 2000 * I); });
      if (sec != 'intro' && s % 2 == 0) { var bn = root + sdeg(deg) - 12 + (s % 4 == 2 && I > .4 ? 12 : 0); mVoice(mtof(bn), t, .18, 'sawtooth', .065, 450 + 900 * I); }
      if (sec != 'intro' && sec != 'break') {
        if (s % 8 == 0 || (I > .35 && s % 4 == 0)) kick(t);
        if (I > .1 && s % 8 == 4) { snare(t); nz(t, .35, .06, 'lowpass', 5000, 800, .5, musicBus); }
        if (I > .4 && s % 2 == 0) hat(t, .05); if (I > .75 && s % 2 == 1) hat(t, .03);
        fillRoll(t, s, lastBar);
      }
      if ((sec == 'melody' || sec == 'melody2' || sec == 'lift' || I > .5) && sec != 'break' && s % 2 == 0) { var d = song.mel[(song.bar % 2) * 8 + s / 2]; if (d != null) { var f = mtof(root + 24 + sdeg(d + deg) + (sec == 'lift' ? 12 : 0)); mVoice(f, t, .38, 'sawtooth', .022 + .01 * I, 1800 + 2400 * I, .35); mVoice(f * 1.008, t, .38, 'square', .012, 2000 + 2000 * I); } }
      if (I > .6 && sec != 'break') { var tn = ch.concat([ch[0] + 12])[[0, 1, 2, 3, 2, 1][s % 6]] + 24; mVoice(mtof(tn), t, .09, 'square', .014, 3000 + 2000 * I); }
      if (MD.final && s % 8 == 0) mVoice(mtof(root + 36 + (song.bar % 2 ? 3 : 0)), t, .45, 'sawtooth', .02, 6000);
    },
    // arcade: square-wave tune, triangle bass, noise drums, fast arps
    chip: function (t) {
      var s = step % 16, sec = SECTIONS[song.sec], deg = song.prog[song.bar % 4], root = song.key + 2, ch = chordNotes(root + 12, deg), I = MD.I, lastBar = song.bar == 7;
      if (s % 2 == 0 && sec != 'intro') { var bn = root + sdeg(deg + (s % 4 == 2 ? 4 : 0)) - 12; mVoice(mtof(bn), t, .14, 'triangle', .11, 2000); }
      if (sec != 'outro' && (sec != 'groove' || I > .3)) { var seq = [0, 1, 2, 1], tn = ch[seq[s % 4]] + 24 + (I > .7 && s % 8 >= 4 ? 12 : 0); if (I > .2 || s % 2 == 0) mVoice(mtof(tn), t, .07, 'square', .014 + .008 * I, 4000); }
      if ((sec == 'melody' || sec == 'melody2' || sec == 'lift' || I > .45) && sec != 'break') { var step2 = I > .7 ? 1 : 2; if (s % step2 == 0) { var d = song.mel[((song.bar % 2) * 8 + (s / 2 | 0)) % 16]; if (d != null) mVoice(mtof(root + 24 + sdeg(d + deg) + (sec == 'lift' ? 12 : 0)), t, step2 == 1 ? .1 : .17, 'square', .026 + .01 * I, 5000, .15); } }
      if (sec != 'intro' && sec != 'break') {
        if (s % 8 == 0 || (I > .5 && s == 10)) { nz(t, .08, .3, 'lowpass', 400, 80, 1, musicBus); mVoice(140, t, .08, 'triangle', .14, 600); }
        if (I > .1 && s % 8 == 4) nz(t, .1, .14, 'highpass', 1500, null, 1, musicBus);
        if (I > .3 && s % 2 == 1) nz(t, .02, .05, 'highpass', 8000, null, 1, musicBus);
        fillRoll(t, s, lastBar);
      }
      if (MD.final && s % 4 == 0) mVoice(mtof(root + 36 + (s % 8 ? 7 : 0)), t, .12, 'square', .018, 6000);
    },
    // dark pulse: 16th-note bass ostinato, four-on-the-floor, rising filter
    pulse: function (t) {
      var s = step % 16, sec = SECTIONS[song.sec], deg = song.prog[(song.bar >> 1) % 4], root = song.key, ch = chordNotes(root + 12, deg), I = MD.I, lastBar = song.bar == 7;
      var pat = [0, 0, 12, 0, 0, 7, 0, 12, 0, 0, 12, 0, 3, 0, 7, 0], bn = root - 12 + sdeg(deg) + pat[s];
      if (sec != 'intro' || s % 2 == 0) mVoice(mtof(bn), t, .11, 'sawtooth', .06, 300 + 1700 * I + (sec == 'lift' ? song.bar * 150 : 0));
      if (sec != 'break' && (sec != 'intro' || I > .3)) {
        if (s % 4 == 0) kick(t);
        if (I > .25 && (s == 4 || s == 12)) nz(t, .14, .16, 'bandpass', 1500, 1100, 1.2, musicBus);
        if (I > .15 && s % 4 == 2) nz(t, .12, .06, 'highpass', 7000, null, 1, musicBus);
        if (I > .6) hat(t, .025);
        fillRoll(t, s, lastBar);
      }
      if (I > .35 && (s == 6 || s == 14) && sec != 'intro') ch.forEach(function (n) { mVoice(mtof(n + 12), t, .12, 'sawtooth', .018, 1500 + 2500 * I, .4); });
      if ((sec == 'melody' || sec == 'melody2' || I > .7) && sec != 'break' && s % 4 == 0) { var d = song.mel[(song.bar % 2) * 8 + s / 2]; if (d != null) mVoice(mtof(root + 24 + sdeg(d + deg)), t, .3, 'square', .02 + .01 * I, 2500 + 2000 * I, .5); }
      if (MD.final && s % 8 == 0) mVoice(mtof(root + 36 + (song.bar % 2 ? 1 : 0)), t, .45, 'sawtooth', .022, 6000);
    }
  };
  function startMusic() {
    if (!ac()) return; if (!song) newSong();
    if (!echoIn) { echoIn = AC.createGain(); var dl = AC.createDelay(1), fb = AC.createGain(), lp = AC.createBiquadFilter(); dl.delayTime.value = .42; fb.gain.value = .38; lp.type = 'lowpass'; lp.frequency.value = 2600;
      echoIn.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(musicBus); }
    musicBus.gain.cancelScheduledValues(AC.currentTime); musicBus.gain.setTargetAtTime(mGain(), AC.currentTime, .4);
    if (!mTimer) { nextT = AC.currentTime + .08; mTimer = setInterval(schedule, 30); }
  }
  function stopMusic() { if (AC) musicBus.gain.setTargetAtTime(0, AC.currentTime, .15); clearInterval(mTimer); mTimer = null; }
  // silence everything when the game isn't on screen (another tab, another app, phone locked)
  document.addEventListener('visibilitychange', function () { try { if (!AC) return; if (document.hidden) AC.suspend(); else AC.resume(); } catch (e) {} });
  addEventListener('pagehide', function () { try { if (AC) AC.suspend(); } catch (e) {} });
  window.dvMusic = function () { mLv = NEXTLV[mLv]; ls('gf_dv_mvol', mLv); musicOn = mLv != 'off'; if (musicOn) startMusic(); else stopMusic(); try { DH = ''; draw(); } catch (e) {} };
  // sound effects: loud → quiet → off
  window.sfxToggle = function () { sLv = NEXTLV[sLv]; ls('gf_dv_svol', sLv); try { SFX.on = sLv != 'off'; } catch (e) {} if (AC) sfxBus.gain.setTargetAtTime(sGain(), AC.currentTime, .05); try { DH = ''; draw(); } catch (e) {} };
  window.sfxCtl = function () { return '<button class="sm" style="margin:0" onclick="sfxToggle()">' + (sLv == 'off' ? '<span>🔇</span> Sound off' : sLv == 'quiet' ? '<span>🔉</span> Sound quiet' : '<span>🔊</span> Sound loud') + '</button>'; };

  // ===================================================================== particles, flashes, banners
  var cv = document.createElement('canvas'), cx = cv.getContext('2d'), P = [], dpr = Math.min(2, devicePixelRatio || 1);
  cv.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9000';
  var flashEl = document.createElement('div');
  flashEl.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:8999;opacity:0;background:radial-gradient(circle at 50% 45%,#fff 0%,#ffd23f 25%,transparent 70%)';
  var bannerEl = document.createElement('div'); bannerEl.className = 'dv-banner';
  function mount() { if (!cv.parentNode) { document.body.appendChild(cv); document.body.appendChild(flashEl); document.body.appendChild(bannerEl); } }
  function resize() { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px'; }
  resize(); addEventListener('resize', resize);
  var running = false;
  function loop() {
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, innerWidth, innerHeight); cx.globalCompositeOperation = 'lighter';
    for (var i = P.length - 1; i >= 0; i--) {
      var p = P[i]; p.life -= p.d; if (p.life <= 0) { P.splice(i, 1); continue; }
      if (p.ring) { p.r += 6; cx.strokeStyle = p.c; cx.globalAlpha = p.life; cx.lineWidth = 4 * p.life; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 7); cx.stroke(); continue; }
      p.vy += .12; p.vx *= .985; p.x += p.vx; p.y += p.vy; cx.globalAlpha = p.life; cx.fillStyle = p.c; cx.beginPath(); cx.arc(p.x, p.y, p.r * (.5 + p.life), 0, 7); cx.fill();
    }
    cx.globalAlpha = 1;
    if (P.length) requestAnimationFrame(loop); else { running = false; cx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  function startFx() { mount(); if (!running) { running = true; requestAnimationFrame(loop); } }
  function burst(x, y, col, n, pow) {
    if (reduced) n = Math.min(n, 10); if (P.length > 900) n = Math.min(n, 20);
    for (var i = 0; i < n; i++) { var a = Math.random() * 6.283, s = (Math.random() * .8 + .2) * pow;
      P.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - pow * .25, life: 1, d: .008 + Math.random() * .014, r: 1.5 + Math.random() * 3.5, c: Math.random() < .3 ? '#fff' : col }); }
    startFx();
  }
  function ring(x, y, col) { P.push({ ring: 1, x: x, y: y, r: 4, life: 1, d: .025, c: col }); startFx(); }
  function shake(mag, ms) {
    if (reduced) return; var el = document.getElementById('app'); if (!el) return; var t0 = performance.now();
    (function f(t) { var k = 1 - (t - t0) / ms; if (k <= 0) { el.style.transform = ''; return; } el.style.transform = 'translate(' + ((Math.random() - .5) * mag * k) + 'px,' + ((Math.random() - .5) * mag * k) + 'px)'; requestAnimationFrame(f); })(t0);
  }
  function flash(v) { mount(); try { flashEl.animate([{ opacity: v }, { opacity: 0 }], { duration: 700, easing: 'ease-out' }); } catch (e) {} }
  function banner(txt) { mount(); bannerEl.textContent = txt; bannerEl.classList.remove('go'); void bannerEl.offsetWidth; bannerEl.classList.add('go'); }
  function lights(mode, ms) { var b = document.querySelector('.board'); if (!b) return; b.classList.add('dv-' + mode); setTimeout(function () { var bb = document.querySelector('.board'); if (bb) bb.classList.remove('dv-' + mode); }, ms || 1500); }
  function cellRect(i) { var c = document.querySelectorAll('.board .cell')[i]; return c ? c.getBoundingClientRect() : null; }
  function kindColor(k) { try { return (CC && CC[k]) || (DP[k] && DP[k].c) || (K[k] && K[k].c) || '#ffd23f'; } catch (e) { return '#ffd23f'; } }

  // ===================================================================== reels (the deal)
  var artCache = {};
  function artOf(p) { if (!p) return ''; var key = p.k + (p.k == 'sys' ? '' : ''); try { return artSafe(p); } catch (e) { return ''; } }
  function fillerArt() {
    var kinds = []; try { G.bag.forEach(function (p) { kinds.push(p.k); }); } catch (e) {}
    if (!kinds.length) kinds = ['g', 'r', 'b', 'p'];
    var k = rnd(kinds); if (!artCache[k]) { try { artCache[k] = artSafe(mk(k)); } catch (e) { artCache[k] = ''; } } return artCache[k];
  }
  DV.deal = async function (cs) {
    var board = document.querySelector('.board');
    if (!board || reduced) { G.cells = cs.slice(); G.fresh = -1; draw(); await wait(300); return; }
    var r = board.getBoundingClientRect(), cw = r.width / 5, ch = r.height / 4, sp = speed(), STRIP = 18;
    G.cells = cs.slice(); G.fresh = -1; draw();                        // final pieces, hidden under the reels
    board = document.querySelector('.board'); board.classList.add('dv-spinning');
    var layer = document.createElement('div'); layer.className = 'dv-reels';
    layer.style.cssText = 'position:fixed;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px;z-index:50;display:grid;grid-template-columns:repeat(5,1fr);pointer-events:none';
    var cols = [];
    for (var c = 0; c < 5; c++) {
      var col = document.createElement('div'); col.className = 'dv-col'; var st = document.createElement('div'); st.className = 'dv-strip';
      var h = '';
      for (var y = 0; y < 4; y++) h += '<div class="dv-sym" style="height:' + ch + 'px">' + artOf(cs[y * 5 + c]) + '</div>';
      for (var f = 0; f < STRIP; f++) h += '<div class="dv-sym" style="height:' + ch + 'px">' + fillerArt() + '</div>';
      st.innerHTML = h; col.appendChild(st); layer.appendChild(col); cols.push(st);
    }
    document.body.appendChild(layer);
    var base = 1150 / sp, gap = 260 / sp; play('whir', (base + gap * 4) / 1000);
    var jobs = cols.map(function (st, c) {
      return new Promise(function (res) {
        var dist = STRIP * ch, dur = base + gap * c, t0 = performance.now(), ticked = 0;
        st.style.transform = 'translateY(' + (-dist) + 'px)'; st.parentNode.classList.add('blur');
        (function f(now) {
          var t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 3.2);
          st.style.transform = 'translateY(' + (-dist * (1 - e)) + 'px)';
          if (t > .7) st.parentNode.classList.remove('blur');
          var passed = Math.floor(dist * e / ch); if (passed > ticked && t > .55) { ticked = passed; play('click', c); } else ticked = Math.max(ticked, passed);
          if (t < 1) requestAnimationFrame(f);
          else {
            try { st.animate([{ transform: 'translateY(10px)' }, { transform: 'translateY(-4px)' }, { transform: 'translateY(0)' }], { duration: 200, easing: 'ease-out' }); } catch (e) {}
            play('land', c); burst(r.left + cw * (c + .5), r.bottom - 6, '#8fe9ff', 8, 2.2); setTimeout(res, 120);
          }
        })(t0);
      });
    });
    await Promise.all(jobs);
    layer.remove(); var b2 = document.querySelector('.board'); if (b2) b2.classList.remove('dv-spinning');
    G.cells = cs; draw();
  };

  // Verdant texts show 3 instead of 5 while you own Verdant Grove
  try { [[AUR, 'g'], [K.g, 'd']].forEach(function (x) { var o = x[0], f = x[1], base = o[f];
    if (typeof base == 'string' && /\b5 Verdants\b/.test(base)) Object.defineProperty(o, f, { configurable: true, enumerable: true,
      get: function () { var n = 5; try { n = VGT(); } catch (e) {} return base.replace(/\b5 Verdants\b/, n + ' Verdants'); } }); }); } catch (e) {}
  try { if (typeof RI == 'object' && !RI.constel) RI.constel = ['✦', '#ffd36a']; } catch (e) {}   // Constellation relic colour (picture drawn below)
  try { if (typeof RI == 'object' && !RI.salvage) RI.salvage = ['🛰️', '#7fe0c8']; } catch (e) {}   // Orbital Salvage icon
  // Constellation: draw a small star pattern instead of an emoji (the shooting-star emoji is a square picture)
  try { if (typeof relicArt == 'function') { var _ra = relicArt; relicArt = function (r, sz) { var o = _ra(r, sz); if (!r || r.id != 'constel') return o;
    var P = [[30, 38], [44, 30], [58, 40], [72, 32], [64, 58], [46, 64], [36, 54]], L = [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [5, 6], [6, 0]], g = '';
    L.forEach(function (l) { g += '<line x1="' + P[l[0]][0] + '" y1="' + P[l[0]][1] + '" x2="' + P[l[1]][0] + '" y2="' + P[l[1]][1] + '" stroke="#fff3c4" stroke-width="2" stroke-opacity=".75"/>'; });
    P.forEach(function (p, i) { var s = i == 2 || i == 5 ? 5.5 : 3.8; g += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (s + 3) + '" fill="#ffe27a" opacity=".35"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + s + '" fill="#fffbe6"/>'; });
    return o.replace(/<text x="50" y="63"[^>]*>[\s\S]*?<\/text>/, g); }; } } catch (e) {}
  if (!DEVM) delete DV.deal;   // standard game: the game's own deal, no reels

  // ===================================================================== scoring effects
  var dingN = 0;
  DV.cell = function (i, f, c, isSys) {
    var r = cellRect(i); if (!r) return; var x = r.left + r.width / 2, y = r.top + r.height / 2, p = (G.cells || [])[i], col = p ? kindColor(p.k) : '#ffd23f';
    var big = isSys || f >= 10;
    play('ding', dingN++, big);
    if (f > 0 || c > 0) { burst(x, y, col, Math.min(60, 6 + Math.round(f * 1.5)), big ? 6 : 3.2); if (big) { ring(x, y, col); shake(6, 250); } }
  };
  DV.total = function (tf, rent) {
    dingN = 0; var ratio = rent ? tf / rent : 0, tier = ratio >= .9 ? 2 : ratio >= .45 ? 1 : 0;
    if (!tier) return; var b = document.querySelector('.board'); if (!b) return; var r = b.getBoundingClientRect(), mx = r.left + r.width / 2, my = r.top + r.height / 2;
    play('boom', tier == 2); play('fanfare'); shake(tier == 2 ? 24 : 12, tier == 2 ? 900 : 500); flash(tier == 2 ? .85 : .45);
    banner(tier == 2 ? 'MEGA FAME!' : 'BIG COMBO!'); lights('flash', 1600);
    burst(mx, my, '#ffd23f', tier == 2 ? 150 : 70, tier == 2 ? 11 : 8); burst(mx, my, '#ff3fd2', tier == 2 ? 110 : 45, tier == 2 ? 9 : 6); burst(mx, my, '#36e6ff', tier == 2 ? 80 : 30, tier == 2 ? 7 : 5);
    if (tier == 2) setTimeout(function () { burst(r.left + 30, r.top + 30, '#ffd23f', 60, 8); burst(r.right - 30, r.top + 30, '#36e6ff', 60, 8); play('boom', false); }, 350);
  };
  DV.goal = function () {
    play('goal'); lights('flash', 1700);
    for (var k = 0; k < 5; k++) setTimeout(function () { burst(innerWidth * (.15 + Math.random() * .7), innerHeight * (.15 + Math.random() * .35), rnd(['#ffd23f', '#ff3fd2', '#36e6ff', '#7dffb0']), 55, 7); play('click', 8); }, k * 220);
  };
  // reset the rising ding at the start of each spin
  if (typeof window.spin == 'function') { var spin0 = window.spin; window.spin = function () { dingN = 0; return spin0.apply(this, arguments); }; }

  // ===================================================================== lever
  var pull = 0, drag = null, lastN = 0;
  function canSpin() { if (!DEVM) return false; try { return G && !G.busy && G.mode == 'idle' && !G.over && SCR == 'game'; } catch (e) { return false; } }
  // two levers: a tall one beside the board on wide screens, a compact one next to SPIN on phones
  function lv() { var ls = document.querySelectorAll('.dv-lever'); for (var i = 0; i < ls.length; i++) if (ls[i].offsetParent) return ls[i]; return null; }
  function drawLever() {
    var all = document.querySelectorAll('.dv-lever');
    for (var i = 0; i < all.length; i++) { var L = all[i]; if (!L.offsetParent) continue; var arm = L.querySelector('.dv-arm'), knob = L.querySelector('.dv-knob'), H = L.clientHeight, kh = knob.offsetHeight || 42, top = H * .1, y = top + pull * H * .5;
      knob.style.top = (y - kh / 2) + 'px'; arm.style.top = y + 'px'; arm.style.height = Math.max(0, H * .7 - y) + 'px'; }
  }
  var release = function () {};
  function autoPull() { if (!canSpin()) return; ac(); var t0 = performance.now(), c = 0; (function f(t) { var k = Math.min(1, (t - t0) / 240); pull = 1 - Math.pow(1 - k, 2); var n = Math.floor(pull * 8); if (n > c) { play('click', n); c = n; } drawLever(); if (k < 1) requestAnimationFrame(f); else release(true); })(t0); }
  document.addEventListener('pointerdown', function (e) { var L = e.target.closest && e.target.closest('.dv-lever'); if (!L || !canSpin()) return; ac(); e.preventDefault(); drag = { y: e.clientY, p: pull, moved: false }; try { L.setPointerCapture(e.pointerId); } catch (x) {} });
  document.addEventListener('pointermove', function (e) { if (!drag) return; var L = lv(); if (!L) return; if (Math.abs(e.clientY - drag.y) > 4) drag.moved = true; pull = Math.max(0, Math.min(1, drag.p + (e.clientY - drag.y) / (L.clientHeight * .5))); var n = Math.floor(pull * 8); if (n > lastN) { play('click', n); lastN = n; } if (n < lastN) lastN = n; drawLever(); });
  document.addEventListener('pointerup', function () { if (!drag) return; var moved = drag.moved, p = pull; drag = null; lastN = 0; if (!moved) nudge(); else release(p > .6); });   // a tap doesn't spin: drag it down
  function nudge() { var from = pull, t0 = performance.now(); (function f(t) { var k = Math.min(1, (t - t0) / 420); pull = Math.sin(k * Math.PI) * .12; drawLever(); if (k < 1) requestAnimationFrame(f); else { pull = 0; drawLever(); } })(t0); try { G.msg = 'Drag the lever down to spin.'; draw(); } catch (e) {} }
  // phones: swipe down on the board to pull the lever (a tap still opens a planet's info)
  var sw = null;
  document.addEventListener('pointerdown', function (e) { if (e.pointerType == 'mouse' || !canSpin()) return; var b = e.target.closest && e.target.closest('.board'); if (!b) return; sw = { x: e.clientX, y: e.clientY, t: performance.now() }; }, true);
  document.addEventListener('pointermove', function (e) { if (!sw) return; var dy = e.clientY - sw.y, dx = Math.abs(e.clientX - sw.x); if (dy > 12 && dy > dx) { pull = Math.min(1, dy / 160); drawLever(); } }, true);
  document.addEventListener('pointerup', function (e) { if (!sw) return; var dy = e.clientY - sw.y, dx = Math.abs(e.clientX - sw.x), quick = performance.now() - sw.t < 900; sw = null;
    if (dy > 60 && dy > dx * 1.5 && quick && canSpin()) { ac(); release(true); } else if (pull) release(false); }, true);
  document.addEventListener('pointercancel', function () { if (sw) { sw = null; if (pull) release(false); } }, true);
  document.addEventListener('touchmove', function (e) { if (sw && e.cancelable) e.preventDefault(); }, { passive: false });
  document.addEventListener('keydown', function (e) { if ((e.key == ' ' || e.key == 'Enter') && e.target && e.target.classList && e.target.classList.contains('dv-lever')) { e.preventDefault(); autoPull(); } });
  // the game's SPIN button pulls the lever too
  if (typeof window.spinSafe == 'function') {
    var ss0 = window.spinSafe; window.spinSafe = function () { if (canSpin()) { if (!drag && pull == 0 && lv() && !DV._fromLever) { DV._fromLever = 1; autoPull(); DV._fromLever = 0; return; } play('clunk'); } return ss0.apply(this, arguments); };
    release = function (fire) { var from = pull, t0 = performance.now(); if (fire && canSpin()) { play('clunk'); DV._fromLever = 1; try { ss0(); } catch (e) {} DV._fromLever = 0; }
      (function f(t) { var k = Math.min(1, (t - t0) / 380), e = 1 - Math.pow(1 - k, 3); pull = from * (1 - e) + (k < 1 ? Math.sin(k * Math.PI * 3) * (1 - k) * .06 : 0); drawLever(); if (k < 1) requestAnimationFrame(f); else { pull = 0; drawLever(); } })(t0); };
  }

  // ===================================================================== screens
  function wrapHtml(fn, add) { if (typeof window[fn] != 'function') return; var f0 = window[fn]; window[fn] = function () { var h = f0.apply(this, arguments); try { var h2 = add(h); if (typeof h2 == 'string') h = h2; } catch (e) {} return h; }; }
  function leverHtml(cls) { return '<div class="dv-lever ' + cls + '" tabindex="0" role="button" aria-label="Pull the lever to spin"><div class="dv-base"></div><div class="dv-slot"></div><div class="dv-arm"></div><div class="dv-knob"></div></div>'; }
  wrapHtml('gameHtml', function (h) {
    var mb = '<button class="sm dv-mbtn" style="margin:0 6px" onclick="dvMusic()" title="Music: loud, quiet or off">' + mLabel() + '</button>';
    h = h.replace('<h1>✦ GALAXY FAME</h1>', DEVM ? '<h1>✦ GALAXY FAME <span class="dv-tag">DEVELOPER</span></h1>' + mb + bookBtn : '<h1>✦ GALAXY FAME</h1>' + mb);
    if (!DEVM) return h;
    var i = h.indexOf('<div class="bw"');
    if (i > -1) { var j = h.indexOf('>', i) + 1; h = h.slice(0, j) + leverHtml('dv-wide') + h.slice(j); }
    var g = h.indexOf('<div class="go">'); if (g > -1) { g += 16; h = h.slice(0, g) + leverHtml('dv-phone') + h.slice(g); }
    return h;
  });
  // ===================================================================== compendium (Devious Mode only)
  // Built from the game's own data each time it opens, so it always matches the current rules.
  window.dvBook = function (tab, q) {
    var old = document.getElementById('dv-book'); if (old && tab === undefined) { old.remove(); return; }
    tab = tab || (old && old.dataset.tab) || 'planets'; q = q !== undefined ? q : ((old && old.querySelector('input') || {}).value || '');
    var ql = q.toLowerCase(), hit = function (s) { return !ql || s.toLowerCase().indexOf(ql) > -1; };
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var row = function (art, name, tag, txt, col) { return '<div class="dvb-row">' + (art ? '<div class="dvb-art">' + art + '</div>' : '') + '<div><b style="color:' + (col || '#fff') + '">' + esc(name) + '</b>' + (tag ? ' <span class="dvb-tag">' + esc(tag) + '</span>' : '') + '<p>' + txt + '</p></div></div>'; };
    var body = '';
    try {
      if (tab == 'planets') {
        var groups = [['Planets', []], ['Emerging worlds', []], ['Other pieces', []], ['Formations', []]];
        var keys = []; [K, DP, IT, SG].forEach(function (o) { Object.keys(o || {}).forEach(function (k) { if (keys.indexOf(k) < 0) keys.push(k); }); });
        keys.forEach(function (k) {
          var n = nm(k), d = ds(k); if (k == 'g') d = d.replace(/\b[35] Verdants\b/, '5 Verdants (3 with Verdant Grove)'); if (!hit(n + ' ' + d)) return;
          var art = ''; try { art = orb({ k: k, life: 3, st: 0, s: 2, perm: 0 }, 1); } catch (e) {}
          if (SG[k]) groups[3][1].push(row(art, n, '', d));
          else if (DP[k]) groups[1][1].push(row(art, n, '', d));
          else if (IT[k]) groups[2][1].push(row(art, n, RN[IT[k].r], d, RC[IT[k].r]));
          else groups[0][1].push(row(art, n, '', d, CC[k]));
        });
        groups.forEach(function (g) { if (g[1].length) body += '<h4>' + g[0] + '</h4>' + g[1].join(''); });
      } else if (tab == 'auras') {
        var z = tsz('g');
        body += '<p class="dvb-note">A Solar System gives an aura of its main planet: 4 points when formed, +1 every spin it lands. Tier 1 starts when it forms; every ' + z + ' more points is the next tier. Points from several Systems of the same kind add up.</p>';
        Object.keys(AUR).forEach(function (k) { /* only auras a Solar System can give */ if (!K[k]) return; var n = K[k].n + ' Aura'; if (hit(n + ' ' + AUR[k])) body += row('', n, /tier/i.test(AUR[k]) ? '' : 'per tier', esc(k == 'g' ? AUR[k].replace(/\b[35] Verdants\b/, '5 Verdants (3 with Verdant Grove)') : AUR[k]), CC[k]); });
      } else {
        // grouped by what they improve (first match wins), A to Z inside each group
        var RG = [['Verdant', /verdant/i], ['Forest', /forest|canopy/i], ['Supernova', /supernova/i], ['Nebula', /nebula/i], ['Black Hole', /black hole/i],
          ['Cradle', /cradle/i], ['Chorus', /chorus/i], ['Volcanic', /volcan|magma/i], ['Ice Planet', /\bice\b|frost|glacier/i], ['Quarry, Asteroids and Destroyers', /quarr|asteroid|destroyer|rubble/i],
          ['Dust and stars', /dust|protostar|giant star|super giant|cloud/i], ['Moons, Factories and other pieces', /moon|factor|satellite|telescope|astronaut|harvester|radio|north star|comet/i],
          ['Solar Systems and Galaxies', /solar system|galax/i], ['Gold and the shop', /gold|💰|shop|relic|reroll/i], ['Choices and finds', /choice|pick|find|offer/i], ['Fame', /./]];
        var bin = RG.map(function () { return []; });
        RELICS.slice().sort(function (a, b) { return a.n < b.n ? -1 : 1; }).forEach(function (r) { var s = r.n + ' ' + r.d; if (r.id == 'fleet' || !hit(s)) return;
          var ov = { obsidian: 'Volcanic', dust: 'Solar Systems and Galaxies', ledger: 'Moons, Factories and other pieces' }[r.id];
          for (var i = 0; i < RG.length; i++) if (ov ? RG[i][0] == ov : RG[i][1].test(s)) { bin[i].push(row((function () { try { return relicArt(r, 40); } catch (e) { return ''; } })(), r.n, r.c + ' gold', esc(r.d))); break; } });
        RG.forEach(function (g, i) { if (bin[i].length) body += '<h4>' + g[0] + '</h4>' + bin[i].join(''); });
      }
    } catch (e) { body = '<p class="dvb-note">Could not read the game data (' + esc(e.message) + ').</p>'; }
    if (!body) body = '<p class="dvb-note">Nothing matches “' + esc(q) + '”.</p>';
    var tb = function (id, label) { return '<button class="' + (tab == id ? 'on' : '') + '" onclick="dvBook(\'' + id + '\')">' + label + '</button>'; };
    var html = '<div class="dvb-box"><div class="dvb-top"><b>📖 Compendium</b><button class="dvb-x" onclick="dvBook()" aria-label="Close">✕</button></div>' +
      '<div class="dvb-tabs">' + tb('planets', 'Planets') + tb('auras', 'Auras') + tb('relics', 'Relics') + '</div>' +
      '<input type="search" placeholder="Search…" value="' + esc(q) + '" oninput="dvBook(\'' + tab + '\', this.value)"><div class="dvb-list">' + body + '</div></div>';
    var d = old || document.createElement('div'); d.id = 'dv-book'; d.dataset.tab = tab; d.innerHTML = html;
    d.onclick = function (e) { if (e.target === d) dvBook(); };
    if (!old) document.body.appendChild(d);
    var inp = d.querySelector('input'); if (q && inp) { inp.focus(); inp.setSelectionRange(q.length, q.length); }
  };
  var bookBtn = '<button class="sm" style="margin:0 6px 0 0" onclick="dvBook()">📖 Compendium</button>';

  wrapHtml('menuHtml', function (h) { return (DEVM ? h.replace('✦ GALAXY FAME</h1>', '✦ GALAXY FAME</h1><div class="dv-tag dv-big">🛠️ DEVELOPER MODE</div>') : h).replace('<button class="sm" style="margin:0" onclick="sfxToggle()">', (DEVM ? bookBtn : '') + '<button class="sm dv-mbtn" style="margin:0 8px 0 0" onclick="dvMusic()" title="Music: loud, quiet or off">' + mLabel() + '</button><button class="sm" style="margin:0" onclick="sfxToggle()">'); });
  if (typeof window.draw == 'function') { var d0 = window.draw; window.draw = function () { var o = d0.apply(this, arguments); try { drawLever(); } catch (e) {} return o; }; }

  // ===================================================================== look
  var css = document.createElement('style');
  css.textContent = [
    'body{background:radial-gradient(1100px 700px at 50% -10%,#3a0f5c 0%,transparent 60%),radial-gradient(900px 600px at 100% 100%,#10284a 0%,transparent 60%),#07030f!important}',
    '.dv-rog{position:relative;container-type:size;border-radius:50%;background:radial-gradient(circle at 50% 45%,#5a0d14 0%,#2a0508 60%,#120204 100%);box-shadow:0 0 0 3px #ff2a3a,0 0 18px #ff2a3acc,inset 0 0 18px #ff2a3a88;animation:dvRog 1.6s ease-in-out infinite}',
    '.dv-rog-ship{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:2.1em;font-size:50cqw;transform:rotate(-45deg);filter:grayscale(1) sepia(1) hue-rotate(-50deg) saturate(6) brightness(.85) drop-shadow(0 0 6px #ff2a3a)}',
    '.dv-rog-flag{position:absolute;right:-4%;top:-6%;font-size:1.05em;font-size:20cqw;background:#120204;border:2px solid #ff2a3a;border-radius:50%;width:1.5em;height:1.5em;display:flex;align-items:center;justify-content:center;box-shadow:0 0 8px #ff2a3a}',
    '@keyframes dvRog{0%,100%{box-shadow:0 0 0 3px #ff2a3a,0 0 14px #ff2a3a99,inset 0 0 14px #ff2a3a66}50%{box-shadow:0 0 0 3px #ff5a5a,0 0 26px #ff2a3aee,inset 0 0 22px #ff2a3aaa}}',
    '.dv-tag{display:inline-block;vertical-align:middle;margin-left:8px;font-size:11px;letter-spacing:.2em;padding:4px 9px;border-radius:999px;color:#1a0016;background:#ff3fd2;box-shadow:0 0 14px #ff3fd2}',
    '.dv-tag.dv-big{display:block;width:max-content;margin:6px auto 0;font-size:13px}',
    '.board{position:relative;box-shadow:0 0 0 2px #ff3fd266,0 0 30px #ff3fd244,0 0 60px #36e6ff22,inset 0 0 40px #4a5cff22!important}',
    '.board.dv-spinning .cell>*:not(.dot){opacity:0}',
    '.board.dv-flash{animation:dvFlash .18s steps(2) 8}',
    '@keyframes dvFlash{0%{box-shadow:0 0 0 3px #ffd23f,0 0 50px #ffd23f,0 0 90px #ff3fd2}100%{box-shadow:0 0 0 3px #36e6ff,0 0 50px #36e6ff,0 0 90px #ff3fd2}}',
    '.board .cell.hot{animation:dvHot .45s ease-out}',
    '@keyframes dvHot{0%{background:radial-gradient(circle,#ffd23f88,transparent 70%)}100%{background:transparent}}',
    '.dv-reels .dv-col{position:relative;overflow:hidden;-webkit-mask-image:linear-gradient(180deg,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(180deg,transparent,#000 8%,#000 92%,transparent)}',
    '.dv-reels .dv-strip{position:absolute;left:0;right:0;top:0;will-change:transform}',
    '.dv-reels .dv-sym{display:flex;align-items:center;justify-content:center}',
    '.dv-reels .dv-sym>*{max-width:100%;max-height:100%}',
    '.dv-reels .dv-col.blur .dv-sym{filter:blur(2px) brightness(1.25)}',
    '.bw{position:relative}',
    '.dv-lever{position:absolute;right:-64px;top:4%;width:52px;height:88%;touch-action:none;user-select:none;cursor:grab;z-index:5}',
    '.dv-lever:focus-visible{outline:3px solid #36e6ff;outline-offset:4px;border-radius:12px}',
    '.dv-base{position:absolute;left:50%;bottom:22%;width:42px;height:64px;transform:translateX(-50%);border-radius:12px;background:linear-gradient(90deg,#4b2b8f,#24104e);box-shadow:0 0 0 2px #6d48c0}',
    '.dv-slot{position:absolute;left:50%;top:10%;bottom:30%;width:9px;transform:translateX(-50%);border-radius:6px;background:#05020d;box-shadow:inset 0 0 6px #000,0 0 0 2px #3b1f78}',
    '.dv-arm{position:absolute;left:50%;top:10%;width:11px;margin-left:-5.5px;border-radius:6px;background:linear-gradient(90deg,#d9d9e8,#8a87a8 60%,#f4f4ff)}',
    '.dv-knob{position:absolute;left:50%;width:42px;height:42px;margin-left:-21px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff 0 8%,#ff6fe2 18%,#e0129f 55%,#6a0447 100%);box-shadow:0 0 18px #ff3fd2,0 6px 10px #000a}',
    '.dv-lever.dv-phone{display:none}',
    (DEVM ? '@media(min-width:901px){.wrap>div:first-child{padding-right:64px}.dv-lever.dv-wide{right:-62px}}' : ''),
    '.board .cell{background-image:linear-gradient(45deg,transparent calc(50% - .7px),#3a47a03a 50%,transparent calc(50% + .7px)),linear-gradient(-45deg,transparent calc(50% - .7px),#3a47a03a 50%,transparent calc(50% + .7px))}',   // diagonal lines: diagonals count as touching
    '#dv-book{position:fixed;inset:0;z-index:9000;background:#03050cd0;display:flex;align-items:center;justify-content:center;padding:12px}',
    '.dvb-box{background:#0e1424;border:1px solid #2a3560;border-radius:16px;width:100%;max-width:640px;max-height:calc(100vh - 24px);display:flex;flex-direction:column;color:#e8eefc;font:14px/1.45 -apple-system,Segoe UI,Roboto,sans-serif}',
    '.dvb-top{display:flex;justify-content:space-between;align-items:center;padding:12px 14px 6px;font-size:18px}.dvb-x{background:none;border:0;color:#93a1c4;font-size:20px;cursor:pointer;padding:4px 8px}',
    '.dvb-tabs{display:flex;gap:6px;padding:0 14px}.dvb-tabs button{flex:1;background:#141c30;color:#c9d3f0;border:1px solid #2a3560;border-radius:10px;padding:8px;font:inherit;font-weight:700;cursor:pointer}.dvb-tabs button.on{background:#3a2a6a;color:#fff;border-color:#ff7ae0}',
    '#dv-book input{margin:10px 14px 6px;padding:9px 12px;border-radius:10px;border:1px solid #2a3560;background:#070a14;color:#fff;font:inherit;font-size:16px}',
    '.dvb-list{overflow:auto;padding:0 14px 14px}.dvb-list h4{margin:14px 0 4px;color:#93a1c4;font-size:12px;text-transform:uppercase;letter-spacing:.8px}',
    '.dvb-row{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid #1e2740}.dvb-row p{margin:2px 0 0;color:#c9d3f0}.dvb-art{width:40px;height:40px;flex:none}.dvb-art img,.dvb-art svg,.dvb-art .orb{width:40px!important;height:40px!important}',
    '.dvb-tag{font-size:11px;color:#93a1c4;border:1px solid #2a3560;border-radius:6px;padding:0 5px;margin-left:4px}.dvb-note{color:#93a1c4;margin:10px 0}',
    '.sumline.big{letter-spacing:normal!important;font-size:15px!important;margin-bottom:0!important}',   // the title's .big class made "Produces each spin" spaced out
    '.pill b span#tc{display:inline!important;font-size:inherit!important;color:inherit!important;letter-spacing:0!important;text-transform:none!important}',
    '@media(max-width:520px){.stats{grid-template-columns:repeat(3,1fr)!important;gap:6px!important}.stats .pill{padding:6px 10px!important}.stats .pill b{font-size:17px!important}.stats .pill b#fbar,.stats .pill b#fbar span{font-size:18px!important}}',
    (DEVM ? '@media(max-width:900px){.board::after{content:"↓ swipe down to spin";position:absolute;left:0;right:0;bottom:4px;text-align:center;font-size:10px;letter-spacing:.12em;color:#ffffff55;pointer-events:none}.board.dv-spinning::after{content:none}}' : ''),
    '@media(max-width:900px){.dv-lever.dv-wide{display:none}.dv-lever.dv-phone{display:block;position:relative;right:auto;top:auto;flex:0 0 44px;width:44px;height:96px;margin:-30px 0 -8px}.dv-phone .dv-base{width:34px;height:40px;bottom:12%}.dv-phone .dv-knob{width:34px;height:34px;margin-left:-17px}.dv-phone .dv-slot{width:7px}.dv-phone .dv-arm{width:9px;margin-left:-4.5px}}',
    '.dv-banner{position:fixed;left:50%;top:38%;z-index:9001;transform:translate(-50%,-50%) scale(.2);font:900 clamp(34px,9vw,84px)/1 system-ui,Impact,sans-serif;letter-spacing:.04em;color:#fff;',
    'text-shadow:0 0 10px #ffd23f,0 0 30px #ff3fd2,0 0 60px #36e6ff,0 5px 0 #5b1050;opacity:0;pointer-events:none;white-space:nowrap}',
    '.dv-banner.go{animation:dvBang 1.6s cubic-bezier(.2,1.6,.4,1) forwards}',
    '@keyframes dvBang{0%{opacity:0;transform:translate(-50%,-50%) scale(.2) rotate(-8deg)}18%{opacity:1;transform:translate(-50%,-50%) scale(1.1) rotate(3deg)}70%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-62%) scale(1.05)}}',
    '@media(prefers-reduced-motion:reduce){.board.dv-flash,.board .cell.hot{animation:none}.dv-banner.go{animation-duration:.01s}}'
  ].join('');

  // ===================================================================== star field (menu and in a run)
  (function () {
    var menu = true, skip = 0, c = document.createElement('canvas'), x = c.getContext('2d'), S = [], W = 0, H = 0, r = Math.min(2, devicePixelRatio || 1), on = false, last = 0, shoot = null;
    c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;display:none';
    function size() {
      W = innerWidth; H = innerHeight; c.width = W * r; c.height = H * r; S = [];
      var n = Math.min(420, Math.round(W * H / 2600));
      for (var i = 0; i < n; i++) { var d = Math.random(); S.push({ x: Math.random() * W, y: Math.random() * H, z: d, s: .4 + d * 1.6, tw: Math.random() * 6.3, hue: Math.random() < .12 ? (Math.random() < .5 ? '#ffd9a8' : '#a8c8ff') : '#fff' }); }
    }
    function frame(now) {
      if (!on) return; requestAnimationFrame(frame);
      if (!menu && (skip = (skip + 1) % 3)) return;   // in a run: a third of the frame rate, to stay light on phones
      var dt = Math.min(50, now - (last || now)); last = now;
      x.setTransform(r, 0, 0, r, 0, 0); x.clearRect(0, 0, W, H);
      for (var i = 0; i < S.length; i++) {
        var s = S[i];
        if (!reduced) { s.y += (.004 + s.z * .02) * dt; s.x -= s.z * .004 * dt; if (s.y > H + 2) { s.y = -2; s.x = Math.random() * W; } if (s.x < -2) s.x = W + 2; }
        var a = .35 + .65 * s.z * (reduced ? 1 : (.6 + .4 * Math.sin(now / 600 + s.tw)));
        x.globalAlpha = a; x.fillStyle = s.hue;
        if (s.s > 1.5) { x.beginPath(); x.arc(s.x, s.y, s.s, 0, 6.283); x.fill(); x.globalAlpha = a * .15; x.beginPath(); x.arc(s.x, s.y, s.s * 3, 0, 6.283); x.fill(); }
        else x.fillRect(s.x, s.y, s.s, s.s);
      }
      if (!reduced) {
        if (!shoot && Math.random() < dt / 4000) shoot = { x: Math.random() * W * .8 + W * .2, y: Math.random() * H * .4, l: 0 };
        if (shoot) { shoot.l += dt; var p = shoot.l / 900, sx = shoot.x - p * 420, sy = shoot.y + p * 210, g = x.createLinearGradient(sx, sy, sx + 90, sy - 45);
          g.addColorStop(0, 'rgba(255,255,255,' + (1 - p) + ')'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.globalAlpha = 1; x.strokeStyle = g; x.lineWidth = 2;
          x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + 90, sy - 45); x.stroke(); if (p >= 1) shoot = null; }
      }
      x.globalAlpha = 1;
    }
    function check() {
      var want = !document.hidden; menu = typeof SCR != 'undefined' && SCR == 'menu'; c.style.opacity = menu ? 1 : .6;
      if (want && !on) { if (!c.parentNode) document.body.appendChild(c); if (!S.length) size(); c.style.display = 'block'; on = true; last = 0; requestAnimationFrame(frame); }
      else if (!want && on) { on = false; c.style.display = 'none'; }
    }
    addEventListener('resize', function () { if (S.length) size(); });
    setInterval(check, 250); check();
  })();
  document.head.appendChild(css);
  // ===================================================================== forming a System: what each piece still has to give
  window.formTag = function (p) {
    if (!p) return '';
    if (p.k == 'r' && !p.planted && !p.seed) return '<small style="display:block;color:#52e58b;font-size:11px">🌱 hasn\'t planted yet</small>';
    if (p.k == 'b') { var l = Math.max(0, p.life || 0); return '<small style="display:block;color:#ff70e8;font-size:11px">⏳ ' + l + ' spin' + (l == 1 ? '' : 's') + ' left</small>'; }
    return '';
  };

  // ===================================================================== old saves
  // Upgrades bought above today's max in older versions (e.g. Starting Fleet level 3) are brought down to the max,
  // so older saves have no edge over new ones.
  try { var _cap = false; UP.forEach(function (u) { if (M.up && (M.up[u.id] || 0) > u.max) { M.up[u.id] = u.max; _cap = true; } }); if (_cap) save(); } catch (e) {}

  // ===================================================================== campaign
  // Opens once every Observatory upgrade is maxed (Leeroy Jenkins not needed). Each chapter costs 200 shards and
  // opens after the one before it is beaten. Chapter runs use Prestige 10 rules, Leeroy is off, they give
  // Star Shards as normal but stay off the leaderboard, best score and stats. Developer Mode: every chapter free.
  var CHAP = [
    { n: 'Chapter 1 · The Dust Reaches',
      story: 'Your father charted half the known stars, and his star maps still hang in every observatory. Today the Star Council handed you a sector of your own: the Dust Reaches, a grey drift of cosmic dust that no planner has ever wanted. The others laugh when they hear where you are going. You don\'t. Somewhere under all that dust is a sky worth seeing, and you are going to make it shine.',
      rules: 'Prestige 10 rules. You start with 2 fewer planets but 2 Cosmic Dusts. Whenever a Supernova burns out on the board, 2 Cosmic Dusts drift into your bag. Reach every fame goal to win.',
      ending: 'The last fame goal lights up across the Reaches. Where there was only grey dust, young stars now burn, and passing ships are already changing course to see them. At the Star Council, nobody is laughing anymore. That night a single message arrives from your father: "I knew you would."' }
    ,{ n: 'Chapter 2 · Pirates in the Reaches',
      story: 'Word travels fast. The Reaches now shine bright enough to be seen three systems away, and not everyone who comes to look is friendly. Your new sector has no patrols and no beacons, and a rogue crew of mining pirates has already slipped in to strip your asteroid fields bare. Rebuild what they break, keep the sector shining, and show these troublemakers this is no longer a place they can take from.',
      rules: 'Prestige 10 rules. A Rogue Destroyer starts in your bag. He shoots nearby Asteroids and grows from every one he takes, but he never scores fame for you, and nothing he destroys pays you anything. He can\'t be removed. Reach every fame goal to win.',
      ending: 'The last pirate ship limps out of the Reaches with an empty hold. Patrol beacons now ring the sector, and the miners who stayed behind work under your flag. The Star Council sends an inspector, who leaves a single line in the records: "Sector secure."' }
  ];
  var CAMP_COST = 200;
  // Chapter 2's pirate: a Destroyer that never scores and pays you nothing (kept out of picks, shops and odds)
  try { Object.defineProperty(IT, 'rog', { value: { n: 'Rogue Destroyer', e: '🏴‍☠️', r: 2, d: 'A pirate ship. Shoots nearby Asteroids and grows from them, but never scores fame for you. Can\'t be removed.' }, enumerable: false, configurable: true }); } catch (e) {}
  // he blocks his square but counts as nothing for any other piece (no touching bonus, no kind, nothing to eat)
  if (typeof window.score == 'function') { var sc0 = window.score; window.score = function (cs, b) {
    if (!cs || !cs.some(function (c) { return c && c.k == 'rog'; })) return sc0.apply(this, arguments);
    var c2 = cs.map(function (c) { return c && c.k == 'rog' ? null : c; }), r = sc0.call(this, c2, b);
    cs.forEach(function (c, i) { if (c && c.k == 'rog') { r.f[i] = 0; if (r.c) r.c[i] = 0; } }); return r; }; }
  // his own look: a red pirate gunship, not the blue item badge
  if (typeof window.orb == 'function') { var ob0 = window.orb; window.orb = function (p) { if (!p || p.k != 'rog') return ob0.apply(this, arguments);
    return '<div class="art dv-rog"><div class="dv-rog-ship">🚀</div><div class="dv-rog-flag">☠️</div>' + (p.rg ? '<span class="pip" style="color:#ff5a5a">' + p.rg + '</span>' : '') + '</div>'; }; }
  window.rogEv = function (cs) { var ev = []; cs.forEach(function (c, i) { if (!c || c.k != 'rog') return;
    var t = nb(i, 1).filter(function (j) { var x = cs[j]; return x && !x.dead && (x.k == 'ast' || x.k == 'bas'); });
    if (t.length) { t.forEach(function (j) { cs[j].dead = 1; }); ev.push({ s: i, t: t }); } }); return ev; };

  function CM() { M.camp = M.camp || { own: {}, won: {} }; M.camp.own = M.camp.own || {}; M.camp.won = M.camp.won || {}; return M.camp; }
  // the Campaign opens the first time you win a run at Prestige 10
  function campOpen() { return DEVM || !!CM().open; }
  (function () { if (CM().open) return; var beat = false;      // players who beat P10 before the Campaign existed
    try { var lb = JSON.parse(localStorage.getItem('gf_lb') || 'null'); if (lb && lb.by && lb.by[10] && lb.by[10].goals >= 10) beat = true; } catch (e) {}
    try { var st = JSON.parse(localStorage.getItem('gf_stats') || 'null'); if (st && st.runs && st.runs.some(function (r) { return r.p >= 10 && r.end == 'win'; })) beat = true; } catch (e) {}
    if (beat) { CM().open = 1; CM().fresh = 1; save(); } })();
  var CAMP_MSG = 'You beat Prestige 10. A new sector awaits: open 📜 Campaign on the menu.';
  function chOwned(i) { return DEVM || !!CM().own[i]; }
  function chWon(i) { return !!CM().won[i]; }
  function chReady(i) { return DEVM || i == 1 || chWon(i - 1); }      // can be bought / played
  var campNext = 0;
  if (typeof window.PV == 'function') { var pv0 = window.PV; window.PV = function () { if ((typeof G != 'undefined' && G && G.camp) || campNext) return PEFF[9] || pv0(); return pv0(); }; }
  window.campBuy = function (i) { if (chOwned(i) || !chReady(i) || M.shards < CAMP_COST) return; M.shards -= CAMP_COST; CM().own[i] = 1; save(); draw(); };
  window.campPlay = function (i) { if (!chOwned(i) || !chReady(i)) return; campNext = i; try { newGame(); } finally { campNext = 0; }
    G.camp = i; G.lj = 0; if (i == 1) { var _lose = 2; while (_lose > 0) { var _pl = G.bag.filter(function (x) { return K[x.k]; }); if (!_pl.length) break; G.bag.splice(G.bag.indexOf(_pl[R(_pl.length)]), 1); _lose--; }   // 2 fewer random planets, then your pick if there are not enough
      if (_lose > 0) G.startLeft = Math.max(0, G.startLeft - _lose); G.bag.push(mk('j'), mk('j')); if (G.startLeft <= 0) { G.mode = 'idle'; } } if (i == 2) G.bag.push(mk('rog')); G.msg = '📜 ' + CHAP[i - 1].n.split(' · ')[0] + (G.mode == 'start' ? ': pick your starting planets, then spin.' : ': spin when ready.'); DH = ''; draw(); };
  window.showCamp = function () { if (CM().fresh) { CM().fresh = 0; save(); } SCR = 'camp'; draw(); };
  window.campBurn = function () { if (G && G.camp == 1) { G.bag.push(mk('j'), mk('j')); G._cb = (G._cb || 0) + 2; } };
  function campHtml() {
    var h = '<div class="hd"><h1>📜 CAMPAIGN</h1><button class="sm" style="margin:0" onclick="showMenu()">← Back</button></div>' +
      '<p style="color:var(--mu);text-align:center">✨ ' + M.shards + ' Star Shards' + (DEVM ? ' · Developer Mode: every chapter is unlocked for testing' : '') + '</p>';
    // until Chapter 1 is bought, only this explanation shows; after that it is gone for good
    if (!CM().own[1]) h += '<div class="box" style="max-width:560px;margin:14px auto;text-align:left;line-height:1.55">Campaign missions do not count for the leaderboards or your best score. Leeroy Jenkins mode is always off. You still earn Star Shards.</div>';
    for (var i = 1; i <= CHAP.length; i++) {
      if (!DEVM && i > 1 && !chWon(i - 1)) break;
      var c = CHAP[i - 1], own = chOwned(i), won = chWon(i);
      h += '<div class="box" style="max-width:560px;margin:14px auto;text-align:left"><h3>' + c.n + (won ? ' <span style="color:var(--gd)">✓ beaten</span>' : '') + '</h3>' +
        (own ? '<div style="border:1px solid var(--ln);border-radius:12px;padding:12px 14px;margin:8px 0;background:#0008;font-style:italic;line-height:1.55">' + c.story + '</div>' +
          '<div style="margin:10px 0"><b style="color:var(--gd)">Challenge</b><br><span style="font-size:14px">' + c.rules + '</span></div>' +
          '<button class="spin" style="max-width:320px;width:100%" onclick="campPlay(' + i + ')">START</button>'
             : '<button class="spin" style="max-width:320px;width:100%" ' + (M.shards < CAMP_COST ? 'disabled' : '') + ' onclick="campBuy(' + i + ')">UNLOCK · ' + CAMP_COST + ' ✨</button>') + '</div>';
    }
    if (chWon(CHAP.length) || DEVM) h += '<p style="color:var(--mu);text-align:center">More chapters coming soon.</p>';
    return h;
  }
  if (typeof window.draw0 == 'function') { var dz0 = window.draw0; window.draw0 = function () { if (SCR == 'camp') { var a = document.getElementById('app'); DH = ''; a.innerHTML = campHtml(); return; } return dz0.apply(this, arguments); }; }
  wrapHtml('menuHtml', function (h) { if (!campOpen()) return h;
    var note = CM().fresh ? '<div class="box" style="max-width:420px;margin:10px auto 0;border:1px solid var(--gd);font-size:13px">📜 <b style="color:var(--gd)">Campaign unlocked!</b> ' + CAMP_MSG + '</div>' : '';
    return h.replace('🔭 Observatory · permanent upgrades</button>', '🔭 Observatory · permanent upgrades</button><br><button class="sm" style="margin-top:10px" onclick="showCamp()">📜 Campaign</button>' + note); });
  wrapHtml('gameHtml', function (h) {
    if (G && G.over && G.campNew && !G.camp) h = h.replace('<button class="sm" onclick="newGame()">New run</button>', '<div class="box" style="border:1px solid var(--gd);margin:12px 0"><h3 style="margin:0">📜 Campaign unlocked!</h3><small>' + CAMP_MSG + '</small></div><button class="sm" onclick="showCamp()">📜 Campaign</button><button class="sm" onclick="newGame()">New run</button>');
    if (!G || !G.camp) return h;
    var tag = '<span class="dv-tag" style="background:#ffd36a;box-shadow:0 0 12px #ffd36a">📜 CHAPTER ' + G.camp + '</span>';
    h = h.replace('GALAXY FAME', 'GALAXY FAME ' + tag);
    if (G.over) { var won = G.over == 'win';
      var box = '<div class="box" style="border:1px solid var(--gd);margin:12px 0"><h3 style="margin:0">📜 ' + CHAP[G.camp - 1].n + '</h3>' + (won ? '<div style="border:1px solid var(--ln);border-radius:12px;padding:12px 14px;margin:8px 0;background:#0008;font-style:italic;line-height:1.55;text-align:left">' + (CHAP[G.camp - 1].ending || '') + '</div><small>Chapter beaten!' + (G.camp < CHAP.length ? ' The next chapter can now be unlocked.' : '') + '</small>' : '<small>Not this time. Retry the chapter to take another shot.</small>') + '</div>';
      h = h.replace('<button class="sm" onclick="newGame()">New run</button>', box + (won ? '<button class="sm" onclick="showCamp()">📜 Campaign</button><button class="sm" onclick="newGame()">New run</button>' : '<button class="sm" onclick="campPlay(' + G.camp + ')">🔁 Retry chapter</button><button class="sm" onclick="showCamp()">📜 Campaign</button>')); }
    return h; });
  // a chapter win marks the chapter beaten and never moves your Prestige
  if (typeof window.finish == 'function') { var cf0 = window.finish; window.finish = function (r) {
    if (!(G && G.camp)) { var o0 = cf0.apply(this, arguments); try { if (r == 'win' && PLV() >= 10 && !CM().open) { CM().open = 1; CM().fresh = 1; G.campNew = 1; save(); } } catch (e) {} return o0; }
    var sp = M.prestige, spl = M.plvl, out = cf0.apply(this, arguments);
    M.prestige = sp; M.plvl = spl; G.prestigeUp = false; if (r == 'win') CM().won[G.camp] = 1; save(); return out; }; }
  // keep the chapter with a saved run
  if (typeof window.saveRun == 'function') { var cs0 = window.saveRun; window.saveRun = function () { var o = cs0.apply(this, arguments);
    try { if (G && G.camp && !G.over) { var r = JSON.parse(localStorage.getItem('gf_run') || 'null'); if (r) { r.camp = G.camp; localStorage.setItem('gf_run', JSON.stringify(r)); } } } catch (e) {} return o; }; }
  if (typeof window.resumeRun == 'function') { var cr0 = window.resumeRun; window.resumeRun = function () {
    var ch = 0; try { ch = (JSON.parse(localStorage.getItem('gf_run') || 'null') || {}).camp || 0; } catch (e) {}
    campNext = ch; var ok; try { ok = cr0.apply(this, arguments); } finally { campNext = 0; }
    if (ok && ch) { G.camp = ch; G.lj = 0; DH = ''; draw(); } return ok; }; }

  try { DH = ''; draw(); } catch (e) {}
})();
