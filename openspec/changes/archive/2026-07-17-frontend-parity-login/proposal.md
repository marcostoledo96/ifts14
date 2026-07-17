# Proposal: Paridad visual login admin (P-03)

## Intent

Calcar el login Angular a la referencia v0/capturas (`login-*`) sin portar React ni credenciales demo, cerrando los gaps P1 del prompt de paridad.

## Scope

### In Scope

- Protocolo aside: etiqueta visual `SHA-256 / SSL` (chrome de paridad; auth real documentada como cookie HttpOnly + CSRF).
- Placeholder institucional `docente.apellido@ifts14.edu.ar` (estilo captura; **no** demo).
- CTA Ingresar con flecha y hover translate.
- Estados error/loading más cercanos a capturas (posición, copy, `aria-busy`).
- Actualizar tests y documentación corta.

### Out of Scope

- Auth service / backend / CSRF.
- Credenciales demo de `login-form.tsx` v0.
- Shell, dashboard u otras pantallas.
- Tipografía global (P0-7).

## Approach

Approach 1 (explore): cambios quirúrgicos en templates/CSS/copy + tests.

## Risks

| Risk | Mitigation |
|------|------------|
| `SHA-256 / SSL` leído como claim técnico falso | Nota en docs: label visual de paridad; auth real = sesión HttpOnly + CSRF |
| Tests anclados a placeholder/copy viejos | Actualizar specs en el mismo apply |

## Rollback

Revertir `login-page.*` y `login-form.*`.

## Ready for Spec

Yes.
