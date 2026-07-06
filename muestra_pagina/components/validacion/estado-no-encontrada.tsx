import { SelloOficial } from "@/components/validacion/sello-oficial"
import { QrVerificacion } from "@/components/validacion/qr-verificacion"
import {
  BotonReintentar,
  BotonVolver,
  PieControl,
} from "@/components/validacion/acciones"
import { TituloSeccion } from "@/components/validacion/campo"

export function EstadoNoEncontrada() {
  return (
    <article className="overflow-hidden border border-border bg-card shadow-[0_1px_0_0_var(--border)]">
      {/* ── Membrete del acta ─────────────────────────────── */}
      <div className="bg-ink px-5 pb-0 pt-7 text-ink-foreground sm:px-8">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="font-mono text-[11px] tracking-[0.22em] text-circuit">
              PORTAL DE VALIDACI&Oacute;N
            </p>
            <h1 className="mt-3 text-pretty text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              Certificaci&oacute;n no encontrada
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-foreground/75">
              No encontramos una certificaci&oacute;n v&aacute;lida asociada a
              esta consulta en los registros acad&eacute;micos oficiales.
            </p>
          </div>
          <div className="hidden shrink-0 border border-white/20 px-4 py-3 text-right sm:block">
            <p className="font-mono text-[10px] tracking-[0.18em] text-ink-foreground/60">
              C&Oacute;DIGO CONSULTADO
            </p>
            <p className="mt-1 font-mono text-[13px] font-medium text-ink-foreground">
              QR-FICTICIO-00K
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
            C&Oacute;DIGO&nbsp;
            <span className="text-ink-foreground/90">QR-FICTICIO-00K</span>
          </p>
        </div>
      </div>

      {/* ── Banda de estado (ámbar sobrio) ────────────────── */}
      <div className="flex flex-wrap items-start gap-3 border-b border-warning/40 bg-warning-soft px-5 py-4 sm:px-8">
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
            stroke="var(--foreground)"
            strokeWidth="2"
          />
          <path
            d="m20 20-3.5-3.5M8.5 11h5"
            stroke="var(--foreground)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            Sin registro para esta consulta
          </p>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-foreground">
            El enlace puede ser incorrecto, estar incompleto o no corresponder
            a una certificaci&oacute;n del instituto.
          </p>
        </div>
        <p className="hidden font-mono text-[11px] tracking-[0.15em] text-muted-foreground md:block">
          ESTADO: SIN REGISTRO
        </p>
      </div>

      {/* ── Cuerpo editorial ──────────────────────────────── */}
      <div className="grid md:grid-cols-[1fr_300px]">
        <div className="px-5 pb-6 pt-4 sm:px-8">
          <TituloSeccion numero="I.">REGISTRO DE LA CONSULTA</TituloSeccion>
          <dl className="grid grid-cols-1 gap-x-10 gap-y-4 pt-2 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[11px] tracking-wide text-muted-foreground">
                C&Oacute;DIGO CONSULTADO
              </dt>
              <dd className="mt-1.5 inline-flex border border-border bg-secondary px-3 py-1.5 font-mono text-[13px] text-foreground">
                QR-FICTICIO-00K
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] tracking-wide text-muted-foreground">
                FECHA Y HORA DE CONSULTA
              </dt>
              <dd className="mt-1.5 font-mono text-[13px] text-foreground">
                20/06/2026 &middot; 18:35 ART
              </dd>
            </div>
          </dl>

          <TituloSeccion numero="II.">QU&Eacute; POD&Eacute;S HACER</TituloSeccion>
          <ul className="space-y-3 pt-2">
            {[
              "Verific\u00e1 que el enlace o QR sea el \u00faltimo entregado por el instituto.",
              "Las certificaciones nuevas pueden tardar hasta 48 hs en impactar en el sistema p\u00fablico.",
              "Si el problema persiste, comunicate con Bedel\u00eda del IFTS N.\u00b0 14.",
            ].map((texto, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 font-mono text-[11px] font-semibold text-circuit">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[13px] leading-relaxed text-foreground">
                  {texto}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <BotonReintentar>Reintentar b&uacute;squeda</BotonReintentar>
            <BotonVolver>Volver al sitio del instituto</BotonVolver>
          </div>
        </div>

        {/* Riel de verificación */}
        <aside className="border-t border-border bg-secondary px-5 py-6 md:border-l md:border-t-0 sm:px-8 md:px-6">
          <p className="font-mono text-[11px] tracking-[0.18em] text-circuit">
            III. TRAZABILIDAD Y VERIFICACI&Oacute;N
          </p>

          <div className="mt-5 flex justify-center">
            <SelloOficial variante="sin-registro" />
          </div>

          <div className="mt-5 flex justify-center">
            <QrVerificacion apagado />
          </div>

          <dl className="mt-5 space-y-4">
            <div>
              <dt className="font-mono text-[11px] tracking-wide text-muted-foreground">
                ESTADO DEL REGISTRO
              </dt>
              <dd className="mt-1 inline-flex items-center gap-2 font-mono text-[13px] font-medium text-muted-foreground">
                <span
                  className="h-2 w-2 border border-muted-foreground"
                  aria-hidden="true"
                />
                SIN REGISTRO
              </dd>
            </div>
          </dl>

          <p className="mt-5 border-l-2 border-circuit pl-3 text-[12px] leading-relaxed text-muted-foreground">
            Este resultado no invalida el certificado en papel o PDF: indica
            que la consulta no coincide con ning&uacute;n registro publicado.
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
        derecha={<>ESTADO DE REGISTRO: SIN REGISTRO</>}
      />
    </article>
  )
}
