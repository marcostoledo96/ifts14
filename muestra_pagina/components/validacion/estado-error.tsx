import {
  BotonReintentar,
  BotonVolver,
  PieControl,
} from "@/components/validacion/acciones"

function FilaControl({
  etiqueta,
  children,
  destacado = false,
}: {
  etiqueta: string
  children: React.ReactNode
  destacado?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-3 last:border-b-0">
      <dt className="font-mono text-[11px] tracking-wide text-muted-foreground">
        {etiqueta}
      </dt>
      <dd
        className={`font-mono text-[13px] ${
          destacado ? "text-circuit" : "text-foreground"
        }`}
      >
        {children}
      </dd>
    </div>
  )
}

export function EstadoError() {
  return (
    <article className="overflow-hidden border border-l-4 border-border border-l-circuit bg-card shadow-[0_1px_0_0_var(--border)]">
      {/* Encabezado documental con códigos de sistema */}
      <div className="px-5 py-6 sm:px-8 sm:py-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[11px] tracking-[0.2em] text-circuit">
              SISTEMA DE GESTI&Oacute;N ACAD&Eacute;MICA
            </p>
            <p className="mt-1 font-mono text-[11px] tracking-wide text-muted-foreground">
              HTTP_STATUS_503 / REQ_TIMEOUT
            </p>
          </div>
          <div
            className="flex shrink-0 items-end gap-1"
            aria-hidden="true"
          >
            <span className="h-5 w-1.5 bg-circuit" />
            <span className="h-3 w-1.5 bg-circuit/60" />
            <span className="h-6 w-1.5 bg-circuit/40" />
          </div>
        </div>

        <h1 className="mt-5 text-pretty text-xl font-semibold leading-tight text-foreground sm:text-2xl">
          No pudimos completar la validaci&oacute;n
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          El servidor de credenciales digitales est&aacute; experimentando una
          demora t&eacute;cnica temporal. Intent&aacute; nuevamente m&aacute;s
          tarde.
        </p>
      </div>

      {/* Tabla de control del evento */}
      <div className="border-y border-border bg-secondary px-5 py-4 sm:px-8">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <p className="font-mono text-[11px] tracking-wide text-muted-foreground">
            CAMPO
          </p>
          <p className="font-mono text-[11px] tracking-wide text-muted-foreground">
            REGISTRO DE EVENTO
          </p>
        </div>
        <dl>
          <FilaControl etiqueta="HORA DE CONSULTA">18:55:03 ART</FilaControl>
          <FilaControl etiqueta="ID DE TRANSACCI&Oacute;N">
            #ERR-992-014-SYS
          </FilaControl>
          <FilaControl etiqueta="ORIGEN DEL ERROR" destacado>
            CONEXI&Oacute;N INTER-INSTITUCIONAL
          </FilaControl>
        </dl>
      </div>

      {/* Acciones */}
      <div className="px-5 py-5 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <BotonReintentar>Reintentar validaci&oacute;n</BotonReintentar>
          <BotonVolver>Volver al sitio del instituto</BotonVolver>
        </div>
        <p className="mt-5 flex gap-2 border-l-2 border-circuit pl-3 text-[12px] italic leading-relaxed text-muted-foreground">
          Este aviso no indica la invalidez del documento presentado, sino una
          interrupci&oacute;n temporal en el enlace de comunicaci&oacute;n con
          la base de datos de t&iacute;tulos oficiales.
        </p>
      </div>

      <PieControl
        leyenda={<>IFTS N.&deg; 14 &middot; GCBA</>}
        derecha={<>STATUS: SERVICE_UNAVAILABLE</>}
      />
    </article>
  )
}
