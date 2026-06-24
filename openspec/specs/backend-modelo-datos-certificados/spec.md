# Spec — modelo de datos para certificados QR

## Purpose

Definir el modelo MariaDB 10.6 para la verificación futura de certificados QR, con migraciones controladas, seeds ficticios y sin implementar PHP ni Angular.

## Requirements

### Requirement: Esquema controlado con prefijo `cert_`

El sistema MUST definir tablas nuevas con prefijo `cert_` para certificados, tokens de verificación y auditoría segura.

#### Scenario: Migración versionable

- **Given** el ciclo archivado
- **When** se inspecciona `database/migrations/001_certificados_qr.sql`
- **Then** MUST crear `cert_certificados`, `cert_tokens_verificacion` y `cert_eventos_auditoria`.
- **And** MUST ser compatible con MariaDB 10.6.

### Requirement: Token QR sin texto plano

El sistema MUST almacenar tokens públicos como hash no reversible y MUST NOT guardar el token completo en texto plano.

#### Scenario: Token verificable por hash

- **Given** un token público futuro
- **When** el backend lo consulte
- **Then** MUST calcular hash con pepper externo a Git y comparar contra `cert_tokens_verificacion.token_hash`.
- **And** MAY conservar solo `token_prefijo` para soporte seguro.

### Requirement: Exposición pública mínima

El modelo MUST sostener el DTO público del contrato de API sin requerir DNI completo ni token completo.

#### Scenario: Certificado vigente

- **Given** un certificado `vigente` con token `activo`
- **When** se resuelva una verificación pública
- **Then** la respuesta futura SHOULD usar código, estado, curso, fecha y `documento_enmascarado`.
- **And** MUST NOT exponer `documento_hash`, `token_hash` ni datos internos.

### Requirement: Auditoría sin datos sensibles

El sistema MUST registrar eventos de emisión, verificación, revocación, reenvío o error sin DNI completo, token completo, SQL ni credenciales.

#### Scenario: Verificación fallida

- **Given** una verificación pública rechazada
- **When** se registre auditoría
- **Then** MUST guardar tipo, resultado, `request_id` y huellas truncadas no reversibles si aplican.
- **And** MUST NOT guardar valores sensibles completos.

### Requirement: Fixtures ficticios solamente

Los seeds versionables MAY existir solo con datos ficticios explícitos.

#### Scenario: Seed demo seguro

- **Given** `database/seeds/001_certificados_qr_demo.sql`
- **When** se inspecciona su contenido
- **Then** MUST contener datos demo no reales.
- **And** MUST declarar que no se usa en producción.

### Requirement: Sin implementación de producto

Este ciclo MUST NOT crear código PHP, Angular, dependencias, commits, pushes ni merges.

#### Scenario: Cierre documental y SQL controlado

- **Given** el ciclo completado
- **When** se inspeccionan rutas de producto
- **Then** MUST existir solo documentación, OpenSpec y SQL bajo `database/migrations/` o `database/seeds/`.
