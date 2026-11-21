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

If an upload of `index.html` drops that line, the GitHub Action
`.github/workflows/keep-leaderboard-line.yml` puts it back automatically within a minute.

- Ranked by total fame earned in the run (the final score). Each player's best run counts.
- Players set their board name on the title screen or the board page.
- The key in the code is Supabase's public key: it can only read scores and submit runs.
