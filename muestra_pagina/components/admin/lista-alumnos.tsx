"use client"

import { useMemo, useState } from "react"
import {
  UserPlus,
  Search,
  Eye,
  X,
  BookOpen,
  ShieldCheck,
  MailWarning,
  Users,
  AlertTriangle,
  RotateCw,
} from "lucide-react"

type Alumno = {
  id: string
  legajo: string
  apellido: string
  nombre: string
  dni: string
  email: string | null
  cursosConAsistencia: number
  certificacionesValidas: number
}

const ALUMNOS: Alumno[] = [
  {
    id: "leg-23910",
    legajo: "LEG-23910",
    apellido: "Ficticia",
    nombre: "Persona 001",
    dni: "DNI-FICTICIO-001",
    email: "persona.ficticia001@example.invalid",
    cursosConAsistencia: 4,
    certificacionesValidas: 2,
  },
  {
    id: "leg-23911",
    legajo: "LEG-23911",
    apellido: "Ficticia",
    nombre: "Persona 002",
    dni: "DNI-FICTICIO-002",
    email: "persona.ficticia002@example.invalid",
    cursosConAsistencia: 1,
    certificacionesValidas: 0,
  },
  {
    id: "leg-23912",
    legajo: "LEG-23912",
    apellido: "Ficticia",
    nombre: "Persona 003",
    dni: "DNI-FICTICIO-003",
    email: "persona.ficticia003@example.invalid",
    cursosConAsistencia: 6,
    certificacionesValidas: 3,
  },
  {
    id: "leg-23913",
    legajo: "LEG-23913",
    apellido: "Ficticia",
    nombre: "Persona 004",
    dni: "DNI-FICTICIO-004",
    email: null,
    cursosConAsistencia: 3,
    certificacionesValidas: 1,
  },
  {
    id: "leg-23914",
    legajo: "LEG-23914",
    apellido: "Ficticia",
    nombre: "Persona 005",
    dni: "DNI-FICTICIO-005",
    email: "persona.ficticia005@example.invalid",
    cursosConAsistencia: 2,
    certificacionesValidas: 0,
  },
  {
    id: "leg-23915",
    legajo: "LEG-23915",
    apellido: "Ficticia",
    nombre: "Persona 006",
    dni: "DNI-FICTICIO-006",
    email: null,
    cursosConAsistencia: 5,
    certificacionesValidas: 2,
  },
]

type Filtro = "con-cert" | "sin-cert" | "sin-email"
type Vista = "datos" | "cargando" | "error" | "vacio-total"

const NUEVO_ALUMNO_HREF = "/admin/alumnos/nuevo"
const PAGINA_TAMANO = 5

export function ListaAlumnos() {
  const [busqueda, setBusqueda] = useState("")
  const [filtros, setFiltros] = useState<Set<Filtro>>(new Set())
  const [vista, setVista] = useState<Vista>("datos")

  const fuente = vista === "vacio-total" ? [] : ALUMNOS

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return fuente.filter((a) => {
      if (
        q &&
        !a.nombre.toLowerCase().includes(q) &&
        !a.apellido.toLowerCase().includes(q) &&
        !`${a.apellido} ${a.nombre}`.toLowerCase().includes(q) &&
        !`${a.nombre} ${a.apellido}`.toLowerCase().includes(q) &&
        !a.dni.toLowerCase().includes(q) &&
        !a.legajo.toLowerCase().includes(q)
      ) {
        return false
      }
      if (filtros.has("con-cert") && a.certificacionesValidas === 0) return false
      if (filtros.has("sin-cert") && a.certificacionesValidas > 0) return false
      if (filtros.has("sin-email") && a.email) return false
      return true
    })
  }, [fuente, busqueda, filtros])

  const hayFiltros = busqueda.trim() !== "" || filtros.size > 0
  const visibles = filtrados.slice(0, PAGINA_TAMANO)

  function toggleFiltro(valor: Filtro) {
    setFiltros((prev) => {
      const next = new Set(prev)
      // "con" y "sin" certificaciones son mutuamente excluyentes
      if (valor === "con-cert" && !next.has("con-cert")) next.delete("sin-cert")
      if (valor === "sin-cert" && !next.has("sin-cert")) next.delete("con-cert")
      next.has(valor) ? next.delete(valor) : next.add(valor)
      return next
    })
  }

  function limpiarFiltros() {
    setBusqueda("")
    setFiltros(new Set())
  }

  return (
    <div className="space-y-6">
      {/* Encabezado + acción principal */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Registro acad&eacute;mico
          </p>
          <h1 className="mt-1 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Alumnos
          </h1>
          <p className="mt-1 text-pretty text-sm text-muted-foreground">
            Legajos de estudiantes con su trayectoria de cursada y credenciales v&aacute;lidas.
          </p>
        </div>
        <a
          href={NUEVO_ALUMNO_HREF}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-sm bg-ink px-4 text-sm font-medium text-ink-foreground shadow-sm transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <UserPlus className="h-4 w-4" strokeWidth={2} />
          Nuevo alumno
        </a>
      </div>

      {/* Búsqueda + filtros */}
      <section
        aria-label="Buscar y filtrar alumnos"
        className="rounded-md border border-border bg-card p-4 shadow-sm sm:p-5"
      >
        <div className="w-full lg:max-w-md">
          <label
            htmlFor="buscar-alumno"
            className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
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
              placeholder="Nombre, apellido, DNI o legajo&hellip;"
              autoComplete="off"
              className="h-10 w-full rounded-sm border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Escrib&iacute; para filtrar el registro al instante.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Filtros r&aacute;pidos
          </p>
          <div className="flex flex-wrap gap-1.5">
            <ChipFiltro activo={filtros.has("con-cert")} onClick={() => toggleFiltro("con-cert")}>
              <span className="h-1.5 w-1.5 rounded-full bg-valid" aria-hidden="true" />
              Con certificaciones
            </ChipFiltro>
            <ChipFiltro activo={filtros.has("sin-cert")} onClick={() => toggleFiltro("sin-cert")}>
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" aria-hidden="true" />
              Sin certificaciones
            </ChipFiltro>
            <ChipFiltro activo={filtros.has("sin-email")} onClick={() => toggleFiltro("sin-email")}>
              <MailWarning className="h-3.5 w-3.5 text-warning" strokeWidth={2} aria-hidden="true" />
              Sin email
            </ChipFiltro>
          </div>
        </div>

        {vista === "datos" ? (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
            <p className="text-xs text-muted-foreground" aria-live="polite">
              <span className="font-mono font-medium text-foreground">{filtrados.length}</span>{" "}
              {filtrados.length === 1 ? "alumno" : "alumnos"}
              {hayFiltros ? " coinciden con el filtro" : " en el registro"}
            </p>
            {hayFiltros ? (
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

      {/* Conmutador de estados para revisión */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Vista
        </span>
        {(
          [
            ["datos", "Con datos"],
            ["cargando", "Cargando"],
            ["error", "Error"],
            ["vacio-total", "Sin registros"],
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

      {/* Contenido principal */}
      {vista === "cargando" ? (
        <TablaCargando />
      ) : vista === "error" ? (
        <EstadoError onReintentar={() => setVista("datos")} />
      ) : filtrados.length === 0 ? (
        hayFiltros ? (
          <EstadoSinResultados onLimpiar={limpiarFiltros} />
        ) : (
          <EstadoVacio />
        )
      ) : (
        <>
          {/* Tabla — escritorio */}
          <div className="hidden overflow-hidden rounded-md border border-border bg-card shadow-sm lg:block">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Registro de alumnos del Instituto</caption>
              <thead>
                <tr className="border-b border-border bg-secondary/60">
                  <th scope="col" className="px-4 py-3">
                    <EncabezadoCol>Alumno / Legajo</EncabezadoCol>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <EncabezadoCol>DNI</EncabezadoCol>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <EncabezadoCol>Email</EncabezadoCol>
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                    <EncabezadoCol className="justify-center">Cursos c/ asist.</EncabezadoCol>
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                    <EncabezadoCol className="justify-center">Cert. v&aacute;lidas</EncabezadoCol>
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    <EncabezadoCol className="justify-end">Acci&oacute;n</EncabezadoCol>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((al) => (
                  <tr
                    key={al.id}
                    className="group border-b border-border last:border-0 transition-colors hover:bg-accent/40"
                  >
                    <td className="px-4 py-3.5 align-top">
                      <p className="font-medium leading-snug text-foreground">
                        {al.apellido}, {al.nombre}
                      </p>
                      <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
                        {al.legajo}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <span className="font-mono text-[13px] tabular-nums text-foreground">
                        {al.dni}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      {al.email ? (
                        <span className="break-all text-[13px] text-muted-foreground">
                          {al.email}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-sm border border-warning/40 bg-warning-soft px-2 py-0.5 text-xs font-medium text-foreground">
                          <MailWarning className="h-3.5 w-3.5 text-warning" strokeWidth={2} aria-hidden="true" />
                          Sin email
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center align-top">
                      <ConteoCursos valor={al.cursosConAsistencia} />
                    </td>
                    <td className="px-4 py-3.5 text-center align-top">
                      <ConteoCertificaciones valor={al.certificacionesValidas} />
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex items-center justify-end">
                        <a
                          href={`/admin/alumnos/${al.id}`}
                          aria-label={`Ver detalle de ${al.apellido}, ${al.nombre}`}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-transparent px-2.5 text-sm font-medium text-tech-blue transition-colors hover:border-border hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                        >
                          <Eye className="h-4 w-4" strokeWidth={1.75} />
                          Ver detalle
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex flex-col gap-3 border-t border-border bg-secondary/30 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>
                Mostrando{" "}
                <span className="font-mono font-medium text-foreground">{visibles.length}</span> de{" "}
                <span className="font-mono font-medium text-foreground">{filtrados.length}</span>{" "}
                registros
              </p>
              <Paginacion />
            </div>
          </div>

          {/* Tarjetas — mobile / tablet */}
          <ul className="space-y-3 lg:hidden">
            {visibles.map((al) => (
              <li
                key={al.id}
                className="overflow-hidden rounded-md border border-border bg-card shadow-sm"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-pretty font-medium leading-snug text-foreground">
                        {al.apellido}, {al.nombre}
                      </p>
                      <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
                        {al.legajo} &middot; DNI {al.dni}
                      </p>
                    </div>
                    <a
                      href={`/admin/alumnos/${al.id}`}
                      aria-label={`Ver detalle de ${al.apellido}, ${al.nombre}`}
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-sm border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      <Eye className="h-4 w-4" strokeWidth={1.75} />
                      Ver
                    </a>
                  </div>

                  <div className="mt-3 border-t border-border pt-3">
                    {al.email ? (
                      <p className="break-all text-sm text-muted-foreground">{al.email}</p>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-sm border border-warning/40 bg-warning-soft px-2 py-0.5 text-xs font-medium text-foreground">
                        <MailWarning className="h-3.5 w-3.5 text-warning" strokeWidth={2} aria-hidden="true" />
                        Sin email registrado
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {al.cursosConAsistencia}
                      </span>
                      cursos c/ asistencia
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ShieldCheck
                        className={`h-3.5 w-3.5 ${al.certificacionesValidas > 0 ? "text-valid" : "text-muted-foreground"}`}
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                      <span
                        className={`font-mono font-medium tabular-nums ${al.certificacionesValidas > 0 ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {al.certificacionesValidas}
                      </span>
                      cert. v&aacute;lidas
                    </span>
                  </div>
                </div>
              </li>
            ))}

            <li className="flex flex-col gap-3 rounded-md border border-border bg-card px-4 py-3 text-xs text-muted-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p>
                Mostrando{" "}
                <span className="font-mono font-medium text-foreground">{visibles.length}</span> de{" "}
                <span className="font-mono font-medium text-foreground">{filtrados.length}</span>{" "}
                registros
              </p>
              <Paginacion />
            </li>
          </ul>
        </>
      )}
    </div>
  )
}

/* ---------- Subcomponentes ---------- */

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

function ConteoCursos({ valor }: { valor: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
      <BookOpen className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
      <span className="font-mono font-medium tabular-nums">{valor}</span>
    </span>
  )
}

function ConteoCertificaciones({ valor }: { valor: number }) {
  const activo = valor > 0
  return (
    <span
      className={`inline-flex min-w-9 items-center justify-center gap-1.5 rounded-sm border px-2 py-0.5 text-sm font-medium ${
        activo
          ? "border-valid/30 bg-valid-soft text-valid"
          : "border-border bg-secondary text-muted-foreground"
      }`}
    >
      <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
      <span className="font-mono tabular-nums">{valor}</span>
    </span>
  )
}

function Paginacion() {
  // Marcado estático de paginación: el componente Angular conectará el estado real.
  const paginas = [1, 2, 3]
  return (
    <nav aria-label="Paginación de alumnos" className="flex items-center gap-1">
      <button
        type="button"
        disabled
        aria-label="Página anterior"
        className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-background text-muted-foreground disabled:opacity-40"
      >
        &lsaquo;
      </button>
      {paginas.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === 1 ? "page" : undefined}
          className={`inline-flex h-8 min-w-8 items-center justify-center rounded-sm border px-2 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${
            p === 1
              ? "border-ink bg-ink text-ink-foreground"
              : "border-border bg-background text-foreground hover:bg-secondary"
          }`}
        >
          {p}
        </button>
      ))}
      <span className="px-1 text-muted-foreground">&hellip;</span>
      <button
        type="button"
        aria-label="Página siguiente"
        className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-background text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        &rsaquo;
      </button>
    </nav>
  )
}

function TablaCargando() {
  return (
    <div
      className="overflow-hidden rounded-md border border-border bg-card shadow-sm"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="border-b border-border bg-secondary/60 px-4 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          Cargando registro&hellip;
        </span>
      </div>
      <ul className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex items-center gap-4 px-4 py-4">
            <div className="h-3 w-40 flex-1 animate-pulse rounded-sm bg-secondary" />
            <div className="h-3 w-24 animate-pulse rounded-sm bg-secondary" />
            <div className="h-5 w-10 animate-pulse rounded-sm bg-secondary" />
            <div className="h-8 w-20 animate-pulse rounded-sm bg-secondary" />
          </li>
        ))}
      </ul>
    </div>
  )
}

function EstadoError({ onReintentar }: { onReintentar: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-destructive/30 bg-destructive-soft px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-card text-destructive shadow-sm">
        <AlertTriangle className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <h2 className="mt-4 text-base font-semibold text-foreground">
        No pudimos cargar el registro
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Hubo un problema al sincronizar el listado de alumnos. Revis&aacute; la conexi&oacute;n e intent&aacute; de nuevo.
      </p>
      <button
        type="button"
        onClick={onReintentar}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-sm bg-ink px-4 text-sm font-medium text-ink-foreground shadow-sm transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <RotateCw className="h-4 w-4" strokeWidth={2} />
        Reintentar
      </button>
    </div>
  )
}

function EstadoSinResultados({ onLimpiar }: { onLimpiar: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-border bg-card px-6 py-12 text-center shadow-sm">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Search className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <h2 className="mt-4 text-base font-semibold text-foreground">Sin coincidencias</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Ning&uacute;n alumno coincide con la b&uacute;squeda o los filtros aplicados.
      </p>
      <button
        type="button"
        onClick={onLimpiar}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-sm border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <X className="h-4 w-4" strokeWidth={2} />
        Limpiar filtros
      </button>
    </div>
  )
}

function EstadoVacio() {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-card px-6 py-14 text-center shadow-sm">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Users className="h-7 w-7" strokeWidth={1.5} />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        Todav&iacute;a no hay alumnos cargados
      </h2>
      <p className="mt-1 max-w-sm text-pretty text-sm text-muted-foreground">
        Cuando registres el primer alumno, su legajo va a aparecer ac&aacute; junto a su trayectoria de cursada y sus certificaciones v&aacute;lidas.
      </p>
      <a
        href={NUEVO_ALUMNO_HREF}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-sm bg-ink px-4 text-sm font-medium text-ink-foreground shadow-sm transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <UserPlus className="h-4 w-4" strokeWidth={2} />
        Registrar primer alumno
      </a>
    </div>
  )
}
