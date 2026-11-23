#!/usr/bin/env python3
"""Builds devious.html (archdevious's Devious Mode) from the current index.html.

Run after tools/apply_patches.py by the GitHub Action, so Devious Mode always has the game
author's newest version plus:
  - every edit in tools/devious_patches.json (game fixes, clearer text, effect hooks)
  - its own saved run, separate from the standard game's
  - devious.js (effects, lever, sound, music) and the Devious leaderboard
Edits whose spot has changed are skipped and listed as NEEDS A LOOK in tools/STATUS.md.
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'index.html')
OUT = os.path.join(ROOT, 'devious.html')
PATCHES = os.path.join(ROOT, 'tools', 'devious_patches.json')
STATUS = os.path.join(ROOT, 'tools', 'STATUS.md')

t = open(SRC, 'rb').read().decode('utf-8')
lines = []
for p in json.load(open(PATCHES, encoding='utf-8')):
    name, find, rep, many = p['name'], p['find'], p['replace'], p.get('all', False)
    n = t.count(find)
    _a = rep.replace(find, '', 1) if find in rep else ''
    if len(_a.strip()) > 20 and _a in t:
        lines.append('- ok (Devious): ' + name)
    elif rep in t and ((find not in rep and n == 0) or (find in rep and n == t.count(rep))):
        lines.append('- ok (Devious): ' + name)
    elif n == 0 and any(t.count(w) == 1 for w in p.get('was', [])):
        w = [w for w in p['was'] if t.count(w) == 1][0]
        t = t.replace(w, rep)
        lines.append('- ok (Devious): ' + name)
    elif n == 0:
        lines.append('- NEEDS A LOOK (Devious): ' + name + ' (game code changed here, skipped)')
    elif n > 1 and not many:
        lines.append('- NEEDS A LOOK (Devious): ' + name + ' (found ' + str(n) + ' times, skipped)')
    else:
        t = t.replace(find, rep)
        lines.append('- ok (Devious): ' + name)

tag = '<script src="leaderboard.js"></script>'
t = t.replace('<script src="devious.js"></script>', '')
dv = '<script>window.GF_MODE="devious"</script>' + tag + '<script src="devious.js"></script>'
if tag in t:
    t = t.replace(tag, dv)
else:
    i = t.lower().rfind('</body>')
    t = t[:i] + dv + '\n' + t[i:]
t = t.replace('<title>Galaxy Fame</title>', '<title>Galaxy Fame · Developer Mode</title>', 1)
open(OUT, 'wb').write(t.encode('utf-8'))

old = open(STATUS, encoding='utf-8').read() if os.path.exists(STATUS) else '# Fix status\n'
old = '\n'.join(l for l in old.splitlines() if '(Devious)' not in l and not l.startswith('## Devious'))
open(STATUS, 'w', encoding='utf-8').write(old.rstrip() + '\n\n## Devious Mode (devious.html)\n\n' + '\n'.join(lines) + '\n')
print('\n'.join(l for l in lines if 'NEEDS' in l) or 'all Devious edits applied')
