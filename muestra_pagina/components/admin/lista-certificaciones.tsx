"use client"

import { useMemo, useState } from "react"
import {
  FilePlus2,
  Search,
  Eye,
  X,
  ShieldCheck,
  ShieldX,
  Clock3,
  Send,
  SendHorizontal,
  RotateCw,
  Inbox,
  AlertTriangle,
} from "lucide-react"

type Validez = "valida" | "revocada" | "pendiente"
type Envio = "entregado" | "pendiente-entrega" | "requiere-nueva-entrega"

type Certificacion = {
  id: string
  numero: string
  alumno: string
  dni: string
  curso: string
  emision: string // formato visible dd/mm/aaaa
  emisionISO: string // para orden / data
  validez: Validez
  envio: Envio
}

const CERTIFICACIONES: Certificacion[] = [
  {
    id: "ifts14-2024-001",
    numero: "IFTS14-2024-001",
    alumno: "Persona Ficticia 201",
    dni: "DNI-FICTICIO-201",
    curso: "Desarrollo de Sistemas Web II",
    emision: "15/10/2024",
    emisionISO: "2024-10-15",
    validez: "valida",
    envio: "entregado",
  },
  {
    id: "ifts14-2024-002",
    numero: "IFTS14-2024-002",
    alumno: "Persona Ficticia 202",
    dni: "DNI-FICTICIO-202",
    curso: "Bases de Datos Avanzadas",
    emision: "18/10/2024",
    emisionISO: "2024-10-18",
    validez: "valida",
    envio: "pendiente-entrega",
  },
  {
    id: "ifts14-2023-145",
    numero: "IFTS14-2023-145",
    alumno: "Persona Ficticia 203",
    dni: "DNI-FICTICIO-203",
    curso: "Ciberseguridad e Infraestructura",
    emision: "02/11/2023",
    emisionISO: "2023-11-02",
    validez: "revocada",
    envio: "entregado",
  },
  {
    id: "ifts14-2024-003",
    numero: "IFTS14-2024-003",
    alumno: "Persona Ficticia 204",
    dni: "DNI-FICTICIO-204",
    curso: "Desarrollo de Sistemas Web II",
    emision: "20/10/2024",
    emisionISO: "2024-10-20",
    validez: "pendiente",
    envio: "pendiente-entrega",
  },
  {
    id: "ifts14-2024-004",
    numero: "IFTS14-2024-004",
    alumno: "Persona Ficticia 205",
    dni: "DNI-FICTICIO-205",
    curso: "Bases de Datos Avanzadas",
    emision: "21/10/2024",
    emisionISO: "2024-10-21",
    validez: "valida",
    envio: "requiere-nueva-entrega",
  },
  {
    id: "ifts14-2024-005",
    numero: "IFTS14-2024-005",
    alumno: "Persona Ficticia 206",
    dni: "DNI-FICTICIO-206",
    curso: "Programaci\u00f3n Avanzada I",
    emision: "24/10/2024",
    emisionISO: "2024-10-24",
    validez: "valida",
    envio: "entregado",
  },
  {
    id: "ifts14-2024-006",
    numero: "IFTS14-2024-006",
    alumno: "Persona Ficticia 207",
    dni: "DNI-FICTICIO-207",
    curso: "Redes y Comunicaciones de Datos",
    emision: "25/10/2024",
    emisionISO: "2024-10-25",
    validez: "pendiente",
    envio: "pendiente-entrega",
  },
]

const VALIDEZ_META: Record<
  Validez,
  { etiqueta: string; clase: string; punto: string; icon: typeof ShieldCheck }
> = {
  valida: {
    etiqueta: "V\u00e1lida",
    clase: "border-valid/30 bg-valid-soft text-valid",
    punto: "bg-valid",
    icon: ShieldCheck,
  },
  revocada: {
    etiqueta: "Revocada",
    clase: "border-destructive/30 bg-destructive-soft text-destructive",
    punto: "bg-destructive",
    icon: ShieldX,
  },
  pendiente: {
    etiqueta: "Pendiente",
    clase: "border-border bg-secondary text-muted-foreground",
    punto: "bg-muted-foreground",
    icon: Clock3,
  },
}

const ENVIO_META: Record<
  Envio,
  { etiqueta: string; clase: string; icon: typeof Send }
> = {
  entregado: {
    etiqueta: "Entregado",
    clase: "text-valid",
    icon: Send,
  },
  "pendiente-entrega": {
    etiqueta: "Pendiente de entrega",
    clase: "text-muted-foreground",
    icon: SendHorizontal,
  },
  "requiere-nueva-entrega": {
    etiqueta: "Requiere nueva entrega",
    clase: "text-warning",
    icon: RotateCw,
  },
}

type Vista = "datos" | "cargando" | "error" | "vacio-total"

const NUEVA_CERTIFICACION_HREF = "/admin/certificaciones/nueva"
const PAGINA_TAMANO = 5

type FiltroValidez = Validez
type FiltroEnvio = Envio

export function ListaCertificaciones() {
  const [busqueda, setBusqueda] = useState("")
  const [validez, setValidez] = useState<Set<FiltroValidez>>(new Set())
  const [envios, setEnvios] = useState<Set<FiltroEnvio>>(new Set())
  const [vista, setVista] = useState<Vista>("datos")

  const fuente = vista === "vacio-total" ? [] : CERTIFICACIONES

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return fuente.filter((c) => {
      if (
        q &&
        !c.alumno.toLowerCase().includes(q) &&
        !c.dni.toLowerCase().includes(q) &&
        !c.curso.toLowerCase().includes(q) &&
        !c.numero.toLowerCase().includes(q)
      ) {
        return false
      }
      if (validez.size > 0 && !validez.has(c.validez)) return false
      if (envios.size > 0 && !envios.has(c.envio)) return false
      return true
    })
  }, [fuente, busqueda, validez, envios])

  const hayFiltros = busqueda.trim() !== "" || validez.size > 0 || envios.size > 0
  const visibles = filtradas.slice(0, PAGINA_TAMANO)

  function toggleValidez(valor: FiltroValidez) {
    setValidez((prev) => {
      const next = new Set(prev)
      next.has(valor) ? next.delete(valor) : next.add(valor)
      return next
    })
  }

  function toggleEnvio(valor: FiltroEnvio) {
    setEnvios((prev) => {
      const next = new Set(prev)
      next.has(valor) ? next.delete(valor) : next.add(valor)
      return next
    })
  }

  function limpiarFiltros() {
    setBusqueda("")
    setValidez(new Set())
    setEnvios(new Set())
  }

  return (
    <div className="space-y-6">
      {/* Encabezado + acción principal */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Archivo documental
          </p>
          <h1 className="mt-1 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Certificaciones
          </h1>
          <p className="mt-1 text-pretty text-sm text-muted-foreground">
            Emisi&oacute;n, validez y entrega de credenciales acad&eacute;micas del Instituto.
          </p>
        </div>
        <a
          href={NUEVA_CERTIFICACION_HREF}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-sm bg-ink px-4 text-sm font-medium text-ink-foreground shadow-sm transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <FilePlus2 className="h-4 w-4" strokeWidth={2} />
          Nueva certificaci&oacute;n
        </a>
      </div>

      {/* Búsqueda + filtros */}
      <section
        aria-label="Buscar y filtrar certificaciones"
        className="rounded-md border border-border bg-card p-4 shadow-sm sm:p-5"
      >
        <div className="w-full lg:max-w-md">
          <label
            htmlFor="buscar-certificacion"
            className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
          >
            Buscar registro
          </label>
          <div className="relative flex items-center">
            <Search
              className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground"
              strokeWidth={1.75}
            />
            <input
              id="buscar-certificacion"
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Alumno, DNI, curso o N.&deg; de certificado&hellip;"
              className="h-10 w-full rounded-sm border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
          <FiltroGrupo etiqueta="Estado de validez">
            <ChipFiltro activo={validez.has("valida")} onClick={() => toggleValidez("valida")}>
              <span className="h-1.5 w-1.5 rounded-full bg-valid" aria-hidden="true" />
              V&aacute;lidas
            </ChipFiltro>
            <ChipFiltro activo={validez.has("revocada")} onClick={() => toggleValidez("revocada")}>
              <span className="h-1.5 w-1.5 rounded-full bg-destructive" aria-hidden="true" />
              Revocadas
            </ChipFiltro>
            <ChipFiltro
              activo={validez.has("pendiente")}
              onClick={() => toggleValidez("pendiente")}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" aria-hidden="true" />
              Pendientes
            </ChipFiltro>
          </FiltroGrupo>

          <FiltroGrupo etiqueta="Estado de entrega">
            <ChipFiltro activo={envios.has("entregado")} onClick={() => toggleEnvio("entregado")}>
              Entregadas
            </ChipFiltro>
            <ChipFiltro
              activo={envios.has("pendiente-entrega")}
              onClick={() => toggleEnvio("pendiente-entrega")}
            >
              Pendientes de entrega
            </ChipFiltro>
            <ChipFiltro
              activo={envios.has("requiere-nueva-entrega")}
              onClick={() => toggleEnvio("requiere-nueva-entrega")}
            >
              Requieren nueva entrega
            </ChipFiltro>
          </FiltroGrupo>
        </div>

        {vista === "datos" ? (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
            <p className="text-xs text-muted-foreground" aria-live="polite">
              <span className="font-mono font-medium text-foreground">{filtradas.length}</span>{" "}
              {filtradas.length === 1 ? "certificaci\u00f3n" : "certificaciones"}
              {hayFiltros ? " coinciden con el filtro" : " en el archivo"}
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
      ) : filtradas.length === 0 ? (
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
              <caption className="sr-only">
                Listado de certificaciones emitidas por el Instituto
              </caption>
              <thead>
                <tr className="border-b border-border bg-secondary/60">
                  <th scope="col" className="px-4 py-3">
                    <EncabezadoCol>N.&deg; certificado</EncabezadoCol>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <EncabezadoCol>Alumno / DNI</EncabezadoCol>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <EncabezadoCol>Curso</EncabezadoCol>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <EncabezadoCol>Emisi&oacute;n</EncabezadoCol>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <EncabezadoCol>Validez</EncabezadoCol>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <EncabezadoCol>Entrega</EncabezadoCol>
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    <EncabezadoCol className="justify-end">Acci&oacute;n</EncabezadoCol>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((cert) => {
                  const revocada = cert.validez === "revocada"
                  return (
                    <tr
                      key={cert.id}
                      className="group border-b border-border last:border-0 transition-colors hover:bg-accent/40"
                    >
                      <td className="px-4 py-3.5 align-top">
                        <span
                          className={`font-mono text-[13px] font-medium tabular-nums ${
                            revocada ? "text-muted-foreground line-through" : "text-foreground"
                          }`}
                        >
                          {cert.numero}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <p
                          className={`font-medium leading-snug ${
                            revocada ? "text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {cert.alumno}
                        </p>
                        <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
                          DNI {cert.dni}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <span className="text-pretty text-foreground">{cert.curso}</span>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <span className="font-mono text-[13px] tabular-nums text-muted-foreground">
                          {cert.emision}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <ValidezBadge validez={cert.validez} />
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <EnvioEstado envio={cert.envio} />
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <div className="flex items-center justify-end">
                          <BotonAccion
                            href={`/admin/certificaciones/${cert.id}`}
                            etiqueta={`Ver detalle del certificado ${cert.numero}`}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="flex flex-col gap-3 border-t border-border bg-secondary/30 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>
                Mostrando{" "}
                <span className="font-mono font-medium text-foreground">{visibles.length}</span> de{" "}
                <span className="font-mono font-medium text-foreground">{filtradas.length}</span>{" "}
                registros
              </p>
              <Paginacion />
            </div>
          </div>

          {/* Tarjetas — mobile / tablet */}
          <ul className="space-y-3 lg:hidden">
            {visibles.map((cert) => {
              const revocada = cert.validez === "revocada"
              return (
                <li
                  key={cert.id}
                  className="overflow-hidden rounded-md border border-border bg-card shadow-sm"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`font-mono text-[13px] font-medium tabular-nums ${
                          revocada ? "text-muted-foreground line-through" : "text-foreground"
                        }`}
                      >
                        {cert.numero}
                      </span>
                      <ValidezBadge validez={cert.validez} />
                    </div>

                    <div className="mt-3 border-t border-border pt-3">
                      <p
                        className={`text-pretty font-medium leading-snug ${
                          revocada ? "text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {cert.alumno}
                      </p>
                      <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
                        DNI {cert.dni}
                      </p>
                      <p className="mt-2 text-sm text-pretty text-foreground">{cert.curso}</p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                          Emisi&oacute;n {cert.emision}
                        </span>
                        <EnvioEstado envio={cert.envio} />
                      </div>
                      <a
                        href={`/admin/certificaciones/${cert.id}`}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                      >
                        <Eye className="h-4 w-4" strokeWidth={1.75} />
                        Ver detalle
                      </a>
                    </div>
                  </div>
                </li>
              )
            })}

            <li className="flex flex-col gap-3 rounded-md border border-border bg-card px-4 py-3 text-xs text-muted-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p>
                Mostrando{" "}
                <span className="font-mono font-medium text-foreground">{visibles.length}</span> de{" "}
                <span className="font-mono font-medium text-foreground">{filtradas.length}</span>{" "}
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

function ValidezBadge({ validez }: { validez: Validez }) {
  const meta = VALIDEZ_META[validez]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide ${meta.clase}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.punto}`} aria-hidden="true" />
      {meta.etiqueta}
    </span>
  )
}

function EnvioEstado({ envio }: { envio: Envio }) {
  const meta = ENVIO_META[envio]
  const Icon = meta.icon
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${meta.clase}`}>
      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
      {meta.etiqueta}
    </span>
  )
}

function BotonAccion({ href, etiqueta }: { href: string; etiqueta: string }) {
  return (
    <a
      href={href}
      aria-label={etiqueta}
      className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <Eye className="h-4 w-4" strokeWidth={1.75} />
    </a>
  )
}

function Paginacion() {
  // Marcado estático de paginación: el componente Angular conectará el estado real.
  const paginas = [1, 2, 3]
  return (
    <nav aria-label="Paginación de certificaciones" className="flex items-center gap-1">
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
          Cargando archivo&hellip;
        </span>
      </div>
      <ul className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex items-center gap-4 px-4 py-4">
            <div className="h-3 w-28 animate-pulse rounded-sm bg-secondary" />
            <div className="h-3 w-40 flex-1 animate-pulse rounded-sm bg-secondary" />
            <div className="h-5 w-20 animate-pulse rounded-sm bg-secondary" />
            <div className="h-8 w-8 animate-pulse rounded-sm bg-secondary" />
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
        No pudimos cargar el archivo
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Hubo un problema al sincronizar con el nodo de certificaciones. Revis&aacute; la conexi&oacute;n e intent&aacute; de nuevo.
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
        Ninguna certificaci&oacute;n coincide con la b&uacute;squeda o los filtros aplicados.
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
        <Inbox className="h-7 w-7" strokeWidth={1.5} />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        Todav&iacute;a no hay certificaciones
      </h2>
      <p className="mt-1 max-w-sm text-pretty text-sm text-muted-foreground">
        Cuando emitas la primera credencial acad&eacute;mica, va a quedar registrada en este archivo con su estado de validez y entrega.
      </p>
      <a
        href={NUEVA_CERTIFICACION_HREF}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-sm bg-ink px-4 text-sm font-medium text-ink-foreground shadow-sm transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <FilePlus2 className="h-4 w-4" strokeWidth={2} />
        Emitir primera certificaci&oacute;n
      </a>
    </div>
  )
}
