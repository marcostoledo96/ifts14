import { Campo, TituloSeccion } from "@/components/validacion/campo"
import { SelloOficial } from "@/components/validacion/sello-oficial"
import { QrVerificacion } from "@/components/validacion/qr-verificacion"
import { PieControl } from "@/components/validacion/acciones"

const fechasPresentes = ["05/06/2026", "12/06/2026", "19/06/2026"]

export function FolioCertificado() {
  return (
    <article className="overflow-hidden border border-border bg-card shadow-[0_1px_0_0_var(--border)]">
      {/* ── Membrete del acta ─────────────────────────────── */}
      <div className="bg-ink px-5 pb-0 pt-7 text-ink-foreground sm:px-8">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="font-mono text-[11px] tracking-[0.22em] text-circuit">
              ACTA DE VALIDACI&Oacute;N ACAD&Eacute;MICA
            </p>
            <h1 className="mt-3 text-pretty text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              Certificaci&oacute;n v&aacute;lida
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-foreground/75">
              Esta certificaci&oacute;n fue emitida por el Instituto de
              Formaci&oacute;n T&eacute;cnica Superior N.&deg; 14 y se
              encuentra vigente en los registros acad&eacute;micos oficiales.
            </p>
          </div>
          {/* Caja de numeración documental */}
          <div className="hidden shrink-0 border border-white/20 px-4 py-3 text-right sm:block">
            <p className="font-mono text-[10px] tracking-[0.18em] text-ink-foreground/60">
              N.&deg; DE CERTIFICADO
            </p>
            <p className="mt-1 font-mono text-[13px] font-medium text-ink-foreground">
              IFTS14-CUR-2026-0001
            </p>
          </div>
        </div>
        {/* Línea de referencia del folio */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-white/15 py-3">
          <p className="font-mono text-[11px] tracking-wide text-ink-foreground/60">
            CONSULTA&nbsp;
            <span className="text-ink-foreground/90">
              20/06/2026 &middot; 18:35 ART
            </span>
          </p>
          <p className="font-mono text-[11px] tracking-wide text-ink-foreground/60 sm:hidden">
            N.&deg;&nbsp;
            <span className="text-ink-foreground/90">IFTS14-CUR-2026-0001</span>
          </p>
        </div>
      </div>

      {/* ── Banda de estado ───────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 border-b border-valid/30 bg-valid-soft px-5 py-3.5 sm:px-8">
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
          Documento verificado &mdash; certificaci&oacute;n oficial
          v&aacute;lida
        </p>
        <p className="ml-auto hidden font-mono text-[11px] tracking-[0.15em] text-valid md:block">
          ESTADO: V&Aacute;LIDO
        </p>
      </div>

      {/* ── Cuerpo editorial: acta + riel de verificación ── */}
      <div className="grid md:grid-cols-[1fr_300px]">
        {/* Cuerpo principal del acta */}
        <div className="px-5 pb-6 pt-4 sm:px-8">
          <TituloSeccion numero="I.">DATOS DEL ALUMNO</TituloSeccion>
          <dl className="grid grid-cols-1 gap-x-10 sm:grid-cols-[1fr_auto]">
            <Campo etiqueta="ALUMNO/A" destacado>
              Mar&iacute;a Gonz&aacute;lez
            </Campo>
            <Campo etiqueta="DNI" mono>
              DNI-FICTICIO-300
            </Campo>
          </dl>

          <TituloSeccion numero="II.">DATOS DEL CURSO</TituloSeccion>
          <dl>
            <Campo etiqueta="CURSO" destacado>
              Introducci&oacute;n a Sistemas Embebidos e Internet de las Cosas
            </Campo>
            <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-3">
              <Campo etiqueta="TIPO">Certificado de curso</Campo>
              <Campo etiqueta="N.&deg; DE CERTIFICADO" mono>
                IFTS14-CUR-2026-0001
              </Campo>
              <Campo etiqueta="FECHA DE EMISI&Oacute;N" mono>
                20/06/2026
              </Campo>
            </div>
          </dl>

          <TituloSeccion numero="III.">REGISTRO DE ASISTENCIA</TituloSeccion>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="w-12 py-2 font-mono text-[11px] font-medium tracking-wide text-muted-foreground">
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
                  <td className="py-2.5 font-mono text-[13px] text-muted-foreground">
                    {String(i + 1).padStart(3, "0")}
                  </td>
                  <td className="py-2.5 font-mono text-[13px] text-foreground">
                    {fecha}
                  </td>
                  <td className="py-2.5">
                    <span className="ml-auto flex w-fit items-center gap-1.5">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
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
                      <span className="font-mono text-[11px] text-valid">
                        S&Iacute;
                      </span>
                    </span>
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

        {/* Riel de verificación (margen documental) */}
        <aside className="border-t border-border bg-secondary px-5 py-6 md:border-l md:border-t-0 sm:px-8 md:px-6">
          <p className="font-mono text-[11px] tracking-[0.18em] text-circuit">
            IV. TRAZABILIDAD Y VERIFICACI&Oacute;N
          </p>

          <div className="mt-5 flex justify-center">
            <SelloOficial variante="valido" />
          </div>

          <div className="mt-5 flex justify-center">
            <QrVerificacion />
          </div>

          <dl className="mt-5 space-y-4">
            <div>
              <dt className="font-mono text-[11px] tracking-wide text-muted-foreground">
                C&Oacute;DIGO PARCIAL DE VALIDACI&Oacute;N
              </dt>
              <dd className="mt-1 font-mono text-[13px] text-foreground">
                QR-FICTICIO-00K
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] tracking-wide text-muted-foreground">
                FECHA Y HORA DE CONSULTA
              </dt>
              <dd className="mt-1 font-mono text-[13px] text-foreground">
                20/06/2026 &middot; 18:35 ART
              </dd>
            </div>
          </dl>

          <p className="mt-5 border-l-2 border-circuit pl-3 text-[12px] leading-relaxed text-muted-foreground">
            El QR no contiene datos personales; solo permite consultar la
            validaci&oacute;n oficial.
          </p>
        </aside>
      </div>

      <PieControl
        leyenda={
          <>
            DOCUMENTO ELECTR&Oacute;NICO &middot; SISTEMA CENTRAL DE
            CERTIFICADOS IFTS 14
          </>
        }
        derecha={<>ESTADO DE REGISTRO: V&Aacute;LIDO</>}
      />
    </article>
  )
}
