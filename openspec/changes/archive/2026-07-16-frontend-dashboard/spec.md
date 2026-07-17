# Spec: admin-dashboard-workbench

## ADDED Requirements

### Requirement: REQ-DASH-01 — Encabezado de mesa de trabajo

El dashboard DEBE presentarse como mesa de trabajo con título “Panel de certificaciones” y subtítulo que mencione cursos, asistencias y certificados con QR. NO DEBE usar el copy de “Vista placeholder” ni la grilla de 4 cards de módulos.

#### Scenario: Encabezado visible

- **Given** una sesión admin activa
- **When** se abre `/admin/dashboard`
- **Then** DEBE mostrarse el título “Panel de certificaciones”
- **And** DEBE existir subtítulo descriptivo del alcance operativo
- **And** NO DEBE renderizarse la lista `.cards` de Cursos/Asistencias/Alumnos/Certificaciones del placeholder previo

---

### Requirement: REQ-DASH-02 — Acciones principales

El sistema DEBE mostrar cinco acciones principales con más peso visual que el resumen. Cuatro DEBEN navegar por `routerLink`; Carga masiva DEBE quedar deshabilitada con explicación accesible.

#### Scenario: Nueva certificación primaria

- **Given** el dashboard cargado
- **When** se inspecciona la sección Acciones
- **Then** DEBE existir un enlace “Nueva certificación” hacia `/admin/certificaciones/nueva`
- **And** esa acción DEBE distinguirse visualmente como primaria

#### Scenario: Nuevo curso

- **Given** el dashboard cargado
- **When** se activa “Nuevo curso”
- **Then** DEBE navegar a `/admin/cursos/nuevo`

#### Scenario: Alumnos

- **Given** el dashboard cargado
- **When** se activa “Alumnos”
- **Then** DEBE navegar a `/admin/alumnos`

#### Scenario: Configuración

- **Given** el dashboard cargado
- **When** se activa “Configuración”
- **Then** DEBE navegar a `/admin/configuracion`

#### Scenario: Carga masiva deshabilitada

- **Given** el dashboard cargado
- **When** se inspecciona “Carga masiva”
- **Then** el control DEBE estar deshabilitado (`disabled` o `aria-disabled="true"`)
- **And** DEBE exponer tooltip o texto accesible que indique que la importación aún no está disponible
- **And** NO DEBE navegar ni simular importación

---

### Requirement: REQ-DASH-03 — Resumen operativo derivado

El resumen operativo DEBE mostrar cuatro métricas: cursos cargados, alumnos registrados, certificaciones emitidas y certificaciones revocadas. Los valores DEBEN derivarse de seams existentes (`COURSES_SOURCE.listar`, `STUDENTS_SOURCE.contar`, `CERTIFICATIONS_SOURCE.listar` o equivalente). NO DEBE inventar endpoints de métricas.

#### Scenario: Hidratación exitosa

- **Given** seams que resuelven listados/conteos
- **When** carga el dashboard
- **Then** cada métrica DEBE mostrar un número tabular derivado de los datos del seam
- **And** “emitidas” DEBE contar certificaciones con estado distinto de `borrador` y `revocado` (p. ej. `vigente` y `vencido`)
- **And** “revocadas” DEBE contar certificaciones con estado `revocado`

#### Scenario: Fallo parcial o total de seams

- **Given** uno o más seams rechazan la promesa
- **When** carga el dashboard
- **Then** las métricas afectadas DEBEN mostrar “—” (no un cero engañoso ni un número inventado)
- **And** DEBE existir un indicador de error accesible (texto o `role="status"`) que informe que no se pudieron cargar las métricas

---

### Requirement: REQ-DASH-04 — Bandeja de pendientes honesta

La bandeja DEBE conservar la estructura visual de “Pendientes de resolución” con filas tipificadas (p. ej. cursos sin fechas, alumnos sin email, entrega pendiente, re-entrega). Mientras no exista API de pendientes, DEBE usar placeholders honestos.

#### Scenario: Placeholders sin fingir datos

- **Given** ausencia de endpoint de pendientes
- **When** se muestra la bandeja
- **Then** cada fila DEBE indicar claramente que el conteo no está disponible (p. ej. “—” o “Sin dato”)
- **And** NO DEBE mostrar enteros inventados (3, 12, 5, 2 del mock v0) como si fueran reales
- **And** el encabezado NO DEBE afirmar un total de “N tareas” inventado

---

### Requirement: REQ-DASH-05 — Actividad reciente honesta

La sección Actividad reciente DEBE existir en el layout. Sin feed global de auditoría, DEBE mostrar estado vacío u honesto sin PII.

#### Scenario: Sin eventos inventados

- **Given** ausencia de API de actividad global
- **When** se muestra Actividad reciente
- **Then** DEBE mostrarse un mensaje de vacío/placeholder (p. ej. “Sin registro de actividad disponible”)
- **And** NO DEBE renderizar filas con nombres de personas, emails, DNI ni IDs de evento ficticios del seed v0
- **And** el enlace “Ver registro completo” DEBE estar ausente o deshabilitado sin destino inventado

---

### Requirement: REQ-DASH-06 — Accesibilidad y arquitectura UI

La página DEBE usar Angular standalone, `ChangeDetectionStrategy.OnPush` y signals. DEBE exponer landmarks/etiquetas accesibles en secciones.

#### Scenario: Landmarks y foco

- **Given** el dashboard renderizado
- **When** se inspecciona el DOM
- **Then** las secciones Acciones, Pendientes, Actividad y Resumen DEBEN tener `aria-labelledby` o `aria-label`
- **And** los enlaces accionables DEBEN ser enfocables; Carga masiva deshabilitada NO DEBE engañar al lector de pantalla

#### Scenario: OnPush y signals

- **Given** el componente de página
- **When** se revisa su definición
- **Then** DEBE declarar `changeDetection: OnPush`
- **And** los conteos del resumen DEBEN vivir en signals (o computed derivados)

## MODIFIED Requirements

### Requirement: admin-foundation — Dashboard navegable (delta)

El dashboard DEBE dejar de ser un grid de cuatro cards con conteos ficticios. DEBE cumplir `admin-dashboard-workbench`. Los módulos Cursos/Asistencias/Certificaciones/Alumnos siguen alcanzables por sidebar y por acciones/resumen donde corresponda.

#### Scenario: Sin placeholder de cuatro cards

- **Given** `/admin/dashboard`
- **When** se carga la vista
- **Then** NO DEBE existir el copy “Vista placeholder sin datos reales” ni las cuatro cards “Abrir Cursos/Asistencias/Alumnos/Certificaciones” del diseño F2-03/F2-06
