type BotonProps = {
  children: React.ReactNode
  onClick?: () => void
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"

export function BotonReintentar({ children, onClick }: BotonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex flex-1 items-center justify-center gap-2 bg-ink px-5 py-3 text-sm font-medium text-ink-foreground transition-colors hover:bg-ink/90 ${focusRing}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 12a9 9 0 1 0 2.6-6.4M3 4v4h4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </button>
  )
}

export function BotonVolver({ children }: { children: React.ReactNode }) {
  return (
    <a
      href="#"
      className={`inline-flex flex-1 items-center justify-center gap-2 border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary ${focusRing}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M19 12H5M11 6l-6 6 6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </a>
  )
}

// Marca de control documental que cierra el folio (monograma + leyenda)
export function PieControl({
  leyenda,
  derecha,
}: {
  leyenda: React.ReactNode
  derecha?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div className="flex items-center gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center bg-ink font-mono text-xs font-semibold text-ink-foreground"
          aria-hidden="true"
        >
          14
        </span>
        <p className="font-mono text-[11px] leading-tight tracking-wide text-muted-foreground">
          {leyenda}
        </p>
      </div>
      {derecha ? (
        <div className="font-mono text-[11px] tracking-wide text-muted-foreground sm:text-right">
          {derecha}
        </div>
      ) : null}
    </div>
  )
}
