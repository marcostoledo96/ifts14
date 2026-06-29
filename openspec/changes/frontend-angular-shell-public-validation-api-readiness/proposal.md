# Propuesta: Shell Angular y preparación de validación pública

## Intención

Desbloquear a Marcos para validar la integración front/back del módulo `/certificados/` sin esperar la UI final de Matías. El ciclo debe crear una base Angular 20 mínima, segura y reemplazable, con flujo público simulado y frontera clara hacia la API PHP existente.

## Alcance

### Incluido
- Scaffold Angular 20 en `apps/frontend-angular/`, con routing standalone y build compatible con `/certificados/`.
- Flujo público para `/certificados/validar/:tokenCertificacion` o ruta equivalente documentada.
- Estados ficticios: válido, revocado/no verificable, no encontrado y error técnico.
- Modelos TypeScript y servicio de validación como frontera futura hacia `/certificados/api/`.
- Tailwind solo como setup técnico/capa utilitaria mínima, sin tokens ni componentes finales.

### Excluido
- Implementación visual final, sistema visual, admin, QA visual y handoff de Matías.
- Datos reales, lectura de `material_privado_no_versionar/` o conexión obligatoria a API real.
- Copiar código React/Next desde `muestra_pagina/`.

## Capacidades

### Capacidades nuevas
- `frontend-angular-shell`: base Angular 20, rutas y layout semántico mínimo para `/certificados/`.
- `frontend-public-validation`: pantalla pública de validación por token con estados de resultado ficticios.
- `frontend-api-readiness`: modelos y servicio desacoplado para migrar de mocks a la API PHP.

### Capacidades modificadas
- Ninguna. Se consumen `backend-contrato-api-certificados` y `backend-validacion-publica-certificados` sin cambiar sus requisitos.

## Enfoque

Usar Angular CLI standalone con routing, señales y carga asíncrona simulada para ejercitar `loading`, éxito y error. Mantener la UI deliberadamente mínima y semántica; la integración real se limita a modelos, endpoint objetivo y servicio reemplazable.

## Áreas afectadas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `apps/frontend-angular/` | Nuevo | Scaffold, configuración Angular y build `/certificados/`. |
| `apps/frontend-angular/src/app/` | Nuevo | Features `shell`, `public-validation`, `api-readiness`. |
| `docs/frontend/00-angular20-port-v0.md` | Modificado | Sincronización durante `sdd-archive`. |
| `openspec/changes/frontend-angular-shell-public-validation-api-readiness/` | Modificado | Artefactos SDD del ciclo. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| PR supera 400 líneas | Media | Dividir en shell, flujo público y API-readiness. |
| Tailwind se interpreta como diseño final | Media | Limitar a setup técnico hasta definición de Matías. |
| `404` se muestra como error técnico | Media | Tratarlo como “no verificable” según contrato backend. |

## Plan de reversión

Revertir los commits del ciclo o eliminar `apps/frontend-angular/` y la documentación generada del cambio. No hay datos reales ni migraciones que revertir.

## Dependencias

- Angular CLI 20.x disponible.
- Specs `backend-contrato-api-certificados` y `backend-validacion-publica-certificados` vigentes.
- Diseño final de Matías queda como dependencia posterior, no bloqueante.

## Criterios de éxito

- [ ] Angular build prepara artefactos con base `/certificados/`.
- [ ] La ruta pública muestra todos los estados ficticios sin datos reales.
- [ ] Modelos y servicio permiten reemplazar mocks por API PHP sin reescribir la UI pública.
- [ ] No se copia React/Next ni se define diseño visual final.
