# Exploration + Proposal + Spec (compressed): frontend-parity-expediente (P-12)

## Gaps (v0 `expediente-certificacion.tsx` → Angular preview)

| # | Elemento v0 | Estado Angular | Decisión P-12 |
|---|-------------|----------------|---------------|
| E1 | Kicker mono `tracking-[0.16em]` circuit | membrete `0.22em` | **Calcar** `--tracking-section` (0.16em) |
| E2 | Group kickers `0.13em` + flush `px-4 pt-3` / divide-y | padding uniforme panel-body | **Densificar** ficha flush |
| E3 | FilaDato `px-4 py-2.5` | `py` solo | **Calcar** padding horizontal |
| E4 | QR 8×8 `h-24` `p-1.5` `gap-px` ink | similar | **Afinar** note footer muted |
| E5 | PDF primary ink; Entrega secondary | ambos `btn-pdf` tech-blue | **Separar** estilos |
| E6 | Firma italic “Firma digital verificada” + ShieldCheck SVG | emoji + “Autoridad firmante” | **Calcar** copy + SVG |
| E7 | Documento sin radius + shadow hairline | `border-radius` | **Quitar** radius |
| E8 | Badge con icono Shield/Ban | solo texto | **Agregar** SVG inline |
| E9 | Acciones note Lock + QR permanente | note técnica larga | **Alinear** copy v0 |
| — | Copiar/Compartir (C12) | OK | **No romper** |
| — | Entrega/PDF/Revocar pages | P-13 | **OUT OF SCOPE** |

## Spec REQ-PAR-EXP

- **REQ-PAR-EXP-001** Kickers mono circuit/muted con tracking v0; ficha densificada.
- **REQ-PAR-EXP-002** QR decorativo 64 celdas `aria-hidden`; note validación con fondo muted.
- **REQ-PAR-EXP-003** Descargar PDF primary ink; Entrega/Copiar/Compartir secondary; CTAs C12 intactos.
- **REQ-PAR-EXP-004** Documento réplica sin radius; firmas “Firma digital verificada” + SVG.

## Approach

Quirúrgico HTML/CSS (+ tests focados). Sin tocar `.ts` de lógica C12 salvo necesidad de clases. Recortar CSS muerto para budget 16kB.

## OUT OF SCOPE

delivery / pdf / revoke pages · backend · inventar campos (email, módulos, carga h) sin API.
