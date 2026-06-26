import type { Metadata } from "next"
import { LoginForm } from "@/components/admin/login-form"

export const metadata: Metadata = {
  title: "Panel de certificaciones — Acceso · IFTS N.° 14",
  description:
    "Acceso exclusivo para personal autorizado del sistema de gestión de certificaciones del IFTS N.° 14.",
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col lg:flex-row">
      {/* Panel institucional — contexto y confianza */}
      <aside className="relative flex flex-col justify-between overflow-hidden bg-ink px-6 py-8 text-ink-foreground sm:px-10 lg:w-[42%] lg:max-w-xl lg:py-12">
        {/* Marca */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/15 bg-white/5"
            aria-hidden="true"
          >
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="6" height="6" fill="currentColor" />
              <rect x="12" y="2" width="6" height="6" fill="var(--circuit)" />
              <rect x="2" y="12" width="6" height="6" fill="var(--circuit)" />
              <rect x="12" y="12" width="6" height="6" fill="currentColor" />
            </svg>
          </div>
          <div className="leading-tight">
            <p className="font-mono text-base font-semibold tracking-tight">
              IFTS N.&deg; 14
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">
              Bedel&iacute;a Digital
            </p>
          </div>
        </div>

        {/* Mensaje institucional */}
        <div className="relative z-10 hidden max-w-md lg:block">
          <div className="mb-5 h-px w-12 bg-circuit" aria-hidden="true" />
          <h1 className="text-pretty font-mono text-2xl font-semibold leading-snug tracking-tight xl:text-3xl">
            Sistema de gesti&oacute;n de certificaciones acad&eacute;micas
          </h1>
          <p className="mt-4 max-w-sm text-pretty text-sm leading-relaxed text-white/60">
            Mesa de trabajo para administrar cursos, asistencias y la emisi&oacute;n
            de certificados verificables del instituto.
          </p>
        </div>

        {/* Estado del sistema */}
        <dl className="relative z-10 hidden gap-px overflow-hidden border border-white/10 lg:grid">
          <div className="flex items-center justify-between bg-white/[0.03] px-4 py-2.5">
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/45">
              Estado del sistema
            </dt>
            <dd className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-circuit">
              <span className="h-1.5 w-1.5 rounded-full bg-circuit" aria-hidden="true" />
              Activo
            </dd>
          </div>
          <div className="flex items-center justify-between bg-white/[0.03] px-4 py-2.5">
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/45">
              Protocolo
            </dt>
            <dd className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/70">
              SHA-256 / SSL
            </dd>
          </div>
        </dl>

        {/* Textura técnica sutil */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(var(--ink-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--ink-foreground) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </aside>

      {/* Columna de acceso */}
      <section className="relative flex flex-1 items-center justify-center bg-paper px-5 py-10 sm:px-8">
        {/* Plano técnico de fondo */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 80%)",
          }}
        />

        <div className="relative z-10 w-full max-w-md">
          <div className="border border-border bg-card px-6 py-8 shadow-sm sm:px-9 sm:py-10">
            <header className="mb-7">
              <h2 className="text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground">
                Panel de certificaciones
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Acceso exclusivo para personal autorizado.
              </p>
              <div className="mt-6 h-px w-full bg-border" aria-hidden="true" />
            </header>

            <LoginForm />
          </div>

          {/* Footer discreto */}
          <footer className="mt-6 flex flex-col items-center gap-1 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
              Acceso restringido &middot; Bedel&iacute;a IFTS N.&deg; 14
            </p>
            <p className="text-xs text-muted-foreground/70">
              &copy; {new Date().getFullYear()} &middot; Instituto de
              Formaci&oacute;n T&eacute;cnica Superior N.&deg; 14
            </p>
          </footer>
        </div>
      </section>
    </main>
  )
}
