"use client"

import {
  ArrowLeft,
  Pencil,
  Plus,
  Send,
  ClipboardList,
  IdCard,
  Mail,
  MailWarning,
  CalendarDays,
  BookOpen,
  ShieldCheck,
  ShieldX,
  CheckCircle2,
  CircleDashed,
  CircleDot,
  ChevronRight,
} from "lucide-react"

type EstadoCert = "emitida" | "pendiente" | "en-curso"

type CursoPresente = {
  id: string
  nombre: string
  codigo: string
  /** fechas con asistencia presente, en ISO */
  presentes: string[]
  estadoCert: EstadoCert
  /** id de la certificación emitida, si corresponde */
  certificacionId: string | null
}

type Alumno = {
  id: string
  legajo: string
  nombre: string
  apellido: string
  dni: string
  email: string | null
  ingreso: string
  cursosConAsistencia: number
  certificacionesValidas: number
  certificacionesRevocadas: number
  cursos: CursoPresente[]
}

// Datos de muestra. En el port a Angular se reemplaza por el resolver de la ruta /admin/alumnos/:id.
const ALUMNO: Alumno = {
  id: "leg-23910",
  legajo: "LEG-23910",
  nombre: "Persona 001",
  apellido: "Ficticia",
  dni: "DNI-FICTICIO-001",
  email: "persona.ficticia001@example.invalid",
  ingreso: "2021",
  cursosConAsistencia: 4,
  certificacionesValidas: 2,
  certificacionesRevocadas: 0,
  cursos: [
    {
      id: "cur-desarrollo-web-ii",
      nombre: "Desarrollo de Sistemas Web II",
      codigo: "CUR-2025-014",
      presentes: ["2025-10-12", "2025-10-19"],
      estadoCert: "emitida",
      certificacionId: "IFTS14-2025-041",
    },
    {
      id: "cur-bases-datos-avanzada",
      nombre: "Base de Datos Avanzada",
      codigo: "CUR-2025-021",
      presentes: ["2025-10-05", "2025-10-26"],
      estadoCert: "emitida",
      certificacionId: "IFTS14-2025-058",
    },
    {
      id: "cur-ingenieria-software",
      nombre: "Ingenier\u00eda de Software",
      codigo: "CUR-2025-030",
      presentes: ["2025-11-02", "2025-11-09"],
      estadoCert: "pendiente",
      certificacionId: null,
    },
    {
      id: "cur-seguridad-informatica",
      nombre: "Seguridad Inform\u00e1tica",
      codigo: "CUR-2025-033",
      presentes: ["2025-11-11"],
      estadoCert: "en-curso",
      certificacionId: null,
    },
  ],
}

const ALUMNOS_HREF = "/admin/alumnos"

const fmtCorta = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit" })

function parseISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function fechasCortas(isos: string[]) {
  return isos.map((iso) => fmtCorta.format(parseISO(iso))).join(", ")
}

export function AlumnoDetalle() {
  const a = ALUMNO
  const nombreCompleto = `${a.nombre} ${a.apellido}`

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-sm">
        <a
          href={ALUMNOS_HREF}
          className="inline-flex items-center gap-1.5 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Alumnos
        </a>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
        <span className="font-medium text-foreground">Legajo</span>
      </nav>

      {/* Ficha del alumno */}
      <article className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
        <div className="flex">
          <div className="w-1 shrink-0 bg-circuit" aria-hidden="true" />
          <div className="min-w-0 flex-1 p-5 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              {/* Identidad */}
              <div className="min-w-0">
                <span className="inline-flex items-center rounded-sm border border-border bg-secondary px-2 py-0.5 font-mono text-xs font-medium tracking-tight text-secondary-foreground">
                  {a.legajo}
                </span>
                <h1 className="mt-3 text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                  {nombreCompleto}
                </h1>

                {/* Datos personales */}
                <dl className="mt-4 flex flex-col gap-x-8 gap-y-2.5 sm:flex-row sm:flex-wrap sm:items-center">
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">DNI</dt>
                    <IdCard className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
                    <dd className="text-sm text-foreground">
                      <span className="text-muted-foreground">DNI</span>{" "}
                      <span className="font-mono tabular-nums">{a.dni}</span>
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">Email</dt>
                    {a.email ? (
                      <>
                        <Mail className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
                        <dd className="break-all text-sm text-foreground">{a.email}</dd>
                      </>
                    ) : (
                      <dd className="inline-flex items-center gap-1.5 rounded-sm border border-warning/40 bg-warning-soft px-2 py-0.5 text-xs font-medium text-foreground">
                        <MailWarning className="h-3.5 w-3.5 text-warning" strokeWidth={2} aria-hidden="true" />
                        Sin email registrado
                      </dd>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">Ingreso</dt>
                    <CalendarDays className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
                    <dd className="text-sm text-foreground">
                      <span className="text-muted-foreground">Ingreso</span>{" "}
                      <span className="font-mono tabular-nums">{a.ingreso}</span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Acciones */}
              <div className="flex flex-col gap-2 min-[420px]:flex-row min-[420px]:flex-wrap lg:shrink-0 lg:flex-col lg:items-stretch xl:flex-row">
                <a
                  href={`/admin/alumnos/${a.id}/certificaciones/nueva`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-tech-blue px-4 text-sm font-medium text-ink-foreground shadow-sm transition-colors hover:bg-tech-blue/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  Nueva certificaci&oacute;n
                </a>
                <a
                  href={`/admin/alumnos/${a.id}/entregar-certificado`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  <Send className="h-4 w-4" strokeWidth={1.75} />
                  Compartir por canal externo
                </a>
                <a
                  href={`/admin/alumnos/${a.id}/asistencias`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  <ClipboardList className="h-4 w-4" strokeWidth={1.75} />
                  Ver asistencias
                </a>
                <a
                  href={`/admin/alumnos/${a.id}/editar`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  <Pencil className="h-4 w-4" strokeWidth={1.75} />
                  Editar datos
                </a>
              </div>
            </div>

            {/* Resumen */}
            <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-3">
              <ResumenItem
                icono={<BookOpen className="h-4 w-4" strokeWidth={1.75} />}
                etiqueta="Cursos con asistencia"
                valor={a.cursosConAsistencia}
                sufijo="registrados"
              />
              <ResumenItem
                icono={<ShieldCheck className="h-4 w-4 text-valid" strokeWidth={1.75} />}
                etiqueta="Certificaciones v&aacute;lidas"
                valor={a.certificacionesValidas}
                sufijo="emitidas"
                acento={a.certificacionesValidas > 0 ? "valid" : "neutro"}
              />
              <ResumenItem
                icono={
                  <ShieldX
                    className={`h-4 w-4 ${a.certificacionesRevocadas > 0 ? "text-destructive" : "text-muted-foreground"}`}
                    strokeWidth={1.75}
                  />
                }
                etiqueta="Certificaciones revocadas"
                valor={a.certificacionesRevocadas}
                sufijo="incidencias"
                acento={a.certificacionesRevocadas > 0 ? "destructive" : "neutro"}
              />
            </div>
          </div>
        </div>
      </article>

      {/* Cursos con asistencias presentes */}
      <section
        aria-labelledby="cursos-titulo"
        className="overflow-hidden rounded-md border border-border bg-card shadow-sm"
      >
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <h2 id="cursos-titulo" className="text-lg font-semibold tracking-tight text-foreground">
            Cursos con asistencias presentes
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Cursada con presente registrado y estado de la credencial correspondiente.
          </p>
        </div>

        {a.cursos.length === 0 ? (
          <EstadoVacio alumnoId={a.id} />
        ) : (
          <>
            {/* Tabla — escritorio */}
            <div className="hidden lg:block">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">Cursos con asistencias presentes de {nombreCompleto}</caption>
                <thead>
                  <tr className="border-b border-border bg-secondary/60">
                    <th scope="col" className="px-5 py-3 sm:px-6">
                      <EncabezadoCol>Nombre del curso</EncabezadoCol>
                    </th>
                    <th scope="col" className="px-4 py-3">
                      <EncabezadoCol>Fechas presentes</EncabezadoCol>
                    </th>
                    <th scope="col" className="px-4 py-3">
                      <EncabezadoCol>Estado de certificaci&oacute;n</EncabezadoCol>
                    </th>
                    <th scope="col" className="px-5 py-3 text-right sm:px-6">
                      <EncabezadoCol className="justify-end">Acci&oacute;n</EncabezadoCol>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {a.cursos.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-border last:border-0 transition-colors hover:bg-accent/40"
                    >
                      <td className="px-5 py-4 align-top sm:px-6">
                        <p className="font-medium leading-snug text-foreground">{c.nombre}</p>
                        <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
                          {c.codigo}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                          <CheckCircle2 className="h-4 w-4 text-valid" strokeWidth={2} aria-hidden="true" />
                          <span className="font-mono tabular-nums">{fechasCortas(c.presentes)}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <EstadoCertBadge estado={c.estadoCert} />
                      </td>
                      <td className="px-5 py-4 text-right align-top sm:px-6">
                        <AccionCert alumnoId={a.id} curso={c} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tarjetas — mobile / tablet */}
            <ul className="divide-y divide-border lg:hidden">
              {a.cursos.map((c) => (
                <li key={c.id} className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-pretty font-medium leading-snug text-foreground">{c.nombre}</p>
                      <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
                        {c.codigo}
                      </p>
                    </div>
                    <EstadoCertBadge estado={c.estadoCert} />
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-valid" strokeWidth={2} aria-hidden="true" />
                    <span className="text-muted-foreground">Presentes:</span>
                    <span className="font-mono tabular-nums">{fechasCortas(c.presentes)}</span>
                  </div>

                  <div className="mt-3">
                    <AccionCert alumnoId={a.id} curso={c} bloque />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  )
}

/* ---------- Subcomponentes ---------- */

function ResumenItem({
  icono,
  etiqueta,
  valor,
  sufijo,
  acento = "neutro",
}: {
  icono: React.ReactNode
  etiqueta: string
  valor: number
  sufijo: string
  acento?: "neutro" | "valid" | "destructive"
}) {
  return (
    <div className="bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icono}
        <span
          className="font-mono text-[11px] font-medium uppercase tracking-[0.12em]"
          dangerouslySetInnerHTML={{ __html: etiqueta }}
        />
      </div>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span
          className={`font-mono text-2xl font-semibold tabular-nums ${
            acento === "valid"
              ? "text-valid"
              : acento === "destructive"
                ? "text-destructive"
                : "text-foreground"
          }`}
        >
          {valor}
        </span>
        <span className="text-sm text-muted-foreground">{sufijo}</span>
      </p>
    </div>
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

function EstadoCertBadge({ estado }: { estado: EstadoCert }) {
  if (estado === "emitida") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm border border-valid/30 bg-valid-soft px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide text-valid">
        <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden="true" />
        Emitida
      </span>
    )
  }
  if (estado === "pendiente") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm border border-warning/40 bg-warning-soft px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide text-foreground">
        <CircleDashed className="h-3.5 w-3.5 text-warning" strokeWidth={2.25} aria-hidden="true" />
        Pendiente
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-secondary px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      <CircleDot className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
      En curso
    </span>
  )
}

function AccionCert({
  alumnoId,
  curso,
  bloque = false,
}: {
  alumnoId: string
  curso: CursoPresente
  bloque?: boolean
}) {
  const base = bloque
    ? "flex h-9 w-full items-center justify-center gap-1.5 rounded-sm px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    : "inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"

  if (curso.estadoCert === "emitida" && curso.certificacionId) {
    return (
      <a
        href={`/admin/certificaciones/${curso.certificacionId}`}
        className={`${base} ${bloque ? "border border-border bg-background text-foreground hover:bg-secondary" : "text-tech-blue hover:bg-accent"}`}
      >
        Ver certificaci&oacute;n
      </a>
    )
  }

  if (curso.estadoCert === "pendiente") {
    return (
      <a
        href={`/admin/alumnos/${alumnoId}/certificaciones/nueva?curso=${curso.id}`}
        className={`${base} ${bloque ? "bg-tech-blue text-ink-foreground hover:bg-tech-blue/90" : "text-tech-blue hover:bg-accent"}`}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        Emitir certificaci&oacute;n
      </a>
    )
  }

  // en curso — sin acción de certificación todavía
  return bloque ? (
    <span className="flex h-9 w-full items-center justify-center rounded-sm border border-dashed border-border px-3 text-xs text-muted-foreground">
      Disponible al finalizar
    </span>
  ) : (
    <span className="text-xs text-muted-foreground">Disponible al finalizar</span>
  )
}

function EstadoVacio({ alumnoId }: { alumnoId: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span
        className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground"
        aria-hidden="true"
      >
        <BookOpen className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <p className="text-sm font-medium text-foreground">Sin cursos con asistencias presentes</p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
        Cuando se registren presentes en la cursada, los cursos del alumno aparecer&aacute;n ac&aacute;
        junto al estado de su certificaci&oacute;n.
      </p>
      <a
        href={`/admin/alumnos/${alumnoId}/asistencias`}
        className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <ClipboardList className="h-4 w-4" strokeWidth={1.75} />
        Ver asistencias
      </a>
    </div>
  )
}
