#!/usr/bin/env bash
# Régénère le PDF du rapport (docs/EduMatch-Rapport.pdf).
#
# Prérequis pour rafraîchir les captures de l'app (étape optionnelle) :
#   - le cluster tourne, les port-forwards 18080/18081 sont actifs,
#   - le front Vite tourne sur http://localhost:5173
# Si le front n'est pas lancé, on saute les captures et on régénère juste
# le PDF à partir des images déjà présentes dans docs/img/.
#
# Avant de lancer, dépose tes captures Google Labs dans :
#   docs/img/labs-lionel.png
#   docs/img/labs-binome.png
set -e

HERE="$(cd "$(dirname "$0")" && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
DOCS="$HERE/../../docs"

cd "$HERE"
[ -d node_modules ] || npm install

# 1. Captures de l'app (seulement si le front répond)
if curl -s -o /dev/null --max-time 2 http://localhost:5173/; then
  echo "Front détecté, capture des écrans..."
  node shoot.js
else
  echo "Front absent sur :5173, on garde les captures existantes."
fi

# 2. Markdown -> HTML
node build.js

# 3. HTML -> PDF
"$CHROME" --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$DOCS/EduMatch-Rapport.pdf" \
  --allow-file-access-from-files \
  "file://$DOCS/.rapport.build.html"

rm -f "$DOCS/.rapport.build.html"
echo "PDF généré : docs/EduMatch-Rapport.pdf"
