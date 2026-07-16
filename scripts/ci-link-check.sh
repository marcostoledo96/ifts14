#!/usr/bin/env bash
# Valida enlaces internos en docs/ y openspec/specs/.
# Ignora URLs externas (http/https) y enlaces dentro de bloques de código cercados.
# Falla (exit 1) si algún enlace apunta a un archivo inexistente.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

# Cola de directorios a escanear
TARGETS=(docs openspec/specs)
broken=0
checked=0

in_code_fence=0

check_file() {
  local file="$1"
  local dir
  dir="$(dirname "$file")"
  local in_fence=0
  local line_no=0

  while IFS= read -r line || [ -n "$line" ]; do
    line_no=$((line_no + 1))
    # Detección de bloques de código cercados (``` o ~~~)
    if printf '%s' "$line" | grep -qE '^\s*(```|~~~)'; then
      in_fence=$((1 - in_fence))
      continue
    fi
    [ "$in_fence" -eq 1 ] && continue

    # Extraer enlaces [text](target) — solo relativos (sin esquema http/https/mailto)
    # grep -oE devuelve cada match en su propia línea
    while IFS= read -r match; do
      [ -z "$match" ] && continue
      # Extraer la parte del target dentro de (...)
      target="$(printf '%s' "$match" | sed -E 's/.*\]\(([^)]+)\).*/\1/')"
      [ -z "$target" ] && continue
      # Saltar URLs externas y anclas puras
      case "$target" in
        http://*|https://*|mailto://*|mailto:*|\#*) continue ;;
      esac
      # Quitar ancla final (#section)
      path="${target%%#*}"
      [ -z "$path" ] && continue
      # Resolver relativo al directorio del archivo markdown
      resolved="$dir/$path"
      # Normalizar (sin realpath para no exigir existencia todavía)
      if [ ! -e "$resolved" ]; then
        echo "BROKEN LINK: $file:$line_no -> $target"
        broken=$((broken + 1))
      fi
      checked=$((checked + 1))
    done < <(printf '%s\n' "$line" | grep -oE '\[[^]]*\]\([^)]+\)' || true)
  done < "$file"
}

for t in "${TARGETS[@]}"; do
  [ -d "$t" ] || continue
  while IFS= read -r -d '' f; do
    check_file "$f"
  done < <(find "$t" -type f -name '*.md' -print0)
done

echo "Checked $checked internal link(s). Broken: $broken"
if [ "$broken" -gt 0 ]; then
  exit 1
fi
echo "OK ci-link-check"