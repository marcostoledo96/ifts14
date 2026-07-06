"use client"

import { useEffect, useRef, useState } from "react"
import {
  X,
  AlertTriangle,
  UserRound,
  Hash,
  GraduationCap,
  FileCheck2,
  ShieldOff,
  History,
  Info,
} from "lucide-react"

/* ------------------------------------------------------------------ *
 * Revocar certificación — acción crítica institucional de Bedelía.
 *
 * Cambia el estado público de la certificación: la validación por QR
 * pasará a mostrar "revocada". Requiere motivo obligatorio y una
 * confirmación explícita. La acción peligrosa está separada del resto
 * y usa un rojo documental, no alarmista.
 *
 * Modelo mock. En el port a Angular 20 se reemplaza por el resolver
 * del expediente + service de revocación. No se usan APIs propias de
 * Next.js: la navegación es <a href> / window.location para portar
 * directo. No se muestran fechas como vigentes.
 * ------------------------------------------------------------------ */

type Certificado = {
  numero: string
  alumno: { nombre: string; apellido: string; dni: string }
  curso: { nombre: string; ciclo: string }
}

/* Datos de ejemplo. El id llega por ruta y, en Angular, alimenta el
 * resolver que devuelve este mismo shape. */
const CERTIFICADO: Certificado = {
  numero: "IFTS14-CUR-2024-0031",
  alumno: { nombre: "Persona", apellido: "Ficticia", dni: "DNI-FICTICIO-003" },
  curso: {
    nombre: "Desarrollo de Sistemas Web III",
    ciclo: "2024 · 2.º cuatrimestre",
  },
}

const MOTIVO_MIN = 12
const MOTIVO_MAX = 400

/* Fila de la ficha de datos ------------------------------------------ */
function Dato({
  icon: Icon,
  etiqueta,
  children,
  mono = false,
}: {
  icon: typeof UserRound
  etiqueta: string
  children: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0 text-circuit"
        strokeWidth={2}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <dt className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-muted-foreground">
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
    </div>
  )
}

/* ------------------------------------------------------------------ */

export function RevocarCertificacion({ id }: { id: string }) {
  const cert = CERTIFICADO
  const { alumno, curso, numero } = cert

  const volverHref = `/admin/certificaciones/${id}`

  const [motivo, setMotivo] = useState("")
  const [confirmado, setConfirmado] = useState(false)
  const [intentado, setIntentado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const dialogRef = useRef<HTMLDivElement>(null)
  const motivoRef = useRef<HTMLTextAreaElement>(null)

  const motivoValido = motivo.trim().length >= MOTIVO_MIN
  const puedeRevocar = motivoValido && confirmado && !enviando

  const motivoError =
    intentado && !motivoValido
      ? motivo.trim().length === 0
        ? "Ingresá el motivo de la revocación."
        : `Detallá el motivo con al menos ${MOTIVO_MIN} caracteres.`
      : ""
  const confirmError = intentado && !confirmado

  /* Cierre con Escape → vuelve al expediente. Portable a Angular. */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") window.location.assign(volverHref)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [volverHref])

  useEffect(() => {
    dialogRef.current?.focus()
  }, [])

  async function onRevocar() {
    setIntentado(true)
    if (!motivoValido) {
      motivoRef.current?.focus()
      return
    }
    if (!confirmado) return
    setEnviando(true)
    /* mock; en Angular es el service de revocación + registro de auditoría. */
    await new Promise((r) => setTimeout(r, 900))
    setEnviando(false)
    window.location.assign(`${volverHref}?revocada=1`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop — el expediente queda detrás, atenuado */}
      <a
        href={volverHref}
        aria-label="Cerrar y volver al expediente"
        className="absolute inset-0 bg-ink/60 backdrop-blur-[2px] transition-opacity motion-reduce:transition-none"
      />

      {/* Diálogo */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="revocar-titulo"
        aria-describedby="revocar-desc"
        tabIndex={-1}
        className="relative z-10 flex max-h-[100dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl border border-border bg-card shadow-2xl outline-none sm:rounded-xl"
      >
        {/* Franja superior documental roja (separa la acción crítica) */}
        <div className="h-1 w-full bg-destructive" aria-hidden="true" />

        {/* Encabezado */}
        <header className="flex items-start gap-3 border-b border-border px-5 py-4">
          <span
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-destructive-soft text-destructive"
            aria-hidden="true"
          >
            <AlertTriangle className="h-5 w-5" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-destructive">
              Bedelía · Acción crítica
            </p>
            <h1
              id="revocar-titulo"
              className="text-balance text-lg font-semibold tracking-tight text-foreground"
            >
              Revocar certificación
            </h1>
          </div>
          <a
            href={volverHref}
            aria-label="Cerrar"
            className="-mr-1.5 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </a>
        </header>

        {/* Cuerpo desplazable */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Advertencia principal */}
          <p
            id="revocar-desc"
            className="border-l-2 border-destructive bg-destructive-soft/60 px-5 py-3 text-sm leading-relaxed text-foreground"
          >
            Esta acción cambiará el estado público de la certificación. La
            validación por QR mostrará que fue revocada.
          </p>

          {/* Ficha del certificado */}
          <section className="px-5 pt-4">
            <h2 className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
              Certificado a revocar
            </h2>
            <dl className="mt-2 divide-y divide-border rounded-md border border-border bg-secondary/40">
              <Dato icon={UserRound} etiqueta="Alumno">
                {alumno.apellido}, {alumno.nombre}
              </Dato>
              <Dato icon={Hash} etiqueta="DNI" mono>
                {alumno.dni}
              </Dato>
              <Dato icon={GraduationCap} etiqueta="Curso">
                {curso.nombre}
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                  {curso.ciclo}
                </span>
              </Dato>
              <Dato icon={FileCheck2} etiqueta="N.° de certificado" mono>
                {numero}
              </Dato>
            </dl>
          </section>

          {/* Motivo obligatorio */}
          <section className="px-5 pt-4">
            <div className="flex items-baseline justify-between gap-3">
              <label
                htmlFor="motivo-revocacion"
                className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground"
              >
                Motivo de la revocación{" "}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </label>
              <span
                className={`font-mono text-[10.5px] tabular-nums ${
                  motivo.length > MOTIVO_MAX
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {motivo.length}/{MOTIVO_MAX}
              </span>
            </div>
            <textarea
              id="motivo-revocacion"
              ref={motivoRef}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value.slice(0, MOTIVO_MAX))}
              rows={3}
              maxLength={MOTIVO_MAX}
              required
              aria-required="true"
              aria-invalid={!!motivoError}
              aria-describedby={motivoError ? "motivo-error" : "motivo-help"}
              placeholder="Ingresá el motivo técnico o administrativo detallado (por ejemplo: error de carga de calificaciones, curso reprogramado, duplicado)."
              className={`mt-2 block w-full resize-y rounded-md border bg-card px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-card ${
                motivoError
                  ? "border-destructive focus-visible:ring-destructive/40"
                  : "border-input focus-visible:ring-ring/40"
              }`}
            />
            {motivoError ? (
              <p
                id="motivo-error"
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-destructive"
              >
                <Info className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
                {motivoError}
              </p>
            ) : (
              <p id="motivo-help" className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                Quedará asociado al registro de auditoría. Sé específico: este
                texto respalda la decisión institucional.
              </p>
            )}
          </section>

          {/* Confirmación explícita */}
          <section className="px-5 pb-1 pt-4">
            <label
              htmlFor="confirmo-revocacion"
              className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${
                confirmError
                  ? "border-destructive bg-destructive-soft/50"
                  : confirmado
                    ? "border-destructive/40 bg-destructive-soft/40"
                    : "border-border bg-secondary/40 hover:bg-secondary"
              }`}
            >
              <input
                id="confirmo-revocacion"
                type="checkbox"
                checked={confirmado}
                onChange={(e) => setConfirmado(e.target.checked)}
                aria-describedby={confirmError ? "confirmo-error" : undefined}
                className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer rounded-sm border-input text-destructive accent-[var(--destructive)] focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
              />
              <span className="text-sm leading-relaxed text-foreground">
                Entiendo que esta certificación dejará de mostrarse como válida.
              </span>
            </label>
            {confirmError && (
              <p
                id="confirmo-error"
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-destructive"
              >
                <Info className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
                Marcá la casilla para poder revocar.
              </p>
            )}
          </section>

          {/* Aviso de auditoría */}
          <section className="px-5 py-4">
            <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-muted-foreground">
              <History className="mt-0.5 h-3.5 w-3.5 shrink-0 text-circuit" strokeWidth={2} aria-hidden="true" />
              La acción quedará registrada en auditoría con tu usuario, la fecha
              y hora, y el motivo ingresado.
            </p>
          </section>
        </div>

        {/* Pie de acciones — la acción peligrosa va separada, a la derecha */}
        <footer className="flex flex-col-reverse gap-2 border-t border-border bg-secondary/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
          <a
            href={volverHref}
            className="inline-flex h-11 items-center justify-center rounded-sm border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:min-w-[7rem]"
          >
            Cancelar
          </a>
          <button
            type="button"
            onClick={onRevocar}
            disabled={enviando}
            aria-disabled={!puedeRevocar}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-sm px-5 text-sm font-semibold transition-[background-color,opacity,transform] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-card active:translate-y-px motion-reduce:active:translate-y-0 ${
              puedeRevocar
                ? "bg-destructive text-primary-foreground hover:bg-destructive/90 focus-visible:ring-destructive/50"
                : "cursor-not-allowed bg-destructive/40 text-primary-foreground/80 focus-visible:ring-destructive/30"
            }`}
          >
            {enviando ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Revocando…
              </>
            ) : (
              <>
                <ShieldOff className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                Revocar certificación
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  )
}
