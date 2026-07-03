# Delta for admin-certificate-emission

## ADDED Requirements

### Requirement: Prevención de certificado vigente duplicado

La emisión administrativa DEBE rechazar un segundo certificado con `estado='vigente'` y `revocado_en IS NULL` para el mismo `alumnoId` + `cursoId` con `409 CERTIFICATE_ALREADY_EXISTS`. Un certificado revocado o con `estado='vencido'` NO DEBE bloquear una nueva emisión. Un certificado con `vence_en < CURRENT_DATE` pero `estado='vigente'` DEBE seguir bloqueando hasta una transición explícita de estado o revocación. Certificados legacy sin `alumno_id` o `curso_id` NO DEBEN entrar en el chequeo de duplicado. La respuesta y auditoría del rechazo NO DEBEN exponer DNI completo, token completo, SQL, secretos ni rutas internas.

#### Scenario: Duplicado vigente rechazado

- DADO un certificado vigente existente para un alumno y curso
- CUANDO Bedelía solicita otra emisión para el mismo par
- ENTONCES la API DEBE responder `409 CERTIFICATE_ALREADY_EXISTS`.
- Y NO DEBE crear certificado, token, PDF ni snapshot nuevos.

#### Scenario: Revocación libera nueva emisión

- DADO un certificado del mismo alumno y curso marcado como revocado
- CUANDO Bedelía solicita una nueva emisión para ese par
- ENTONCES la API DEBE permitir la emisión si el resto del payload es válido.

#### Scenario: Estado vencido libera nueva emisión

- DADO un certificado del mismo alumno y curso con `estado='vencido'`
- CUANDO Bedelía solicita una nueva emisión para ese par
- ENTONCES la API DEBE permitir la emisión si el resto del payload es válido.

#### Scenario: Vence_en pasado con estado vigente bloquea

- DADO un certificado del mismo alumno y curso con `vence_en < CURRENT_DATE` y `estado='vigente'`
- CUANDO Bedelía solicita una nueva emisión para ese par
- ENTONCES la API DEBE responder `409 CERTIFICATE_ALREADY_EXISTS`.
- Y NO DEBE crear certificado, token, PDF ni snapshot nuevos.

#### Scenario: Legacy sin alumno o curso no bloquea

- DADO un certificado legacy con `alumno_id` o `curso_id` nulo
- CUANDO Bedelía emite para un alumno y curso actuales
- ENTONCES ese certificado legacy NO DEBE considerarse duplicado.
