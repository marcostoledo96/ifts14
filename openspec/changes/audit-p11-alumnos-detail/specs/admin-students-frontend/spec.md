# Delta for admin-students-frontend

## MODIFIED Requirements

### Requirement: Detalle administrativo consistente

El detalle `/admin/alumnos/:id` DEBE mostrar Apellido y Nombre, DNI completo en `dniMostrar` y el año de ingreso (celda vacía si `ingreso` vacío). DEBE mostrar el email registrado o indicador honesto si no hay. Copy visible (kicker, títulos, errores) DEBE omitir «legajo»/«Legajo»/«legajos»; PUEDE usar ficha, registro, perfil o `#id`. NO DEBE mostrar legajo inventado, matrícula, UUID ni token. Métricas `cursosConAsistencia`, `certificacionesValidas` y `certificacionesRevocadas` DEBEN mostrar el número (incluido `0`) cuando hay valor; «—» SOLO si null/ausente. DEBE listar cursos con asistencia de forma consistente (nombre, código, fechas abreviadas, estado cert: Emitida→expediente, Pendiente→emitir, En curso). Mensajes/errores/logs NO DEBEN incluir DNI ni token completos. Fallo recuperable de `obtener` DEBE ofrecer Reintentar y «Volver a Alumnos». Id inválido o alumno no encontrado DEBE ofrecer solo «Volver a Alumnos» (sin Reintentar).
(Previously: ficha/cursos/id inválido sin exigir copy sin legajo, métricas 0 vs «—» en revocadas ni Reintentar solo recuperable.)

#### Scenario: Ficha de alumno admin

- GIVEN el detalle `/admin/alumnos/:id` de un alumno del seed
- WHEN renderiza la ficha
- THEN DEBE mostrar nombre, ingreso, DNI completo y email `@example.invalid` si corresponde
- AND NO DEBE contener «legajo», «Legajo» ni «legajos» ni mostrar matrícula/UUID/token

#### Scenario: Cursos y certificaciones consistentes

- GIVEN el alumno tiene cursos asociados
- WHEN se renderiza la trayectoria (desktop o mobile)
- THEN DEBE mostrar tabla o cards con fechas abreviadas y estados/enlaces honestos («Ver certificación» / emitir / en curso)

#### Scenario: Métricas cero vs ausente

- GIVEN `certificacionesRevocadas` (u otra métrica del detalle) en `0` y en null
- WHEN renderiza el panel de métricas
- THEN DEBE mostrar `0` para el cero y «—» para null

#### Scenario: Fallo recuperable con Reintentar

- GIVEN id numérico válido y fallo recuperable de `obtener`
- WHEN se presenta el error
- THEN DEBE mostrar Reintentar y Volver a Alumnos sin DNI/token en el mensaje
- AND WHEN el operador elige Reintentar
- THEN DEBE volver a solicitar el alumno

#### Scenario: ID inválido o no encontrado sin Reintentar

- GIVEN `/admin/alumnos/999` o un id no numérico
- WHEN carga la página
- THEN DEBE mostrar estado seguro con Volver a Alumnos, sin Reintentar y sin romper la shell admin
