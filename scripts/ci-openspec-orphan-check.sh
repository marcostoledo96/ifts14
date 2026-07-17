#!/usr/bin/env bash
# Detecta carpetas activas en openspec/changes/ sin una carpeta fechada
# correspondiente en openspec/changes/archive/.
# Excluye openspec/changes/archive/ y la propia carpeta del cambio en curso.
# Falla (exit 1) si hay carpetas huérfanas.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

CHANGES_DIR="openspec/changes"
ARCHIVE_DIR="$CHANGES_DIR/archive"

if [ ! -d "$CHANGES_DIR" ]; then
  echo "WARN: $CHANGES_DIR no existe, nada que verificar."
  exit 0
fi
if [ ! -d "$ARCHIVE_DIR" ]; then
  echo "WARN: $ARCHIVE_DIR no existe."
  exit 0
fi

# Heurística: una carpeta activa es huérfana si YA tiene una carpeta fechada
# correspondiente en archive/ (fue archivada pero la copia activa no se removió).
# Las carpetas activas sin archive correspondiente son cambios en curso (válidas).
is_archived() {
  local name="$1"
  local token1="${name%%-*}"
  local rest="${name#*-}"
  local token2="${rest%%-*}"
  local prefix="${token1}-${token2}"

  while IFS= read -r -d '' adir; do
    local aname
    aname="$(basename "$adir")"
    local bare="${aname#[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-}"
    if [ "$bare" = "$name" ] || printf '%s' "$aname" | grep -qF -- "$prefix"; then
      return 0
    fi
  done < <(find "$ARCHIVE_DIR" -mindepth 1 -maxdepth 1 -type d -print0)
  return 1
}

orphans=0
checked=0

# Lista de carpetas activas (excluyendo archive/)
while IFS= read -r -d '' dir; do
  name="$(basename "$dir")"
  checked=$((checked + 1))
  if is_archived "$name"; then
    echo "ORPHAN CHANGE: $name (ya archivada en archive/ pero sigue en changes/)"
    orphans=$((orphans + 1))
  fi
done < <(find "$CHANGES_DIR" -mindepth 1 -maxdepth 1 -type d ! -name archive -print0)

echo "Checked $checked active change(s). Orphans: $orphans"
if [ "$orphans" -gt 0 ]; then
  exit 1
fi
echo "OK ci-openspec-orphan-check"