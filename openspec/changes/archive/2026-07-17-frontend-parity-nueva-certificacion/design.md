# Design: frontend-parity-nueva-certificacion

## Technical Approach

Reestructurar template/CSS/TS de `CertificationNewPage` hacia el layout v0 en una sola vista:

1. **Header** — back link, kicker “Emisión documental”, título, subtítulo.
2. **Selección** — grid 3 cols (alumno combobox, curso select, ciclo dashed).
3. **Main** — preview article (ink band + body sections) | sticky aside (resumen, avisos, CTAs).

Lógica de elegibilidad y `emitir` se conserva. Combobox: señales `query`/`open` + filtro `normalizar` sobre `alumnos()`.

## Honesty map

| Elemento v0 | Angular |
|-------------|---------|
| Folio / N.° cert mock | “Se asigna al emitir” / omitir número |
| QR mock cells | Grid decorativo `aria-hidden` + nota |
| Firma digital verificada | Línea tipográfica + Lock “Configuración institucional” |
| Email alumno | Solo flag `tieneEmail === false` → “Sin email” |
| Horas/carga | Omitir (API no aporta `carga`) |

## CSS

Tokens existentes (`--color-ink`, `--color-circuit`, `--color-valid`, mono caps). Sin Tailwind runtime; CSS scoped de página.

## Testing

Specs en `certification-new-page.spec.ts`: layout documental, skeleton busy, bloqueos, emitir, sin folio/email.
