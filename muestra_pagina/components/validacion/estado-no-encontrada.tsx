import {
  BotonReintentar,
  BotonVolver,
  PieControl,
} from "@/components/validacion/acciones"

export function EstadoNoEncontrada() {
  return (
    <article className="overflow-hidden border border-border bg-card shadow-[0_1px_0_0_var(--border)]">
      {/* Encabezado del folio */}
      <div className="bg-ink px-5 py-6 text-ink-foreground sm:px-8 sm:py-7">
        <p className="font-mono text-[11px] tracking-[0.2em] text-circuit">
          PORTAL DE VALIDACI&Oacute;N
        </p>
        <h1 className="mt-2 text-pretty text-xl font-semibold leading-tight sm:text-2xl">
          Certificaci&oacute;n no encontrada
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-foreground/70">
          No pudimos encontrar una certificaci&oacute;n asociada a este
          c&oacute;digo en los registros acad&eacute;micos oficiales.
        </p>
      </div>

      {/* Banda de estado neutra (azul técnico), no depende solo del color */}
      <div className="flex items-start gap-3 border-b border-tech-blue/30 bg-accent px-5 py-4 sm:px-8">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        >
          <circle
            cx="11"
            cy="11"
            r="7"
            stroke="var(--tech-blue)"
            strokeWidth="2"
          />
          <path
            d="m20 20-3.5-3.5M8.5 11h5"
            stroke="var(--tech-blue)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <p className="text-[13px] leading-relaxed text-foreground">
          El c&oacute;digo consultado no corresponde a ninguna
          certificaci&oacute;n vigente ni hist&oacute;rica del instituto.
        </p>
      </div>

      {/* Bloque de control: código consultado + consulta */}
      <div className="px-5 py-5 sm:px-8">
        <p className="font-mono text-[11px] tracking-[0.15em] text-circuit">
          I. REGISTRO DE LA CONSULTA
        </p>
        <dl className="mt-4 grid gap-x-10 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-medium tracking-wide text-muted-foreground">
              C&oacute;digo consultado
            </dt>
            <dd className="mt-1.5 inline-flex border border-border bg-secondary px-3 py-1.5 font-mono text-[13px] text-foreground">
              QR-8F3A-92K
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium tracking-wide text-muted-foreground">
              Fecha y hora de consulta
            </dt>
            <dd className="mt-1.5 font-mono text-[13px] text-foreground">
              20/06/2026 &middot; 18:35 ART
            </dd>
          </div>
        </dl>
        <p className="mt-5 border-l-2 border-circuit pl-3 text-[12px] leading-relaxed text-muted-foreground">
          Verific&aacute; que el enlace o QR sea el &uacute;ltimo enviado por el
          instituto. Las certificaciones pueden tardar hasta 48&nbsp;hs en
          impactar en el sistema p&uacute;blico de validaci&oacute;n.
        </p>
      </div>

      {/* Acciones */}
      <div className="border-t border-border px-5 py-5 sm:px-8">
        <p className="mb-3 font-mono text-[11px] tracking-[0.15em] text-muted-foreground">
          ACCIONES DISPONIBLES
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <BotonReintentar>Reintentar b&uacute;squeda</BotonReintentar>
          <BotonVolver>Volver al sitio del instituto</BotonVolver>
        </div>
      </div>

      <PieControl
        leyenda={<>SISTEMA VCD-14 &middot; REVISI&Oacute;N 2.4.0</>}
        derecha={<>STATUS: NOT_FOUND</>}
      />
    </article>
  )
}
