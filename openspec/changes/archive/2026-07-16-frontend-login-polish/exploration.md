## Exploration: Login (UI polish)

### Current State

**Referencia visual (`muestra_pagina/`)**

- Formulario: `muestra_pagina/components/admin/login-form.tsx` (completo).
- Layout: `muestra_pagina/app/admin/login/page.tsx` (aside institucional + card + footer).
- Capturas: `capturas/login-desktop.png`, `login-mobile.png`, `login-error.png`, `login-loading.png`.
- Prompt: `prompts_stitch_v0_ifts14.md` §7 — Login administrativo.

La referencia incluye: iconos en inputs (IdCard / KeyRound), toggle show/hide password (Eye/EyeOff), aviso de auditoría (ShieldCheck + “Todas las acciones administrativas quedan registradas.”), botón “Ingresar” con flecha / “Verificando…” + spinner, ayuda a Coordinación Académica, aside oscuro con marca “Bedelía Digital”, mensaje institucional, textura grilla, estado del sistema, footer restringido. Mobile: barra de marca compacta (no oculta toda la identidad).

**Importante — no portar:** credenciales demo (`usuario.demo@example.invalid` / `demo`), delay simulado, ni `window.location` hardcodeado. Auth real ya existe en Angular.

**Angular hoy**

| Pieza | Path | Estado |
|-------|------|--------|
| Página | `login-page.{ts,html,css}` | Layout 2 columnas; aside oculto en mobile; card “Iniciar sesión”; error en página |
| Form | `login-form.{ts,html,css}` | Validación local + `output` `accesoSimulado`; sin iconos, toggle, loader ni aviso auditoría |
| Auth | `admin-auth.service.ts` | `HttpAdminAuthService.login/session/logout` + `FakeAdminAuthService` — **fuera de alcance de cambio** |
| Specs | `login-form.spec.ts`, `login-page.spec.ts` | Cubren a11y básica, validación, emit, clear fields, errores 401/429 |

Flujo actual (mantener):

1. `LoginForm.enviar()` valida → emite `{ username, password }` → limpia campos (REQ-AUTH-008).
2. `LoginPage.onAccesoSimulado()` → `auth.login(credentials)` → navega `/admin/dashboard` o setea `errorMsg`.

Gaps UI vs referencia (sin tocar contrato auth):

1. Iconos en inputs (username / password).
2. Toggle mostrar/ocultar clave.
3. Estado loading en submit (“Verificando…”, `aria-busy`, fieldset disabled).
4. Aviso auditoría (ShieldCheck + copy institucional) — reemplazar tip amarillo de “simulación”.
5. Copy card: “Panel de certificaciones” + subtítulo autorizado; CTA “Ingresar”.
6. Aside: mensaje institucional, textura grilla, marca Bedelía Digital, footer; mobile con identidad visible.
7. Footer de página + ayuda Coordinación Académica.
8. Error con ícono (paridad visual; mensajes 401/429 se mantienen).

**Specs legacy:** `openspec/specs/admin-foundation/spec.md` aún exige “Acceso simulado…”. Tras P5-04 eso está obsoleto; el polish debe alinear copy a auth real y actualizar/delta ese escenario en propose/spec.

**Iconos en el proyecto:** no hay `lucide-angular` ni librería de iconos. Patrón vigente: SVG inline (`certification-revoke-page`, monograma login). No agregar dependencia solo para este ciclo.

### Affected Areas

- `apps/frontend-angular/src/app/features/admin/login-form.{ts,html,css,spec.ts}` — UI del formulario + signals locales (`showPassword`, input `loading`).
- `apps/frontend-angular/src/app/features/admin/login-page.{ts,html,css,spec.ts}` — loading alrededor de `auth.login`, copy aside/card/footer, texturas.
- `openspec/specs/admin-foundation/spec.md` (delta) — retirar/reemplazar escenario “Acceso simulado”.
- Posible delta liviano en capability login UI si se crea spec del cambio; **no** tocar `admin-angular-auth` REQ-AUTH-* salvo aclarar que UI no altera contrato.

**No tocar:** `admin-auth.service.ts` (`login`/`session`/`logout`/`clearSession`), interceptors, guards, endpoints, envelope de credenciales.

### Approaches

1. **Pulido quirúrgico in-place (recomendado)** — Mejorar templates/CSS/signals de `LoginPage` + `LoginForm`; SVG inline; `loading` como `input()` del form controlado por la página alrededor del `await auth.login`.
   - Pros: paridad visual con bajo blast radius; TDD focalizado; sin deps nuevas; auth intacta.
   - Cons: templates un poco más densos; mobile header queda en el mismo CSS del page.
   - Effort: Low–Medium

2. **Extraer `login-aside` como componente** — Separar aside + footer institucional.
   - Pros: más limpio si el aside crece.
   - Cons: overhead de archivos para un solo consumidor; no aporta a auth.
   - Effort: Medium

3. **Introducir librería de iconos (lucide)** — Alinear 1:1 con React.
   - Pros: API de iconos familiar.
   - Cons: dependencia nueva fuera de alcance; contradice patrón SVG inline; riesgo de review size.
   - Effort: Medium (innecesario)

### Recommendation

**Approach 1.** Implementar paridad visual UI-only:

- `LoginPage`: signal `loading`; set true/false en `onAccesoSimulado` sin cambiar llamadas a `ADMIN_AUTH`; pasar `[loading]` al form; actualizar aside/card/footer/copy/texturas; mobile: barra de marca (no `display:none` total del branding).
- `LoginForm`: iconos SVG, toggle password (`aria-pressed` / `aria-label`), aviso auditoría, CTA Ingresar/Verificando…, ayuda Coordinación; respetar validación y emit actuales; deshabilitar fieldset cuando `loading`.
- Tests: nuevos casos para toggle, loading UI, texto auditoría; actualizar expectativas de copy “simulación”.
- Mantener español argentino formal; placeholders institucionales genéricos (sin credenciales demo).
- Design corto recomendado solo para texturas mobile/desktop y tokens CSS; tasks pueden absorberlo si el diseño se documenta en propose.

### Risks

- Specs/tests aún anclan copy de “simulación” / “Acceso administrativo” — fallarán si no se actualizan junto con el HTML.
- `admin-foundation` “Acceso simulado” vs auth real P5-04: hay que delta-ar el escenario para no contradecir el polish.
- Loading + clear inmediato de campos (REQ-AUTH-008): durante “Verificando…” los inputs quedan vacíos; es comportamiento actual aceptable; no revertir el clear.
- No introducir placeholders tipo email demo ni `type="email"` obligatorio: el contrato usa `username` (ID institucional); label puede decir “ID institucional o email” sin cambiar el payload.
- Scope creep: no refactorizar auth, no extraer aside salvo que tasks lo pidan, no tocar dashboard.

### Ready for Proposal

Yes — alcance UI polish claro, referencia y capturas disponibles, auth contract estable. El orquestador puede continuar con `sdd-propose` → `sdd-spec` → design breve (texturas/mobile) → `sdd-tasks` → `sdd-apply`. No verify formal ni archive en este ciclo.
