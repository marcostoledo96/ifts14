# Diseño: Verificar entorno Windows (F0-01)

## Contexto

Ciclo de documentación que registra la verificación formal del entorno de desarrollo Windows de Matías antes de iniciar ciclos de producto Angular 20. No modifica código de producto ni instala dependencias del proyecto.

## Decisiones de diseño

1. **Ubicación del reporte: `docs/opencode/`**
   - Fundamento: `AGENTS.md` indica que cambios de flujo operativo se documentan en `docs/opencode/`. Este ciclo verifica el entorno del operador (Matías) usando OpenCode/Gentle-AI, no es una funcionalidad frontend.

2. **Nombre de archivo: `verificacion-entorno-windows.md`**
   - Fundamento: kebab-case, descriptivo, idioma español, evita ambigüedad con otros reportes posibles.

3. **Estructura del reporte: secciones fijas de 5 ítems**
   - Fundamento: permite que `sdd-verify` valide el contenido por secciones conocidas sin parseo complejo.

4. **Inclusión explícita de exclusiones dentro del reporte**
   - Fundamento: reduce el riesgo de que un lector futuro asuma que el entorno está completo (F0-02 y F0-03 son ciclos separados).

5. **Validación por `git status` + lectura de archivo**
   - Fundamento: al no haber tests automatizados (según `openspec/config.yaml`), la verificación depende de inspección del working tree y contenido del reporte.

## Ubicación y estructura del reporte

**Ruta exacta:** `docs/opencode/verificacion-entorno-windows.md`

**Secciones obligatorias (en orden):**

1. **Entorno** — fecha de verificación, SO, shell, rama activa.
2. **Herramientas verificadas** — tabla con 5 filas: Node.js, npm, Git, VS Code, Angular CLI; columnas: Herramienta, Versión, Estado.
3. **Compatibilidad Angular** — confirmación de que Angular CLI es 20.x.
4. **Alcance confirmado** — lista de lo que este ciclo NO cubre (F0-02, F0-03, código de producto, backend, DB, deploy).
5. **Próximos pasos** — referencia breve al siguiente ciclo de onboarding (F0-02).

**Contenido a incluir (sin secretos ni rutas privadas):**
- Node.js: v22.18.0
- npm: 10.9.3
- Git: 2.47.1.windows.1
- VS Code: 1.126.0
- Angular CLI: 20.3.30

## Validación de implementación

| Fase | Qué se valida | Cómo |
|------|---------------|------|
| **Apply** | El archivo existe en la ruta exacta | `Test-Path docs/opencode/verificacion-entorno-windows.md` |
| **Apply** | Contiene las 5 herramientas y versiones | Leer archivo y buscar cada herramienta + versión |
| **Apply** | No se crearon `node_modules/` ni `package-lock.json` | `git status --short` no lista esos archivos |
| **Verify** | Solo cambió el reporte bajo `docs/` | `git status --short` lista únicamente `docs/opencode/verificacion-entorno-windows.md` |
| **Verify** | No se modificó código de producto | `git diff --name-only` no incluye archivos de `apps/`, `database/` ni `public_html/` |

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Confusión sobre dónde documentar entornos futuros | Se establece el patrón `docs/opencode/` para verificaciones de operador; se consolida en este diseño. |
| Reporte queda desactualizado si se actualiza una herramienta | Aceptado: el reporte es punto-en-tiempo del onboarding; actualizaciones futuras requieren nuevo ciclo SDD. |

## Migración / Rollout

No aplica. No hay migración de datos, feature flags ni despliegue.

## Preguntas abiertas

Ninguna. El alcance está cerrado.
