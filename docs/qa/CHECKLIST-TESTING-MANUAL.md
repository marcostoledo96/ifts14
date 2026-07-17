# Checklist de testing manual — IFTS14 Certificados

Documento operativo para pasadas manuales con checkpoints marcables. Cubre flujos, datos, estados, seguridad, API, UI, accesibilidad, responsive, PDF/QR y staging.

| Campo | Valor |
|---|---|
| Versión | 1.0 |
| Fecha | 2026-07-17 |
| Ámbito | Módulo `/certificados/` (SPA Angular + API PHP + MariaDB) |
| Entornos | Local · Staging `/certificados_staging/` · Producción `/certificados/` (solo si está autorizada) |
| Referencias | `GUIA.md`, `docs/backend/01-contrato-api-certificados.md`, `docs/database/01-modelo-datos-certificados.md`, `openspec/specs/admin-auth/spec.md` |

---

## 0. Cómo usar este documento

### 0.1 Leyenda de resultado

| Marca | Significado |
|---|---|
| `[ ]` | Pendiente |
| `[x]` | **PASS** — cumple el criterio |
| `[F]` | **FAIL** — no cumple; abrir hallazgo |
| `[B]` | **BLOCKED** — no se pudo probar (entorno, datos, permiso) |
| `[N]` | **N/A** — no aplica al entorno o al alcance de esta pasada |
| `[P]` | **PARTIAL** — parcialmente ok; documentar qué falta |

### 0.2 Plantilla de cabecera de pasada

Completar al iniciar cada corrida:

```txt
Fecha: _______________
Tester: _______________
Entorno: [ ] Local  [ ] Staging  [ ] Producción (autorizada)
Base URL SPA: ________________________________
Base URL API: ________________________________
useRealApi / build: __________________________
Navegador + versión: _________________________
SO / dispositivo: ____________________________
Credenciales usadas: (NO pegar claves reales; solo rol, ej. bedelía demo)
Datos de prueba: ficticios / seed staging / otros: ________
Commit / build: ______________________________
```

### 0.3 Severidad de hallazgos

| Severidad | Criterio |
|---|---|
| **P0** | Bloquea emisión, validación pública, seguridad D0 o login admin |
| **P1** | Flujo principal roto o datos incorrectos visibles al usuario |
| **P2** | UX/accesibilidad/responsive serio; workaround posible |
| **P3** | Cosmético, copy, polish |

### 0.4 Reglas de evidencia

- No pegar en este archivo ni en chats: DNI reales, tokens completos, CSRF, cookies, claves, SQL dumps, logs con datos sensibles.
- En evidencias usar: código de certificado, prefijo de token, DNI enmascarado (`12****34`), requestId, status HTTP.
- Capturas: recortar o pixelar datos sensibles antes de adjuntar.
- Preferir checklist + 1–2 líneas de nota por FAIL.

### 0.5 Orden recomendado de pasada

1. Smoke técnico (sección 1)  
2. Flujo E2E feliz (sección 2)  
3. Flujos por pantalla (sección 3)  
4. Datos y límites (sección 4)  
5. Estados UI (sección 5)  
6. Seguridad D0 (sección 6)  
7. API/backend (sección 7)  
8. Integridad DB (sección 8)  
9. Responsive + a11y + navegadores (secciones 9–11)  
10. PDF / QR / impresión (sección 12)  
11. Staging / deploy (sección 13)  
12. Cierre y veredicto (sección 14)

---

## 1. Smoke técnico (pre-checklist)

Objetivo: confirmar que el entorno responde antes de invertir tiempo en UI.

### 1.1 Disponibilidad

| ID | Checkpoint | Resultado | Notas |
|---|---|---|---|
| S-01 | `GET …/api/health` → 200 JSON (`status: ok`) | `[ ]` | |
| S-02 | SPA carga en la base href correcta (`/certificados/` o `/certificados_staging/`) | `[ ]` | |
| S-03 | Sin errores rojos en consola al cargar login | `[ ]` | |
| S-04 | Rutas internas de API bloqueadas (ej. `/api/src/…`) → 403/404, no exponen código | `[ ]` | |
| S-05 | `favicon` / assets estáticos 200 (sin 404 masivos) | `[ ]` | |
| S-06 | Extensión PHP `gd` disponible (QR PNG) — o documentar `CONFIGURATION_ERROR` esperado | `[ ]` | |

### 1.2 Auth mínima

| ID | Checkpoint | Resultado | Notas |
|---|---|---|---|
| S-10 | Login correcto → redirige a `/admin/dashboard` | `[ ]` | |
| S-11 | Login incorrecto → mensaje claro, no 500 | `[ ]` | |
| S-12 | Sin sesión: `/admin/dashboard` → login | `[ ]` | |
| S-13 | Logout cierra sesión; F5 no reabre admin | `[ ]` | |
| S-14 | Cookie de sesión `HttpOnly` (DevTools → Application) | `[ ]` | |

---

## 2. Flujo E2E feliz (camino crítico)

Flujo institucional esperado:

```txt
Curso + fechas → Alumno → Asistencias presentes → Emisión →
PDF/QR → Entrega manual (copiar link / descargar) →
Validación pública (DNI completo + fechas) → (opcional) Revocación
```

Usar **datos ficticios**. Anotar IDs internos solo si hacen falta para re-prueba.

### 2.1 Camino completo

| ID | Paso | Criterio de aceptación | Resultado | Evidencia segura |
|---|---|---|---|---|
| E-01 | Crear / abrir curso certificable | Curso visible en listado con nombre y código | `[ ]` | |
| E-02 | Agregar ≥2 fechas al curso | Fechas listadas, estados coherentes | `[ ]` | |
| E-03 | Crear / seleccionar alumno | Aparece en listado; **DNI enmascarado en admin** | `[ ]` | |
| E-04 | Marcar asistencias presentes en fechas | Guardado OK; conteos actualizados | `[ ]` | |
| E-05 | Emitir certificación (alumno + curso) | 201 / UI éxito; código visible; **sin token completo ni DNI completo en admin** | `[ ]` | |
| E-06 | Abrir expediente / preview | Datos curso, alumno (máscara), estado `vigente` | `[ ]` | |
| E-07 | Descargar / previsualizar PDF | PDF abre; QR presente; firmantes institucionales | `[ ]` | |
| E-08 | Entrega manual: copiar link público | Link válido; feedback “copiado”; **mismo token/QR (no rota)** | `[ ]` | |
| E-09 | Entrega manual: descargar QR PNG | Archivo `…-qr.png`; escaneable | `[ ]` | |
| E-10 | Abrir validación pública por link | Estado vigente; **DNI completo**; fechas asistidas; nombre; curso | `[ ]` | |
| E-11 | Escanear QR (cámara / app) | Llega a la misma URL de validación | `[ ]` | |
| E-12 | Segunda entrega / re-copia del link | URL **idéntica** a E-08 (token permanente) | `[ ]` | |
| E-13 | Revocar con motivo ≥12 caracteres + confirmación | Estado revocado en admin | `[ ]` | |
| E-14 | Revalidar URL pública post-revocación | Ya no verificable / no vigente | `[ ]` | |
| E-15 | Intentar re-emitir mismo alumno+curso vigente | Bloqueo de duplicado activo (o mensaje claro) | `[ ]` | |
| E-16 | Tras revocar, re-emitir mismo alumno+curso | Permitido; **nuevo** certificado; validación OK | `[ ]` | |

### 2.2 Variante: modificación de asistencias post-emisión

| ID | Checkpoint | Resultado | Notas |
|---|---|---|---|
| E-20 | Con certificado vigente, cambiar asistencias del curso | Comportamiento documentado (PDF stale / regeneración / snapshot) | `[ ]` | |
| E-21 | Validación pública sigue mostrando fechas del snapshot (no inventa fechas) | `[ ]` | |
| E-22 | URL/QR **no rota** tras regenerar PDF | `[ ]` | |

---

## 3. Flujos por pantalla (funcional)

### 3.1 Landing / redirección

| ID | Checkpoint | Resultado |
|---|---|---|
| F-L01 | `/` o base → redirige a login admin (comportamiento actual) | `[ ]` |
| F-L02 | Ruta inexistente → página not-found, no valida tokens | `[ ]` |

### 3.2 Login (`/admin/login`)

| ID | Checkpoint | Resultado | Notas |
|---|---|---|---|
| F-A01 | Campos vacíos → validación local clara | `[ ]` | |
| F-A02 | Usuario < 3 chars → error local | `[ ]` | |
| F-A03 | Clave < 6 chars → error local | `[ ]` | |
| F-A04 | Credenciales inválidas → mensaje genérico (sin filtrar si falló user o pass) | `[ ]` | |
| F-A05 | Rate limit (muchos intentos) → mensaje 429 amigable | `[ ]` | |
| F-A06 | Toggle mostrar/ocultar clave | `[ ]` | |
| F-A07 | Enter envía el formulario | `[ ]` | |
| F-A08 | Durante loading no permite doble submit | `[ ]` | |
| F-A09 | Foco va al alert de error cuando falla | `[ ]` | |
| F-A10 | No hay credenciales demo hardcodeadas en UI | `[ ]` | |

### 3.3 Shell admin / dashboard

| ID | Checkpoint | Resultado |
|---|---|---|
| F-D01 | Sidebar: Dashboard, Cursos, Alumnos, Asistencias, Certificaciones, Configuración | `[ ]` |
| F-D02 | Ítem activo coincide con la ruta | `[ ]` |
| F-D03 | Cerrar sesión visible y funcional | `[ ]` |
| F-D04 | Dashboard tiles/enlaces llevan a destinos reales (no links rotos) | `[ ]` |
| F-D05 | En móvil: menú usable (abrir/cerrar) | `[ ]` |

### 3.4 Cursos

| ID | Ruta / acción | Checkpoint | Resultado |
|---|---|---|---|
| F-C01 | `/admin/cursos` | Listado carga; búsqueda filtra | `[ ]` |
| F-C02 | Listado | Empty / error / skeleton diferenciados | `[ ]` |
| F-C03 | `/admin/cursos/nuevo` | Crear curso válido | `[ ]` |
| F-C04 | Nuevo | Validación de campos obligatorios | `[ ]` |
| F-C05 | `/admin/cursos/:id` | Detalle con fechas y métricas | `[ ]` |
| F-C06 | `/admin/cursos/:id/editar` | Editar y persistir | `[ ]` |
| F-C07 | Fechas | Crear fecha; editar; cancelar (si aplica) | `[ ]` |
| F-C08 | Estado curso | Cambiar estado (activo/inactivo u equivalentes) | `[ ]` |
| F-C09 | ID inexistente | Mensaje “no encontrado”, no pantalla blanca | `[ ]` |

### 3.5 Alumnos

| ID | Checkpoint | Resultado | Notas |
|---|---|---|---|
| F-S01 | Listado `/admin/alumnos` con búsqueda/filtros | `[ ]` | |
| F-S02 | **Nunca** DNI completo en listado/detalle admin | `[ ]` | Máscara tipo `12****34` |
| F-S03 | No mostrar email literal / legajo si el producto no los expone | `[ ]` | |
| F-S04 | Nuevo alumno (`/admin/alumnos/nuevo`) con DNI válido ficticio | `[ ]` | |
| F-S05 | DNI inválido (letras, corto, vacío) → rechazo | `[ ]` | |
| F-S06 | Duplicar DNI → error controlado | `[ ]` | |
| F-S07 | Detalle `/admin/alumnos/:id` | `[ ]` | |
| F-S08 | Cambiar estado alumno | `[ ]` | |
| F-S09 | ID inexistente → error claro | `[ ]` | |

### 3.6 Asistencias

| ID | Checkpoint | Resultado |
|---|---|---|
| F-T01 | Hub `/admin/asistencias`: listado, chips Programadas/Realizadas, búsqueda | `[ ]` |
| F-T02 | Entrar a marcado `/admin/cursos/:id/fechas/:fechaId/asistencias` | `[ ]` |
| F-T03 | Toggle Presente / Marcar por alumno | `[ ]` |
| F-T04 | Resumen sticky / conteos coherentes con roster | `[ ]` |
| F-T05 | Guardar / persistir (API real) o feedback mock coherente | `[ ]` |
| F-T06 | Quitar asistencia (anular) y verificar conteo | `[ ]` |
| F-T07 | Fecha cancelada no aparece como asistible (o bloqueada) | `[ ]` |
| F-T08 | Curso sin alumnos → empty claro | `[ ]` |
| F-T09 | Volver al curso desde marcado | `[ ]` |

### 3.7 Certificaciones — listado y emisión

| ID | Checkpoint | Resultado |
|---|---|---|
| F-K01 | Listado `/admin/certificaciones`: filtros, búsqueda, paginación | `[ ]` |
| F-K02 | Estados: vigente / revocado / etc. visibles y filtrables | `[ ]` |
| F-K03 | Nueva `/admin/certificaciones/nueva`: seleccionar alumno + curso | `[ ]` |
| F-K04 | Emisión sin requisitos (sin asistencias) → rechazo o advertencia según reglas | `[ ]` |
| F-K05 | Emisión OK → redirect a expediente o confirmación | `[ ]` |
| F-K06 | Admin muestra `tokenPrefix`, no token completo | `[ ]` |
| F-K07 | Admin muestra documento enmascarado, no DNI completo | `[ ]` |

### 3.8 Expediente / preview

| ID | Checkpoint | Resultado |
|---|---|---|
| F-K10 | `/admin/certificaciones/:id` carga datos | `[ ]` |
| F-K11 | Copiar link público (si disponible) con feedback | `[ ]` |
| F-K12 | Compartir (si el navegador lo soporta) o fallback | `[ ]` |
| F-K13 | Accesos a PDF, entrega, revocar | `[ ]` |
| F-K14 | Banner post-revocación (`?revocada=1`) si aplica | `[ ]` |

### 3.9 Entrega manual

| ID | Checkpoint | Resultado | Notas |
|---|---|---|---|
| F-K20 | `/admin/certificaciones/:id/entrega` abre diálogo/página | `[ ]` | |
| F-K21 | Muestra URL pública + prefijo; **no** token completo suelto | `[ ]` | |
| F-K22 | Copiar link (clipboard granted) | `[ ]` | |
| F-K23 | Copiar link con clipboard denegado → mensaje útil | `[ ]` | |
| F-K24 | Descargar PDF | `[ ]` | |
| F-K25 | Descargar QR PNG | `[ ]` | |
| F-K26 | Cancelar / Escape cierra sin mutar | `[ ]` | |
| F-K27 | Certificado sin `token_cifrado` → error controlado (409) sin regenerar | `[ ]` | Si hay fixture |
| F-K28 | Reabrir entrega: **misma** URL que antes | `[ ]` | Token permanente |

### 3.10 Revocación

| ID | Checkpoint | Resultado |
|---|---|---|
| F-K30 | Solo vigente es revocable | `[ ]` |
| F-K31 | Motivo < 12 chars → error | `[ ]` |
| F-K32 | Motivo sin checkbox → error | `[ ]` |
| F-K33 | Escape vuelve al expediente | `[ ]` |
| F-K34 | Focus trap dentro del diálogo (Tab cicla) | `[ ]` |
| F-K35 | Motivo no debe guardar DNI/token/email en claro (sanitiza o rechaza) | `[ ]` |
| F-K36 | Ya revocado: no permite segunda revocación | `[ ]` |

### 3.11 Configuración institucional

| ID | Checkpoint | Resultado | Notas |
|---|---|---|---|
| F-G01 | `/admin/configuracion` carga | `[ ]` | |
| F-G02 | Campos editables del DTO (nombre, texto certificado, firmantes) | `[ ]` | |
| F-G03 | Secciones no implementadas (logos/SMTP/sello) aparecen disabled u honestas | `[ ]` | No inventar persistencia |
| F-G04 | Guardar y ver reflejo en PDF de emisión nueva | `[ ]` | |

### 3.12 Validación pública

| ID | Checkpoint | Resultado | Notas |
|---|---|---|---|
| F-V01 | Token vigente → UI “válido” + DNI completo + fechas | `[ ]` | D0 |
| F-V02 | Token revocado → no verificable | `[ ]` | |
| F-V03 | Token vencido (si existe) → estado coherente | `[ ]` | |
| F-V04 | Token inexistente / mal formado → error controlado | `[ ]` | |
| F-V05 | Token corto / caracteres inválidos → 400/UI error, no 500 | `[ ]` | |
| F-V06 | Legacy sin `attendedDates` → no inventa fechas | `[ ]` | |
| F-V07 | Consola sin leaks de token en logs de app | `[ ]` | |
| F-V08 | Paridad visual vs `muestra_pagina` (folio, sellos, estados) | `[ ]` | |

---

## 4. Pruebas de datos (entrada, límites, integridad lógica)

### 4.1 Validación de formularios (matriz)

Probar en crear/editar curso, alumno, fecha, emisión, revocación:

| ID | Caso | Resultado esperado | Curso | Alumno | Fecha | Emisión | Revocar |
|---|---|---|---|---|---|---|---|
| D-01 | Vacío / omitido | Error de campo | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| D-02 | Solo espacios | Rechazo | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| D-03 | Texto máximo razonable (border) | Acepta o trunca con aviso | `[ ]` | `[ ]` | `[ ]` | — | `[ ]` |
| D-04 | Texto excesivo (overflow) | Rechazo o truncado seguro | `[ ]` | `[ ]` | `[ ]` | — | `[ ]` |
| D-05 | XSS payload en nombre (`<script>`) | Escapado; no ejecuta | `[ ]` | `[ ]` | `[ ]` | — | `[ ]` |
| D-06 | SQL-ish (`' OR 1=1 --`) | Sin error 500; sin leak | `[ ]` | `[ ]` | — | — | `[ ]` |
| D-07 | Unicode / tildes / ñ | Persiste y muestra bien | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| D-08 | Emoji (si se permite) | Comportamiento definido | `[ ]` | `[ ]` | — | — | — |

### 4.2 Datos de identidad y fechas

| ID | Checkpoint | Resultado |
|---|---|---|
| D-10 | DNI 7 y 8 dígitos ficticios (si ambos válidos) | `[ ]` |
| D-11 | DNI con puntos/guiones → normaliza o rechaza de forma consistente | `[ ]` |
| D-12 | Fecha futura / pasada en emisión (`issuedAt`) según reglas | `[ ]` |
| D-13 | `expiresAt` null vs fecha | `[ ]` |
| D-14 | Fecha de curso inválida (formato) | `[ ]` |
| D-15 | Orden de fechas coherente en UI y snapshot | `[ ]` |

### 4.3 Unicidad y reglas de negocio

| ID | Checkpoint | Resultado |
|---|---|---|
| D-20 | No dos certificados **vigentes** mismo alumno+curso | `[ ]` |
| D-21 | Revocado libera el slot para nueva emisión | `[ ]` |
| D-22 | Código de certificado único | `[ ]` |
| D-23 | Asistencia duplicada misma fecha+alumno → idempotente o error claro | `[ ]` |
| D-24 | Alumno inactivo no emite (si la regla existe) | `[ ]` |
| D-25 | Curso no certificable / inactivo no emite | `[ ]` |

### 4.4 Coherencia cross-capa (UI ↔ API ↔ DB)

Solo con acceso autorizado a DB staging/local. **No** copiar dumps.

| ID | Checkpoint | Resultado |
|---|---|---|
| D-30 | Tras crear alumno, fila en `cert_alumnos` (DNI cifrado/hash; UI máscara) | `[ ]` |
| D-31 | Tras emisión: `cert_certificados` + token hash/cifrado | `[ ]` |
| D-32 | Snapshot `cert_certificado_fechas` coincide con asistencias al emitir | `[ ]` |
| D-33 | Revocación: estado cert + token + `revocado_en` | `[ ]` |
| D-34 | Auditoría sin DNI/token completos | `[ ]` |

---

## 5. Estados de UI (carga / vacío / error / éxito)

Para cada feature marcar los cuatro estados:

| Feature | Carga | Vacío | Error | Éxito |
|---|---|---|---|---|
| Login | `[ ]` | — | `[ ]` | `[ ]` |
| Dashboard | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Cursos listado | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Curso detalle | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Alumnos listado | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Alumno detalle | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Asistencias hub | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Marcado asistencias | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Certificaciones listado | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Expediente | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Entrega manual | `[ ]` | — | `[ ]` | `[ ]` |
| Revocar | `[ ]` | — | `[ ]` | `[ ]` |
| Configuración | `[ ]` | — | `[ ]` | `[ ]` |
| Validación pública | `[ ]` | — | `[ ]` | `[ ]` |
| Not found | — | — | `[ ]` | — |

Cómo forzar (ideas):

- **Carga**: DevTools → Network → Slow 3G / throttling.  
- **Vacío**: DB/seed sin registros o filtros que no matchean.  
- **Error**: Offline, 500 simulado, token inválido, API caída.  
- **Éxito**: camino feliz.

---

## 6. Seguridad, privacidad y D0

### 6.1 Decisiones D0 (no negociables en QA)

| ID | Regla | Checkpoint | Resultado |
|---|---|---|---|
| SEC-01 | Token/QR permanente | Reenvío/entrega no rota URL | `[ ]` |
| SEC-02 | DNI completo solo en validación pública vigente | Visible en `/validar/…` vigente | `[ ]` |
| SEC-03 | Admin sin DNI completo | Listados/expediente/máscara | `[ ]` |
| SEC-04 | Logs/auditoría/errores sin DNI ni token completos | Revisar Network response admin + mensajes UI | `[ ]` |
| SEC-05 | Auth sesión + CSRF en mutaciones | POST sin CSRF falla; con sesión OK | `[ ]` |
| SEC-06 | `X-Admin-Key` no autoriza HTTP desde browser | Header inventado no abre admin | `[ ]` |

### 6.2 Controles adicionales

| ID | Checkpoint | Resultado |
|---|---|---|
| SEC-10 | Rutas `/admin/*` requieren sesión | `[ ]` |
| SEC-11 | CSRF presente en mutaciones (header/cookie pattern del producto) | `[ ]` |
| SEC-12 | No secretos en bundle frontend (buscar claves en Sources) | `[ ]` |
| SEC-13 | No `localStorage`/`sessionStorage` con tokens/sesión (salvo diseño explícito) | `[ ]` |
| SEC-14 | Headers de seguridad en descargas PDF/QR (`no-store`, `nosniff`, etc.) | `[ ]` |
| SEC-15 | Filename PDF/QR sanitizado (sin CRLF / path traversal) | `[ ]` |
| SEC-16 | Rate limit login | `[ ]` |
| SEC-17 | IDOR básico: no acceder a recurso admin de otro contexto manipulando `:id` sin auth | `[ ]` |
| SEC-18 | POST `/admin/certificados/{id}/reenviar` → 404 (fuera de MVP) | `[ ]` |

---

## 7. API / backend (manual con curl o DevTools)

Base: `…/certificados/api/` o staging equivalente. No pegar bodies con datos reales.

### 7.1 Públicos

| ID | Request | Esperado | Resultado |
|---|---|---|---|
| API-01 | `GET /health` | 200 | `[ ]` |
| API-02 | `GET /certificados/{token}/verificacion` vigente | 200 `valid:true`, DNI completo | `[ ]` |
| API-03 | Verificación revocado | no vigente / error de negocio | `[ ]` |
| API-04 | Token mal formado | 400 | `[ ]` |
| API-05 | Token inexistente bien formado | 404 controlado | `[ ]` |
| API-06 | `POST /certificados/consulta` mismo DTO que GET | `[ ]` | |

### 7.2 Admin (sesión + CSRF)

| ID | Acción | Esperado | Resultado |
|---|---|---|---|
| API-10 | Login / session / logout | 200 + cookie | `[ ]` |
| API-11 | Mutación sin CSRF | 403/419 según contrato | `[ ]` |
| API-12 | CRUD cursos | 2xx + listado | `[ ]` |
| API-13 | CRUD alumnos (DTO máscara) | sin DNI completo | `[ ]` |
| API-14 | Fechas + asistencias | OK | `[ ]` |
| API-15 | `POST /admin/certificados` | 201 + urls + tokenPrefix | `[ ]` |
| API-16 | `GET …/entrega-manual` | 200; no rota token | `[ ]` |
| API-17 | `GET …/pdf` | application/pdf | `[ ]` |
| API-18 | `GET …/qr.png` | image/png attachment | `[ ]` |
| API-19 | `POST …/revocar` | 200; luego verificación pública falla | `[ ]` |
| API-20 | Emisión duplicada vigente | 409 / error de negocio | `[ ]` |

---

## 8. Base de datos (checks manuales seguros)

Solo staging/local con seed ficticio. Registrar **qué** se verificó, no dumps.

| ID | Checkpoint | Resultado |
|---|---|---|
| DB-01 | Tablas `cert_*` esperadas presentes | `[ ]` |
| DB-02 | Migraciones aplicadas en orden (001…N) | `[ ]` |
| DB-03 | Prefijo `cert_` en tablas nuevas | `[ ]` |
| DB-04 | Token: hash + cifrado; no texto plano del token | `[ ]` |
| DB-05 | DNI alumno cifrado/hash; UI admin máscara | `[ ]` |
| DB-06 | Índice anti-duplicado vigente alumno+curso | `[ ]` |
| DB-07 | Soft-delete / anulación de asistencias coherente | `[ ]` |
| DB-08 | Eventos de auditoría sin PII completa | `[ ]` |

---

## 9. Responsive y layout

Viewports mínimos (DevTools):

| Ancho | Dispositivo guía |
|---|---|
| 360 | Android chico |
| 390 | iPhone estándar |
| 430 | iPhone grande |
| 768 | Tablet |
| 1024 | Laptop chico |
| 1280 / 1440 | Desktop |

### 9.1 Matriz por pantalla

Marcar PASS solo si: sin overflow horizontal, CTAs alcanzables, tablas→cards o scroll controlado, sidebar usable.

| Pantalla | 360 | 390 | 430 | 768 | 1024 | 1280+ |
|---|---|---|---|---|---|---|
| Login | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Dashboard | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Cursos | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Alumnos | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Asistencias | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Marcado | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Certificaciones | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Expediente | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Entrega / Revocar | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Configuración | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Validación pública | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Not found | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |

### 9.2 Extra layout

| ID | Checkpoint | Resultado |
|---|---|---|
| R-01 | Zoom 200 % usable | `[ ]` |
| R-02 | Orientación landscape móvil (login + validación) | `[ ]` |
| R-03 | Textos largos no rompen cards | `[ ]` |
| R-04 | Muchas fechas asistidas: lista scrolleable / no tapa CTAs | `[ ]` |

---

## 10. Accesibilidad (manual)

| ID | Checkpoint | Resultado |
|---|---|---|
| A-01 | Skip link a `#contenido` funciona | `[ ]` |
| A-02 | Tab / Shift+Tab recorre controles en orden lógico | `[ ]` |
| A-03 | Focus visible en botones, links, inputs | `[ ]` |
| A-04 | Enter activa botones/links enfocados | `[ ]` |
| A-05 | Escape cierra diálogos (entrega/revocar) | `[ ]` |
| A-06 | Labels asociados a inputs (click en label enfoca) | `[ ]` |
| A-07 | Errores anunciados (`role="alert"` / `aria-live`) | `[ ]` |
| A-08 | Contraste AA texto normal (≥ 4.5:1) spot-check | `[ ]` |
| A-09 | Imágenes decorativas sin alt ruidoso; QR con nombre útil | `[ ]` |
| A-10 | Reader básico (NVDA/Orca/VoiceOver): login + validación | `[ ]` |
| A-11 | No trampas de foco fuera de diálogos modales | `[ ]` |
| A-12 | Tablas con `<th scope>` / caption o equivalente | `[ ]` |

---

## 11. Compatibilidad de navegadores

| Navegador | Login | E2E corto | Validación | PDF/QR | Notas |
|---|---|---|---|---|---|
| Chrome estable | `[ ]` | `[ ]` | `[ ]` | `[ ]` | |
| Firefox | `[ ]` | `[ ]` | `[ ]` | `[ ]` | |
| Edge | `[ ]` | `[ ]` | `[ ]` | `[ ]` | |
| Safari (si hay Mac/iOS) | `[ ]` | `[ ]` | `[ ]` | `[ ]` | |
| Chrome Android | `[ ]` | `[ ]` | `[ ]` | `[ ]` | |
| Safari iOS | `[ ]` | `[ ]` | `[ ]` | `[ ]` | |

E2E corto = login → abrir certificación existente → entrega → validar link.

---

## 12. PDF, QR e impresión

| ID | Checkpoint | Resultado |
|---|---|---|
| P-01 | PDF horizontal A4 landscape legible | `[ ]` |
| P-02 | QR del PDF apunta a la URL pública correcta | `[ ]` |
| P-03 | Nombre alumno, curso, fechas, código correctos | `[ ]` |
| P-04 | Firmantes rector/a y asesor/a desde config (o fallback documentado) | `[ ]` |
| P-05 | DNI en PDF según decisión de producto (no contradecir D0) | `[ ]` |
| P-06 | QR PNG aislado escanea igual que el del PDF | `[ ]` |
| P-07 | Print CSS de validación/expediente no rompe layout | `[ ]` |
| P-08 | PDF stale / regeneración: tras cambio de contenido, descarga regenera o avisa | `[ ]` |
| P-09 | Tras regenerar, QR/URL **igual** | `[ ]` |

---

## 13. Staging, deploy y no-regresión operativa

### 13.1 Aislamiento

| ID | Checkpoint | Resultado |
|---|---|---|
| ST-01 | Staging en `/certificados_staging/` (o subdominio QA) | `[ ]` |
| ST-02 | Producción `/certificados/` intacta (no tocada en la pasada) | `[ ]` |
| ST-03 | Config fuera de webroot / Git | `[ ]` |
| ST-04 | DB staging ≠ producción | `[ ]` |
| ST-05 | Seed solo ficticio | `[ ]` |

### 13.2 Smoke remoto (P8-04)

| # | Paso | Resultado |
|---|---|---|
| 1 | Health | `[ ]` |
| 2 | Readiness (si existe) | `[ ]` |
| 3 | SPA | `[ ]` |
| 4 | Bloqueos internos | `[ ]` |
| 5 | Login | `[ ]` |
| 6 | Crear curso demo | `[ ]` |
| 7 | Crear alumno demo | `[ ]` |
| 8 | Fecha | `[ ]` |
| 9 | Asistencia | `[ ]` |
| 10 | Emisión | `[ ]` |
| 11 | Validación | `[ ]` |
| 12 | QR | `[ ]` |
| 13 | Modificar asistencia | `[ ]` |
| 14 | Misma URL/QR | `[ ]` |
| 15 | Revocación | `[ ]` |
| 16 | 404 unificado | `[ ]` |

### 13.3 Observabilidad segura

| ID | Checkpoint | Resultado |
|---|---|---|
| ST-10 | Logs de error sin DNI/token/claves | `[ ]` |
| ST-11 | Tras error forzado, UI muestra mensaje genérico útil | `[ ]` |

---

## 14. Rendimiento perceptivo y consola

| ID | Checkpoint | Resultado |
|---|---|---|
| PERF-01 | Login → dashboard < ~3 s en red normal | `[ ]` |
| PERF-02 | Listados no “congelan” la UI en seed chico | `[ ]` |
| PERF-03 | Validación pública: skeleton → resultado sin flash de contenido falso | `[ ]` |
| PERF-04 | Consola: 0 errores en camino feliz | `[ ]` |
| PERF-05 | Network: sin requests a hosts inesperados | `[ ]` |
| PERF-06 | Sin loops de polling agresivo visibles | `[ ]` |

---

## 15. Paridad visual (vs `muestra_pagina/`)

No exigir pixel-perfect; sí: jerarquía, folio, densidad, estados, CTAs.

| Pantalla | Paridad aceptable | Resultado | Gaps |
|---|---|---|---|
| Login | `[ ]` | `[ ]` | |
| Shell (topbar/sidebar) | `[ ]` | `[ ]` | |
| Dashboard | `[ ]` | `[ ]` | |
| Cursos list/detail | `[ ]` | `[ ]` | |
| Alumnos | `[ ]` | `[ ]` | |
| Asistencias / marcado | `[ ]` | `[ ]` | |
| Certificaciones / expediente | `[ ]` | `[ ]` | |
| Entrega / revocar | `[ ]` | `[ ]` | |
| Configuración | `[ ]` | `[ ]` | |
| Validación pública | `[ ]` | `[ ]` | |

---

## 16. Regresión rápida (15 minutos)

Usar cuando no hay tiempo para el documento completo:

```txt
[ ] Health 200
[ ] Login OK + logout OK
[ ] Abrir cursos / alumnos / asistencias / certificaciones (sin 500)
[ ] Abrir 1 expediente vigente
[ ] Copiar link entrega → validar en incógnito (DNI completo + fechas)
[ ] QR PNG descarga
[ ] Revocar en un cert de prueba → pública deja de validar
[ ] Consola limpia en el camino
[ ] Admin sin DNI completo
```

---

## 17. Registro de hallazgos

| ID | Sev | Pantalla / API | Pasos | Esperado | Obtenido | Entorno | Estado |
|---|---|---|---|---|---|---|---|
| H-001 | | | | | | | abierto / fijo |
| H-002 | | | | | | | |

---

## 18. Veredicto de la pasada

```txt
Entorno: ________________
Fecha: __________________
Tester(s): ______________

Conteo:  PASS ___  FAIL ___  BLOCKED ___  PARTIAL ___  N/A ___

P0 abiertos: ___
P1 abiertos: ___

Veredicto global:
[ ] PASS
[ ] PASS WITH WARNINGS
[ ] FAIL
[ ] BLOCKED

Listo para: [ ] solo local  [ ] staging  [ ] producción (si autorizada)
Firma / nota de cierre:
________________________________________________
```

---

## 19. Mapa rápido de rutas UI

| Ruta | Uso |
|---|---|
| `/admin/login` | Login |
| `/admin/dashboard` | Panel |
| `/admin/cursos` · `/nuevo` · `/:id` · `/:id/editar` | Cursos |
| `/admin/cursos/:id/fechas/:fechaId/asistencias` | Marcado |
| `/admin/alumnos` · `/nuevo` · `/:id` | Alumnos |
| `/admin/asistencias` | Hub asistencias |
| `/admin/certificaciones` · `/nueva` · `/:id` | Certificaciones |
| `/admin/certificaciones/:id/pdf` | Preview PDF |
| `/admin/certificaciones/:id/entrega` | Entrega manual |
| `/admin/certificaciones/:id/revocar` | Revocación |
| `/admin/configuracion` | Config institucional |
| `/validar/:tokenCertificacion` | Validación pública |

---

## 20. Relación con otros docs

| Doc | Relación |
|---|---|
| `docs/frontend/03-qa-manual-f3-04.md` | QA histórico F3-04 (parcial/bloqueado); este checklist lo supersede como pasada integral |
| `docs/frontend/verificacion-global-ciclos-1-13.md` | Smoke corto mock local |
| `docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md` | ALTO-C / P8-04 / P8-05 |
| `docs/backend/01-contrato-api-certificados.md` | Contrato API |
| `muestra_pagina/` | Referencia visual (no ejecutar) |

---

**Fin del checklist.** Completar por entorno; una pasada local mock no acredita staging ni producción.
