# Diseño: Shell Angular y preparación de validación pública

## Enfoque técnico

Crear una app Angular 20 standalone mínima en `apps/frontend-angular/`, desplegable bajo `/certificados/`, con routing público y una feature `public-validation` aislada. La pantalla leerá `:tokenCertificacion` desde la ruta mediante `withComponentInputBinding()` y delegará la carga a un servicio de validación con señales/`resource()`. Por ahora el servicio usará datos ficticios; la frontera TypeScript respetará el contrato PHP existente para poder reemplazar el mock por `/certificados/api/certificados/{token}/verificacion` sin reescribir la UI.

## Decisiones de arquitectura

| Decisión | Opción elegida | Alternativas | Fundamento |
|---|---|---|---|
| Scaffold | Angular CLI 20 standalone con routing | Scaffold manual | Reduce configuración propia y respeta el stack confirmado. |
| Estado de carga | `resource()` sobre servicio mock async; `httpResource()` queda preparado para el adapter real | Servicio síncrono | Permite probar `idle/loading/resolved/error` sin inventar HTTP falso. |
| Rutas | `''` carga landing no validante; `validar/:tokenCertificacion` carga la feature pública; `**` carga página no encontrada | Ruta única con query param | Evita validar tokens demo por accidente y conserva el QR esperado `/certificados/validar/{token}`. |
| UI | Shell semántico mínimo, sin sistema visual final | Portar v0 ahora | Matías mantiene UI/UX final; Marcos solo desbloquea integración. |
| Tailwind | Setup técnico opcional y acotado | Tokens/componentes finales | Sirve como utilidad futura sin fijar diseño. |

## Flujo de datos

```txt
/certificados/validar/:token
        ↓
Router input binding → PublicValidationPage.tokenCertificacion()
        ↓
ValidationService.verify(token) [mock async]
        ↓
ValidationResult VM: valido | no_verificable | no_encontrado | error_tecnico
        ↓
Template accesible con estados públicos
```

En integración real, el servicio llamará `GET /certificados/api/certificados/{token}/verificacion`. `404 CERTIFICATE_NOT_FOUND` se mapeará a estado público no verificable, no a error técnico.

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/frontend-angular/package.json` | Crear | Dependencias Angular 20 y scripts `start`, `build`, `test` si el CLI los genera. |
| `apps/frontend-angular/angular.json` | Crear | Configuración build con soporte de base `/certificados/`. |
| `apps/frontend-angular/src/main.ts` | Crear | Bootstrap standalone. |
| `apps/frontend-angular/src/app/app.config.ts` | Crear | `provideRouter(routes, withComponentInputBinding())` y futuro `provideHttpClient()`. |
| `apps/frontend-angular/src/app/app.routes.ts` | Crear | Rutas públicas mínimas. |
| `apps/frontend-angular/src/app/app.ts` | Crear | Shell raíz semántico con `RouterOutlet`. |
| `apps/frontend-angular/src/app/features/public-validation/*` | Crear | Página pública, modelo de vista y componentes de estado mínimos. |
| `apps/frontend-angular/src/app/shared/certificates/*` | Crear | DTOs del contrato PHP, mapper y servicio mock reemplazable. |
| `apps/frontend-angular/src/styles.css` | Crear | Estilos base mínimos; Tailwind solo si el setup lo requiere. |
| `docs/frontend/00-angular20-port-v0.md` | Modificar en archive | Registrar estructura técnica creada y límites de UI final. |

## Interfaces / contratos

```ts
export interface ApiEnvelope<T> { data: T; meta: { requestId: string }; }
export interface ApiErrorEnvelope { error: { code: string; message: string; details: unknown[] }; meta: { requestId: string }; }

export interface CertificateVerificationDto {
  valid: true;
  status: 'vigente';
  certificateCode: string;
  student: { displayName: string; documentMasked: string };
  course: { name: string; issuedAt: string };
  verifiedAt: string;
}

export type ValidationViewState =
  | { kind: 'valid'; certificate: CertificateVerificationDto; requestId: string }
  | { kind: 'not-verifiable' | 'not-found' | 'technical-error'; requestId?: string };
```

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Unit | Mapper DTO/error → `ValidationViewState`, especialmente `404` | Tests Angular/TS mínimos generados por CLI. |
| Component | Ruta con token y render de estados ficticios | Test de componente sin datos reales. |
| Build | Base `/certificados/` y compilación Angular | `ng build --configuration production --base-href /certificados/`. |
| E2E | Navegación pública por rutas profundas | Diferido hasta runner E2E o decisión de Matías/QA. |

## Migración / rollout

No requiere migración de datos. Rollout recomendado en tres unidades revisables: shell, flujo público mock y frontera API/build. No tocar deploy real ni `public_html`.

## Preguntas abiertas

- [ ] Confirmar si Tailwind se instala ahora como utilidad técnica o queda diferido a Matías.
