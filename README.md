# Galaxy-Fame
Build a galaxy full of planets. Earn fame. Meet the demands of the people.  Star Fame is a space roguelike. Develop a star chart, and watch neighbors trigger each other in chains of fame. Every few spins the people demand more, and the only way to keep up is to build something bigger: a solar system, then a whole galaxy.

## Leaderboard

`board.html` is the global leaderboard (Today and All time). Scores are stored in a Supabase
database run by **archdevious** - ask them about the board, resetting scores or removing a
cheater. Nothing to host: it works straight from GitHub Pages.

- A finished run is sent once, at the end of the run (Supabase function `gf_submit`).
- Ranked by fame goals reached, then total fame earned in the run. Each player's best run counts.
- Players set their board name on the title screen or the board page.
- Your own best run is also remembered in your browser and shown on the title screen.
- The key in the code is Supabase's public key: it can only read scores and submit runs.
