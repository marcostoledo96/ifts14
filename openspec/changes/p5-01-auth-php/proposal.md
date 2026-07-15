# Propuesta: P5-01 — Autenticación PHP con sesión nativa

## Intención

Evolucionar el `X-Admin-Key` temporal hacia login y sesión PHP para navegador, sin exponer secretos en Angular. La solicitud actual autoriza el cambio; `openspec/specs/admin-auth/spec.md` sigue vigente hasta aplicar sus deltas.

## Alcance confirmado

### Incluido
- Definir el contrato de login, consulta de sesión, logout y autorización administrativa.
- Usar sesiones nativas de PHP y cookies estándar, con gate local previo a la implementación y gate PHP-FPM/cPanel previo al despliegue.
- Exigir protección CSRF en operaciones mutantes autenticadas por cookie.
- Mantener tests PHP procedurales, sin PHPUnit, Pest ni Composer.
- Conservar `X-Admin-Key` solo para CLI/smokes verificados durante una transición acotada; nunca en el navegador.

### Fuera de alcance
- `apps/frontend-angular/**`.
- Migraciones, infraestructura, deploy, secretos o cambios de rama/Git.
- Sesiones en base de datos o identidad externa.

## Capacidades

### Nuevas capacidades
Ninguna.

### Capacidades modificadas
- `admin-auth`: reemplazar el gate exclusivo por sesión y transición CLI acotada.
- `admin-master-data-api`, `admin-certificate-consulta`, `admin-certificate-delivery`, `backend-contrato-api-certificados`, `certificate-pdf-qr-generation`: alinear requisitos que hoy exigen literalmente `X-Admin-Key`.

## Enfoque y límites de seguridad

- Cookie `HttpOnly`, `Secure`, `SameSite` restrictivo y alcance mínimo; regenerar al autenticar e invalidar al cerrar sesión.
- Credenciales y configuración fuera de Git; errores genéricos y falla cerrada.
- No registrar contraseñas, hashes, sesión, cookies, CSRF, claves, DNI ni tokens completos.
- El blob histórico P0-P9 no es fuente vigente ni aporta requisitos.

## Decisiones diferidas a spec/diseño

- Rutas, DTOs, estados HTTP, TTL, cookie e inactividad.
- Usuario mínimo, verificación de contraseña y mecanismo CSRF.
- Inventario, habilitación y retiro de `X-Admin-Key`.
- Evidencia efectiva de `session.save_path`, cookies y runtime bajo `/certificados/` en PHP-FPM/cPanel antes de activar staging o producción.

## Gates aprobados

| Gate | Habilita | No habilita |
|---|---|---|
| Local, Docker PHP 8.4 | Iniciar RED y editar fuente después de un `PASS` completo con evidencia procedural local. | Afirmar equivalencia con cPanel, desplegar o habilitar login browser en staging/producción. |
| Despliegue, PHP-FPM/cPanel real | Activar staging/producción después de un `PASS` completo con evidencia sanitizada. | Reescribir evidencia fallida o no disponible como aprobada. |

La evidencia vigente de producción/staging permanece en **STOP**. El desarrollo local no la reemplaza: los dos gates tienen alcance y evidencia independientes.

## Áreas afectadas

| Área | Impacto |
|---|---|
| `openspec/changes/p5-01-auth-php/specs/` | Deltas contractuales |
| `apps/backend-php/{index.php,src/,tests/}` | Implementación futura |
| `docs/backend/` | Actualización al archivar |

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Secuestro/fijación de sesión o CSRF | Cookies endurecidas, regeneración, invalidación y protección CSRF |
| Dos gates abiertos sin límite | Flag server-side, inventario de consumidores y retiro explícito |
| Restricción de sesiones en cPanel | Gate fail-closed antes del despliegue; sin `SessionStore` propio |

## Reversión

Revertir deltas e implementación, deshabilitar las rutas de sesión y restaurar `X-Admin-Key`, sin migraciones ni limpieza de datos.

## Evidencia vigente

- `openspec/specs/admin-auth/spec.md`: contrato vigente.
- `AGENTS.md`: clave temporal y login posterior.
- `openspec/config.yaml`: tests procedurales sin runner.
- `exploration.md`: estado técnico; P0-P9 es evidencia no normativa.

## Criterios de éxito

- [ ] Specs definen sesión, CSRF, transición y privacidad sin ambigüedad.
- [ ] Diseño mantiene cero exposición de `X-Admin-Key` al navegador y cero cambios frontend/DB/infra.
- [x] Se aprobó un único PR con `size:exception`, presupuesto de 2000 líneas y riesgo de revisión explícito.
