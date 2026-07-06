import { Campo, TituloSeccion } from "@/components/validacion/campo"
import { SelloOficial } from "@/components/validacion/sello-oficial"
import { QrVerificacion } from "@/components/validacion/qr-verificacion"
import { BotonVolver, PieControl } from "@/components/validacion/acciones"

export function EstadoRevocada() {
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
              Certificaci&oacute;n revocada
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-foreground/75">
              Esta certificaci&oacute;n fue emitida por el Instituto de
              Formaci&oacute;n T&eacute;cnica Superior N.&deg; 14, pero la
              instituci&oacute;n revoc&oacute; su validez.
            </p>
          </div>
          <div className="hidden shrink-0 border border-white/20 px-4 py-3 text-right sm:block">
            <p className="font-mono text-[10px] tracking-[0.18em] text-ink-foreground/60">
              N.&deg; DE CERTIFICADO
            </p>
            <p className="mt-1 font-mono text-[13px] font-medium text-ink-foreground">
              IFTS14-CUR-2026-0001
            </p>
          </div>
        </div>
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
      <div className="flex flex-wrap items-start gap-3 border-b border-destructive/30 bg-destructive-soft px-5 py-4 sm:px-8">
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
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-destructive">
            Este documento no debe considerarse v&aacute;lido
          </p>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-foreground">
            El certificado existi&oacute; y fue emitido oficialmente, pero se
            encuentra revocado. Carece de validez legal y acad&eacute;mica.
          </p>
        </div>
        <p className="hidden font-mono text-[11px] tracking-[0.15em] text-destructive md:block">
          ESTADO: REVOCADO
        </p>
      </div>

      {/* ── Cuerpo editorial ──────────────────────────────── */}
      <div className="grid md:grid-cols-[1fr_300px]">
        <div className="px-5 pb-6 pt-4 sm:px-8">
          <TituloSeccion numero="I.">DATOS DEL CERTIFICADO</TituloSeccion>
          <dl className="grid grid-cols-1 gap-x-10 sm:grid-cols-[1fr_auto]">
            <Campo etiqueta="ALUMNO/A" destacado>
              Mar&iacute;a Gonz&aacute;lez
            </Campo>
            <Campo etiqueta="DNI" mono>
              DNI-FICTICIO-300
            </Campo>
          </dl>
          <dl>
            <Campo etiqueta="CURSO">
              Introducci&oacute;n a Sistemas Embebidos e Internet de las Cosas
            </Campo>
            <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
              <Campo etiqueta="N.&deg; DE CERTIFICADO" mono>
                IFTS14-CUR-2026-0001
              </Campo>
              <Campo etiqueta="FECHA DE EMISI&Oacute;N" mono>
                20/06/2026
              </Campo>
            </div>
          </dl>

          <TituloSeccion numero="II.">
            CRONOLOG&Iacute;A DEL REGISTRO
          </TituloSeccion>
          <ol className="mt-1">
            <li className="relative flex gap-4 pb-5">
              <span
                className="absolute left-[5px] top-4 h-full w-px bg-border"
                aria-hidden="true"
              />
              <span
                className="relative mt-1.5 h-2.5 w-2.5 shrink-0 border-2 border-valid bg-card"
                aria-hidden="true"
              />
              <div>
                <p className="text-[13px] font-medium text-foreground">
                  Certificaci&oacute;n emitida
                </p>
                <p className="mt-0.5 font-mono text-[12px] text-muted-foreground">
                  20/06/2026
                </p>
              </div>
            </li>
            <li className="relative flex gap-4">
              <span
                className="relative mt-1.5 h-2.5 w-2.5 shrink-0 bg-destructive"
                aria-hidden="true"
              />
              <div>
                <p className="text-[13px] font-medium text-destructive">
                  Certificaci&oacute;n revocada por la instituci&oacute;n
                </p>
                <p className="mt-0.5 font-mono text-[12px] text-muted-foreground">
                  [Fecha de revocaci&oacute;n]
                </p>
                <p className="mt-1.5 max-w-md text-[12px] leading-relaxed text-muted-foreground">
                  Motivo registrado: [motivo administrativo o t&eacute;cnico
                  informado por Bedel&iacute;a].
                </p>
              </div>
            </li>
          </ol>

          <p className="mt-6 border-l-2 border-destructive/50 pl-3 text-[12px] leading-relaxed text-muted-foreground">
            La revocaci&oacute;n es definitiva. Ante cualquier duda,
            comunicate con la instituci&oacute;n emisora.
          </p>
        </div>

        {/* Riel de verificación */}
        <aside className="border-t border-border bg-secondary px-5 py-6 md:border-l md:border-t-0 sm:px-8 md:px-6">
          <p className="font-mono text-[11px] tracking-[0.18em] text-circuit">
            III. TRAZABILIDAD Y VERIFICACI&Oacute;N
          </p>

          <div className="mt-5 flex justify-center">
            <SelloOficial variante="revocado" />
          </div>

          <div className="mt-5 flex justify-center">
            <QrVerificacion apagado />
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
                ESTADO DEL REGISTRO
              </dt>
              <dd className="mt-1 inline-flex items-center gap-2 font-mono text-[13px] font-medium text-destructive">
                <span className="h-2 w-2 bg-destructive" aria-hidden="true" />
                REVOCADO
              </dd>
            </div>
          </dl>

          <p className="mt-5 border-l-2 border-circuit pl-3 text-[12px] leading-relaxed text-muted-foreground">
            El QR no contiene datos personales; solo permite consultar la
            validaci&oacute;n oficial.
          </p>

          <div className="mt-6">
            <BotonVolver>Volver al sitio del instituto</BotonVolver>
          </div>
        </aside>
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
