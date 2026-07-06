"use client"

import {
  LayoutGrid,
  BookOpen,
  Users,
  CalendarCheck,
  QrCode,
  Settings,
  LogOut,
  X,
} from "lucide-react"

const navItems = [
  { label: "Inicio", icon: LayoutGrid },
  { label: "Cursos", icon: BookOpen },
  { label: "Alumnos", icon: Users },
  { label: "Asistencias", icon: CalendarCheck },
  { label: "Certificaciones", icon: QrCode },
]

export function SidebarAdmin({
  onClose,
  active = "Inicio",
}: {
  onClose?: () => void
  active?: string
}) {
  return (
    <div className="flex h-full flex-col bg-ink text-ink-foreground">
      {/* Marca institucional */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center"
          aria-hidden="true"
        >
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="6" height="6" fill="currentColor" />
            <rect x="12" y="2" width="6" height="6" fill="var(--circuit)" />
            <rect x="2" y="12" width="6" height="6" fill="var(--circuit)" />
            <rect x="12" y="12" width="6" height="6" fill="currentColor" />
          </svg>
        </div>
        <div className="min-w-0 leading-tight">
          <p className="font-mono text-sm font-semibold">IFTS N.&deg; 14</p>
          <p className="text-xs text-white/55">Bedel&iacute;a &middot; Panel</p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Cerrar men&uacute;"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegaci&oacute;n principal">
        <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          Operaci&oacute;n
        </p>
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.label === active
            return (
              <li key={item.label}>
                <a
                  href="#"
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? "bg-white/10 font-medium text-white"
                      : "text-white/65 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {isActive ? (
                    <span
                      className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 bg-circuit"
                      aria-hidden="true"
                    />
                  ) : null}
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Pie de sidebar */}
      <div className="border-t border-white/10 px-3 py-3">
        <ul className="flex flex-col gap-0.5">
          <li>
            <a
              href="/admin/configuracion"
              aria-current={active === "Configuración" ? "page" : undefined}
              className={`relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                active === "Configuración"
                  ? "bg-white/10 font-medium text-white"
                  : "text-white/65 hover:bg-white/5 hover:text-white"
              }`}
            >
              {active === "Configuración" ? (
                <span
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 bg-circuit"
                  aria-hidden="true"
                />
              ) : null}
              <Settings className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              Configuraci&oacute;n
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-white/65 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              Cerrar sesi&oacute;n
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}
