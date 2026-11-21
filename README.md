# Galaxy-Fame
Build a galaxy full of planets. Earn fame. Meet the demands of the people.  Star Fame is a space roguelike. Develop a star chart, and watch neighbors trigger each other in chains of fame. Every few spins the people demand more, and the only way to keep up is to build something bigger: a solar system, then a whole galaxy.

## Daily leaderboard

`board.html` is the daily board. Scores are saved by a tiny server in `server/server.js`
(plain Node 16+, no packages). **GitHub Pages can't run it** - on Pages the game plays fine
but scores aren't saved. To get a working board, run the server on a host that keeps Node
alive (Render, Railway, Fly.io, a VPS or a spare PC):

- Start command: `npm start` (or `node server/server.js`)
- Port: read from `PORT`, which hosts set for you (default 3000)
- Storage: `data/scores.json`, created on first run. On hosts that wipe files on redeploy,
  mount a disk at `data/` to keep scores.

Then play at `http://your-host/` and see the board at `http://your-host/board.html`.

The board ranks each player's best run of the day: most fame goals reached first, then most
total fame earned in the run. Scores are trusted as posted - it's a board for friends.
