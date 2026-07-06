"use client"

import { useState } from "react"
import { Download, Printer, Lock, ShieldCheck, Link2, Sun, Wind, Leaf, Cpu } from "lucide-react"

/* ------------------------------------------------------------------ *
 * Vista previa del certificado oficial IFTS N.° 14 (formato apaisado).
 *
 * Replica la identidad del certificado institucional real (fondo celeste,
 * trama de puntos, líneas de circuito, íconos sustentables y logos del
 * GCBA) e incorpora el bloque de validación con QR.
 *
 * Componente autocontenido (solo React + lucide-react), sin APIs de
 * Next.js, para portarse luego a Angular 20 + Tailwind.
 *
 * IMPORTANTE: nombres de autoridades, cargos, firmas, logos y texto base
 * provienen de Configuración institucional. NO son editables aquí.
 * Layout 100% fluido: en mobile reflowa sin recortes ni scroll lateral.
 * ------------------------------------------------------------------ */

const CONFIG_INSTITUCIONAL = {
  organismo: {
    instituto: "Instituto de Formación Técnica Superior N.° 14",
    sigla: "IFTS 14",
    direccion: "Dirección de Educación Técnica Superior",
    agencia: "Agencia de Habilidades para el Futuro",
  },
  firmantes: [
    { nombre: "M. Marcelo Canetti", cargo: "Rector — IFTS 14" },
    { nombre: "María Eugenia Pizzul", cargo: "Asesora Pedagógica — IFTS 14" },
  ],
}

/** Datos del certificado (mock; en Angular llega del resolver/service). */
const CERTIFICADO = {
  alumno: { nombre: "Persona", apellido: "Ficticia", dni: "DNI-FICTICIO-002" },
  curso: {
    nombre: "Introducción a Sistemas Embebidos e Internet de las Cosas",
    fechas: ["2024-03-15", "2024-07-05"],
    cargaHoraria: 64,
  },
  admin: {
    numero: "IFTS14-CUR-2024-0124",
    emision: "2024-08-15",
    folio: "2024-00124",
    token: "fictio-sample-002",
  },
}

const VALIDACION_HOST = "certs.ifts14.edu.ar"

/* --------------------------- helpers ----------------------------- */

const fmtCorta = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
const fmtLarga = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric" })
const fmtMesAnio = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" })

function parseISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}
function capitalizar(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/* ------------------------------------------------------------------ *
 * Piezas decorativas (identidad visual del certificado real)
 * ------------------------------------------------------------------ */

/** Trama de puntos (halftone) que decora la esquina superior izquierda. */
function TramaPuntos({ className = "" }: { className?: string }) {
  const cols = 9
  const rows = 7
  const dots = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // se desvanece hacia la derecha y hacia abajo
      const fade = 1 - (c / cols) * 0.7 - (r / rows) * 0.7
      if (fade <= 0.06) continue
      dots.push(<circle key={`${r}-${c}`} cx={c * 11 + 4} cy={r * 11 + 4} r="3" opacity={fade} />)
    }
  }
  return (
    <svg className={className} viewBox="0 0 100 78" fill="var(--circuit)" aria-hidden="true">
      {dots}
    </svg>
  )
}

/** Líneas de circuito (trazas técnicas) para los márgenes. Decorativas. */
function LineasCircuito({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 240" fill="none" aria-hidden="true">
      <g stroke="var(--circuit)" strokeWidth="1.4" opacity="0.55">
        <path d="M8 0 V40 l14 14 V120 l-10 10 V190 l16 16 V240" />
        <path d="M40 10 V70 l18 18 V150" />
        <path d="M8 40 H30 M22 54 H64 M2 130 H34 M28 206 H72 M58 88 H96" />
      </g>
      <g fill="var(--circuit)" opacity="0.8">
        {[
          [8, 0],
          [22, 54],
          [12, 130],
          [58, 88],
          [40, 10],
          [58, 150],
          [72, 206],
          [96, 88],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.4" />
        ))}
      </g>
    </svg>
  )
}

/** Cluster de íconos sustentables (energía limpia), como en el original. */
function IconosSustentables({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-end gap-2 text-circuit ${className}`} aria-hidden="true">
      <Wind className="h-7 w-7" strokeWidth={1.4} />
      <Sun className="h-6 w-6" strokeWidth={1.4} />
      <Leaf className="h-6 w-6" strokeWidth={1.4} />
    </div>
  )
}

/** QR institucional decorativo (no contiene datos personales). */
function QrDecorativo({ className = "" }: { className?: string }) {
  const cells = [
    1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0,
    1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1,
  ]
  return (
    <div className={`grid aspect-square grid-cols-8 gap-px bg-ink p-1.5 ${className}`} aria-hidden="true">
      {cells.map((c, i) => (
        <span key={i} className={c ? "bg-ink-foreground" : "bg-ink"} />
      ))}
    </div>
  )
}

/* --------------------------- logos (placeholders institucionales) --- */

/** Escudo circular (placeholder del Escudo de la Ciudad / Nacional). */
function EscudoCircular({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex aspect-square items-center justify-center rounded-full border-2 border-ink/70 bg-card ${className}`}
      title="Escudo institucional (logo oficial)"
    >
      <Cpu className="h-1/2 w-1/2 text-ink/80" strokeWidth={1.5} aria-hidden="true" />
      <span className="sr-only">Escudo institucional</span>
    </div>
  )
}

/** Bloque de marca "Buenos Aires Aprende / Agencia de Habilidades". */
function MarcaPrograma() {
  return (
    <div className="text-center leading-tight" title="Buenos Aires Aprende — Agencia de Habilidades para el Futuro">
      <p className="font-semibold text-ink">
        Buenos Aires <span className="font-normal italic text-tech-blue">aprende</span>
      </p>
      <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
        Agencia de Habilidades para el Futuro
      </p>
    </div>
  )
}

/** Marca IFTS (placeholder del logo de engranaje). */
function MarcaIfts({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-1.5 font-mono text-sm font-bold tracking-[0.1em] text-ink ${className}`}
      title="IFTS N.° 14 (logo oficial)"
    >
      <span aria-hidden="true" className="text-tech-blue">
        [
      </span>
      IFTS
      <span aria-hidden="true" className="text-tech-blue">
        ]
      </span>
      <sup className="text-[10px] text-circuit">14</sup>
    </div>
  )
}

/** Marca "BA · Buenos Aires Ciudad" (placeholder, recuadro amarillo). */
function MarcaCiudad({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-sm bg-warning px-2.5 py-1.5 ${className}`} title="Buenos Aires Ciudad (logo oficial)">
      <span aria-hidden="true" className="font-mono text-lg font-extrabold leading-none text-ink">
        BA
      </span>
      <span className="text-left font-mono text-[8px] font-semibold uppercase leading-[1.15] tracking-[0.08em] text-ink">
        Buenos Aires
        <br />
        Ciudad
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Vista previa
 * ------------------------------------------------------------------ */

export function VistaPreviaPdf({ id }: { id?: string }) {
  const { alumno, curso, admin } = CERTIFICADO
  const [descargando, setDescargando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  const numero = id ?? admin.numero
  const fechas = curso.fechas.map(parseISO)
  const desde = fechas[0]
  const hasta = fechas[fechas.length - 1]
  const periodo = `${capitalizar(fmtMesAnio.format(desde))} a ${capitalizar(fmtMesAnio.format(hasta))}`
  const validarPath = `/v/${admin.token}`

  async function onDescargar() {
    setDescargando(true)
    await new Promise((r) => setTimeout(r, 900))
    setDescargando(false)
    setAviso("Se generó el PDF del certificado para descarga.")
    setTimeout(() => setAviso(null), 3000)
  }
  function onImprimir() {
    if (typeof window !== "undefined") window.print()
  }

  return (
    <div className="space-y-5">
      <span className="sr-only" role="status" aria-live="polite">
        {descargando ? "Generando PDF…" : (aviso ?? "")}
      </span>

      {/* -------- Barra de acciones (no se imprime) -------- */}
      <div className="flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-circuit">Vista previa del certificado</p>
          <h1 className="mt-1 text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Certificado oficial · {numero}
          </h1>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={onImprimir}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-border bg-card px-4 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 active:translate-y-px"
          >
            <Printer className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Imprimir
          </button>
          <button
            type="button"
            onClick={onDescargar}
            disabled={descargando}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-ink px-4 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-ink-foreground transition-colors hover:bg-ink/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
          >
            {descargando ? (
              <span
                className="h-4 w-4 rounded-full border-2 border-ink-foreground/30 border-t-ink-foreground motion-safe:animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Download className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            )}
            Descargar PDF
          </button>
        </div>
      </div>

      {aviso ? (
        <p
          className="flex items-center gap-2 rounded-sm border border-tech-blue/30 bg-accent px-3 py-2 text-sm text-foreground print:hidden"
          role="status"
        >
          <ShieldCheck className="h-4 w-4 shrink-0 text-tech-blue" strokeWidth={2} aria-hidden="true" />
          {aviso}
        </p>
      ) : null}

      {/* -------- Certificado (fluido, sin recortes) -------- */}
      <article
        aria-label={`Certificado de ${alumno.nombre} ${alumno.apellido} — vista previa`}
        className="relative isolate mx-auto w-full max-w-5xl overflow-hidden rounded-xl border border-tech-blue/15 bg-accent shadow-[0_24px_60px_-32px_rgba(11,31,51,0.45)] sm:rounded-2xl"
      >
        {/* Decoraciones de marca — no informativas, nunca generan scroll */}
        <TramaPuntos className="pointer-events-none absolute -left-2 -top-2 h-24 w-28 sm:h-32 sm:w-36" />
        <LineasCircuito className="pointer-events-none absolute bottom-0 left-0 hidden h-2/3 w-16 opacity-90 sm:block lg:w-24" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 overflow-hidden sm:h-52 sm:w-52">
          <LineasCircuito className="absolute -bottom-6 -right-2 h-56 w-28 -scale-x-100 opacity-80" />
          <IconosSustentables className="absolute bottom-16 right-6 sm:bottom-20 sm:right-8" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 px-5 py-7 sm:gap-7 sm:px-10 sm:py-9 lg:px-16">
          {/* ---------- Encabezado: logos institucionales ---------- */}
          <header className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <EscudoCircular className="w-14 shrink-0 sm:w-16" />
            <div className="order-last w-full sm:order-none sm:w-auto sm:pt-1">
              <MarcaPrograma />
            </div>
            <MarcaIfts className="shrink-0 sm:pt-1" />
          </header>

          {/* ---------- Título ---------- */}
          <div className="text-center">
            <h2 className="font-serif text-4xl font-bold tracking-[0.08em] text-ink sm:text-5xl lg:text-6xl">
              CERTIFICADO
            </h2>
          </div>

          {/* ---------- Cuerpo ---------- */}
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <p className="text-pretty text-sm leading-relaxed text-foreground sm:text-base">
              El {CONFIG_INSTITUCIONAL.organismo.instituto} ({CONFIG_INSTITUCIONAL.organismo.sigla}), que integra la{" "}
              {CONFIG_INSTITUCIONAL.organismo.direccion} — {CONFIG_INSTITUCIONAL.organismo.agencia}, certifica que:
            </p>

            <p className="mt-5 text-balance font-serif text-3xl font-bold leading-tight text-ink sm:text-4xl lg:text-5xl">
              {alumno.nombre} {alumno.apellido}
            </p>
            <div className="mt-2 h-px w-full max-w-2xl bg-ink/35" aria-hidden="true" />
            <p className="mt-2 font-mono text-xs text-muted-foreground sm:text-sm">D.N.I. {alumno.dni}</p>

            <p className="mt-5 text-pretty text-sm leading-relaxed text-foreground sm:text-base">
              ha aprobado el curso de formación profesional{" "}
              <span className="font-semibold text-tech-blue">“{curso.nombre}”</span>, dictado entre {periodo}, con una
              carga horaria de {curso.cargaHoraria} horas reloj.
            </p>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-foreground sm:text-base">
              Se extiende el presente certificado a solicitud del/la interesado/a, para constancia de su aprobación.
              Ciudad Autónoma de Buenos Aires, {fmtLarga.format(parseISO(admin.emision))}.
            </p>
          </div>

          {/* ---------- Firmas + validación (QR) ---------- */}
          <div className="mt-2 grid gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-[1fr_minmax(0,17rem)_1fr] lg:items-end">
            <FirmaInstitucional firma={CONFIG_INSTITUCIONAL.firmantes[0]} />

            {/* Bloque de validación con QR — orden prioritario en mobile */}
            <div className="order-first rounded-md border border-tech-blue/25 bg-card/80 p-3.5 sm:col-span-2 sm:mx-auto sm:max-w-md lg:order-none lg:col-span-1 lg:max-w-none">
              <div className="flex items-center gap-3">
                <QrDecorativo className="h-[4.5rem] w-[4.5rem] shrink-0" />
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-tech-blue">Validación digital</p>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">Escanee el código QR o visite:</p>
                  <p className="mt-0.5 break-all font-mono text-[11px] leading-snug text-tech-blue">
                    {VALIDACION_HOST}
                    {validarPath}
                  </p>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-ink/10 pt-2.5">
                <DatoControl etiqueta="Emisión" valor={fmtCorta.format(parseISO(admin.emision))} />
                <DatoControl etiqueta="Folio" valor={admin.folio} />
                <div className="col-span-2">
                  <DatoControl etiqueta="N.° certificado" valor={numero} />
                </div>
              </dl>
            </div>

            <FirmaInstitucional firma={CONFIG_INSTITUCIONAL.firmantes[1]} />
          </div>

          {/* ---------- Pie: marca Ciudad + nota de configuración ---------- */}
          <div className="flex flex-col items-center gap-3 border-t border-ink/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <MarcaCiudad />
            <p className="inline-flex items-center gap-1.5 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              <Lock className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden="true" />
              Datos institucionales desde Configuración
            </p>
          </div>
        </div>
      </article>

      {/* Nota fuera del documento (no se imprime) */}
      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground print:hidden">
        <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
        Este documento puede validarse escaneando el código QR. El QR es permanente y no contiene datos personales: solo
        dirige a la verificación oficial del certificado.
      </p>
    </div>
  )
}

/* --------------------------- subcomponentes ----------------------- */

function FirmaInstitucional({ firma }: { firma: { nombre: string; cargo: string } }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-10 max-w-[15rem] items-end justify-center gap-1.5 pb-1">
        <ShieldCheck className="h-4 w-4 text-tech-blue/60" strokeWidth={1.5} aria-hidden="true" />
        <span className="font-mono text-[10px] italic text-muted-foreground">Firma digital verificada</span>
      </div>
      <div className="mx-auto max-w-[16rem] border-t border-ink/45 pt-2">
        <p className="text-sm font-semibold text-ink">{firma.nombre}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{firma.cargo}</p>
      </div>
    </div>
  )
}

function DatoControl({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{etiqueta}</dt>
      <dd className="truncate font-mono text-[11px] font-semibold tabular-nums text-ink" title={valor}>
        {valor}
      </dd>
    </div>
  )
}
