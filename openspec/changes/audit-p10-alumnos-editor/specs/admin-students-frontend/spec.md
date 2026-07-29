# Delta for admin-students-frontend

## ADDED Requirements

### Requirement: Editor administrativo create y edit

Las rutas `/admin/alumnos/nuevo` y `/admin/alumnos/:id/editar` DEBEN compartir el editor con modos create y edit. Create DEBE admitir lote multi-fila, validar apellido/nombre/DNI (email opcional) y, al guardar, mostrar resumen sin navegar. Edit DEBE cargar vía `obtener`, guardar con actualización y navegar a `/admin/alumnos/:id`. UI DEBE mostrar DNI completo; mensajes/errores/logs NO DEBEN incluir DNI ni token completos.
(Previously: solo «Alta con email opcional» y escenario de duplicado bajo búsqueda.)

#### Scenario: Create con lote y resumen

- GIVEN modo create con una o más filas válidas
- WHEN guarda el lote
- THEN DEBE persistir altas y mostrar resumen sin navegar al detalle

#### Scenario: Edit carga y guarda

- GIVEN modo edit con id válido
- WHEN carga y guarda cambios válidos
- THEN DEBE rellenar el formulario y, al éxito, navegar a `/admin/alumnos/:id`

#### Scenario: Edit no encontrado

- GIVEN id inválido o alumno inexistente
- WHEN carga el editor
- THEN DEBE mostrar estado no encontrado seguro con enlace a Alumnos

#### Scenario: Validación inline

- GIVEN fila con apellido/nombre vacíos, DNI inválido o email mal formado
- WHEN valida
- THEN DEBE marcar errores accesibles y NO DEBE enviar el draft

### Requirement: Copy del editor sin legajo inventado

Ayuda, labels e intro del editor DEBEN omitir «legajo»/«legajos»; PUEDE usar ficha, registro o perfil.

#### Scenario: Ayuda de email sin legajo

- GIVEN el formulario de alta o edición
- WHEN se lee la ayuda del email
- THEN NO DEBE contener «legajo» ni «legajos»

### Requirement: Error de carga recuperable en editor

Error recuperable al cargar en edit DEBE ofrecer **Reintentar** y «Volver a Alumnos» (patrón P8).

#### Scenario: Reintentar tras fallo de carga

- GIVEN modo edit y fallo recuperable de `obtener`
- WHEN se presenta el error
- THEN DEBE mostrar Reintentar y Volver a Alumnos
- AND WHEN el operador elige Reintentar
- THEN DEBE volver a solicitar el alumno

### Requirement: Conflicto 409 sin PII en editor

Create y edit DEBEN mapear DNI duplicado a conflicto (`StudentDuplicateError` o equivalente). Mensaje DEBE ser genérico sin DNI/token. SI hay id existente, DEBE ofrecer enlace a `/admin/alumnos/{id}`.

#### Scenario: 409 en create con enlace

- GIVEN DNI ya registrado y respuesta con id existente
- WHEN se intenta crear
- THEN DEBE rechazar sin PII y enlazar a `/admin/alumnos/{id}`

#### Scenario: 409 en edit con enlace

- GIVEN edición que colisiona con otro alumno y hay id
- WHEN falla la actualización
- THEN DEBE mostrar conflicto sin PII y enlace al perfil existente

## MODIFIED Requirements

### Requirement: Búsqueda y filtros

Búsqueda DEBE ser por nombre y `dniMostrar`. NO DEBE filtrar por legajo. Chips: certificaciones (con/sin) y «Sin email». NO DEBE haber chip «Con email». Filtros null-safe; 20/página. El conflicto de DNI duplicado en alta/edición DEBE regirse por «Conflicto 409 sin PII en editor», no por este requisito.
(Previously: incluía escenario «Alta con DNI duplicado» bajo búsqueda.)

#### Scenario: Búsqueda y filtro de contacto

- GIVEN alumnos con y sin email
- WHEN busca por nombre/DNI y aplica «Sin email»
- THEN DEBE filtrar sin legajo ni chip «Con email»

#### Scenario: Entrada de búsqueda prohibida

- GIVEN texto tipo legajo
- WHEN se evalúa
- THEN NO DEBE coincidir por campos ausentes del DTO

#### Scenario: Filtros y paginación

- GIVEN más de veinte resultados
- WHEN cambian filtros/página
- THEN DEBE mostrar ≤20 por página y acotar ante cambios

#### Scenario: Vistas accesibles

- GIVEN desktop o mobile
- WHEN renderiza
- THEN DEBE usar tabla o cards con resumen accesible
