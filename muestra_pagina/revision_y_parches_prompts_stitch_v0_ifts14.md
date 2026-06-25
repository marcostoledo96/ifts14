# Revisión de prompts Stitch/v0 — IFTS 14 Certificaciones

Fecha: 2026-06-25

## Veredicto general

El archivo está bien encaminado, pero quedaron algunas secciones desactualizadas respecto de las decisiones más recientes del proyecto.

Los cambios más importantes a incorporar son:

1. El frontend final debe decir **Angular 20 + Tailwind**, no solamente Angular + Tailwind.
2. Como el módulo vivirá en `/certificados/`, conviene distinguir:
   - ruta conceptual interna: `/validar/:tokenCertificacion`;
   - URL final esperada: `/certificados/validar/:tokenCertificacion`;
   - rutas admin finales esperadas: `/certificados/admin/...`.
3. La pantalla de **registrar asistencias** debe reforzar que se cargan únicamente presentes, sin estados de ausencia/justificación.
4. La pantalla **10. Emitir certificación directa** quedó desactualizada en el markdown: debe incorporar que la vista previa se parece al certificado real del IFTS 14.
5. La pantalla **11. Detalle de certificación** debe actualizarse antes de seguir.
6. La pantalla **12. Vista previa PDF complementario** debe reflejar que firmas, cargos y autoridades vienen de Configuración institucional.
7. La pantalla **22. Configuración institucional** debe ampliarse porque ahora allí se definen firmantes, cargos, firmas digitales, logos y texto base del certificado.

---

## Cambios recomendados en contexto común

Reemplazar en el bloque de contexto:

```txt
- Frontend final: Angular + Tailwind.
```

por:

```txt
- Frontend final: Angular 20 + Tailwind.
- El diseño generado por Stitch/v0 se usa como referencia visual y luego se porta a Angular 20.
- El módulo final vivirá dentro de /certificados/.
- Ruta conceptual pública: /validar/:tokenCertificacion.
- URL final esperada en producción: /certificados/validar/:tokenCertificacion.
- Rutas admin conceptuales: /admin/...
- Rutas admin finales esperadas: /certificados/admin/...
```

Agregar también:

```txt
Datos institucionales globales:
- nombres y cargos de autoridades firmantes;
- firmas digitales;
- logos institucionales;
- texto base del certificado;
- numeración o formato de certificado.

Estos datos no se editan en cada emisión. Se configuran en Configuración institucional.
```

---

## Cambios necesarios por sección

| Sección | Estado | Acción recomendada |
|---|---|---|
| 4 Validación pública válida | Bien | Solo actualizar Angular 20 y ruta final `/certificados/validar/...`. |
| 5 Validación no exitosa | Bien | Solo actualizar Angular 20 y ruta final. |
| 6 Dashboard admin | Bien | Mantener. |
| 7 Login | Bien | Mantener. |
| 8 Crear/editar curso | Bien | Mantener. |
| 9 Registrar asistencias | Requiere ajuste | Reforzar “solo cargar presentes”, no estados. |
| 10 Emitir certificación | Desactualizada | Reemplazar por la versión basada en certificado real + firmantes globales. |
| 11 Detalle certificación | Requiere ajuste antes de continuar | Usar prompt actualizado de este documento. |
| 12 Vista previa PDF | Requiere ajuste | Alinear con certificado real y Configuración institucional. |
| 13 Listado cursos | Bien | Mantener. |
| 14 Detalle curso | Bien | Mantener. |
| 15 Listado certificaciones | Bien | Mantener. |
| 16 Listado alumnos | Bien | Mantener. |
| 17 Detalle alumno | Bien | Mantener. |
| 18 Enviar/reenviar | Ajuste menor | Aclarar mismo QR + PDF generado con configuración institucional vigente. |
| 19 Revocar | Bien | Mantener. |
| 20 Carga masiva | Ajuste menor | No usar columna “estado” si puede sugerir ausente/justificada; usar “presente” o “asistencia presente”. |
| 21 Auditoría | Bien | Mantener. |
| 22 Configuración institucional | Desactualizada | Reemplazar por versión ampliada. |

---

# Prompt actualizado — 11. Detalle de certificación

## Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para la pantalla administrativa de detalle de certificación del IFTS N.° 14.

Ruta conceptual:
/admin/certificaciones/:id

URL final esperada dentro del módulo:
/certificados/admin/certificaciones/:id

Objetivo:
Bedelía puede revisar una certificación ya emitida, verificar su estado, ver el PDF/certificado generado, consultar QR/link, reenviar, regenerar PDF o revocar si corresponde.

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
  - estado de envío;
  - fecha de último envío.
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
  - Enviar por email;
  - Reenviar certificado;
  - Regenerar PDF.
- Acción peligrosa:
  - Revocar certificación.
- Aviso:
  “El QR es permanente. Si se corrigen fechas o asistencias, se debe reenviar el PDF al alumno con el mismo QR.”
- Historial:
  - creada;
  - enviada;
  - reenviada;
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
Diseñar la pantalla administrativa de detalle de certificación. Bedelía debe poder revisar una certificación emitida, ver su estado, consultar los datos del alumno/curso, ver la vista previa del certificado/PDF, copiar el QR/link, descargar PDF, reenviar, regenerar PDF o revocar.

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
  - estado de envío;
  - fecha de último envío.
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
  - Enviar por email;
  - Reenviar certificado;
  - Regenerar PDF.
- Acción peligrosa separada:
  - Revocar certificación.
- Aviso:
  “El QR es permanente. Si se corrigen fechas o asistencias, se debe reenviar el PDF al alumno con el mismo QR.”
- Historial breve:
  - creada;
  - enviada;
  - reenviada;
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

# Prompt actualizado — 12. Vista previa PDF complementario

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
- DNI completo: 40.123.456.
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

# Prompt actualizado — 22. Configuración institucional

## Prompt para Google Stitch

```txt
Diseñá 3 variantes visuales para la pantalla administrativa de Configuración institucional del IFTS N.° 14.

Ruta conceptual:
/admin/configuracion

Objetivo:
Configurar datos institucionales globales que luego aparecen en:
- PDF/certificado;
- emails;
- validación pública;
- emisión de certificaciones.

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

4. Email
- remitente;
- asunto por defecto;
- texto base;
- aviso de que el QR permanece igual en reenvíos.

5. Validación pública
- texto aclaratorio;
- enlace al sitio del instituto;
- mensaje de certificado válido;
- mensaje de certificado revocado;
- mensaje de token no encontrado.

Avisos:
- “Los cambios impactan en nuevos documentos generados.”
- “Si se modifican firmas o autoridades, los certificados ya enviados no cambian hasta que se regenere el PDF.”
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
Diseñar la pantalla de Configuración institucional. Esta pantalla define los datos globales que luego aparecen en certificados, PDF, emails y validación pública.

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

Sección 4 — Email:
- remitente;
- asunto por defecto;
- texto base;
- aviso de que el QR permanece igual en reenvíos.

Sección 5 — Validación pública:
- texto aclaratorio;
- enlace al sitio del instituto;
- mensaje de certificado válido;
- mensaje de certificado revocado;
- mensaje de token no encontrado.

Avisos obligatorios:
- “Los cambios impactan en nuevos documentos generados.”
- “Si se modifican firmas o autoridades, los certificados ya enviados no cambian hasta que se regenere el PDF.”
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

## Cambios menores recomendados

### Sección 9 — Registrar asistencias

Agregar este párrafo a Stitch y v0:

```txt
Modelo funcional obligatorio:
Esta pantalla no administra estados de asistencia.
Bedelía solo construye el listado de alumnos presentes en una fecha.
Si un alumno no se carga como presente, simplemente no queda registrado como presente.
La ausencia es implícita y no debe mostrarse visualmente.
```

Y agregar en prohibiciones:

```txt
- No mostrar columna “estado” si puede sugerir ausente/justificada.
- No usar dropdowns, radios ni badges para estados múltiples.
- No mostrar observaciones de ausencia.
```

### Sección 10 — Emitir certificación

Reemplazar el prompt del markdown por la versión final usada después del ajuste del chat:

- vista previa parecida al certificado real;
- no “acta de aprobación” genérica;
- firmantes globales;
- Rector/a y Asesor/a Pedagógica como ejemplo;
- QR/link y PDF complementario.

### Sección 18 — Enviar / reenviar

Agregar:

```txt
El PDF enviado se genera con la Configuración institucional vigente:
- logos;
- texto base;
- autoridades;
- cargos;
- firmas digitales.
El QR no cambia.
```

### Sección 20 — Carga masiva

Reemplazar en tabla de ejemplo:

```txt
estado
```

por:

```txt
asistencia presente
```

Y agregar:

```txt
No incluir valores ausente o justificada en la planilla de ejemplo del MVP.
```

---

## Orden recomendado desde ahora

Como terminaste la 10, seguí así:

1. Actualizar la 11 con el prompt de este documento.
2. Generar Stitch para 11.
3. Elegir la variante.
4. Generar v0 para 11.
5. Si sale bien, seguir con 12 pero usando el prompt actualizado de este documento.
6. Después actualizar 22 antes de pedir Configuración institucional.

No hace falta rehacer 4, 5, 6, 7 y 8 salvo que visualmente no te convenzan.
