# Spec — frontend-design-system-readiness

## Purpose

Definir la base visual portable del módulo público `/certificados/` en Angular 20 a partir de la referencia v0, sin Tailwind ni nuevas dependencias. El sistema establece tokens CSS reutilizables, primitivos standalone mínimos y reglas de accesibilidad visual que sirven como fuente de verdad para los ciclos F2-F6.

## Requirements

### Requirement: Tokens visuales v0 en Angular

El sistema DEBE definir tokens CSS en Angular que traduzcan la intención visual v0 a variables reutilizables, sin Tailwind ni nuevas dependencias.

#### Scenario: Tokens disponibles para la app

- **Dado** el frontend Angular del módulo `/certificados/`
- **Cuando** se revisan los estilos globales
- **Entonces** DEBEN existir tokens para color, tipografía, radio, espaciado, foco y motion mínimo.
- **Y** los tokens DEBEN mapear la intención visual v0 sin copiar React/Next.

#### Scenario: Sin dependencia visual nueva

- **Dado** el ciclo F1-02 aprobado sin Tailwind
- **Cuando** se agregan tokens visuales
- **Entonces** NO SE DEBEN agregar Tailwind, shadcn, CVA, lucide, fuentes web ni helpers copiados de v0.

### Requirement: Primitivos Angular reutilizables y accesibles

El sistema DEBE proveer primitivos Angular standalone mínimos para composición institucional: `HeaderInstitucional`, `BandaEstado`, `CampoDato` y `FolioShell` o nombres finales equivalentes.

#### Scenario: Render reutilizable

- **Dado** una pantalla pública o futura pantalla administrativa
- **Cuando** consume los primitivos compartidos
- **Entonces** DEBE poder componer encabezado, estado, datos y folio sin duplicar estilos base.

#### Scenario: Accesibilidad mínima

- **Dado** una persona que navega con teclado o lector de pantalla
- **Cuando** interactúa con la UI construida con primitivos
- **Entonces** DEBEN conservarse semántica, foco visible y nombres/estados accesibles.

### Requirement: Validación pública alineada sin cambiar D0

La validación pública DEBE consumir tokens y primitivos visuales sin modificar contrato funcional, estados públicos ni reglas D0 vigentes.

#### Scenario: Certificado verificable conserva contrato

- **Dado** un certificado público vigente
- **Cuando** se renderiza con el sistema visual F1-02
- **Entonces** DEBE seguir mostrando DNI completo público y fechas asistidas.
- **Y** NO DEBE exponer token completo ni datos administrativos.

#### Scenario: Estados no verificables conservados

- **Dado** un certificado revocado, inexistente o con error técnico
- **Cuando** se aplica el nuevo sistema visual
- **Entonces** DEBE conservarse la distinción entre verificable, no verificable, carga y error técnico seguro.

### Requirement: Documentación como fuente de verdad visual

El sistema DEBE documentar el sistema visual F1-02 como fuente de verdad para ciclos F2-F6.

#### Scenario: Handoff visual documentado

- **Dado** un ciclo posterior de frontend
- **Cuando** necesita paleta, tipografía, espaciado, foco, motion o uso de primitivos
- **Entonces** DEBE encontrar la referencia vigente en `docs/frontend/02-sistema-visual-v0-f1-02.md` y el resumen actualizado del port v0.

#### Scenario: Límites explícitos del ciclo

- **Dado** la documentación F1-02
- **Cuando** se revisa el alcance
- **Entonces** DEBE excluir pantallas admin, backend, deploy, base, material privado, Tailwind y copia literal de React/Next.
