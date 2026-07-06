# Prompts para Google Stitch y v0 — IFTS N.° 14 Certificaciones QR

> Versión unificada y actualizada: integra el archivo original de prompts y la revisión posterior. Incluye Angular 20 + Tailwind, rutas finales bajo `/certificados/`, regla de asistencias solo presentes, certificado real como referencia y firmantes desde Configuración institucional.

Este markdown reúne prompts listos para usar en dos pasos:

1. **Google Stitch**: explorar dirección visual, composición e identidad.
2. **v0**: tomar la captura elegida de Stitch como referencia, mejorarla con criterio visual y convertirla en una pantalla más prolija, codificable y portable a Angular 20 + Tailwind.

El objetivo es evitar resultados genéricos de IA y mantener una identidad propia para el sistema del **IFTS N.° 14**.


## Cambios unificados en esta versión

Esta versión integra el archivo original de prompts y la revisión posterior. Los cambios principales ya aplicados son:

- actualización a **Angular 20 + Tailwind**;
- aclaración de rutas finales bajo `/certificados/`;
- modelo de asistencias basado solo en **presentes**, sin ausente/justificada/porcentaje;
- emisión y detalle de certificaciones conectados visualmente con el certificado real del IFTS 14;
- firmantes, cargos, logos, firmas digitales y textos base movidos a **Configuración institucional**;
- prompts 10, 11, 12 y 22 actualizados;
- ajustes en entrega manual y carga masiva para mantener QR permanente y evitar estados múltiples. El MVP no envía emails: Bedelía copia el link público y descarga el PDF por canal externo.

---

---

## 0. Contexto común del sistema

Usá este contexto como base mental para todos los prompts.

```txt
Sistema: certificaciones QR para el IFTS N.° 14.

El sistema permite certificar asistencias de alumnos a cursos. Cada curso tiene varias fechas. Cada alumno puede haber asistido a algunas fechas del curso. La certificación pública muestra únicamente las fechas en las que ese alumno estuvo presente.

Decisiones confirmadas:
- No hay edición/cohorte en el MVP.
- Cada certificación corresponde a alumno + curso + asistencias presentes.
- Solo existe link público por certificación: /validar/:tokenCertificacion.
- No hay perfil público del alumno.
- El DNI completo se muestra públicamente.
- El QR/token de certificación es permanente.
- Si se corrigen fechas o asistencias, se mantiene el mismo QR.
- Si se corrigen datos de una certificación ya emitida, Bedelía realiza una nueva entrega manual (copiar link / descargar PDF) por canal externo; el QR no cambia.
- No hay borrador: la certificación se emite y queda disponible para entrega manual. El sistema NO envía emails (sin SMTP, sin PHPMailer, sin "reenviar").
- El admin lo usará principalmente Bedelía desde PC/notebook.
- Frontend final: Angular 20 + Tailwind.
- Stitch/v0 se usan para diseño visual; luego se porta a Angular 20.
- El módulo final vivirá dentro de /certificados/.
- Ruta conceptual pública: /validar/:tokenCertificacion.
- URL final esperada en producción: /certificados/validar/:tokenCertificacion.
- Rutas admin conceptuales: /admin/...
- Rutas admin finales esperadas: /certificados/admin/...

Datos institucionales globales:
- nombres y cargos de autoridades firmantes;
- firmas digitales;
- logos institucionales;
- texto base del certificado;
- numeración o formato de certificado.

Estos datos no se editan en cada emisión. Se configuran en Configuración institucional.
```

---

## 1. Dirección visual general

### Público

```txt
Folio técnico institucional / acta académica verificable.

Debe sentirse como:
- documento oficial digital;
- validación documental;
- registro de asistencia;
- trazabilidad QR;
- portal institucional técnico.

No debe sentirse como:
- SaaS;
- fintech;
- landing comercial;
- dashboard;
- plantilla shadcn genérica;
- pantalla genérica de IA.
```

### Admin

```txt
Mesa de trabajo de Bedelía / archivo institucional digital.

Debe sentirse como:
- sistema administrativo institucional;
- herramienta diaria de Bedelía;
- archivo documental;
- gestión académica clara;
- panel operativo sobrio.

No debe sentirse como:
- dashboard de métricas SaaS;
- CRM comercial;
- panel de startup;
- app fintech;
- demo visual excesiva.
```

---

## 2. Paleta y reglas anti-cliché

```txt
Paleta:
- Azul noche institucional: #0B1F33
- Azul técnico: #1565C0
- Cian circuito: #00A8C6
- Verde validación: #2E7D32
- Verde suave: #E8F5E9
- Gris papel: #F5F7FA
- Gris texto: #263238
- Blanco: #FFFFFF
- Ámbar advertencia: #F9A825
- Rojo revocado: #C62828

Tipografía:
- Sans serif sobria.
- Monoespaciada o números tabulares solo para DNI, códigos, tokens y números de certificado.
- No usar tracking excesivo.
- No poner todo en uppercase.

Evitar:
- glassmorphism;
- blobs;
- gradientes genéricos;
- sombras grandes;
- emojis;
- hero SaaS centrado;
- cards blancas repetidas;
- badges genéricos;
- íconos decorativos en cada bloque;
- estética fintech;
- estética dashboard comercial.

Usar:
- folios;
- sellos institucionales temporales;
- bandas de estado;
- líneas finas;
- tabla/lista de asistencia sobria;
- zona de trazabilidad QR;
- textura mínima tipo papel técnico;
- composición documental.
```

---

## 3. Orden recomendado de generación

```txt
1. Validación pública válida.
2. Validación pública no exitosa: revocada / no encontrada / error técnico.
3. Login administrativo.
4. Dashboard admin — Mesa de trabajo de Bedelía.
5. Crear / editar curso con fechas.
6. Registrar asistencias presentes.
7. Emitir certificación directa.
8. Detalle de certificación.
9. Vista previa PDF complementario.
10. Listado de cursos.
11. Detalle de curso.
12. Listado de certificaciones.
13. Entrega manual de certificación.
14. Revocar certificación.
15. Listado de alumnos.
16. Detalle de alumno administrativo.
17. Carga masiva placeholder.
18. Auditoría básica.
19. Configuración institucional.
```

Para una demo de avance, el mínimo recomendable es:

```txt
1. Validación pública válida.
2. Login administrativo.
3. Dashboard admin.
4. Crear / editar curso con fechas.
5. Registrar asistencias presentes.
6. Emitir certificación directa.
7. Detalle de certificación con QR.
8. Vista previa PDF.
```

> Nota: la numeración interna de este documento conserva las secciones históricas `4` a `22`, pero el orden operativo recomendado para generar pantallas es el listado anterior.

## 3.1. Modo flexible para v0 con skills

Usá este criterio en todos los prompts de v0.

```txt
La captura de Google Stitch es una referencia visual, no una maqueta rígida.

v0 puede mejorar:
- composición;
- jerarquía;
- responsive;
- accesibilidad;
- espaciado;
- densidad;
- tratamiento visual;
- microcopy;
- organización de secciones;
- sistema de estados;
- consistencia con la identidad IFTS 14.

v0 no puede cambiar:
- alcance funcional confirmado;
- rutas conceptuales;
- datos obligatorios;
- reglas de privacidad;
- decisiones del MVP;
- ausencia de perfil público del alumno;
- QR permanente;
- DNI completo visible en validación pública.

Si las skills disponibles sugieren una solución más clara, moderna, institucional o usable que la captura de Stitch, v0 debe mejorarla y explicar brevemente la decisión.

El objetivo no es copiar Stitch: es usar Stitch como punto de partida y producir una interfaz final mejor.
```

## 3.2. Mapa de rutas conceptuales y rutas finales

Usá las rutas conceptuales en Stitch/v0 para mantener los prompts claros. Al portar a Angular 20, recordar que el módulo final vive en `/certificados/`.

| Tipo | Ruta conceptual | Ruta final esperada |
|---|---|---|
| Validación pública | `/validar/:tokenCertificacion` | `/certificados/validar/:tokenCertificacion` |
| Login admin | `/admin/login` | `/certificados/admin/login` |
| Dashboard admin | `/admin/dashboard` | `/certificados/admin/dashboard` |
| Cursos | `/admin/cursos` | `/certificados/admin/cursos` |
| Curso detalle | `/admin/cursos/:id` | `/certificados/admin/cursos/:id` |
| Asistencias | `/admin/cursos/:id/asistencias` | `/certificados/admin/cursos/:id/asistencias` |
| Nueva certificación | `/admin/certificaciones/nueva` | `/certificados/admin/certificaciones/nueva` |
| Detalle certificación | `/admin/certificaciones/:id` | `/certificados/admin/certificaciones/:id` |
| Configuración | `/admin/configuracion` | `/certificados/admin/configuracion` |


---

# PARTE A — Pantallas públicas

---

## 4. Validación pública válida

### Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para una pantalla pública de validación válida de certificación del IFTS N.° 14.

Contexto:
El IFTS N.° 14 es un instituto terciario técnico. El sistema valida certificaciones de cursos mediante QR. Cada certificación corresponde a un alumno, un curso y las fechas en las que ese alumno estuvo presente.

Ruta conceptual:
/validar/:tokenCertificacion

Objetivo:
Una persona externa escanea un QR o abre un link y necesita verificar si una certificación es auténtica. La pantalla debe transmitir confianza, seriedad institucional y claridad documental.

Dirección visual:
Debe sentirse como un folio técnico institucional o acta académica verificable, no como una app SaaS. Debe parecer una página oficial de validación documental.

Generá 3 direcciones visuales:
1. Folio documental institucional.
2. Acta técnica de validación académica.
3. Registro verificable con zona de trazabilidad QR.

Contenido obligatorio:
- Header institucional con “IFTS N.° 14”.
- Subtítulo: “Validación oficial de certificados”.
- Placeholder sobrio para logo institucional, tipo sello o monograma temporal.
- Estado principal: “Certificación válida”.
- Mensaje: “Esta certificación fue emitida por el Instituto de Formación Técnica Superior N.° 14.”
- Alumno/a: María González.
- DNI ficticio: DNI-FICT-V001.
- Curso: Introducción a Sistemas Embebidos e Internet de las Cosas.
- Tipo: Certificado de curso.
- Número de certificado: IFTS14-CUR-2026-0001.
- Fecha de emisión: 20/06/2026.
- Fechas presentes: 05/06/2026, 12/06/2026, 19/06/2026.
- Código parcial de validación: QR-FICTICIO-00K.
- Fecha y hora de consulta: 20/06/2026 · 18:35.
- Texto: “El código QR no almacena datos personales; solo permite consultar este registro oficial.”
- Acción secundaria: “Volver al sitio del instituto”.
- Footer: “IFTS N.° 14 · Sistema de validación de certificados”.

Composición:
- Mobile-first.
- En 360px, 390px y 430px debe verse rápidamente el estado “Certificación válida”.
- En desktop, usar folio centrado con posible columna lateral de trazabilidad.
- Usar una superficie principal tipo documento.
- Evitar muchas cards separadas.
- Mostrar fechas como registro de asistencia, no como chips.
- El QR/código debe sentirse como control documental.

Evitar:
- SaaS dashboard.
- Hero centrado genérico.
- Glassmorphism.
- Blobs.
- Gradientes decorativos.
- Sombras grandes.
- Emojis.
- Cards blancas repetidas.
- Badges genéricos.
- Íconos decorativos en cada sección.
- Estética fintech.
```

### Prompt para v0

```txt
Usá la captura adjunta de Google Stitch como punto de partida visual, no como una maqueta rígida.

Antes de diseñar, aplicá las skills de diseño/frontend que estén disponibles en el entorno, especialmente criterios de:
- frontend-design;
- high-end visual design;
- web design guidelines;
- design taste;
- accessibility;
- anti-cliché UI;
- responsive design;
- component quality.

Tenés libertad para mejorar la interfaz si detectás que la captura de Stitch tiene problemas de jerarquía, composición, espaciado, accesibilidad, densidad, responsive, contraste o identidad visual. No copies errores por fidelidad.

Mantené las reglas funcionales y el contenido obligatorio, pero podés proponer una composición mejor si ayuda a que la pantalla se sienta más auténtica, institucional, moderna y usable.

El proyecto final se portará a Angular 20 + Tailwind. Para esta etapa podés generar React/Tailwind, HTML/Tailwind o la estructura que mejor resuelva el diseño visual, pero evitá dependencias innecesarias y no uses APIs específicas de Next.js que dificulten el port.

Ruta conceptual:
/validar/:tokenCertificacion

Objetivo de esta pantalla:
Una persona externa escanea un QR o abre un link y necesita verificar si una certificación es auténtica. Esta pantalla es la cara pública más importante del sistema, así que debe transmitir confianza institucional y claridad documental sin parecer una plantilla genérica.

Dirección visual esperada:
- folio técnico institucional;
- acta académica verificable;
- documento oficial digital;
- validación documental con trazabilidad QR;
- estética técnica vinculada a IFTS 14, sistemas embebidos, IoT y eficiencia energética.

Podés mejorar:
- jerarquía del folio;
- tratamiento del logo/sello institucional;
- banda de estado;
- integración del QR;
- registro de asistencia;
- uso de textura técnica sutil;
- composición mobile/desktop.

Evitá:
- app SaaS genérica;
- card stack sin intención;
- badges genéricos;
- glassmorphism;
- blobs;
- gradientes decorativos;
- emojis;
- sombras grandes;
- íconos en todos los bloques;
- estética fintech o dashboard.

Contenido obligatorio:
- Header institucional con “IFTS N.° 14”.
- Subtítulo: “Validación oficial de certificados”.
- Placeholder sobrio para logo institucional, preferentemente como sello/monograma temporal y no como caja punteada.
- Estado principal: “Certificación válida”.
- Mensaje: “Esta certificación fue emitida por el Instituto de Formación Técnica Superior N.° 14.”
- Alumno/a: María González.
- DNI ficticio: DNI-FICT-V001.
- Curso: Introducción a Sistemas Embebidos e Internet de las Cosas.
- Tipo: Certificado de curso.
- Número de certificado: IFTS14-CUR-2026-0001.
- Fecha de emisión: 20/06/2026.
- Fechas presentes: 05/06/2026, 12/06/2026, 19/06/2026.
- Código parcial de validación: QR-FICTICIO-00K.
- Fecha y hora de consulta: 20/06/2026 · 18:35.
- Texto: “El código QR no almacena datos personales; solo permite consultar este registro oficial.”
- Acción secundaria: “Volver al sitio del instituto”.
- Footer institucional.

Reglas y límites:
- Mostrá las fechas como registro de asistencia, tabla sobria o lista documental, no como chips decorativos.
- Integrá el estado válido como banda, sello o franja institucional, no como badge verde genérico.
- El QR/código debe sentirse como zona de trazabilidad documental.
- No agregues perfil público del alumno ni listado de otros cursos.
- No agregues descarga de PDF todavía en esta pantalla.



Resultado esperado:
- generá una pantalla visualmente refinada y coherente con el sistema;
- si cambiás la composición respecto de Stitch, que sea por una mejora clara;
- mantené el contenido obligatorio;
- cuidá responsive, contraste y accesibilidad;
- al final, explicá brevemente qué decisiones visuales tomaste y qué mejoraste respecto de la captura.
```

---

## 5. Validación pública no exitosa: revocada / no encontrada / error técnico

### Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para una pantalla pública de validación no exitosa de certificación del IFTS N.° 14.

Contexto:
Ya existe una pantalla de “Certificación válida” con dirección visual de folio técnico institucional / acta académica verificable. Esta pantalla debe ser consistente con esa identidad.

Ruta conceptual:
/validar/:tokenCertificacion

Necesito tres variantes visuales:
1. Certificación revocada.
2. Certificación no encontrada.
3. Error técnico temporal.

Dirección visual:
Debe sentirse como documento técnico institucional de validación, no como pantalla de error SaaS. Mantener folio oficial, registro verificable, trazabilidad documental y sobriedad académica.

Contenido común:
- Header institucional con “IFTS N.° 14”.
- Subtítulo: “Validación oficial de certificados”.
- Placeholder sobrio para logo institucional, como sello o monograma temporal.
- Estado principal claro.
- Mensaje breve y comprensible.
- Acción secundaria: “Volver al sitio del instituto”.
- Footer: “IFTS N.° 14 · Sistema de validación de certificados”.

Variante 1 — Certificación revocada:
- Estado: “Certificación revocada”.
- Mensaje: “Esta certificación fue revocada por la institución.”
- Mostrar datos mínimos si existen:
  - Alumno/a: María González
  - DNI ficticio: DNI-FICT-V001
  - Curso: Introducción a Sistemas Embebidos e Internet de las Cosas
  - Número de certificado: IFTS14-CUR-2026-0001
  - Fecha de emisión: 20/06/2026
- No mostrar fechas presentes como si siguieran vigentes.
- Incluir zona de control documental con código parcial: QR-FICTICIO-00K.
- Usar rojo con moderación, como sello/estado, no como fondo dominante.

Variante 2 — Certificación no encontrada:
- Estado: “Certificación no encontrada”.
- Mensaje: “No pudimos encontrar una certificación asociada a este código.”
- No mostrar datos personales.
- Mostrar código consultado parcial, fecha/hora de consulta y aclaración:
  “Verificá que el enlace o QR sea el vigente compartido por el instituto.”
- Usar ámbar o azul institucional, no rojo agresivo.

Variante 3 — Error técnico temporal:
- Estado: “No pudimos completar la validación”.
- Mensaje: “Intentá nuevamente más tarde.”
- No mostrar datos personales.
- Mostrar hora de consulta.
- Debe transmitir problema temporal, no certificado inválido.
- Usar azul/cian y un acento ámbar moderado.

Composición:
- Mobile-first.
- Desktop con folio centrado y posible columna lateral de trazabilidad.
- Mantener una superficie principal tipo documento.
- Evitar muchas cards separadas.
- Usar bandas, sellos, líneas finas y bloques de acta.

Evitar:
- Estética SaaS.
- Hero centrado.
- Glassmorphism.
- Gradientes decorativos.
- Blobs.
- Sombras grandes.
- Emojis.
- Íconos decorativos en cada bloque.
- Cards blancas repetidas.
- Badges genéricos.
- Estética fintech.
```

### Prompt para v0

```txt
Usá la captura adjunta de Google Stitch como punto de partida visual, no como una maqueta rígida.

Antes de diseñar, aplicá las skills de diseño/frontend que estén disponibles en el entorno, especialmente criterios de:
- frontend-design;
- high-end visual design;
- web design guidelines;
- design taste;
- accessibility;
- anti-cliché UI;
- responsive design;
- component quality.

Tenés libertad para mejorar la interfaz si detectás que la captura de Stitch tiene problemas de jerarquía, composición, espaciado, accesibilidad, densidad, responsive, contraste o identidad visual. No copies errores por fidelidad.

Mantené las reglas funcionales y el contenido obligatorio, pero podés proponer una composición mejor si ayuda a que la pantalla se sienta más auténtica, institucional, moderna y usable.

El proyecto final se portará a Angular 20 + Tailwind. Para esta etapa podés generar React/Tailwind, HTML/Tailwind o la estructura que mejor resuelva el diseño visual, pero evitá dependencias innecesarias y no uses APIs específicas de Next.js que dificulten el port.

Ruta conceptual:
/validar/:tokenCertificacion

Objetivo de esta pantalla:
Mostrar estados donde la validación no puede confirmarse, manteniendo tono oficial, claro y no alarmista. Debe diferenciar muy bien una certificación revocada, un token no encontrado y un error técnico temporal.

Dirección visual esperada:
- folio técnico institucional;
- acta académica verificable;
- documento oficial digital;
- validación documental con trazabilidad QR;
- estética técnica vinculada a IFTS 14, sistemas embebidos, IoT y eficiencia energética.

Podés mejorar:
- jerarquía del folio;
- tratamiento del logo/sello institucional;
- banda de estado;
- integración del QR;
- registro de asistencia;
- uso de textura técnica sutil;
- composición mobile/desktop.

Evitá:
- app SaaS genérica;
- card stack sin intención;
- badges genéricos;
- glassmorphism;
- blobs;
- gradientes decorativos;
- emojis;
- sombras grandes;
- íconos en todos los bloques;
- estética fintech o dashboard.

Contenido obligatorio:
Estado común:
- Header institucional con “IFTS N.° 14”.
- Subtítulo: “Validación oficial de certificados”.
- Placeholder sobrio de logo/sello institucional.
- Estado principal claro.
- Mensaje breve y comprensible.
- Acción secundaria: “Volver al sitio del instituto”.
- Footer institucional.

Variante 1 — Certificación revocada:
- Título: “Certificación revocada”.
- Mensaje: “Esta certificación fue revocada por la institución.”
- Mostrar datos mínimos si existen: alumno/a, DNI completo, curso, número de certificado y fecha de emisión.
- Mostrar código parcial: QR-FICTICIO-00K.
- No mostrar fechas presentes como si siguieran vigentes.

Variante 2 — Certificación no encontrada:
- Título: “Certificación no encontrada”.
- Mensaje: “No pudimos encontrar una certificación asociada a este código.”
- No mostrar datos personales.
- Mostrar código consultado parcial, fecha/hora de consulta y aclaración: “Verificá que el enlace o QR sea el vigente compartido por el instituto.”

Variante 3 — Error técnico temporal:
- Título: “No pudimos completar la validación”.
- Mensaje: “Intentá nuevamente más tarde.”
- No mostrar datos personales.
- Mostrar fecha/hora de consulta.

Reglas y límites:
- Podés resolverlo como un solo componente con selector visual de estados o como tres variantes separadas, según convenga para la claridad del diseño.
- El rojo debe ser moderado y documental, no agresivo.
- El estado “error técnico” no debe parecer certificación inválida.
- “No encontrada” nunca debe exponer datos personales.



Resultado esperado:
- generá una pantalla visualmente refinada y coherente con el sistema;
- si cambiás la composición respecto de Stitch, que sea por una mejora clara;
- mantené el contenido obligatorio;
- cuidá responsive, contraste y accesibilidad;
- al final, explicá brevemente qué decisiones visuales tomaste y qué mejoraste respecto de la captura.
```

---

# PARTE B — Pantallas administrativas

---

## 6. Dashboard admin — Mesa de trabajo de Bedelía

### Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para el dashboard administrativo del sistema de certificaciones QR del IFTS N.° 14.

Contexto:
El panel será usado principalmente por Bedelía desde PC/notebook. No debe ser un dashboard SaaS de métricas. Debe sentirse como una mesa de trabajo administrativa para gestionar cursos, asistencias y certificaciones.

Ruta conceptual:
/admin/dashboard

Dirección visual:
Mesa de trabajo de Bedelía / archivo institucional digital / panel operativo académico.

Generá 3 variantes:
1. Mesa de trabajo administrativa con acciones principales.
2. Archivo institucional con actividad reciente.
3. Panel operativo sobrio con pendientes y accesos rápidos.

Contenido obligatorio:
- Header/sidebar admin con IFTS N.° 14.
- Título: “Panel de certificaciones”.
- Subtítulo: “Gestión de cursos, asistencias y certificados con QR.”
- Acciones principales:
  - Nuevo curso
  - Cargar asistencias
  - Nueva certificación
  - Entrega manual (copiar link / descargar PDF)
  - Carga masiva
- Resumen operativo:
  - Cursos cargados
  - Alumnos registrados
  - Certificaciones emitidas
  - Certificaciones revocadas
- Actividad reciente:
  - certificación emitida;
  - asistencia modificada;
  - entrega manual realizada;
  - certificación revocada.
- Pendientes:
  - cursos sin fechas;
  - certificaciones pendientes de entrega manual;
  - certificados que requieren nueva entrega manual por modificación.

Composición:
- Desktop-first.
- Mobile responsive.
- Acciones principales deben tener más peso que métricas.
- Usar tablas/listas administrativas sobrias.
- Evitar grillas de cards blancas iguales.
- Usar bandas, grupos, filas, paneles de archivo o módulos institucionales.
- No usar gráficos decorativos.

Evitar:
- Dashboard SaaS.
- Métricas gigantes como startup.
- Gráficos sin sentido.
- Gradientes.
- Glassmorphism.
- Blobs.
- Íconos coloridos en cada card.
- Sombras grandes.
- Exceso de badges.
```

### Prompt para v0

```txt
Usá la captura adjunta de Google Stitch como punto de partida visual, no como una maqueta rígida.

Antes de diseñar, aplicá las skills de diseño/frontend que estén disponibles en el entorno, especialmente criterios de:
- frontend-design;
- high-end visual design;
- web design guidelines;
- design taste;
- accessibility;
- anti-cliché UI;
- responsive design;
- component quality.

Tenés libertad para mejorar la interfaz si detectás que la captura de Stitch tiene problemas de jerarquía, composición, espaciado, accesibilidad, densidad, responsive, contraste o identidad visual. No copies errores por fidelidad.

Mantené las reglas funcionales y el contenido obligatorio, pero podés proponer una composición mejor si ayuda a que la pantalla se sienta más auténtica, institucional, moderna y usable.

El proyecto final se portará a Angular 20 + Tailwind. Para esta etapa podés generar React/Tailwind, HTML/Tailwind o la estructura que mejor resuelva el diseño visual, pero evitá dependencias innecesarias y no uses APIs específicas de Next.js que dificulten el port.

Ruta conceptual:
/admin/dashboard

Objetivo de esta pantalla:
Crear la primera pantalla del panel administrativo. Debe ayudar a Bedelía a entender qué hacer al entrar: cargar cursos, asistencias, certificaciones, entregas manuales y pendientes. No debe priorizar métricas decorativas.

Dirección visual esperada:
- mesa de trabajo de Bedelía;
- archivo institucional digital;
- sistema administrativo académico;
- herramienta clara para operar cursos, asistencias y certificaciones.

Podés mejorar:
- arquitectura de información;
- jerarquía de acciones;
- densidad de tablas;
- estados empty/loading/error;
- orden de formularios;
- navegación admin;
- responsive desktop-first con mobile usable.

Evitá:
- dashboard SaaS genérico;
- métricas decorativas sin valor;
- grillas de cards repetidas;
- CRM comercial;
- fintech;
- colores Tailwind por defecto sin identidad;
- íconos decorativos excesivos;
- gráficos si no aportan.

Contenido obligatorio:
- Header/sidebar administrativo con IFTS N.° 14.
- Título: “Panel de certificaciones”.
- Subtítulo: “Gestión de cursos, asistencias y certificados con QR.”
- Acciones principales: Nuevo curso, Cargar asistencias, Nueva certificación, Entrega manual (copiar link / descargar PDF), Carga masiva.
- Resumen operativo: cursos cargados, alumnos registrados, certificaciones emitidas, certificaciones revocadas.
- Actividad reciente: certificación emitida, asistencia modificada, entrega manual realizada, certificación revocada.
- Pendientes: cursos sin fechas, certificaciones pendientes de entrega manual, certificados que requieren nueva entrega manual por modificación.

Reglas y límites:
- Las acciones principales deben tener más peso que las métricas.
- Podés reorganizar el dashboard si una estructura tipo “bandeja de trabajo” funciona mejor que un tablero clásico.
- Usá tablas/listas/paneles de archivo si aportan más que cards.
- No uses gráficos si no aportan al trabajo de Bedelía.



Resultado esperado:
- generá una pantalla visualmente refinada y coherente con el sistema;
- si cambiás la composición respecto de Stitch, que sea por una mejora clara;
- mantené el contenido obligatorio;
- cuidá responsive, contraste y accesibilidad;
- al final, explicá brevemente qué decisiones visuales tomaste y qué mejoraste respecto de la captura.
```

---

## 7. Login administrativo

### Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para la pantalla de login administrativo del sistema de certificaciones QR del IFTS N.° 14.

Ruta conceptual:
/admin/login

Objetivo:
Permitir acceso al panel de certificaciones con email y contraseña. No habrá 2FA ni login con Google por ahora.

Dirección visual:
Acceso institucional autorizado. Sobrio, claro y seguro. No debe parecer fintech, banco ni SaaS genérico.

Contenido:
- IFTS N.° 14.
- Panel de certificaciones.
- Acceso exclusivo para personal autorizado.
- Placeholder sobrio de logo institucional.
- Campo email.
- Campo contraseña.
- Botón “Ingresar”.
- Mensaje: “Todas las acciones administrativas quedan registradas.”
- Footer discreto.

Composición:
- Desktop y mobile.
- Puede usar una columna principal con folio/formulario.
- Puede usar lateral institucional con información breve.
- Debe ser limpio y directo.
- No usar ilustraciones genéricas.

Evitar:
- Estética bancaria.
- Estética fintech.
- Glassmorphism.
- Gradientes fuertes.
- Imágenes externas.
- Blobs.
- Emojis.
- Registro público.
- Botones sociales.
- Login con Google.
- 2FA.
```

### Prompt para v0

```txt
Usá la captura adjunta de Google Stitch como punto de partida visual, no como una maqueta rígida.

Antes de diseñar, aplicá las skills de diseño/frontend que estén disponibles en el entorno, especialmente criterios de:
- frontend-design;
- high-end visual design;
- web design guidelines;
- design taste;
- accessibility;
- anti-cliché UI;
- responsive design;
- component quality.

Tenés libertad para mejorar la interfaz si detectás que la captura de Stitch tiene problemas de jerarquía, composición, espaciado, accesibilidad, densidad, responsive, contraste o identidad visual. No copies errores por fidelidad.

Mantené las reglas funcionales y el contenido obligatorio, pero podés proponer una composición mejor si ayuda a que la pantalla se sienta más auténtica, institucional, moderna y usable.

El proyecto final se portará a Angular 20 + Tailwind. Para esta etapa podés generar React/Tailwind, HTML/Tailwind o la estructura que mejor resuelva el diseño visual, pero evitá dependencias innecesarias y no uses APIs específicas de Next.js que dificulten el port.

Ruta conceptual:
/admin/login

Objetivo de esta pantalla:
Permitir acceso al panel de certificaciones con email y contraseña. Debe transmitir acceso institucional autorizado, seguridad y sobriedad.

Dirección visual esperada:
- mesa de trabajo de Bedelía;
- archivo institucional digital;
- sistema administrativo académico;
- herramienta clara para operar cursos, asistencias y certificaciones.

Podés mejorar:
- arquitectura de información;
- jerarquía de acciones;
- densidad de tablas;
- estados empty/loading/error;
- orden de formularios;
- navegación admin;
- responsive desktop-first con mobile usable.

Evitá:
- dashboard SaaS genérico;
- métricas decorativas sin valor;
- grillas de cards repetidas;
- CRM comercial;
- fintech;
- colores Tailwind por defecto sin identidad;
- íconos decorativos excesivos;
- gráficos si no aportan.

Contenido obligatorio:
- IFTS N.° 14.
- Título: “Panel de certificaciones”.
- Subtítulo: “Acceso exclusivo para personal autorizado”.
- Placeholder sobrio de logo institucional.
- Campo email.
- Campo contraseña.
- Botón principal “Ingresar”.
- Mensaje: “Todas las acciones administrativas quedan registradas.”
- Footer discreto.

Reglas y límites:
- No incluir registro público.
- No incluir login con Google.
- No incluir 2FA.
- No incluir recuperación compleja de contraseña.
- Podés usar un lateral institucional si mejora desktop, pero en mobile debe seguir siendo simple.

Debe parecer acceso a un sistema institucional, no banco, fintech ni SaaS comercial.

Resultado esperado:
- generá una pantalla visualmente refinada y coherente con el sistema;
- si cambiás la composición respecto de Stitch, que sea por una mejora clara;
- mantené el contenido obligatorio;
- cuidá responsive, contraste y accesibilidad;
- al final, explicá brevemente qué decisiones visuales tomaste y qué mejoraste respecto de la captura.
```

---

## 8. Crear / editar curso con fechas

### Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para la pantalla administrativa de crear/editar curso con fechas del sistema de certificaciones QR del IFTS N.° 14.

Rutas conceptuales:
/admin/cursos/nuevo
/admin/cursos/:id/editar

Objetivo:
Bedelía carga o edita un curso y administra sus fechas. El curso puede modificarse después, agregando o quitando fechas.

Dirección visual:
Ficha académica institucional. Debe sentirse como formulario administrativo claro, no como formulario SaaS genérico.

Contenido:
- Header/sidebar admin.
- Título: “Nuevo curso” o “Editar curso”.
- Datos del curso:
  - nombre del curso;
  - descripción opcional;
  - carga horaria opcional;
  - modalidad opcional;
  - estado activo/inactivo.
- Sección “Fechas del curso”:
  - lista editable de fechas;
  - fecha;
  - horario opcional;
  - descripción opcional;
  - acción “Agregar fecha”;
  - acción “Quitar fecha”.
- Aviso importante:
  “Si modificás fechas de un curso con certificados ya emitidos, será necesario realizar una nueva entrega manual al alumno (copiar link / descargar PDF). El QR seguirá siendo el mismo.”
- Acciones:
  - Guardar curso;
  - Cancelar;
  - Guardar cambios y marcar para nueva entrega manual, si aplica.

Composición:
- Desktop-first.
- Mobile usable.
- Datos del curso arriba.
- Fechas con protagonismo.
- No usar calendario complejo.
- El impacto de modificar fechas debe estar visible.

Evitar:
- Wizard innecesario.
- SaaS genérico.
- Formularios densos sin jerarquía.
- Gradientes.
- Cards repetidas.
```

### Prompt para v0

```txt
Usá la captura adjunta de Google Stitch como punto de partida visual, no como una maqueta rígida.

Antes de diseñar, aplicá las skills de diseño/frontend que estén disponibles en el entorno, especialmente criterios de:
- frontend-design;
- high-end visual design;
- web design guidelines;
- design taste;
- accessibility;
- anti-cliché UI;
- responsive design;
- component quality.

Tenés libertad para mejorar la interfaz si detectás que la captura de Stitch tiene problemas de jerarquía, composición, espaciado, accesibilidad, densidad, responsive, contraste o identidad visual. No copies errores por fidelidad.

Mantené las reglas funcionales y el contenido obligatorio, pero podés proponer una composición mejor si ayuda a que la pantalla se sienta más auténtica, institucional, moderna y usable.

El proyecto final se portará a Angular 20 + Tailwind. Para esta etapa podés generar React/Tailwind, HTML/Tailwind o la estructura que mejor resuelva el diseño visual, pero evitá dependencias innecesarias y no uses APIs específicas de Next.js que dificulten el port.

Ruta conceptual:
/admin/cursos/nuevo
/admin/cursos/:id/editar

Objetivo de esta pantalla:
Diseñar la ficha administrativa para crear o editar un curso y administrar sus fechas. Esta pantalla es central porque las fechas del curso son la base de las asistencias y certificaciones.

Dirección visual esperada:
- mesa de trabajo de Bedelía;
- archivo institucional digital;
- sistema administrativo académico;
- herramienta clara para operar cursos, asistencias y certificaciones.

Podés mejorar:
- arquitectura de información;
- jerarquía de acciones;
- densidad de tablas;
- estados empty/loading/error;
- orden de formularios;
- navegación admin;
- responsive desktop-first con mobile usable.

Evitá:
- dashboard SaaS genérico;
- métricas decorativas sin valor;
- grillas de cards repetidas;
- CRM comercial;
- fintech;
- colores Tailwind por defecto sin identidad;
- íconos decorativos excesivos;
- gráficos si no aportan.

Contenido obligatorio:
- Header/sidebar admin.
- Título: “Nuevo curso” o “Editar curso”.
- Campos del curso: nombre del curso, descripción opcional, carga horaria opcional, modalidad opcional, estado activo/inactivo.
- Sección “Fechas del curso” con lista editable.
- Cada fecha debe contemplar: fecha, horario opcional, descripción opcional, acción Agregar fecha y acción Quitar fecha.
- Aviso importante: “Si modificás fechas de un curso con certificados ya entregados, será necesario realizar una nueva entrega manual al alumno. El QR seguirá siendo el mismo.”
- Acciones: Guardar curso, Cancelar, Guardar cambios y marcar para nueva entrega manual si aplica.

Reglas y límites:
- No uses wizard si no aporta.
- No uses calendario complejo por defecto; solo si mejora mucho la comprensión.
- Las fechas deben tener protagonismo y ser fáciles de editar.
- El impacto de modificar fechas debe estar visible sin asustar.



Resultado esperado:
- generá una pantalla visualmente refinada y coherente con el sistema;
- si cambiás la composición respecto de Stitch, que sea por una mejora clara;
- mantené el contenido obligatorio;
- cuidá responsive, contraste y accesibilidad;
- al final, explicá brevemente qué decisiones visuales tomaste y qué mejoraste respecto de la captura.
```

---

## 9. Registrar asistencias presentes

### Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para la pantalla administrativa de registro de asistencias presentes del IFTS N.° 14.

Ruta conceptual:
/admin/cursos/:id/asistencias

URL final esperada dentro del módulo:
/certificados/admin/cursos/:id/asistencias

Objetivo:
Bedelía selecciona una fecha de un curso y carga únicamente los alumnos que estuvieron presentes en esa fecha.

Uso principal:
PC/notebook. Mobile usable pero no prioritario.

Dirección visual:
Planilla institucional mejorada. Debe ser rápida para cargar datos, pero no parecer Excel desordenado.

Modelo funcional obligatorio:
Esta pantalla no administra estados de asistencia.
Bedelía solo construye el listado de alumnos presentes en una fecha.
Si un alumno no se carga como presente, simplemente no queda registrado como presente.
La ausencia es implícita y no debe mostrarse visualmente.

Contenido:
- Header/sidebar admin.
- Encabezado con nombre del curso.
- Datos breves del curso si ayudan: docente, cohorte o comisión si aplica.
- Selector de fecha del curso.
- Buscador de alumno por nombre, apellido o DNI.
- Área principal para cargar presentes.
- Tabla/lista de alumnos:
  - nombre;
  - apellido;
  - DNI;
  - email;
  - único control para marcar o agregar “Presente”.
- Resumen:
  - fecha seleccionada;
  - presentes marcados;
  - cambios sin guardar;
  - aviso si una modificación afecta certificados ya compartidos manualmente.
- Acciones:
  - Guardar asistencias;
  - Cancelar;
  - Ver curso.
- Aviso:
  “Si modificás una asistencia ya certificada, el certificado deberá entregarse manualmente nuevamente al alumno. El QR seguirá siendo el mismo.”

Reglas:
- Solo se registra estado presente.
- No mostrar ausente.
- No mostrar justificada.
- No mostrar porcentaje de asistencia.
- No mostrar columna “estado” si puede sugerir ausente/justificada.
- No usar dropdowns, radios ni badges para estados múltiples.
- No mostrar observaciones de ausencia.
- No mostrar justificativos médicos.

Patrones de interfaz permitidos:
1. Lista general de alumnos con una sola acción “Marcar presente”.
2. Buscador + selección de alumnos presentes.
3. Doble panel: alumnos del curso / presentes cargados.
4. Tabla compacta con una única columna de selección para presente.

Composición:
- Desktop-first.
- Tabla eficiente o doble panel si mejora la claridad.
- Sticky actions o panel lateral de resumen si aporta.
- Mobile con filas compactas.

Evitar:
- Excel desordenado.
- Dashboard SaaS.
- Cards gigantes.
- Formularios lentos.
- Porcentajes.
- Estados ausente/justificada.
- Planilla de presentismo escolar con múltiples estados.
```

### Prompt para v0

```txt
Usá la captura adjunta de Google Stitch como punto de partida visual, no como una maqueta rígida.

Antes de diseñar, aplicá las skills de diseño/frontend que estén disponibles en el entorno, especialmente criterios de:
- frontend-design;
- high-end visual design;
- web design guidelines;
- design taste;
- accessibility;
- anti-cliché UI;
- responsive design;
- component quality.

Tenés libertad para mejorar la interfaz si detectás que la captura de Stitch tiene problemas de jerarquía, composición, espaciado, accesibilidad, densidad, responsive, contraste o identidad visual. No copies errores por fidelidad.

Mantené las reglas funcionales y el contenido obligatorio, pero podés proponer una composición mejor si ayuda a que la pantalla se sienta más auténtica, institucional, moderna y usable.

El proyecto final se portará a Angular 20 + Tailwind. Para esta etapa podés generar React/Tailwind, HTML/Tailwind o la estructura que mejor resuelva el diseño visual, pero evitá dependencias innecesarias y no uses APIs específicas de Next.js que dificulten el port.

Ruta conceptual:
/admin/cursos/:id/asistencias

URL final esperada dentro del módulo:
/certificados/admin/cursos/:id/asistencias

Objetivo de esta pantalla:
Permitir que Bedelía seleccione una fecha de un curso y cargue únicamente qué alumnos estuvieron presentes en esa fecha. Debe ser rápida de usar desde PC/notebook y no parecer una planilla desordenada.

Modelo funcional obligatorio:
Esta pantalla NO administra estados de asistencia.
No existe “ausente”.
No existe “justificada”.
No existe “porcentaje de asistencia”.
No existe “estado” por alumno.
La lógica correcta es:
- se selecciona una fecha del curso;
- se busca un alumno por nombre, apellido o DNI;
- se marca o agrega como presente;
- se guarda el conjunto de alumnos presentes;
- si un alumno no está marcado/agregado, simplemente no queda registrado como presente.

La ausencia es implícita y no debe mostrarse visualmente.

Dirección visual esperada:
- mesa de trabajo de Bedelía;
- archivo institucional digital;
- sistema administrativo académico;
- herramienta clara para operar cursos, asistencias y certificaciones;
- planilla institucional mejorada, no Excel desordenado.

Podés mejorar:
- arquitectura de información;
- jerarquía de acciones;
- densidad de tablas;
- claridad del guardado;
- estados empty/loading/error;
- orden de formularios;
- navegación admin;
- responsive desktop-first con mobile usable.

Contenido obligatorio:
- Header/sidebar admin.
- Encabezado con nombre del curso.
- Selector de fecha del curso.
- Buscador de alumno por nombre, apellido o DNI.
- Tabla/lista compacta de alumnos con:
  - nombre;
  - apellido;
  - DNI;
  - email;
  - una única acción o control: “Presente”.
- Resumen con fecha seleccionada, presentes marcados, cambios sin guardar y aviso si una modificación afecta certificados ya compartidos manualmente.
- Acciones: Guardar asistencias, Cancelar, Ver curso.
- Aviso: “Si modificás una asistencia ya certificada, el certificado deberá entregarse manualmente nuevamente al alumno. El QR seguirá siendo el mismo.”

Patrones permitidos:
- Tabla compacta con una única columna “Presente”.
- Doble panel: alumnos del curso a la izquierda y presentes cargados a la derecha.
- Buscador + lista de resultados + panel de presentes cargados.
- Tabla principal con resumen sticky lateral.

Patrones prohibidos:
- No mostrar “Ausente”.
- No mostrar “Justificada”.
- No mostrar “Estado”.
- No mostrar porcentaje de asistencia.
- No mostrar radio buttons de asistencia.
- No mostrar dropdowns de estado.
- No mostrar semáforos de presentismo.
- No mostrar gráficos ni métricas decorativas.
- No mostrar observaciones de ausencia o justificativo médico.
- No usar badges de colores para estados de asistencia.

Reglas de interacción:
- El control “Presente” debe ser rápido y claro.
- Debe ser posible identificar rápidamente cuántos presentes hay.
- Debe quedar claro si hay cambios sin guardar.
- Guardar debe ser la acción principal.
- Cancelar debe ser secundaria.
- Ver curso debe ser navegación contextual, no acción principal.
- Si la lista está vacía o no hay resultados de búsqueda, mostrar un empty state sobrio.

Evitá:
- dashboard SaaS genérico;
- métricas decorativas sin valor;
- grillas de cards repetidas;
- CRM comercial;
- fintech;
- colores Tailwind por defecto sin identidad;
- íconos decorativos excesivos;
- gráficos si no aportan;
- Excel desordenado;
- planilla escolar de estados.

Resultado esperado:
- generá una pantalla visualmente refinada y coherente con el sistema;
- si cambiás la composición respecto de Stitch, que sea por una mejora clara;
- mantené el contenido obligatorio;
- cuidá responsive, contraste y accesibilidad;
- al final, explicá brevemente qué decisiones visuales tomaste y qué mejoraste respecto de la captura.
```

## 10. Emitir certificación directa

### Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para la pantalla administrativa de emisión directa de certificación del IFTS N.° 14.

Ruta conceptual:
/admin/certificaciones/nueva

URL final esperada dentro del módulo:
/certificados/admin/certificaciones/nueva

Objetivo:
Bedelía selecciona un alumno y un curso. El sistema toma automáticamente las fechas presentes registradas para ese alumno en ese curso y genera una certificación complementaria con QR y link de validación oficial.

Importante:
La vista previa del documento debe parecerse mucho al certificado institucional real del IFTS 14 ya existente.
No inventar una “acta” genérica.
No hacer una pieza tipo dashboard.
Debe sentirse como emisión de un documento institucional real.

Dirección visual:
- acto administrativo de emisión;
- documento académico institucional;
- mesa de trabajo de Bedelía;
- sistema académico serio, claro y moderno.

Composición general:
- desktop-first;
- formulario/selección a la izquierda;
- vista previa institucional del certificado a la derecha;
- acciones claras al final;
- flujo simple y directo.

Contenido obligatorio de la pantalla:
- Header/sidebar admin.
- Título: “Nueva certificación”.
- Selector o buscador de alumno.
- Selector o buscador de curso.
- Vista previa automática del certificado.
- Avisos de validación.
- Acción principal: “Emitir certificado”.
- Acción secundaria: “Cancelar”.
- Texto de apoyo:
  “Después de emitir, se generará el QR permanente y el PDF complementario. La entrega al alumno es manual (copiar link / descargar PDF) por canal externo; el sistema NO envía emails.”

Contenido obligatorio de la vista previa:
- título institucional del certificado;
- logos institucionales;
- nombre y apellido del alumno;
- DNI completo;
- nombre del curso;
- fecha o fechas en las que el alumno participó;
- fecha de emisión;
- número de certificado, si corresponde;
- nombres y cargos de las autoridades firmantes;
- área de firma digital;
- QR de validación;
- referencia a link oficial de validación.

Importante sobre datos institucionales:
Los siguientes datos no se editan manualmente en esta pantalla, sino que vienen desde Configuración institucional:
- nombre del rector/a;
- cargo del rector/a;
- nombre del/la asesor/a pedagógico/a;
- cargo correspondiente;
- firma digital del rector/a;
- firma digital del/la asesor/a;
- logos institucionales;
- texto base institucional del certificado.

Usar como ejemplo visual principal:
- Rector / Rectora del IFTS 14.
- Asesor / Asesora Pedagógica del IFTS 14.

Reglas:
- No existe estado borrador.
- No existe aprobación de Rectorado.
- No hacer wizard largo.
- El sistema genera directamente la certificación.
- Si el alumno participó en varias fechas, la certificación debe mostrar todas esas fechas.
- La vista previa debe tomar como referencia fuerte el certificado institucional real actual.
- La pantalla debe dejar claro que el PDF es un complemento con QR y validación oficial.

Avisos que pueden aparecer:
- alumno sin email;
- alumno sin asistencias presentes;
- curso sin fechas;
- ya existe certificación válida para ese alumno y curso.

Evitar:
- “Acta de aprobación” genérica;
- lenguaje de expediente innecesario;
- folios ficticios si no son obligatorios;
- dashboard SaaS;
- gráficos;
- métricas decorativas;
- formularios excesivos;
- estética fintech o CRM comercial.
```

### Prompt para v0

```txt
Usá la captura adjunta de Google Stitch como punto de partida visual, no como una maqueta rígida.

Tomá también como referencia conceptual el certificado institucional real del IFTS N.° 14. La pantalla debe mantener una vista previa del certificado que se sienta claramente inspirada en ese documento real, aunque podés mejorar su composición, legibilidad y adaptación al sistema.

Antes de diseñar, aplicá las skills de diseño/frontend disponibles, especialmente:
- frontend-design
- high-end visual design
- web design guidelines
- design taste
- accessibility
- anti-cliché UI
- responsive design
- component quality

Tenés libertad para mejorar la interfaz si detectás problemas de jerarquía, composición, espaciado, responsive, densidad, accesibilidad, contraste o identidad visual. No copies errores por fidelidad.

El proyecto final se portará a Angular 20 + Tailwind. Para esta etapa podés generar React/Tailwind, HTML/Tailwind o una estructura equivalente, pero evitá dependencias innecesarias y no uses APIs específicas de Next.js que dificulten el port.

Ruta conceptual:
/admin/certificaciones/nueva

URL final esperada dentro del módulo:
/certificados/admin/certificaciones/nueva

Objetivo de esta pantalla:
Permitir que Bedelía seleccione alumno y curso, revise la vista previa del certificado complementario, emita la certificación y prepare la entrega manual mediante link copiable y PDF descargable.

Importante:
Esta pantalla NO debe sentirse como un dashboard SaaS, una fintech, un CRM comercial ni una “acta” inventada.
Debe sentirse como una pantalla administrativa seria de emisión documental, con una vista previa institucional del certificado.

Dirección visual esperada:
- sistema académico institucional;
- mesa de trabajo de Bedelía;
- acto administrativo de emisión;
- interfaz sobria, moderna, técnica, clara y usable;
- fuerte inspiración en el certificado real del IFTS 14.

Composición sugerida:
- sidebar/header admin;
- bloque superior con selección de alumno y curso;
- bloque principal con vista previa amplia del certificado;
- bloque inferior o lateral con acciones y confirmación;
- diseño desktop-first, con mobile usable.

Contenido obligatorio:
- Header/sidebar admin.
- Título: “Nueva certificación”.
- Selector o buscador de alumno.
- Selector o buscador de curso.
- Vista previa automática del certificado.
- Avisos de validación o advertencia.
- Acción principal: “Emitir certificado”.
- Acción secundaria: “Cancelar”.
- Texto de apoyo:
  “Después de emitir, se generará el QR permanente y el PDF complementario. La entrega al alumno es manual (copiar link / descargar PDF) por canal externo; el sistema NO envía emails.”

Contenido obligatorio de la vista previa:
- logos institucionales;
- gran título institucional tipo “CERTIFICADO” o equivalente coherente con el documento real;
- nombre y apellido del alumno con protagonismo;
- DNI completo;
- nombre del curso;
- fecha o fechas presentes del alumno en ese curso;
- fecha de emisión;
- número de certificado, si corresponde;
- nombres y cargos de las autoridades;
- área de firma digital;
- QR visible;
- referencia al link o validación oficial.

Regla muy importante sobre firmas y cargos:
Los datos de autoridades y firmas NO deben aparecer como campos editables dentro de esta pantalla.
La pantalla solo debe MOSTRAR esos datos en la vista previa.

Deben tratarse como datos provenientes de Configuración institucional del sistema, por ejemplo:
- nombre del rector/a;
- cargo del rector/a;
- nombre del/la asesor/a pedagógico/a;
- cargo del/la asesor/a pedagógico/a;
- firma digital del rector/a;
- firma digital del/la asesor/a pedagógico/a.

No inventar firmantes como “secretaría académica” o “profesor titular” si no están alineados con el certificado institucional de referencia.
Usar como ejemplo visual principal:
- Rector / Rectora del IFTS 14
- Asesor / Asesora Pedagógica del IFTS 14

Si querés mostrar que estos datos provienen de otra parte del sistema, podés incluir una nota secundaria discreta como:
“Firmas y autoridades obtenidas desde Configuración institucional”.

Reglas funcionales:
- No existe borrador.
- No existe aprobación de Rectorado.
- No hacer wizard largo.
- La emisión es directa.
- Si el alumno tiene varias fechas presentes, deben mostrarse todas.
- La vista previa debe transmitir que luego se generará el PDF complementario final.

Avisos posibles:
- alumno sin email;
- alumno sin asistencias presentes;
- curso sin fechas;
- ya existe certificación válida para ese alumno y curso.

Mejoras permitidas:
- mejorar arquitectura de información;
- mejorar jerarquía de acciones;
- mejorar la densidad del contenido;
- mejorar responsive;
- mejorar contraste y accesibilidad;
- mejorar la forma de representar las fechas presentes;
- mejorar la composición del preview respecto de la captura actual.

Evitá:
- dashboard SaaS genérico;
- CRM comercial;
- fintech;
- cards repetidas sin intención;
- gráficos;
- métricas decorativas;
- lenguaje burocrático innecesario;
- estética fría o corporativa genérica;
- colores Tailwind por defecto sin identidad;
- íconos decorativos excesivos;
- campos editables para firmas/cargos dentro de esta pantalla.

Resultado esperado:
- generá una pantalla visualmente refinada y coherente con el sistema;
- mantené el contenido obligatorio;
- hacé que la vista previa del certificado se sienta más institucional y cercana al PDF real del IFTS 14;
- dejá claro visualmente que las autoridades y firmas provienen de configuración global, no de edición manual en esta pantalla;
- cuidá responsive, contraste y accesibilidad;
- al final, explicá brevemente qué decisiones visuales tomaste y qué mejoraste respecto de la captura.
```

## 11. Detalle de certificación

## Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para la pantalla administrativa de detalle de certificación del IFTS N.° 14.

Ruta conceptual:
/admin/certificaciones/:id

URL final esperada dentro del módulo:
/certificados/admin/certificaciones/:id

Objetivo:
Bedelía puede revisar una certificación ya emitida, verificar su estado, ver el PDF/certificado generado, consultar QR/link, copiar link, descargar PDF, regenerar PDF o revocar si corresponde. La entrega al alumno es manual (canal externo); el sistema NO envía emails.

Dirección visual:
Control documental interno / expediente de certificación.
Debe sentirse como una ficha institucional verificable, no como dashboard SaaS.

Contexto funcional:
Una certificación corresponde a:
- alumno;
- DNI;
- curso;
- fechas presentes;
- número de certificado;
- QR/link permanente;
- PDF complementario similar al certificado real del IFTS 14.

El PDF/certificado debe parecerse mucho al certificado institucional real del IFTS 14.

Contenido obligatorio:
- Header/sidebar admin.
- Estado visible: válida o revocada.
- Datos del alumno:
  - nombre;
  - apellido;
  - DNI completo;
  - email.
- Datos del curso:
  - nombre;
  - fechas presentes.
- Datos administrativos:
  - número de certificado;
  - fecha de emisión;
  - token parcial;
  - fecha de última entrega manual;
  - estado de entrega (pendiente / entregada manualmente).
- Vista previa del certificado/PDF:
  - inspirado en el certificado real del IFTS 14;
  - horizontal o preview escalada;
  - logos institucionales;
  - alumno;
  - DNI;
  - curso;
  - fechas presentes;
  - autoridades firmantes;
  - QR/link.
- Bloque QR:
  - QR visible;
  - link público conceptual `/validar/:tokenCertificacion`;
  - URL final esperada `/certificados/validar/:tokenCertificacion`;
  - botón “Copiar link”.
- Acciones principales:
  - Descargar PDF;
  - Copiar link;
  - Regenerar PDF.
- Acción peligrosa:
  - Revocar certificación.
- Aviso:
  “El QR es permanente. Si se corrigen fechas o asistencias, se realiza una nueva entrega manual (copiar link / descargar PDF) al alumno con el mismo QR. El sistema NO envía emails.”
- Historial:
  - creada;
  - emitida;
  - entrega manual realizada;
  - PDF regenerado;
  - asistencia modificada;
  - revocada.

Regla importante sobre firmas y cargos:
Los nombres, cargos y firmas visibles en la vista previa provienen de Configuración institucional.
No son campos editables en esta pantalla.

Usar como ejemplo:
- Rector / Rectora del IFTS 14;
- Asesor / Asesora Pedagógica del IFTS 14.

Composición:
- Desktop-first.
- Layout tipo expediente/ficha documental.
- Vista previa del certificado como elemento importante.
- QR como protagonista secundario.
- Acciones normales agrupadas.
- Revocar separado visualmente.
- Historial sobrio.
- Mobile usable.

Evitar:
- Dashboard SaaS.
- Gráficos.
- Métricas decorativas.
- Exceso de cards.
- Acción revocar mezclada con acciones normales.
- Perfil público del alumno.
- Firmas o autoridades editables en esta pantalla.
```

## Prompt para v0

```txt
Usá la captura adjunta de Google Stitch como punto de partida visual, no como una maqueta rígida.

Antes de diseñar, aplicá las skills de diseño/frontend disponibles:
- frontend-design;
- high-end visual design;
- web design guidelines;
- design taste;
- accessibility;
- anti-cliché UI;
- responsive design;
- component quality.

Tenés libertad para mejorar la interfaz si detectás problemas de jerarquía, composición, espaciado, densidad, responsive, contraste, accesibilidad o identidad visual. No copies errores por fidelidad.

El proyecto final se portará a Angular 20 + Tailwind. Para esta etapa podés generar React/Tailwind, HTML/Tailwind o una estructura equivalente, pero evitá dependencias innecesarias y no uses APIs específicas de Next.js.

Ruta conceptual:
/admin/certificaciones/:id

URL final esperada dentro del módulo:
/certificados/admin/certificaciones/:id

Objetivo:
Diseñar la pantalla administrativa de detalle de certificación. Bedelía debe poder revisar una certificación emitida, ver su estado, consultar los datos del alumno/curso, ver la vista previa del certificado/PDF, copiar el QR/link, descargar PDF, regenerar PDF o revocar. La entrega al alumno es manual (canal externo); el sistema NO envía emails.

Dirección visual esperada:
- control documental interno;
- expediente de certificación;
- archivo institucional digital;
- mesa de trabajo de Bedelía;
- sistema académico sobrio, técnico y moderno.

Contenido obligatorio:
- Header/sidebar admin.
- Estado: válida o revocada.
- Datos del alumno:
  - nombre;
  - apellido;
  - DNI completo;
  - email.
- Datos del curso:
  - nombre;
  - fechas presentes.
- Datos administrativos:
  - número de certificado;
  - fecha de emisión;
  - token parcial;
  - fecha de última entrega manual;
  - estado de entrega (pendiente / entregada manualmente).
- Vista previa del certificado/PDF:
  - inspirada en el certificado real del IFTS 14;
  - formato horizontal o preview escalada;
  - logos institucionales;
  - título de certificado;
  - alumno;
  - DNI;
  - curso;
  - fechas presentes;
  - autoridades firmantes;
  - QR y link.
- Bloque QR:
  - QR visible;
  - link conceptual `/validar/:tokenCertificacion`;
  - URL final esperada `/certificados/validar/:tokenCertificacion`;
  - botón “Copiar link”.
- Acciones principales:
  - Descargar PDF;
  - Copiar link;
  - Regenerar PDF.
- Acción peligrosa separada:
  - Revocar certificación.
- Aviso:
  “El QR es permanente. Si se corrigen fechas o asistencias, se realiza una nueva entrega manual (copiar link / descargar PDF) al alumno con el mismo QR. El sistema NO envía emails.”
- Historial breve:
  - creada;
  - emitida;
  - entrega manual realizada;
  - PDF regenerado;
  - asistencia modificada;
  - revocada.

Regla importante sobre firmas y cargos:
Los datos de autoridades y firmas NO deben aparecer como campos editables dentro de esta pantalla.
La pantalla solo debe mostrarlos en la vista previa.

Deben venir desde Configuración institucional:
- nombre del rector/a;
- cargo del rector/a;
- firma digital del rector/a;
- nombre del/la asesor/a pedagógico/a;
- cargo del/la asesor/a pedagógico/a;
- firma digital del/la asesor/a pedagógico/a.

Usar como ejemplo:
- Rector / Rectora del IFTS 14;
- Asesor / Asesora Pedagógica del IFTS 14.

Podés incluir una microleyenda discreta:
“Firmas y autoridades obtenidas desde Configuración institucional”.

Reglas y límites:
- El QR debe ser protagonista secundario, no decoración.
- Separá claramente acciones normales y acción peligrosa.
- Las fechas presentes deben ser fáciles de revisar.
- La vista previa del certificado debe sentirse institucional y cercana al PDF real.
- No inventar perfil público del alumno.
- No agregar aprobación de Rectorado.
- No hacer dashboard de métricas.

Evitá:
- dashboard SaaS genérico;
- CRM comercial;
- fintech;
- grillas repetidas de cards;
- gráficos;
- métricas decorativas;
- colores Tailwind por defecto sin identidad;
- íconos decorativos excesivos;
- firmas/cargos editables en esta pantalla.

Responsive:
Desktop-first con mobile usable.
En desktop, la vista previa y las acciones deben estar muy claras.
En mobile, priorizar datos, QR y acciones principales en orden lógico.

Resultado esperado:
- pantalla visualmente refinada y coherente con el sistema;
- composición tipo expediente documental;
- vista previa del certificado integrada;
- QR/link claros;
- acciones normales y revocación separadas;
- contenido obligatorio completo;
- al final, explicar brevemente qué decisiones visuales tomaste y qué mejoraste respecto de Stitch.
```

---

## 12. Vista previa PDF complementario

## Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para una vista previa de PDF horizontal con QR del IFTS N.° 14.

Contexto:
El instituto ya compartió un certificado real. El PDF del MVP debe parecerse mucho a ese certificado:
- formato horizontal;
- fondo/marco azul oscuro;
- panel celeste claro;
- estética técnica con circuitos/energía;
- jerarquía institucional;
- presencia de logos oficiales.

El PDF será una variante complementaria con QR y link de validación oficial.

Objetivo:
Mostrar cómo se vería un certificado horizontal institucional, sobrio, imprimible y verificable, incorporando QR/link sin romper la identidad del certificado real.

Dirección visual:
Certificado institucional horizontal con QR integrado.
Debe sentirse cercano al certificado real del IFTS 14, no como diploma genérico ni PDF SaaS.

Generá 3 direcciones:
1. Variante muy cercana al certificado real, con QR integrado en zona de control.
2. Certificado horizontal técnico con banda QR lateral.
3. Certificado horizontal institucional con bloque inferior de validación digital.

Contenido obligatorio:
- Logos/placeholders autorizados:
  - escudo;
  - Buenos Aires Aprende;
  - Agencia de Habilidades para el Futuro;
  - IFTS 14;
  - BA Ciudad.
- Título principal: “CERTIFICADO”.
- Texto institucional:
  “El Instituto de Formación Técnica Superior N.° 14 certifica que…”.
- Nombre y apellido: María González.
- DNI ficticio: DNI-FICT-V001.
- Curso: Introducción a Sistemas Embebidos e Internet de las Cosas.
- Fechas presentes:
  - 05/06/2026
  - 12/06/2026
  - 19/06/2026
- Fecha de emisión: 20/06/2026.
- Número de certificado: IFTS14-CUR-2026-0001.
- QR placeholder.
- Link de validación escrito.
- Texto:
  “Este documento puede validarse escaneando el código QR.”
- Firmantes institucionales:
  - Rector / Rectora del IFTS 14;
  - Asesor / Asesora Pedagógica del IFTS 14.
- Espacios de firma digital asociados a esos firmantes.
- Sello institucional si aplica.

Regla importante:
Los nombres, cargos, firmas digitales, logos y textos base provienen de Configuración institucional.
No son editables dentro de la emisión individual.

Composición:
- Formato horizontal.
- Parecido fuerte al certificado real del instituto.
- Panel central celeste claro.
- Marco o fondo azul noche institucional.
- Detalles técnicos/circuitos sutiles.
- QR integrado como control documental.
- Fechas como registro de asistencia.
- Autoridades visibles al pie.
- Debe verse imprimible.

Evitar:
- Formato vertical.
- Diploma ceremonial genérico.
- Certificado escolar infantil.
- Gradientes decorativos.
- Glassmorphism.
- Diseño SaaS.
- Firmas falsas.
- Logos inventados.
- QR pegado a último momento.
```

## Prompt para v0

```txt
Usá la captura adjunta de Google Stitch como punto de partida visual, no como una maqueta rígida.

Usá también como referencia conceptual fuerte el certificado institucional real del IFTS N.° 14.
La vista previa debe parecerse visualmente mucho a ese certificado real, aunque podés simplificar detalles si mejora legibilidad o implementación.

Antes de diseñar, aplicá las skills de diseño/frontend disponibles:
- frontend-design;
- high-end visual design;
- web design guidelines;
- design taste;
- accessibility;
- anti-cliché UI;
- responsive design;
- component quality.

El proyecto final se portará a Angular 20 + Tailwind. Para esta etapa podés generar React/Tailwind, HTML/Tailwind o una estructura equivalente, pero evitá dependencias innecesarias y no uses APIs específicas de Next.js.

Ruta conceptual:
Vista previa administrativa / PDF horizontal

Objetivo:
Diseñar una vista previa del PDF complementario que se parezca mucho al certificado real provisto por el IFTS 14, pero incorporando QR y link de validación.

Contenido obligatorio:
- formato horizontal similar al certificado real del IFTS 14;
- IFTS N.° 14;
- título principal “CERTIFICADO” o “CERTIFICACIÓN”;
- logos/placeholders autorizados:
  - escudo;
  - Buenos Aires Aprende;
  - Agencia de Habilidades para el Futuro;
  - IFTS 14;
  - BA Ciudad;
- texto institucional adaptado:
  “El Instituto de Formación Técnica Superior N.° 14 certifica que…”
- nombre y apellido;
- DNI completo;
- curso;
- fechas presentes;
- fecha de emisión;
- número de certificado;
- QR placeholder;
- link de validación escrito;
- texto:
  “Este documento puede validarse escaneando el código QR.”
- firmantes institucionales:
  - Rector / Rectora del IFTS 14;
  - Asesor / Asesora Pedagógica del IFTS 14;
- espacios de firma digital asociados;
- sello institucional si aplica.

Regla importante:
Los nombres, cargos, firmas, logos y texto base vienen de Configuración institucional.
No son campos editables en esta vista previa ni en la emisión individual.

Estilo:
- marco azul oscuro;
- panel central celeste claro;
- composición horizontal;
- motivos técnicos/circuitos;
- identidad institucional;
- QR integrado como control documental;
- autoridades visibles al pie;
- visual imprimible.

Evitar:
- formato vertical;
- diploma genérico;
- diseño SaaS;
- QR pegado sin intención;
- logos inventados;
- firmas falsas;
- fondos oscuros que dificulten impresión.

Resultado esperado:
- vista previa horizontal refinada;
- muy inspirada en el certificado real;
- QR y link integrados;
- firmantes globales visibles;
- composición imprimible;
- al final, explicar qué decisiones visuales tomaste.
```

---

## 13. Listado de cursos

### Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para la pantalla administrativa de listado de cursos del sistema de certificaciones QR del IFTS N.° 14.

Ruta conceptual:
/admin/cursos

Objetivo:
Bedelía puede ver cursos cargados, buscar, filtrar, crear uno nuevo y entrar al detalle.

Dirección visual:
Archivo académico administrativo. Debe sentirse como gestión institucional, no como CRM comercial ni dashboard SaaS.

Contenido:
- Header/sidebar admin.
- Título: “Cursos”.
- Botón principal: “Nuevo curso”.
- Buscador por nombre.
- Filtros: activos, inactivos, con fechas cargadas, sin fechas.
- Tabla/lista de cursos:
  - nombre del curso;
  - cantidad de fechas;
  - cantidad de alumnos con asistencias presentes;
  - cantidad de certificaciones emitidas;
  - estado;
  - acciones “Ver detalle” y “Editar”.
- Empty state:
  - “Todavía no hay cursos cargados.”
  - Acción “Crear primer curso”.

Composición:
- Desktop con tabla clara.
- Mobile con cards compactas.
- Priorizar búsqueda y acción rápida.
- No usar grillas grandes.
- No usar métricas gigantes.

Evitar:
- CRM comercial.
- SaaS dashboard.
- Cards repetidas.
- Emojis.
- Colores Tailwind genéricos.
- Gradientes.
```

### Prompt para v0

```txt
Usá la captura adjunta de Google Stitch como punto de partida visual, no como una maqueta rígida.

Antes de diseñar, aplicá las skills de diseño/frontend que estén disponibles en el entorno, especialmente criterios de:
- frontend-design;
- high-end visual design;
- web design guidelines;
- design taste;
- accessibility;
- anti-cliché UI;
- responsive design;
- component quality.

Tenés libertad para mejorar la interfaz si detectás que la captura de Stitch tiene problemas de jerarquía, composición, espaciado, accesibilidad, densidad, responsive, contraste o identidad visual. No copies errores por fidelidad.

Mantené las reglas funcionales y el contenido obligatorio, pero podés proponer una composición mejor si ayuda a que la pantalla se sienta más auténtica, institucional, moderna y usable.

El proyecto final se portará a Angular 20 + Tailwind. Para esta etapa podés generar React/Tailwind, HTML/Tailwind o la estructura que mejor resuelva el diseño visual, pero evitá dependencias innecesarias y no uses APIs específicas de Next.js que dificulten el port.

Ruta conceptual:
/admin/cursos

Objetivo de esta pantalla:
Permitir que Bedelía vea cursos cargados, busque, filtre, cree uno nuevo y entre al detalle. Debe sentirse como archivo académico administrativo.

Dirección visual esperada:
- mesa de trabajo de Bedelía;
- archivo institucional digital;
- sistema administrativo académico;
- herramienta clara para operar cursos, asistencias y certificaciones.

Podés mejorar:
- arquitectura de información;
- jerarquía de acciones;
- densidad de tablas;
- estados empty/loading/error;
- orden de formularios;
- navegación admin;
- responsive desktop-first con mobile usable.

Evitá:
- dashboard SaaS genérico;
- métricas decorativas sin valor;
- grillas de cards repetidas;
- CRM comercial;
- fintech;
- colores Tailwind por defecto sin identidad;
- íconos decorativos excesivos;
- gráficos si no aportan.

Contenido obligatorio:
- Header/sidebar admin.
- Título: “Cursos”.
- Botón principal: “Nuevo curso”.
- Buscador por nombre.
- Filtros: activos, inactivos, con fechas cargadas, sin fechas.
- Tabla/lista de cursos: nombre del curso, cantidad de fechas, cantidad de alumnos con asistencias presentes, cantidad de certificaciones emitidas, estado, acciones Ver detalle y Editar.
- Empty state: “Todavía no hay cursos cargados.” + acción “Crear primer curso”.

Reglas y límites:
- Desktop con tabla clara.
- Mobile con cards compactas si hace falta.
- Priorizar búsqueda, filtros y acción Nuevo curso.
- No usar grillas grandes ni métricas gigantes.



Resultado esperado:
- generá una pantalla visualmente refinada y coherente con el sistema;
- si cambiás la composición respecto de Stitch, que sea por una mejora clara;
- mantené el contenido obligatorio;
- cuidá responsive, contraste y accesibilidad;
- al final, explicá brevemente qué decisiones visuales tomaste y qué mejoraste respecto de la captura.
```

---

## 14. Detalle de curso

### Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para la pantalla administrativa de detalle de curso del sistema de certificaciones QR del IFTS N.° 14.

Ruta conceptual:
/admin/cursos/:id

Objetivo:
Bedelía revisa un curso, sus fechas, alumnos con asistencia y certificaciones asociadas.

Dirección visual:
Expediente académico de curso. Debe sentirse como ficha operativa institucional.

Contenido:
- Header/sidebar admin.
- Título con nombre del curso.
- Datos: descripción, carga horaria opcional, modalidad opcional, estado.
- Acciones: Editar curso, Agregar fecha, Cargar asistencias, Generar certificaciones, Ver certificaciones.
- Sección “Fechas del curso”: fecha, horario, cantidad de presentes, acción Ver asistencias.
- Sección “Alumnos con asistencias presentes”: alumno, DNI, email, cantidad de fechas presentes, estado de certificación, acción Ver certificación.
- Avisos: curso sin fechas; cambios que requieren nueva entrega manual de certificados.

Composición:
- Desktop con buena densidad.
- Mobile usable.
- Fechas y asistencias como protagonistas.
- Usar tablas/listas, no cards grandes.
- Acciones claras arriba.

Evitar:
- Dashboard SaaS.
- Gráficos.
- Cards enormes.
- Concepto de edición/cohorte.
- Porcentajes de asistencia.
```

### Prompt para v0

```txt
Usá la captura adjunta de Google Stitch como punto de partida visual, no como una maqueta rígida.

Antes de diseñar, aplicá las skills de diseño/frontend que estén disponibles en el entorno, especialmente criterios de:
- frontend-design;
- high-end visual design;
- web design guidelines;
- design taste;
- accessibility;
- anti-cliché UI;
- responsive design;
- component quality.

Tenés libertad para mejorar la interfaz si detectás que la captura de Stitch tiene problemas de jerarquía, composición, espaciado, accesibilidad, densidad, responsive, contraste o identidad visual. No copies errores por fidelidad.

Mantené las reglas funcionales y el contenido obligatorio, pero podés proponer una composición mejor si ayuda a que la pantalla se sienta más auténtica, institucional, moderna y usable.

El proyecto final se portará a Angular 20 + Tailwind. Para esta etapa podés generar React/Tailwind, HTML/Tailwind o la estructura que mejor resuelva el diseño visual, pero evitá dependencias innecesarias y no uses APIs específicas de Next.js que dificulten el port.

Ruta conceptual:
/admin/cursos/:id

Objetivo de esta pantalla:
Permitir que Bedelía revise un curso, sus fechas, alumnos con asistencia y certificaciones asociadas. Debe funcionar como expediente académico de curso.

Dirección visual esperada:
- mesa de trabajo de Bedelía;
- archivo institucional digital;
- sistema administrativo académico;
- herramienta clara para operar cursos, asistencias y certificaciones.

Podés mejorar:
- arquitectura de información;
- jerarquía de acciones;
- densidad de tablas;
- estados empty/loading/error;
- orden de formularios;
- navegación admin;
- responsive desktop-first con mobile usable.

Evitá:
- dashboard SaaS genérico;
- métricas decorativas sin valor;
- grillas de cards repetidas;
- CRM comercial;
- fintech;
- colores Tailwind por defecto sin identidad;
- íconos decorativos excesivos;
- gráficos si no aportan.

Contenido obligatorio:
- Header/sidebar admin.
- Título con nombre del curso.
- Datos del curso: descripción, carga horaria opcional, modalidad opcional, estado.
- Acciones: Editar curso, Agregar fecha, Cargar asistencias, Generar certificaciones, Ver certificaciones.
- Sección “Fechas del curso”: fecha, horario, cantidad de presentes, acción Ver asistencias.
- Sección “Alumnos con asistencias presentes”: alumno, DNI, email, cantidad de fechas presentes, estado de certificación, acción Ver certificación.
- Avisos: curso sin fechas; cambios que requieren nueva entrega manual de certificados.

Reglas y límites:
- Fechas y asistencias deben ser protagonistas.
- Usá tablas/listas institucionales antes que cards grandes.
- No incluir edición/cohorte.
- No incluir porcentajes de asistencia.
- Podés reorganizar en pestañas si mejora la navegación.



Resultado esperado:
- generá una pantalla visualmente refinada y coherente con el sistema;
- si cambiás la composición respecto de Stitch, que sea por una mejora clara;
- mantené el contenido obligatorio;
- cuidá responsive, contraste y accesibilidad;
- al final, explicá brevemente qué decisiones visuales tomaste y qué mejoraste respecto de la captura.
```

---

## 15. Listado de certificaciones

### Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para la pantalla administrativa de listado de certificaciones del IFTS N.° 14.

Ruta conceptual:
/admin/certificaciones

Objetivo:
Bedelía puede buscar certificaciones emitidas o revocadas, revisar estado y entrar al detalle.

Dirección visual:
Archivo documental de certificaciones.

Contenido:
- Header/sidebar admin.
- Título: “Certificaciones”.
- Botón principal: “Nueva certificación”.
- Buscador por alumno, DNI, curso o número de certificado.
- Filtros: válidas, revocadas, entregadas, pendientes de entrega manual, requieren nueva entrega manual.
- Tabla/lista:
  - número de certificado;
  - alumno;
  - DNI;
  - curso;
  - fecha de emisión;
  - estado;
  - estado de entrega (pendiente / entregada manualmente);
  - acción “Ver detalle”.
- Empty state.

Composición:
- Desktop con tabla.
- Mobile con cards compactas.
- Mucha claridad en estados.
- No usar gráficos.

Evitar:
- Dashboard SaaS.
- Cards enormes.
- Métricas decorativas.
- Exceso de colores.
```

### Prompt para v0

```txt
Usá la captura adjunta de Google Stitch como punto de partida visual, no como una maqueta rígida.

Antes de diseñar, aplicá las skills de diseño/frontend que estén disponibles en el entorno, especialmente criterios de:
- frontend-design;
- high-end visual design;
- web design guidelines;
- design taste;
- accessibility;
- anti-cliché UI;
- responsive design;
- component quality.

Tenés libertad para mejorar la interfaz si detectás que la captura de Stitch tiene problemas de jerarquía, composición, espaciado, accesibilidad, densidad, responsive, contraste o identidad visual. No copies errores por fidelidad.

Mantené las reglas funcionales y el contenido obligatorio, pero podés proponer una composición mejor si ayuda a que la pantalla se sienta más auténtica, institucional, moderna y usable.

El proyecto final se portará a Angular 20 + Tailwind. Para esta etapa podés generar React/Tailwind, HTML/Tailwind o la estructura que mejor resuelva el diseño visual, pero evitá dependencias innecesarias y no uses APIs específicas de Next.js que dificulten el port.

Ruta conceptual:
/admin/certificaciones

Objetivo de esta pantalla:
Permitir que Bedelía busque certificaciones emitidas o revocadas, revise estados y entre al detalle. Debe sentirse como archivo documental de certificaciones.

Dirección visual esperada:
- mesa de trabajo de Bedelía;
- archivo institucional digital;
- sistema administrativo académico;
- herramienta clara para operar cursos, asistencias y certificaciones.

Podés mejorar:
- arquitectura de información;
- jerarquía de acciones;
- densidad de tablas;
- estados empty/loading/error;
- orden de formularios;
- navegación admin;
- responsive desktop-first con mobile usable.

Evitá:
- dashboard SaaS genérico;
- métricas decorativas sin valor;
- grillas de cards repetidas;
- CRM comercial;
- fintech;
- colores Tailwind por defecto sin identidad;
- íconos decorativos excesivos;
- gráficos si no aportan.

Contenido obligatorio:
- Header/sidebar admin.
- Título: “Certificaciones”.
- Botón principal: “Nueva certificación”.
- Buscador por alumno, DNI, curso o número de certificado.
- Filtros: válidas, revocadas, entregadas, pendientes de entrega manual, requieren nueva entrega manual.
- Tabla/lista: número de certificado, alumno, DNI, curso, fecha de emisión, estado, estado de entrega (pendiente / entregada manualmente), acción Ver detalle.
- Empty state.

Reglas y límites:
- Desktop con tabla clara y densa.
- Mobile con cards compactas si es necesario.
- Estados claros sin exceso de colores.
- No usar gráficos ni métricas decorativas.



Resultado esperado:
- generá una pantalla visualmente refinada y coherente con el sistema;
- si cambiás la composición respecto de Stitch, que sea por una mejora clara;
- mantené el contenido obligatorio;
- cuidá responsive, contraste y accesibilidad;
- al final, explicá brevemente qué decisiones visuales tomaste y qué mejoraste respecto de la captura.
```

---

## 16. Listado de alumnos

### Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para la pantalla administrativa de listado de alumnos del sistema de certificaciones QR del IFTS N.° 14.

Ruta conceptual:
/admin/alumnos

Objetivo:
Bedelía puede buscar alumnos y revisar sus certificaciones.

Dirección visual:
Registro administrativo de alumnos. No debe parecer CRM comercial ni red social.

Contenido:
- Header/sidebar admin.
- Título: “Alumnos”.
- Botón principal: “Nuevo alumno”.
- Buscador por nombre, apellido o DNI.
- Filtros: con certificaciones, sin certificaciones, sin email.
- Tabla/lista:
  - nombre y apellido;
  - DNI;
  - email;
  - cantidad de cursos con asistencia;
  - cantidad de certificaciones válidas;
  - acción “Ver detalle”.
- Empty state.

Composición:
- Desktop con tabla.
- Mobile con cards compactas.
- Priorizar búsqueda.
- No mostrar perfil público del alumno.
- No mostrar token público del alumno.

Evitar:
- CRM comercial.
- Avatar grande tipo red social.
- Estadísticas decorativas.
- Exceso de badges.
- SaaS genérico.
```

### Prompt para v0

```txt
Usá la captura adjunta de Google Stitch como punto de partida visual, no como una maqueta rígida.

Antes de diseñar, aplicá las skills de diseño/frontend que estén disponibles en el entorno, especialmente criterios de:
- frontend-design;
- high-end visual design;
- web design guidelines;
- design taste;
- accessibility;
- anti-cliché UI;
- responsive design;
- component quality.

Tenés libertad para mejorar la interfaz si detectás que la captura de Stitch tiene problemas de jerarquía, composición, espaciado, accesibilidad, densidad, responsive, contraste o identidad visual. No copies errores por fidelidad.

Mantené las reglas funcionales y el contenido obligatorio, pero podés proponer una composición mejor si ayuda a que la pantalla se sienta más auténtica, institucional, moderna y usable.

El proyecto final se portará a Angular 20 + Tailwind. Para esta etapa podés generar React/Tailwind, HTML/Tailwind o la estructura que mejor resuelva el diseño visual, pero evitá dependencias innecesarias y no uses APIs específicas de Next.js que dificulten el port.

Ruta conceptual:
/admin/alumnos

Objetivo de esta pantalla:
Permitir que Bedelía busque alumnos y revise sus certificaciones. Debe sentirse como registro administrativo de alumnos, no como CRM ni red social.

Dirección visual esperada:
- mesa de trabajo de Bedelía;
- archivo institucional digital;
- sistema administrativo académico;
- herramienta clara para operar cursos, asistencias y certificaciones.

Podés mejorar:
- arquitectura de información;
- jerarquía de acciones;
- densidad de tablas;
- estados empty/loading/error;
- orden de formularios;
- navegación admin;
- responsive desktop-first con mobile usable.

Evitá:
- dashboard SaaS genérico;
- métricas decorativas sin valor;
- grillas de cards repetidas;
- CRM comercial;
- fintech;
- colores Tailwind por defecto sin identidad;
- íconos decorativos excesivos;
- gráficos si no aportan.

Contenido obligatorio:
- Header/sidebar admin.
- Título: “Alumnos”.
- Botón principal: “Nuevo alumno”.
- Buscador por nombre, apellido o DNI.
- Filtros: con certificaciones, sin certificaciones, sin email.
- Tabla/lista: nombre y apellido, DNI, email, cantidad de cursos con asistencia, cantidad de certificaciones válidas, acción Ver detalle.
- Empty state.

Reglas y límites:
- No mostrar perfil público del alumno.
- No mostrar token público del alumno.
- No usar avatar grande ni estética social.
- Priorizar búsqueda rápida.



Resultado esperado:
- generá una pantalla visualmente refinada y coherente con el sistema;
- si cambiás la composición respecto de Stitch, que sea por una mejora clara;
- mantené el contenido obligatorio;
- cuidá responsive, contraste y accesibilidad;
- al final, explicá brevemente qué decisiones visuales tomaste y qué mejoraste respecto de la captura.
```

---

## 17. Detalle de alumno administrativo

### Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para la pantalla administrativa de detalle de alumno del sistema de certificaciones QR del IFTS N.° 14.

Ruta conceptual:
/admin/alumnos/:id

Objetivo:
Bedelía puede revisar los datos del alumno, sus cursos con asistencias presentes y sus certificaciones.

Dirección visual:
Legajo administrativo simple. No perfil social.

Contenido:
- Header/sidebar admin.
- Datos del alumno: nombre, apellido, DNI completo, email.
- Acciones: Editar datos, Nueva certificación, Entrega manual, Ver asistencias.
- Resumen: cursos con asistencia, certificaciones válidas, certificaciones revocadas.
- Sección “Cursos con asistencias presentes”: nombre del curso, fechas presentes, estado de certificación, acción Ver certificación.
- No incluir perfil público del alumno.
- No incluir token público del alumno.

Composición:
- Desktop-first.
- Mobile usable.
- Legajo institucional.
- Fechas y certificaciones claras.
- No parecer red social.

Evitar:
- Avatar grande.
- Perfil público.
- Botón compartir perfil.
- Estadísticas de red social.
- Cards decorativas.
```

### Prompt para v0

```txt
Usá la captura adjunta de Google Stitch como punto de partida visual, no como una maqueta rígida.

Antes de diseñar, aplicá las skills de diseño/frontend que estén disponibles en el entorno, especialmente criterios de:
- frontend-design;
- high-end visual design;
- web design guidelines;
- design taste;
- accessibility;
- anti-cliché UI;
- responsive design;
- component quality.

Tenés libertad para mejorar la interfaz si detectás que la captura de Stitch tiene problemas de jerarquía, composición, espaciado, accesibilidad, densidad, responsive, contraste o identidad visual. No copies errores por fidelidad.

Mantené las reglas funcionales y el contenido obligatorio, pero podés proponer una composición mejor si ayuda a que la pantalla se sienta más auténtica, institucional, moderna y usable.

El proyecto final se portará a Angular 20 + Tailwind. Para esta etapa podés generar React/Tailwind, HTML/Tailwind o la estructura que mejor resuelva el diseño visual, pero evitá dependencias innecesarias y no uses APIs específicas de Next.js que dificulten el port.

Ruta conceptual:
/admin/alumnos/:id

Objetivo de esta pantalla:
Permitir que Bedelía revise los datos de un alumno, sus cursos con asistencias presentes y sus certificaciones. Debe sentirse como legajo administrativo simple.

Dirección visual esperada:
- mesa de trabajo de Bedelía;
- archivo institucional digital;
- sistema administrativo académico;
- herramienta clara para operar cursos, asistencias y certificaciones.

Podés mejorar:
- arquitectura de información;
- jerarquía de acciones;
- densidad de tablas;
- estados empty/loading/error;
- orden de formularios;
- navegación admin;
- responsive desktop-first con mobile usable.

Evitá:
- dashboard SaaS genérico;
- métricas decorativas sin valor;
- grillas de cards repetidas;
- CRM comercial;
- fintech;
- colores Tailwind por defecto sin identidad;
- íconos decorativos excesivos;
- gráficos si no aportan.

Contenido obligatorio:
- Header/sidebar admin.
- Datos del alumno: nombre, apellido, DNI completo, email.
- Acciones: Editar datos, Nueva certificación, Entrega manual, Ver asistencias.
- Resumen: cursos con asistencia, certificaciones válidas, certificaciones revocadas.
- Sección “Cursos con asistencias presentes”: nombre del curso, fechas presentes, estado de certificación, acción Ver certificación.

Reglas y límites:
- No incluir perfil público del alumno.
- No incluir token público del alumno.
- No parecer red social.
- Podés usar estructura de legajo con secciones o tabs si mejora la lectura.



Resultado esperado:
- generá una pantalla visualmente refinada y coherente con el sistema;
- si cambiás la composición respecto de Stitch, que sea por una mejora clara;
- mantené el contenido obligatorio;
- cuidá responsive, contraste y accesibilidad;
- al final, explicá brevemente qué decisiones visuales tomaste y qué mejoraste respecto de la captura.
```

---

## 18. Entrega manual de certificación

> MVP: el sistema NO envía emails. No hay SMTP, no hay PHPMailer, no hay "reenviar". Bedelía obtiene el link público de validación y descarga el PDF, y entrega la certificación al alumno por canal externo (presencial, WhatsApp, etc.). El QR/token es permanente.

### Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para un modal o pantalla administrativa de entrega manual de certificación del IFTS N.° 14.

Se abre desde:
/admin/certificaciones/:id

URL final esperada dentro del módulo:
/certificados/admin/certificaciones/:id

Objetivo:
Bedelía obtiene el link público de validación y el PDF de la certificación para entregarlos al alumno por canal externo (presencial, WhatsApp, etc.). El sistema NO envía emails.

Dirección visual:
Confirmación administrativa de entrega manual de documentación oficial.

Contenido:
- Título: "Entrega manual de certificación".
- Datos del certificado: alumno (nombre y apellido), DNI, curso, fechas presentes, número de certificado.
- Link público de validación (copiable): /validar/:tokenCertificacion.
- Acción: "Copiar link".
- Acción: "Descargar PDF".
- Mensaje: "El QR de validación es permanente. Entregá el link y el PDF al alumno por el canal que corresponda."
- Aclaración: "El sistema no envía emails. La entrega es manual."
- Aclaración: "El PDF se genera con la Configuración institucional vigente."
- Estado de confirmación: "Link copiado al portapapeles." / "PDF descargado."

Datos institucionales aplicados al PDF:
- logos;
- texto base;
- autoridades;
- cargos;
- firmas digitales.

Composición:
- Modal o panel lateral.
- Claro, directo.
- Sin editor de email.
- Sin configuración SMTP.
- Acciones principales visibles: Copiar link, Descargar PDF.

Reglas:
- El QR/token no cambia.
- No hay "reenviar": la entrega manual se puede repetir cuantas veces sea necesario, siempre con el mismo QR.
- No editar firmas/cargos en este flujo.

Evitar:
- Lenguaje técnico.
- Exceso de advertencias.
- Wizard largo.
- SaaS genérico.
- Cualquier mención a "enviar email", "reenviar", "SMTP" o "destinatario de email".
```

### Prompt para v0

```txt
Usá la captura adjunta de Google Stitch como punto de partida visual, no como una maqueta rígida.

Antes de diseñar, aplicá las skills de diseño/frontend que estén disponibles en el entorno, especialmente criterios de:
- frontend-design;
- high-end visual design;
- web design guidelines;
- design taste;
- accessibility;
- anti-cliché UI;
- responsive design;
- component quality.

Tenés libertad para mejorar la interfaz si detectás que la captura de Stitch tiene problemas de jerarquía, composición, espaciado, accesibilidad, densidad, responsive, contraste o identidad visual. No copies errores por fidelidad.

Mantené las reglas funcionales y el contenido obligatorio, pero podés proponer una composición mejor si ayuda a que la pantalla se sienta más auténtica, institucional, moderna y usable.

El proyecto final se portará a Angular 20 + Tailwind. Para esta etapa podés generar React/Tailwind, HTML/Tailwind o la estructura que mejor resuelva el diseño visual, pero evitá dependencias innecesarias y no uses APIs específicas de Next.js que dificulten el port.

Ruta conceptual:
Modal o panel desde /admin/certificaciones/:id

URL final esperada dentro del módulo:
/certificados/admin/certificaciones/:id

Objetivo de esta pantalla:
Permitir que Bedelía obtenga el link público de validación y el PDF de la certificación para entregarlos al alumno por canal externo. El sistema NO envía emails: la entrega es manual (copiar link / descargar PDF).

Dirección visual esperada:
- mesa de trabajo de Bedelía;
- archivo institucional digital;
- sistema administrativo académico;
- herramienta clara para operar cursos, asistencias y certificaciones.

Contenido obligatorio:
- Título: "Entrega manual de certificación".
- Datos del certificado: alumno, DNI, curso, fechas presentes, número de certificado.
- Link público de validación (copiable).
- Acciones: "Copiar link", "Descargar PDF", "Cancelar".
- Mensaje: "El QR de validación es permanente. Entregá el link y el PDF al alumno por el canal que corresponda."
- Aclaración: "El sistema no envía emails. La entrega es manual."
- Aclaración: "El PDF se genera con la Configuración institucional vigente."
- Estado de confirmación: "Link copiado al portapapeles." / "PDF descargado."

Reglas y límites:
- Puede ser modal, panel lateral o pantalla compacta, según lo que mejore el flujo.
- NO incluir editor de email.
- NO incluir configuración SMTP.
- NO usar lenguaje técnico.
- Acciones principales visibles y claras: Copiar link, Descargar PDF.
- El QR/token no cambia.
- El PDF usa logos, texto base, autoridades, cargos y firmas digitales desde Configuración institucional.
- No editar firmantes en este flujo.
- No hay "reenviar": la entrega manual se puede repetir con el mismo QR.

Evitá:
- dashboard SaaS genérico;
- métricas decorativas sin valor;
- grillas de cards repetidas;
- CRM comercial;
- fintech;
- colores Tailwind por defecto sin identidad;
- íconos decorativos excesivos;
- gráficos si no aportan;
- cualquier mención a "enviar email", "reenviar", "SMTP" o "destinatario de email".

Resultado esperado:
- generá una pantalla visualmente refinada y coherente con el sistema;
- si cambiás la composición respecto de Stitch, que sea por una mejora clara;
- mantené el contenido obligatorio;
- cuidá responsive, contraste y accesibilidad;
- al final, explicá brevemente qué decisiones visuales tomaste y qué mejoraste respecto de la captura.
```

## 19. Revocar certificación

### Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para el modal o pantalla administrativa de revocación de certificación del IFTS N.° 14.

Se abre desde:
/admin/certificaciones/:id

Objetivo:
Bedelía revoca una certificación. Es una acción crítica institucional.

Dirección visual:
Acción crítica documental. Seria, clara, con confirmación fuerte, pero sin alarmismo.

Contenido:
- Título: “Revocar certificación”.
- Mensaje: “Esta acción cambiará el estado público de la certificación. La validación por QR mostrará que fue revocada.”
- Datos mínimos: alumno, DNI, curso, número de certificado.
- Campo obligatorio: motivo de revocación.
- Confirmación: “Entiendo que esta certificación dejará de mostrarse como válida.”
- Acciones: Revocar certificación, Cancelar.
- Aviso: “La acción quedará registrada en auditoría.”

Composición:
- Modal o panel.
- Rojo moderado.
- Acción peligrosa separada.
- Mucha claridad.
- No mostrar fechas como vigentes.

Evitar:
- Rojo excesivo.
- Mensajes alarmistas.
- Confirmación débil.
- SaaS genérico.
```

### Prompt para v0

```txt
Usá la captura adjunta de Google Stitch como punto de partida visual, no como una maqueta rígida.

Antes de diseñar, aplicá las skills de diseño/frontend que estén disponibles en el entorno, especialmente criterios de:
- frontend-design;
- high-end visual design;
- web design guidelines;
- design taste;
- accessibility;
- anti-cliché UI;
- responsive design;
- component quality.

Tenés libertad para mejorar la interfaz si detectás que la captura de Stitch tiene problemas de jerarquía, composición, espaciado, accesibilidad, densidad, responsive, contraste o identidad visual. No copies errores por fidelidad.

Mantené las reglas funcionales y el contenido obligatorio, pero podés proponer una composición mejor si ayuda a que la pantalla se sienta más auténtica, institucional, moderna y usable.

El proyecto final se portará a Angular 20 + Tailwind. Para esta etapa podés generar React/Tailwind, HTML/Tailwind o la estructura que mejor resuelva el diseño visual, pero evitá dependencias innecesarias y no uses APIs específicas de Next.js que dificulten el port.

Ruta conceptual:
Modal o panel desde /admin/certificaciones/:id

Objetivo de esta pantalla:
Permitir que Bedelía revoque una certificación. Es una acción crítica institucional, por lo que debe tener confirmación fuerte y motivo obligatorio.

Dirección visual esperada:
- mesa de trabajo de Bedelía;
- archivo institucional digital;
- sistema administrativo académico;
- herramienta clara para operar cursos, asistencias y certificaciones.

Podés mejorar:
- arquitectura de información;
- jerarquía de acciones;
- densidad de tablas;
- estados empty/loading/error;
- orden de formularios;
- navegación admin;
- responsive desktop-first con mobile usable.

Evitá:
- dashboard SaaS genérico;
- métricas decorativas sin valor;
- grillas de cards repetidas;
- CRM comercial;
- fintech;
- colores Tailwind por defecto sin identidad;
- íconos decorativos excesivos;
- gráficos si no aportan.

Contenido obligatorio:
- Título: “Revocar certificación”.
- Mensaje: “Esta acción cambiará el estado público de la certificación. La validación por QR mostrará que fue revocada.”
- Datos mínimos: alumno, DNI, curso, número de certificado.
- Campo obligatorio: motivo de revocación.
- Confirmación: “Entiendo que esta certificación dejará de mostrarse como válida.”
- Acciones: Revocar certificación, Cancelar.
- Aviso: “La acción quedará registrada en auditoría.”

Reglas y límites:
- Puede ser modal o panel, pero debe sentirse más serio que una confirmación común.
- Rojo moderado y documental, no alarmista.
- La acción peligrosa debe estar separada visualmente.
- No mostrar fechas como vigentes.



Resultado esperado:
- generá una pantalla visualmente refinada y coherente con el sistema;
- si cambiás la composición respecto de Stitch, que sea por una mejora clara;
- mantené el contenido obligatorio;
- cuidá responsive, contraste y accesibilidad;
- al final, explicá brevemente qué decisiones visuales tomaste y qué mejoraste respecto de la captura.
```

---

## 20. Carga masiva placeholder

### Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para la pantalla administrativa de carga masiva del IFTS N.° 14.

Ruta conceptual:
/admin/carga-masiva

URL final esperada dentro del módulo:
/certificados/admin/carga-masiva

Contexto:
La carga masiva por Excel/CSV está prevista, pero el formato final todavía no está confirmado. La pantalla debe mostrar preparación y claridad, sin dar a entender que las reglas definitivas ya están cerradas.

Objetivo:
Importar alumnos, cursos y asistencias presentes desde una planilla.

Dirección visual:
Importador administrativo preventivo. Claro, sobrio, con validación previa.

Contenido:
- Header/sidebar admin.
- Título: “Carga masiva”.
- Texto: “Importá alumnos, cursos y asistencias desde una planilla.”
- Mensaje visible: “El formato final de la planilla está pendiente de confirmación.”
- Bloque de carga: Seleccionar archivo, Excel o CSV, Descargar plantilla de ejemplo.
- Vista previa mock: filas válidas, filas con errores, alumnos detectados, cursos detectados, asistencias presentes detectadas.
- Tabla de ejemplo: nombre, apellido, DNI, email, curso, fecha, asistencia presente.

Composición:
- Desktop-first.
- Bloque de carga claro.
- Vista previa con tabla.
- Errores visibles sin alarmar.
- No hacer que parezca cerrado si está pendiente.

Reglas:
- No incluir valores ausente o justificada en la planilla de ejemplo del MVP.
- La columna de asistencia debe representar “presente”, no un estado múltiple.
- Si el formato no está confirmado, mostrarlo como ejemplo tentativo.

Evitar:
- Procesamiento real.
- Reglas definitivas.
- Ausente/justificada.
- Dashboard SaaS.
- Exceso de colores.
- Columna genérica “estado” si puede sugerir ausente/justificada.
```

### Prompt para v0

```txt
Usá la captura adjunta de Google Stitch como punto de partida visual, no como una maqueta rígida.

Antes de diseñar, aplicá las skills de diseño/frontend que estén disponibles en el entorno, especialmente criterios de:
- frontend-design;
- high-end visual design;
- web design guidelines;
- design taste;
- accessibility;
- anti-cliché UI;
- responsive design;
- component quality.

Tenés libertad para mejorar la interfaz si detectás que la captura de Stitch tiene problemas de jerarquía, composición, espaciado, accesibilidad, densidad, responsive, contraste o identidad visual. No copies errores por fidelidad.

Mantené las reglas funcionales y el contenido obligatorio, pero podés proponer una composición mejor si ayuda a que la pantalla se sienta más auténtica, institucional, moderna y usable.

El proyecto final se portará a Angular 20 + Tailwind. Para esta etapa podés generar React/Tailwind, HTML/Tailwind o la estructura que mejor resuelva el diseño visual, pero evitá dependencias innecesarias y no uses APIs específicas de Next.js que dificulten el port.

Ruta conceptual:
/admin/carga-masiva

URL final esperada dentro del módulo:
/certificados/admin/carga-masiva

Objetivo de esta pantalla:
Diseñar la pantalla futura de carga masiva, dejando claro que el formato final de Excel/CSV todavía está pendiente de confirmación. Debe ser útil como placeholder realista del MVP.

Dirección visual esperada:
- mesa de trabajo de Bedelía;
- archivo institucional digital;
- sistema administrativo académico;
- herramienta clara para operar cursos, asistencias y certificaciones.

Contenido obligatorio:
- Header/sidebar admin.
- Título: “Carga masiva”.
- Texto: “Importá alumnos, cursos y asistencias desde una planilla.”
- Mensaje visible: “El formato final de la planilla está pendiente de confirmación.”
- Bloque de carga: Seleccionar archivo, Excel o CSV, Descargar plantilla de ejemplo.
- Vista previa mock: filas válidas, filas con errores, alumnos detectados, cursos detectados, asistencias presentes detectadas.
- Tabla de ejemplo: nombre, apellido, DNI, email, curso, fecha, asistencia presente.

Reglas y límites:
- No debe parecer una funcionalidad cerrada si las reglas todavía no están confirmadas.
- Errores visibles sin alarmar.
- No incluir estados ausente/justificada.
- No simular procesamiento real avanzado.
- No usar una columna “estado” si puede sugerir múltiples estados.
- No incluir valores ausente o justificada en la planilla de ejemplo del MVP.

Evitá:
- dashboard SaaS genérico;
- métricas decorativas sin valor;
- grillas de cards repetidas;
- CRM comercial;
- fintech;
- colores Tailwind por defecto sin identidad;
- íconos decorativos excesivos;
- gráficos si no aportan.

Resultado esperado:
- generá una pantalla visualmente refinada y coherente con el sistema;
- si cambiás la composición respecto de Stitch, que sea por una mejora clara;
- mantené el contenido obligatorio;
- cuidá responsive, contraste y accesibilidad;
- al final, explicá brevemente qué decisiones visuales tomaste y qué mejoraste respecto de la captura.
```

## 21. Auditoría básica

### Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para la pantalla administrativa de auditoría básica del IFTS N.° 14.

Ruta conceptual:
/admin/auditoria

Objetivo:
Ver historial de acciones administrativas relevantes: emisión, entrega manual, modificación de asistencias, modificación de fechas y revocación.

Dirección visual:
Bitácora institucional. Debe sentirse como registro administrativo confiable.

Contenido:
- Header/sidebar admin.
- Título: “Auditoría”.
- Filtros: usuario, acción, fecha, certificado, alumno/DNI.
- Lista cronológica:
  - fecha/hora;
  - usuario;
  - acción;
  - entidad afectada;
  - detalle breve.
- Ejemplos: Certificación emitida, Entrega manual realizada, Asistencia modificada, Curso actualizado, Certificación revocada.
- Empty state.
- Texto: “Este registro permite revisar cambios administrativos del sistema.”

Composición:
- Desktop con lista/tabla.
- Mobile con timeline compacta.
- Sobrio.
- No gráficos.
- No colores excesivos.

Evitar:
- Dashboard de analytics.
- Gráficos.
- Timeline decorativa.
- Estética de red social.
```

### Prompt para v0

```txt
Usá la captura adjunta de Google Stitch como punto de partida visual, no como una maqueta rígida.

Antes de diseñar, aplicá las skills de diseño/frontend que estén disponibles en el entorno, especialmente criterios de:
- frontend-design;
- high-end visual design;
- web design guidelines;
- design taste;
- accessibility;
- anti-cliché UI;
- responsive design;
- component quality.

Tenés libertad para mejorar la interfaz si detectás que la captura de Stitch tiene problemas de jerarquía, composición, espaciado, accesibilidad, densidad, responsive, contraste o identidad visual. No copies errores por fidelidad.

Mantené las reglas funcionales y el contenido obligatorio, pero podés proponer una composición mejor si ayuda a que la pantalla se sienta más auténtica, institucional, moderna y usable.

El proyecto final se portará a Angular 20 + Tailwind. Para esta etapa podés generar React/Tailwind, HTML/Tailwind o la estructura que mejor resuelva el diseño visual, pero evitá dependencias innecesarias y no uses APIs específicas de Next.js que dificulten el port.

Ruta conceptual:
/admin/auditoria

Objetivo de esta pantalla:
Permitir revisar historial de acciones administrativas relevantes: emisión, entrega manual, modificación de asistencias, modificación de fechas y revocación.

Dirección visual esperada:
- mesa de trabajo de Bedelía;
- archivo institucional digital;
- sistema administrativo académico;
- herramienta clara para operar cursos, asistencias y certificaciones.

Podés mejorar:
- arquitectura de información;
- jerarquía de acciones;
- densidad de tablas;
- estados empty/loading/error;
- orden de formularios;
- navegación admin;
- responsive desktop-first con mobile usable.

Evitá:
- dashboard SaaS genérico;
- métricas decorativas sin valor;
- grillas de cards repetidas;
- CRM comercial;
- fintech;
- colores Tailwind por defecto sin identidad;
- íconos decorativos excesivos;
- gráficos si no aportan.

Contenido obligatorio:
- Header/sidebar admin.
- Título: “Auditoría”.
- Filtros: usuario, acción, fecha, certificado, alumno/DNI.
- Lista cronológica: fecha/hora, usuario, acción, entidad afectada, detalle breve.
- Ejemplos: Certificación emitida, Entrega manual realizada, Asistencia modificada, Curso actualizado, Certificación revocada.
- Empty state.
- Texto: “Este registro permite revisar cambios administrativos del sistema.”

Reglas y límites:
- Debe sentirse como bitácora institucional.
- Desktop con tabla/lista; mobile con timeline compacta si ayuda.
- No usar gráficos de analytics.
- No hacer timeline decorativa tipo red social.



Resultado esperado:
- generá una pantalla visualmente refinada y coherente con el sistema;
- si cambiás la composición respecto de Stitch, que sea por una mejora clara;
- mantené el contenido obligatorio;
- cuidá responsive, contraste y accesibilidad;
- al final, explicá brevemente qué decisiones visuales tomaste y qué mejoraste respecto de la captura.
```

---

## 22. Configuración institucional

## Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para la pantalla administrativa de Configuración institucional del IFTS N.° 14.

Ruta conceptual:
/admin/configuracion

Objetivo:
Configurar datos institucionales globales que luego aparecen en:
- PDF/certificado;
- validación pública;
- emisión de certificaciones.
El sistema NO envía emails en el MVP (sin SMTP, sin PHPMailer); los datos de contacto institucional que aquí se configuran son metadata institucional/persona, no un sistema de envío automático.

Dirección visual:
Configuración institucional sobria.
Debe sentirse como panel administrativo académico, no settings SaaS genérico.

Contenido obligatorio:
- Header/sidebar admin.
- Título: “Configuración institucional”.
- Descripción:
  “Estos datos se aplican a los certificados emitidos por el sistema.”

Secciones:

1. Identidad institucional
- nombre visible del instituto;
- logo IFTS 14;
- escudo;
- logo Buenos Aires Aprende;
- logo Agencia de Habilidades para el Futuro;
- logo BA Ciudad;
- texto institucional base.

2. Certificados
- título del certificado;
- texto base del certificado;
- formato de número de certificado;
- texto de validación QR;
- link base de validación;
- sello institucional si aplica.

3. Autoridades y firmas
- nombre del rector/a;
- cargo del rector/a;
- firma digital del rector/a;
- nombre del/la asesor/a pedagógico/a;
- cargo del/la asesor/a pedagógico/a;
- firma digital del/la asesor/a pedagógico/a;
- vista previa de cómo se verán las firmas en el PDF.

4. Contacto institucional (metadata, sin envío automático)
- email de contacto institucional (solo dato institucional/persona; el sistema NO envía emails en el MVP);
- aviso de que el QR permanece igual en entregas manuales repetidas;
- aclaración: no hay SMTP, no hay PHPMailer, no hay "reenviar"; la entrega es manual (copiar link / descargar PDF).

5. Validación pública
- texto aclaratorio;
- enlace al sitio del instituto;
- mensaje de certificado válido;
- mensaje de certificado revocado;
- mensaje de token no encontrado.

Avisos:
- “Los cambios impactan en nuevos documentos generados.”
- “Si se modifican firmas o autoridades, los certificados ya compartidos manualmente no cambian hasta que se regenere el PDF.”
- “Estos datos no se editan en la pantalla de emisión individual.”

Composición:
- Desktop-first.
- Formulario por secciones.
- Navegación lateral o tabs si ayuda.
- Mucha claridad.
- Vista previa pequeña del bloque de firmas.
- No exceso de switches.

Evitar:
- Settings SaaS genérico.
- Configuración demasiado técnica.
- Campos sin explicación.
- Mezclar configuración institucional con emisión individual.
```

## Prompt para v0

```txt
Usá la captura adjunta de Google Stitch como punto de partida visual, no como una maqueta rígida.

Antes de diseñar, aplicá las skills de diseño/frontend disponibles:
- frontend-design;
- high-end visual design;
- web design guidelines;
- design taste;
- accessibility;
- anti-cliché UI;
- responsive design;
- component quality.

El proyecto final se portará a Angular 20 + Tailwind. Para esta etapa podés generar React/Tailwind, HTML/Tailwind o una estructura equivalente, pero evitá dependencias innecesarias y no uses APIs específicas de Next.js.

Ruta conceptual:
/admin/configuracion

Objetivo:
Diseñar la pantalla de Configuración institucional. Esta pantalla define los datos globales que luego aparecen en certificados, PDF y validación pública. El sistema NO envía emails en el MVP (sin SMTP, sin PHPMailer); los datos de contacto institucional que aquí se configuran son metadata institucional/persona, no un sistema de envío automático.

Importante:
Los nombres de autoridades, cargos, firmas digitales, logos y textos base se configuran acá.
No se editan en cada emisión individual.

Dirección visual:
- configuración institucional sobria;
- archivo administrativo;
- sistema académico;
- claridad para Bedelía o administrador;
- no settings SaaS genérico.

Contenido obligatorio:

Header/sidebar admin.
Título: “Configuración institucional”.
Texto:
“Estos datos se aplican a los certificados emitidos por el sistema.”

Sección 1 — Identidad institucional:
- nombre visible del instituto;
- logo IFTS 14;
- escudo;
- logo Buenos Aires Aprende;
- logo Agencia de Habilidades para el Futuro;
- logo BA Ciudad;
- texto institucional base.

Sección 2 — Certificados:
- título del certificado;
- texto base del certificado;
- formato de número de certificado;
- texto de validación QR;
- link base de validación;
- sello institucional si aplica.

Sección 3 — Autoridades y firmas:
- nombre del rector/a;
- cargo del rector/a;
- firma digital del rector/a;
- nombre del/la asesor/a pedagógico/a;
- cargo del/la asesor/a pedagógico/a;
- firma digital del/la asesor/a pedagógico/a;
- vista previa de cómo se verán las firmas en el PDF.

Usar como ejemplo:
- Rector / Rectora del IFTS 14;
- Asesor / Asesora Pedagógica del IFTS 14.

Sección 4 — Contacto institucional (metadata, sin envío automático):
- email de contacto institucional (solo dato institucional/persona; el sistema NO envía emails en el MVP);
- aviso de que el QR permanece igual en entregas manuales repetidas;
- aclaración: no hay SMTP, no hay PHPMailer, no hay "reenviar"; la entrega es manual (copiar link / descargar PDF).

Sección 5 — Validación pública:
- texto aclaratorio;
- enlace al sitio del instituto;
- mensaje de certificado válido;
- mensaje de certificado revocado;
- mensaje de token no encontrado.

Avisos obligatorios:
- “Los cambios impactan en nuevos documentos generados.”
- “Si se modifican firmas o autoridades, los certificados ya compartidos manualmente no cambian hasta que se regenere el PDF.”
- “Estos datos no se editan en la pantalla de emisión individual.”

Reglas:
- Formulario por secciones.
- Desktop-first con mobile usable.
- Campos con ayuda breve.
- Vista previa pequeña del bloque de firmas.
- Puede usar tabs o navegación lateral si mejora la claridad.
- No mezclar con emisión individual.
- No incluir datos técnicos de servidor o base de datos.

Evitar:
- settings SaaS genérico;
- configuración demasiado técnica;
- exceso de switches;
- campos sin explicación;
- estética de CRM;
- gráficos;
- métricas decorativas.

Resultado esperado:
- pantalla clara y sobria;
- fácil de entender para administración;
- deja evidente que firmantes y firmas vienen de configuración global;
- lista para portarse a Angular 20 + Tailwind;
- al final, explicar decisiones visuales.
```

---
