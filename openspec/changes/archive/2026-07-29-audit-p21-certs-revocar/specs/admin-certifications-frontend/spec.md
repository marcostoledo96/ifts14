# Delta for admin-certifications-frontend

## ADDED Requirements

### Requirement: Diálogo revocar — honesty de carga

En `/admin/certificaciones/:id/revocar` el sistema DEBE cargar el detalle vía `CERTIFICATIONS_SOURCE.obtener(id)`. Fallo hard recuperable: DEBE mostrar mensaje fijo es-AR (*«No se pudo cargar la certificación.»*), marcar `errorRecuperable=true` y ofrecer Reintentar → recarga. Not-found / id inválido distinguible: mensaje controlado SIN Reintentar ni `errorRecuperable`. DEBE NOT pegar raw `Error.message`. Señales de carga (`error` / `errorRecuperable`) DEBEN permanecer separadas del error de submit. DNI completo en ficha (D0); DEBE NOT token completo ni DNI/token en mensajes/logs.

#### Scenario: Load recuperable con Reintentar

- **GIVEN** fallo recuperable al `obtener` en `/revocar`
- **WHEN** termina la carga
- **THEN** mensaje fijo es-AR sin raw; `errorRecuperable=true`; Reintentar → recarga

#### Scenario: Not-found sin Reintentar

- **GIVEN** id inválido, ausente o not-found distinguible
- **WHEN** carga `/revocar`
- **THEN** mensaje controlado; DEBE NOT Reintentar ni `errorRecuperable`

#### Scenario: Load sin raw Error.message

- **GIVEN** cualquier fallo de carga
- **WHEN** se muestra el panel de error
- **THEN** DEBE NOT pegar raw `Error.message` ni DNI/token en el mensaje

### Requirement: Diálogo revocar — submit P15-strict y MOTIVO_MAX

Al confirmar revocación el sistema DEBE invocar `CERTIFICATIONS_SOURCE.revocar` con motivo sanitizado. Fallo de POST: DEBE mostrar error **inline** en el diálogo vía `mensajeErrorApi` P15-strict (envelope) o genérico es-AR (*«No se pudo revocar la certificación.»*); DEBE NOT reusar el overlay de carga; DEBE NOT `errorRecuperable` ni Reintentar de load por fallo de submit; DEBE NOT raw `Error.message`. Éxito: DEBE navegar al expediente con `?revocada=1` (flash UI diferido; re-fetch de estado basta). `MOTIVO_MAX` DEBE ser **180** (maxlength + validator; paridad backend). DEBE NOT rotar token/QR salvo revocación explícita vía seam.

#### Scenario: Submit inline sin overlay ni raw

- **GIVEN** diálogo cargado y `revocar` falla
- **WHEN** Bedelía confirma
- **THEN** error inline vía `mensajeErrorApi`/fallback; diálogo intacto
- **AND** DEBE NOT overlay de carga, `errorRecuperable`, Reintentar de load ni raw

#### Scenario: Éxito navega expediente

- **GIVEN** revocación OK
- **WHEN** termina el POST
- **THEN** navega a `…/:id` con `?revocada=1` sin exigir flash UI en este ciclo

#### Scenario: Motivo acotado a 180

- **GIVEN** formulario de motivo visible
- **WHEN** se valida maxlength / validator
- **THEN** `MOTIVO_MAX` DEBE ser 180

### Requirement: Diálogo revocar — confirmación, copy y sanitize

El diálogo DEBE exigir confirmación explícita (checkbox) antes de habilitar revocar; DEBE mostrar copy de consecuencias (estado público / QR revocado; ayuda motivo; aviso auditoría). Motivo obligatorio (mínimo vigente) DEBE sanitizarse en cliente (DNI/token UUID/email → placeholders) antes del POST. Deep-link no vigente DEBE bloquear el form. Escape DEBE volver al expediente. DEBE NOT reescribir copy de consecuencias salvo typo. DEBE NOT tocar delivery P20, validación pública P22 ni backend `admin-certificate-revocation` en este ciclo.

#### Scenario: Confirmación y consecuencias

- **GIVEN** diálogo con certificación vigente cargada
- **WHEN** se inspecciona UI
- **THEN** checkbox de confirmación + banner de consecuencias visibles
- **AND** sin confirmar, DEBE NOT permitir revocar

#### Scenario: Sanitize motivo antes del POST

- **GIVEN** motivo con DNI/token/email
- **WHEN** Bedelía confirma revocar
- **THEN** el body DEBE usar motivo sanitizado (placeholders)
- **AND** DEBE NOT enviar DNI/token completos en el motivo

#### Scenario: No vigente bloquea form

- **GIVEN** certificación no vigente / ya revocada
- **WHEN** abre `/revocar`
- **THEN** DEBE bloquear el formulario de revocación
