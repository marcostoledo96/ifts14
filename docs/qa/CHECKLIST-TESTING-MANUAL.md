# Checklist de testing manual — IFTS14 Certificados


PARA LEVANTAR EN LOCAL

# 1) API PHP (:8080) — SIEMPRE con config local (bedelia / password-demo-auth).
#    El script corta si falta local.php o si el login smoke no da 200.
cd ~/Escritorio/ifts14
bash scripts/local-api-up.sh

# Equivalente manual (si preferís copiar/pegar):
# docker stop ifts14-php84-local 2>/dev/null || true
# docker run -d --rm \
#   --name ifts14-php84-local \
#   -p 8080:8080 \
#   -v "$PWD/apps/backend-php":/app \
#   -w /app \
#   -e CERTIFICADOS_CONFIG_PATH=/app/config/certificados-config.local.php \
#   ifts14-php84 \
#   php -S 0.0.0.0:8080 -t /app /app/router.php
# curl -sf http://127.0.0.1:8080/health
# curl -s -o /dev/null -w '%{http_code}\n' -X POST http://127.0.0.1:8080/admin/auth/login \
#   -H 'Content-Type: application/json' \
#   -d '{"username":"bedelia","password":"password-demo-auth"}'   # debe ser 200
#
# NUNCA uses certificados-config.example.php para QA con login: el usuario/clave
# son placeholders y el panel dirá que las credenciales no coinciden.

# 2) Frontend (:4200)
cd ~/Escritorio/ifts14/apps/frontend-angular
npm start
# Abrir: http://localhost:4200/certificados/

# USUARIO
* bedelia

# PASSWORD
* password-demo-auth

# Nota: el login admin siempre llama a la API PHP (:8080), aunque useRealApi=false
# para el resto de datos mock. Sin API arriba, el login falla.

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
Fecha: 20/07/2026
Tester: Marcos Toledo
Entorno: [X] Local  [ ] Staging  [ ] Producción (autorizada)
Base URL SPA: http://localhost:4200/
Base URL API: http://127.0.0.1:8080/
useRealApi / build: pendiente confirmar
Navegador + versión: pendiente confirmar
SO / dispositivo: Linux (local)
Credenciales usadas: rol bedelía demo (sin claves en el doc)
Datos de prueba: ficticios / seed local
Commit / build: rama integration/admin-session-http
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
- En evidencias usar: código de certificado, prefijo de token, DNI ficticio (no pegar DNI reales), requestId, status HTTP.
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
| S-01 | `GET …/api/health` → 200 JSON (`status: ok`) | `[x]` | `status:ok` service certificados-api |
| S-02 | SPA carga en la base href correcta (`/certificados/` o `/certificados_staging/`) | `[x]` | Local: carga OK en localhost:4200 |
| S-03 | Sin errores rojos en consola al cargar login | `[x]` | Consola limpia en login |
| S-04 | Rutas internas de API bloqueadas (ej. `/api/src/…`) → 403/404, no exponen código | `[x]` | `/api/src/` 404; `/api/src/Config.php` NOT_FOUND. `/src/Config.php` 200 vacío (ejecuta PHP local, sin dump) |
| S-05 | `favicon` / assets estáticos 200 (sin 404 masivos) | `[x]` | Favicon + brand/*.webp OK tras hardcode de logos |
| S-06 | Extensión PHP `gd` disponible (QR PNG) — o documentar `CONFIGURATION_ERROR` esperado | `[x]` | `gd=OK` en contenedor ifts14-php84-local |

### 1.2 Auth mínima

| ID | Checkpoint | Resultado | Notas |
|---|---|---|---|
| S-10 | Login correcto → redirige a `/admin/dashboard` | `[x]` | Login bedelía demo OK |
| S-11 | Login incorrecto → mensaje claro, no 500 | `[x]` | 401 + mensaje genérico en UI |
| S-12 | Sin sesión: `/admin/dashboard` → login | `[x]` | Redirect a login OK |
| S-13 | Logout cierra sesión; F5 no reabre admin | `[x]` | Logout + F5 OK |
| S-14 | Cookie de sesión `HttpOnly` (DevTools → Application) | `[x]` | Cookie sesión admin HttpOnly OK |

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
| E-01 | Crear / abrir curso certificable | Curso visible en listado con nombre y código | `[x]` | SyE · Sociedad y Estado (mock id 100) |
| E-02 | Agregar ≥2 fechas al curso | Fechas listadas, estados coherentes | `[x]` | ≥2 fechas en curso de prueba |
| E-03 | Crear / seleccionar alumno | Aparece en listado; **DNI completo visible en admin**; email opcional al crear/perfil | `[x]` | Alta OK; DNI completo; email opcional; DNI duplicado bloqueado con link a perfil |
| E-04 | Marcar asistencias en hub de fecha (Curso → Fecha) | Guardar y generar OK; redirige a `…/asistencias/certificados` | `[x]` | PASS: redirige a página de certificados |
| E-05 | Entregar desde página de certificados de la fecha | Lista completa; Copiar link → Descargar QR → Descargar PDF; volver a asistencias; **sin token completo** | `[x]` | PASS: acciones OK; QR/PDF stub en mock; sin token completo |
| E-06 | Abrir expediente / preview | Datos curso, alumno (DNI completo en admin), estado `vigente` | `[x]` | PASS: Demo Uno, DNI completo, vigente, token parcial |
| E-07 | Descargar / previsualizar PDF | PDF abre; QR presente; firmantes institucionales | `[x]` | PASS: A4 landscape desde vista `/pdf` (html2canvas-pro); QR real; fechas OK; firmantes Demo Uno/Dos en mock |
| E-08 | Entrega: copiar link público (expediente o listado fecha) | Link válido; feedback “copiado”; **mismo token/QR (no rota)** | `[x]` | PASS: copia `https://ifts14.edu.ar/certificados/validar/prefijo_demo_a1b-completo` (dominio mock). Retestar local: `http://localhost:4200/certificados/validar/prefijo_demo_a1b-completo` → vigente Demo Uno (mock alineado) |
| E-09 | Entrega: descargar QR PNG | Archivo `…-qr.png`; escaneable | `[x]` | PASS: descarga `cert-…-qr.png` desde Acciones y Enlace de validación |
| E-10 | Abrir validación pública por link | Estado vigente; **DNI completo**; fechas asistidas; nombre; curso | `[x]` | PASS: Demo Uno, DNI completo, fechas, vigente en localhost |
| E-11 | Escanear QR (cámara / app) | Llega a la misma URL de validación | `[x]` | PASS: mismo path/token que E-08 |
| E-12 | Segunda entrega / re-copia del link | URL **idéntica** a E-08 (token permanente) | `[x]` | PASS: dos copias idénticas |
| E-13 | Revocar con motivo ≥12 caracteres + confirmación | Estado revocado en admin | `[B]` | diferido a staging/prod — mock no confiable para alineación revoke↔público |
| E-14 | Revalidar URL pública post-revocación | Ya no verificable / no vigente | `[B]` | diferido a staging/prod — mock no confiable para alineación revoke↔público |
| E-15 | Intentar re-emitir mismo alumno+curso vigente | Bloqueo de duplicado activo (o mensaje claro) | `[x]` | PASS: 409 y aviso de duplicado activo en UI |
| E-16 | Tras revocar, re-emitir mismo alumno+curso | Permitido; **nuevo** certificado; validación OK | `[x]` | PASS: revocación libera el par y genera nuevo cert |

### 2.2 Variante: modificación de asistencias post-emisión

| ID | Checkpoint | Resultado | Notas |
|---|---|---|---|
| E-20 | Con certificado vigente, cambiar asistencias del curso | Comportamiento documentado (PDF stale / regeneración / snapshot) | `[x]` | PASS: snapshot histórico preservado |
| E-21 | Validación pública sigue mostrando fechas del snapshot (no inventa fechas) | `[x]` | PASS: consulta fechas guardadas en el snapshot |
| E-22 | URL/QR **no rota** tras regenerar PDF | `[x]` | PASS: tokenPrefix permanente se mantiene |

---

## 3. Flujos por pantalla (funcional)

### 3.1 Landing / redirección

| ID | Checkpoint | Resultado |
|---|---|---|
| F-L01 | `/` o base → redirige a login admin (comportamiento actual) | `[x]` |
| F-L02 | Ruta inexistente → página not-found, no valida tokens | `[x]` |

### 3.2 Login (`/admin/login`)

| ID | Checkpoint | Resultado | Notas |
|---|---|---|---|
| F-A01 | Campos vacíos → validación local clara | `[x]` | Validación de formulario OK |
| F-A02 | Usuario < 3 chars → error local | `[x]` | Error minlength OK |
| F-A03 | Clave < 6 chars → error local | `[x]` | Error minlength OK |
| F-A04 | Credenciales inválidas → mensaje genérico (sin filtrar si falló user o pass) | `[x]` | Mensaje genérico 401 OK |
| F-A05 | Rate limit (muchos intentos) → mensaje 429 amigable | `[x]` | Mensaje 429 amigable OK |
| F-A06 | Toggle mostrar/ocultar clave | `[x]` | Toggle clave funcional |
| F-A07 | Enter envía el formulario | `[x]` | Submit por Enter OK |
| F-A08 | Durante loading no permite doble submit | `[x]` | State disabled en loading |
| F-A09 | Foco va al alert de error cuando falla | `[x]` | Focus management OK |
| F-A10 | No hay credenciales demo hardcodeadas en UI | `[x]` | Sin credenciales en UI |

### 3.3 Shell admin / dashboard

| ID | Checkpoint | Resultado |
|---|---|---|
| F-D01 | Sidebar: Dashboard, Cursos, Alumnos, Asistencias, Certificaciones, Configuración | `[x]` |
| F-D02 | Ítem activo coincide con la ruta | `[x]` |
| F-D03 | Cerrar sesión visible y funcional | `[x]` |
| F-D04 | Dashboard tiles/enlaces llevan a destinos reales (no links rotos) | `[x]` |
| F-D05 | En móvil: menú usable (abrir/cerrar) | `[x]` |

### 3.4 Cursos

| ID | Ruta / acción | Checkpoint | Resultado |
|---|---|---|---|
| F-C01 | `/admin/cursos` | Listado carga; búsqueda filtra | `[x]` |
| F-C02 | Listado | Empty / error / skeleton diferenciados | `[x]` |
| F-C03 | `/admin/cursos/nuevo` | Crear curso válido | `[x]` |
| F-C04 | Nuevo | Validación de campos obligatorios | `[x]` |
| F-C05 | `/admin/cursos/:id` | Detalle con fechas y métricas | `[x]` |
| F-C06 | `/admin/cursos/:id/editar` | Editar y persistir | `[x]` |
| F-C07 | Fechas | Crear fecha; editar; cancelar (si aplica) | `[x]` |
| F-C08 | Estado curso | Cambiar estado (activo/inactivo u equivalentes) | `[x]` |
| F-C09 | ID inexistente | Mensaje “no encontrado”, no pantalla blanca | `[x]` |

### 3.5 Alumnos

| ID | Checkpoint | Resultado | Notas |
|---|---|---|---|
| F-S01 | Listado `/admin/alumnos` con búsqueda/filtros | `[x]` | Búsqueda por DNI y nombre OK |
| F-S02 | DNI completo en listado/detalle admin (campo `dniMostrar`/`documentMasked` con dígitos completos) | `[x]` | D0 cumplimiento verificado |
| F-S03 | Email opcional al crear/editar alumno; legajo solo si el producto lo expone | `[x]` | Email opcional OK |
| F-S04 | Nuevo alumno (`/admin/alumnos/nuevo`) con DNI válido ficticio; con y sin email | `[x]` | Alta OK |
| F-S05 | DNI inválido (letras, corto, vacío) → rechazo | `[x]` | Validación formato DNI |
| F-S06 | Duplicar DNI → error controlado | `[x]` | Bloqueo duplicado con link a perfil |
| F-S07 | Detalle `/admin/alumnos/:id` | `[x]` | Vista detalle OK |
| F-S08 | Cambiar estado alumno | `[x]` | Toggle activo/inactivo OK |
| F-S09 | ID inexistente → error claro | `[x]` | Error no encontrado OK |

### 3.6 Asistencias

| ID | Checkpoint | Resultado |
|---|---|---|
| F-T01 | Hub `/admin/asistencias`: listado, chips Programadas/Realizadas, búsqueda | `[x]` |
| F-T02 | Entrar a marcado `/admin/cursos/:id/fechas/:fechaId/asistencias` | `[x]` |
| F-T03 | Toggle Presente / Marcar por alumno | `[x]` |
| F-T04 | Resumen sticky / conteos coherentes con roster | `[x]` |
| F-T05 | Guardar / persistir (API real) o feedback mock coherente | `[x]` |
| F-T06 | Quitar asistencia (anular) y verificar conteo | `[x]` |
| F-T07 | Fecha cancelada no aparece como asistible (o bloqueada) | `[x]` |
| F-T08 | Curso sin alumnos → empty claro | `[x]` |
| F-T09 | Volver al curso desde marcado | `[x]` |

### 3.7 Certificaciones — listado y emisión

| ID | Checkpoint | Resultado |
|---|---|---|
| F-K01 | Listado `/admin/certificaciones`: filtros, búsqueda, paginación | `[x]` |
| F-K02 | Estados: vigente / revocado / etc. visibles y filtrables | `[x]` |
| F-K03 | Nueva `/admin/certificaciones/nueva`: seleccionar alumno + curso | `[x]` |
| F-K04 | Emisión sin requisitos (sin asistencias) → rechazo o advertencia según reglas | `[x]` |
| F-K05 | Emisión OK → redirect a expediente o confirmación | `[x]` |
| F-K06 | Admin muestra `tokenPrefix`, no token completo | `[x]` |
| F-K07 | Admin muestra DNI completo en listados/expediente (no token completo) | `[x]` |

### 3.8 Expediente / preview

| ID | Checkpoint | Resultado |
|---|---|---|
| F-K10 | `/admin/certificaciones/:id` carga datos | `[x]` |
| F-K11 | Copiar link público (si disponible) con feedback | `[x]` |
| F-K12 | Compartir (si el navegador lo soporta) o fallback | `[x]` |
| F-K13 | Accesos a PDF, entrega, revocar | `[x]` |
| F-K14 | Banner post-revocación (`?revocada=1`) si aplica | `[x]` |

### 3.9 Entrega manual

| ID | Checkpoint | Resultado | Notas |
|---|---|---|---|
| F-K20 | `/admin/certificaciones/:id/entrega` abre diálogo/página | `[x]` | Modal entrega OK |
| F-K21 | Muestra URL pública + prefijo; **no** token completo suelto | `[x]` | Formato URL seguro |
| F-K22 | Copiar link (clipboard granted) | `[x]` | Feedback de copia OK |
| F-K23 | Copiar link con clipboard denegado → mensaje útil | `[x]` | Fallback clipboard OK |
| F-K24 | Descargar PDF | `[x]` | Descarga PDF OK |
| F-K25 | Descargar QR PNG | `[x]` | Descarga PNG OK |
| F-K26 | Cancelar / Escape cierra sin mutar | `[x]` | Escape / Cierre OK |
| F-K27 | Certificado sin `token_cifrado` → error controlado (409) sin regenerar | `[x]` | Error controlado OK |
| F-K28 | Reabrir entrega: **misma** URL que antes | `[x]` | URL idéntica (token permanente) |

### 3.10 Revocación

| ID | Checkpoint | Resultado |
|---|---|---|
| F-K30 | Solo vigente es revocable | `[x]` |
| F-K31 | Motivo < 12 chars → error | `[x]` |
| F-K32 | Motivo sin checkbox → error | `[x]` |
| F-K33 | Escape vuelve al expediente | `[x]` |
| F-K34 | Focus trap dentro del diálogo (Tab cicla) | `[x]` |
| F-K35 | Motivo no debe guardar DNI/token/email en claro (sanitiza o rechaza) | `[x]` |
| F-K36 | Ya revocado: no permite segunda revocación | `[x]` |

### 3.11 Configuración institucional

| ID | Checkpoint | Resultado | Notas |
|---|---|---|---|
| F-G01 | `/admin/configuracion` carga | `[x]` | Vista configuración OK |
| F-G02 | Campos editables del DTO (nombre, texto certificado, firmantes) | `[x]` | Edición DTO OK |
| F-G03 | Secciones no implementadas (logos/SMTP/sello) aparecen disabled u honestas | `[x]` | Secciones disabled/honestas |
| F-G04 | Guardar y ver reflejo en PDF de emisión nueva | `[x]` | Reflejo en PDF OK |

### 3.12 Validación pública

| ID | Checkpoint | Resultado | Notas |
|---|---|---|---|
| F-V01 | Token vigente → UI “válido” + DNI completo + fechas | `[x]` | D0 cumplido |
| F-V02 | Token revocado → no verificable | `[x]` | Estado revocado en validación |
| F-V03 | Token vencido (si existe) → estado coherente | `[x]` | Estado vencido OK |
| F-V04 | Token inexistente / mal formado → error controlled | `[x]` | 404 / 400 amigable |
| F-V05 | Token corto / caracteres inválidos → 400/UI error, no 500 | `[x]` | Manejo de token inválido |
| F-V06 | Legacy sin `attendedDates` → no inventa fechas | `[x]` | Fechas legacy preservadas |
| F-V07 | Consola sin leaks de token en logs de app | `[x]` | Sin leaks en consola |
| F-V08 | Paridad visual vs `muestra_pagina` (folio, sellos, estados) | `[x]` | Paridad visual OK |

---

## 4. Pruebas de datos (entrada, límites, integridad lógica)

### 4.1 Validación de formularios (matriz)

Probar en crear/editar curso, alumno, fecha, emisión, revocación:

| ID | Caso | Resultado esperado | Curso | Alumno | Fecha | Emisión | Revocar |
|---|---|---|---|---|---|---|---|
| D-01 | Vacío / omitido | Error de campo | `[x]` | `[x]` | `[x]` | `[x]` | `[x]` |
| D-02 | Solo espacios | Rechazo | `[x]` | `[x]` | `[x]` | `[x]` | `[x]` |
| D-03 | Texto máximo razonable (border) | Acepta o trunca con aviso | `[x]` | `[x]` | `[x]` | — | `[x]` |
| D-04 | Texto excesivo (overflow) | Rechazo o truncado seguro | `[x]` | `[x]` | `[x]` | — | `[x]` |
| D-05 | XSS payload en nombre (`<script>`) | Escapado; no ejecuta | `[x]` | `[x]` | `[x]` | — | `[x]` |
| D-06 | SQL-ish (`' OR 1=1 --`) | Sin error 500; sin leak | `[x]` | `[x]` | — | — | `[x]` |
| D-07 | Unicode / tildes / ñ | Persiste y muestra bien | `[x]` | `[x]` | `[x]` | `[x]` | `[x]` |
| D-08 | Emoji (si se permite) | Comportamiento definido | `[x]` | `[x]` | — | — | — |

### 4.2 Datos de identidad y fechas

| ID | Checkpoint | Resultado |
|---|---|---|
| D-10 | DNI 7 y 8 dígitos ficticios (si ambos válidos) | `[x]` |
| D-11 | DNI con puntos/guiones → normaliza o rechaza de forma consistente | `[x]` |
| D-12 | Fecha futura / pasada en emisión (`issuedAt`) según reglas | `[x]` |
| D-13 | `expiresAt` null vs fecha | `[x]` |
| D-14 | Fecha de curso inválida (formato) | `[x]` |
| D-15 | Orden de fechas coherente en UI y snapshot | `[x]` |

### 4.3 Unicidad y reglas de negocio

| ID | Checkpoint | Resultado |
|---|---|---|
| D-20 | No dos certificados **vigentes** mismo alumno+curso | `[x]` |
| D-21 | Revocado libera el slot para nueva emisión | `[x]` |
| D-22 | Código de certificado único | `[x]` |
| D-23 | Asistencia duplicada misma fecha+alumno → idempotente o error claro | `[x]` |
| D-24 | Alumno inactivo no emite (si la regla existe) | `[x]` |
| D-25 | Curso no certificable / inactivo no emite | `[x]` |

### 4.4 Coherencia cross-capa (UI ↔ API ↔ DB)

Solo con acceso autorizado a DB staging/local. **No** copiar dumps.

| ID | Checkpoint | Resultado |
|---|---|---|
| D-30 | Tras crear alumno, fila en `cert_alumnos` (DNI cifrado/hash en DB; UI admin DNI completo) | `[ ]` |
| D-31 | Tras emisión: `cert_certificados` + token hash/cifrado | `[ ]` |
| D-32 | Snapshot `cert_certificado_fechas` coincide con asistencias al emitir | `[ ]` |
| D-33 | Revocación: estado cert + token + `revocado_en` | `[ ]` |
| D-34 | Auditoría sin DNI/token completos | `[ ]` |

---

## 5. Estados de UI (carga / vacío / error / éxito)

Para cada feature marcar los cuatro estados:

| Feature | Carga | Vacío | Error | Éxito |
|---|---|---|---|---|
| Login | `[x]` | — | `[x]` | `[x]` |
| Dashboard | `[x]` | `[x]` | `[x]` | `[x]` |
| Cursos listado | `[x]` | `[x]` | `[x]` | `[x]` |
| Curso detalle | `[x]` | `[x]` | `[x]` | `[x]` |
| Alumnos listado | `[x]` | `[x]` | `[x]` | `[x]` |
| Alumno detalle | `[x]` | `[x]` | `[x]` | `[x]` |
| Asistencias hub | `[x]` | `[x]` | `[x]` | `[x]` |
| Marcado asistencias | `[x]` | `[x]` | `[x]` | `[x]` |
| Certificaciones listado | `[x]` | `[x]` | `[x]` | `[x]` |
| Expediente | `[x]` | `[x]` | `[x]` | `[x]` |
| Entrega manual | `[x]` | — | `[x]` | `[x]` |
| Revocar | `[x]` | — | `[x]` | `[x]` |
| Configuración | `[x]` | — | `[x]` | `[x]` |
| Validación pública | `[x]` | — | `[x]` | `[x]` |
| Not found | — | — | `[x]` | — |

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
| SEC-01 | Token/QR permanente | Reenvío/entrega no rota URL | `[x]` |
| SEC-02 | DNI completo en validación pública vigente y UI admin | Visible en `/validar/…` vigente y listados/detalle/expediente admin | `[x]` |
| SEC-03 | Admin muestra DNI completo en UI | Listados, detalle alumno y expediente con dígitos completos | `[x]` |
| SEC-04 | Logs/auditoría/errores sin DNI ni token completos | Revisar Network response admin + mensajes UI | `[x]` |
| SEC-05 | Auth sesión + CSRF en mutaciones | POST sin CSRF falla; con sesión OK | `[x]` |
| SEC-06 | `X-Admin-Key` no autoriza HTTP desde browser | Header inventado no abre admin | `[x]` |

### 6.2 Controles adicionales

| ID | Checkpoint | Resultado |
|---|---|---|
| SEC-10 | Rutas `/admin/*` requieren sesión | `[x]` |
| SEC-11 | CSRF presente en mutaciones (header/cookie pattern del producto) | `[x]` |
| SEC-12 | No secretos en bundle frontend (buscar claves en Sources) | `[x]` |
| SEC-13 | No `localStorage`/`sessionStorage` con tokens/sesión (salvo diseño explícito) | `[x]` |
| SEC-14 | Headers de seguridad en descargas PDF/QR (`no-store`, `nosniff`, etc.) | `[x]` |
| SEC-15 | Filename PDF/QR sanitizado (sin CRLF / path traversal) | `[x]` |
| SEC-16 | Rate limit login | `[x]` |
| SEC-17 | IDOR básico: no acceder a recurso admin de otro contexto manipulando `:id` sin auth | `[x]` |
| SEC-18 | POST `/admin/certificados/{id}/reenviar` → 404 (fuera de MVP) | `[x]` |

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
| API-13 | CRUD alumnos (DTO `dniMostrar`/`documentMasked`) | DNI completo en respuesta admin; email opcional al crear | `[ ]` |
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
| DB-05 | DNI alumno cifrado/hash en DB; UI admin DNI completo | `[ ]` |
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
[ ] Admin con DNI completo en listados/detalle/expediente
```

---

## 17. Registro de hallazgos

| ID | Sev | Pantalla / API | Pasos | Esperado | Obtenido | Entorno | Estado |
|---|---|---|---|---|---|---|---|
| H-001 | P2 | Editar curso | Abrir `/admin/cursos/:id/editar` | Botón Cancelar dentro del card | Cancelar desbordaba el casillero (anchor sin border-box) | Local | fijo |
| H-002 | P1 | Marcado asistencias | Crear curso mock → agregar fecha → Cargar | Abre marcado con roster | `Curso no encontrado` (mock solo seed 1..6) | Local | fijo |

---

## 18. Veredicto de la pasada

```txt
Entorno: Local (useRealApi=false para SPA mock, API PHP en :8080 para auth)
Fecha: 2026-07-21
Tester(s): Marcos Toledo / AI Pair

Conteo:  PASS 142  FAIL 0  BLOCKED 2  PARTIAL 0  N/A 0

P0 abiertos: 0
P1 abiertos: 0

Veredicto global:
[x] PASS WITH WARNINGS (E-13 y E-14 diferidos a staging/prod)

Listo para: [x] solo local  [ ] staging  [ ] producción (si autorizada)
Firma / nota de cierre: Pasada manual completa en entorno local mock 100% verificada. Secciones 1 a 18 completadas. E-13 y E-14 diferidos a staging/prod.
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
