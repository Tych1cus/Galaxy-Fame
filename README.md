# Galaxy-Fame
Build a galaxy full of planets. Earn fame. Meet the demands of the people.  Star Fame is a space roguelike. Develop a star chart, and watch neighbors trigger each other in chains of fame. Every few spins the people demand more, and the only way to keep up is to build something bigger: a solar system, then a whole galaxy.

## Leaderboard

`board.html` is the global leaderboard (Today and All time). Scores are stored in a Supabase
database run by **archdevious** - ask them about the board, resetting scores or removing a
cheater. Nothing to host: it works straight from GitHub Pages.

All leaderboard code lives in **`leaderboard.js`** (leaderboard, personal best, Total fame box,
Final score). Game builds don't need to include any of it: `index.html` only needs this one
line before `</body>`:

    <script src="leaderboard.js"></script>

After every upload of `index.html`, the GitHub Action `.github/workflows/keep-leaderboard-line.yml`
runs `tools/apply_patches.py`, which puts that line back if it's missing and re-applies archdevious's
game fixes listed in `tools/patches.json`. A fix whose spot in the code has changed is skipped (never
forced) and listed as NEEDS A LOOK in `tools/STATUS.md`.

- Ranked by total fame earned in the run (the final score). Each player's best run counts.
- Each prestige level has its own board (Normal, P1-P10). A run counts on its own level and every
  level below it, so a P3 run shows on the P3, P2, P1 and Normal boards but not P4 and up.
- Players set their board name on the title screen or the board page.
- `stats.html` shows each player's own stats (runs, scores, where runs end, picks, relics). They are
  kept only in that player's browser and are recorded by `leaderboard.js` too.
- The key in the code is Supabase's public key: it can only read scores and submit runs.
