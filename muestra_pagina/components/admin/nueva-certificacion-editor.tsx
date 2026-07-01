"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  Search,
  Check,
  ChevronDown,
  Info,
  AlertTriangle,
  ShieldCheck,
  Send,
  X,
  UserRound,
  Mail,
  MailX,
  Lock,
  FileText,
  ExternalLink,
} from "lucide-react"

/* ------------------------------------------------------------------ *
 * Modelo de datos (mock). En el port a Angular se reemplaza por los
 * services reales. Nada de esto se persiste desde la UI.
 * ------------------------------------------------------------------ */

type FechaPresente = {
  fecha: string // ISO
  modulo: string
  carga: number // horas
}

type Curso = {
  id: string
  nombre: string
  ciclo: string
  fechas: FechaPresente[]
}

type Alumno = {
  id: string
  apellido: string
  nombre: string
  dni: string
  email: string | null
  /** fechas (ISO) en las que el alumno estuvo presente, por curso */
  presentesPorCurso: Record<string, string[]>
  /** certificación ya emitida y vigente, por curso */
  certificadoPorCurso: Record<string, string>
}

/** Autoridades y firmas: provienen de la configuración institucional global.
 *  NO son editables desde esta pantalla. */
const CONFIG_INSTITUCIONAL = {
  rectora: {
    nombre: "Lic. Adriana B. Funes",
    cargo: "Rectora — IFTS N.° 14",
  },
  asesora: {
    nombre: "Prof. Daniel E. Roldán",
    cargo: "Asesor Pedagógico — IFTS N.° 14",
  },
  validacionBase: "validar.ifts14.edu.ar",
}

const CURSOS: Curso[] = [
  {
    id: "c1",
    nombre: "Desarrollo de Sistemas Web II",
    ciclo: "2024 · 1.er cuatrimestre",
    fechas: [
      { fecha: "2024-03-15", modulo: "Unidad 1 — Frontend avanzado", carga: 4 },
      { fecha: "2024-03-22", modulo: "Unidad 2 — Arquitectura de estado", carga: 4 },
      { fecha: "2024-04-05", modulo: "Unidad 3 — Consumo de APIs", carga: 4 },
      { fecha: "2024-04-19", modulo: "Unidad 4 — Pruebas e integración", carga: 4 },
    ],
  },
  {
    id: "c2",
    nombre: "Bases de Datos Relacionales",
    ciclo: "2024 · 1.er cuatrimestre",
    fechas: [
      { fecha: "2024-03-18", modulo: "Modelo entidad–relación", carga: 3 },
      { fecha: "2024-04-01", modulo: "Normalización y SQL", carga: 3 },
      { fecha: "2024-04-15", modulo: "Índices y optimización", carga: 3 },
    ],
  },
  {
    id: "c3",
    nombre: "Taller de Introducción a IoT",
    ciclo: "2024 · 1.er cuatrimestre",
    // Curso aún sin fechas cargadas → dispara aviso bloqueante.
    fechas: [],
  },
]

const ALUMNOS: Alumno[] = [
  {
    id: "a1",
    apellido: "Gómez",
    nombre: "Laura Valentina",
    dni: "42.555.123",
    email: null, // sin email → emisión física
    presentesPorCurso: {
      c1: ["2024-03-15", "2024-03-22", "2024-04-05"],
      c2: ["2024-03-18", "2024-04-15"],
    },
    certificadoPorCurso: {},
  },
  {
    id: "a2",
    apellido: "Quiroga",
    nombre: "Martín Ezequiel",
    dni: "40.218.764",
    email: "m.quiroga@ifts14.edu.ar",
    presentesPorCurso: {
      c1: ["2024-03-15", "2024-03-22", "2024-04-05", "2024-04-19"],
      c2: ["2024-03-18", "2024-04-01", "2024-04-15"],
    },
    // ya tiene certificado vigente en Web II → no se puede re-emitir
    certificadoPorCurso: { c1: "IFTS14-CUR-2024-0031" },
  },
  {
    id: "a3",
    apellido: "Sanabria",
    nombre: "Carolina",
    dni: "43.901.550",
    email: "c.sanabria@ifts14.edu.ar",
    presentesPorCurso: {
      c1: ["2024-03-22", "2024-04-05", "2024-04-19"],
      // sin presentes en Bases de Datos → aviso bloqueante si se elige c2
      c2: [],
    },
    certificadoPorCurso: {},
  },
  {
    id: "a4",
    apellido: "Villalba",
    nombre: "Tomás Ignacio",
    dni: "41.677.209",
    email: "t.villalba@ifts14.edu.ar",
    presentesPorCurso: {
      c1: ["2024-03-15", "2024-04-05"],
    },
    certificadoPorCurso: {},
  },
]

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const fmtLarga = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})
const fmtCorta = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

function parseISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function normalizar(t: string) {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

const inputBase =
  "h-10 w-full rounded-sm border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"

/* QR institucional decorativo (no contiene datos personales). */
function QrDecorativo({ className = "" }: { className?: string }) {
  const cells = [
    1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0,
    1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0,
    1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1,
  ]
  return (
    <div
      className={`grid aspect-square grid-cols-8 gap-px bg-ink p-1.5 ${className}`}
      aria-hidden="true"
    >
      {cells.map((c, i) => (
        <span key={i} className={c ? "bg-ink-foreground" : "bg-ink"} />
      ))}
    </div>
  )
}

/* Monograma institucional geométrico (coherente con el resto del sistema). */
function Monograma({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="2" width="6" height="6" fill="currentColor" />
      <rect x="12" y="2" width="6" height="6" fill="var(--circuit)" />
      <rect x="2" y="12" width="6" height="6" fill="var(--circuit)" />
      <rect x="12" y="12" width="6" height="6" fill="currentColor" />
    </svg>
  )
}

/* ------------------------------------------------------------------ *
 * Combobox de alumno (buscador accesible)
 * ------------------------------------------------------------------ */

function BuscadorAlumno({
  alumno,
  onSelect,
}: {
  alumno: Alumno | null
  onSelect: (a: Alumno) => void
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const listId = "lista-alumnos"

  const resultados = useMemo(() => {
    const q = normalizar(query.trim())
    if (!q) return ALUMNOS
    return ALUMNOS.filter((a) => {
      const dniPlano = a.dni.replace(/\./g, "")
      return (
        normalizar(`${a.apellido} ${a.nombre}`).includes(q) ||
        normalizar(`${a.nombre} ${a.apellido}`).includes(q) ||
        a.dni.includes(q) ||
        dniPlano.includes(q.replace(/[.\s]/g, ""))
      )
    })
  }, [query])

  function elegir(a: Alumno) {
    onSelect(a)
    setQuery("")
    setOpen(false)
  }

  return (
    <div
      ref={wrapRef}
      className="relative"
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node)) setOpen(false)
      }}
    >
      <label
        htmlFor="buscar-alumno"
        className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
      >
        Seleccionar alumno
      </label>

      {alumno && !open ? (
        // Estado seleccionado: muestra el alumno como "chip" editable
        <button
          type="button"
          onClick={() => {
            setOpen(true)
            setQuery("")
          }}
          className="flex h-10 w-full items-center gap-2.5 rounded-sm border border-input bg-background px-3 text-left transition-colors hover:border-tech-blue/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-[10px] font-semibold text-ink-foreground"
            aria-hidden="true"
          >
            {alumno.nombre.charAt(0)}
            {alumno.apellido.charAt(0)}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
            {alumno.apellido}, {alumno.nombre}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {alumno.dni}
          </span>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-muted-foreground"
            strokeWidth={1.75}
          />
        </button>
      ) : (
        <div className="relative flex items-center">
          <Search
            className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground"
            strokeWidth={1.75}
          />
          <input
            id="buscar-alumno"
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            autoComplete="off"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false)
            }}
            placeholder="Apellido, nombre o DNI…"
            className={`${inputBase} pl-9 pr-3`}
          />
        </div>
      )}

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Alumnos"
          className="absolute z-20 mt-1.5 max-h-72 w-full overflow-auto rounded-sm border border-border bg-popover py-1 shadow-lg"
        >
          {resultados.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              Sin coincidencias para “{query}”.
            </li>
          ) : (
            resultados.map((a) => {
              const seleccionado = a.id === alumno?.id
              return (
                <li key={a.id} role="option" aria-selected={seleccionado}>
                  <button
                    type="button"
                    onClick={() => elegir(a)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-secondary focus:bg-secondary focus:outline-none"
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-[10px] font-semibold text-secondary-foreground"
                      aria-hidden="true"
                    >
                      {a.nombre.charAt(0)}
                      {a.apellido.charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {a.apellido}, {a.nombre}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                        {a.dni}
                        {a.email ? null : (
                          <span className="inline-flex items-center gap-1 text-warning">
                            <MailX className="h-3 w-3" strokeWidth={2} />
                            sin email
                          </span>
                        )}
                      </span>
                    </span>
                    {seleccionado ? (
                      <Check
                        className="h-4 w-4 shrink-0 text-tech-blue"
                        strokeWidth={2.25}
                      />
                    ) : null}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Aviso (banner de validación)
 * ------------------------------------------------------------------ */

type Tono = "info" | "warning" | "error"

function Aviso({
  tono,
  titulo,
  children,
  icon: Icon,
}: {
  tono: Tono
  titulo: string
  children?: React.ReactNode
  icon: typeof Info
}) {
  const estilos: Record<Tono, string> = {
    info: "border-tech-blue/30 bg-accent",
    warning: "border-warning/40 bg-warning-soft",
    error: "border-destructive/35 bg-destructive-soft",
  }
  const iconColor: Record<Tono, string> = {
    info: "text-tech-blue",
    warning: "text-warning",
    error: "text-destructive",
  }
  return (
    <div className={`flex gap-3 rounded-sm border px-3.5 py-3 ${estilos[tono]}`} role="status">
      <Icon
        className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor[tono]}`}
        strokeWidth={2}
        aria-hidden="true"
      />
      <div className="min-w-0 text-sm">
        <p className="font-medium text-foreground">{titulo}</p>
        {children ? (
          <p className="mt-0.5 leading-relaxed text-muted-foreground">{children}</p>
        ) : null}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Skeletons de carga (mientras se resuelven datos del alumno/curso)
 * ------------------------------------------------------------------ */

function Bloque({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block rounded-sm bg-secondary motion-safe:animate-pulse ${className}`}
      aria-hidden="true"
    />
  )
}

/** Skeleton del cuerpo del certificado: replica la estructura real
 *  (declaración, registro de asistencia, firmas, trazabilidad). */
function PreviewSkeleton() {
  return (
    <div aria-hidden="true">
      {/* Declaración + protagonista */}
      <div className="px-5 py-6 sm:px-8">
        <Bloque className="h-3.5 w-56 max-w-full" />
        <Bloque className="mt-3 h-8 w-72 max-w-full" />
        <Bloque className="mt-3 h-3.5 w-40" />
        <Bloque className="mt-4 h-3.5 w-full max-w-xl" />
        <Bloque className="mt-2 h-3.5 w-2/3 max-w-md" />
      </div>

      {/* Registro de asistencia */}
      <div className="border-t border-border px-5 py-5 sm:px-8">
        <Bloque className="h-3 w-60 max-w-full" />
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Bloque className="h-3.5 w-10" />
              <Bloque className="h-3.5 w-20" />
              <Bloque className="h-3.5 flex-1" />
              <Bloque className="h-3.5 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Firmas */}
      <div className="border-t border-border px-5 py-5 sm:px-8">
        <Bloque className="h-3 w-44" />
        <div className="mt-4 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i}>
              <Bloque className="h-12 w-full" />
              <Bloque className="mt-2 h-3.5 w-40 max-w-full" />
              <Bloque className="mt-1.5 h-3 w-28" />
            </div>
          ))}
        </div>
      </div>

      {/* Trazabilidad */}
      <div className="flex flex-col gap-5 border-t border-border bg-secondary/50 px-5 py-5 sm:flex-row sm:items-center sm:px-8">
        <Bloque className="h-24 w-24 shrink-0" />
        <div className="min-w-0 flex-1 space-y-3">
          <Bloque className="h-3.5 w-48 max-w-full" />
          <Bloque className="h-3.5 w-40" />
          <Bloque className="h-3 w-full max-w-sm" />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Pantalla principal
 * ------------------------------------------------------------------ */

export function NuevaCertificacionEditor() {
  const [alumnoId, setAlumnoId] = useState<string | null>("a1")
  const [cursoId, setCursoId] = useState<string>("c1")
  const [emitido, setEmitido] = useState(false)
  const [cargando, setCargando] = useState(false)

  // Simula la latencia del service que resuelve los datos del alumno y su
  // registro de asistencia para el curso elegido. En el port a Angular esto
  // se reemplaza por el estado del observable/resolver (loading | data | error).
  useEffect(() => {
    if (!alumnoId) {
      setCargando(false)
      return
    }
    setCargando(true)
    const t = setTimeout(() => setCargando(false), 650)
    return () => clearTimeout(t)
  }, [alumnoId, cursoId])

  const alumno = useMemo(
    () => ALUMNOS.find((a) => a.id === alumnoId) ?? null,
    [alumnoId],
  )
  const curso = useMemo(() => CURSOS.find((c) => c.id === cursoId)!, [cursoId])

  // fechas presentes del alumno en el curso elegido
  const fechasPresentes = useMemo(() => {
    if (!alumno) return []
    const isos = new Set(alumno.presentesPorCurso[cursoId] ?? [])
    return curso.fechas.filter((f) => isos.has(f.fecha))
  }, [alumno, cursoId, curso])

  const cargaTotal = fechasPresentes.reduce((s, f) => s + f.carga, 0)

  const certificadoExistente = alumno?.certificadoPorCurso[cursoId] ?? null

  // Estado de validaciones
  const cursoSinFechas = curso.fechas.length === 0
  const sinPresentes = !cursoSinFechas && fechasPresentes.length === 0
  const sinEmail = Boolean(alumno && !alumno.email)
  const yaCertificado = Boolean(certificadoExistente)

  const bloqueado =
    !alumno || cursoSinFechas || sinPresentes || yaCertificado

  // Datos derivados para la vista previa
  const numeroCert = useMemo(() => {
    if (!alumno) return "—"
    const seq = (Number(alumno.dni.replace(/\D/g, "")) % 9000) + 1000
    return `IFTS14-CUR-2024-${String(seq).padStart(4, "0")}`
  }, [alumno])

  const folio = useMemo(() => {
    if (!alumno) return "—"
    const n = (Number(alumno.dni.replace(/\D/g, "")) % 900) + 100
    return `14-2024-${n}`
  }, [alumno])

  const fechaEmision = fmtLarga.format(new Date(2024, 4, 10))

  function onEmitir(e: React.FormEvent) {
    e.preventDefault()
    if (bloqueado) return
    // TODO (port Angular): llamar al service de emisión.
    // payload: { alumnoId, cursoId, fechas: fechasPresentes.map(f => f.fecha),
    //            enviarEmail: !sinEmail }
    // La respuesta confirma QR permanente, PDF complementario y envío.
    setEmitido(true)
  }

  return (
    <form onSubmit={onEmitir} className="space-y-6">
      {/* Encabezado de página */}
      <div>
        <a
          href="/admin/certificaciones"
          className="inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Certificaciones
        </a>
        <div className="mt-3 flex flex-col gap-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-circuit">
            Emisión documental
          </p>
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Nueva certificación
          </h1>
          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
            Seleccioná alumno y curso para revisar el certificado complementario
            antes de emitirlo. La emisión es directa: no hay borrador ni
            aprobación posterior.
          </p>
        </div>
      </div>

      {/* Bloque de selección */}
      <section
        aria-label="Selección de alumno y curso"
        className="grid grid-cols-1 gap-4 rounded-md border border-border bg-card p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_13rem]"
      >
        <BuscadorAlumno
          alumno={alumno}
          onSelect={(a) => {
            setAlumnoId(a.id)
            setEmitido(false)
          }}
        />

        <div>
          <label
            htmlFor="curso"
            className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
          >
            Curso / asignatura
          </label>
          <div className="relative">
            <select
              id="curso"
              value={cursoId}
              onChange={(e) => {
                setCursoId(e.target.value)
                setEmitido(false)
              }}
              className={`${inputBase} appearance-none pr-9`}
            >
              {CURSOS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </div>
        </div>

        <div>
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Ciclo lectivo
          </span>
          <div className="flex h-10 items-center rounded-sm border border-dashed border-border bg-secondary/60 px-3 text-sm text-muted-foreground">
            {curso.ciclo}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Vista previa del certificado */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Vista previa del certificado
            </p>
            <p className="text-xs text-muted-foreground">
              El PDF complementario final se genera al emitir.
            </p>
          </div>

          <article
            aria-busy={cargando}
            className="overflow-hidden border border-border bg-card shadow-[0_1px_0_0_var(--border)]"
          >
            <span className="sr-only" role="status" aria-live="polite">
              {cargando ? "Cargando datos del certificado…" : ""}
            </span>
            {/* Encabezado institucional (banda navy) */}
            <div className="bg-ink px-5 py-6 text-ink-foreground sm:px-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-white/15 bg-white/5">
                    <Monograma className="h-6 w-6 text-ink-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] tracking-[0.2em] text-circuit">
                      CERTIFICADO COMPLEMENTARIO
                    </p>
                    <h2 className="mt-1.5 text-pretty text-lg font-semibold leading-tight sm:text-xl">
                      Instituto de Formación Técnica Superior N.° 14
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-ink-foreground/65">
                      Gobierno de la Ciudad Autónoma de Buenos Aires
                    </p>
                  </div>
                </div>

                {/* Folio + estado de emisión */}
                <div className="shrink-0 border border-white/15 bg-white/5 px-3.5 py-2.5 sm:text-right">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-foreground/55">
                    Folio
                  </p>
                  <p className="font-mono text-sm font-semibold tabular-nums">
                    {folio}
                  </p>
                  <p
                    className={`mt-1.5 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] ${
                      emitido ? "text-valid" : "text-circuit"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        emitido ? "bg-valid" : "bg-circuit"
                      }`}
                      aria-hidden="true"
                    />
                    {emitido ? "Emitido" : "Emisión preliminar"}
                  </p>
                </div>
              </div>
            </div>

            {cargando ? (
              <PreviewSkeleton />
            ) : alumno ? (
              <>
                {/* Cuerpo: declaración + protagonista */}
                <div className="px-5 py-6 sm:px-8">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    El IFTS N.° 14 certifica que el/la estudiante
                  </p>
                  <p className="mt-2 text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                    {alumno.nombre} {alumno.apellido}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      DNI
                      <span className="font-mono font-medium text-foreground">
                        {alumno.dni}
                      </span>
                    </span>
                  </div>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground">
                    cumplió con la asistencia registrada y auditada en el curso{" "}
                    <span className="font-semibold">{curso.nombre}</span>,
                    correspondiente al ciclo {curso.ciclo}.
                  </p>
                </div>

                {/* Registro de asistencia */}
                <div className="border-t border-border px-5 py-5 sm:px-8">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[11px] tracking-[0.15em] text-circuit">
                      I. REGISTRO DE ASISTENCIA AUDITADO
                    </p>
                    {fechasPresentes.length > 0 ? (
                      <p className="font-mono text-xs text-muted-foreground">
                        {fechasPresentes.length} jornadas · {cargaTotal} h
                      </p>
                    ) : null}
                  </div>

                  {cursoSinFechas ? (
                    <p className="mt-4 rounded-sm border border-dashed border-border bg-secondary/50 px-4 py-6 text-center text-sm text-muted-foreground">
                      El curso todavía no tiene fechas de cursada cargadas.
                    </p>
                  ) : sinPresentes ? (
                    <p className="mt-4 rounded-sm border border-dashed border-border bg-secondary/50 px-4 py-6 text-center text-sm text-muted-foreground">
                      El alumno no registra jornadas presentes en este curso.
                    </p>
                  ) : (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full min-w-[34rem] border-collapse">
                        <thead>
                          <tr className="border-b border-border text-left">
                            <th className="w-10 py-2 font-mono text-[11px] font-medium tracking-wide text-muted-foreground">
                              SEQ
                            </th>
                            <th className="py-2 pr-4 font-mono text-[11px] font-medium tracking-wide text-muted-foreground">
                              FECHA
                            </th>
                            <th className="py-2 pr-4 font-mono text-[11px] font-medium tracking-wide text-muted-foreground">
                              MÓDULO
                            </th>
                            <th className="py-2 pr-4 font-mono text-[11px] font-medium tracking-wide text-muted-foreground">
                              CARGA
                            </th>
                            <th className="py-2 text-right font-mono text-[11px] font-medium tracking-wide text-muted-foreground">
                              ESTADO
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {fechasPresentes.map((f, i) => (
                            <tr key={f.fecha} className="border-b border-border/60">
                              <td className="py-2.5 font-mono text-[13px] text-muted-foreground">
                                {String(i + 1).padStart(3, "0")}
                              </td>
                              <td className="py-2.5 pr-4 font-mono text-[13px] tabular-nums text-foreground">
                                {fmtCorta.format(parseISO(f.fecha))}
                              </td>
                              <td className="py-2.5 pr-4 text-[13px] text-foreground">
                                {f.modulo}
                              </td>
                              <td className="py-2.5 pr-4 font-mono text-[13px] tabular-nums text-muted-foreground">
                                {f.carga} h
                              </td>
                              <td className="py-2.5 text-right">
                                <span className="inline-flex items-center gap-1 font-mono text-[12px] font-medium text-valid">
                                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                                  Presente
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Autoridades firmantes (solo lectura, desde configuración global) */}
                <div className="border-t border-border px-5 py-5 sm:px-8">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-[11px] tracking-[0.15em] text-circuit">
                      II. AUTORIDADES FIRMANTES
                    </p>
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-secondary px-2 py-1 text-[11px] text-muted-foreground">
                      <Lock className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
                      Configuración institucional
                    </span>
                  </div>

                  <div className="mt-4 grid gap-x-10 gap-y-6 sm:grid-cols-2">
                    {[CONFIG_INSTITUCIONAL.rectora, CONFIG_INSTITUCIONAL.asesora].map(
                      (firma) => (
                        <div key={firma.cargo}>
                          {/* Sello / firma digital (representación) */}
                          <div className="flex h-12 items-end gap-2 border-b border-border pb-1">
                            <ShieldCheck
                              className="h-5 w-5 text-tech-blue/70"
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                            <span className="font-mono text-[11px] italic text-muted-foreground">
                              Firma digital verificada
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-foreground">
                            {firma.nombre}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {firma.cargo}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Trazabilidad: QR + validación */}
                <div className="flex flex-col gap-5 border-t border-border bg-secondary/50 px-5 py-5 sm:flex-row sm:items-center sm:px-8">
                  <QrDecorativo className="h-24 w-24" />
                  <div className="min-w-0 flex-1">
                    <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                      <div>
                        <dt className="font-mono text-[11px] tracking-wide text-muted-foreground">
                          N.° de certificado
                        </dt>
                        <dd className="mt-0.5 font-mono text-[13px] font-medium text-foreground">
                          {numeroCert}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[11px] tracking-wide text-muted-foreground">
                          Fecha de emisión
                        </dt>
                        <dd className="mt-0.5 text-[13px] font-medium text-foreground">
                          {fechaEmision}
                        </dd>
                      </div>
                    </dl>
                    <p className="mt-3 border-l-2 border-circuit pl-3 text-xs leading-relaxed text-muted-foreground">
                      Verificable en{" "}
                      <span className="font-mono text-foreground">
                        {CONFIG_INSTITUCIONAL.validacionBase}
                      </span>
                      . El QR permanente se genera al emitir y no contiene datos
                      personales.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              // Estado vacío del preview
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <span
                  className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-muted-foreground"
                  aria-hidden="true"
                >
                  <UserRound className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <p className="text-sm font-medium text-foreground">
                  Seleccioná un alumno para ver el certificado
                </p>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                  La vista previa se arma automáticamente con los datos del
                  alumno y las fechas presentes del curso.
                </p>
              </div>
            )}
          </article>
        </div>

        {/* Panel de acciones + validaciones (sticky) */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4">
            {/* Resumen de emisión */}
            <section className="rounded-md border border-border bg-card">
              <header className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">
                  Resumen de emisión
                </h2>
              </header>
              <dl className="divide-y divide-border text-sm">
                <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <dt className="text-muted-foreground">Alumno</dt>
                  <dd className="truncate text-right font-medium text-foreground">
                    {alumno ? `${alumno.apellido}, ${alumno.nombre}` : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <dt className="text-muted-foreground">Curso</dt>
                  <dd className="truncate text-right font-medium text-foreground">
                    {curso.nombre}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <dt className="text-muted-foreground">Jornadas presentes</dt>
                  <dd className="text-right font-mono font-semibold tabular-nums text-foreground">
                    {cargando ? (
                      <Bloque className="ml-auto h-4 w-6" />
                    ) : (
                      fechasPresentes.length
                    )}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <dt className="text-muted-foreground">Entrega</dt>
                  <dd className="inline-flex items-center gap-1.5 text-right font-medium text-foreground">
                    {sinEmail ? (
                      <>
                        <MailX
                          className="h-3.5 w-3.5 text-warning"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        Física
                      </>
                    ) : (
                      <>
                        <Mail
                          className="h-3.5 w-3.5 text-tech-blue"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        Email
                      </>
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Avisos de validación */}
            {(yaCertificado || cursoSinFechas || sinPresentes || sinEmail || emitido) && (
              <div className="space-y-2.5">
                {emitido ? (
                  <Aviso
                    tono="info"
                    titulo="Certificación emitida"
                    icon={ShieldCheck}
                  >
                    Se generó el QR permanente y el PDF complementario
                    {sinEmail
                      ? ". Descargá el documento para la entrega física."
                      : `. Se envió a ${alumno?.email}.`}
                  </Aviso>
                ) : null}

                {yaCertificado ? (
                  <Aviso
                    tono="error"
                    titulo="Ya existe una certificación vigente"
                    icon={AlertTriangle}
                  >
                    {alumno?.apellido}, {alumno?.nombre} ya tiene el certificado{" "}
                    <span className="font-mono text-foreground">
                      {certificadoExistente}
                    </span>{" "}
                    para este curso. No se puede emitir un duplicado.
                  </Aviso>
                ) : null}

                {cursoSinFechas ? (
                  <Aviso
                    tono="error"
                    titulo="El curso no tiene fechas cargadas"
                    icon={AlertTriangle}
                  >
                    Cargá las jornadas del curso antes de certificar.
                  </Aviso>
                ) : null}

                {sinPresentes ? (
                  <Aviso
                    tono="error"
                    titulo="Sin asistencias presentes"
                    icon={AlertTriangle}
                  >
                    El alumno no registra presentes en este curso, por lo que no
                    corresponde emitir el certificado.
                  </Aviso>
                ) : null}

                {sinEmail && !emitido ? (
                  <Aviso
                    tono="warning"
                    titulo="Alumno sin email registrado"
                    icon={Info}
                  >
                    La certificación se emite igual, pero la entrega será física.
                    El QR y el PDF se generan normalmente.
                  </Aviso>
                ) : null}
              </div>
            )}

            {/* Acciones */}
            <section className="rounded-md border border-border bg-card p-4">
              <button
                type="submit"
                disabled={bloqueado || emitido || cargando}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-ink px-4 text-sm font-semibold text-ink-foreground transition-colors hover:bg-ink/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {cargando ? (
                  <>
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-ink-foreground/30 border-t-ink-foreground"
                      aria-hidden="true"
                    />
                    Cargando…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                    {emitido ? "Certificación emitida" : "Emitir y enviar"}
                  </>
                )}
              </button>
              <a
                href="/admin/certificaciones"
                className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-sm border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                Cancelar
              </a>

              <p className="mt-3 flex gap-2 text-xs leading-relaxed text-muted-foreground">
                <FileText
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                Después de emitir, se generará el QR permanente, el PDF
                complementario y el envío al alumno.
              </p>

              {emitido ? (
                <a
                  href="#"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-tech-blue underline-offset-4 hover:underline"
                >
                  Ver certificado emitido
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
                </a>
              ) : null}
            </section>
          </div>
        </aside>
      </div>
    </form>
  )
}
