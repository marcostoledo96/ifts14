# Spec: admin-institutional-signatures

## Purpose

Habilitar firmas manuscritas (imagen) de Rector/a y Asesor/a Pedagógica en configuración institucional: upload/DELETE/GET preview inmediato por rol, storage seguro y UI admin con paridad visual.

## Requirements

### Requirement: Persistencia inmediata por rol (Opción A)

El sistema DEBE exponer `POST`, `DELETE` y `GET` en `/admin/configuracion-institucional/firmas/{rol}` con `rol` ∈ {`rector`,`asesor`}, autorizados según `admin-auth`. Upload y DELETE DEBEN persistir de inmediato e independientes del `PUT` de textos. GET DEBE servir preview solo a admin autenticado; NO DEBE existir URL pública adivinable.

#### Scenario: Upload exitoso independiente de Guardar textos

- DADO sesión admin válida y archivo PNG/JPEG válido ≤ 1 MB y ≤ ~1200×400 px
- CUANDO se ejecuta `POST .../firmas/rector` (o `asesor`)
- ENTONCES la API DEBE persistir la firma y responder éxito
- Y NO DEBE exigir ni alterar el `PUT` de textos

#### Scenario: DELETE exitoso

- DADO una firma presente para el rol
- CUANDO se ejecuta `DELETE .../firmas/{rol}` autorizado
- ENTONCES la API DEBE eliminar archivo y metadatos del rol
- Y el GET config DEBE reflejar ausencia (`*SignaturePresent` = false)

#### Scenario: Rol inválido

- DADO un `{rol}` fuera de `rector`|`asesor`
- CUANDO se invoca POST, DELETE o GET
- ENTONCES la API DEBE responder `400 VALIDATION_ERROR`

#### Scenario: Preview autenticado

- DADO firma presente y sesión admin válida
- CUANDO se ejecuta `GET .../firmas/{rol}`
- ENTONCES DEBE responder `200` con bytes de imagen, `Content-Type` real (PNG/JPEG), `X-Content-Type-Options: nosniff` y `Cache-Control: no-store`

#### Scenario: Preview sin autorización

- DADO request sin auth admin válida
- CUANDO se invoca GET/POST/DELETE de firmas
- ENTONCES DEBE responder `401`/`403` sin exponer bytes ni rutas internas

### Requirement: Validación de imagen

El sistema DEBE aceptar solo PNG y JPEG (sniff MIME real). NO DEBE aceptar SVG ni otros tipos. El tamaño DEBE ser ≤ 1 MB. Las dimensiones DEBERÍAN rechazarse si exceden ~1200×400 px. Errores DEBEN ser claros y seguros (sin paths).

#### Scenario: Rechazo por tipo

- DADO un archivo SVG u otro MIME no whitelisted
- CUANDO se intenta POST
- ENTONCES DEBE responder `400 VALIDATION_ERROR` sin persistir

#### Scenario: Rechazo por tamaño

- DADO un PNG/JPEG > 1 MB
- CUANDO se intenta POST
- ENTONCES DEBE responder `400 VALIDATION_ERROR` sin persistir

#### Scenario: Rechazo por dimensiones

- DADO PNG/JPEG ≤ 1 MB pero dimensiones > ~1200×400
- CUANDO se intenta POST
- ENTONCES DEBE rechazar con error de validación claro

### Requirement: Storage seguro y replace atómico

Las firmas DEBEN guardarse bajo `signature_storage_path` fuera del webroot (o equivalente protegido). La DB DEBE guardar solo filename/hash (sin path libre). El sistema DEBE resolver solo basenames seguros; NO DEBE permitir path traversal. El replace DEBE ser atómico: el archivo viejo DEBE borrarse solo tras éxito del nuevo.

#### Scenario: Storage no público

- DADO `signature_storage_path` fuera de webroot
- CUANDO se persiste una firma
- ENTONCES el archivo NO DEBE ser accesible por URL pública directa

#### Scenario: Path traversal bloqueado

- DADO un nombre o path con `..` o separadores
- CUANDO se intenta resolver/servir/borrar
- ENTONCES el sistema DEBE rechazar o normalizar a basename seguro sin salir del directorio

#### Scenario: Replace atómico

- DADO firma previa del rol y un upload nuevo válido
- CUANDO el POST completa con éxito
- ENTONCES el nuevo archivo DEBE quedar activo y el viejo eliminado
- Y si el POST falla a mitad, la firma previa DEBE permanecer intacta

### Requirement: UI Autoridades con upload real

La pantalla `/admin/configuracion` (sección Autoridades) DEBE ofrecer input file real por rol, preview y quitar firma, con paridad visual igual o mejor que `muestra_pagina`. Upload/DELETE DEBEN invocarse al instante; Guardar textos NO DEBE multipart de firmas.

#### Scenario: Subir desde UI sin Guardar textos

- DADO admin en configuración con sesión válida
- CUANDO selecciona imagen válida para un rol
- ENTONCES la UI DEBE llamar POST de firmas y actualizar preview/flags
- Y NO DEBE depender del botón Guardar textos

#### Scenario: Quitar firma desde UI

- DADO firma presente mostrada en UI
- CUANDO el admin confirma quitar
- ENTONCES la UI DEBE llamar DELETE y ocultar preview
