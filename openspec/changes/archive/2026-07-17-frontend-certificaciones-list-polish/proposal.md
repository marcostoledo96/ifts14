# Propuesta: Pulido del listado de certificaciones

## Intención

Mejorar la lectura y los estados operativos del listado para Bedelía, manteniendo paridad visual con v0 sin presentar información de entrega que el contrato real no provee.

## Alcance

### Incluido
- Badge de validez con punto y borde semántico para `vigente`, `revocado`, `vencido` y `borrador`.
- Filtros existentes `q`, curso y estado; conservar chips de estado y pulir su interacción.
- Empty state con icono Inbox SVG, texto “Emitir primera certificación” y CTA a `/admin/certificaciones/nueva`.
- CTA “Nueva certificación” visible; estados loading/error con iconos SVG.
- Angular 20, `OnPush`, UI en español y tests focalizados.

### Fuera de alcance
- Chips, filtro o columna “Entrega”: no existe campo de listado en modelo/API.
- Derivar entrega mediante consultas por certificación, modificar backend o inventar estado de envío.
- Cambiar rutas, paginación, privacidad o semántica funcional de los filtros.

## Capacidades

### Nuevas
Ninguna.

### Modificadas
- `admin-certifications-frontend`: alinear el listado real con estados de validez, vacíos y feedback visual; retirar `envio` del requisito de listado hasta contar con contrato API.

## Enfoque

Aplicar el enfoque 1 de la exploración: polish honesto sobre `CertificationsListPage`, reutilizando el modelo y filtros actuales. Representar los cuatro estados reales con semántica visual y accesible, sin ampliar DTO ni servicio HTTP.

## Áreas afectadas

| Área | Impacto |
|---|---|
| `pages/list/certifications-list-page.{html,css,ts}` | UI y estados |
| `pages/list/certifications-list-page.spec.ts` | Cobertura focalizada |
| `openspec/specs/admin-certifications-frontend` | Delta contractual |

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Confundir validez con entrega | Etiquetas basadas solo en `estado` |
| Regresión responsive/accesible | Preservar tabla/tarjetas y nombres accesibles |
| Desalineación con spec mock histórica | Delta explícito sin `envio` |

## Reversión

Revertir los archivos de lista y su delta spec; no hay migraciones, datos ni contratos backend que restaurar.

## Criterios de éxito

- [ ] Los cuatro estados tienen badge semántico con punto y borde.
- [ ] Vacío, carga y error son claros, accesibles y accionables.
- [ ] CTA nueva y filtros existentes funcionan sin mostrar entrega.
- [ ] Tests focalizados quedan verdes.

## Ronda de preguntas de propuesta

Supuestos revisables, adoptados para no interrumpir el ciclo: “Vigente” se muestra como “Válida”; el empty total ofrece emitir, mientras “sin resultados” conserva limpiar filtros; los chips siguen selección única; ningún estado consulta datos extra. El usuario puede corregirlos o pedir una segunda ronda.
