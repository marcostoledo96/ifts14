"use client"

import { useMemo, useState } from "react"
import {
  Plus,
  Search,
  Eye,
  Pencil,
  CalendarDays,
  Users,
  BadgeCheck,
  FolderOpen,
  AlertTriangle,
  RotateCw,
  X,
} from "lucide-react"

type EstadoCurso = "activo" | "inactivo"

type Curso = {
  id: string
  nombre: string
  codigo: string
  cuatrimestre: string
  fechas: number
  alumnosPresentes: number
  certificaciones: number
  estado: EstadoCurso
}

const CURSOS: Curso[] = [
  {
    id: "desarrollo-sistemas-web-ii",
    nombre: "Desarrollo de Sistemas Web II",
    codigo: "DSW-02",
    cuatrimestre: "1.er cuatrimestre 2026",
    fechas: 12,
    alumnosPresentes: 32,
    certificaciones: 28,
    estado: "activo",
  },
  {
    id: "introduccion-sistemas-embebidos",
    nombre: "Introducci\u00f3n a Sistemas Embebidos e IoT",
    codigo: "ISE-01",
    cuatrimestre: "1.er cuatrimestre 2026",
    fechas: 8,
    alumnosPresentes: 25,
    certificaciones: 15,
    estado: "activo",
  },
  {
    id: "ciberseguridad-infraestructura",
    nombre: "Ciberseguridad e Infraestructura",
    codigo: "CSI-03",
    cuatrimestre: "Sin programar",
    fechas: 0,
    alumnosPresentes: 0,
    certificaciones: 0,
    estado: "inactivo",
  },
  {
    id: "programacion-avanzada-i",
    nombre: "Programaci\u00f3n Avanzada I",
    codigo: "PAV-01",
    cuatrimestre: "1.er cuatrimestre 2026",
    fechas: 10,
    alumnosPresentes: 30,
    certificaciones: 25,
    estado: "activo",
  },
  {
    id: "redes-y-comunicaciones",
    nombre: "Redes y Comunicaciones de Datos",
    codigo: "RCD-02",
    cuatrimestre: "2.\u00ba cuatrimestre 2025",
    fechas: 14,
    alumnosPresentes: 41,
    certificaciones: 38,
    estado: "inactivo",
  },
  {
    id: "analisis-de-datos",
    nombre: "An\u00e1lisis de Datos con Python",
    codigo: "ADP-01",
    cuatrimestre: "Sin programar",
    fechas: 0,
    alumnosPresentes: 0,
    certificaciones: 0,
    estado: "activo",
  },
]

type Vista = "datos" | "cargando" | "error" | "vacio-total"

const NUEVO_CURSO_HREF = "/admin/cursos/nuevo"

export function ListaCursos() {
  // Filtros como toggles con sentido: por estado y por carga de fechas.
  const [busqueda, setBusqueda] = useState("")
  const [estados, setEstados] = useState<Set<EstadoCurso>>(new Set())
  const [fechas, setFechas] = useState<Set<"con" | "sin">>(new Set())

  // Estados de pantalla demostrables sin backend (loading / error / vacío).
  const [vista, setVista] = useState<Vista>("datos")

  const fuente = vista === "vacio-total" ? [] : CURSOS

  const cursosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return fuente.filter((c) => {
      if (q && !c.nombre.toLowerCase().includes(q) && !c.codigo.toLowerCase().includes(q)) {
        return false
      }
      if (estados.size > 0 && !estados.has(c.estado)) return false
      if (fechas.size > 0) {
        const tieneFechas = c.fechas > 0 ? "con" : "sin"
        if (!fechas.has(tieneFechas)) return false
      }
      return true
    })
  }, [fuente, busqueda, estados, fechas])

  const hayFiltrosActivos = busqueda.trim() !== "" || estados.size > 0 || fechas.size > 0

  function toggleEstado(valor: EstadoCurso) {
    setEstados((prev) => {
      const next = new Set(prev)
      next.has(valor) ? next.delete(valor) : next.add(valor)
      return next
    })
  }

  function toggleFecha(valor: "con" | "sin") {
    setFechas((prev) => {
      const next = new Set(prev)
      next.has(valor) ? next.delete(valor) : next.add(valor)
      return next
    })
  }

  function limpiarFiltros() {
    setBusqueda("")
    setEstados(new Set())
    setFechas(new Set())
  }

  return (
    <div className="space-y-6">
      {/* Encabezado de página + acción principal */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Archivo acad&eacute;mico
          </p>
          <h1 className="mt-1 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Cursos
          </h1>
          <p className="mt-1 text-pretty text-sm text-muted-foreground">
            Gesti&oacute;n de programas, fechas de cursada y certificaciones emitidas.
          </p>
        </div>
        <a
          href={NUEVO_CURSO_HREF}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-sm bg-ink px-4 text-sm font-medium text-ink-foreground shadow-sm transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Nuevo curso
        </a>
      </div>

      {/* Barra de búsqueda + filtros */}
      <section
        aria-label="Buscar y filtrar cursos"
        className="rounded-md border border-border bg-card p-4 shadow-sm sm:p-5"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          {/* Buscador */}
          <div className="w-full lg:max-w-sm">
            <label
              htmlFor="buscar-curso"
              className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
            >
              Filtrar por nombre o c&oacute;digo
            </label>
            <div className="relative flex items-center">
              <Search
                className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground"
                strokeWidth={1.75}
              />
              <input
                id="buscar-curso"
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Ej. Desarrollo Web&hellip;"
                className="h-10 w-full rounded-sm border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          {/* Grupos de filtros */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end lg:justify-end">
            <FiltroGrupo etiqueta="Estado">
              <ChipFiltro activo={estados.has("activo")} onClick={() => toggleEstado("activo")}>
                <span
                  className="h-1.5 w-1.5 rounded-full bg-valid"
                  aria-hidden="true"
                />
                Activos
              </ChipFiltro>
              <ChipFiltro
                activo={estados.has("inactivo")}
                onClick={() => toggleEstado("inactivo")}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                  aria-hidden="true"
                />
                Inactivos
              </ChipFiltro>
            </FiltroGrupo>

            <FiltroGrupo etiqueta="Fechas de cursada">
              <ChipFiltro activo={fechas.has("con")} onClick={() => toggleFecha("con")}>
                Con fechas
              </ChipFiltro>
              <ChipFiltro activo={fechas.has("sin")} onClick={() => toggleFecha("sin")}>
                Sin fechas
              </ChipFiltro>
            </FiltroGrupo>
          </div>
        </div>

        {/* Resumen de resultados / limpiar */}
        {vista === "datos" ? (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
            <p className="text-xs text-muted-foreground" aria-live="polite">
              <span className="font-mono font-medium text-foreground">
                {cursosFiltrados.length}
              </span>{" "}
              {cursosFiltrados.length === 1 ? "curso" : "cursos"}
              {hayFiltrosActivos ? " coinciden con el filtro" : " en el archivo"}
            </p>
            {hayFiltrosActivos ? (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium text-tech-blue transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
                Limpiar filtros
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* Demostración de estados (sólo herramienta interna de revisión) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Vista
        </span>
        {(
          [
            ["datos", "Con datos"],
            ["cargando", "Cargando"],
            ["error", "Error"],
            ["vacio-total", "Sin cursos"],
          ] as [Vista, string][]
        ).map(([valor, etiqueta]) => (
          <button
            key={valor}
            type="button"
            onClick={() => setVista(valor)}
            aria-pressed={vista === valor}
            className={`rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${
              vista === valor
                ? "border-ink bg-ink text-ink-foreground"
                : "border-border bg-card text-muted-foreground hover:border-ink/30 hover:text-foreground"
            }`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      {/* Contenido principal según estado */}
      {vista === "cargando" ? (
        <TablaCargando />
      ) : vista === "error" ? (
        <EstadoError onReintentar={() => setVista("datos")} />
      ) : cursosFiltrados.length === 0 ? (
        hayFiltrosActivos ? (
          <EstadoSinResultados onLimpiar={limpiarFiltros} />
        ) : (
          <EstadoVacio />
        )
      ) : (
        <>
          {/* Tabla — escritorio */}
          <div className="hidden overflow-hidden rounded-md border border-border bg-card shadow-sm md:block">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Listado de cursos del Instituto</caption>
              <thead>
                <tr className="border-b border-border bg-secondary/60">
                  <th scope="col" className="px-4 py-3">
                    <EncabezadoCol>Nombre del curso</EncabezadoCol>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <EncabezadoCol>Fechas</EncabezadoCol>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <EncabezadoCol>Alumnos presentes</EncabezadoCol>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <EncabezadoCol>Certificaciones</EncabezadoCol>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <EncabezadoCol>Estado</EncabezadoCol>
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    <EncabezadoCol className="justify-end">Acciones</EncabezadoCol>
                  </th>
                </tr>
              </thead>
              <tbody>
                {cursosFiltrados.map((curso) => {
                  const inactivo = curso.estado === "inactivo"
                  return (
                    <tr
                      key={curso.id}
                      className="group border-b border-border last:border-0 transition-colors hover:bg-accent/40"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 h-9 w-0.5 shrink-0 rounded-full ${
                              inactivo ? "bg-border" : "bg-circuit"
                            }`}
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <p
                              className={`font-medium leading-snug ${
                                inactivo ? "text-muted-foreground" : "text-foreground"
                              }`}
                            >
                              {curso.nombre}
                            </p>
                            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                              {curso.codigo} &middot; {curso.cuatrimestre}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Metrica valor={curso.fechas} unidad={curso.fechas === 1 ? "fecha" : "fechas"} atenuado={inactivo} />
                      </td>
                      <td className="px-4 py-3.5">
                        <Metrica
                          valor={curso.alumnosPresentes}
                          unidad="alumnos"
                          atenuado={inactivo}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <Metrica
                          valor={curso.certificaciones}
                          unidad="emitidas"
                          atenuado={inactivo}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <EstadoBadge estado={curso.estado} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <BotonAccion
                            href={`/admin/cursos/${curso.id}/asistencias`}
                            etiqueta={`Ver detalle de ${curso.nombre}`}
                            icon={Eye}
                          />
                          <BotonAccion
                            href={`/admin/cursos/${curso.id}/editar`}
                            etiqueta={`Editar ${curso.nombre}`}
                            icon={Pencil}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Tarjetas — mobile */}
          <ul className="space-y-3 md:hidden">
            {cursosFiltrados.map((curso) => {
              const inactivo = curso.estado === "inactivo"
              return (
                <li
                  key={curso.id}
                  className="overflow-hidden rounded-md border border-border bg-card shadow-sm"
                >
                  <div
                    className={`h-0.5 w-full ${inactivo ? "bg-border" : "bg-circuit"}`}
                    aria-hidden="true"
                  />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className={`text-pretty font-medium leading-snug ${
                            inactivo ? "text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {curso.nombre}
                        </p>
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                          {curso.codigo} &middot; {curso.cuatrimestre}
                        </p>
                      </div>
                      <EstadoBadge estado={curso.estado} />
                    </div>

                    <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
                      <DatoMovil icon={CalendarDays} etiqueta="Fechas" valor={curso.fechas} />
                      <DatoMovil
                        icon={Users}
                        etiqueta="Presentes"
                        valor={curso.alumnosPresentes}
                      />
                      <DatoMovil
                        icon={BadgeCheck}
                        etiqueta="Certif."
                        valor={curso.certificaciones}
                      />
                    </dl>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <a
                        href={`/admin/cursos/${curso.id}/asistencias`}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                      >
                        <Eye className="h-4 w-4" strokeWidth={1.75} />
                        Ver detalle
                      </a>
                      <a
                        href={`/admin/cursos/${curso.id}/editar`}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                      >
                        <Pencil className="h-4 w-4" strokeWidth={1.75} />
                        Editar
                      </a>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

/* ---------- Subcomponentes ---------- */

function FiltroGrupo({
  etiqueta,
  children,
}: {
  etiqueta: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {etiqueta}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function ChipFiltro({
  activo,
  onClick,
  children,
}: {
  activo: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`inline-flex h-9 items-center gap-2 rounded-sm border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${
        activo
          ? "border-ink bg-ink text-ink-foreground"
          : "border-input bg-background text-foreground hover:border-ink/40 hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  )
}

function EncabezadoCol({
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

function Metrica({
  valor,
  unidad,
  atenuado,
}: {
  valor: number
  unidad: string
  atenuado: boolean
}) {
  const cero = valor === 0
  return (
    <span className="flex items-baseline gap-1.5">
      <span
        className={`font-mono text-base font-semibold tabular-nums ${
          cero || atenuado ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        {valor}
      </span>
      <span className="text-xs text-muted-foreground">{unidad}</span>
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

function BotonAccion({
  href,
  etiqueta,
  icon: Icon,
}: {
  href: string
  etiqueta: string
  icon: typeof Eye
}) {
  return (
    <a
      href={href}
      aria-label={etiqueta}
      className="flex h-9 w-9 items-center justify-center rounded-sm border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </a>
  )
}

function DatoMovil({
  icon: Icon,
  etiqueta,
  valor,
}: {
  icon: typeof Eye
  etiqueta: string
  valor: number
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        {etiqueta}
      </dt>
      <dd className="mt-0.5 font-mono text-base font-semibold tabular-nums text-foreground">
        {valor}
      </dd>
    </div>
  )
}

/* ---------- Estados ---------- */

function TablaCargando() {
  return (
    <div
      className="overflow-hidden rounded-md border border-border bg-card shadow-sm"
      aria-busy="true"
      aria-label="Cargando cursos"
    >
      <div className="border-b border-border bg-secondary/60 px-4 py-3">
        <div className="h-3 w-40 rounded-sm bg-muted-foreground/20" />
      </div>
      <ul className="divide-y divide-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="flex items-center gap-4 px-4 py-4">
            <div className="h-9 w-0.5 rounded-full bg-muted-foreground/15" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-1/2 animate-pulse rounded-sm bg-muted-foreground/20" />
              <div className="h-2.5 w-1/3 animate-pulse rounded-sm bg-muted-foreground/10" />
            </div>
            <div className="hidden h-3 w-12 animate-pulse rounded-sm bg-muted-foreground/15 sm:block" />
            <div className="hidden h-3 w-12 animate-pulse rounded-sm bg-muted-foreground/15 sm:block" />
            <div className="h-6 w-16 animate-pulse rounded-sm bg-muted-foreground/15" />
          </li>
        ))}
      </ul>
    </div>
  )
}

function EstadoError({ onReintentar }: { onReintentar: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-md border border-destructive/30 bg-destructive-soft px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card text-destructive ring-1 ring-destructive/30">
        <AlertTriangle className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <h2 className="mt-4 text-base font-semibold text-foreground">
        No pudimos cargar los cursos
      </h2>
      <p className="mt-1 max-w-sm text-pretty text-sm text-muted-foreground">
        Hubo un problema de conexi&oacute;n con el archivo acad&eacute;mico. Revis&aacute; la red e
        intent&aacute; nuevamente.
      </p>
      <button
        type="button"
        onClick={onReintentar}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-sm border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <RotateCw className="h-4 w-4" strokeWidth={1.75} />
        Reintentar
      </button>
    </div>
  )
}

function EstadoSinResultados({ onLimpiar }: { onLimpiar: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-md border border-dashed border-border bg-card px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Search className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <h2 className="mt-4 text-base font-semibold text-foreground">
        Ning&uacute;n curso coincide
      </h2>
      <p className="mt-1 max-w-sm text-pretty text-sm text-muted-foreground">
        Prob&aacute; con otro nombre o ajust&aacute; los filtros de estado y fechas.
      </p>
      <button
        type="button"
        onClick={onLimpiar}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-sm border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <X className="h-4 w-4" strokeWidth={1.75} />
        Limpiar filtros
      </button>
    </div>
  )
}

function EstadoVacio() {
  return (
    <div className="flex flex-col items-center rounded-md border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-tech-blue ring-1 ring-circuit/30">
        <FolderOpen className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        Todav&iacute;a no hay cursos cargados
      </h2>
      <p className="mt-1 max-w-sm text-pretty text-sm text-muted-foreground">
        Cre&aacute; el primer curso para empezar a registrar fechas de cursada, asistencias y
        certificados.
      </p>
      <a
        href={NUEVO_CURSO_HREF}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-sm bg-ink px-4 text-sm font-medium text-ink-foreground shadow-sm transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
        Crear primer curso
      </a>
    </div>
  )
}
