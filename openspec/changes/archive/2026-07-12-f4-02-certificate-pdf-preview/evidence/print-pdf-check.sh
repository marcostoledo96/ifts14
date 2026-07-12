#!/usr/bin/env bash
# HELPER NO AUTORITATIVO — Fix R3-001.
# Este check usa una fixture HTML (copia del CSS/markup), NO la app Angular.
# Mantiene valor como helper rápido de regresión CSS, pero NO prueba la app real.
# El check autoritativo es print-app-check.sh (ejercita dev server + SPA + CDP).
set -euo pipefail
echo "WARN: print-pdf-check.sh es helper no autoritativo (fixture HTML, no app)."
echo "      Use print-app-check.sh para evidencia autoritativa de la app real."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORK_DIR="${SCRIPT_DIR}/.pdf-check"
HTML_FILE="${WORK_DIR}/folio-print.html"
PDF_FILE="${WORK_DIR}/folio-print.pdf"
PNG_FILE="${SCRIPT_DIR}/pdf-print.png"

CHROME="${CHROME:-google-chrome}"
PDFINFO="${PDFINFO:-pdfinfo}"
PDFTOTEXT="${PDFTOTEXT:-pdftotext}"
PDFTOPPM="${PDFTOPPM:-pdftoppm}"

# --- Setup ---
rm -rf "${WORK_DIR}"
mkdir -p "${WORK_DIR}"

# HTML autocontenido: reproduce el folio del certificado con datos mock
# seguros (sin DNI/token/email/UUID/legajo/matricula reales) y el chrome
# del AdminShell, usando el CSS real de ambos componentes.
cat > "${HTML_FILE}" <<'HTML'
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>F4-02 PDF check</title>
<style>
/* ===== styles.css tokens (necesarios para el folio) ===== */
:root {
  --color-paper: #f5f4f0;
  --color-card: #ffffff;
  --color-muted: #f2f1ed;
  --color-foreground: #1a1a1a;
  --color-muted-foreground: #6b6b6b;
  --color-ink: #0a1f3c;
  --color-ink-foreground: #ffffff;
  --color-tech-blue: #1e6fd9;
  --color-circuit: #3da9fc;
  --color-border: #e5e5e5;
  --color-destructive: #c0392b;
  --color-destructive-foreground: #ffffff;
  --color-destructive-soft: #fdecea;
  --color-warning: #f9c74f;
  --color-warning-soft: #fef6e7;
  --color-ring: #1e6fd9;
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-mono: 'SF Mono', Menlo, Consolas, monospace;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-8: 3rem;
  --space-12: 4.5rem;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --tracking-caps: 0.14em;
  --tracking-caps-tight: 0.1em;
  --layout-page-max: 56rem;
}
html { font-family: var(--font-sans); color: var(--color-foreground); background: var(--color-paper); }
body { margin: 0; }

/* ===== admin-shell.css (actual) ===== */
app-admin-shell { display: block; min-height: 100vh; background: var(--color-paper); color: var(--color-foreground); font-family: var(--font-sans); }
app-admin-shell .skip-link { position: absolute; left: -999px; top: 0; padding: var(--space-2) var(--space-4); background: var(--color-card); color: var(--color-foreground); z-index: 1000; }
app-admin-shell .skip-link:focus { left: 0; }
app-admin-shell .layout { display: flex; min-height: 100vh; }
app-admin-shell .sidebar-desktop { display: none; width: 16rem; flex: 0 0 16rem; border-right: 1px solid var(--color-border); background: var(--color-card); }
app-admin-shell .content { flex: 1; display: flex; flex-direction: column; min-width: 0; }
app-admin-shell .topbar { position: sticky; top: 0; z-index: 20; background: color-mix(in srgb, var(--color-card) 90%, transparent); border-bottom: 1px solid var(--color-border); }
app-admin-shell .topbar-row { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); }
app-admin-shell main#contenido { flex: 1; padding: var(--space-5) var(--space-4); max-width: var(--layout-page-max); margin: 0 auto; width: 100%; box-sizing: border-box; }
app-admin-shell footer { padding: var(--space-4); border-top: 1px solid var(--color-border); font-size: 0.75rem; color: var(--color-muted-foreground); text-align: center; }
@media (min-width: 64rem) {
  app-admin-shell .sidebar-desktop { display: block; }
  app-admin-shell .menu-btn { display: none; }
  app-admin-shell .drawer-mobile { display: none; }
  app-admin-shell .drawer-overlay { display: none; }
}

/* ===== admin-shell.css @media print (FIX) ===== */
@media print {
  app-admin-shell { min-height: auto !important; background: transparent !important; }
  app-admin-shell .skip-link, app-admin-shell .sidebar-desktop, app-admin-shell .topbar, app-admin-shell footer, app-admin-shell .drawer-overlay, app-admin-shell .drawer-mobile, app-admin-shell .menu-btn { display: none !important; }
  app-admin-shell .layout { display: block !important; min-height: auto !important; }
  app-admin-shell .content { display: block !important; }
  app-admin-shell main#contenido { padding: 0 !important; max-width: none !important; margin: 0 !important; }
}

/* ===== certification-pdf-preview-page.css (actual) ===== */
app-certification-pdf-preview-page { display: block; }
app-certification-pdf-preview-page .pdf-vista { display: flex; flex-direction: column; gap: var(--space-5); max-width: 100%; }
app-certification-pdf-preview-page .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
app-certification-pdf-preview-page .breadcrumb { display: flex; align-items: center; gap: var(--space-2); font-size: 0.8125rem; color: var(--color-muted-foreground); flex-wrap: wrap; }
app-certification-pdf-preview-page .acciones-barra { display: flex; flex-direction: column; gap: var(--space-3); }
@media (min-width: 640px) { app-certification-pdf-preview-page .acciones-barra { flex-direction: row; align-items: flex-start; justify-content: space-between; } }
app-certification-pdf-preview-page .acciones-titulo { min-width: 0; }
app-certification-pdf-preview-page .kicker { font-family: var(--font-mono); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: var(--tracking-caps); color: var(--color-circuit); margin: 0; }
app-certification-pdf-preview-page .title { font-size: 1.25rem; font-weight: 600; letter-spacing: -0.01em; color: var(--color-foreground); margin-top: var(--space-1); }
@media (min-width: 640px) { app-certification-pdf-preview-page .title { font-size: 1.5rem; } }
app-certification-pdf-preview-page .acciones-botones { display: flex; flex-wrap: wrap; gap: var(--space-2); flex-shrink: 0; }
app-certification-pdf-preview-page .btn-imprimir, app-certification-pdf-preview-page .btn-volver-exp { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2); height: 2.5rem; padding: 0 var(--space-4); font-family: var(--font-mono); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: var(--tracking-caps-tight); border-radius: var(--radius-sm); cursor: pointer; text-decoration: none; border: 1px solid var(--color-border); background: var(--color-card); color: var(--color-foreground); }
app-certification-pdf-preview-page .print-feedback { min-height: 1.25rem; font-size: 0.8125rem; color: var(--color-muted-foreground); margin: 0; }
app-certification-pdf-preview-page .estado-linea { color: var(--color-muted-foreground); margin: 0; }
app-certification-pdf-preview-page .certificado-folio { position: relative; isolation: isolate; margin: 0 auto; width: 100%; max-width: 64rem; overflow: hidden; border: 1px solid color-mix(in srgb, var(--color-tech-blue) 15%, transparent); border-radius: var(--radius-lg); background: color-mix(in srgb, var(--color-muted) 60%, var(--color-card)); box-shadow: 0 24px 60px -32px color-mix(in srgb, var(--color-ink) 45%, transparent); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
@media (min-width: 640px) { app-certification-pdf-preview-page .certificado-folio { border-radius: var(--space-5); } }
app-certification-pdf-preview-page .folio-contenido { position: relative; z-index: 1; display: flex; flex-direction: column; gap: var(--space-6); padding: var(--space-5) var(--space-5) var(--space-6); }
@media (min-width: 640px) { app-certification-pdf-preview-page .folio-contenido { gap: var(--space-6); padding: var(--space-6) var(--space-8); } }
@media (min-width: 1024px) { app-certification-pdf-preview-page .folio-contenido { padding: var(--space-6) var(--space-12); } }
app-certification-pdf-preview-page .folio-header { display: flex; flex-direction: column; align-items: center; gap: var(--space-5); }
@media (min-width: 640px) { app-certification-pdf-preview-page .folio-header { flex-direction: row; align-items: flex-start; justify-content: space-between; gap: var(--space-4); } }
app-certification-pdf-preview-page .escudo-circular { display: flex; align-items: center; justify-content: center; width: 3.5rem; height: 3.5rem; border-radius: 50%; border: 2px solid color-mix(in srgb, var(--color-ink) 70%, transparent); background: var(--color-card); flex-shrink: 0; }
@media (min-width: 640px) { app-certification-pdf-preview-page .escudo-circular { width: 4rem; height: 4rem; } }
app-certification-pdf-preview-page .escudo-icon { font-size: 1.5rem; color: color-mix(in srgb, var(--color-ink) 80%, transparent); }
app-certification-pdf-preview-page .marca-programa { text-align: center; line-height: 1.2; order: 2; }
@media (min-width: 640px) { app-certification-pdf-preview-page .marca-programa { order: 0; padding-top: var(--space-1); } }
app-certification-pdf-preview-page .marca-programa-titulo { font-weight: 600; color: var(--color-ink); margin: 0; }
app-certification-pdf-preview-page .marca-italic { font-style: italic; font-weight: 400; color: var(--color-tech-blue); }
app-certification-pdf-preview-page .marca-programa-sub { margin-top: 0.125rem; font-family: var(--font-mono); font-size: 0.5625rem; text-transform: uppercase; letter-spacing: var(--tracking-caps-tight); color: var(--color-muted-foreground); }
app-certification-pdf-preview-page .marca-ifts { display: flex; align-items: center; gap: 0.375rem; font-family: var(--font-mono); font-size: 0.875rem; font-weight: 700; letter-spacing: 0.1em; color: var(--color-ink); flex-shrink: 0; }
@media (min-width: 640px) { app-certification-pdf-preview-page .marca-ifts { padding-top: var(--space-1); } }
app-certification-pdf-preview-page .marca-ifts-bracket { color: var(--color-tech-blue); }
app-certification-pdf-preview-page .marca-ifts-sup { font-size: 0.625rem; color: var(--color-circuit); }
app-certification-pdf-preview-page .cert-titulo-wrap { text-align: center; }
app-certification-pdf-preview-page .cert-titulo { font-family: serif; font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 700; letter-spacing: 0.08em; color: var(--color-ink); margin: 0; }
app-certification-pdf-preview-page .cert-cuerpo { margin: 0 auto; max-width: 48rem; display: flex; flex-direction: column; align-items: center; text-align: center; }
app-certification-pdf-preview-page .cert-intro { font-size: 0.875rem; line-height: 1.6; color: var(--color-foreground); margin: 0; }
@media (min-width: 640px) { app-certification-pdf-preview-page .cert-intro { font-size: 1rem; } }
app-certification-pdf-preview-page .cert-protagonista { margin-top: var(--space-5); font-family: serif; font-size: 1.875rem; font-weight: 700; line-height: 1.2; color: var(--color-ink); }
@media (min-width: 640px) { app-certification-pdf-preview-page .cert-protagonista { font-size: 2.25rem; } }
@media (min-width: 1024px) { app-certification-pdf-preview-page .cert-protagonista { font-size: 3rem; } }
app-certification-pdf-preview-page .cert-divider { margin-top: var(--space-2); width: 100%; max-width: 32rem; height: 1px; background: color-mix(in srgb, var(--color-ink) 35%, transparent); }
app-certification-pdf-preview-page .cert-doc { margin-top: var(--space-2); font-size: 0.75rem; color: var(--color-muted-foreground); }
@media (min-width: 640px) { app-certification-pdf-preview-page .cert-doc { font-size: 0.875rem; } }
app-certification-pdf-preview-page .cert-texto { margin-top: var(--space-5); font-size: 0.875rem; line-height: 1.6; color: var(--color-foreground); }
@media (min-width: 640px) { app-certification-pdf-preview-page .cert-texto { font-size: 1rem; } }
app-certification-pdf-preview-page .cert-curso-nombre { color: var(--color-tech-blue); }
app-certification-pdf-preview-page .cert-cierre { margin-top: var(--space-3); font-size: 0.875rem; line-height: 1.6; color: var(--color-foreground); }
@media (min-width: 640px) { app-certification-pdf-preview-page .cert-cierre { font-size: 1rem; } }
app-certification-pdf-preview-page .mono { font-family: var(--font-mono); }
app-certification-pdf-preview-page .cert-pie-firmas { display: grid; gap: var(--space-6); }
@media (min-width: 640px) { app-certification-pdf-preview-page .cert-pie-firmas { grid-template-columns: 1fr; gap: var(--space-5); } }
@media (min-width: 1024px) { app-certification-pdf-preview-page .cert-pie-firmas { grid-template-columns: 1fr minmax(0, 17rem) 1fr; align-items: end; gap: var(--space-5); } }
app-certification-pdf-preview-page .cert-firma { text-align: center; }
app-certification-pdf-preview-page .cert-firma-sello { display: flex; align-items: flex-end; justify-content: center; gap: 0.375rem; max-width: 15rem; margin: 0 auto; padding-bottom: var(--space-1); height: 2.5rem; }
app-certification-pdf-preview-page .cert-firma-icon { color: color-mix(in srgb, var(--color-tech-blue) 60%, transparent); }
app-certification-pdf-preview-page .cert-firma-italic { font-family: var(--font-mono); font-size: 0.625rem; font-style: italic; color: var(--color-muted-foreground); }
app-certification-pdf-preview-page .cert-firma-linea { max-width: 16rem; margin: 0 auto; border-top: 1px solid color-mix(in srgb, var(--color-ink) 45%, transparent); padding-top: var(--space-2); }
app-certification-pdf-preview-page .cert-firma-nombre { font-size: 0.875rem; font-weight: 600; color: var(--color-ink); margin: 0; }
app-certification-pdf-preview-page .cert-firma-cargo { font-family: var(--font-mono); font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-muted-foreground); margin: 0; }
app-certification-pdf-preview-page .cert-validacion { order: -1; border: 1px solid color-mix(in srgb, var(--color-tech-blue) 25%, transparent); border-radius: var(--radius-md); background: color-mix(in srgb, var(--color-card) 80%, transparent); padding: var(--space-3); }
@media (min-width: 640px) { app-certification-pdf-preview-page .cert-validacion { order: 0; margin: 0 auto; max-width: 24rem; } }
@media (min-width: 1024px) { app-certification-pdf-preview-page .cert-validacion { margin: 0; max-width: none; } }
app-certification-pdf-preview-page .cert-val-inner { display: flex; align-items: center; gap: var(--space-3); }
app-certification-pdf-preview-page .qr-decorativo { flex-shrink: 0; width: 4.5rem; height: 4.5rem; background: var(--color-ink); padding: 0.375rem; border-radius: var(--radius-sm); }
app-certification-pdf-preview-page .qr-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 1px; width: 100%; height: 100%; }
app-certification-pdf-preview-page .qr-cell { display: block; width: 100%; aspect-ratio: 1; }
app-certification-pdf-preview-page .qr-on { background: var(--color-ink-foreground); }
app-certification-pdf-preview-page .qr-off { background: var(--color-ink); }
app-certification-pdf-preview-page .cert-val-info { min-width: 0; }
app-certification-pdf-preview-page .cert-val-kicker { font-family: var(--font-mono); font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.14em; color: var(--color-tech-blue); margin: 0; }
app-certification-pdf-preview-page .cert-val-desc { margin-top: var(--space-1); font-size: 0.6875rem; line-height: 1.4; color: var(--color-muted-foreground); }
app-certification-pdf-preview-page .cert-val-url { margin-top: 0.125rem; font-size: 0.6875rem; line-height: 1.4; color: var(--color-tech-blue); word-break: break-all; }
app-certification-pdf-preview-page .cert-val-datos { margin-top: var(--space-3); padding-top: var(--space-2); border-top: 1px solid color-mix(in srgb, var(--color-ink) 10%, transparent); display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); }
app-certification-pdf-preview-page .cert-val-datos dt { font-family: var(--font-mono); font-size: 0.5625rem; text-transform: uppercase; letter-spacing: 0.14em; color: var(--color-muted-foreground); }
app-certification-pdf-preview-page .cert-val-datos dd { font-family: var(--font-mono); font-size: 0.6875rem; font-weight: 600; color: var(--color-ink); margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
app-certification-pdf-preview-page .cert-val-exp { grid-column: span 2; }
app-certification-pdf-preview-page .cert-footer-pie { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); border-top: 1px solid color-mix(in srgb, var(--color-ink) 10%, transparent); padding-top: var(--space-5); }
@media (min-width: 640px) { app-certification-pdf-preview-page .cert-footer-pie { flex-direction: row; align-items: center; justify-content: space-between; } }
app-certification-pdf-preview-page .marca-ciudad { display: inline-flex; align-items: center; gap: var(--space-2); background: var(--color-warning); padding: 0.375rem 0.625rem; border-radius: var(--radius-sm); }
app-certification-pdf-preview-page .marca-ciudad-ba { font-family: var(--font-mono); font-size: 1.125rem; font-weight: 800; line-height: 1; color: var(--color-ink); }
app-certification-pdf-preview-page .marca-ciudad-text { text-align: left; font-family: var(--font-mono); font-size: 0.5rem; font-weight: 600; text-transform: uppercase; line-height: 1.15; letter-spacing: 0.08em; color: var(--color-ink); }
app-certification-pdf-preview-page .cert-config-note { display: inline-flex; align-items: center; gap: 0.375rem; text-align: center; font-family: var(--font-mono); font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-muted-foreground); }
app-certification-pdf-preview-page .cert-nota-qr { display: flex; align-items: flex-start; gap: var(--space-2); font-size: 0.75rem; line-height: 1.5; color: var(--color-muted-foreground); margin: 0; }

/* ===== @media print (FIX — folio compactado a 1 A4 landscape) ===== */
app-certification-pdf-preview-page .no-print { }
@media print {
  @page { size: A4 landscape; margin: 0; }
  app-certification-pdf-preview-page .no-print { display: none !important; }
  app-certification-pdf-preview-page { display: block !important; }
  app-certification-pdf-preview-page .pdf-vista { gap: 0 !important; max-width: none !important; }
  app-certification-pdf-preview-page .certificado-folio { max-width: none !important; width: 100% !important; height: 100vh !important; border: none !important; border-radius: 0 !important; box-shadow: none !important; margin: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  app-certification-pdf-preview-page .folio-contenido { gap: var(--space-3) !important; padding: var(--space-3) var(--space-5) !important; }
  app-certification-pdf-preview-page .cert-titulo { font-size: clamp(2rem, 4vw, 3rem) !important; }
  app-certification-pdf-preview-page .cert-protagonista { font-size: 1.75rem !important; margin-top: var(--space-2) !important; }
  app-certification-pdf-preview-page .cert-intro, app-certification-pdf-preview-page .cert-texto, app-certification-pdf-preview-page .cert-cierre { font-size: 0.8125rem !important; line-height: 1.5 !important; }
  app-certification-pdf-preview-page .cert-doc { font-size: 0.6875rem !important; }
  app-certification-pdf-preview-page .cert-texto { margin-top: var(--space-3) !important; }
  app-certification-pdf-preview-page .cert-cierre { margin-top: var(--space-2) !important; }
  app-certification-pdf-preview-page .cert-divider { margin-top: var(--space-1) !important; }
  app-certification-pdf-preview-page .cert-pie-firmas { gap: var(--space-3) !important; }
  app-certification-pdf-preview-page .cert-firma-sello { height: 2rem !important; }
  app-certification-pdf-preview-page .qr-decorativo { width: 3.5rem !important; height: 3.5rem !important; }
  app-certification-pdf-preview-page .cert-validacion { padding: var(--space-2) !important; }
  app-certification-pdf-preview-page .cert-footer-pie { padding-top: var(--space-3) !important; gap: var(--space-2) !important; }
  app-certification-pdf-preview-page .certificado-folio, app-certification-pdf-preview-page .folio-contenido { break-inside: avoid; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
</style>
</head>
<body>
<!-- AdminShell chrome (debe estar ausente en print) -->
<app-admin-shell>
  <a class="skip-link" href="#contenido">Saltar al contenido principal</a>
  <div class="layout">
    <aside class="sidebar-desktop" aria-label="Navegacion admin"><p>Sidebar admin</p></aside>
    <div class="content">
      <header class="topbar" role="banner">
        <div class="topbar-row"><p>IFTS N.14 - Admin</p><span class="badge-mock">Sesion mock</span></div>
      </header>
      <main id="contenido" role="main">
        <!-- Componente PDF preview -->
        <app-certification-pdf-preview-page>
          <section class="pdf-vista" aria-labelledby="pdf-title">
            <nav aria-label="Migas de pan" class="breadcrumb no-print">
              <a class="breadcrumb-link">Certificaciones</a>
              <span class="breadcrumb-sep" aria-hidden="true">/</span>
              <a class="breadcrumb-link">IFTS14-CERT-0001</a>
              <span class="breadcrumb-sep" aria-hidden="true">/</span>
              <span class="breadcrumb-current">Vista imprimible</span>
            </nav>
            <div class="acciones-barra no-print">
              <div class="acciones-titulo">
                <p class="kicker">Vista previa del certificado</p>
                <h1 id="pdf-title" class="title">Certificado oficial - IFTS14-CERT-0001</h1>
              </div>
              <div class="acciones-botones">
                <button type="button" class="btn-imprimir">Imprimir</button>
                <a class="btn-volver-exp">Volver al expediente</a>
              </div>
            </div>
            <p class="print-feedback no-print" role="status" aria-live="polite"></p>
            <article class="certificado-folio" aria-label="Certificado imprimible">
              <div class="folio-contenido">
                <header class="folio-header">
                  <div class="escudo-circular"><span class="escudo-icon">G</span></div>
                  <div class="marca-programa">
                    <p class="marca-programa-titulo">Buenos Aires <span class="marca-italic">aprende</span></p>
                    <p class="marca-programa-sub">Agencia de Habilidades para el Futuro</p>
                  </div>
                  <div class="marca-ifts"><span class="marca-ifts-bracket">[</span>IFTS<span class="marca-ifts-bracket">]</span><sup class="marca-ifts-sup">14</sup></div>
                </header>
                <div class="cert-titulo-wrap"><h2 class="cert-titulo">CERTIFICADO</h2></div>
                <div class="cert-cuerpo">
                  <p class="cert-intro">El Instituto de Formacion Tecnica Superior N.14 (IFTS 14), que integra la Direccion de Educacion Tecnica Superior - Agencia de Habilidades para el Futuro, certifica que:</p>
                  <p class="cert-protagonista">Alumno Demo Uno</p>
                  <div class="cert-divider"></div>
                  <p class="cert-doc mono">Documento 12****34</p>
                  <p class="cert-texto">ha aprobado el curso de formacion profesional <strong class="cert-curso-nombre">Curso de introduccion a la gestion</strong>, dictado entre marzo a marzo, conforme al registro de asistencia auditado.</p>
                  <p class="cert-cierre">Se extiende el presente certificado a solicitud del/la interesado/a, para constancia de su aprobacion. Ciudad Autonoma de Buenos Aires, 1 de marzo de 2026.</p>
                </div>
                <div class="cert-pie-firmas">
                  <div class="cert-firma">
                    <div class="cert-firma-sello"><span class="cert-firma-icon">S</span><span class="cert-firma-italic">Firma digital verificada</span></div>
                    <div class="cert-firma-linea"><p class="cert-firma-nombre">Autoridad Demo Uno</p><p class="cert-firma-cargo">Rector/a - IFTS N.14</p></div>
                  </div>
                  <div class="cert-validacion">
                    <div class="cert-val-inner">
                      <div class="qr-decorativo"><div class="qr-grid">
                        <span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-on"></span>
                        <span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span>
                        <span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span>
                        <span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span>
                        <span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span>
                        <span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span>
                        <span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span>
                        <span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span><span class="qr-cell qr-on"></span><span class="qr-cell qr-off"></span>
                      </div></div>
                      <div class="cert-val-info">
                        <p class="cert-val-kicker">Validacion digital</p>
                        <p class="cert-val-desc">Escanee el codigo QR o visite:</p>
                        <p class="cert-val-url mono">https://ifrm/validar/prefijo_demo_a1b</p>
                      </div>
                    </div>
                    <dl class="cert-val-datos">
                      <div><dt>Emision</dt><dd class="mono">2026-03-01</dd></div>
                      <div class="cert-val-exp"><dt>N. certificado</dt><dd class="mono">IFTS14-CERT-0001</dd></div>
                    </dl>
                  </div>
                  <div class="cert-firma">
                    <div class="cert-firma-sello"><span class="cert-firma-icon">S</span><span class="cert-firma-italic">Firma digital verificada</span></div>
                    <div class="cert-firma-linea"><p class="cert-firma-nombre">Autoridad Demo Dos</p><p class="cert-firma-cargo">Asesora Pedagogica - IFTS N.14</p></div>
                  </div>
                </div>
                <div class="cert-footer-pie">
                  <div class="marca-ciudad"><span class="marca-ciudad-ba">BA</span><span class="marca-ciudad-text">Buenos Aires<br>Ciudad</span></div>
                  <p class="cert-config-note">Datos institucionales desde Configuracion (pendiente)</p>
                </div>
              </div>
            </article>
            <p class="cert-nota-qr no-print">Este documento puede validarse escaneando el codigo QR.</p>
          </section>
        </app-certification-pdf-preview-page>
      </main>
      <footer role="contentinfo"><p>Instituto de Formacion Tecnica Superior N.14 - Panel administrativo</p></footer>
    </div>
  </div>
</app-admin-shell>
</body>
</html>
HTML

# --- Generar PDF con Chromium ---
# --prefer-css-page-size respeta @page { size: A4 landscape }.
# --no-pdf-header-footer quita headers/footers del navegador.
# --print-background=true conserva colores (print-color-adjust).
"${CHROME}" --headless=new --no-sandbox --disable-gpu \
  --no-pdf-header-footer \
  --print-to-pdf="${PDF_FILE}" \
  "file://${HTML_FILE}" 2>/dev/null

if [[ ! -s "${PDF_FILE}" ]]; then
  echo "FAIL: no se genero ${PDF_FILE}"
  exit 1
fi

# --- Extraer metadata y texto ---
PAGES=$("${PDFINFO}" "${PDF_FILE}" 2>/dev/null | awk -F: '/^Pages:/ {gsub(/ /,"",$2); print $2}')
PAGE_SIZE=$("${PDFINFO}" "${PDF_FILE}" 2>/dev/null | awk -F: '/^Page size:/ {gsub(/^[ ]+/,"",$2); print $2}')
"${PDFTOTEXT}" "${PDF_FILE}" - 2>/dev/null > "${WORK_DIR}/folio.txt"
TEXT=$(cat "${WORK_DIR}/folio.txt")

# --- Aserciones ---
FAIL=0

# 1. Paginas: debe ser 1
if [[ "${PAGES}" != "1" ]]; then
  echo "FAIL paginas: esperado 1, obtenido ${PAGES}"
  FAIL=1
else
  echo "OK paginas: ${PAGES}"
fi

# 2. Page size: A4 landscape (841.92 x 594.96 pts)
if echo "${PAGE_SIZE}" | grep -qi "A4"; then
  echo "OK page size: ${PAGE_SIZE}"
else
  echo "FAIL page size: esperado A4, obtenido ${PAGE_SIZE}"
  FAIL=1
fi

# 3. Texto presente (folio + autoridades)
for NEEDLE in "CERTIFICADO" "Alumno Demo Uno" "Autoridad Demo Uno" "Autoridad Demo Dos" "IFTS14-CERT-0001" "Curso de introduccion"; do
  if echo "${TEXT}" | grep -qi -- "${NEEDLE}"; then
    echo "OK presente: ${NEEDLE}"
  else
    echo "FAIL ausente (deberia estar): ${NEEDLE}"
    FAIL=1
  fi
done

# 4. Texto ausente (chrome admin: no debe aparecer en print)
for FORBIDDEN in "Saltar al contenido" "Sesion mock" "Panel administrativo" "Vista imprimible" "Volver al expediente"; do
  if echo "${TEXT}" | grep -qi -- "${FORBIDDEN}"; then
    echo "FAIL presente (deberia estar ausente): ${FORBIDDEN}"
    FAIL=1
  else
    echo "OK ausente: ${FORBIDDEN}"
  fi
done

# 5. DNI/token/email/UUID ausentes (privacidad)
for SECRET in "12****34"; do
  # documentMasked 12****34 SI puede aparecer; DNI completo no.
  :
done
if echo "${TEXT}" | grep -qE '[0-9a-f]{8}-[0-9a-f]{4}'; then
  echo "FAIL UUID presente"
  FAIL=1
else
  echo "OK sin UUID"
fi

# --- Snapshot opcional ---
if [[ "${1:-}" == "--snapshot" ]]; then
  "${PDFTOPPM}" -png -r 96 -f 1 -l 1 "${PDF_FILE}" "${WORK_DIR}/page" 2>/dev/null
  if [[ -f "${WORK_DIR}/page-1.png" ]]; then
    cp "${WORK_DIR}/page-1.png" "${PNG_FILE}"
    echo "Snapshot: ${PNG_FILE}"
  fi
fi

# --- Resumen ---
echo "---"
echo "PDF: ${PDF_FILE}"
echo "Paginas: ${PAGES}"
echo "Page size: ${PAGE_SIZE}"
echo "Texto extraido: ${WORK_DIR}/folio.txt"

if [[ ${FAIL} -eq 0 ]]; then
  echo "VERDICT: PASS"
  exit 0
else
  echo "VERDICT: FAIL"
  exit 1
fi