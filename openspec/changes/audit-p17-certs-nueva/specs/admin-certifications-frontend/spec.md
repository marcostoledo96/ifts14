# Delta for admin-certifications-frontend

## MODIFIED Requirements

### Requirement: Emisión directa de certificación (pantalla nueva)

El sistema DEBE exponer la ruta estática `/admin/certificaciones/nueva` **antes** de `/admin/certificaciones/:id`, con una pantalla única de emisión (no wizard) que orquesta seams existentes. El body de emisión DEBE ser exactamente `{ alumnoId, cursoId, issuedAt, expiresAt }`. Tras HTTP 201, DEBE navegar al expediente `/admin/certificaciones/:id`. NO DEBE inventar logos, firmas archivo ni folio definitivo antes del POST. NO DEBE eliminar la ruta ni deprecar CTAs existentes. El copy DEBE posicionar esta pantalla como emisión puntual (alumno+curso) frente al flujo habitual Asistencias (marcar en una fecha y generar desde ahí); NO DEBE usar «complementario». Fallo recuperable al cargar catálogos o elegibilidad del par: DEBE usar `errorRecuperable` y ofrecer Reintentar con mensaje controlado es-AR, SIN raw `Error.message`. Fallo de emit no mapeado (else): DEBE usar `mensajeErrorApi` o genérico es-AR, SIN Reintentar de load y SIN raw `Error.message`. Si se muestra DNI, DEBE ser completo. NO DEBE mostrar token completo ni incluir DNI/token en mensajes/logs. NO DEBE exigir cambios HTTP/backend ni rotación de token/QR.
(Previously: ruta + body + navigate + anti-folio; sin honesty loads/emit else, sin Reintentar en par, sin copy de rol edge vs Asistencias.)

#### Scenario: Ruta estática precede a :id

- **GIVEN** sesión admin activa
- **WHEN** se navega a `/admin/certificaciones/nueva`
- **THEN** DEBE cargar la pantalla de emisión y NO el detalle con id literal `"nueva"`.

#### Scenario: Emitir con éxito

- **GIVEN** un par alumno/curso con presentes elegibles sobre fechas `realizada`
- **WHEN** Bedelía confirma Emitir
- **THEN** DEBE enviarse `POST /admin/certificados` con el body de cuatro campos
- **AND** DEBE navegar al detalle del `data.id` recibido.

#### Scenario: Copy de rol edge vs Asistencias

- **GIVEN** sesión admin en `/admin/certificaciones/nueva`
- **WHEN** se lee el subtítulo (y nota CTA si existe)
- **THEN** DEBE indicar emisión puntual alumno+curso y que el flujo habitual es marcar asistencias en una fecha y generar desde ahí
- **AND** NO DEBE usar la palabra «complementario».

#### Scenario: Fallo recuperable de catálogos con Reintentar

- **GIVEN** fallo recuperable al cargar cursos, alumnos o config institucional
- **WHEN** se presenta el error
- **THEN** DEBE marcar `errorRecuperable` y ofrecer Reintentar con mensaje controlado
- **AND** NO DEBE pegar raw `Error.message` ni DNI/token
- **AND WHEN** se elige Reintentar
- **THEN** DEBE volver a cargar los catálogos.

#### Scenario: Fallo recuperable de par con Reintentar

- **GIVEN** fallo recuperable al evaluar elegibilidad del par (fechas/asistencias/vigente)
- **WHEN** se presenta el error de par
- **THEN** DEBE marcar `errorRecuperable` y ofrecer Reintentar con mensaje controlado
- **AND** NO DEBE pegar raw `Error.message` ni DNI/token
- **AND WHEN** se elige Reintentar
- **THEN** DEBE volver a evaluar el par.

#### Scenario: Emit else sin Reintentar ni raw Error.message

- **GIVEN** falla Emitir fuera de los status ya mapeados (409/400/500)
- **WHEN** se captura el error
- **THEN** DEBE mostrar mensaje vía `mensajeErrorApi` o genérico es-AR
- **AND** NO DEBE ofrecer Reintentar de load ni pegar raw `Error.message`
- **AND** el mensaje NO DEBE incluir DNI ni token.

#### Scenario: DNI completo y anti-token

- **GIVEN** la UI muestra documento del alumno (chip o preview)
- **WHEN** se renderiza la pantalla
- **THEN** el DNI DEBE verse completo
- **AND** NO DEBE aparecer token completo en la UI ni en mensajes/logs.
