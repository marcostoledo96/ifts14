export function HeaderInstitucional() {
  return (
    <header className="bg-card">
      <div className="mx-auto flex max-w-4xl items-center gap-3.5 px-5 py-5 sm:px-6">
        {/* Monograma geométrico institucional */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center bg-ink text-ink-foreground"
          aria-hidden="true"
        >
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="6" height="6" fill="currentColor" />
            <rect x="12" y="2" width="6" height="6" fill="var(--circuit)" />
            <rect x="2" y="12" width="6" height="6" fill="var(--circuit)" />
            <rect x="12" y="12" width="6" height="6" fill="currentColor" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="font-mono text-sm font-semibold leading-tight tracking-tight text-foreground">
            IFTS N.&deg; 14
          </p>
          <p className="mt-0.5 text-xs leading-tight text-muted-foreground">
            Validaci&oacute;n oficial de certificados
          </p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2 border border-border bg-secondary px-2.5 py-1.5">
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping bg-valid opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex h-1.5 w-1.5 bg-valid" />
          </span>
          <span className="font-mono text-[11px] tracking-wide text-muted-foreground">
            <span className="hidden sm:inline">Sistema </span>en l&iacute;nea
          </span>
        </div>
      </div>
      {/* Doble filete de membrete oficial */}
      <div className="h-0.5 bg-ink" aria-hidden="true" />
      <div className="h-px bg-circuit/50" aria-hidden="true" />
    </header>
  )
}
