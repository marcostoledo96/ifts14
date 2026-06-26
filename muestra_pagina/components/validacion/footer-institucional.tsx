export function FooterInstitucional() {
  return (
    <footer className="mt-8 border-t border-border">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-mono text-xs text-muted-foreground">
          IFTS N.&deg; 14 &mdash; Sistema de validaci&oacute;n de certificados
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-tech-blue underline-offset-4 hover:underline"
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
    </footer>
  )
}
