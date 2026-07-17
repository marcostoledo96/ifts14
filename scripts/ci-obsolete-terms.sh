#!/usr/bin/env bash
# Busca términos obsoletos en docs activas (docs/ y openspec/specs/).
# NO escanea openspec/changes/archive/ ni docs/auditoria/.
# Ignora coincidencias dentro de bloques de código cercados.
# Permite contexto de negación/remoción (no, sin, se suprimen, se retiran, etc.).
# Falla (exit 1) si encuentra un término obsoleto como afirmación/prescripción activa.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

# awk hace todo el trabajo pesado: trackea fences, busca términos, aplica filtro
# de contexto, e imprime hallazgos. Bash solo coordina archivos y cuenta.
awk_script='
BEGIN {
  # Términos que admiten contexto de negación (allow_context = 1)
  nctx = 0
  ctx_terms[nctx++] = "SMTP"
  ctx_terms[nctx++] = "PHPMailer"
  ctx_terms[nctx++] = "reenvío automático"
  ctx_terms[nctx++] = "reenvio automatico"
  ctx_terms[nctx++] = "firma digital verificada"
  ctx_terms[nctx++] = "M4-01B"
  ctx_terms[nctx++] = "pendiente-entrega"
  ctx_terms[nctx++] = "requiere-nueva-entrega"
  ctx_terms[nctx++] = "entregado"

  # Patrón de contexto permitido (negación/remoción/inactividad/histórico)
  ctx_pat = "(no |sin |no usar|fuera de|out of|no se|removid|remocion|remoci|suprim|retir|elimin|inactiv|stub|gate|deprecated|mvp|cleanup|no afirmar|no mostrar|no contener|no deben|falta|falten|aprobacion|aprobación|residuales|intenta|corregir|comentario|checklist|claves|default|mapeos)"
}

FNR == 1 {
  in_fence = 0
  file = FILENAME
}

{
  line = $0
  # Detectar fences ``` o ~~~ al inicio de línea
  if (line ~ /^[[:space:]]*(```|~~~)/) {
    in_fence = !in_fence
    next
  }
  if (in_fence) next

  low = tolower(line)

  for (i = 0; i < nctx; i++) {
    term = ctx_terms[i]
    lowterm = tolower(term)
    if (index(low, lowterm) > 0) {
      # Verificar contexto permitido
      if (low ~ ctx_pat) continue
      printf "OBSOLETE TERM [%s]: %s:%d: %s\n", term, file, FNR, line
      finds++
    }
  }
}

END {
  printf "FINDS=%d\n", finds > "/dev/stderr"
  exit (finds > 0 ? 1 : 0)
}
'

# Recolectar archivos a escanear
files=()
for d in docs openspec/specs; do
  [ -d "$d" ] || continue
  while IFS= read -r -d '' f; do
    # Excluir docs/auditoria y archive
    case "$f" in
      docs/auditoria*) continue ;;
      openspec/changes/archive*) continue ;;
    esac
    files+=("$f")
  done < <(find "$d" -type f \( -name '*.md' -o -name '*.html' -o -name '*.ts' -o -name '*.php' \) -print0)
done

# "entregado" en archivos frontend específicos
for f in \
  apps/frontend-angular/src/app/features/public-validation/public-validation-page.html \
  openspec/specs/frontend-http-services/spec.md; do
  [ -f "$f" ] || continue
  # Evitar duplicar si ya está en la lista (frontend-http-services ya está)
  case " ${files[*]} " in *" $f "*) ;; *) files+=("$f") ;; esac
done

if [ ${#files[@]} -eq 0 ]; then
  echo "No files to scan."
  echo "OK ci-obsolete-terms"
  exit 0
fi

# Ejecutar awk sobre todos los archivos de una pasada
awk "$awk_script" "${files[@]}"
rc=$?
if [ $rc -eq 0 ]; then
  echo "OK ci-obsolete-terms"
fi
exit $rc