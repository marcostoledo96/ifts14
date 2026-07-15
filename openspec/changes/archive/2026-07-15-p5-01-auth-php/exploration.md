# Exploración: P5-01 — Auth PHP TDD

> Cambio: `p5-01-auth-php` (artifact store: híbrido OpenSpec + Engram).
> Rama actual en checkout: `security/backend-preproduction-hardening` (HEAD
> `98454ba`; árbol limpio salvo el nuevo `openspec/changes/p5-01-auth-php/`).

## Resumen ejecutivo (corregido)

`P5-01 — Auth PHP TDD` **no tiene spec canónica actual en este checkout**. La
única especificación actualmente versionada sobre el gate admin es
`openspec/specs/admin-auth/spec.md`, que describe `X-Admin-Key` con
`hash_equals()` y tres escenarios (header válido, falla cerrada, secreto
no observable). Este spec es la **fuente normativa vigente** hasta que
`sdd-spec` lo reemplace con un delta.

Existe evidencia adicional **no normativa** sobre un enfoque de sesión PHP
con cookie `HttpOnly`, pero solo aparece en:

1. **Blob git huérfano**: `docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SSD_TDD.md`
   (blob `3e45a3b55e3c77b2a17e028efd3292c58e9f7b8d`). Existe en
   `.git/objects` pero **no** está en este índice de checkout ni en ningún
   commit de ninguna rama ni en el árbol de trabajo. Verificable con
   `git rev-parse :0:docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SSD_TDD.md`
   (fatal: ruta no existe en el índice). Es un **objeto histórico
   alcanzable** vía `git rev-list --all --objects` solo porque el packfile
   aún no fue GC'd, pero ningún commit ni ref lo referencia como árbol
   actual.
2. **Archivo de auditoría no versionado** (presente en el árbol de
   trabajo, no en Git): `IFTS14_auditoria_backend_y_plan_descarga_qr.md`
   (1149 líneas, no rastreado por Git, `git status` lo reporta como
   directorio de trabajo presente pero no en staging). Contiene la
   sección **HIGH-04** que lista como opciones
   "Basic Auth de cPanel / login PHP con cookie HttpOnly / X-Admin-Key
   solo server-side" como mitigaciones candidatas, **sin elegir
   ninguna**.

Por lo tanto: **ningún documento versionado actualmente en este checkout
define la spec de P5-01**. El artefacto que la redacte (`sdd-spec`) debe
producirla desde cero tomando como base la spec vigente
`admin-auth/spec.md` y los hallazgos no-normativos listados arriba. La
presente exploración **no puede afirmar que un ciclo P5-01 esté
predefinido, ni que exista rama sugerida, ni que haya 9 tests RED
obligatorios, ni decisiones D1 vigentes** tomadas en este checkout.

No se modificó código fuente, infraestructura, base de datos, deploy ni
estado Git. Solo se reescribió este artefacto.

## Estado actual verificado

### 1. Spec OpenSpec vigente (única fuente normativa para admin-auth)

- **Path**: `openspec/specs/admin-auth/spec.md` (tracked en este checkout).
- **Contenido (verbatim, primera parte)**:
  - "Definir el gate administrativo mínimo de la API de certificados QR:
    autorización por header `X-Admin-Key` comparado en tiempo constante
    contra una clave administrativa externa a Git, con falla cerrada
    cuando la clave configurada falta, el header falta o el valor no
    coincide."
  - **Escenarios**:
    1. Header válido: clave configurada ≥16 chars + header correcto → MAY
       continuar.
    2. Falla cerrada: clave faltante, vacía, <16, header faltante, o valor
       distinto → 401 `UNAUTHORIZED` con sobre de error seguro, sin abrir
       datos administrativos ni revelar la causa exacta.
    3. Secreto no observable: respuesta, auditoría y logs no contienen la
       clave completa ni parcial.
- **Historial reciente** (`git log --oneline -- openspec/specs/admin-auth/spec.md`):
  - `8b4e8d8 fix(backend): harden API request handling`
  - `3a5e829 feat(backend): add admin certificate endpoints`
- **Estado**: actualmente canónico en este checkout. **No se ha emitido delta
  alguno** que modifique esta spec.

### 2. Implementación actual del gate

| Capa | Implementación | Referencia verificada |
|---|---|---|
| Configuración | `admin_api_key` cargada por `Config::load()` con validación `strlen >= 16`; `Config::adminApiKey()` devuelve string vacío si falla. | `apps/backend-php/src/Config.php:121-126` |
| Gate de request | `AuthGate::requireAdmin()` compara `hash_equals(expected, received)` y responde 401 `UNAUTHORIZED` en falla. | `apps/backend-php/src/AuthGate.php:12-32` |
| Router admin | 18 puntos de entrada llaman `adminConfig()` → `requireAdmin()` → `AuthGate::requireAdmin()`. | `apps/backend-php/index.php:87, 112, 128, 148, 176, 192, 212, 235, 255, 283, 302, 331, 388, 414, 450, 488, 521, 559, 640-664` |
| Test unitario | `AuthGateTest.php` cubre 4 casos (válido, faltante, inválido, config corta). | `apps/backend-php/tests/AuthGateTest.php:1-41` |
| Contrato textual | "X-Admin-Key" mencionado en 30+ lugares de `docs/backend/01-contrato-api-certificados.md` y de specs de admin-certificate-emission/delivery/revocation. | grep confirmado |

No existe ningún endpoint `/admin/auth/login`, `/admin/auth/session` o
`/admin/auth/logout` en el código (verificado por grep en
`apps/backend-php/index.php` y por inspección de routes
`adminConfig()` callers).

### 3. Frontend Angular 20 y sesión mock

- `MockSession` (señal Angular 20 `signal<boolean>`) inyectada vía
  `MOCK_SESSION` `InjectionToken`. Métodos `hasSession()`, `signIn()`,
  `signOut()`. Sin persistencia en `localStorage`/`sessionStorage`/cookies/IndexedDB.
- `adminGuard: CanActivateFn` funcional; redirige a `/admin/login` cuando
  `MockSession.hasSession() === false`.
- Rutas admin: `/admin/login`, `/admin` (redirect a `/admin/dashboard`),
  `/admin/dashboard`, `/admin/cursos*`, `/admin/alumnos*`,
  `/admin/asistencias*`, `/admin/certificaciones*`.
- Servicios HTTP admin (`HttpCoursesService`, etc.) **no existen** aún
  (verificado por CodeGraph y por grep en `apps/frontend-angular/`).
- Botón "Cerrar sesión" en `SidebarAdmin` invoca `signOut()` y navega a
  `/admin/login`.

### 4. Evidencia no-normativa encontrada (no es spec)

#### 4.1. Blob git huérfano `IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SSD_TDD.md`

- **Proveniencia verificable**:
  - `git ls-files --stage -- <path>` → **vacío (exit 0)**. El path no
    está en el índice de este checkout.
  - `git rev-parse :0:docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SSD_TDD.md`
    → **fatal: ruta no existe (ni en disco ni en el índice)**.
  - `git ls-tree HEAD docs/planificacion/` → **muestra el path** con
    blob `3e45a3b55e3c77b2a17e028efd3292c58e9f7b8d`. (Inconsistencia
    entre `ls-files --stage --` y `ls-tree HEAD`: la entrada no
    resuelve vía `rev-parse :0:`.)
  - `git log --all --oneline -- <path>` → **vacío**. Ningún commit de
    ninguna rama toca este path.
  - `git log --reflog --all --oneline -- <path>` → **vacío**. Tampoco
    aparece en el reflog.
  - `git rev-list --all --objects 2>&1 | grep IFTS14_PLAN` →
    `3e45a3b55e3c77b2a17e028efd3292c58e9f7b8d docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SSD_TDD.md`
    (también blobs históricos `1713ecb2…`, `aec831c6…`, `266a50b7…`,
    `d4b7702…`, `019f16b3…`).
  - `git cat-file -p 3e45a3b55e3c77b2a17e028efd3292c58e9f7b8d` → contenido
    legible (3487 líneas), encabezado dice `commit_auditado: "9bc0dbd…"`,
    `rama_fuente: "main"`, `version: "1.0"`, `fecha_plan: "2026-07-14"`.
  - `test -e docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SSD_TDD.md` → **MISSING**
    (el archivo no existe en el árbol de trabajo).
- **Conclusión**: el blob existe en el object store de Git pero **no es
  contenido actual de este checkout**. Ningún commit, ningún ref, ningún
  reflog lo referencia como árbol vigente. El contenido se conserva
  solo porque los packs de Git no se han compactado (no se ha ejecutado
  `git gc`). Es, en la práctica, **evidencia histórica preservada por
  accidente**, no una spec normativa.
- **Lo que dice el contenido** (no-normativo): 9 fases P0-P9 con
  múltiples ciclos. P5 se titula "Autenticación simple e integración
  admin real". P5-01 propone reemplazar `X-Admin-Key` por sesión PHP con
  cookie `HttpOnly; Secure; SameSite=Strict; Path=/certificados/`,
  mantener `X-Admin-Key` solo para CLI/smokes durante transición, agregar
  CSRF para métodos mutantes, y lista 9 escenarios RED/GREEN
  presuntivos. **Esto no es una decisión D0/D1 vigente en este checkout,
  es una propuesta de un blob huérfano**.

#### 4.2. Archivo de auditoría no versionado `IFTS14_auditoria_backend_y_plan_descarga_qr.md`

- **Proveniencia verificable**:
  - `test -e IFTS14_auditoria_backend_y_plan_descarga_qr.md` → **EXISTS**
    (1149 líneas en árbol de trabajo).
  - `git ls-files 2>&1 | grep IFTS14_auditoria` → **vacío**. El archivo
    **no está rastreado por Git** en ninguna rama.
  - `git log --all --oneline -- <path>` → **vacío**. Nunca fue commiteado.
  - `git status --porcelain` → no aparece como `??` (lo que sugiere que
    está bajo `.gitignore` o en un directorio ignorado).
- **Lo que dice el contenido** (relevante para P5-01):
  - **HIGH-04 — Auth admin `X-Admin-Key` es temporal y riesgoso para UI real**
    (líneas 264-291 aprox.). Lista como mitigaciones candidatas para
    "MVP/staging":
    1. Proteger admin con **Basic Auth de cPanel**.
    2. Implementar **login PHP simple con cookie HttpOnly**.
    3. Mantener `X-Admin-Key` solo para llamadas server-side/controladas.
    - **No elige ninguna**. Las tres son opciones listadas.
  - Línea 35: "Auth admin temporal con `X-Admin-Key`."
  - Línea 42: "`X-Admin-Key` es temporal y no debe quedar expuesto desde
    Angular."
  - Sección 3.2 "Auth temporal" (línea 687): "`X-Admin-Key` no es
    suficiente para una UI admin real. Se debe evitar exponerlo en
    Angular."
  - **No hay una decisión D0/D1** registrada en este documento.
- **Conclusión**: el documento es una auditoría con recomendaciones, no
  una spec ni una decisión. **Cualquier afirmación del estilo "D1-04
  vigente" basada en este archivo no es correcta** — el archivo
  recomienda opciones sin comprometer una.

#### 4.3. Resto de specs vigentes que mencionan `X-Admin-Key`

- `openspec/specs/admin-certificate-delivery/spec.md` y
  `admin-certificate-emission/spec.md` mencionan `X-Admin-Key` con la
  salvedad de que **NO DEBE** aparecer en bundle Angular, localStorage
  ni cookies legibles por JS, y que una UI admin MVP debería usar
  "cPanel Basic Auth o sesión/proxy PHP HttpOnly". Son menciones
  contractuales que no constituyen decisión adoptada.

### 5. Tablero y ramas

- No existe archivo de tablero versionado en este checkout que liste
  fases/ciclos "P0-P9" como estado del proyecto.
- `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` describe el plan M1-M4
  (con M4-06 cancelado por D0). **No menciona P5**.
- `docs/02-arquitectura.md` y `docs/01-contexto-decisiones-stack.md`
  no mencionan explícitamente la spec de auth admin más allá de
  referenciar `X-Admin-Key` como "temporal".
- `AGENTS.md` raíz define: "Auth admin simple con `X-Admin-Key` es
  temporal; login real es fase posterior." Esta es la única frase
  normativa vigente sobre el tema en este checkout.

### 6. CodeGraph (verificado en este checkout)

CodeGraph está indexado en `.codegraph/` (9.7 MB DB). Blast radius
verificado para `AuthGate::requireAdmin` y `X-Admin-Key`:

- `requireAdmin` en `apps/backend-php/src/AuthGate.php:15` tiene 3
  callers en `apps/backend-php/index.php`; tests en
  `apps/backend-php/tests/AuthGateTest.php`.
- `requireAdmin` wrapper en `apps/backend-php/index.php:640` tiene 1
  caller (la función helper `adminConfig`).
- No se encontraron referencias a endpoints `/admin/auth/*` en el
  grafo (no existen).
- `MOCK_SESSION` y `adminGuard` están en
  `apps/frontend-angular/src/app/features/admin/`.

## Reclasificación: verificado vs. propuesto

### Requisitos VERIFICADOS (actualmente vigentes en este checkout)

1. **R-GATE-1**: los endpoints admin deben exigir `X-Admin-Key` con
   comparación en tiempo constante (`hash_equals`); falla cerrada si
   config o header inválidos. **Fuente**: `openspec/specs/admin-auth/spec.md`.
2. **R-GATE-2**: la respuesta, auditoría y logs no deben contener la
   clave completa ni parcial. **Fuente**: misma spec.
3. **R-GATE-3**: la clave configurada debe tener ≥16 caracteres
   (validación en `Config::adminApiKey()`). **Fuente**: spec +
   `Config.php`.
4. **R-FRONT-1**: la UI admin no debe embeber `X-Admin-Key` en bundle,
   `localStorage`, `sessionStorage`, cookies legibles por JS, ni
   IndexedDB. **Fuente**: `docs/backend/01-contrato-api-certificados.md:537`
   y specs `admin-certificate-emission`/`delivery`.
5. **R-FRONT-2**: la sesión admin actual es mock en memoria
   (`MockSession` con `signal<boolean>`); sin persistencia, sin red.
   **Fuente**: `apps/frontend-angular/src/app/features/admin/mock-session.ts`
   y specs `admin-foundation`.
6. **R-LOG-1**: D0 obliga a logs/auditoría/errores sin DNI completo
   ni token completo. **Fuente**: `AGENTS.md` raíz y
   `docs/00-indice-general.md`.
7. **R-LOG-2**: D0 obliga a QR/token permanente; el reenvío normal NO
   rota token. **Fuente**: `AGENTS.md` raíz.

### Requisitos PROPUESTOS (no vigentes,根拠 huérfano o no-versionado)

1. **P-SESSION-1** *(propuesto por blob huérfano §P5-01)*: reemplazar
   `X-Admin-Key` por sesión PHP con cookie `HttpOnly; Secure;
   SameSite=Strict; Path=/certificados/`. **Estado**: NO vigente. Solo
   mencionado en el blob huérfano del plan P0-P9.
2. **P-SESSION-2** *(propuesto por blob huérfano)*: agregar CSRF para
   métodos mutantes. **Estado**: NO vigente. Solo mencionado en el
   blob huérfano.
3. **P-ENDPOINTS-1** *(propuesto por blob huérfano)*: añadir
   `POST /admin/auth/login`, `GET /admin/auth/session`,
   `POST /admin/auth/logout`. **Estado**: NO vigente. Solo mencionado
   en el blob huérfano.
4. **P-TESTS-1** *(propuesto por blob huérfano)*: 9 escenarios RED
   específicos. **Estado**: NO vigente. El plan canónico
   `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` no lista estos
   escenarios.
5. **P-COOKIE-1** *(propuesto por blob huérfano)*: nombre
   `ifts14_admin_sid` y TTL 8h. **Estado**: NO vigente. Recomendación
   interna del blob.
6. **P-HASH-1** *(propuesto por blob huérfano)*: Argon2id para
   `admin_password_hash`. **Estado**: NO vigente. Recomendación
   interna del blob.
7. **P-LEGACY-1** *(propuesto por blob huérfano)*: flag
   `admin_api_key_legacy_enabled` para mantener `X-Admin-Key` en
   smokes CLI durante la transición. **Estado**: NO vigente.
   Recomendación interna del blob.
8. **P-CSRF-1** *(propuesto por blob huérfano)*: cookie companion
   `ifts14_admin_csrf` no-HttpOnly + header `X-CSRF-Token`. **Estado**:
   NO vigente. Recomendación interna del blob.
9. **P-RAMA-1** *(propuesto por blob huérfano)*: rama
   `integration/admin-session-http`. **Estado**: NO vigente. Solo
   sugerencia interna del blob. La rama actual es
   `security/backend-preproduction-hardening` y debe confirmarse con
   el usuario.
10. **P-AUDIT-1** *(mencionado en archivo de auditoría no
    versionado)*: la auth admin debería migrar a cookie HttpOnly o
    Basic Auth de cPanel. **Estado**: NO es decisión; es lista de
    opciones.
11. **P-D1-04** *(atribuido a "decisión vigente")*: "Auth admin =
    sesión PHP simple con cookie HttpOnly; X-Admin-Key solo CLI".
    **Estado**: **NO VERIFICABLE en este checkout**. El término "D1-04"
    solo aparece en el blob huérfano y en el archivo de auditoría no
    versionado. Ningún spec, AGENTS.md, README.md, GUIA.md, ni
    contrato del backend lo ratifica como decisión adoptada.

## Áreas afectadas (estimación de blast radius)

Inventario de archivos que P5-01 probablemente necesitará revisar si
`sdd-propose` decide que un delta de `admin-auth` es viable. Esta
sección es **orientativa**, no comprometida.

| Archivo | Acción posible | Motivo |
|---|---|---|
| `openspec/specs/admin-auth/spec.md` | **Delta MODIFIED + ADDED** (decisión de sdd-propose) | Spec vigente; cualquier cambio de auth debe documentarse como delta, preservando el escenario "Header válido" si se decide mantener `X-Admin-Key` como legacy CLI. |
| `apps/backend-php/src/AuthGate.php` | Probable modificación | Hoy compara `X-Admin-Key`. Podría pasar a validar cookie de sesión, o mantenerse como `AuthHeaderGate` complementario. |
| `apps/backend-php/src/Config.php` | Probable modificación | Aceptar nuevas claves externas (`admin_user`, `admin_password_hash`). `admin_api_key` podría pasar a opcional. |
| `apps/backend-php/src/Response.php` | Probable modificación | Helpers para emitir `Set-Cookie` con atributos `HttpOnly; Secure; SameSite=Strict`. |
| `apps/backend-php/index.php` | Probable modificación | Despachar `/admin/auth/login`, `/admin/auth/session`, `/admin/auth/logout`. CSRF middleware para mutantes. |
| `apps/backend-php/.htaccess` | Probable verificación | Confirmar que `/admin/auth/*` se enruta a `index.php` (hoy cubierto por `FallbackResource`). |
| `apps/backend-php/tests/AuthGateTest.php` | Probable modificación o deprecación | Migrar casos a un nuevo `AuthSessionTest.php` si el gate se separa. |
| `apps/backend-php/tests/AuthSessionTest.php` *(nuevo)* | **Crear** (si sdd-spec lo aprueba) | Cobertura del nuevo gate de sesión. |
| `docs/backend/00-php84-api.md` | Probable modificación | Documentar nuevos endpoints y contrato. |
| `docs/backend/01-contrato-api-certificados.md` | Probable modificación | Sección de auth admin y CSRF. |
| `docs/02-arquitectura.md` y `docs/01-contexto-decisiones-stack.md` | Probable actualización | Solo si se consolida una decisión D0/D1. |
| `openspec/AGENTS.md` | Sin cambios | Convención SDD vigente. |

**No tocar** (verificado por docs/contracts vigentes):

- `apps/frontend-angular/**` (F2-03..F5-02 siguen con sesión mock; el
  wiring real de la sesión queda fuera del alcance de un eventual P5-01
  backend y se haría en ciclos posteriores coordinados con Matías).
- `database/migrations/**` (no requiere nueva migración si la sesión
  es filesystem; decisión de sdd-design).
- `deploy/**` y `cPanel` (P8 del plan huérfano).
- `material_privado_no_versionar/` (jamás).
- `apps/backend-php/config/**` (config real, prohibida por
  `apps/backend-php/AGENTS.md`).
- El blob huérfano del plan P0-P9 y el archivo de auditoría no
  versionado (no son fuentes normativas; si sdd-archive necesita
  referenciarlos, hacerlo solo como "evidencia histórica encontrada",
  no como spec vigente).

## Approaches comparados (orientativos; decisión final en sdd-propose)

| Approach | Pros | Con | Effort | Verificado en checkout |
|---|---|---|---|---|
| **A. Mantener `X-Admin-Key` como gate admin** (status quo) | Cero código nuevo; cumple spec `admin-auth` actual. | Una UI admin en navegador no puede usarlo sin exponer la clave; contradice `docs/backend/01-contrato-api-certificados.md:537` y F2-03 archive-report. | — (sin cambios) | ✅ |
| **B. Sesión PHP con cookie `HttpOnly` + CSRF** (propuesto por blob huérfano) | Cumple "cookie HttpOnly" recomendado por archivo de auditoría no versionado y por la lista de opciones contractuales en `admin-certificate-delivery`/`emission`. Trivial de revertir. | Requiere nuevo spec, nuevos endpoints, tests, configuración externa de password. CSRF token añade complejidad. | Medium | ❌ (no hay spec actual que lo apruebe) |
| **C. cPanel Basic Auth** (recomendado por archivo de auditoría) | Cero código PHP nuevo. | Sin logout real sin cerrar navegador. Sin estado de servidor. Sin CSRF (HTTP Basic). Fricción UX alta. | Low | ❌ (no hay spec actual que lo apruebe) |
| **D. Auth externo (Keycloak/Auth0/IdP)** | Estándar OIDC, MFA, rotación. | Composer nuevo, secreto de cliente, infra fuera de cPanel, contradice "solución segura más simple". | High | ❌ |
| **E. JWT firmado en cookie** | Sin estado de servidor. | Sin revocación inmediata; superficie criptográfica mayor. | Medium-High | ❌ |

### Recomendación (orientativa, no comprometida)

La decisión final es humana y sdd-propose debe presentarla como ALTO-A.
Sobre la base de la evidencia disponible en este checkout:

- Si el usuario quiere mantener la spec actual: Approach A.
- Si el usuario quiere habilitar UI admin en navegador: Approach B
  (con cookie HttpOnly) o C (Basic Auth). Ambos son los únicos listados
  en las specs vigentes como compatibles.

El "D1-04" atribuido al blob huérfano no puede presentarse como
decisión vigente.

## Decisiones a resolver en `sdd-propose`

1. **Bloqueo crítico de spec**: ¿`admin-auth/spec.md` se modifica con
   delta MODIFIED+ADDED, o se crea una spec nueva
   `admin-auth-php/spec.md`? Esta decisión es prerrequisito de todo
   lo demás.
2. **Bloqueo de dirección**: ¿se mantiene `X-Admin-Key` (status quo)
   o se migra a sesión PHP con cookie HttpOnly o Basic Auth de
   cPanel? El usuario debe elegir.
3. **Bloqueo de rama**: rama actual es
   `security/backend-preproduction-hardening`; el blob huérfano
   sugiere `integration/admin-session-http`, pero no es decisión
   normativa. Usuario confirma.
4. **Bloqueo de coherencia**: `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`
   llega a M4; el blob huérfano continúa con P5+. ¿Cuál es el plan
   vigente en este checkout? Solo M1-M4 según lo versionado, pero el
   blob huérfano podría reflejar intención del usuario.
5. **Bloqueo de tooling de tests**: `apps/backend-php/tests/` son
   scripts PHP procedurales (no PHPUnit/Pest). Mantener el patrón o
   introducir PHPUnit/Pest (decisión humana, ALTO-A).
6. **Bloqueo de compat**: si se migra, ¿`X-Admin-Key` queda como
   legacy CLI (flag) o se elimina?
7. **Bloqueo de CSRF**: si se opta por cookie, ¿CSRF con token
   explícito (cookie companion) o con el patrón double-submit?
8. **Bloqueo de password hashing**: si se opta por sesión, ¿Argon2id
   (recomendado por blob huérfano), bcrypt o PASSWORD_DEFAULT?
9. **Bloqueo de persistencia de sesión**: filesystem (default PHP) o
   DB con nueva migración `cert_sesiones_admin`?

## Decisiones D0/D1 vigentes que aplican

Las únicas decisiones D0 ratificadas en este checkout son las del
`AGENTS.md` raíz y `README.md` raíz:

- **D0-QR**: token/QR permanente. Reenvío normal NO rota token. Solo
  revocación explícita o regeneración excepcional auditada.
- **D0-DNI**: DNI completo visible en validación pública (DTO público);
  logs/auditoría/errores sin DNI completo.
- **D0-AUTH**: "Auth admin simple con `X-Admin-Key` es temporal; login
  real es fase posterior." (frase textual de `AGENTS.md` raíz).
- **D0-EMAIL**: fuera del MVP. Entrega manual sin SMTP.
- **D0-COMPOSER**: gate; `vendor/` local como artefacto, nunca
  versionado.
- **D0-FIRMANTES**: Rector/a y Asesor/a Pedagógica vía configuración
  institucional.
- **D0-STAGING**: `/certificados_staging/` separado de producción.

**No hay decisiones D1 vigentes** en este checkout (D1-04 vive en el
blob huérfano, no en spec versionada).

## Reglas SDD vigentes (verificadas)

- `openspec/AGENTS.md`: un cambio por vez; `sdd-archive` al cerrar;
  no secretos/dumps/credenciales.
- `openspec/config.yaml`: `schema: spec-driven`; `rules.specs` exige
  Given/When/Then y RFC 2119 (DEBE/SHALL/SHOULD/MAY).
- `apps/backend-php/AGENTS.md`: PDO + prepared statements; no exponer
  DNI/token/credenciales en logs; config fuera de Git; sin
  `config.php`/`db.php`/`database.php` versionables; "no nuevas
  dependencias sin aprobación".
- `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`: Marcos no ejecuta
  commit/push/PR sin aprobación explícita; no `git merge`, `git
  rebase`, `git push` a `main` ni merge de PR desde OpenCode;
  cambio/creación de rama solo con árbol limpio y rama fuente
  explícita.

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| **R1. Atribuir a "decisión D1-04 vigente" algo que solo vive en un blob huérfano.** | Alta (ocurrió en la exploración previa) | Documentar la proveniencia real de cada afirmación. Marcar "verificado en checkout" vs "propuesto en blob huérfano" vs "mencionado en archivo no versionado". |
| **R2. Tratar el archivo de auditoría no versionado como spec.** | Media | El archivo lista opciones; no es spec. Cualquier decisión debe pasar por sdd-propose y sdd-spec. |
| **R3. El `git ls-files --stage` output es engañoso** (muestra el path aunque `git rev-parse :0:<path>` diga que no está). | Alta (ya nos mordió) | Usar `git rev-parse :0:<path>` como prueba canónica de "está en el índice". |
| **R4. Asumir 9 tests RED predefinidos** sin spec normativa. | Alta | `sdd-tasks` debe diseñar los RED desde cero en base a la decisión adoptada, no copiar los del blob huérfano. |
| **R5. Asumir rama `integration/admin-session-http`.** | Media | La rama actual `security/backend-preproduction-hardening` es válida hasta que el usuario indique lo contrario. |
| **R6. M3-03 introdujo `X-Admin-Key` y varias specs lo mencionan.** Cualquier delta de `admin-auth/spec.md` debe preservar coherencia con `admin-certificate-emission/delivery/revocation`. | Alta | Coordinar deltas con sdd-spec. |
| **R7. Tests PHP son scripts procedurales, no PHPUnit/Pest.** El plan huérfano exige TDD estricto pero no especifica framework. | Media | Mantener scripts procedurales (consistente con `AdminCertificateServiceTest.php` y otros) o introducir PHPUnit/Pest (decisión humana, ALTO-A). |
| **R8. D0 impide tokens, DNI completo en logs.** La nueva ruta de login puede tentar a loguear password hasheado o cookie. | Baja | Cualquier test RED debe incluir un caso "sin secretos en logs". |
| **R9. `IFTS14_auditoria_backend_y_plan_descarga_qr.md` no está versionado** pero existe en árbol de trabajo. Puede ser borrado por un `git clean` o por un `git stash` agresivo. | Baja | No referenciarlo como spec; solo como evidencia de recomendaciones. |
| **R10. El blob huérfano del plan P0-P9 puede ser eliminado por un futuro `git gc` o `git repack -ad`.** Si sdd-archive intenta parchearlo, fallará. | Baja | No parchear el blob huérfano; crear el spec canónico en OpenSpec. |
| **R11. Cobertura de tests en scripts procedurales** (sin framework) requiere disciplina manual; cualquier GREEN no demostrado por salida textual no es válido per `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:48-53`. | Baja | Documentar comando, exit code, salida y por qué demuestra el problema en cada paso. |

## Verificaciones mínimas de sdd-apply (no ejecutadas aquí)

Si sdd-spec aprueba un delta y sdd-apply se ejecuta, los checks
mínimos serían:

- `php -l apps/backend-php/src/<nuevo>.php` (cuando exista).
- `php apps/backend-php/tests/<nuevo>Test.php` con `echo "OK ..."`.
- `php apps/backend-php/tests/AuthGateTest.php` con `echo "OK ..."`
  (verde o deprecación justificada).
- `bash scripts/php-docker-modules-check.sh` PASS.
- `bash scripts/php-docker-lint.sh` PASS.
- Smoke real con `sudo docker run` aislado, sin pegar `X-Admin-Key`,
  cookie, password, DNI ni token en la evidencia.
- `git diff --stat` antes de stage; `git status --short` antes de
  commit.

## Ready for proposal

**Parcial — con bloqueos humanos obligatorios.** Antes de pasar a
`sdd-propose`, el usuario debe resolver:

1. **¿La spec de P5-01 debe crearse desde cero, o existe un mandato
   externo (no versionado) que ya eligió sesión PHP con cookie
   HttpOnly?** Si existe, debe normalizarse como spec OpenSpec.
2. **Rama de trabajo**: ¿continuar en
   `security/backend-preproduction-hardening`, switchear a
   `integration/admin-session-http`, o crear rama nueva? No switcheo
   sin aprobación.
3. **Plan normativo**: ¿M1-M4 según `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`,
   P0-P9 según el blob huérfano, o un híbrido? El usuario decide.
4. **Tooling de tests**: ¿mantener scripts PHP procedurales o
   introducir PHPUnit/Pest?
5. **Spec a modificar o crear**: ¿`admin-auth/spec.md` con delta
   MODIFIED+ADDED, o spec nueva `admin-auth-php/spec.md`?

Una vez resueltos, sdd-propose puede arrancar con el alcance
delimitado aquí.

## Documentos y código leídos (verificado por existencia real)

| Recurso | Estado verificado | Cómo se verificó |
|---|---|---|
| `AGENTS.md` (raíz) | Leído | `Read` directo |
| `README.md` | Leído | `Read` directo |
| `GUIA.md` | Leído | `Read` directo |
| `docs/00-indice-general.md` | Leído | `Read` directo |
| `docs/opencode/optimizacion-tokens.md` | Leído | `Read` directo |
| `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Leído | `Read` directo (524 líneas) |
| `openspec/AGENTS.md` | Leído | `Read` directo |
| `openspec/config.yaml` | Leído | `Read` directo |
| `openspec/specs/README.md` | Leído | `Read` directo |
| `openspec/specs/admin-auth/spec.md` | Leído (es spec vigente) | `Read` directo |
| `openspec/changes/m4-01a-backend-contrato-token-permanente-dni-fechas/exploration.md` | Leído | `Read` directo (precedente) |
| `apps/backend-php/AGENTS.md` | Leído | `Read` directo |
| `apps/backend-php/src/AuthGate.php` | Leído | `Read` directo (33 líneas) |
| `apps/backend-php/src/Config.php` | Leído | `Read` directo (líneas 1-147) |
| `apps/backend-php/src/Response.php` | Leído | `Read` directo (61 líneas) |
| `apps/backend-php/src/DniCipher.php` | Leído (CodeGraph) | `codegraph_explore` |
| `apps/backend-php/index.php` | Leído (líneas 593-911) | `Read` directo + CodeGraph |
| `apps/backend-php/tests/AuthGateTest.php` | Leído | `Read` directo (41 líneas) |
| `apps/backend-php/.htaccess` | Leído | `Read` directo |
| `docs/backend/00-php84-api.md` | Leído | `Read` directo |
| `docs/backend/01-contrato-api-certificados.md` | Leído (líneas 100-300) | `Read` directo + grep |
| `openspec/changes/archive/2026-07-07-f2-03-admin-login-shell/{proposal,design,exploration}.md` | Leído (precedente) | `Read` directo |
| `IFTS14_auditoria_backend_y_plan_descarga_qr.md` | Leído (existe en working tree, no en Git) | `test -e` + grep |
| `docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SSD_TDD.md` | **No en working tree, no en índice actual; solo accesible como blob huérfano** | `git rev-parse :0:...` (fatal), `git ls-files --stage --` (vacío), `git ls-tree HEAD` (muestra blob), `git cat-file -p` (contenido) |
| CodeGraph | Indexado (9.7 MB DB), consultado | `codegraph_explore` |

## Vacíos y contradicciones detectados (revisados)

1. **No hay spec OpenSpec canónica para P5-01**. La spec vigente
   (`admin-auth/spec.md`) sigue describiendo `X-Admin-Key`. Cualquier
   propuesta de P5-01 debe comenzar produciendo un delta o una spec
   nueva.
2. **Planes divergentes en este checkout**:
   `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (vigente, M1-M4) y un
   blob huérfano (P0-P9, no vigente). El usuario debe confirmar el
   alcance.
3. **Rama actual ≠ rama sugerida por blob huérfano**: el árbol está
   limpio en `security/backend-preproduction-hardening`; el blob
   sugiere `integration/admin-session-http`. No se switchea.
4. **Archivo del plan P0-P9 no es accesible normalmente**: está como
   blob huérfano (no en índice, no en working tree, no en ningún
   commit). Cualquier intento de editarlo debe pasar por restaurar el
   archivo primero (lo cual modifica el working tree, fuera de
   alcance de esta exploración).
5. **`IFTS14_auditoria_backend_y_plan_descarga_qr.md` no está versionado**
   pero existe en working tree. Es **evidencia de auditoría**, no
   spec. Si el usuario lo invoca como autoridad, debe normalizarse
   primero en OpenSpec.
6. **`admin-auth` spec vigente tiene 3 escenarios muy específicos
   sobre `X-Admin-Key`**. Cualquier delta debe preservarlos o
   justificarlos como legacy transitorio.
7. **Cobertura de tests**: scripts PHP procedurales, no PHPUnit/Pest.
   El TDD estricto (si sdd-design lo exige) debe adaptarse a esa
   realidad o introducir Composer (decisión humana).
8. **`git ls-files` miente para este blob**: muestra el path aunque
   `git rev-parse :0:<path>` diga que no existe. El comando canónico
   para "está en el índice" es `git rev-parse :0:<path>`, no
   `git ls-files --stage`.
