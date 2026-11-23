# Developer Mode: changes vs the standard game

Everything below is in the standard game. Developer Mode is the same game (same leaderboard, best score, stats and saved run); its only difference is the slot-machine UI: pull the lever and the planets spin before they land.

## Bug fixes
- **Glacial Lens** reworked: Ice Planets get +2 ⭐ for each piece touching them (inside a System or Galaxy: for each piece touching it). Costs 6 gold.
- **Permafrost** costs 4 gold.
- **Constellation and Orbital Salvage showed up several times in the shop**: two edits shared one spot, so every automatic run after an upload added another copy. Now each is added once, and extra copies are cleaned up automatically.
- **Volcanic in a System** with Magma Core got +6 instead of +3, and Black Hole damage could land on the wrong Volcanic. Now +3, and each keeps its own damage.
- **Nebula Halo** now also works for Nebulas inside Solar Systems and Galaxies (+1 per piece 2 away from the System).
- **Cosmic Dust** text: dropped "Not a planet: it never joins a Solar System."
- **Quarry aura** had no text (banners said "undefined"). It now counts every Quarry, including those inside Solar Systems and Galaxies (each counts the Asteroids touching its System or Galaxy), and reads: All Quarries (in Systems too) +2 ⭐ per touching Asteroid, and Asteroids and Big Asteroids 15% more often (per tier). It no longer adds Destroyer range.
- **Asteroid aura** removed (Asteroids can't form a Solar System, so it could never be reached).
- **Heavy Munitions** now also gives +1 Destroyer range (moved from the auras).
- **Aura text** said "needs tier 1 (10/20 aura)"; tier 1 actually starts when the System forms. Now says "needs a <kind> Solar System". Compendium note fixed the same way.
- **Prestige box** on the menu is wider so P9 and P10 fit inside (buttons wrap on small phones).
- **Cool Kid** gave +1 aura to every Solar System each spin; now each aura gets +1 in total each spin (only once per aura kind, and only if a System of that kind is on the board). Text: "Each aura gains +1 more each spin."
- **SPIN unlocked mid-spin:** on long spins (~10s+) the stall check said "Recovered from a stall" and re-enabled SPIN while the spin was still running. Now it only steps in if nothing has changed for 10 seconds.
- **Lag that grew through a run (worst on phones):** every redraw wrote each planet's full ~200 KB picture into the page, so a full board was a ~10 MB page rebuilt many times per spin. Pictures are now shared, not copied: late-game spins took about half as long and ran about twice as smooth in a slow-phone test.
- **Forests scored 0** unless you had Forests inside Solar Systems (since v157 loose Forests weren't counted). They count again, as the description says.
- **Solar System pictures** could show another System's planets (the saved picture ignored Cradles, Choruses and Quarries). Each System now shows its own planets.
- **Closing the page mid-step lost progress:** the run was only saved at the end of a spin, so a planet pick, a shop visit, relics bought or the "find more often" choice were lost. Those are saved now too.
- **Solar System picture** showed blank white planets (since the lag fix). It shows every planet in the System again.
- **"Produces each spin"** in the Solar System popup was spaced out letter by letter (it borrowed the title's style).
- **Solar System popup math** used each planet's plain value, not what it scores in that System: Cradle growth, Ice and Quarries showed 1, 0 and 0, and the difference was hidden in the "Solar System bonus". Rows now show the real scores, the bonus shows the real +15, and the total keeps its decimals like the board.
- **Solar System and Galaxy text** described an old scoring rule. Now: a Solar System scores what its planets score +15 ⭐; a Galaxy scores its Solar Systems ×1.3.
- **End of run** had no way back to the main menu (only New run and Observatory). Added a Main menu button.
- **Forest Crown did nothing** (since the flat-Forest update). Now Forest Crown gives Forests +2, and Green Thumb gives Verdants and Forests +1. Canopy Crown makes your Forest aura 1 tier higher (instead of +1 per Forest), and is only offered once you have a tier 1 Forest aura.
- **Leeroy Jenkins levels vanished** after leaving the game page (e.g. viewing the leaderboard) or reloading: the game only loaded some saved settings. Everything saved now loads.
- **Music kept playing on phones** after switching tabs or apps. Sound now pauses when the game isn't on screen.
- **Start screen** said "(2 of 2)" from Prestige III up, where you only get 1 starting pick. It now says "Choose your starting planet (1 of 1)".
- **Continue run** flashed the new-run "pick your starting planet" screen before showing your run.
- **Gold number** showed tiny under the 💰.
- **Screen jumped during spins:** the End run button vanished mid-spin, so the header got shorter and the game moved. Its space is now kept.
- **Rubble Rights** did nothing. Now Quarries get +4 per Asteroid (instead of +2).
- **Prism Lens:** the Nebula gets +2 ⭐ as the text says (was +1).
- **Info popup:** Green Thumb and Forest Crown showed +1 (real bonus is +2); Canopy Crown was missing.
- **Super Giant banner** said "Worth 30" (it's 31).
- **Star Shards:** ending a run right away no longer gives 4 free shards.

## Rule change
- **Scout Fleet** removed from the shop (it did the same as Wide Lens). **Wide Lens** now costs 5 gold.
- **New relic: Orbital Salvage** (4 gold): Satellites and Comets +1 ⭐, and Solar Harvesters also consume touching Satellites and Comets for +2 ⭐ permanently each. Only offered once you own a Satellite, Comet or Solar Harvester.
- **New relic: Constellation** (5 gold): +10 ⭐ every spin for each full set of planets you own: one of every planet kind, counting loose ones and ones inside Solar Systems and Galaxies.
- **Leeroy Jenkins** no longer adds fame: each level gives +10% Star Shards for the run instead (goals still 13% harder per level). The end-of-run box shows the bonus.
- **Starting Fleet** gives a random planet of any kind (it only ever gave Verdant, Forest, Supernova or Nebula).
- **Planets in Solar Systems work like on the board,** counting what touches the System: Quarries get +2 per Asteroid touching the System (+4 with Rubble Rights), Ice Planets with Permafrost +1 per piece touching it. Supernovas are the one exception: they never burn out inside a System.
- **Nebula** scores +2 ⭐ itself for every piece touching it (diagonals count) instead of giving +2 to its neighbours. Inside a Solar System, each Nebula scores +2 ⭐ for every piece touching that System (before, it scored nothing there). Nebula Halo: the Nebula scores +1 ⭐ for every piece 2 cells away. The Nebula aura only gives extra "find more often" choices (it no longer raises the +2).
- **Chorus:** scores 1, 2, 3… in order. Choruses inside Solar Systems count first, then the board continues the count.

## Clearer text (numbers unchanged)
- The currency is called gold everywhere (was "Credits" on the stats bar, "credits" in the help and "money" in the Ice aura).
- Bonuses now say what they add ("+1 ⭐ more", "1 fewer") instead of a fixed total, so they read right when they stack: Prestige III and IV · Time Dilation · Heavy Munitions · Prospector's Charter · Heirloom Seeds · Fame Dividend · Rubble Rights · Verdant Grove · Wide Lens
- Reworded to be shorter or clearer: Verdant Aura · Volcanic Aura · Thick Dust · Dust Compactor · Volcanic · Obsidian Shield · Giant Star · Cosmic Ledger · Event Horizon · Gravity Well · Prestige VI and VIII · Starting Fleet

## New in Developer Mode
- Slot-machine spin: drag the lever down (or swipe down on the board on phones) and the reels spin and land column by column.
- Music (on by default): 4 game songs that build with each fame goal and peak on the last one, and 5 calm songs for the menu, shop and between goals.
- Music and Sound buttons cycle loud / quiet / off.
- Scoring sounds rise in pitch with every piece that scores, with no cap.
- Speed options 1x, 2x, 3x, 5x.
- Planets light up as they score; big spins shake the screen with explosions and a BIG COMBO / MEGA FAME banner; fireworks on fame goals.
- A click sound on every button; a Music button on the main menu; a moving star field behind every screen.
- 📖 Compendium (Developer Mode only): every planet, piece, aura and relic with what it does, with search. Relic icons shown (Constellation has its own star-pattern icon). Built from the game's own data, so it stays up to date. Lists only auras a Solar System can give.
- Verdant texts say 3 instead of 5 while you own Verdant Grove.
- The sidebar shows how many of each planet you own (loose and inside Solar Systems and Galaxies) instead of the find odds.
- Leaderboard has a 💀 Leeroy Jenkins tab: each player's highest Leeroy level they have won a run at.
- Diagonal lines on the board, so it's clear diagonals count as touching.
- Compact stats row on phones.
