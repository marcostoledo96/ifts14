# Design: P-14 layout configuración

## Technical Approach

Rediseño de plantilla/estilos de `InstitutionalConfigPage` sin tocar el seam `InstitutionalConfigService`.

1. **Grid** `lg: [13rem | 1fr]`: nav sticky `top` + columna de secciones.
2. **Sección**: card `border` + header (número mono, icono SVG Lucide-like 16px, título, descripción) + body.
3. **DTO fields**: mismos `id` de controles (`#institution-name`, `#certificate-text`, `#rector-name`, etc.) para no romper specs existentes.
4. **Sin API**:
   - Identidad: nota «Logos y sellos — carga no disponible (sin API de archivos)».
   - Certificados: nota sobre título/formato/QR/sello no persistidos.
   - Autoridades: bloque «Firma digital» disabled + nota.
   - Contacto / Validación: copy informativo (entrega manual, sin SMTP; mensajes fijos en código).
5. **Sticky bar**: `position: sticky; bottom: 0` (como hoy; evita pelear con padding del shell) con estados dirty / sin cambios / ok, botones «Descartar cambios» / «Guardar configuración».
6. **Preview**: placeholders `[Nombre de la autoridad]` si vacío (computed en TS).

## Tokens

Usar `--color-*`, `--space-*`, `--radius-sm`, `--font-mono`, `--color-tech-blue` de `styles.css`. Sin Tailwind ni lucide npm.

## Testing

Extender `institutional-config-page.spec.ts`: header/nav/anclas, sin file inputs, sin inputs en contacto/validación; conservar escenarios de carga/dirty/guardar/validación.
