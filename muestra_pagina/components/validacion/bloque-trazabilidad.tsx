// Patrón QR puramente decorativo (no contiene datos personales)
function QrDecorativo() {
  const cells = [
    1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0,
    1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0,
    1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1,
  ]
  return (
    <div
      className="grid h-20 w-20 shrink-0 grid-cols-8 gap-px bg-ink p-1.5"
      aria-hidden="true"
    >
      {cells.map((c, i) => (
        <span
          key={i}
          className={c ? "bg-ink-foreground" : "bg-ink"}
        />
      ))}
    </div>
  )
}

export function BloqueTrazabilidad() {
  return (
    <section className="border border-t-0 border-border bg-secondary px-5 py-5 sm:px-8">
      <p className="font-mono text-[11px] tracking-[0.15em] text-circuit">
        IV. TRAZABILIDAD Y VERIFICACI&Oacute;N
      </p>

      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
        <QrDecorativo />

        <div className="min-w-0 flex-1">
          <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-medium tracking-wide text-muted-foreground">
                C&oacute;digo parcial de validaci&oacute;n
              </dt>
              <dd className="mt-1 font-mono text-[13px] text-foreground">
                QR-8F3A-92K
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium tracking-wide text-muted-foreground">
                Fecha y hora de consulta
              </dt>
              <dd className="mt-1 font-mono text-[13px] text-foreground">
                20/06/2026 &middot; 18:35
              </dd>
            </div>
          </dl>
          <p className="mt-4 border-l-2 border-circuit pl-3 text-[12px] leading-relaxed text-muted-foreground">
            El QR no contiene datos personales; solo permite consultar la
            validaci&oacute;n oficial.
          </p>
        </div>
      </div>
    </section>
  )
}
