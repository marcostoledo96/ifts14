"use client"

import { useMemo, useState } from "react"
import {
  Building2,
  Award,
  PenLine,
  AtSign,
  QrCode,
  Info,
  UploadCloud,
  ImageOff,
  Check,
  Eye,
  Link2,
  Hash,
  ShieldCheck,
  ShieldOff,
  SearchX,
  MailWarning,
  RotateCcw,
} from "lucide-react"

/* ------------------------------------------------------------------ *
 * Configuración institucional — /admin/configuracion
 *
 * Define la metadata global que se imprime en certificados, PDF y en
 * la validación pública. NO es un panel de settings SaaS: es el "folio"
 * institucional que Bedelía completa una vez y reutiliza en cada
 * emisión. El sistema NO envía emails en el MVP (sin SMTP / PHPMailer);
 * el email institucional es solo un dato de contacto.
 *
 * Modelo mock, pensado para portarse a Angular 20 + Tailwind:
 * - sin APIs propias de Next.js;
 * - navegación por anclas con <a href="#..."> nativo;
 * - estado local simple (reactive form en Angular);
 * - los datos de ejemplo alimentan el mismo shape que devolverá el
 *   service de configuración.
 * ------------------------------------------------------------------ */

const inputBase =
  "h-9 w-full rounded-sm border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
const textareaBase =
  "w-full resize-y rounded-sm border border-input bg-background px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
const labelBase =
  "block text-xs font-medium uppercase tracking-wide text-muted-foreground"

const SECCIONES = [
  { id: "identidad", label: "Identidad institucional", icon: Building2 },
  { id: "certificados", label: "Certificados", icon: Award },
  { id: "autoridades", label: "Autoridades y firmas", icon: PenLine },
  { id: "contacto", label: "Contacto institucional", icon: AtSign },
  { id: "validacion", label: "Validación pública", icon: QrCode },
] as const

const LOGOS = [
  { id: "ifts", nombre: "Logo IFTS N.° 14", detalle: "Marca principal · SVG/PNG", cargado: true },
  { id: "escudo", nombre: "Escudo institucional", detalle: "Sello del instituto", cargado: true },
  { id: "ba-aprende", nombre: "Buenos Aires Aprende", detalle: "Programa de formación", cargado: true },
  { id: "agencia", nombre: "Agencia de Habilidades para el Futuro", detalle: "Organismo", cargado: false },
  { id: "ba-ciudad", nombre: "GCBA · BA Ciudad", detalle: "Gobierno de la Ciudad", cargado: true },
] as const

/* Ayuda breve por campo -------------------------------------------- */
function Ayuda({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>
  )
}

/* Bloque de campo con etiqueta + ayuda ------------------------------ */
function Campo({
  id,
  label,
  ayuda,
  opcional,
  children,
}: {
  id: string
  label: string
  ayuda?: React.ReactNode
  opcional?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={labelBase}>
        {label}{" "}
        {opcional ? (
          <span className="font-normal normal-case text-muted-foreground/70">
            (opcional)
          </span>
        ) : null}
      </label>
      {children}
      {ayuda ? <Ayuda>{ayuda}</Ayuda> : null}
    </div>
  )
}

/* Contenedor de sección --------------------------------------------- */
function Seccion({
  id,
  numero,
  icon: Icon,
  titulo,
  descripcion,
  children,
}: {
  id: string
  numero: number
  icon: typeof Building2
  titulo: string
  descripcion: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titulo`}
      className="scroll-mt-24 rounded-md border border-border bg-card"
    >
      <header className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
        <span
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-secondary text-ink"
          aria-hidden="true"
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[10px] font-semibold tabular-nums tracking-[0.14em] text-muted-foreground">
              {String(numero).padStart(2, "0")}
            </span>
            <h2
              id={`${id}-titulo`}
              className="text-sm font-semibold text-foreground"
            >
              {titulo}
            </h2>
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {descripcion}
          </p>
        </div>
      </header>
      {children}
    </section>
  )
}

export function ConfiguracionInstitucional() {
  // Identidad
  const [nombreInstituto, setNombreInstituto] = useState(
    "Instituto de Formación Técnica Superior N.° 14",
  )
  const [textoInstitucional, setTextoInstitucional] = useState(
    "El Instituto de Formación Técnica Superior N.° 14 depende de la Dirección de Formación Técnica Superior del Gobierno de la Ciudad de Buenos Aires.",
  )

  // Certificados
  const [tituloCert, setTituloCert] = useState("Certificado de Aprobación")
  const [textoBaseCert, setTextoBaseCert] = useState(
    "Se certifica que la persona mencionada ha aprobado satisfactoriamente el curso detallado, cumpliendo con la asistencia y las evaluaciones requeridas.",
  )
  const [formatoNumero, setFormatoNumero] = useState("IFTS14-{CURSO}-{AÑO}-{SEC}")
  const [textoQR, setTextoQR] = useState(
    "Escaneá el código para verificar la autenticidad de este certificado en el sitio oficial del IFTS N.° 14.",
  )
  const [linkValidacion, setLinkValidacion] = useState(
    "certificados.ifts14.edu.ar/validar/",
  )
  const [usaSello, setUsaSello] = useState(true)

  // Autoridades
  const [rectorNombre, setRectorNombre] = useState("")
  const [rectorCargo, setRectorCargo] = useState("Rectora del IFTS N.° 14")
  const [rectorFirma, setRectorFirma] = useState(false)
  const [asesorNombre, setAsesorNombre] = useState("")
  const [asesorCargo, setAsesorCargo] = useState(
    "Asesora Pedagógica del IFTS N.° 14",
  )
  const [asesorFirma, setAsesorFirma] = useState(true)

  // Contacto (metadata, sin envío)
  const [emailContacto, setEmailContacto] = useState("contacto@example.invalid")

  // Validación pública
  const [textoValidacion, setTextoValidacion] = useState(
    "Este espacio permite verificar la validez de los certificados emitidos por el IFTS N.° 14.",
  )
  const [sitioInstituto, setSitioInstituto] = useState("www.ifts14.edu.ar")
  const [msgValido, setMsgValido] = useState(
    "Certificado válido y vigente, emitido por el IFTS N.° 14.",
  )
  const [msgRevocado, setMsgRevocado] = useState(
    "Este certificado fue revocado por la institución y ya no es válido.",
  )
  const [msgNoEncontrado, setMsgNoEncontrado] = useState(
    "No se encontró ningún certificado asociado a este código.",
  )

  const [dirty, setDirty] = useState(false)
  const [guardado, setGuardado] = useState(false)

  // Marca el formulario como modificado en cualquier cambio.
  function touch<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v)
      setDirty(true)
      setGuardado(false)
    }
  }

  const previewRector = rectorNombre.trim() || "[Nombre de la rectora]"
  const previewAsesor = asesorNombre.trim() || "[Nombre de la asesora]"

  const logosPendientes = useMemo(
    () => LOGOS.filter((l) => !l.cargado).length,
    [],
  )

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: reemplazar por el service de configuración (Angular).
    setDirty(false)
    setGuardado(true)
  }

  function onDescartar() {
    // En el port, recarga los valores del último guardado.
    setDirty(false)
    setGuardado(false)
  }

  return (
    <form onSubmit={onSubmit} className="pb-28">
      {/* Encabezado de página */}
      <div className="border-b border-border pb-5">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Folio institucional
        </p>
        <h1 className="mt-1 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Configuración institucional
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Estos datos se aplican a los certificados emitidos por el sistema. Se
          configuran una sola vez acá y no se editan en la pantalla de emisión
          individual.
        </p>
      </div>

      {/* Avisos obligatorios de impacto */}
      <div className="mt-5 rounded-md border-l-2 border-l-tech-blue border border-border bg-accent/40">
        <div className="flex gap-3 px-4 py-3.5 sm:px-5">
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-tech-blue"
            strokeWidth={1.75}
          />
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Cómo impactan estos cambios
            </p>
            <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
              <li className="flex gap-2">
                <span aria-hidden="true" className="text-tech-blue">
                  &middot;
                </span>
                Los cambios impactan únicamente en los{" "}
                <strong className="font-medium text-foreground">
                  nuevos documentos
                </strong>{" "}
                generados después de guardar.
              </li>
              <li className="flex gap-2">
                <span aria-hidden="true" className="text-tech-blue">
                  &middot;
                </span>
                Si se modifican firmas o autoridades, los certificados ya
                compartidos manualmente{" "}
                <strong className="font-medium text-foreground">
                  no cambian
                </strong>{" "}
                hasta que se regenere el PDF.
              </li>
              <li className="flex gap-2">
                <span aria-hidden="true" className="text-tech-blue">
                  &middot;
                </span>
                Estos datos{" "}
                <strong className="font-medium text-foreground">
                  no se editan
                </strong>{" "}
                en la pantalla de emisión individual.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
        {/* Índice lateral (desktop) */}
        <nav
          aria-label="Secciones de configuración"
          className="hidden lg:block"
        >
          <div className="sticky top-24">
            <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Secciones
            </p>
            <ul className="flex flex-col gap-0.5">
              {SECCIONES.map((s, i) => {
                const Icon = s.icon
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="group flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      <span className="font-mono text-[10px] tabular-nums text-muted-foreground/70 group-hover:text-tech-blue">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <Icon
                        className="h-4 w-4 shrink-0 text-muted-foreground/80 group-hover:text-foreground"
                        strokeWidth={1.75}
                      />
                      <span className="leading-tight">{s.label}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        {/* Columna de secciones */}
        <div className="min-w-0 space-y-6">
          {/* 1 — Identidad institucional */}
          <Seccion
            id="identidad"
            numero={1}
            icon={Building2}
            titulo="Identidad institucional"
            descripcion="Nombre y logos que encabezan cada certificado y el PDF."
          >
            <div className="space-y-5 p-4 sm:p-5">
              <Campo
                id="nombre-instituto"
                label="Nombre visible del instituto"
                ayuda="Aparece como encabezado principal del certificado."
              >
                <input
                  id="nombre-instituto"
                  type="text"
                  value={nombreInstituto}
                  onChange={(e) => touch(setNombreInstituto)(e.target.value)}
                  className={inputBase}
                />
              </Campo>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className={labelBase}>Logos y sellos</span>
                  {logosPendientes > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-warning-soft px-2 py-0.5 text-xs font-medium text-[#8a6100]">
                      {logosPendientes} sin cargar
                    </span>
                  ) : null}
                </div>
                <Ayuda>
                  Formato recomendado SVG o PNG con fondo transparente. Se
                  ubican en el encabezado según el diseño del certificado.
                </Ayuda>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {LOGOS.map((logo) => (
                    <li key={logo.id}>
                      <div className="flex h-full flex-col rounded-sm border border-border bg-secondary/30 p-3">
                        <div
                          className={`flex aspect-[3/2] items-center justify-center rounded-sm border ${
                            logo.cargado
                              ? "border-border bg-card"
                              : "border-dashed border-border bg-background"
                          }`}
                          aria-hidden="true"
                        >
                          {logo.cargado ? (
                            <span className="flex flex-col items-center gap-1 text-valid">
                              <Check className="h-5 w-5" strokeWidth={2} />
                              <span className="font-mono text-[10px] uppercase tracking-wide">
                                Cargado
                              </span>
                            </span>
                          ) : (
                            <span className="flex flex-col items-center gap-1 text-muted-foreground">
                              <ImageOff className="h-5 w-5" strokeWidth={1.5} />
                              <span className="font-mono text-[10px] uppercase tracking-wide">
                                Sin logo
                              </span>
                            </span>
                          )}
                        </div>
                        <p className="mt-2.5 text-xs font-medium leading-tight text-foreground">
                          {logo.nombre}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                          {logo.detalle}
                        </p>
                        <button
                          type="button"
                          onClick={() => setDirty(true)}
                          className="mt-2.5 inline-flex items-center justify-center gap-1.5 rounded-sm border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 active:scale-[0.98]"
                        >
                          <UploadCloud className="h-3.5 w-3.5" strokeWidth={1.75} />
                          {logo.cargado ? "Reemplazar" : "Subir logo"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <Campo
                id="texto-institucional"
                label="Texto institucional base"
                ayuda="Descripción breve del instituto que puede acompañar el pie del certificado."
                opcional
              >
                <textarea
                  id="texto-institucional"
                  rows={3}
                  value={textoInstitucional}
                  onChange={(e) => touch(setTextoInstitucional)(e.target.value)}
                  className={textareaBase}
                />
              </Campo>
            </div>
          </Seccion>

          {/* 2 — Certificados */}
          <Seccion
            id="certificados"
            numero={2}
            icon={Award}
            titulo="Certificados"
            descripcion="Textos base y numeración que estructuran cada documento emitido."
          >
            <div className="space-y-5 p-4 sm:p-5">
              <Campo
                id="titulo-cert"
                label="Título del certificado"
                ayuda="Encabezado del documento, por ejemplo “Certificado de Aprobación”."
              >
                <input
                  id="titulo-cert"
                  type="text"
                  value={tituloCert}
                  onChange={(e) => touch(setTituloCert)(e.target.value)}
                  className={inputBase}
                />
              </Campo>

              <Campo
                id="texto-base-cert"
                label="Texto base del certificado"
                ayuda="Cuerpo del certificado. Los datos del alumno y del curso se completan automáticamente en cada emisión."
              >
                <textarea
                  id="texto-base-cert"
                  rows={3}
                  value={textoBaseCert}
                  onChange={(e) => touch(setTextoBaseCert)(e.target.value)}
                  className={textareaBase}
                />
              </Campo>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo
                  id="formato-numero"
                  label="Formato de número"
                  ayuda={
                    <>
                      Usá las variables{" "}
                      <code className="rounded-sm bg-secondary px-1 py-0.5 font-mono text-[11px] text-foreground">
                        {"{CURSO}"}
                      </code>
                      ,{" "}
                      <code className="rounded-sm bg-secondary px-1 py-0.5 font-mono text-[11px] text-foreground">
                        {"{AÑO}"}
                      </code>{" "}
                      y{" "}
                      <code className="rounded-sm bg-secondary px-1 py-0.5 font-mono text-[11px] text-foreground">
                        {"{SEC}"}
                      </code>
                      .
                    </>
                  }
                >
                  <div className="relative">
                    <Hash
                      className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                      strokeWidth={2}
                    />
                    <input
                      id="formato-numero"
                      type="text"
                      value={formatoNumero}
                      onChange={(e) => touch(setFormatoNumero)(e.target.value)}
                      className={`${inputBase} pl-8 font-mono`}
                    />
                  </div>
                </Campo>

                <Campo
                  id="link-validacion"
                  label="Link base de validación"
                  ayuda="Se antepone al ID único del certificado en el QR."
                >
                  <div className="flex items-stretch overflow-hidden rounded-sm border border-input focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
                    <span className="flex shrink-0 items-center border-r border-input bg-secondary px-2.5 font-mono text-xs text-muted-foreground">
                      https://
                    </span>
                    <input
                      id="link-validacion"
                      type="text"
                      value={linkValidacion}
                      onChange={(e) => touch(setLinkValidacion)(e.target.value)}
                      className="h-9 w-full bg-background px-3 font-mono text-sm text-foreground focus:outline-none"
                    />
                  </div>
                </Campo>
              </div>

              <Campo
                id="texto-qr"
                label="Texto de validación QR"
                ayuda="Leyenda impresa junto al código QR en el certificado."
              >
                <textarea
                  id="texto-qr"
                  rows={2}
                  value={textoQR}
                  onChange={(e) => touch(setTextoQR)(e.target.value)}
                  className={textareaBase}
                />
              </Campo>

              {/* Sello institucional */}
              <div className="flex items-center justify-between gap-4 rounded-sm border border-border bg-secondary/40 px-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Incluir sello institucional
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    Estampa el escudo del instituto sobre el documento generado.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={usaSello}
                  aria-label="Incluir sello institucional"
                  onClick={() => touch(setUsaSello)(!usaSello)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
                    usaSello ? "bg-valid" : "bg-input"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-150 ease-out ${
                      usaSello ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </Seccion>

          {/* 3 — Autoridades y firmas */}
          <Seccion
            id="autoridades"
            numero={3}
            icon={PenLine}
            titulo="Autoridades y firmas"
            descripcion="Firmantes globales del certificado. Se aplican a todas las emisiones."
          >
            <div className="grid grid-cols-1 gap-5 p-4 sm:p-5 lg:grid-cols-2">
              {/* Rector/a */}
              <fieldset className="space-y-4 rounded-sm border border-border p-4">
                <legend className="flex items-center gap-2 px-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-ink font-mono text-[9px] font-bold text-ink-foreground">
                    1
                  </span>
                  Rector / Rectora
                </legend>
                <Campo
                  id="rector-nombre"
                  label="Nombre completo"
                  ayuda="Nombre y apellido tal como firmará el certificado."
                >
                  <input
                    id="rector-nombre"
                    type="text"
                    value={rectorNombre}
                    onChange={(e) => touch(setRectorNombre)(e.target.value)}
                    placeholder="ej. Persona Ficticia Rectora"
                    className={inputBase}
                  />
                </Campo>
                <Campo id="rector-cargo" label="Cargo formal">
                  <input
                    id="rector-cargo"
                    type="text"
                    value={rectorCargo}
                    onChange={(e) => touch(setRectorCargo)(e.target.value)}
                    className={inputBase}
                  />
                </Campo>
                <FirmaDigital
                  cargada={rectorFirma}
                  onToggle={() => touch(setRectorFirma)(!rectorFirma)}
                />
              </fieldset>

              {/* Asesor/a pedagógico/a */}
              <fieldset className="space-y-4 rounded-sm border border-border p-4">
                <legend className="flex items-center gap-2 px-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-ink font-mono text-[9px] font-bold text-ink-foreground">
                    2
                  </span>
                  Asesor / Asesora Pedagógica
                </legend>
                <Campo
                  id="asesor-nombre"
                  label="Nombre completo"
                  ayuda="Nombre y apellido tal como firmará el certificado."
                >
                  <input
                    id="asesor-nombre"
                    type="text"
                    value={asesorNombre}
                    onChange={(e) => touch(setAsesorNombre)(e.target.value)}
                    placeholder="ej. Persona Ficticia Asesora"
                    className={inputBase}
                  />
                </Campo>
                <Campo id="asesor-cargo" label="Cargo formal">
                  <input
                    id="asesor-cargo"
                    type="text"
                    value={asesorCargo}
                    onChange={(e) => touch(setAsesorCargo)(e.target.value)}
                    className={inputBase}
                  />
                </Campo>
                <FirmaDigital
                  cargada={asesorFirma}
                  onToggle={() => touch(setAsesorFirma)(!asesorFirma)}
                />
              </fieldset>
            </div>

            {/* Vista previa del bloque de firmas */}
            <div className="border-t border-border p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4 text-tech-blue" strokeWidth={1.75} />
                <span className={labelBase}>Vista previa en el PDF</span>
              </div>
              <div className="rounded-sm border border-border bg-paper p-6">
                <div className="mx-auto grid max-w-lg grid-cols-2 gap-8">
                  <FirmaPreview
                    firmada={rectorFirma}
                    nombre={previewRector}
                    cargo={rectorCargo}
                  />
                  <FirmaPreview
                    firmada={asesorFirma}
                    nombre={previewAsesor}
                    cargo={asesorCargo}
                  />
                </div>
                <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Bloque de firmas &middot; Certificado IFTS N.&deg; 14
                </p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Representación aproximada. Los firmantes provienen de esta
                configuración global y no se editan al emitir cada certificado.
              </p>
            </div>
          </Seccion>

          {/* 4 — Contacto institucional */}
          <Seccion
            id="contacto"
            numero={4}
            icon={AtSign}
            titulo="Contacto institucional"
            descripcion="Dato de contacto que figura como referencia. No es un sistema de envío."
          >
            <div className="space-y-5 p-4 sm:p-5">
              <Campo
                id="email-contacto"
                label="Email de contacto institucional"
                ayuda="Se muestra como referencia de contacto. El sistema no envía correos automáticamente."
              >
                <div className="relative">
                  <AtSign
                    className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                    strokeWidth={2}
                  />
                  <input
                    id="email-contacto"
                    type="email"
                    value={emailContacto}
                    onChange={(e) => touch(setEmailContacto)(e.target.value)}
                    className={`${inputBase} pl-8`}
                  />
                </div>
              </Campo>

              {/* Aclaración: entrega manual, sin envío automático */}
              <div className="rounded-sm border border-border bg-secondary/40 p-4">
                <div className="flex gap-2.5">
                  <MailWarning
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      La entrega de certificados es manual
                    </p>
                    <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
                      <li className="flex gap-2">
                        <span aria-hidden="true">&middot;</span>
                        El sistema no cuenta con envío de emails (sin SMTP ni
                        PHPMailer) ni opción de “reenviar”.
                      </li>
                      <li className="flex gap-2">
                        <span aria-hidden="true">&middot;</span>
                        La entrega se hace copiando el link de validación o
                        descargando el PDF.
                      </li>
                      <li className="flex gap-2">
                        <span aria-hidden="true">&middot;</span>
                        Ante entregas manuales repetidas del mismo certificado,
                        el código QR permanece igual.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Seccion>

          {/* 5 — Validación pública */}
          <Seccion
            id="validacion"
            numero={5}
            icon={QrCode}
            titulo="Validación pública"
            descripcion="Textos que ve cualquier persona al verificar un certificado por QR."
          >
            <div className="space-y-5 p-4 sm:p-5">
              <Campo
                id="texto-validacion"
                label="Texto aclaratorio"
                ayuda="Introducción que se muestra en la página pública de validación."
              >
                <textarea
                  id="texto-validacion"
                  rows={2}
                  value={textoValidacion}
                  onChange={(e) => touch(setTextoValidacion)(e.target.value)}
                  className={textareaBase}
                />
              </Campo>

              <Campo
                id="sitio-instituto"
                label="Enlace al sitio del instituto"
                ayuda="Se ofrece como referencia oficial en la validación pública."
              >
                <div className="relative">
                  <Link2
                    className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                    strokeWidth={2}
                  />
                  <input
                    id="sitio-instituto"
                    type="text"
                    value={sitioInstituto}
                    onChange={(e) => touch(setSitioInstituto)(e.target.value)}
                    className={`${inputBase} pl-8 font-mono`}
                  />
                </div>
              </Campo>

              <div className="space-y-3">
                <span className={labelBase}>Mensajes de estado</span>
                <MensajeEstado
                  id="msg-valido"
                  tono="valido"
                  icon={ShieldCheck}
                  etiqueta="Certificado válido"
                  valor={msgValido}
                  onChange={(v) => touch(setMsgValido)(v)}
                />
                <MensajeEstado
                  id="msg-revocado"
                  tono="revocado"
                  icon={ShieldOff}
                  etiqueta="Certificado revocado"
                  valor={msgRevocado}
                  onChange={(v) => touch(setMsgRevocado)(v)}
                />
                <MensajeEstado
                  id="msg-no-encontrado"
                  tono="neutro"
                  icon={SearchX}
                  etiqueta="Token no encontrado"
                  valor={msgNoEncontrado}
                  onChange={(v) => touch(setMsgNoEncontrado)(v)}
                />
              </div>
            </div>
          </Seccion>
        </div>
      </div>

      {/* Barra de acciones fija */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur lg:pl-64">
        <div className="mx-auto flex max-w-6xl flex-col-reverse items-stretch gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p
            className="flex items-center gap-2 text-xs text-muted-foreground"
            aria-live="polite"
          >
            {guardado ? (
              <>
                <Check className="h-4 w-4 text-valid" strokeWidth={2} />
                <span className="text-valid">Configuración guardada.</span>
                <span className="hidden sm:inline">
                  Se aplicará a los próximos documentos generados.
                </span>
              </>
            ) : dirty ? (
              <>
                <span
                  className="h-1.5 w-1.5 rounded-full bg-warning"
                  aria-hidden="true"
                />
                Tenés cambios sin guardar.
              </>
            ) : (
              <>
                <span
                  className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50"
                  aria-hidden="true"
                />
                Sin cambios pendientes.
              </>
            )}
          </p>
          <div className="flex items-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={onDescartar}
              disabled={!dirty}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
              Descartar cambios
            </button>
            <button
              type="submit"
              disabled={!dirty}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-sm bg-ink px-4 py-2 text-sm font-semibold text-ink-foreground transition-colors hover:bg-ink/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
              Guardar configuración
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

/* Estado de firma digital cargada / faltante ------------------------ */
function FirmaDigital({
  cargada,
  onToggle,
}: {
  cargada: boolean
  onToggle: () => void
}) {
  return (
    <div className="space-y-1.5">
      <span className={labelBase}>Firma digital</span>
      <div
        className={`flex items-center justify-between gap-3 rounded-sm border px-3 py-2.5 ${
          cargada
            ? "border-valid/30 bg-valid-soft"
            : "border-dashed border-border bg-secondary/30"
        }`}
      >
        <span className="flex items-center gap-2 text-sm">
          {cargada ? (
            <>
              <Check className="h-4 w-4 text-valid" strokeWidth={2} />
              <span className="font-medium text-valid">Firma cargada</span>
            </>
          ) : (
            <>
              <ImageOff
                className="h-4 w-4 text-muted-foreground"
                strokeWidth={1.75}
              />
              <span className="text-muted-foreground">Sin firma cargada</span>
            </>
          )}
        </span>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 active:scale-[0.98]"
        >
          <UploadCloud className="h-3.5 w-3.5" strokeWidth={1.75} />
          {cargada ? "Reemplazar" : "Subir firma"}
        </button>
      </div>
    </div>
  )
}

/* Render de una firma en la vista previa del PDF -------------------- */
function FirmaPreview({
  firmada,
  nombre,
  cargo,
}: {
  firmada: boolean
  nombre: string
  cargo: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-10 w-full items-end justify-center">
        {firmada ? (
          <svg
            width="96"
            height="34"
            viewBox="0 0 96 34"
            fill="none"
            className="text-ink"
            aria-hidden="true"
          >
            <path
              d="M4 24c8-14 14 6 20-2s8-14 14-6 8 12 16 4 14-16 22-8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <span className="pb-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground/60">
            Firma pendiente
          </span>
        )}
      </div>
      <div className="mt-1 w-full border-t border-ink/40 pt-1.5">
        <p className="text-xs font-semibold text-foreground">{nombre}</p>
        <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
          {cargo || "[Cargo]"}
        </p>
      </div>
    </div>
  )
}

/* Editor de un mensaje de estado de la validación pública ----------- */
function MensajeEstado({
  id,
  tono,
  icon: Icon,
  etiqueta,
  valor,
  onChange,
}: {
  id: string
  tono: "valido" | "revocado" | "neutro"
  icon: typeof ShieldCheck
  etiqueta: string
  valor: string
  onChange: (v: string) => void
}) {
  const estilos = {
    valido: { chip: "bg-valid-soft text-valid", icon: "text-valid" },
    revocado: {
      chip: "bg-destructive-soft text-destructive",
      icon: "text-destructive",
    },
    neutro: {
      chip: "bg-secondary text-secondary-foreground",
      icon: "text-muted-foreground",
    },
  }[tono]

  return (
    <div className="rounded-sm border border-border bg-secondary/20 p-3">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium ${estilos.chip}`}
        >
          <Icon className={`h-3.5 w-3.5 ${estilos.icon}`} strokeWidth={2} />
          {etiqueta}
        </span>
      </div>
      <label htmlFor={id} className="sr-only">
        Mensaje para {etiqueta}
      </label>
      <textarea
        id={id}
        rows={2}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className={textareaBase}
      />
    </div>
  )
}
