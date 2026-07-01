# IFTS14 — Ajuste de documentación y planificación tras decisiones finales

Fecha: 2026-07-01  
Repositorio: `marcostoledo96/ifts14`  
Módulo: Certificados QR IFTS N.° 14  
Ruta productiva futura: `/certificados/`  
Ruta staging confirmada: `/certificados_staging/`

---

## 1. Objetivo de este documento

Este markdown sirve como guía operativa para ajustar toda la documentación, planificación y roadmap del proyecto IFTS14 después de las decisiones confirmadas por Marcos.

Debe usarse como insumo para OpenCode/Gentle-AI en un ciclo SDD documental y luego como mapa de trabajo para las fases técnicas siguientes.

No implementa producto por sí mismo. Primero sincroniza documentación, decisiones, specs, prompts y planificación para evitar contradicciones entre:

- backend PHP;
- base de datos MariaDB;
- frontend Angular;
- diseño v0/Next.js;
- staging cPanel;
- trabajo de Marcos;
- trabajo de Matías.

---

## 2. Decisiones confirmadas por Marcos

Estas decisiones pasan a ser fuente de verdad del proyecto hasta nueva orden.

| Tema | Decisión confirmada |
|---|---|
| QR / token | Permanente. No debe rotarse en reenvíos normales. |
| DNI en validación pública | DNI completo visible públicamente. |
| Tipo de documento | Certificado de curso. Debajo debe mostrar a qué fechas del curso asistió el alumno. |
| Composer en cPanel | Marcos tiene disponibilidad total de cPanel, pero no sabe todavía dónde está Composer o si está disponible por terminal. |
| Email | Se usará una cuenta de prueba. |
| Auth admin | Auth simple protegida por ahora; más adelante login real. |
| Firmantes PDF | Por ahora Rector/a y Asesor/a Pedagógica. |
| Staging | Confirmado bajo `/certificados_staging/`. |

---

## 3. Impacto principal de estas decisiones

### 3.1. QR permanente

La decisión de QR permanente impacta directamente sobre backend, DB, email, PDF y frontend.

Regla nueva:

```txt
Una certificación debe conservar el mismo token/QR durante su ciclo de vida, salvo una revocación explícita o una acción excepcional de regeneración aprobada.
```

Por lo tanto:

- el reenvío por email NO debe rotar automáticamente el token;
- el PDF reenviado debe usar el mismo QR;
- si se corrigen fechas/asistencias, se debe regenerar o reenviar el PDF con el mismo QR;
- revocar sí invalida el token;
- una futura acción “regenerar QR” debe ser excepcional, auditada y separada del reenvío normal.

### 3.2. DNI completo público

La decisión cambia el contrato actual que venía orientado a `documentMasked`.

Nueva regla de producto:

```txt
La pantalla pública de validación debe mostrar el DNI completo del alumno.
```

Esto requiere ajustar documentación y código futuro:

- `documentMasked` deja de ser suficiente para la respuesta pública;
- el backend debe poder devolver `documentNumber` o `documentFull`;
- la base debe definir si guarda DNI completo cifrado, hash + valor cifrado, o snapshot controlado;
- los logs y auditoría siguen sin poder guardar DNI completo;
- mocks de frontend deben usar datos ficticios, nunca DNIs reales;
- el riesgo de privacidad debe quedar documentado y aprobado institucionalmente.

### 3.3. Certificado de curso con fechas asistidas

El documento final no debe ser una constancia genérica.

Debe representar:

```txt
Certificado de curso
Alumno
DNI
Curso
Fechas del curso a las que asistió
Fecha de emisión
Código de certificado
QR de validación
Firmantes institucionales
```

No debe confundirse con:

- certificado analítico;
- certificado de aprobación formal de carrera;
- diploma académico genérico;
- acta de cursada;
- perfil público de alumno.

### 3.4. Composer en cPanel

Composer queda como gate técnico para staging/deploy:

```txt
Antes de usar TCPDF/PHPMailer en cPanel real, Marcos debe confirmar si Composer está disponible en el hosting.
```

Opciones:

1. Composer disponible en hosting:
   - subir `composer.json` y `composer.lock`;
   - ejecutar `composer install --no-dev --no-interaction` en staging.

2. Composer no disponible:
   - generar `vendor/` localmente desde `composer.lock`;
   - subir `vendor/` como artefacto operativo de deploy;
   - nunca versionar `vendor/` en Git.

### 3.5. Email con cuenta de prueba

La configuración inicial de email debe usar transporte SMTP de prueba, no credenciales productivas.

Reglas:

- `delivery_transport: smtp` solo en staging con credenciales de prueba;
- producción queda en `stub` hasta aprobación;
- no guardar credenciales en Git;
- no registrar token completo en logs;
- reenvío usa el mismo QR/token permanente.

### 3.6. Auth simple protegida

Para el MVP técnico se permite auth simple protegida.

Regla:

```txt
La API admin puede seguir protegida con X-Admin-Key o mecanismo equivalente simple para staging/MVP, pero debe quedar documentado como temporal.
```

No implementar todavía:

- login completo;
- recuperación de contraseña;
- roles avanzados;
- 2FA;
- OAuth/Google.

### 3.7. Firmantes PDF

El PDF debe contemplar por ahora:

- Rector/a del IFTS 14;
- Asesor/a Pedagógica del IFTS 14.

Estos datos deben venir de configuración institucional, no de cada emisión individual.

### 3.8. Staging confirmado

Ruta final de staging:

```txt
/certificados_staging/
```

Debe mantenerse separada de producción:

| Entorno | Frontend | API | DB | Config | Storage |
|---|---|---|---|---|---|
| Staging | `/certificados_staging/` | `/certificados_staging/api/` | DB staging ficticia | config staging externa | storage staging |
| Producción | `/certificados/` | `/certificados/api/` | DB real | config productiva externa | storage productivo |

---

## 4. Documentación que debe ajustarse

### 4.1. Archivos raíz

#### `README.md`

Agregar sección “Estado actual y decisiones vigentes”.

Debe incluir:

- QR permanente;
- DNI completo público;
- certificado de curso con fechas asistidas;
- auth simple temporal;
- staging `/certificados_staging/`;
- Composer pendiente de confirmar;
- email con cuenta de prueba;
- Matías trabaja UI/UX y port v0;
- Marcos trabaja backend, DB, integración, deploy y estructura funcional.

#### `GUIA.md`

Actualizar:

- alcance del módulo;
- flujo real del certificado;
- estado de `muestra_pagina/` y ZIP v0;
- roles Marcos/Matías;
- regla de staging;
- regla de QR permanente;
- regla de DNI completo público.

#### `AGENTS.md`

Actualizar reglas obligatorias:

- no rotar token en reenvío normal;
- DNI completo solo puede aparecer en UI pública y DTO público si es parte del contrato aprobado;
- logs/auditoría nunca deben incluir DNI completo;
- mocks deben usar DNIs ficticios;
- auth simple admin es temporal;
- Graphify/RTK siguen siendo recomendados para ahorrar contexto.

---

### 4.2. Backend

#### `docs/backend/01-contrato-api-certificados.md`

Cambios obligatorios:

1. Actualizar DTO público:
   - antes: `documentMasked`;
   - ahora: `documentNumber` o `documentFull`.

2. Agregar fechas asistidas:
   ```json
   {
     "course": {
       "name": "Curso de ejemplo",
       "attendedDates": ["2026-06-05", "2026-06-12"]
     }
   }
   ```

3. Aclarar:
   - el QR/token es permanente;
   - el reenvío no rota token;
   - revocación invalida token;
   - regeneración excepcional de QR queda fuera del reenvío normal.

4. Actualizar seguridad:
   - UI pública muestra DNI completo por decisión institucional;
   - logs, auditoría y errores no muestran DNI completo;
   - tokens completos nunca se devuelven ni se loguean.

#### `docs/backend/00-php84-api.md`

Actualizar:

- endpoints actuales;
- limitaciones actuales;
- gaps por decisiones nuevas;
- reenvío debe cambiar para no rotar token;
- PDF debe evolucionar a certificado institucional de curso;
- auth simple con `X-Admin-Key` queda temporal.

#### `apps/backend-php/README.md`

Actualizar:

- reenvío actual debe considerarse pendiente de ajuste por QR permanente;
- `delivery_transport` con cuenta de prueba;
- Composer cPanel como gate;
- PDF final pendiente de configuración institucional.

#### Código backend futuro

Cambios esperados en fases posteriores:

- `AdminCertificateService::reenviar()` no debe revocar token activo ni insertar token nuevo por defecto.
- `CertificateValidator` debe devolver DNI completo si el contrato lo define.
- `CertificatePdfService` debe incluir fechas asistidas.
- Emisión debe salir de alumno+curso+fechas presentes, no de texto libre.

---

### 4.3. Base de datos

#### `docs/database/01-modelo-datos-certificados.md`

Actualizar decisión de datos públicos:

- antes: documento enmascarado;
- ahora: DNI completo público por decisión confirmada.

Pero mantener:

- hash o protección para búsqueda interna;
- no loguear DNI completo;
- no guardar tokens en texto plano.

Agregar modelo futuro:

- `cert_alumnos`;
- `cert_cursos`;
- `cert_curso_fechas`;
- `cert_asistencias`;
- `cert_configuracion_institucional`;
- opcional `cert_entregas_email`;
- opcional `cert_admin_usuarios` futuro.

#### `database/migrations/`

Crear nuevas migraciones futuras, no modificar destructivamente `001_certificados_qr.sql` salvo decisión explícita.

Migraciones sugeridas:

```txt
002_cursos_alumnos_asistencias.sql
003_configuracion_institucional.sql
004_admin_auth_simple.sql
005_ajuste_certificados_dni_fechas.sql
```

---

### 4.4. Frontend Angular

#### `docs/frontend/00-angular20-port-v0.md`

Actualizar:

- ZIP v0 adjunto es referencia visual principal si se sube a `muestra_pagina/`;
- validación pública mostrará DNI completo;
- detalle público del certificado debe mostrar fechas asistidas;
- admin usa auth simple temporal;
- Matías no debe inventar backend;
- Marcos puede crear rutas/modelos/mocks básicos.

#### `apps/frontend-angular/`

Trabajo futuro:

- ajustar DTO TypeScript;
- cambiar `documentMasked` a DNI completo en contrato de vista;
- agregar `attendedDates`;
- crear modelos admin básicos;
- crear rutas admin;
- mantener mocks ficticios.

---

### 4.5. Diseño v0 / `muestra_pagina/`

Actualizar manifiesto al subir el ZIP más nuevo.

Archivos esperados:

```txt
muestra_pagina/
├── README.md
├── AGENTS.md
├── MANIFIESTO_V0.md
├── app/
├── components/
├── capturas/
└── ...
```

`MANIFIESTO_V0.md` debe listar:

- pantallas incluidas;
- prompts cubiertos;
- rutas conceptuales;
- componentes relevantes;
- pantallas pendientes;
- qué NO copiar literalmente;
- si el diseño muestra DNI completo;
- si el diseño respeta certificado de curso + fechas asistidas.

---

### 4.6. Deploy/staging

#### `docs/deploy/01-staging-cpanel-certificados.md`

Actualizar:

- staging confirmado bajo `/certificados_staging/`;
- Composer pendiente de localización/verificación en cPanel;
- SMTP será cuenta de prueba;
- auth simple protegida temporal;
- DB staging debe ser separada;
- no producción.

#### `deploy/staging/CHECKLIST.md`

Actualizar gates:

- Composer ubicado o alternativa `vendor/` local definida;
- cuenta SMTP de prueba definida;
- `X-Admin-Key` staging definido fuera de Git;
- storage staging separado;
- token permanente validado;
- DNI completo público validado con datos ficticios;
- PDF muestra fechas asistidas.

---

### 4.7. Prompts de Marcos

#### `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`

Agregar nuevas fases:

- `M4-01A backend-contrato-token-permanente-dni-fechas`
- `M4-01B backend-token-permanente-dni-fechas` (implementación, depende de M4-02 y del storage de token recuperable)
- `M4-02 database-cursos-alumnos-asistencias`
- `M4-03 backend-cursos-alumnos-asistencias-api`
- `M4-04 backend-emision-desde-asistencias`
- `M4-05 pdf-certificado-curso-fechas`
- `M4-06 email-reenvio-token-permanente`
- `M4-07 staging-cpanel-real-certificados`

También actualizar los límites:

- Marcos puede desbloquear frontend estructural;
- Matías se queda con UI/UX final;
- no hacer diseño final desde backend.

---

### 4.8. Prompts de Matías

#### `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`

Agregar:

- validación pública muestra DNI completo;
- certificado de curso muestra fechas asistidas;
- no usar `documentMasked` salvo que el mock lo mantenga temporalmente;
- esperar contrato actualizado de Marcos;
- no diseñar login real avanzado;
- auth simple temporal;
- no tocar backend;
- no tocar cPanel;
- usar ZIP v0 actualizado como referencia principal cuando esté subido.

#### `MATIAS_PROMPTS_SDD_FASE2.md`

Actualizar:

- F4-F6 deben respetar QR permanente;
- pantallas de reenvío deben decir “mismo QR”;
- PDF debe mostrar Rector/a y Asesor/a Pedagógica;
- configuración institucional debe incluir firmantes;
- pantallas admin deben mostrar certificado de curso y fechas asistidas;
- no inventar rotación de QR.

---

## 5. Plan de fases SDD sugeridas

> **Si docs-sync es demasiado amplio**, partirlo en dos fases: **D0-01** (decisiones fuente de verdad en docs raíz: README, GUIA, AGENTS, decisiones D0) y **D0-02** (contratos técnicos: contrato API, modelo de datos, DTO Angular, specs OpenSpec). D0-01 puede cerrarse sin tocar contratos técnicos; D0-02 requiere los contratos vigentes.

## Fase D0 — Sincronización documental de decisiones

### Nombre sugerido

```txt
docs-sync-decisiones-certificados
```

### Responsable

Marcos.

### Objetivo

Actualizar toda la documentación y planificación con las decisiones confirmadas:

- QR permanente;
- DNI completo público;
- certificado de curso con fechas asistidas;
- Composer pendiente;
- email cuenta de prueba;
- auth simple temporal;
- firmantes Rector/a + Asesor/a Pedagógica;
- staging `/certificados_staging/`.

### Alcance

- README;
- GUIA;
- AGENTS;
- docs backend;
- docs database;
- docs frontend;
- docs deploy;
- prompts Marcos;
- prompts Matías;
- OpenSpec.

### No-alcance

- no implementar backend;
- no modificar Angular;
- no crear migraciones;
- no tocar cPanel;
- no subir ZIP v0 todavía si ese es otro commit.

### Criterios de aceptación

- No quedan contradicciones entre QR permanente y reenvío.
- No quedan menciones a DNI enmascarado como decisión final pública.
- Matías tiene instrucciones actualizadas.
- Marcos tiene roadmap actualizado.
- El staging queda confirmado como `/certificados_staging/`.

---

## Fase M4-01 — Token permanente y contrato público actualizado

> **Split recomendado.** Dividir en **M4-01A** (`backend-contrato-token-permanente-dni-fechas`, documental/contrato, sin implementar) y **M4-01B** (`backend-token-permanente-dni-fechas`, implementación, depende de M4-02 y del storage de token recuperable).

### Nombre sugerido

```txt
backend-contrato-token-permanente-dni-fechas
```

### Responsable

Marcos.

### Objetivo

Alinear contrato backend/API con:

- QR permanente;
- DNI completo público;
- certificado de curso;
- fechas asistidas.

### Alcance

- contrato API;
- DTO público;
- validación pública;
- documentación de reenvío;
- specs OpenSpec.

### No-alcance

- cursos/asistencias reales;
- PDF final;
- email real.

### Criterios de aceptación

- DTO público define DNI completo.
- DTO público define fechas asistidas.
- Reenvío no rota token.
- Revocación invalida token.
- Logs/auditoría no registran DNI completo ni token completo.
- **Estrategia de token recuperable** (`token_cifrado` con clave externa a Git) queda definida; hash-only se marca como insuficiente para reenvío permanente.

---

## Fase M4-02 — Modelo real de cursos, alumnos, fechas y asistencias

### Nombre sugerido

```txt
database-cursos-alumnos-asistencias
```

### Responsable

Marcos.

### Objetivo

Crear el esquema base académico necesario para certificar cursos con fechas asistidas.

### Tablas sugeridas

```txt
cert_alumnos
cert_cursos
cert_curso_fechas
cert_asistencias
```

### Campos mínimos sugeridos

#### `cert_alumnos`

- id;
- nombre;
- apellido;
- **DNI con diseño seguro recomendado**: `dni_hash` (lookup/control), `dni_cifrado` (recuperación controlada con clave externa a Git) y `dni_mostrar VARCHAR(20) NULL` (DNI completo visible solo si la institución lo exige por D0). Alternativa MVP explícita: `dni VARCHAR(20)` + `dni_hash`, aceptada solo con riesgo documentado. Sin decisión explícita, preferir el diseño seguro.
- email;
- estado;
- created_at;
- updated_at.

#### `cert_cursos`

- id;
- codigo;
- nombre;
- estado;
- created_at;
- updated_at.

#### `cert_curso_fechas`

- id;
- curso_id;
- fecha;
- descripcion opcional;
- estado;
- created_at.

#### `cert_asistencias`

- id;
- alumno_id;
- curso_fecha_id;
- created_at;
- eliminado_en (opcional, solo si se necesita soft-delete para correcciones).
- **No booleano `presente` ni estados ausente/justificado**: la presencia se representa por la existencia de la fila.
- `UNIQUE(alumno_id, curso_fecha_id)` para evitar duplicados.

### Criterios de aceptación

- FK correctas.
- Índices por DNI, curso, fecha.
- Unique para evitar asistencia duplicada por alumno+fecha.
- Seeds ficticios.
- Compatible MariaDB 10.6.
- Sin datos reales.

### Modelo de fechas de certificado (snapshot)

Para el MVP serio, las fechas asistidas del certificado se capturan como **snapshot al momento de emisión** en `cert_certificado_fechas`. Las correcciones posteriores sobre asistencias vivas actualizan el snapshot o generan versión/auditoría y marcan el certificado como `requiere_reenvio`; la regeneración del PDF conserva el mismo QR/token. No recalcular las fechas del PDF desde asistencias vivas en cada reenvío.

---

## Fase M4-03 — API admin para cursos, alumnos y asistencias

### Nombre sugerido

```txt
backend-cursos-alumnos-asistencias-api
```

### Responsable

Marcos.

### Objetivo

Exponer API mínima protegida para que Angular pueda operar cursos, alumnos, fechas y asistencias.

### Endpoints sugeridos

```txt
GET    /admin/cursos
POST   /admin/cursos
GET    /admin/cursos/{id}
PATCH  /admin/cursos/{id}
POST   /admin/cursos/{id}/fechas
GET    /admin/cursos/{id}/fechas
GET    /admin/cursos/{id}/asistencias
POST   /admin/cursos/{id}/asistencias
GET    /admin/alumnos
POST   /admin/alumnos
GET    /admin/alumnos/{id}
PATCH  /admin/alumnos/{id}
```

### No-alcance

- login real;
- UI final;
- PDF final.

### Criterios de aceptación

- Protegido por auth simple temporal.
- Respuestas JSON seguras.
- Validaciones mínimas.
- No expone secretos.
- No usa datos reales.
- Frontend puede consumirlo o mockearlo con el mismo contrato.

---

## Fase M4-04 — Emisión desde asistencias reales

### Nombre sugerido

```txt
backend-emision-desde-asistencias
```

### Responsable

Marcos.

### Objetivo

Cambiar emisión para que use:

- alumno existente;
- curso existente;
- fechas presentes;
- código de certificado;
- token permanente.

### Nuevo payload sugerido

```json
{
  "alumnoId": 1,
  "cursoId": 10,
  "fechaEmision": "2026-07-01"
}
```

El backend calcula:

- nombre completo;
- DNI;
- curso;
- fechas asistidas;
- código de certificado;
- token permanente;
- PDF.

### Criterios de aceptación

- No emite si no hay asistencias presentes.
- No duplica certificado vigente para mismo alumno+curso salvo decisión explícita.
- Guarda fechas asistidas asociadas al certificado o permite reconstruirlas de forma estable.
- No devuelve token completo en JSON.
- Genera PDF con el mismo QR.

---

## Fase M4-05 — PDF institucional de certificado de curso

### Nombre sugerido

```txt
pdf-certificado-curso-fechas
```

### Responsable

Marcos + revisión visual Matías.

### Objetivo

Actualizar el PDF para que sea un certificado de curso institucional, horizontal, con QR y fechas asistidas.

### Debe incluir

- IFTS N.° 14;
- título “Certificado”;
- alumno;
- DNI completo;
- curso;
- fechas asistidas;
- fecha de emisión;
- código de certificado;
- QR;
- link de validación;
- Rector/a;
- Asesor/a Pedagógica.

### No-alcance

- firma digital legal avanzada;
- integración con certificados oficiales externos.

### Criterios de aceptación

- PDF se genera y descarga.
- No imprime token como texto completo.
- QR apunta a `/certificados/validar/{token}` o staging si corresponde.
- Se parece al certificado institucional esperado.
- Usa datos de configuración institucional.

---

## Fase M4-06 — Reenvío con token permanente y email de prueba

> **Dependencia clave.** El reenvío que conserva el QR exige persistir un artefacto recuperable del token (`token_cifrado` o URL pública cifrada con clave externa a Git). Guardar solo `token_hash` es insuficiente: el hash no permite reconstruir la URL `/validar/{token}`. Mientras no exista `backend-token-permanente-storage`, el reenvío real queda fuera de alcance o limitado al token conocido en emisión.

### Nombre sugerido

```txt
email-reenvio-token-permanente
```

### Responsable

Marcos.

### Objetivo

Ajustar reenvío para que use el mismo QR/token y una cuenta SMTP de prueba.

### Cambios esperados

- no revocar token activo;
- no insertar token nuevo;
- reenviar link/PDF con mismo QR;
- auditar reenvío;
- SMTP test account;
- modo `stub` como fallback seguro.

### Criterios de aceptación

- Reenvío exitoso no cambia validación pública.
- Auditoría registra evento sin token ni DNI completo en logs.
- Si SMTP falla, no rompe certificado.
- Config real fuera de Git.

---

## Fase M4-07 — Auth simple admin protegida

### Nombre sugerido

```txt
backend-auth-simple-admin
```

### Responsable

Marcos.

### Objetivo

Mantener auth simple para staging/MVP, documentada como temporal.

### Opción mínima

- `X-Admin-Key` fuerte;
- config fuera de Git;
- errores 401 seguros;
- no exponer admin sin clave.

### No-alcance

- login real;
- usuarios;
- roles;
- recuperación contraseña.

### Criterios de aceptación

- Admin protegido.
- Matías puede diseñar login visual como mock, pero no login real.
- Documentación dice que login real es fase posterior.

---

## Fase M4-08 — Staging real en cPanel

### Nombre sugerido

```txt
deploy-staging-cpanel-real-certificados
```

### Responsable

Marcos.

### Objetivo

Subir versión integrada a `/certificados_staging/`.

### Gates obligatorios

- Composer localizado o estrategia `vendor/` local definida.
- DB staging creada.
- Config externa staging creada.
- SMTP cuenta de prueba o stub.
- Storage PDF staging separado.
- Build Angular staging.
- API health.
- Token ficticio validable.
- Rollback preparado.

### No-alcance

- producción `/certificados/`.

---

## Fase F-MATIAS-01 — Actualizar referencia v0 completa

### Nombre sugerido

```txt
muestra-pagina-v0-actualizada
```

### Responsable

Marcos prepara ZIP/manifiesto; Matías usa referencia.

### Objetivo

Subir o sincronizar el ZIP v0 más nuevo dentro de `muestra_pagina/`.

### Criterios

- `MANIFIESTO_V0.md` actualizado.
- No subir `node_modules`.
- No subir `.next`.
- No subir `.env`.
- No subir secretos.
- Capturas y código v0 se usan solo como referencia.

---

## Fase F-MATIAS-02 — Port visual Angular desde v0

### Nombre sugerido

```txt
frontend-v0-port-admin-publico
```

### Responsable

Matías.

### Objetivo

Portar y mejorar diseño v0 a Angular 20.

### Matías debe hacer

- componentes UI;
- layout público;
- layout admin;
- responsive;
- accesibilidad;
- tablas;
- estados;
- polish visual;
- QA visual.

### Matías no debe hacer

- backend;
- base;
- cPanel;
- contratos API;
- auth real;
- email real.

---

## 6. División recomendada Marcos / Matías

### Marcos

Marcos debe concentrarse en:

1. decisiones de contrato;
2. base de datos;
3. backend PHP;
4. PDF;
5. email;
6. auth simple;
7. staging;
8. modelos y servicios Angular mínimos si hace falta destrabar;
9. integración Angular/API.

### Matías

Matías debe concentrarse en:

1. port del diseño v0/Next.js a Angular;
2. sistema visual;
3. responsive;
4. accesibilidad;
5. UI admin;
6. UI pública;
7. QA visual;
8. handoff visual.

### Regla de coordinación

```txt
Marcos define datos, contratos y estructura.
Matías define experiencia visual y calidad de interfaz.
```

---

## 7. Prompts recomendados

## 7.1. Prompt para sincronizar documentación ahora

```txt
Ejecutá un ciclo SDD documental para sincronizar toda la documentación y planificación del proyecto IFTS14 con las decisiones confirmadas por Marcos.

No implementes producto.
No modifiques Angular funcional.
No modifiques PHP funcional.
No crees migraciones todavía.
No toques cPanel.
No toques material_privado_no_versionar/.
No hagas commit, push, merge ni rebase.

Decisiones confirmadas:
1. QR/token permanente.
2. Validación pública muestra DNI completo.
3. El documento es certificado de curso y muestra debajo las fechas del curso a las que asistió el alumno.
4. Marcos tiene disponibilidad total en cPanel, pero Composer está pendiente de localizar/verificar.
5. Email con cuenta de prueba.
6. Auth simple protegida por ahora; login real queda para después.
7. Firmantes PDF por ahora: Rector/a y Asesor/a Pedagógica.
8. Staging confirmado bajo /certificados_staging/.

Objetivo:
Actualizar documentación, specs, prompts y roadmap para que no queden contradicciones.

Archivos a leer:
- AGENTS.md
- README.md
- GUIA.md
- docs/00-indice-general.md
- docs/backend/00-php84-api.md
- docs/backend/01-contrato-api-certificados.md
- docs/database/00-mariadb.md
- docs/database/01-modelo-datos-certificados.md
- docs/frontend/00-angular20-port-v0.md
- docs/deploy/00-cpanel-certificados.md
- docs/deploy/01-staging-cpanel-certificados.md
- deploy/staging/CHECKLIST.md
- MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
- MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
- MATIAS_PROMPTS_SDD_FASE2.md
- openspec/specs/backend-contrato-api-certificados/spec.md
- openspec/specs/backend-modelo-datos-certificados/spec.md
- muestra_pagina/README.md
- muestra_pagina/MANIFIESTO_V0.md

No leer todo el repositorio.

Tareas:
1. Actualizar decisiones fuente de verdad.
2. Cambiar documentación pública de DNI enmascarado a DNI completo.
3. Mantener aclaración de seguridad: DNI completo puede mostrarse públicamente, pero logs/auditoría no deben guardarlo.
4. Cambiar reenvío para que documentalmente use el mismo QR/token permanente.
5. Marcar el código actual que rota token como pendiente de ajuste en fase posterior.
6. Documentar certificado de curso con fechas asistidas.
7. Documentar Composer como gate de staging.
8. Documentar SMTP con cuenta de prueba.
9. Documentar auth simple como temporal.
10. Documentar firmantes Rector/a y Asesor/a Pedagógica.
11. Confirmar staging /certificados_staging/.
12. Actualizar roadmap de Marcos con fases M4.
13. Actualizar roadmap de Matías para respetar las nuevas decisiones.
14. Actualizar OpenSpec si corresponde, o preparar delta si el flujo del proyecto lo exige.
15. Cerrar con sdd-archive.

Criterios de aceptación:
- No quedan contradicciones sobre QR permanente.
- No quedan contradicciones sobre DNI completo público.
- Matías tiene instrucciones actualizadas para v0/Angular.
- Marcos tiene fases nuevas claras.
- Staging queda confirmado.
- No se tocó producto.
- No se tocaron secretos ni material privado.

Al finalizar:
- listar archivos modificados;
- explicar cambios;
- listar pendientes técnicos;
- proponer mensaje de commit;
- no ejecutar commit ni push.
```

---

## 7.2. Prompt para Marcos después de sincronizar docs

```txt
Trabajemos la fase M4-01A — backend-contrato-token-permanente-dni-fechas (contrato, sin implementar todavía).

Objetivo:
Alinear contrato y specs con:
- QR/token permanente;
- DNI completo público;
- certificado de curso;
- fechas asistidas;
- reenvío sin rotación de token;
- artefacto recuperable de token (`token_cifrado` o equivalente, clave fuera de Git).

Después de cerrar M4-01A, la fase M4-01B — backend-token-permanente-dni-fechas implementa el contrato, pero depende de M4-02 y del storage de token recuperable.

Usá SDD completo.
Primero explore/propose/spec/design/tasks.
No implementes hasta que el plan esté claro.

Archivos a leer:
- AGENTS.md
- docs/00-indice-general.md
- docs/backend/00-php84-api.md
- docs/backend/01-contrato-api-certificados.md
- docs/database/01-modelo-datos-certificados.md
- apps/backend-php/index.php
- apps/backend-php/src/AdminCertificateService.php
- apps/backend-php/src/CertificateValidator.php
- apps/backend-php/src/CertificatePdfService.php
- openspec/specs/backend-contrato-api-certificados/spec.md

No tocar frontend salvo contratos DTO documentales.
No tocar cPanel.
No tocar material privado.
No usar datos reales.

Tareas:
1. Identificar contradicciones actuales.
2. Proponer cambios de contrato.
3. Definir DTO público actualizado con DNI completo y fechas asistidas.
4. Definir comportamiento de reenvío sin rotación.
5. Definir comportamiento de revocación.
6. Definir qué queda pendiente hasta modelo real de cursos/asistencias.
7. Implementar solo si el ciclo lo aprueba.
8. Verificar con Docker PHP 8.4.
9. Cerrar con sdd-archive.

No hagas commit ni push.
```

---

## 7.3. Prompt para Matías después de actualizar `muestra_pagina/`

```txt
Trabajemos el ciclo de Matías para revisar la referencia v0 actualizada.

Objetivo:
Auditar el ZIP/v0 actualizado dentro de muestra_pagina/ y preparar el port visual a Angular 20 respetando las decisiones confirmadas.

Decisiones vigentes:
- QR/token permanente.
- Validación pública muestra DNI completo.
- Documento: certificado de curso.
- Debe mostrar fechas del curso a las que asistió el alumno.
- Auth admin simple por ahora; no diseñar login real avanzado.
- Firmantes PDF: Rector/a y Asesor/a Pedagógica.
- Staging: /certificados_staging/.

Reglas:
- No copiar React/Next literalmente.
- No tocar backend.
- No tocar DB.
- No tocar deploy.
- No instalar dependencias sin aprobación.
- No usar datos reales.
- No inventar contratos API.

Archivos a leer:
- AGENTS.md
- apps/frontend-angular/AGENTS.md
- docs/frontend/00-angular20-port-v0.md
- muestra_pagina/README.md
- muestra_pagina/MANIFIESTO_V0.md
- MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
- MATIAS_PROMPTS_SDD_FASE2.md

Tareas:
1. Inventariar pantallas v0 disponibles.
2. Separar pantallas esenciales vs polish.
3. Detectar si alguna pantalla contradice QR permanente, DNI completo o certificado de curso con fechas.
4. Proponer componentes Angular reutilizables.
5. Proponer orden de port.
6. Dejar bloqueos si faltan contratos de Marcos.
7. Cerrar con reporte final.

No hagas commit ni push.
```

---

## 8. Checklist de aceptación final del ajuste documental

- [ ] README actualizado.
- [ ] GUIA actualizada.
- [ ] AGENTS actualizado.
- [ ] Contrato API actualizado.
- [ ] Docs backend actualizadas.
- [ ] Docs DB actualizadas.
- [ ] Docs frontend actualizadas.
- [ ] Docs deploy/staging actualizadas.
- [ ] Prompts Marcos actualizados.
- [ ] Prompts Matías actualizados.
- [ ] OpenSpec actualizado o delta preparado.
- [ ] `muestra_pagina` y ZIP v0 quedan como referencia visual, no código definitivo.
- [ ] QR permanente queda como fuente de verdad.
- [ ] DNI completo público queda como fuente de verdad.
- [ ] Reenvío con mismo QR queda como fuente de verdad.
- [ ] Auth simple temporal queda documentada.
- [ ] Composer queda como gate.
- [ ] Email cuenta de prueba queda documentada.
- [ ] Staging `/certificados_staging/` queda confirmado.
- [ ] No se tocó producto todavía.
- [ ] No se tocaron datos reales.
- [ ] No se versionaron secretos.

---

## 9. Próximo paso recomendado

El próximo paso exacto para Marcos debería ser:

```txt
1. Ejecutar docs-sync-decisiones-certificados.
2. Commit documental.
3. Ejecutar M4-01A backend-contrato-token-permanente-dni-fechas (contrato).
4. Después M4-01B backend-token-permanente-dni-fechas (implementación, depende de M4-02 y del storage de token recuperable).
5. Después recién avanzar a modelo real de cursos/alumnos/asistencias.
```

No conviene que Matías empiece el port final de pantallas admin hasta que Marcos deje al menos:

- decisiones sincronizadas;
- ZIP v0 actualizado en `muestra_pagina/`;
- contrato DTO público actualizado;
- modelos/mocks básicos para cursos, fechas y asistencias.
