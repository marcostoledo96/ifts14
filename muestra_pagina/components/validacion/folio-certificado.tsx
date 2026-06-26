const fechasPresentes = ["05/06/2026", "12/06/2026", "19/06/2026"]

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

export function FolioCertificado() {
  return (
    <article className="overflow-hidden border border-border bg-card shadow-[0_1px_0_0_var(--border)]">
      {/* Encabezado del folio: banda navy con referencia documental */}
      <div className="bg-ink px-5 py-6 text-ink-foreground sm:px-8 sm:py-7">
        <p className="font-mono text-[11px] tracking-[0.2em] text-circuit">
          ACTA DE VALIDACI&Oacute;N ACAD&Eacute;MICA
        </p>
        <h1 className="mt-2 text-pretty text-xl font-semibold leading-tight sm:text-2xl">
          Certificaci&oacute;n v&aacute;lida
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-foreground/70">
          Esta certificaci&oacute;n fue emitida por el Instituto de
          Formaci&oacute;n T&eacute;cnica Superior N.&deg; 14.
        </p>
      </div>

      {/* Banda de validación integrada (no card separada) */}
      <div className="flex items-center gap-3 border-b border-valid/30 bg-valid-soft px-5 py-3 sm:px-8">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          className="shrink-0"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" fill="var(--valid)" />
          <path
            d="M7.5 12.5l3 3 6-6.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-sm font-medium text-valid">
          Documento verificado &mdash; certificaci&oacute;n oficial v&aacute;lida
        </p>
      </div>

      {/* Cuerpo del acta: dos columnas en desktop */}
      <div className="grid gap-x-10 px-5 py-2 sm:px-8 md:grid-cols-2">
        {/* Columna izquierda: alumno + curso */}
        <div className="divide-y divide-border md:border-r md:border-border md:pr-10">
          <div className="py-3">
            <p className="font-mono text-[11px] tracking-[0.15em] text-circuit">
              I. DATOS DEL ALUMNO
            </p>
          </div>
          <Campo etiqueta="Alumno/a">Persona Ficticia de Ejemplo</Campo>
          <Campo etiqueta="DNI" mono>
            DNI-FICT-V001
          </Campo>

          <div className="py-3">
            <p className="font-mono text-[11px] tracking-[0.15em] text-circuit">
              II. DATOS DEL CURSO
            </p>
          </div>
          <Campo etiqueta="Curso">
            Introducci&oacute;n a Sistemas Embebidos e Internet de las Cosas
          </Campo>
          <Campo etiqueta="Tipo">Certificado de curso</Campo>
          <Campo etiqueta="N&uacute;mero de certificado" mono>
            IFTS14-CUR-2026-0001
          </Campo>
          <Campo etiqueta="Fecha de emisi&oacute;n" mono>
            20/06/2026
          </Campo>
        </div>

        {/* Columna derecha: registro de asistencia certificado */}
        <div className="divide-y divide-border md:pl-0">
          <div className="py-3">
            <p className="font-mono text-[11px] tracking-[0.15em] text-circuit">
              III. REGISTRO DE ASISTENCIA
            </p>
          </div>
          <div className="py-2">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="w-10 py-2 font-mono text-[11px] font-medium tracking-wide text-muted-foreground">
                    SEQ
                  </th>
                  <th className="py-2 font-mono text-[11px] font-medium tracking-wide text-muted-foreground">
                    FECHA REGISTRADA
                  </th>
                  <th className="py-2 text-right font-mono text-[11px] font-medium tracking-wide text-muted-foreground">
                    PRESENTE
                  </th>
                </tr>
              </thead>
              <tbody>
                {fechasPresentes.map((fecha, i) => (
                  <tr key={fecha} className="border-b border-border/60">
                    <td className="py-3 font-mono text-[13px] text-muted-foreground">
                      {String(i + 1).padStart(3, "0")}
                    </td>
                    <td className="py-3 font-mono text-[13px] text-foreground">
                      {fecha}
                    </td>
                    <td className="py-3 text-right">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="ml-auto"
                        aria-label="Presente"
                        role="img"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="var(--valid)"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M7.5 12.5l3 3 6-6.5"
                          stroke="var(--valid)"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
              Fechas del curso en las que se registr&oacute; la presencia del
              alumno.
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
