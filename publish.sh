#!/bin/sh
# Publish a new build of Galaxy Fame to GitHub Pages (bash / macOS / Linux).
# Usage:  ./publish.sh /path/to/galaxy-fame-22.html "Harder midgame"
FILE="$1"; MSG="${2:-Update build}"; REPO="Tych1cus/Galaxy-Fame"
[ -f "$FILE" ] || { echo "File not found: $FILE"; exit 1; }
SHA=$(gh api "repos/$REPO/contents/index.html" --jq .sha)
python -c "import base64,sys,json;print(json.dumps({'message':sys.argv[2],'content':base64.b64encode(open(sys.argv[1],'rb').read()).decode(),'sha':sys.argv[3],'branch':'main'}))" "$FILE" "$MSG" "$SHA" > /tmp/gf_body.json
gh api -X PUT "repos/$REPO/contents/index.html" --input /tmp/gf_body.json --jq '.commit.sha'
echo "Pushed. GitHub Pages rebuilds in about a minute."
