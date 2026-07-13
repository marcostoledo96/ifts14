# F5-04 — Entrega manual de certificación

## Objetivo
Implementar la interfaz administrativa que simula la entrega manual (presencial/fuera del sistema) de una certificación, proveyendo a Bedelía un enlace público de validación y acceso rápido al PDF (F4-02).

## Aspectos Clave

1. **Componente Modal (Overlay)**: Se implementó `CertificationDeliveryPage` sobreponiéndose (a nivel visual o logrando el layout) para la ruta `/certificaciones/:id/entrega` sin requerir recargas.
2. **Privacidad (Regla D0)**: Se implementó el enmascaramiento del DNI del alumno utilizando directamente `documentMasked` expuesto por el DTO `CertificacionDetalle`, garantizando que en el DOM nunca se incluya el DNI completo. 
3. **Validación Mock**: Como no existe backend de emails, Bedelía debe copiar la URL de validación. La URL generada de demostración usa el formato `https://ifts14.edu.ar/certificados/validar/{tokenPrefix}` y se copian correctamente al portapapeles.
4. **Handoff a F4-02**: El simulacro de descarga de PDF invoca una navegación hacia la ruta de la vista PDF oficial mediante el uso de `window.open` asegurando coherencia visual con el MVP original.

## Implementación Técnica
- **Rutas**: Se insertó de forma prioritaria la ruta `entrega` en `app.routes.ts` para que el `/:id/` genérico no devore la ruta.
- **Signals y fakeAsync**: Los eventos asíncronos para copias y simulaciones de descarga se manejan reactivamente sin mutaciones en el DOM, completamente amparados por tests en Jasmine.
- **CSS**: Paridad visual estricta con `muestra_pagina` evitando TailWind puro para mantener la arquitectura de estilos limpios del F1-02.

## Estado
- Aprobado y verificado.
- Cobertura de tests: 100% sobre lógicas de portapapeles, esperas de UI y D0.
