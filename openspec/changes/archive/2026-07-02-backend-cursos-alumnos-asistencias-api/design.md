# Diseño: API admin mínima para cursos, alumnos, fechas y asistencias

## Enfoque técnico

Agregar rutas en `apps/backend-php/index.php` y un único `apps/backend-php/src/AdminMasterDataService.php`. Se reutilizan `X-Admin-Key`, `requireJsonContentType()`, `readJsonBody()`, `respondToAdmin()`, `Response`, `Database::pdo()`, `DniCipher` y `AdminCertificateException`. No hay frontend, SMTP, reenvío automático ni migraciones nuevas.

## Decisiones de arquitectura

| Decisión | Opción | Alternativa | Fundamento |
|---|---|---|---|
| Servicio único | `AdminMasterDataService` con métodos pequeños | Servicio/controlador por entidad | Menos archivos y encaja con el router actual; separar cuando el CRUD crezca. |
| Rutas | Extender `index.php` | Router nuevo | El front controller ya centraliza auth, envelopes y prefijos `/certificados/api`. |
| DNI admin | Cifrar y responder máscara | Devolver DNI completo | D0 permite DNI completo solo en validación pública/PDF; admin no lo expone. |
| Asistencias | `DELETE` lógico vía `eliminado_en` | `DELETE` físico | La migración `003` modela historial y unique de activos con `asistencia_activa`. |

## Mapa de rutas

Todas requieren `X-Admin-Key`; `POST`/`PATCH` exigen JSON.

| Método | Ruta | Servicio |
|---|---|---|
| `POST` | `/admin/cursos` | `createCourse()` |
| `GET` | `/admin/cursos` | `listCourses()` |
| `GET` | `/admin/cursos/{id}` | `getCourse()` |
| `PATCH` | `/admin/cursos/{id}/estado` | `updateCourseStatus()` |
| `POST` | `/admin/alumnos` | `createStudent()` |
| `GET` | `/admin/alumnos` | `listStudents()` |
| `GET` | `/admin/alumnos/{id}` | `getStudent()` |
| `PATCH` | `/admin/alumnos/{id}/estado` | `updateStudentStatus()` |
| `POST` | `/admin/cursos/{cursoId}/fechas` | `createCourseDate()` |
| `GET` | `/admin/cursos/{cursoId}/fechas` | `listCourseDates()` |
| `PATCH` | `/admin/cursos/{cursoId}/fechas/{fechaId}` | `updateCourseDate()` |
| `POST` | `/admin/asistencias` | `recordAttendance()` |
| `GET` | `/admin/asistencias?cursoId=&alumnoId=` | `listAttendances()` |
| `DELETE` | `/admin/asistencias/{id}` | `voidAttendance()` lógico |

## Flujo de datos

```txt
Request admin -> index.php -> auth/content-type/body -> AdminMasterDataService
  -> validación -> PDO prepared statements -> tablas cert_
  -> DTO seguro -> Response::json/error
```

Para alumno: normalizar DNI a dígitos, validar longitud razonable, cargar `dni_cipher_key` antes de abrir transacción, calcular `dni_hash`, cifrar con `DniCipher::encrypt()`, recién entonces persistir. Si falta o falla la clave: `500 CONFIGURATION_ERROR`, sin INSERT.

## Contratos y validaciones

Estados válidos desde `003`: alumno `activo|inactivo`; curso `borrador|activo|cerrado|archivado`; fecha `programada|realizada|cancelada`. Asistencia solo acepta alumno `activo`, curso `activo` y fecha `programada|realizada` del curso. IDs: enteros positivos. Fechas: `YYYY-MM-DD` real. Código de curso y orden deben respetar uniques DB; conflictos únicos se mapean a `409 CONFLICT` cuando expresan duplicado de negocio.

DTOs admin de alumno devuelven `id`, `apellidoNombre`, `dniMostrar`, `estado`; nunca `dni_cifrado`, `dni_hash` ni DNI completo. Errores usan el sobre existente sin SQL, rutas internas, tokens, claves ni DNI.

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/backend-php/index.php` | Modificar | Registrar rutas y cargar el nuevo servicio. |
| `apps/backend-php/src/AdminMasterDataService.php` | Crear | CRUD mínimo y asistencias con PDO. |
| `apps/backend-php/tests/AdminMasterDataHttpTest.php` | Crear | Smoke HTTP procedural con DB ficticia. |
| `apps/backend-php/tests/HttpEmissionE2eTest.php` | Modificar | Compatibilidad: emitir con datos cargados por API. |
| `docs/backend/01-contrato-api-certificados.md` | Modificar | Documentar rutas, DTOs y errores. |

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Procedural | Validaciones, DNI fail-closed, estados, duplicados | Script PHP con fixtures ficticios. |
| HTTP | Auth, 415/400, envelopes, rutas CRUD | Servidor embebido como `HttpEmissionE2eTest.php`. |
| Compatibilidad | Emisión actual | Crear curso/alumno/fechas/asistencias por API y llamar `POST /admin/certificados`; verificar sin email ni rotación. |

## Migración / despliegue

No se requieren migraciones. Depende de `003` y `004` aplicadas. Rollback: remover rutas, servicio, tests y docs; los datos creados quedan en tablas existentes.

## Preguntas abiertas

Ninguna bloqueante.
