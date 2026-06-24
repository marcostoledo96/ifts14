# Prompts OpenCode — Matías — Frontend Angular 20 desde `muestra_pagina/`

## Objetivo de Matías

Portar diseños generados en v0/Next.js a Angular 20, manteniendo el aspecto visual aprobado y mejorándolo cuando sea necesario.

## Regla central

```txt
muestra_pagina/ es referencia visual, no implementación final.
```

No copiar:

- Next.js específico;
- React hooks;
- Server Components;
- rutas de Next;
- imports de shadcn si no existen en Angular;
- código de backend simulado de v0.

Sí tomar:

- layout;
- composición;
- paleta;
- tipografía;
- jerarquía;
- espaciados;
- comportamiento visual;
- estados UI;
- microinteracciones útiles.

## Ciclo F0-01 — Analizar `muestra_pagina/` y extraer sistema visual

**Rama sugerida:** `frontend/auditoria-muestra-pagina`

```txt
Ejecutá un ciclo SDD completo para analizar `muestra_pagina/` y extraer la dirección visual para Angular.

Rol:
Sos asistente frontend Angular 20 y UI/UX.

Contexto:
La carpeta `muestra_pagina/` contiene diseño generado por v0, probablemente en Next.js/React/Tailwind.
El objetivo es portarlo a Angular 20 con libertad para mejorar accesibilidad, performance y estructura, pero manteniendo la identidad visual.

Lectura mínima:
- AGENTS.md
- GUIA.md
- docs/frontend si existen
- muestra_pagina/
- docs/05-skills-dependencias.md si existe

Tareas:
1. Identificar pantallas presentes en muestra_pagina.
2. Extraer paleta, tipografía, layouts y componentes.
3. Detectar dependencias React/Next que no deben copiarse.
4. Detectar clases Tailwind útiles.
5. Detectar componentes equivalentes que habrá que crear en Angular.
6. Proponer design tokens.
7. Crear docs/frontend/01-auditoria-muestra-pagina.md.
8. Crear docs/frontend/02-sistema-diseno-angular.md.
9. No crear app Angular todavía si no está aprobada.

Reglas:
- No modificar muestra_pagina.
- No copiar código React a Angular.
- No implementar sin plan.
- No usar diseño genérico.
- Mantener estética institucional IFTS 14.

Al finalizar:
- listá pantallas detectadas;
- listá componentes a crear;
- listá tokens visuales;
- listá mejoras recomendadas;
- proponé commit.
```

## Ciclo F0-02 — Crear app Angular 20 base

**Rama sugerida:** `frontend/angular20-base`

```txt
Ejecutá un ciclo SDD completo para crear la base de la app Angular 20.

Rol:
Sos asistente frontend Angular 20.

Objetivo:
Crear `apps/frontend-angular/` con Angular 20, routing y Tailwind, sin implementar pantallas completas todavía.

Lectura mínima:
- AGENTS.md
- docs/frontend/01-auditoria-muestra-pagina.md si existe
- docs/frontend/02-sistema-diseno-angular.md si existe
- muestra_pagina/README.md

Tareas:
1. Verificar si ya existe apps/frontend-angular.
2. Si no existe, proponer comandos Angular CLI.
3. Crear app Angular con routing y estilos adecuados.
4. Agregar Tailwind con `ng add tailwindcss` si está disponible.
5. Crear estructura por features:
   - publico/validacion
   - admin/login
   - admin/dashboard
   - admin/cursos
   - admin/asistencias
   - admin/certificaciones
   - compartido
6. Crear rutas iniciales.
7. Crear mocks mínimos.
8. Crear README frontend.
9. Crear AGENTS.md frontend si no existe.
10. No conectar backend todavía.

Reglas:
- Angular 20.
- Tailwind.
- Componentes por feature.
- Código en español cuando sea código propio.
- Documentación en español argentino formal.
- No copiar Next.js.

Validaciones:
- npm install.
- ng build.
- ng test si está disponible.

Al finalizar:
- listá comandos usados;
- listá archivos creados;
- indicá cómo correr frontend;
- proponé commit.
```

## Ciclo F1-01 — Portar pantalla pública válida

**Rama sugerida:** `frontend/validacion-publica`

```txt
Ejecutá un ciclo SDD completo para portar la pantalla pública válida desde muestra_pagina a Angular 20.

Rol:
Sos asistente frontend Angular 20.

Ruta:
`/validar/:tokenCertificacion`

Tareas:
1. Leer spec de validación pública.
2. Leer fixture de certificación válida.
3. Leer diseño en muestra_pagina.
4. Crear componentes Angular necesarios.
5. Usar datos mock.
6. Mantener folio técnico institucional.
7. Mostrar DNI completo.
8. Mostrar curso, número, fechas presentes y código parcial.
9. Mantener responsive desktop/mobile.
10. No conectar backend real todavía.

Al finalizar:
- build;
- QA visual;
- documentación frontend actualizada;
- commit sugerido.
```

## Ciclo F1-02 — Portar estados no exitosos

**Rama sugerida:** `frontend/validacion-estados`

```txt
Ejecutá un ciclo SDD completo para portar los estados no exitosos de validación.

Estados:
- revocada;
- no encontrada;
- error técnico.

Reglas:
- Revocada puede mostrar datos mínimos.
- No encontrada no muestra datos personales.
- Error técnico no debe parecer certificado inválido.
- Mantener misma identidad visual.
- No mostrar fechas como vigentes en revocada.

Usar fixtures correspondientes.
Actualizar documentación.
Proponer commit.
```

## Ciclo F1-03 — Portar PDF preview

**Rama sugerida:** `frontend/pdf-preview`

```txt
Ejecutá un ciclo SDD completo para portar la vista previa del PDF horizontal con QR.

Reglas:
- Debe parecerse mucho al certificado real del IFTS 14.
- Debe ser horizontal.
- Debe incluir QR placeholder, link escrito, DNI completo, curso, fechas presentes, número y fecha de emisión.
- Logos como placeholders hasta conseguir assets.
- Firma/sello/autoridad como placeholders.
- No generar PDF real todavía salvo que ya esté definido.

Actualizar documentación y proponer commit.
```

## Ciclo F2-01 — Admin básico

**Rama sugerida:** `frontend/admin-basico`

```txt
Ejecutá un ciclo SDD completo para implementar pantallas admin básicas en Angular 20.

Pantallas:
- login;
- dashboard;
- cursos;
- fechas;
- asistencias;
- certificaciones.

Reglas:
- Desktop-first.
- Mesa de trabajo de Bedelía.
- No dashboard SaaS.
- Usar mocks.
- Preparar servicios para API PHP.
- Mantener diseño institucional.

Actualizar documentación.
Proponer commit.
```
