"use client"

import { useMemo, useState } from "react"
import {
  ArrowLeft,
  Search,
  Check,
  Plus,
  Users,
  CalendarDays,
  Info,
  AlertTriangle,
  ExternalLink,
  X,
  UserRoundCheck,
} from "lucide-react"

type Alumno = {
  id: string
  legajo: string
  apellido: string
  nombre: string
  dni: string
  email: string
}

type FechaCurso = {
  id: string
  fecha: string // ISO
  etiqueta: string
  /** la fecha ya tiene certificados emitidos para los presentes guardados */
  certificada: boolean
  /** presentes ya guardados en el sistema central para esa fecha */
  presentesGuardados: string[]
}

const CURSO = {
  nombre: "Programación Avanzada I",
  comision: "Comisión 2024-A",
  docente: "Prof. Ricardo Sosa",
  modalidad: "Presencial",
}

const ALUMNOS: Alumno[] = [
  { id: "a1", legajo: "STD-2024-001", apellido: "Ficticia", nombre: "Persona 101", dni: "DNI-FICTICIO-101", email: "persona.ficticia101@example.invalid" },
  { id: "a2", legajo: "STD-2024-002", apellido: "Ficticia", nombre: "Persona 102", dni: "DNI-FICTICIO-102", email: "persona.ficticia102@example.invalid" },
  { id: "a3", legajo: "STD-2024-003", apellido: "Ficticia", nombre: "Persona 103", dni: "DNI-FICTICIO-103", email: "persona.ficticia103@example.invalid" },
  { id: "a4", legajo: "STD-2024-004", apellido: "Ficticia", nombre: "Persona 104", dni: "DNI-FICTICIO-104", email: "persona.ficticia104@example.invalid" },
  { id: "a5", legajo: "STD-2024-005", apellido: "Ficticia", nombre: "Persona 105", dni: "DNI-FICTICIO-105", email: "persona.ficticia105@example.invalid" },
  { id: "a6", legajo: "STD-2024-006", apellido: "Ficticia", nombre: "Persona 106", dni: "DNI-FICTICIO-106", email: "persona.ficticia106@example.invalid" },
  { id: "a7", legajo: "STD-2024-007", apellido: "Ficticia", nombre: "Persona 107", dni: "DNI-FICTICIO-107", email: "persona.ficticia107@example.invalid" },
  { id: "a8", legajo: "STD-2024-008", apellido: "Ficticia", nombre: "Persona 108", dni: "DNI-FICTICIO-108", email: "persona.ficticia108@example.invalid" },
  { id: "a9", legajo: "STD-2024-009", apellido: "Ficticia", nombre: "Persona 109", dni: "DNI-FICTICIO-109", email: "persona.ficticia109@example.invalid" },
  { id: "a10", legajo: "STD-2024-010", apellido: "Ficticia", nombre: "Persona 110", dni: "DNI-FICTICIO-110", email: "persona.ficticia110@example.invalid" },
  { id: "a11", legajo: "STD-2024-011", apellido: "Ficticia", nombre: "Persona 111", dni: "DNI-FICTICIO-111", email: "persona.ficticia111@example.invalid" },
  { id: "a12", legajo: "STD-2024-012", apellido: "Ficticia", nombre: "Persona 112", dni: "DNI-FICTICIO-112", email: "persona.ficticia112@example.invalid" },
]

const FECHAS: FechaCurso[] = [
  {
    id: "f-12",
    fecha: "2024-05-14",
    etiqueta: "Clase 12",
    certificada: false,
    presentesGuardados: ["a1", "a3", "a5", "a8", "a9", "a11"],
  },
  {
    id: "f-11",
    fecha: "2024-05-07",
    etiqueta: "Clase 11",
    certificada: false,
    presentesGuardados: ["a1", "a2", "a4", "a6"],
  },
  {
    id: "f-final",
    fecha: "2024-04-23",
    etiqueta: "Evaluación final (certificada)",
    certificada: true,
    presentesGuardados: ["a1", "a2", "a3", "a4", "a5", "a8", "a10"],
  },
]

const fmtFechaLarga = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
})
const fmtFechaCorta = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function parseISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

const inputBase =
  "h-9 w-full rounded-sm border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"

export function AsistenciasEditor() {
  const [fechaId, setFechaId] = useState(FECHAS[0].id)
  const fecha = useMemo(() => FECHAS.find((f) => f.id === fechaId)!, [fechaId])

  // presentes guardados (baseline) para la fecha seleccionada
  const baseline = useMemo(
    () => new Set(fecha.presentesGuardados),
    [fecha],
  )

  const [presentesPorFecha, setPresentesPorFecha] = useState<Record<string, Set<string>>>(
    () =>
      Object.fromEntries(
        FECHAS.map((f) => [f.id, new Set(f.presentesGuardados)]),
      ),
  )
  const presentes = presentesPorFecha[fechaId]

  const [busqueda, setBusqueda] = useState("")
  const [guardado, setGuardado] = useState(false)

  function togglePresente(alumnoId: string) {
    setGuardado(false)
    setPresentesPorFecha((prev) => {
      const actual = new Set(prev[fechaId])
      if (actual.has(alumnoId)) actual.delete(alumnoId)
      else actual.add(alumnoId)
      return { ...prev, [fechaId]: actual }
    })
  }

  // resultados de búsqueda
  const resultados = useMemo(() => {
    const q = normalizar(busqueda.trim())
    if (!q) return ALUMNOS
    return ALUMNOS.filter((a) => {
      const dniPlano = a.dni.replace(/\./g, "")
      return (
        normalizar(a.apellido).includes(q) ||
        normalizar(a.nombre).includes(q) ||
        normalizar(`${a.apellido} ${a.nombre}`).includes(q) ||
        a.dni.includes(q) ||
        dniPlano.includes(q.replace(/\./g, ""))
      )
    })
  }, [busqueda])

  // diferencias respecto del baseline
  const { agregados, quitados } = useMemo(() => {
    let ag = 0
    let qt = 0
    presentes.forEach((id) => {
      if (!baseline.has(id)) ag += 1
    })
    baseline.forEach((id) => {
      if (!presentes.has(id)) qt += 1
    })
    return { agregados: ag, quitados: qt }
  }, [presentes, baseline])

  const cambios = agregados + quitados
  const hayCambios = cambios > 0
  const requiereReenvio = fecha.certificada && hayCambios
  const afectados = requiereReenvio ? cambios : 0

  function descartar() {
    setGuardado(false)
    setPresentesPorFecha((prev) => ({
      ...prev,
      [fechaId]: new Set(fecha.presentesGuardados),
    }))
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!hayCambios) return
    // TODO: reemplazar por la llamada real al backend (Angular service).
    // Payload: { fechaId, presentes: Array.from(presentes), nuevaEntrega: requiereReenvio }
    setGuardado(true)
    // En el port real, el baseline se actualizaría con la respuesta del backend.
    FECHAS.find((f) => f.id === fechaId)!.presentesGuardados = Array.from(presentes)
  }

  const totalPresentes = presentes.size

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Encabezado de página */}
      <div>
        <a
          href="#"
          className="inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Volver al curso
        </a>

        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Registro de presentes
            </p>
            <h1 className="mt-1 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {CURSO.nombre}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-circuit" aria-hidden="true" />
                {CURSO.comision}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                {CURSO.docente}
              </span>
              <span className="font-mono text-xs">{CURSO.modalidad}</span>
            </div>
          </div>

          <a
            href="#"
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-sm border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 lg:self-auto"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
            Ver curso
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        {/* Columna principal */}
        <div className="space-y-5">
          {/* Selector de fecha + buscador */}
          <section className="rounded-md border border-border bg-card p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[16rem_minmax(0,1fr)]">
              <div className="space-y-1.5">
                <label
                  htmlFor="fecha-clase"
                  className="block text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Fecha de la clase
                </label>
                <div className="relative">
                  <CalendarDays
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tech-blue"
                    strokeWidth={1.75}
                  />
                  <select
                    id="fecha-clase"
                    value={fechaId}
                    onChange={(e) => {
                      setFechaId(e.target.value)
                      setGuardado(false)
                    }}
                    className={`${inputBase} appearance-none bg-no-repeat pl-9 pr-9`}
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2354677a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                      backgroundPosition: "right 0.75rem center",
                      backgroundSize: "1rem",
                    }}
                  >
                    {FECHAS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {fmtFechaCorta.format(parseISO(f.fecha))} — {f.etiqueta}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="buscar-alumno"
                  className="block text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Buscar alumno
                </label>
                <div className="relative flex items-center">
                  <Search
                    className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <input
                    id="buscar-alumno"
                    type="search"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Apellido, nombre o DNI…"
                    className={`${inputBase} pl-9 pr-9`}
                  />
                  {busqueda ? (
                    <button
                      type="button"
                      onClick={() => setBusqueda("")}
                      aria-label="Limpiar búsqueda"
                      className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      <X className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          {/* Tabla de alumnos */}
          <section
            aria-labelledby="roster-titulo"
            className="rounded-md border border-border bg-card"
          >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <h2 id="roster-titulo" className="text-sm font-semibold text-foreground">
                  Alumnos del curso
                </h2>
                <span className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-xs font-semibold tabular-nums text-secondary-foreground">
                  {resultados.length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Marcá únicamente quiénes estuvieron presentes.
              </p>
            </header>

            {resultados.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <span
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground"
                  aria-hidden="true"
                >
                  <Search className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <p className="text-sm font-medium text-foreground">
                  Sin resultados para “{busqueda}”
                </p>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                  Revisá la ortografía o probá con el DNI completo.
                </p>
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              <>
                {/* Encabezado de tabla (desktop) */}
                <div className="hidden border-b border-border px-4 py-2 sm:px-5 lg:grid lg:grid-cols-[2.5rem_minmax(0,1fr)_8rem_minmax(0,12rem)_8.5rem] lg:items-center lg:gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    #
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Alumno
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    DNI
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Email
                  </span>
                  <span className="text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Presente
                  </span>
                </div>

                <ul className="divide-y divide-border">
                  {resultados.map((a, i) => {
                    const esPresente = presentes.has(a.id)
                    return (
                      <li
                        key={a.id}
                        className={`flex items-center justify-between gap-3 px-4 py-3 transition-colors sm:px-5 lg:grid lg:grid-cols-[2.5rem_minmax(0,1fr)_8rem_minmax(0,12rem)_8.5rem] lg:items-center lg:gap-3 lg:py-2.5 ${
                          esPresente ? "bg-valid-soft/50" : "hover:bg-secondary/40"
                        }`}
                      >
                        <span className="hidden font-mono text-xs tabular-nums text-muted-foreground lg:block">
                          {String(i + 1).padStart(2, "0")}
                        </span>

                        <div className="min-w-0 flex-1 lg:flex-none">
                          <p className="truncate text-sm font-medium text-foreground">
                            {a.apellido}, {a.nombre}
                          </p>
                          <p className="truncate font-mono text-xs text-muted-foreground">
                            {a.legajo}
                          </p>
                          {/* Datos compactos en mobile */}
                          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground lg:hidden">
                            <span className="font-mono tabular-nums text-foreground">
                              DNI {a.dni}
                            </span>
                            <span className="truncate">{a.email}</span>
                          </p>
                        </div>

                        <span className="hidden font-mono text-sm tabular-nums text-foreground lg:block">
                          {a.dni}
                        </span>

                        <span className="hidden truncate text-sm text-muted-foreground lg:block">
                          {a.email}
                        </span>

                        <div className="flex shrink-0 justify-end">
                          <button
                            type="button"
                            aria-pressed={esPresente}
                            aria-label={
                              esPresente
                                ? `Quitar a ${a.apellido}, ${a.nombre} de presentes`
                                : `Marcar a ${a.apellido}, ${a.nombre} como presente`
                            }
                            onClick={() => togglePresente(a.id)}
                            className={`inline-flex h-8 min-w-[7.5rem] items-center justify-center gap-1.5 rounded-sm border px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 active:scale-[0.98] ${
                              esPresente
                                ? "border-valid bg-valid text-valid-foreground hover:bg-valid/90"
                                : "border-border bg-card text-foreground hover:border-tech-blue/40 hover:bg-accent/50"
                            }`}
                          >
                            {esPresente ? (
                              <>
                                <Check className="h-4 w-4" strokeWidth={2.25} />
                                Presente
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4" strokeWidth={2} />
                                Marcar
                              </>
                            )}
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </section>
        </div>

        {/* Resumen lateral (sticky) */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4">
            <section
              aria-labelledby="resumen-titulo"
              className="rounded-md border border-border bg-card"
            >
              <header className="border-b border-border px-4 py-3">
                <h2
                  id="resumen-titulo"
                  className="text-sm font-semibold text-foreground"
                >
                  Resumen de carga
                </h2>
              </header>

              <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Fecha
                  </span>
                  <span className="text-right text-sm font-medium capitalize text-foreground">
                    {fmtFechaLarga.format(parseISO(fecha.fecha))}
                  </span>
                </div>

                <div className="flex items-end justify-between gap-3 rounded-sm bg-accent/50 px-3 py-3">
                  <div className="flex items-center gap-2 text-sm text-accent-foreground">
                    <UserRoundCheck
                      className="h-4 w-4 text-tech-blue"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    Presentes
                  </div>
                  <span className="font-mono text-2xl font-semibold leading-none tabular-nums text-ink">
                    {totalPresentes}
                  </span>
                </div>

                {/* Cambios sin guardar */}
                <div
                  className={`rounded-sm border px-3 py-2.5 ${
                    hayCambios
                      ? "border-tech-blue/30 bg-accent/40"
                      : "border-border bg-secondary/40"
                  }`}
                  aria-live="polite"
                >
                  <div className="flex items-start gap-2">
                    <Info
                      className={`mt-0.5 h-4 w-4 shrink-0 ${hayCambios ? "text-tech-blue" : "text-muted-foreground"}`}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 text-xs leading-relaxed">
                      {hayCambios ? (
                        <>
                          <p className="font-medium text-foreground">
                            {cambios} {cambios === 1 ? "cambio sin guardar" : "cambios sin guardar"}
                          </p>
                          <p className="mt-0.5 text-muted-foreground">
                            {agregados > 0 ? `${agregados} marcado${agregados === 1 ? "" : "s"}` : null}
                            {agregados > 0 && quitados > 0 ? " · " : null}
                            {quitados > 0 ? `${quitados} quitado${quitados === 1 ? "" : "s"}` : null}
                          </p>
                        </>
                      ) : (
                        <p className="text-muted-foreground">
                          {guardado
                            ? "Asistencias guardadas."
                            : "Sin cambios pendientes."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Aviso de impacto en certificados */}
                {requiereReenvio ? (
                  <div className="rounded-sm border border-warning/40 bg-warning-soft px-3 py-2.5">
                    <div className="flex items-start gap-2">
                      <AlertTriangle
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#8a6100]"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                      <p className="text-xs leading-relaxed text-foreground">
                        Si modificás una asistencia ya certificada, el certificado
                        deberá entregarse nuevamente al alumno. El QR seguirá siendo el mismo.
                        {afectados > 0 ? (
                          <span className="mt-1 block font-medium">
                            {afectados} certificado{afectados === 1 ? "" : "s"} a entregar nuevamente.
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Acciones */}
              <div className="space-y-2 border-t border-border p-4">
                <button
                  type="submit"
                  disabled={!hayCambios}
                  className="flex w-full items-center justify-center gap-2 rounded-sm bg-ink px-4 py-2.5 text-sm font-semibold text-ink-foreground transition-colors hover:bg-ink/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check className="h-4 w-4" strokeWidth={2.25} />
                  {requiereReenvio ? "Guardar y registrar entrega manual" : "Guardar asistencias"}
                </button>
                <button
                  type="button"
                  onClick={descartar}
                  disabled={!hayCambios}
                  className="flex w-full items-center justify-center rounded-sm border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </section>

            {guardado && !hayCambios ? (
              <p
                className="flex items-center justify-center gap-1.5 rounded-sm border border-valid/30 bg-valid-soft px-3 py-2 text-xs font-medium text-valid"
                role="status"
              >
                <Check className="h-4 w-4" strokeWidth={2.25} />
                Presentes guardados correctamente
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </form>
  )
}
