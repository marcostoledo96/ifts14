"use client"

import { useEffect, useRef, useState } from "react"
import {
  X,
  Copy,
  Check,
  Download,
  Link2,
  Lock,
  Info,
  FileCheck2,
  UserRound,
  GraduationCap,
  CalendarCheck2,
  Hash,
} from "lucide-react"

/* ------------------------------------------------------------------ *
 * Entrega manual de certificación — mesa de trabajo de Bedelía.
 *
 * El sistema NO envía correos: Bedelía copia el link público de
 * validación y/o descarga el PDF, y los entrega al alumno por el
 * canal que corresponda. El QR/token es permanente y no cambia.
 *
 * Modelo mock. En el port a Angular 20 se reemplaza por el resolver
 * del expediente + services. La UI no persiste nada por su cuenta.
 * Se evitan APIs propias de Next.js: la navegación usa <a href> y
 * window.history para que el port sea directo.
 * ------------------------------------------------------------------ */

type FechaPresente = { fecha: string; modulo: string }

type Certificado = {
  numero: string
  alumno: { nombre: string; apellido: string; dni: string }
  curso: { nombre: string; ciclo: string }
  fechas: FechaPresente[]
  token: string
}

const VALIDACION_HOST = "ifts14.edu.ar/certificados"

/* Datos de ejemplo. El id llega por ruta y, en Angular, alimenta el
 * resolver que devuelve este mismo shape. */
const CERTIFICADO: Certificado = {
  numero: "IFTS14-CUR-2024-0031",
  alumno: { nombre: "Persona", apellido: "Ficticia", dni: "DNI-FICTICIO-001" },
  curso: {
    nombre: "Desarrollo de Sistemas Web II",
    ciclo: "2024 · 1.er cuatrimestre",
  },
  fechas: [
    { fecha: "2024-03-15", modulo: "Unidad 1 — Frontend avanzado" },
    { fecha: "2024-03-22", modulo: "Unidad 2 — Arquitectura de estado" },
    { fecha: "2024-04-05", modulo: "Unidad 3 — Consumo de APIs" },
    { fecha: "2024-04-19", modulo: "Unidad 4 — Pruebas e integración" },
  ],
  token: "FICTIO-SAMPLE-001",
}

/* Helpers de formato -------------------------------------------------- */

const fmtCorta = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})
function parseISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

/* QR institucional decorativo — patrón fijo, sin datos personales.
 * Solo referencia visual; el QR real dirige a la validación pública. */
function QrDecorativo({ className = "" }: { className?: string }) {
  const cells = [
    1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0,
    1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0,
    1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1,
  ]
  return (
    <div
      className={`grid aspect-square grid-cols-8 gap-px rounded-sm bg-ink p-1.5 ${className}`}
      aria-hidden="true"
    >
      {cells.map((c, i) => (
        <span key={i} className={c ? "rounded-[1px] bg-ink-foreground" : "bg-ink"} />
      ))}
    </div>
  )
}

/* Fila de la ficha de datos ------------------------------------------ */
function Dato({
  icon: Icon,
  etiqueta,
  children,
  mono = false,
}: {
  icon: typeof UserRound
  etiqueta: string
  children: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0 text-circuit"
        strokeWidth={2}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <dt className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-muted-foreground">
          {etiqueta}
        </dt>
        <dd
          className={`mt-0.5 text-foreground ${
            mono ? "font-mono text-[13px]" : "text-sm font-medium"
          }`}
        >
          {children}
        </dd>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

export function EntregaManual({ id }: { id: string }) {
  const cert = CERTIFICADO
  const { alumno, curso, numero } = cert

  const volverHref = `/admin/certificaciones/${id}`
  const validarPath = `/validar/${cert.token}`
  const validarUrl = `https://${VALIDACION_HOST}${validarPath}`

  const [copiado, setCopiado] = useState(false)
  const [descargado, setDescargado] = useState(false)
  const [descargando, setDescargando] = useState(false)

  const copiaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  /* Cierre con Escape → vuelve al expediente. Portable a Angular
   * (allí sería un @HostListener o el cierre del overlay). */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") window.location.assign(volverHref)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [volverHref])

  /* Foco inicial dentro del diálogo. */
  useEffect(() => {
    dialogRef.current?.focus()
  }, [])

  useEffect(() => {
    return () => {
      if (copiaTimer.current) clearTimeout(copiaTimer.current)
    }
  }, [])

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(validarUrl)
    } catch {
      /* entorno sin clipboard: se ignora en el mock */
    }
    setCopiado(true)
    if (copiaTimer.current) clearTimeout(copiaTimer.current)
    copiaTimer.current = setTimeout(() => setCopiado(false), 2600)
  }

  async function descargarPdf() {
    setDescargando(true)
    /* mock de generación; en Angular es la descarga real del PDF. */
    await new Promise((r) => setTimeout(r, 700))
    setDescargando(false)
    setDescargado(true)
  }

  const estadoConfirmacion = copiado
    ? "Link copiado al portapapeles."
    : descargado
      ? "PDF descargado."
      : ""

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop — el expediente queda detrás, atenuado */}
      <a
        href={volverHref}
        aria-label="Cerrar y volver al expediente"
        className="absolute inset-0 bg-ink/55 backdrop-blur-[2px] transition-opacity motion-reduce:transition-none"
      />

      {/* Diálogo */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="entrega-titulo"
        aria-describedby="entrega-desc"
        tabIndex={-1}
        className="relative z-10 flex max-h-[100dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl border border-border bg-card shadow-2xl outline-none data-[enter]:translate-y-0 sm:rounded-xl"
      >
        {/* Encabezado */}
        <header className="flex items-start gap-3 border-b border-border px-5 py-4">
          <span
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-tech-blue"
            aria-hidden="true"
          >
            <FileCheck2 className="h-5 w-5" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-circuit">
              Bedelía · Entrega
            </p>
            <h1
              id="entrega-titulo"
              className="text-balance text-lg font-semibold tracking-tight text-foreground"
            >
              Entrega manual de certificación
            </h1>
          </div>
          <a
            href={volverHref}
            aria-label="Cerrar"
            className="-mr-1.5 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </a>
        </header>

        {/* Cuerpo desplazable */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <p id="entrega-desc" className="px-5 pt-4 text-sm leading-relaxed text-muted-foreground">
            El QR de validación es permanente. Entregá el link y el PDF al alumno
            por el canal que corresponda.
          </p>

          {/* Ficha del certificado */}
          <section className="px-5 pt-4">
            <h2 className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
              Certificado a entregar
            </h2>
            <dl className="mt-2 divide-y divide-border rounded-md border border-border bg-secondary/40">
              <Dato icon={UserRound} etiqueta="Alumno">
                {alumno.apellido}, {alumno.nombre}
              </Dato>
              <Dato icon={Hash} etiqueta="DNI" mono>
                {alumno.dni}
              </Dato>
              <Dato icon={GraduationCap} etiqueta="Curso">
                {curso.nombre}
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                  {curso.ciclo}
                </span>
              </Dato>
              <Dato
                icon={CalendarCheck2}
                etiqueta={`Fechas presentes · ${cert.fechas.length} jornadas`}
                mono
              >
                <span className="flex flex-wrap gap-x-2 gap-y-1">
                  {cert.fechas.map((f) => (
                    <span
                      key={f.fecha}
                      className="inline-flex items-center rounded-sm bg-card px-1.5 py-0.5 text-[12px] tabular-nums text-foreground ring-1 ring-border"
                    >
                      {fmtCorta.format(parseISO(f.fecha))}
                    </span>
                  ))}
                </span>
              </Dato>
              <Dato icon={FileCheck2} etiqueta="N.° de certificado" mono>
                {numero}
              </Dato>
            </dl>
          </section>

          {/* Enlace público + QR */}
          <section className="px-5 pt-4">
            <h2 className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
              Link público de validación
            </h2>
            <div className="mt-2 flex gap-3 rounded-md border border-border p-3">
              <QrDecorativo className="h-20 w-20 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="break-all font-mono text-[12px] leading-relaxed text-foreground">
                  {VALIDACION_HOST}
                  <span className="text-tech-blue">{validarPath}</span>
                </p>
                <p className="mt-1.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
                  <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
                  El QR no contiene datos personales; solo dirige a la validación
                  oficial.
                </p>
              </div>
            </div>
          </section>

          {/* Aclaraciones */}
          <section className="px-5 py-4">
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2 text-[12.5px] leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-circuit" strokeWidth={2} aria-hidden="true" />
                El sistema no envía emails. La entrega es manual.
              </li>
              <li className="flex items-start gap-2 text-[12.5px] leading-relaxed text-muted-foreground">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-tech-blue" strokeWidth={2} aria-hidden="true" />
                El PDF se genera con la Configuración institucional vigente
                (logos, autoridades y firmas digitales).
              </li>
            </ul>
          </section>
        </div>

        {/* Pie de acciones */}
        <footer className="border-t border-border bg-secondary/40 px-5 py-4">
          {/* Confirmación con reserva de espacio para evitar saltos */}
          <div className="mb-3 min-h-[1.25rem]" aria-live="polite">
            {estadoConfirmacion ? (
              <p className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-valid">
                <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                {estadoConfirmacion}
              </p>
            ) : (
              <span className="sr-only" role="status">
                Sin acciones realizadas todavía.
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <button
              type="button"
              onClick={copiarLink}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-sm bg-tech-blue px-4 text-sm font-semibold text-primary-foreground transition-[background-color,transform] hover:bg-tech-blue/90 active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card motion-reduce:active:translate-y-0"
            >
              {copiado ? (
                <>
                  <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                  Link copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  Copiar link
                </>
              )}
            </button>

            <button
              type="button"
              onClick={descargarPdf}
              disabled={descargando}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-sm border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 motion-reduce:active:translate-y-0"
            >
              {descargando ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  Generando…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  Descargar PDF
                </>
              )}
            </button>

            <a
              href={volverHref}
              className="inline-flex h-11 items-center justify-center rounded-sm px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:flex-none"
            >
              Cancelar
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}
