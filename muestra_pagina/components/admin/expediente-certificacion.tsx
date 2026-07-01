"use client"

import { useState } from "react"
import {
  ArrowLeft,
  ShieldCheck,
  Ban,
  Download,
  Mail,
  MailX,
  RefreshCw,
  Send,
  Link2,
  Check,
  Copy,
  Lock,
  AlertTriangle,
  FileText,
  Clock,
  UserRound,
  GraduationCap,
} from "lucide-react"

/* ------------------------------------------------------------------ *
 * Modelo (mock). En el port a Angular se reemplaza por el resolver /
 * service del expediente. La UI no persiste nada por su cuenta.
 *
 * IMPORTANTE — muestra estática: este componente renderiza SIEMPRE el
 * mismo EXPEDIENTE de ejemplo (García / IFTS14-CUR-2024-0031) sin usar
 * el `id` de la ruta para seleccionar datos. Es una muestra visual fija,
 * no comportamiento real por registro. Al portar a Angular, reemplazar
 * por un resolver que use el id para cargar el expediente real o, si
 * no hay dataset mock, mantener el cartel "muestra estática" explícito.
 * ------------------------------------------------------------------ */

type FechaPresente = { fecha: string; modulo: string; carga: number }

/** Autoridades y firmas: SOLO lectura, provienen de Configuración
 *  institucional global. No se editan desde esta pantalla. */
const CONFIG_INSTITUCIONAL = {
  rectora: { nombre: "Lic. Adriana B. Funes", cargo: "Rectora — IFTS N.° 14" },
  asesora: {
    nombre: "Prof. Daniel E. Roldán",
    cargo: "Asesor Pedagógico — IFTS N.° 14",
  },
}

const EXPEDIENTE = {
  alumno: {
    nombre: "María Florencia",
    apellido: "García",
    dni: "34.567.890",
    email: "m.garcia@ifts14.edu.ar",
  },
  curso: {
    nombre: "Desarrollo de Sistemas Web II",
    ciclo: "2024 · 1.er cuatrimestre",
    fechas: [
      { fecha: "2024-03-15", modulo: "Unidad 1 — Frontend avanzado", carga: 4 },
      { fecha: "2024-03-22", modulo: "Unidad 2 — Arquitectura de estado", carga: 4 },
      { fecha: "2024-04-05", modulo: "Unidad 3 — Consumo de APIs", carga: 4 },
      { fecha: "2024-04-19", modulo: "Unidad 4 — Pruebas e integración", carga: 4 },
    ] as FechaPresente[],
  },
  admin: {
    numero: "IFTS14-CUR-2024-0031",
    emision: "2024-10-24 · 14:32 ART",
    tokenParcial: "8F3A·····92K",
    token: "8F3A-92K-7C1E",
  },
}

const VALIDACION_HOST = "ifts14.com.ar/certificados"

/* ------------------------------------------------------------------ *
 * Helpers de formato
 * ------------------------------------------------------------------ */

const fmtCorta = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})
function parseISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}
function ahoraSello() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} · ${p(
    d.getHours(),
  )}:${p(d.getMinutes())} ART`
}

/* ------------------------------------------------------------------ *
 * Piezas visuales reutilizadas del sistema
 * ------------------------------------------------------------------ */

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

/* Tarjeta de sección del panel de control */
function Panel({
  titulo,
  children,
  tone = "default",
}: {
  titulo?: string
  children: React.ReactNode
  tone?: "default" | "danger"
}) {
  return (
    <section
      className={`rounded-md border bg-card ${
        tone === "danger" ? "border-destructive/35" : "border-border"
      }`}
    >
      {titulo ? (
        <header
          className={`border-b px-4 py-3 ${
            tone === "danger" ? "border-destructive/25" : "border-border"
          }`}
        >
          <h2
            className={`text-sm font-semibold ${
              tone === "danger" ? "text-destructive" : "text-foreground"
            }`}
          >
            {titulo}
          </h2>
        </header>
      ) : null}
      {children}
    </section>
  )
}

function FilaDato({
  etiqueta,
  children,
  mono = false,
}: {
  etiqueta: string
  children: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="px-4 py-2.5">
      <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        {etiqueta}
      </dt>
      <dd
        className={`mt-0.5 text-foreground ${
          mono ? "font-mono text-[13px]" : "text-sm font-medium"
        }`}
      >
        {children}
      </dd>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Historial / línea de tiempo
 * ------------------------------------------------------------------ */

type EventoTipo = "creada" | "enviada" | "reenviada" | "regenerada" | "asistencia" | "revocada"
type Evento = { tipo: EventoTipo; sello: string; detalle: string }

const ICONO_EVENTO: Record<EventoTipo, typeof FileText> = {
  creada: FileText,
  enviada: Mail,
  reenviada: Send,
  regenerada: RefreshCw,
  asistencia: Clock,
  revocada: Ban,
}

/* ------------------------------------------------------------------ *
 * Pantalla
 * ------------------------------------------------------------------ */

export function ExpedienteCertificacion({ id }: { id: string }) {
  const { alumno, curso, admin } = EXPEDIENTE
  const cargaTotal = curso.fechas.reduce((s, f) => s + f.carga, 0)

  const [estado, setEstado] = useState<"valida" | "revocada">("valida")
  const [copiado, setCopiado] = useState(false)
  const [accion, setAccion] = useState<string | null>(null)
  const [confirmarRevoca, setConfirmarRevoca] = useState(false)
  const [ultimoEnvio, setUltimoEnvio] = useState("2024-10-24 · 14:35 ART")
  const [aviso, setAviso] = useState<string | null>(null)

  const [historial, setHistorial] = useState<Evento[]>([
    { tipo: "creada", sello: "2024-10-24 · 14:32 ART", detalle: "Certificado generado · firma digital verificada." },
    { tipo: "enviada", sello: "2024-10-24 · 14:35 ART", detalle: `Enviado por email a ${alumno.email}.` },
    { tipo: "reenviada", sello: "2024-11-02 · 09:10 ART", detalle: "Reenviado a pedido del alumno." },
    { tipo: "asistencia", sello: "2024-11-15 · 16:20 ART", detalle: "Asistencia corregida · PDF regenerado con el mismo QR." },
  ])

  const revocada = estado === "revocada"
  const validarPath = `/validar/${admin.token}`
  const validarUrl = `https://${VALIDACION_HOST}${validarPath}`

  /* --- acciones (mock; en Angular llaman a services) --- */

  async function simular(clave: string, ms = 850) {
    setAccion(clave)
    await new Promise((r) => setTimeout(r, ms))
    setAccion(null)
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(validarUrl)
    } catch {
      /* entorno sin clipboard: se ignora en el mock */
    }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2200)
  }

  async function onReenviar() {
    await simular("reenviar")
    const sello = ahoraSello()
    setUltimoEnvio(sello)
    setHistorial((h) => [
      ...h,
      { tipo: "reenviada", sello, detalle: `Reenviado por email a ${alumno.email}.` },
    ])
    setAviso(`Certificado reenviado a ${alumno.email} con el mismo QR.`)
  }

  async function onRegenerar() {
    await simular("regenerar")
    const sello = ahoraSello()
    setHistorial((h) => [
      ...h,
      { tipo: "regenerada", sello, detalle: "PDF regenerado · el QR permanente se mantiene." },
    ])
    setAviso("PDF regenerado. El QR no cambia: recordá reenviarlo al alumno.")
  }

  async function onDescargar() {
    await simular("descargar")
    setAviso("Se generó el PDF para descarga.")
  }

  async function onRevocar() {
    await simular("revocar", 1000)
    setEstado("revocada")
    setConfirmarRevoca(false)
    const sello = ahoraSello()
    setHistorial((h) => [
      ...h,
      { tipo: "revocada", sello, detalle: "Certificación revocada por Bedelía · validación invalidada." },
    ])
    setAviso(null)
  }

  return (
    <div className="space-y-6">
      {/* anuncios para lectores de pantalla */}
      <span className="sr-only" role="status" aria-live="polite">
        {accion ? "Procesando…" : copiado ? "Enlace copiado" : aviso ?? ""}
      </span>

      {/* Encabezado del expediente */}
      <header className="space-y-3">
        <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <a
            href="/admin/certificaciones"
            className="inline-flex items-center gap-1.5 rounded-sm transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Certificaciones
          </a>
          <span aria-hidden="true" className="text-border">/</span>
          <span className="font-mono text-xs text-foreground">{admin.numero}</span>
        </nav>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-circuit">
              Expediente de certificación
            </p>
            <h1 className="mt-1 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {alumno.apellido}, {alumno.nombre}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {curso.nombre} · {curso.ciclo}
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 rounded-sm border border-border bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <Lock className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
              Muestra estática — el id de ruta no selecciona datos reales
            </p>
          </div>
          <EstadoBadge revocada={revocada} />
        </div>
      </header>

      {/* Layout: panel de control (izq) + documento (der) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[21rem_minmax(0,1fr)]">
        {/* ---------------- Columna de control ---------------- */}
        <div className="space-y-4">
          {/* Ficha de datos */}
          <Panel titulo="Ficha del expediente">
            <div className="px-4 pt-3">
              <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.13em] text-circuit">
                <UserRound className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                Alumno
              </p>
            </div>
            <dl className="divide-y divide-border">
              <FilaDato etiqueta="Nombre y apellido">
                {alumno.nombre} {alumno.apellido}
              </FilaDato>
              <FilaDato etiqueta="DNI" mono>
                {alumno.dni}
              </FilaDato>
              <FilaDato etiqueta="Email">
                {alumno.email ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-tech-blue" strokeWidth={2} aria-hidden="true" />
                    <span className="truncate">{alumno.email}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-warning">
                    <MailX className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                    Sin email — entrega física
                  </span>
                )}
              </FilaDato>
            </dl>

            <div className="border-t border-border px-4 pt-3">
              <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.13em] text-circuit">
                <GraduationCap className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                Curso · {curso.fechas.length} jornadas presentes
              </p>
            </div>
            <ul className="divide-y divide-border px-4 py-1.5">
              {curso.fechas.map((f, i) => (
                <li key={f.fecha} className="flex items-baseline gap-3 py-2">
                  <span className="font-mono text-[12px] tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[12px] tabular-nums text-foreground">
                    {fmtCorta.format(parseISO(f.fecha))}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground">
                    {f.modulo}
                  </span>
                  <Check className="h-3.5 w-3.5 shrink-0 text-valid" strokeWidth={2.5} aria-hidden="true" />
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-4 pt-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.13em] text-circuit">
                Trazabilidad administrativa
              </p>
            </div>
            <dl className="divide-y divide-border">
              <FilaDato etiqueta="N.° de certificado" mono>
                {admin.numero}
              </FilaDato>
              <FilaDato etiqueta="Fecha de emisión" mono>
                {admin.emision}
              </FilaDato>
              <FilaDato etiqueta="Token (parcial)" mono>
                {admin.tokenParcial}
              </FilaDato>
              <FilaDato etiqueta="Estado de envío">
                {revocada ? (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Ban className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                    Suspendido
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-valid">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                    Enviado
                  </span>
                )}
              </FilaDato>
              <FilaDato etiqueta="Último envío" mono>
                {ultimoEnvio}
              </FilaDato>
            </dl>
          </Panel>

          {/* Acciones principales */}
          <Panel titulo="Acciones">
            <div className="space-y-2 p-4">
              <AccionBtn
                onClick={onDescargar}
                cargando={accion === "descargar"}
                disabled={revocada || accion !== null}
                variant="primary"
                icon={Download}
              >
                Descargar PDF
              </AccionBtn>
              <AccionBtn
                onClick={onReenviar}
                cargando={accion === "reenviar"}
                disabled={revocada || accion !== null || !alumno.email}
                icon={Send}
              >
                {ultimoEnvio ? "Reenviar certificado" : "Enviar por email"}
              </AccionBtn>
              <AccionBtn
                onClick={onRegenerar}
                cargando={accion === "regenerar"}
                disabled={revocada || accion !== null}
                icon={RefreshCw}
              >
                Regenerar PDF
              </AccionBtn>

              {revocada ? (
                <p className="flex items-start gap-2 pt-1 text-xs leading-relaxed text-muted-foreground">
                  <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" strokeWidth={2} aria-hidden="true" />
                  La certificación está revocada: las acciones de envío y
                  documento quedan deshabilitadas.
                </p>
              ) : (
                <p className="flex items-start gap-2 pt-1 text-xs leading-relaxed text-muted-foreground">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-tech-blue" strokeWidth={2} aria-hidden="true" />
                  El QR es permanente. Si se corrigen fechas o asistencias, se
                  debe reenviar el PDF al alumno con el mismo QR.
                </p>
              )}

              {aviso ? (
                <p
                  className="mt-1 flex items-start gap-2 rounded-sm border border-tech-blue/30 bg-accent px-3 py-2 text-xs leading-relaxed text-foreground"
                  role="status"
                >
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-tech-blue" strokeWidth={2} aria-hidden="true" />
                  {aviso}
                </p>
              ) : null}
            </div>
          </Panel>

          {/* Bloque QR / enlace de validación */}
          <Panel titulo="Enlace de validación">
            <div className="flex gap-4 p-4">
              <QrDecorativo className="h-24 w-24 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  Verificación pública
                </p>
                <p className="mt-1 break-all font-mono text-[12px] leading-relaxed text-foreground">
                  {VALIDACION_HOST}
                  <span className="text-tech-blue">{validarPath}</span>
                </p>
                <button
                  type="button"
                  onClick={copiarLink}
                  className="mt-2.5 inline-flex h-9 items-center gap-2 rounded-sm border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  aria-live="polite"
                >
                  {copiado ? (
                    <>
                      <Check className="h-4 w-4 text-valid" strokeWidth={2.5} aria-hidden="true" />
                      Enlace copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                      Copiar link
                    </>
                  )}
                </button>
              </div>
            </div>
            <p className="flex items-start gap-2 border-t border-border bg-secondary/50 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
              El QR no contiene datos personales; solo dirige a la validación
              oficial del certificado.
            </p>
          </Panel>

          {/* Zona de riesgo */}
          <Panel titulo="Zona de riesgo" tone="danger">
            <div className="p-4">
              {revocada ? (
                <div className="flex items-start gap-2.5">
                  <Ban className="mt-0.5 h-4 w-4 shrink-0 text-destructive" strokeWidth={2} aria-hidden="true" />
                  <p className="text-sm leading-relaxed text-foreground">
                    Esta certificación fue <span className="font-semibold text-destructive">revocada</span>.
                    Su verificación pública quedó invalidada de forma definitiva.
                  </p>
                </div>
              ) : confirmarRevoca ? (
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-foreground">
                    Revocar invalidará la verificación criptográfica del
                    certificado. <span className="font-medium">Esta acción no se puede deshacer.</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={onRevocar}
                      disabled={accion !== null}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-destructive px-4 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {accion === "revocar" ? (
                        <span className="h-4 w-4 motion-safe:animate-spin rounded-full border-2 border-destructive-foreground/40 border-t-destructive-foreground" aria-hidden="true" />
                      ) : (
                        <Ban className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                      )}
                      Confirmar revocación
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmarRevoca(false)}
                      disabled={accion !== null}
                      className="inline-flex h-10 items-center justify-center rounded-sm border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Revocar este certificado invalidará su verificación
                    criptográfica para siempre.
                  </p>
                  <button
                    type="button"
                    onClick={() => setConfirmarRevoca(true)}
                    className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-destructive/45 bg-card px-4 text-sm font-semibold text-destructive transition-colors hover:bg-destructive-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
                  >
                    <AlertTriangle className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                    Revocar certificación
                  </button>
                </>
              )}
            </div>
          </Panel>
        </div>

        {/* ---------------- Columna documento ---------------- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Vista previa oficial
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              Documento electrónico · IFTS 14
            </p>
          </div>

          {/* Documento (réplica institucional del PDF) */}
          <article className="overflow-hidden border border-border bg-card shadow-[0_1px_0_0_var(--border)]">
            {/* Encabezado navy */}
            <div className="relative overflow-hidden bg-ink px-5 py-6 text-ink-foreground sm:px-8">
              {revocada ? (
                <span
                  className="pointer-events-none absolute -right-1 top-1/2 -translate-y-1/2 select-none font-mono text-5xl font-bold tracking-tight text-destructive/25 sm:text-6xl"
                  aria-hidden="true"
                >
                  REVOCADO
                </span>
              ) : null}
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
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
                <div className="shrink-0 border border-white/15 bg-white/5 px-3.5 py-2.5 sm:text-right">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-foreground/55">
                    ID
                  </p>
                  <p className="font-mono text-sm font-semibold tabular-nums">
                    {admin.numero}
                  </p>
                  <p
                    className={`mt-1.5 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] ${
                      revocada ? "text-destructive" : "text-valid"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${revocada ? "bg-destructive" : "bg-valid"}`}
                      aria-hidden="true"
                    />
                    {revocada ? "Revocado" : "Vigente"}
                  </p>
                </div>
              </div>
            </div>

            {/* Banda de estado revocada (no depende solo del color) */}
            {revocada ? (
              <div className="flex items-start gap-3 border-b border-destructive/30 bg-destructive-soft px-5 py-3.5 sm:px-8">
                <Ban className="mt-0.5 h-4 w-4 shrink-0 text-destructive" strokeWidth={2} aria-hidden="true" />
                <p className="text-[13px] leading-relaxed text-foreground">
                  <span className="font-semibold text-destructive">Certificación revocada.</span>{" "}
                  El documento carece de validez legal y académica.
                </p>
              </div>
            ) : null}

            {/* Declaración + protagonista */}
            <div className="px-5 py-6 text-center sm:px-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Certifica que
              </p>
              <p className="mt-3 text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
                {alumno.nombre} {alumno.apellido}
              </p>
              <p className="mt-1.5 font-mono text-sm text-muted-foreground">
                DNI {alumno.dni}
              </p>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-foreground">
                cumplió con la asistencia registrada y auditada en el curso{" "}
                <span className="font-semibold">{curso.nombre}</span>,
                correspondiente al ciclo {curso.ciclo}.
              </p>
            </div>

            {/* Registro de asistencia auditado */}
            <div className="border-t border-border px-5 py-5 sm:px-8">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[11px] tracking-[0.15em] text-circuit">
                  I. REGISTRO DE ASISTENCIA AUDITADO
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {curso.fechas.length} jornadas · {cargaTotal} h
                </p>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[32rem] border-collapse">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="w-10 py-2 font-mono text-[11px] font-medium tracking-wide text-muted-foreground">SEQ</th>
                      <th className="py-2 pr-4 font-mono text-[11px] font-medium tracking-wide text-muted-foreground">FECHA</th>
                      <th className="py-2 pr-4 font-mono text-[11px] font-medium tracking-wide text-muted-foreground">MÓDULO</th>
                      <th className="py-2 pr-4 font-mono text-[11px] font-medium tracking-wide text-muted-foreground">CARGA</th>
                      <th className="py-2 text-right font-mono text-[11px] font-medium tracking-wide text-muted-foreground">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curso.fechas.map((f, i) => (
                      <tr key={f.fecha} className="border-b border-border/60">
                        <td className="py-2.5 font-mono text-[13px] text-muted-foreground">{String(i + 1).padStart(3, "0")}</td>
                        <td className="py-2.5 pr-4 font-mono text-[13px] tabular-nums text-foreground">{fmtCorta.format(parseISO(f.fecha))}</td>
                        <td className="py-2.5 pr-4 text-[13px] text-foreground">{f.modulo}</td>
                        <td className="py-2.5 pr-4 font-mono text-[13px] tabular-nums text-muted-foreground">{f.carga} h</td>
                        <td className="py-2.5 text-right">
                          <span className="inline-flex items-center gap-1 font-mono text-[12px] font-medium text-valid">
                            <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                            Presente
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Autoridades firmantes (solo lectura, desde Configuración institucional) */}
            <div className="border-t border-border px-5 py-5 sm:px-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-[11px] tracking-[0.15em] text-circuit">
                  II. AUTORIDADES FIRMANTES
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-secondary px-2 py-1 text-[11px] text-muted-foreground">
                  <Lock className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
                  Firmas y autoridades desde Configuración institucional
                </span>
              </div>
              <div className="mt-4 grid gap-x-10 gap-y-6 sm:grid-cols-2">
                {[CONFIG_INSTITUCIONAL.rectora, CONFIG_INSTITUCIONAL.asesora].map((firma) => (
                  <div key={firma.cargo}>
                    <div className="flex h-12 items-end gap-2 border-b border-border pb-1">
                      <ShieldCheck className="h-5 w-5 text-tech-blue/70" strokeWidth={1.5} aria-hidden="true" />
                      <span className="font-mono text-[11px] italic text-muted-foreground">
                        Firma digital verificada
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-foreground">{firma.nombre}</p>
                    <p className="text-xs text-muted-foreground">{firma.cargo}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trazabilidad: QR + validación */}
            <div className="flex flex-col gap-5 border-t border-border bg-secondary/50 px-5 py-5 sm:flex-row sm:items-center sm:px-8">
              <QrDecorativo className="h-24 w-24" />
              <div className="min-w-0 flex-1">
                <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  <div>
                    <dt className="font-mono text-[11px] tracking-wide text-muted-foreground">N.° de certificado</dt>
                    <dd className="mt-0.5 font-mono text-[13px] font-medium text-foreground">{admin.numero}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[11px] tracking-wide text-muted-foreground">Verificación</dt>
                    <dd className="mt-0.5 break-all font-mono text-[13px] font-medium text-foreground">
                      {VALIDACION_HOST}{validarPath}
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 border-l-2 border-circuit pl-3 text-xs leading-relaxed text-muted-foreground">
                  El QR permanente dirige a la validación oficial y no contiene
                  datos personales.
                </p>
              </div>
            </div>
          </article>

          {/* Historial / registro de auditoría */}
          <Panel titulo="Registro de auditoría">
            <ol className="px-4 py-3">
              {historial.map((ev, i) => {
                const Icono = ICONO_EVENTO[ev.tipo]
                const ultimo = i === historial.length - 1
                const esRevoca = ev.tipo === "revocada"
                return (
                  <li key={`${ev.tipo}-${ev.sello}-${i}`} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                          esRevoca
                            ? "border-destructive/30 bg-destructive-soft text-destructive"
                            : "border-border bg-secondary text-muted-foreground"
                        }`}
                        aria-hidden="true"
                      >
                        <Icono className="h-3.5 w-3.5" strokeWidth={2} />
                      </span>
                      {!ultimo ? <span className="my-1 w-px flex-1 bg-border" aria-hidden="true" /> : null}
                    </div>
                    <div className={`min-w-0 ${ultimo ? "pb-1" : "pb-4"}`}>
                      <p className="font-mono text-[11px] tabular-nums text-muted-foreground">{ev.sello}</p>
                      <p className={`mt-0.5 text-[13px] leading-relaxed ${esRevoca ? "text-destructive" : "text-foreground"}`}>
                        {ev.detalle}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </Panel>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Subcomponentes
 * ------------------------------------------------------------------ */

function EstadoBadge({ revocada }: { revocada: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 rounded-sm border px-3 py-1.5 text-sm font-semibold ${
        revocada
          ? "border-destructive/30 bg-destructive-soft text-destructive"
          : "border-valid/30 bg-valid-soft text-valid"
      }`}
    >
      {revocada ? (
        <Ban className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
      ) : (
        <ShieldCheck className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
      )}
      {revocada ? "Revocada" : "Válida"}
    </span>
  )
}

function AccionBtn({
  children,
  onClick,
  icon: Icon,
  cargando = false,
  disabled = false,
  variant = "secondary",
}: {
  children: React.ReactNode
  onClick: () => void
  icon: typeof Download
  cargando?: boolean
  disabled?: boolean
  variant?: "primary" | "secondary"
}) {
  const base =
    "inline-flex h-10 w-full items-center justify-center gap-2 rounded-sm px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-45"
  const styles =
    variant === "primary"
      ? "bg-ink text-ink-foreground hover:bg-ink/90 focus-visible:ring-ring/50"
      : "border border-border bg-card text-foreground hover:bg-secondary focus-visible:ring-ring/40"
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {cargando ? (
        <span
          className={`h-4 w-4 motion-safe:animate-spin rounded-full border-2 ${
            variant === "primary"
              ? "border-ink-foreground/30 border-t-ink-foreground"
              : "border-muted-foreground/30 border-t-foreground"
          }`}
          aria-hidden="true"
        />
      ) : (
        <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      )}
      {children}
    </button>
  )
}
