# Delta for admin-certificate-consulta

## MODIFIED Requirements

### Requirement: Configuración institucional administrable

La API DEBE permitir leer y actualizar la fila única de configuración institucional con DTO camelCase seguro, más el mapa tipado `parameters` (`cert_parametros_sistema`). El `GET` DEBE incluir flags booleanos `rectorSignaturePresent` y `advisorSignaturePresent` (o nombres equivalentes documentados) según existencia de archivo/metadatos de firma por rol. El `PUT` DEBE aceptar solo textos/`parameters` en JSON; NO DEBE aceptar multipart de firmas.
(Previously: GET/PUT de textos y parameters sin flags de presencia de firmas.)

#### Scenario: Lectura con fallback

- DADO ausencia de fila en `cert_configuracion_institucional`
- CUANDO se consulta `GET /admin/configuracion-institucional`
- ENTONCES la API DEBE responder `200` con fallback seguro documentado
- Y DEBE incluir `parameters` con las 9 claves del catálogo activo
- Y DEBE incluir flags de firma en `false` cuando no hay archivos

#### Scenario: Lectura con firmas presentes

- DADO fila institucional con firma de rector y/o asesor persistida
- CUANDO se consulta el GET
- ENTONCES cada flag correspondiente DEBE ser `true`
- Y la respuesta NO DEBE incluir path de storage ni bytes de imagen

#### Scenario: Actualización válida

- DADO un body con `institutionName` no vacío
- CUANDO se ejecuta `PUT /admin/configuracion-institucional`
- ENTONCES la API DEBE persistir textos/`parameters` y responder `200` con `updatedAt`
- Y NO DEBE modificar archivos de firma

#### Scenario: Actualización de parámetros tipados

- DADO un body con `parameters` solo con claves seed conocidas
- CUANDO se ejecuta `PUT /admin/configuracion-institucional`
- ENTONCES la API DEBE upsert en `cert_parametros_sistema` y devolver los valores en `data.parameters`

#### Scenario: Parámetro desconocido o email inválido

- DADO `parameters` con clave no catalogada o `email_contacto` mal formado
- CUANDO se intenta actualizar
- ENTONCES la API DEBE responder `400 VALIDATION_ERROR` sin persistir esos cambios

#### Scenario: Nombre institucional ausente

- DADO un body sin `institutionName` válido
- CUANDO se intenta actualizar
- ENTONCES la API DEBE responder `400 VALIDATION_ERROR` sin persistir

## ADDED Requirements

### Requirement: Rutas admin de firmas institucionales

La API admin DEBE registrar `POST|DELETE|GET /admin/configuracion-institucional/firmas/{rol}` autorizadas según `admin-auth`, con el comportamiento de validación, storage y preview definido en `admin-institutional-signatures`.

#### Scenario: Rutas firmas bajo auth admin

- DADO sesión admin válida
- CUANDO se invoca POST, DELETE o GET de firmas con rol válido
- ENTONCES la API DEBE enrutar al handler de firmas (no al PUT de textos)

#### Scenario: Firmas sin auth

- DADO request sin autorización válida
- CUANDO se invoca cualquier ruta de firmas
- ENTONCES DEBE responder `401`/`403` sin side effects
