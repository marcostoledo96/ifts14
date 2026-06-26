import { BotonVolver, PieControl } from "@/components/validacion/acciones"

function Campo({
  etiqueta,
  children,
  mono = false,
}: {
  etiqueta: string
  children: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="py-3">
      <dt className="text-[11px] font-medium tracking-wide text-muted-foreground">
        {etiqueta}
      </dt>
      <dd
        className={`mt-1 text-foreground ${
          mono ? "font-mono text-[13px]" : "text-[15px] font-medium leading-snug"
        }`}
      >
        {children}
      </dd>
    </div>
  )
}

export function EstadoRevocada() {
  return (
    <article className="overflow-hidden border border-border bg-card shadow-[0_1px_0_0_var(--border)]">
      {/* Encabezado del folio con sello de estado en marca de agua */}
      <div className="relative overflow-hidden bg-ink px-5 py-6 text-ink-foreground sm:px-8 sm:py-7">
        <span
          className="pointer-events-none absolute -right-2 top-1/2 -translate-y-1/2 select-none font-mono text-5xl font-bold tracking-tight text-destructive/25 sm:text-6xl"
          aria-hidden="true"
        >
          REVOCADO
        </span>
        <p className="font-mono text-[11px] tracking-[0.2em] text-circuit">
          ACTA DE VALIDACI&Oacute;N ACAD&Eacute;MICA
        </p>
        <h1 className="relative mt-2 text-pretty text-xl font-semibold leading-tight sm:text-2xl">
          Certificaci&oacute;n revocada
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-foreground/70">
          Instituto de Formaci&oacute;n T&eacute;cnica Superior N.&deg; 14
        </p>
      </div>

      {/* Banda de estado: rojo moderado, no depende solo del color */}
      <div className="flex items-start gap-3 border-b border-destructive/30 bg-destructive-soft px-5 py-4 sm:px-8">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        >
          <path
            d="M8.6 3h6.8L21 8.6v6.8L15.4 21H8.6L3 15.4V8.6L8.6 3Z"
            fill="var(--destructive)"
          />
          <path
            d="M12 7.5v5M12 16h.01"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <div>
          <p className="text-sm font-semibold text-destructive">
            Certificaci&oacute;n revocada
          </p>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-foreground">
            Esta certificaci&oacute;n fue revocada por la instituci&oacute;n. El
            documento carece de validez legal y acad&eacute;mica.
          </p>
        </div>
      </div>

      {/* Cuerpo: datos mínimos + control documental */}
      <div className="grid gap-x-10 px-5 py-2 sm:px-8 md:grid-cols-2">
        <div className="divide-y divide-border md:border-r md:border-border md:pr-10">
          <div className="py-3">
            <p className="font-mono text-[11px] tracking-[0.15em] text-circuit">
              I. DATOS DEL CERTIFICADO
            </p>
          </div>
          <Campo etiqueta="Alumno/a">Persona Ficticia de Ejemplo</Campo>
          <Campo etiqueta="DNI" mono>
            DNI-FICT-V001
          </Campo>
          <Campo etiqueta="Curso">
            Introducci&oacute;n a Sistemas Embebidos e Internet de las Cosas
          </Campo>
          <Campo etiqueta="N&uacute;mero de certificado" mono>
            IFTS14-CUR-2026-0001
          </Campo>
          <Campo etiqueta="Fecha de emisi&oacute;n" mono>
            20/06/2026
          </Campo>
        </div>

        <div className="divide-y divide-border">
          <div className="py-3">
            <p className="font-mono text-[11px] tracking-[0.15em] text-circuit">
              II. TRAZABILIDAD
            </p>
          </div>
          <div className="py-3">
            <dt className="text-[11px] font-medium tracking-wide text-muted-foreground">
              C&oacute;digo parcial de validaci&oacute;n
            </dt>
            <dd className="mt-1 font-mono text-[13px] text-foreground">
              QR-8F3A-92K
            </dd>
          </div>
          <div className="py-3">
            <dt className="text-[11px] font-medium tracking-wide text-muted-foreground">
              Estado del registro
            </dt>
            <dd className="mt-1 inline-flex items-center gap-2 font-mono text-[13px] text-destructive">
              <span
                className="h-2 w-2 bg-destructive"
                aria-hidden="true"
              />
              REVOCADO
            </dd>
          </div>
          <p className="py-3 text-[12px] leading-relaxed text-muted-foreground">
            La revocaci&oacute;n es definitiva. Ante cualquier duda, comunicate
            con la instituci&oacute;n emisora.
          </p>
          <div className="py-4">
            <BotonVolver>Volver al sitio del instituto</BotonVolver>
          </div>
        </div>
      </div>

      <PieControl
        leyenda={
          <>
            DOCUMENTO ELECTR&Oacute;NICO &middot; SISTEMA CENTRAL DE
            CERTIFICADOS IFTS 14
          </>
        }
        derecha={<>ESTADO DE REGISTRO: REVOCADO</>}
      />
    </article>
  )
}
