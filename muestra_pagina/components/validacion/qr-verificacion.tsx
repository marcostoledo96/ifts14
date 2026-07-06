// Patrón QR puramente decorativo (no contiene datos personales)
const celdas = [
  1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0,
  1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0,
  1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1,
]

/**
 * QR de verificación con marco de escaneo (esquinas de registro),
 * como objetivo de lectura en documentación oficial.
 */
export function QrVerificacion({ apagado = false }: { apagado?: boolean }) {
  const esquina =
    "absolute h-3.5 w-3.5 border-circuit " + (apagado ? "border-border" : "")
  return (
    <div className="relative inline-block p-2.5" aria-hidden="true">
      <span className={`${esquina} left-0 top-0 border-l-2 border-t-2`} />
      <span className={`${esquina} right-0 top-0 border-r-2 border-t-2`} />
      <span className={`${esquina} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${esquina} bottom-0 right-0 border-b-2 border-r-2`} />
      {apagado ? (
        <div className="grid h-24 w-24 grid-cols-8 gap-px border border-dashed border-border bg-card p-1.5">
          {celdas.map((c, i) => (
            <span key={i} className={c ? "bg-border/70" : "bg-card"} />
          ))}
        </div>
      ) : (
        <div className="grid h-24 w-24 grid-cols-8 gap-px bg-ink p-1.5">
          {celdas.map((c, i) => (
            <span key={i} className={c ? "bg-ink-foreground" : "bg-ink"} />
          ))}
        </div>
      )}
    </div>
  )
}
