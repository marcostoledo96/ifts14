export function Campo({
  etiqueta,
  children,
  mono = false,
  destacado = false,
}: {
  etiqueta: string
  children: React.ReactNode
  mono?: boolean
  destacado?: boolean
}) {
  return (
    <div className="py-3">
      <dt className="font-mono text-[11px] tracking-wide text-muted-foreground">
        {etiqueta}
      </dt>
      <dd
        className={`mt-1 text-foreground ${
          mono
            ? "font-mono text-[13px]"
            : destacado
              ? "text-[17px] font-semibold leading-snug"
              : "text-[15px] font-medium leading-snug"
        }`}
      >
        {children}
      </dd>
    </div>
  )
}

/** Encabezado numerado de sección dentro del folio */
export function TituloSeccion({
  numero,
  children,
}: {
  numero: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-baseline gap-3 pb-2 pt-5 first:pt-0">
      <span className="font-mono text-[11px] font-semibold text-circuit">
        {numero}
      </span>
      <h2 className="font-mono text-[11px] tracking-[0.18em] text-foreground">
        {children}
      </h2>
      <span
        className="h-px min-w-6 flex-1 self-center bg-border"
        aria-hidden="true"
      />
    </div>
  )
}
