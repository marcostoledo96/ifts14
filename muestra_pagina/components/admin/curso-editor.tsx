"use client"

import { useMemo, useState } from "react"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Info,
  AlertTriangle,
  CalendarDays,
  Hash,
  User,
  Clock3,
  ShieldCheck,
  Check,
} from "lucide-react"

type EstadoCert = "no_emitidos" | "emitidos"

type FechaCurso = {
  id: string
  fecha: string
  horario: string
  descripcion: string
  certificados: EstadoCert
  /** marca local: la fila tenía certificados emitidos y fue modificada */
  tocada?: boolean
}

type Modo = "nuevo" | "editar"

const MODALIDADES = ["Presencial", "Virtual", "Híbrida"] as const

let uid = 0
const nextId = () => {
  uid += 1
  return `tmp-${uid}`
}

const fechasIniciales: FechaCurso[] = [
  {
    id: "01",
    fecha: "2026-06-05",
    horario: "18:00",
    descripcion: "Inicio de cursada",
    certificados: "no_emitidos",
  },
  {
    id: "02",
    fecha: "2026-07-31",
    horario: "18:00",
    descripcion: "Cierre y evaluación final",
    certificados: "no_emitidos",
  },
  {
    id: "03",
    fecha: "2026-03-20",
    horario: "",
    descripcion: "Comisión anterior (certificada)",
    certificados: "emitidos",
  },
]

const inputBase =
  "h-9 w-full rounded-sm border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"

export function CursoEditor({ modo }: { modo: Modo }) {
  const esEdicion = modo === "editar"

  const [nombre, setNombre] = useState(
    esEdicion ? "Introducción a Sistemas Embebidos e IoT" : "",
  )
  const [descripcion, setDescripcion] = useState(
    esEdicion
      ? "Curso nivelatorio sobre arquitecturas ARM Cortex-M, sensores, actuadores y protocolos de red (MQTT, CoAP) para entornos IoT."
      : "",
  )
  const [cargaHoraria, setCargaHoraria] = useState(esEdicion ? "40" : "")
  const [modalidad, setModalidad] = useState<string>(esEdicion ? "Presencial" : "")
  const [activo, setActivo] = useState(true)
  const [fechas, setFechas] = useState<FechaCurso[]>(
    esEdicion ? fechasIniciales : [],
  )
  const [fechasEmitidasRemovidas, setFechasEmitidasRemovidas] = useState(0)
  const [reenviar, setReenviar] = useState(true)
  const [guardado, setGuardado] = useState(false)

  // ¿Hay impacto sobre certificados ya emitidos?
  const fechasTocadasConCert = fechas.filter(
    (f) => f.certificados === "emitidos" && f.tocada,
  ).length
  const requiereReenvio = fechasTocadasConCert + fechasEmitidasRemovidas > 0
  const tieneCertEmitidos =
    esEdicion &&
    (fechas.some((f) => f.certificados === "emitidos") ||
      fechasEmitidasRemovidas > 0)

  const alumnosAfectados = (fechasTocadasConCert + fechasEmitidasRemovidas) * 14

  function actualizarFecha(id: string, campo: keyof FechaCurso, valor: string) {
    setGuardado(false)
    setFechas((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f
        const tocada = f.certificados === "emitidos" ? true : f.tocada
        return { ...f, [campo]: valor, tocada }
      }),
    )
  }

  function agregarFecha() {
    setGuardado(false)
    setFechas((prev) => [
      ...prev,
      {
        id: nextId(),
        fecha: "",
        horario: "",
        descripcion: "",
        certificados: "no_emitidos",
      },
    ])
  }

  function quitarFecha(id: string) {
    setGuardado(false)
    const objetivo = fechas.find((f) => f.id === id)
    if (objetivo?.certificados === "emitidos") {
      setFechasEmitidasRemovidas((n) => n + 1)
    }
    setFechas((prev) => prev.filter((f) => f.id !== id))
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: reemplazar por la llamada real al backend (Angular service).
    // Payload de ejemplo: { nombre, descripcion, cargaHoraria, modalidad, activo, fechas, reenviar: requiereReenvio && reenviar }
    setGuardado(true)
  }

  const tituloPagina = esEdicion ? "Editar curso" : "Nuevo curso"

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Encabezado de página */}
      <div>
        <a
          href="#"
          className="inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Volver a cursos
        </a>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {esEdicion ? "Ficha de curso" : "Alta de curso"}
            </p>
            <h1 className="mt-1 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {tituloPagina}
            </h1>
          </div>
          {esEdicion ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-secondary px-2 py-1 font-mono text-xs text-secondary-foreground">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
                CUR-2026-089
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium ${
                  activo
                    ? "bg-valid-soft text-valid"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${activo ? "bg-valid" : "bg-muted-foreground"}`}
                  aria-hidden="true"
                />
                {activo ? "Activo" : "Inactivo"}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        {/* Columna principal */}
        <div className="space-y-6">
          {/* Datos generales */}
          <section
            aria-labelledby="datos-titulo"
            className="rounded-md border border-border bg-card"
          >
            <header className="border-b border-border px-4 py-3 sm:px-5">
              <h2 id="datos-titulo" className="text-sm font-semibold text-foreground">
                Datos generales
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Información que aparece en el certificado del alumno.
              </p>
            </header>
            <div className="space-y-5 p-4 sm:p-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="curso-nombre"
                  className="block text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Nombre del curso <span className="text-destructive">*</span>
                </label>
                <input
                  id="curso-nombre"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value)
                    setGuardado(false)
                  }}
                  placeholder="ej. Introducción a Redes de Datos"
                  className={inputBase}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="curso-carga"
                    className="block text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Carga horaria{" "}
                    <span className="font-normal normal-case text-muted-foreground/70">
                      (opcional)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      id="curso-carga"
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={cargaHoraria}
                      onChange={(e) => {
                        setCargaHoraria(e.target.value)
                        setGuardado(false)
                      }}
                      placeholder="40"
                      className={`${inputBase} pr-10 tabular-nums`}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
                      hs
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="curso-modalidad"
                    className="block text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    Modalidad{" "}
                    <span className="font-normal normal-case text-muted-foreground/70">
                      (opcional)
                    </span>
                  </label>
                  <select
                    id="curso-modalidad"
                    value={modalidad}
                    onChange={(e) => {
                      setModalidad(e.target.value)
                      setGuardado(false)
                    }}
                    className={`${inputBase} appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9`}
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2354677a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                    }}
                  >
                    <option value="">Sin especificar</option>
                    {MODALIDADES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="curso-desc"
                  className="block text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Descripción{" "}
                  <span className="font-normal normal-case text-muted-foreground/70">
                    (opcional)
                  </span>
                </label>
                <textarea
                  id="curso-desc"
                  rows={3}
                  value={descripcion}
                  onChange={(e) => {
                    setDescripcion(e.target.value)
                    setGuardado(false)
                  }}
                  placeholder="Breve detalle de contenidos, destinatarios o requisitos."
                  className={`${inputBase} h-auto resize-y py-2 leading-relaxed`}
                />
              </div>

              {/* Estado activo/inactivo */}
              <div className="flex items-center justify-between gap-4 rounded-sm border border-border bg-secondary/40 px-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Curso activo</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Los cursos inactivos no admiten nuevas asistencias ni
                    certificaciones.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={activo}
                  aria-label="Curso activo"
                  onClick={() => {
                    setActivo((v) => !v)
                    setGuardado(false)
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
                    activo ? "bg-valid" : "bg-input"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-150 ease-out ${
                      activo ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Fechas del curso — protagonista */}
          <section
            aria-labelledby="fechas-titulo"
            className="rounded-md border border-border bg-card"
          >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-tech-blue" strokeWidth={1.75} />
                <h2
                  id="fechas-titulo"
                  className="text-sm font-semibold text-foreground"
                >
                  Fechas del curso
                </h2>
                <span className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-xs font-semibold tabular-nums text-secondary-foreground">
                  {fechas.length}
                </span>
              </div>
              <button
                type="button"
                onClick={agregarFecha}
                className="inline-flex items-center gap-1.5 rounded-sm border border-tech-blue/30 bg-accent/50 px-3 py-1.5 text-sm font-medium text-tech-blue transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
                Agregar fecha
              </button>
            </header>

            <p className="border-b border-border bg-secondary/30 px-4 py-2.5 text-xs leading-relaxed text-muted-foreground sm:px-5">
              Las fechas son la base de las asistencias y de la emisión de
              certificados. Definí al menos la fecha de finalización para poder
              certificar.
            </p>

            {/* Aviso de impacto — visible, sin asustar */}
            {tieneCertEmitidos ? (
              <div
                className={`mx-4 mt-4 rounded-sm border px-3 py-3 sm:mx-5 ${
                  requiereReenvio
                    ? "border-warning/40 bg-warning-soft"
                    : "border-border bg-accent/40"
                }`}
              >
                <div className="flex gap-2.5">
                  {requiereReenvio ? (
                    <AlertTriangle
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#8a6100]"
                      strokeWidth={1.75}
                    />
                  ) : (
                    <Info
                      className="mt-0.5 h-4 w-4 shrink-0 text-tech-blue"
                      strokeWidth={1.75}
                    />
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {requiereReenvio
                        ? "Cambios con impacto en certificados emitidos"
                        : "Este curso tiene certificados ya emitidos"}
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Si modificás fechas de un curso con certificados ya enviados,
                      será necesario reenviar el certificado al alumno. El QR seguirá
                      siendo el mismo.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Lista editable */}
            <div className="p-4 sm:p-5">
              {fechas.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-border px-6 py-10 text-center">
                  <span
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground"
                    aria-hidden="true"
                  >
                    <CalendarDays className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    Todavía no hay fechas cargadas
                  </p>
                  <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                    Agregá la fecha de inicio y de finalización del curso para
                    habilitar asistencias y certificaciones.
                  </p>
                  <button
                    type="button"
                    onClick={agregarFecha}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-2 text-sm font-medium text-ink-foreground transition-colors hover:bg-ink/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    Agregar primera fecha
                  </button>
                </div>
              ) : (
                <div className="space-y-3 lg:space-y-0">
                  {/* Encabezado de tabla (solo desktop) */}
                  <div className="hidden lg:grid lg:grid-cols-[2rem_9.5rem_7rem_minmax(0,1fr)_8.5rem_2.25rem] lg:items-center lg:gap-3 lg:border-b lg:border-border lg:pb-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      #
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Fecha
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Horario
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Descripción
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Certificados
                    </span>
                    <span className="sr-only">Acciones</span>
                  </div>

                  <ul className="divide-y divide-border lg:divide-y-0">
                    {fechas.map((f, i) => {
                      const emitidos = f.certificados === "emitidos"
                      return (
                        <li
                          key={f.id}
                          className="grid grid-cols-1 gap-3 py-4 first:pt-0 sm:grid-cols-2 lg:grid-cols-[2rem_9.5rem_7rem_minmax(0,1fr)_8.5rem_2.25rem] lg:items-center lg:gap-3 lg:border-b lg:border-border lg:py-2.5 lg:first:pt-2.5"
                        >
                          {/* Índice */}
                          <span className="hidden font-mono text-xs tabular-nums text-muted-foreground lg:block">
                            {String(i + 1).padStart(2, "0")}
                          </span>

                          {/* Fecha */}
                          <div className="space-y-1.5 lg:space-y-0">
                            <label
                              htmlFor={`fecha-${f.id}`}
                              className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground lg:hidden"
                            >
                              Fecha
                            </label>
                            <input
                              id={`fecha-${f.id}`}
                              type="date"
                              value={f.fecha}
                              onChange={(e) =>
                                actualizarFecha(f.id, "fecha", e.target.value)
                              }
                              aria-label={`Fecha ${i + 1}`}
                              className={`${inputBase} tabular-nums`}
                            />
                          </div>

                          {/* Horario */}
                          <div className="space-y-1.5 lg:space-y-0">
                            <label
                              htmlFor={`hora-${f.id}`}
                              className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground lg:hidden"
                            >
                              Horario (opcional)
                            </label>
                            <input
                              id={`hora-${f.id}`}
                              type="time"
                              value={f.horario}
                              onChange={(e) =>
                                actualizarFecha(f.id, "horario", e.target.value)
                              }
                              aria-label={`Horario de la fecha ${i + 1}`}
                              className={`${inputBase} tabular-nums`}
                            />
                          </div>

                          {/* Descripción */}
                          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1 lg:space-y-0">
                            <label
                              htmlFor={`desc-${f.id}`}
                              className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground lg:hidden"
                            >
                              Descripción (opcional)
                            </label>
                            <input
                              id={`desc-${f.id}`}
                              type="text"
                              value={f.descripcion}
                              onChange={(e) =>
                                actualizarFecha(f.id, "descripcion", e.target.value)
                              }
                              placeholder="ej. Inicio de cursada"
                              aria-label={`Descripción de la fecha ${i + 1}`}
                              className={inputBase}
                            />
                          </div>

                          {/* Estado certificados */}
                          <div className="flex items-center lg:block">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium ${
                                emitidos
                                  ? "bg-warning-soft text-[#8a6100]"
                                  : "bg-secondary text-muted-foreground"
                              }`}
                            >
                              {emitidos ? (
                                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
                              ) : null}
                              {emitidos ? "Emitidos" : "Sin emitir"}
                            </span>
                          </div>

                          {/* Quitar */}
                          <div className="flex justify-end lg:block">
                            <button
                              type="button"
                              onClick={() => quitarFecha(f.id)}
                              aria-label={`Quitar fecha ${i + 1}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Columna lateral — acciones + metadatos */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {/* Panel de guardado */}
          <div className="rounded-md border border-border bg-card p-4">
            {requiereReenvio ? (
              <label className="mb-3 flex cursor-pointer gap-2.5 rounded-sm border border-warning/40 bg-warning-soft p-3">
                <input
                  type="checkbox"
                  checked={reenviar}
                  onChange={(e) => setReenviar(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border-input accent-[#8a6100]"
                />
                <span className="text-xs leading-relaxed text-foreground">
                  <span className="font-medium">
                    Reenviar certificados a {alumnosAfectados} alumno
                    {alumnosAfectados === 1 ? "" : "s"} afectado
                    {alumnosAfectados === 1 ? "" : "s"}
                  </span>
                  <span className="mt-0.5 block text-muted-foreground">
                    Se notificará el certificado actualizado. El QR no cambia.
                  </span>
                </span>
              </label>
            ) : null}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-ink px-4 py-2.5 text-sm font-semibold text-ink-foreground transition-colors hover:bg-ink/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.99]"
            >
              {esEdicion
                ? requiereReenvio
                  ? "Guardar y reenviar"
                  : "Guardar cambios"
                : "Guardar curso"}
            </button>
            <button
              type="button"
              className="mt-2 flex w-full items-center justify-center rounded-sm border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              Cancelar
            </button>

            {guardado ? (
              <p
                role="status"
                className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-valid"
              >
                <Check className="h-4 w-4" strokeWidth={2.25} />
                {esEdicion
                  ? requiereReenvio && reenviar
                    ? "Cambios guardados · reenvío encolado"
                    : "Cambios guardados"
                  : "Curso creado"}
              </p>
            ) : null}
          </div>

          {/* Metadatos del sistema (solo edición) */}
          {esEdicion ? (
            <div className="rounded-md border border-border bg-card">
              <header className="border-b border-border px-4 py-2.5">
                <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Metadatos del sistema
                </h2>
              </header>
              <dl className="space-y-3 p-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <User
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <div>
                    <dt className="text-muted-foreground">Creado por</dt>
                    <dd className="mt-0.5 font-medium text-foreground">
                      M. Pereyra · Bedelía
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock3
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <div>
                    <dt className="text-muted-foreground">Última modificación</dt>
                    <dd className="mt-0.5 font-mono text-foreground">
                      2026-05-10 14:32
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <div className="min-w-0">
                    <dt className="text-muted-foreground">Firma base (hash)</dt>
                    <dd className="mt-0.5 break-all font-mono text-[11px] leading-relaxed text-foreground/80">
                      e3b0c44298fc1c149afbf4c8996fb924
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-border bg-secondary/30 p-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                El identificador del curso y la firma criptográfica se generan
                automáticamente al guardar.
              </p>
            </div>
          )}
        </aside>
      </div>
    </form>
  )
}
