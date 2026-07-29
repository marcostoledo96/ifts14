# Delta for admin-attendances-frontend

## MODIFIED Requirements

### Requirement: Página de certificados del curso (por fecha)

El sistema DEBE exponer `/admin/cursos/:id/fechas/:fechaId/asistencias/certificados` con listado filtrado por `cursoId` (NO por `fechaId`), botón «Volver a asistencias», empty con CTA a marcar asistencias, y consumo del `state` de navegación post-marcado (mensaje/resumen) sin alterar su contrato. Por fila DEBE ofrecer, en este orden: Copiar link, Descargar QR (`descargarQrPng`), Descargar PDF; y además un enlace «Expediente» a `/admin/certificaciones/:id`. Entrega = Copiar link + QR inline (SIN navegar a `/entrega`). Fallo recuperable de carga: DEBE usar `errorRecuperable` y ofrecer Reintentar con mensaje controlado. Id de curso inválido o not-found: error controlado SIN Reintentar. Fallo de acciones (Copiar, QR, PDF): DEBE usar `mensajeErrorApi` o mensaje genérico de acción, SIN Reintentar de página y SIN pegar raw `Error.message`. Si se muestra DNI, DEBE ser completo. NO DEBE mostrar token completo ni incluir DNI/token en mensajes/logs. NO DEBE exigir cambios HTTP/backend ni rotación de token/QR.
(Previously: solo listado/acciones Copiar→QR→PDF y anti-token; sin honesty de carga, sin Expediente, sin errores de acción seguros.)

#### Scenario: Entrega desde página dedicada

- **GIVEN** hay certificados del curso
- **WHEN** Bedelía abre la página de certificados de la fecha
- **THEN** DEBE ver la lista completa filtrada por `cursoId`
- **AND** por fila DEBE ver Copiar link, Descargar QR y Descargar PDF en ese orden
- **AND** Descargar QR DEBE obtener la imagen PNG del QR de validación oficial.

#### Scenario: Link Expediente por fila

- **GIVEN** hay al menos un certificado en la lista
- **WHEN** se observa la fila
- **THEN** DEBE haber un enlace «Expediente» a `/admin/certificaciones/:id` de esa certificación
- **AND** NO DEBE sustituir las acciones Copiar/QR/PDF.

#### Scenario: Vacío con CTA a asistencias

- **GIVEN** el curso no tiene certificados
- **WHEN** se abre la página
- **THEN** DEBE mostrar empty controlado con CTA hacia marcar asistencias
- **AND** NO DEBE listar filas ni acciones de entrega.

#### Scenario: Fallo recuperable de carga con Reintentar

- **GIVEN** `:id` válido y fallo recuperable al cargar curso/certificados
- **WHEN** se presenta el error
- **THEN** DEBE ofrecer Reintentar con mensaje controlado sin DNI/token ni raw `Error.message`
- **AND WHEN** se elige Reintentar
- **THEN** DEBE volver a cargar curso y listado por `cursoId`.

#### Scenario: Id inválido o not-found sin Reintentar

- **GIVEN** `:id` inválido o curso not-found
- **WHEN** se abre la página
- **THEN** DEBE mostrar error controlado SIN Reintentar ni DNI/token.

#### Scenario: Error de acción sin Reintentar

- **GIVEN** falla Copiar link, Descargar QR o Descargar PDF
- **WHEN** se captura el error
- **THEN** DEBE mostrar mensaje vía `mensajeErrorApi` o genérico de acción
- **AND** NO DEBE ofrecer Reintentar de página ni pegar raw `Error.message`
- **AND** el mensaje NO DEBE incluir DNI ni token.

#### Scenario: DNI completo y anti-token

- **GIVEN** la fila muestra documento del alumno
- **WHEN** se renderiza la lista
- **THEN** el DNI DEBE verse completo (ficticio D0)
- **AND** NO DEBE aparecer el token completo en la UI.
