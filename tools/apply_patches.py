#!/usr/bin/env python3
"""Re-applies archdevious's fixes to index.html after each game upload.

The game's author uploads his own index.html builds, which replace the whole file.
This script (run by .github/workflows/keep-leaderboard-line.yml) puts our changes back:
  1. the <script src="leaderboard.js"></script> line before </body>
  2. every edit in tools/patches.json: if its "find" text is in index.html, it is replaced
     by "replace". If "find" is gone and "replace" is not there either, the game code has
     changed in that spot: the edit is skipped and listed as NEEDS A LOOK in tools/STATUS.md.
Nothing is ever forced over code the author has changed.
Usage: python3 tools/apply_patches.py [path/to/index.html]
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'index.html')
PATCHES = os.path.join(ROOT, 'tools', 'patches.json')
STATUS = os.path.join(ROOT, 'tools', 'STATUS.md')
TAG = '<script src="leaderboard.js"></script>'

raw = open(INDEX, 'rb').read()
text = raw.decode('utf-8')
lines = []

if 'src="leaderboard.js' in text:
    lines.append('- ok: leaderboard line already there')
else:
    i = text.lower().rfind('</body>')
    text = text[:i] + TAG + '\n' + text[i:] if i >= 0 else text + '\n' + TAG + '\n'
    lines.append('- FIXED: leaderboard line re-added')

for p in json.load(open(PATCHES, encoding='utf-8')):
    name, find, rep = p['name'], p['find'], p['replace']
    nf, nr = text.count(find), text.count(rep)
    if nf == 1:
        text = text.replace(find, rep)
        lines.append('- FIXED: ' + name)
    elif nf == 0 and nr >= 1:
        lines.append('- ok: ' + name)
    elif nf > 1:
        lines.append('- NEEDS A LOOK: ' + name + ' (found ' + str(nf) + ' times, skipped)')
    else:
        lines.append('- NEEDS A LOOK: ' + name + ' (game code changed here, skipped)')

# Devious Mode's fixes and effects (everything except the slot machine), for the standard game too.
DVTAG = '<script src="devious.js"></script>'
def _added(find, rep):
    # text a patch adds around its anchor (for patches whose replace keeps the find text)
    a = rep.replace(find, '', 1) if find in rep else ''
    return a if len(a.strip()) > 20 else ''

DVP = json.load(open(os.path.join(ROOT, 'tools', 'devious_patches.json'), encoding='utf-8'))
# Clean up: if a patch's added text got stacked more than once (two patches sharing one anchor), keep only the first copy.
for p in DVP:
    a = _added(p['find'], p['replace'])
    if a and text.count(a) > 1:
        first = text.find(a) + len(a)
        text = text[:first] + text[first:].replace(a, '')
        lines.append('- FIXED: removed repeated copies of ' + p['name'])
for p in DVP:
    if p.get('devious_only'):
        continue
    name, find, rep, many = p['name'], p['find'], p['replace'], p.get('all', False)
    nf = text.count(find)
    if _added(find, rep) and _added(find, rep) in text:
        lines.append('- ok: ' + name)
    elif rep in text and ((find not in rep and nf == 0) or (find in rep and nf == text.count(rep))):
        lines.append('- ok: ' + name)
    elif nf == 1 or (nf > 1 and many):
        text = text.replace(find, rep)
        lines.append('- FIXED: ' + name)
    elif nf > 1:
        lines.append('- NEEDS A LOOK: ' + name + ' (found ' + str(nf) + ' times, skipped)')
    else:
        lines.append('- NEEDS A LOOK: ' + name + ' (game code changed here, skipped)')
if DVTAG in text:
    lines.append('- ok: effects line already there')
else:
    text = text.replace(TAG, TAG + DVTAG, 1)
    lines.append('- FIXED: effects line (devious.js) re-added')

changed = text.encode('utf-8') != raw
if changed:
    open(INDEX, 'wb').write(text.encode('utf-8'))
if os.path.abspath(INDEX) == os.path.join(ROOT, 'index.html'):
    open(STATUS, 'w', encoding='utf-8').write(
        '# Fix status for the current index.html\n\nUpdated by tools/apply_patches.py after each upload.\n\n' + '\n'.join(lines) + '\n')
print('\n'.join(lines))
print('index.html changed' if changed else 'index.html unchanged')
