"use client"

import {
  ArrowLeft,
  Pencil,
  Plus,
  Upload,
  CheckCircle2,
  CircleDashed,
  CalendarDays,
} from "lucide-react"

type EstadoCurso = "activo" | "inactivo"

type FechaCursada = {
  id: string
  fechaISO: string
  /** presentes cargados; null = carga pendiente */
  presentes: number | null
}

type Curso = {
  id: string
  nombre: string
  codigo: string
  estado: EstadoCurso
  fechas: FechaCursada[]
}

// Datos de muestra. En el port a Angular se reemplaza por el resolver de la ruta.
const CURSO: Curso = {
  id: "introduccion-sistemas-embebidos",
  nombre: "Introducci\u00f3n a Sistemas Embebidos e Internet de las Cosas",
  codigo: "CUR-2026-001",
  estado: "activo",
  fechas: [
    { id: "f-2026-10-28", fechaISO: "2026-10-28", presentes: 28 },
    { id: "f-2026-10-30", fechaISO: "2026-10-30", presentes: null },
    { id: "f-2026-11-01", fechaISO: "2026-11-01", presentes: 27 },
  ],
}

const fmtFecha = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})

function parseISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function formatearFecha(iso: string) {
  // "28 octubre 2026" -> "28 Octubre 2026"
  const txt = fmtFecha.format(parseISO(iso)).replace(/ de /g, " ")
  return txt.charAt(0).toUpperCase() + txt.slice(1).replace(/\s(\p{L})/u, (m) => m)
}

const CURSOS_HREF = "/admin/cursos"

export function CursoDetalle() {
  const curso = CURSO
  const fechasCargadas = curso.fechas.length
  const pendientes = curso.fechas.filter((f) => f.presentes === null).length

  return (
    <div className="space-y-6">
      {/* Volver */}
      <a
        href={CURSOS_HREF}
        className="inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Volver a cursos
      </a>

      {/* Ficha del curso */}
      <article className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
        {/* Acento institucional lateral */}
        <div className="flex">
          <div
            className={`w-1 shrink-0 ${curso.estado === "activo" ? "bg-circuit" : "bg-border"}`}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1 p-5 sm:p-6 lg:p-7">
            {/* Encabezado: identidad + acción */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-sm border border-border bg-secondary px-2 py-0.5 font-mono text-xs font-medium tracking-tight text-secondary-foreground">
                    {curso.codigo}
                  </span>
                  <EstadoBadge estado={curso.estado} />
                </div>
                <h1 className="mt-3 text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                  {curso.nombre}
                </h1>
              </div>

              <a
                href={`/admin/cursos/${curso.id}/editar`}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-sm border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Pencil className="h-4 w-4" strokeWidth={1.75} />
                Editar curso
              </a>
            </div>

            <hr className="my-6 border-border" />

            {/* Registro de asistencias */}
            <section aria-labelledby="asistencias-titulo">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2
                    id="asistencias-titulo"
                    className="text-lg font-semibold tracking-tight text-foreground"
                  >
                    Registro de asistencias
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground" aria-live="polite">
                    <span className="font-mono tabular-nums text-foreground">{fechasCargadas}</span>{" "}
                    {fechasCargadas === 1 ? "fecha cargada" : "fechas cargadas"}
                    {pendientes > 0 ? (
                      <>
                        {" \u00b7 "}
                        <span className="inline-flex items-center gap-1 font-medium text-foreground">
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-warning"
                            aria-hidden="true"
                          />
                          {pendientes} pendiente{pendientes === 1 ? "" : "s"}
                        </span>
                      </>
                    ) : null}
                  </p>
                </div>

                <div className="flex flex-col gap-2 min-[420px]:flex-row sm:gap-2">
                  <a
                    href={`/admin/cursos/${curso.id}/fechas/nueva`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    Agregar fecha
                  </a>
                  <a
                    href={`/admin/cursos/${curso.id}/asistencias`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-tech-blue px-4 text-sm font-medium text-ink-foreground shadow-sm transition-colors hover:bg-tech-blue/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <Upload className="h-4 w-4" strokeWidth={2} />
                    Cargar asistencias
                  </a>
                </div>
              </div>

              {/* Tabla de fechas (desktop) */}
              <div className="mt-5 hidden sm:block">
                <table className="w-full border-collapse text-left text-sm">
                  <caption className="sr-only">
                    Fechas de cursada y asistencias cargadas
                  </caption>
                  <thead>
                    <tr className="border-b border-border">
                      <th scope="col" className="py-2.5 pr-4">
                        <ColLabel>Fecha</ColLabel>
                      </th>
                      <th scope="col" className="py-2.5 pr-4">
                        <ColLabel>Asistencias cargadas</ColLabel>
                      </th>
                      <th scope="col" className="py-2.5 pl-4 text-right">
                        <ColLabel className="justify-end">Acci&oacute;n</ColLabel>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {curso.fechas.map((f) => {
                      const pendiente = f.presentes === null
                      return (
                        <tr
                          key={f.id}
                          className="border-b border-border last:border-0 transition-colors hover:bg-accent/40"
                        >
                          <td className="py-3.5 pr-4">
                            <span className="font-mono text-sm tabular-nums text-foreground">
                              {formatearFecha(f.fechaISO)}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4">
                            <EstadoCarga presentes={f.presentes} />
                          </td>
                          <td className="py-3.5 pl-4 text-right">
                            {pendiente ? (
                              <a
                                href={`/admin/cursos/${curso.id}/asistencias?fecha=${f.id}`}
                                className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-sm font-medium text-tech-blue transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                              >
                                <Upload className="h-3.5 w-3.5" strokeWidth={2} />
                                Cargar asistencias
                              </a>
                            ) : (
                              <a
                                href={`/admin/cursos/${curso.id}/asistencias?fecha=${f.id}`}
                                className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-sm font-medium text-tech-blue transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                              >
                                Ver asistencias
                              </a>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Lista de fechas (mobile) */}
              <ul className="mt-5 space-y-3 sm:hidden">
                {curso.fechas.map((f) => {
                  const pendiente = f.presentes === null
                  return (
                    <li
                      key={f.id}
                      className="rounded-sm border border-border bg-background p-4"
                    >
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          className="h-4 w-4 text-muted-foreground"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                        <span className="font-mono text-sm tabular-nums text-foreground">
                          {formatearFecha(f.fechaISO)}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <EstadoCarga presentes={f.presentes} />
                        <a
                          href={`/admin/cursos/${curso.id}/asistencias?fecha=${f.id}`}
                          className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-sm px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${
                            pendiente
                              ? "bg-tech-blue text-ink-foreground hover:bg-tech-blue/90"
                              : "border border-border bg-card text-foreground hover:bg-secondary"
                          }`}
                        >
                          {pendiente ? (
                            <>
                              <Upload className="h-3.5 w-3.5" strokeWidth={2} />
                              Cargar
                            </>
                          ) : (
                            "Ver asistencias"
                          )}
                        </a>
                      </div>
                    </li>
                  )
                })}
              </ul>

              {curso.fechas.length === 0 ? (
                <div className="mt-5 flex flex-col items-center justify-center rounded-sm border border-dashed border-border px-6 py-12 text-center">
                  <span
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground"
                    aria-hidden="true"
                  >
                    <CalendarDays className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    Todav&iacute;a no hay fechas cargadas
                  </p>
                  <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                    Agreg&aacute; la primera fecha de cursada para empezar a registrar
                    asistencias.
                  </p>
                  <a
                    href={`/admin/cursos/${curso.id}/fechas/nueva`}
                    className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-sm bg-ink px-3 text-sm font-medium text-ink-foreground transition-colors hover:bg-ink/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    Agregar fecha
                  </a>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </article>
    </div>
  )
}

/* ---------- Subcomponentes ---------- */

function ColLabel({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={`flex items-center gap-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground ${className}`}
    >
      {children}
    </span>
  )
}

function EstadoBadge({ estado }: { estado: EstadoCurso }) {
  if (estado === "activo") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm border border-valid/30 bg-valid-soft px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide text-valid">
        <span className="h-1.5 w-1.5 rounded-full bg-valid" aria-hidden="true" />
        Activo
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-secondary px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" aria-hidden="true" />
      Inactivo
    </span>
  )
}

function EstadoCarga({ presentes }: { presentes: number | null }) {
  if (presentes === null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm border border-warning/40 bg-warning-soft px-2 py-0.5 text-sm font-medium text-foreground">
        <CircleDashed className="h-3.5 w-3.5 text-warning" strokeWidth={2.25} aria-hidden="true" />
        Pendiente
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
      <CheckCircle2 className="h-4 w-4 text-valid" strokeWidth={2} aria-hidden="true" />
      <span className="font-mono font-semibold tabular-nums">{presentes}</span> presentes
    </span>
  )
}
