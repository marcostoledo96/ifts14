# Design: Login UI polish (breve)

## Technical Approach

Pulido in-place en `LoginPage` + `LoginForm`. Auth intacta. Loading en page; UI en form. SVG inline (patrón revoke/monograma).

## Architecture Decisions

| Decision | Choice | Rejected | Rationale |
|----------|--------|----------|-----------|
| Iconos | SVG inline | lucide-angular | Sin deps; alineado a foundation |
| Loading | `input()` en form + signal en page | Loading solo en form | Page ya hace `await auth.login` |
| Aside | Template en login-page | Extraer componente | Un solo consumidor |
| Mobile | Barra marca compacta | `display:none` total | Paridad captura mobile |

## Data Flow

```
LoginForm.enviar() → emit credentials → clear fields
LoginPage.loading=true → auth.login() → navigate | errorMsg
                 └→ loading=false (finally)
LoginForm [loading] → disabled fieldset + «Verificando…»
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `login-form.ts/html/css` | Modify | Iconos, toggle, auditoría, CTA, loading UI |
| `login-form.spec.ts` | Modify | Casos toggle/auditoría/loading; copy |
| `login-page.ts/html/css` | Modify | loading, aside, footer, texturas, copy |
| `login-page.spec.ts` | Modify | Copy panel + loading |
| `openspec/specs/admin-foundation/spec.md` | Modify | Escenario auditoría |

## Interfaces

```typescript
// LoginForm
readonly loading = input(false);
readonly showPassword = signal(false);
togglePasswordVisibility(): void;
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Toggle, auditoría, CTA, loading UI | Karma/Jasmine en login-form/page |
| Auth | Sin cambio | No tocar admin-auth specs |

## Migration / Rollout

No migration required.

## Open Questions

None.
