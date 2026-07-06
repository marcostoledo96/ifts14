export function FooterInstitucional() {
  return (
    <footer className="mt-10 border-t-2 border-ink bg-card">
      <div className="mx-auto max-w-4xl px-5 py-7 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center bg-ink font-mono text-xs font-semibold text-ink-foreground"
              aria-hidden="true"
            >
              14
            </span>
            <div>
              <p className="font-mono text-xs font-medium text-foreground">
                IFTS N.&deg; 14 &mdash; Sistema de validaci&oacute;n de
                certificados
              </p>
              <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
                Consulta p&uacute;blica de autenticidad de certificaciones
                acad&eacute;micas emitidas por el instituto.
              </p>
            </div>
          </div>
          <a
            href="#"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-tech-blue underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            Volver al sitio del instituto
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
        <p className="mt-5 border-t border-border pt-4 font-mono text-[11px] tracking-wide text-muted-foreground">
          DOCUMENTO ELECTR&Oacute;NICO DE CONSULTA &middot; NO REEMPLAZA AL
          CERTIFICADO ORIGINAL EN PDF
        </p>
      </div>
    </footer>
  )
}
