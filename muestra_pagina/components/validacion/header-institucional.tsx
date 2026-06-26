export function HeaderInstitucional() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-5 py-4 sm:px-6">
        {/* Marca técnica sutil: monograma geométrico */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center bg-ink text-ink-foreground"
          aria-hidden="true"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="6" height="6" fill="currentColor" />
            <rect x="12" y="2" width="6" height="6" fill="var(--circuit)" />
            <rect x="2" y="12" width="6" height="6" fill="var(--circuit)" />
            <rect x="12" y="12" width="6" height="6" fill="currentColor" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="font-mono text-sm font-medium leading-tight text-foreground">
            IFTS N.&deg; 14
          </p>
          <p className="text-xs leading-tight text-muted-foreground">
            Validaci&oacute;n oficial de certificados
          </p>
        </div>
        <div className="ml-auto hidden items-center gap-2 sm:flex">
          <span className="h-1.5 w-1.5 bg-valid" aria-hidden="true" />
          <span className="font-mono text-xs text-muted-foreground">
            Sistema en l&iacute;nea
          </span>
        </div>
      </div>
    </header>
  )
}
