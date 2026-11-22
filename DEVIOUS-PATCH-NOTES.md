# Devious Mode: changes vs the standard game

Everything below is in the standard game. Devious Mode is the same game (same leaderboard, best score, stats and saved run); its only difference is the slot-machine UI: pull the lever and the planets spin before they land.

## Bug fixes
- **SPIN unlocked mid-spin:** on long spins (~10s+) the stall check said "Recovered from a stall" and re-enabled SPIN while the spin was still running. Now it only steps in if nothing has changed for 10 seconds.
- **Lag that grew through a run (worst on phones):** every redraw wrote each planet's full ~200 KB picture into the page, so a full board was a ~10 MB page rebuilt many times per spin. Pictures are now shared, not copied: late-game spins took about half as long and ran about twice as smooth in a slow-phone test.
- **Forests scored 0** unless you had Forests inside Solar Systems (since v157 loose Forests weren't counted). They count again, as the description says.
- **Solar System pictures** could show another System's planets (the saved picture ignored Cradles, Choruses and Quarries). Each System now shows its own planets.
- **Closing the page mid-step lost progress:** the run was only saved at the end of a spin, so a planet pick, a shop visit, relics bought or the "find more often" choice were lost. Those are saved now too.
- **Continue run** flashed the new-run "pick your starting planet" screen before showing your run.
- **Credits number** showed tiny under the 💰.
- **Rubble Rights** did nothing. Now Quarries get +4 per Asteroid (instead of +2).
- **Prism Lens:** the Nebula gets +2 ⭐ as the text says (was +1).
- **Info popup:** Green Thumb and Forest Crown showed +1 (real bonus is +2); Canopy Crown was missing.
- **Super Giant banner** said "Worth 30" (it's 31).
- **Star Shards:** ending a run right away no longer gives 4 free shards.

## Rule change
- **Chorus:** scores 1, 2, 3… in order. Choruses inside Solar Systems count first, then the board continues the count.

## Clearer text (numbers unchanged)
- Bonuses now say what they add ("+1 ⭐ more", "1 fewer") instead of a fixed total, so they read right when they stack: Prestige III and IV · Time Dilation · Heavy Munitions · Prospector's Charter · Heirloom Seeds · Fame Dividend · Rubble Rights · Verdant Grove · Wide Lens
- Reworded to be shorter or clearer: Verdant Aura · Thick Dust · Dust Compactor · Volcanic · Obsidian Shield · Giant Star · Cosmic Ledger · Event Horizon · Gravity Well · Prestige VI and VIII · Starting Fleet

## New in Devious Mode
- Slot-machine spin: drag the lever down (or swipe down on the board on phones) and the reels spin and land column by column.
- Music (on by default): 4 game songs that build with each fame goal and peak on the last one, and 5 calm songs for the menu, shop and between goals.
- Music and Sound buttons cycle loud / quiet / off.
- Scoring sounds rise in pitch with every piece that scores, with no cap.
- Speed options 1x, 2x, 3x, 5x.
- Planets light up as they score; big spins shake the screen with explosions and a BIG COMBO / MEGA FAME banner; fireworks on fame goals.
- A click sound on every button; a Music button and a moving star field on the main menu.
- Compact stats row on phones.
