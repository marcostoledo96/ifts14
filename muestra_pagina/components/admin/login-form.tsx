"use client"

import { useId, useRef, useState } from "react"
import {
  IdCard,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from "lucide-react"

type Status = "idle" | "loading" | "error"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<Status>("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const emailId = useId()
  const passwordId = useId()
  const errorId = useId()
  const errorRef = useRef<HTMLDivElement>(null)

  const isLoading = status === "loading"
  const isError = status === "error"

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isLoading) return

    const form = e.currentTarget
    const data = new FormData(form)
    const email = String(data.get("email") ?? "").trim()
    const password = String(data.get("password") ?? "")

    // Validación local mínima antes de "enviar"
    if (!email || !password) {
      setStatus("error")
      setErrorMessage(
        "Completá tu ID institucional y tu clave de acceso para continuar.",
      )
      queueMicrotask(() => errorRef.current?.focus())
      return
    }

    setStatus("loading")
    setErrorMessage("")

    // Simulación de verificación contra el sistema de auditoría.
    // En Angular, reemplazar por la llamada real al backend.
    await new Promise((resolve) => setTimeout(resolve, 1400))

    // Demo: credencial de prueba válida; el resto devuelve error.
    const ok =
      email.toLowerCase() === "usuario.demo@example.invalid" && password === "demo"

    if (ok) {
      // Acceso correcto: aquí se redirige al panel.
      setStatus("idle")
      window.location.href = "/admin/dashboard"
      return
    }

    setStatus("error")
    setErrorMessage(
      "Las credenciales no coinciden con un registro autorizado. Verificá los datos e intentá nuevamente.",
    )
    queueMicrotask(() => errorRef.current?.focus())
  }

  return (
    <form className="w-full" onSubmit={handleSubmit} noValidate>
      <fieldset
        className="flex flex-col gap-5 disabled:opacity-100"
        disabled={isLoading}
      >
        <legend className="sr-only">Acceso al panel de certificaciones</legend>

        {/* Alerta de error a nivel formulario */}
        {isError && (
          <div
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="flex items-start gap-2.5 border-l-2 border-destructive bg-destructive-soft px-3.5 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
          >
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <p className="text-xs leading-relaxed text-destructive">
              {errorMessage}
            </p>
          </div>
        )}

        {/* ID institucional o email */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor={emailId}
            className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground"
          >
            ID institucional o email
          </label>
          <div className="relative">
            <IdCard
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <input
              id={emailId}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              required
              aria-invalid={isError}
              aria-describedby={isError ? errorId : undefined}
              placeholder="usuario.demo@example.invalid"
              className="h-11 w-full rounded-sm border border-input bg-secondary/40 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-ring focus:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 aria-[invalid=true]:border-destructive/70 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Clave de acceso */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor={passwordId}
            className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground"
          >
            Clave de acceso
          </label>
          <div className="relative">
            <KeyRound
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <input
              id={passwordId}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              aria-invalid={isError}
              aria-describedby={isError ? errorId : undefined}
              placeholder="Ingres&aacute; tu clave"
              className="h-11 w-full rounded-sm border border-input bg-secondary/40 pl-10 pr-11 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-ring focus:bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 aria-[invalid=true]:border-destructive/70 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
              aria-label={showPassword ? "Ocultar clave" : "Mostrar clave"}
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>

        {/* Aviso de auditoría */}
        <div
          className="flex items-start gap-2.5 border-l-2 border-circuit bg-accent px-3.5 py-3"
          role="note"
        >
          <ShieldCheck
            className="mt-0.5 h-4 w-4 shrink-0 text-tech-blue"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <p className="text-xs leading-relaxed text-accent-foreground">
            Todas las acciones administrativas quedan registradas.
          </p>
        </div>

        {/* Acción principal */}
        <button
          type="submit"
          aria-busy={isLoading}
          className="group flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-ink px-5 text-sm font-medium tracking-wide text-ink-foreground transition-all hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-80"
        >
          {isLoading ? (
            <>
              <Loader2
                className="h-4 w-4 animate-spin"
                strokeWidth={2}
                aria-hidden="true"
              />
              Verificando&hellip;
            </>
          ) : (
            <>
              Ingresar
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
                aria-hidden="true"
              />
            </>
          )}
        </button>

        {/* Estado en vivo para lectores de pantalla */}
        <p id={errorId} className="sr-only" role="status" aria-live="polite">
          {isLoading
            ? "Verificando credenciales con el sistema."
            : isError
              ? errorMessage
              : ""}
        </p>

        {/* Ayuda sobria, sin flujo de recuperación */}
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          &iquest;Problemas para ingresar? Comunicate con la Coordinaci&oacute;n
          Acad&eacute;mica.
        </p>
      </fieldset>
    </form>
  )
}
