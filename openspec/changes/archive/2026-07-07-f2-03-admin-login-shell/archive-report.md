# Archive Report — f2-03-admin-login-shell

## Cierre del ciclo

- **Change**: `f2-03-admin-login-shell`
- **Fecha de archivo**: 2026-07-07
- **Rama**: `frontend/admin-foundation`
- **Estrategia de entrega**: single-pr sobre `frontend/admin-foundation` con `size:exception` aprobado por mantenedor (Matías, 2026-07-07) — sin split
- **Artifact store**: hybrid (OpenSpec + Engram)
- **Verdict del verify**: **PASS** (sin issues críticos)
- **Modo archive**: hybrid, sin git operations, sin tocar runtime/producto/backend/deploy/database/paquete

## Resumen ejecutivo

F2-03 entrega la base navegable del panel administrativo Angular 20 (rutas `/admin/login`, `/admin`, `/admin/dashboard`; `AdminShell`, `SidebarAdmin`, `LoginPage`, `LoginForm`, `AdminDashboardPage`; `MockSession` en memoria con `signal<boolean>` y `adminGuard`). La sesión es mock explícita y visible como tal. No se introdujo autenticación real, claves admin embebidas, storage, cookies, llamadas a API ni datos mock de dominio. El cambio prepara la integración con F2-04..F2-06.

## Estado de verificación preservado

| Indicador | Resultado |
|---|---|
| Tests | 146/146 SUCCESS (ChromeHeadless 149) |
| Build | Verde, sin warnings (`283.68 kB / 81.34 kB` initial) |
| Consola de tests | Limpia (NG04002 remediadas) |
| Cobertura | No requerida por el ciclo |
| Clave admin temporal (src + dist) | 0 matches |
| Storage/cookies (src + chunks admin) | 0 matches |
| Red admin (src + chunks admin) | 0 matches |
| `HttpClient` literal en specs | 2 matches no ejecutables (descripciones de tests) |
| Compliance matrix | 10/10 escenarios compliant |
| Skip-links | `AdminShell` y `LoginPage` alineados hacia `#contenido` |
| Landmarks duplicados | Mitigado: `App` raíz route-aware, admin sin header/footer/main públicos |
| Issues críticos | Ninguno |

Detalle completo en `verify-report.md` dentro de este mismo folder.

## Spec sync

- **Dominio creado**: `admin-foundation`
- **Acción**: la spec delta era full spec; copiada íntegra a `openspec/specs/admin-foundation/spec.md` (no existía main spec previa).
- **Requirements incorporados**: 5 (Rutas administrativas aisladas; Login y shell explícitamente simulados; Sesión mock solo en memoria; Shell accesible, responsive y alineado a F1-02; Documentación y límites de handoff).
- **Scenarios incorporados**: 10 (Given/When/Then por requisito).
- **Spec delta previa**: `openspec/changes/f2-03-admin-login-shell/specs/admin-foundation/spec.md` queda conservada en el archive como evidencia.

## Inventario del archive

```
openspec/changes/archive/2026-07-07-f2-03-admin-login-shell/
├── exploration.md       (40.6K)
├── proposal.md          (3.3K)
├── specs/
│   └── admin-foundation/
│       └── spec.md      (4.0K)
├── design.md            (4.6K)
├── tasks.md             (8.4K)
├── verify-report.md     (8.3K)
└── archive-report.md    (este archivo)
```

- 35 tasks totales: 35 completas (incluye correctivos G1..G10 y H1..H5); 5.7 `sdd-archive` se cierra con este reporte.
- El cambio activo `openspec/changes/f2-03-admin-login-shell/` ya no existe; el folder activo queda limpio.

## Advertencias preservadas (no bloqueantes)

1. **Presupuesto de revisión OpenSpec**: producto/docs ahora **excede levemente 1500** tras los fixes pre-PR. Medición verificada (2026-07-07): agregaciones tracked 232 + nuevo `features/admin/` 1351 = **~1583 líneas de producto/docs**, excluyendo artefactos OpenSpec archivados. Esto supera el presupuesto de revisión de 1500 líneas del proyecto para producto/docs. Antes este reporte afirmaba "~1.474 bajo 1500"; esa cifra correspondía al estado previo a los fixes H1..H5 (sidebar RouterLink + placeholders, 2 tests nuevos, doc patch) y quedó desactualizada. **Decisión del mantenedor (2026-07-07)**: Matías aceptó `size:exception` ("Aceptar excepción") antes de la preparación del PR — **sin split**. La evidencia OpenSpec archivada (esta carpeta, `verify-report.md`, este reporte) permanece en el mismo PR salvo cambio posterior. La spec archivada y este reporte son evidencia, no producto.
2. **Falsos positivos literales del grep de red**: dos descripciones de tests mencionan `HttpClient`; la implementación y los chunks admin construidos están limpios.
3. **Literales esperados en `dist/` general**: `document.cookie` y `fetch` aparecen por el runtime de Angular y la validación pública; el control de F2-03 se limita a implementación admin y chunks lazy admin.

## Lineage Engram (trazabilidad)

| Topic key | Observation ID | Tipo |
|---|---|---|
| `sdd/f2-03-admin-login-shell/explore` | #5172 | architecture |
| `sdd/f2-03-admin-login-shell/proposal` | #5173 | architecture |
| `sdd/f2-03-admin-login-shell/spec` | #5174 | architecture |
| `sdd/f2-03-admin-login-shell/design` | #5175 | architecture |
| `sdd/f2-03-admin-login-shell/tasks` | #5178 | architecture |
| F2-03 corrective apply: ngSubmit + setTimeout focus fix | #5179 | bugfix |
| Reviewed F2-03 apply gate | #5180 | discovery |
| Re-reviewed F2-03 apply gate after fixes | #5182 | discovery |
| Reviewed F2-03 final gate after login focus fix | #5184 | discovery |
| `sdd/f2-03-admin-login-shell/verify-report` | #5186 | architecture |
| `sdd/f2-03-admin-login-shell/archive-report` | (este save) | architecture |

Nota: el `apply-progress` nominal del ciclo fue registrado vía bugfix + discovery de gates (#5179, #5180, #5182, #5184) en lugar de una observación con `topic_key` `sdd/f2-03-admin-login-shell/apply-progress`. La trazabilidad de apply queda cubierta por esos IDs y por `tasks.md` (que ya marca 34/34 implementation tasks).

## Source of truth actualizado

- `openspec/specs/admin-foundation/spec.md` refleja ahora el contrato vigente de F2-03 (rutas admin, login/shell simulados, sesión mock solo en memoria, accesibilidad alineada a F1-02, documentación de límites y handoff a F2-04..F2-06).
- Documentación frontend del producto (`docs/frontend/00-angular20-port-v0.md`) ya fue parcheada en `apply` (task 5.5). Este archive no la modifica.

## Cambios fuera del scope

Ninguno. El ciclo sí modificó runtime frontend Angular dentro del scope F2-03 (rutas admin, shell, login y dashboard). No se tocó:

- backend PHP, base MariaDB, deploy cPanel, `.htaccess`
- `package.json`, lockfiles, dependencias, configs de tooling
- material privado, secretos, logs o dumps
- `git` (sin stage, commit, push, branch, merge, rebase)

## Estado del SDD cycle

El ciclo F2-03 se encuentra **planificado, implementado, verificado y archivado**. Queda listo para el próximo cambio de Fase 2 sobre la misma base `frontend/admin-foundation` (F2-04..F2-06), con la spec `admin-foundation` ya vigente como contrato source-of-truth.
