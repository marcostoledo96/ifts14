"use client"

import { useState, type ReactNode } from "react"
import { Menu, Search, Bell, HelpCircle } from "lucide-react"
import { SidebarAdmin } from "./sidebar-admin"

export function AdminShell({
  children,
  active = "Inicio",
}: {
  children: ReactNode
  active?: string
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {/* Sidebar fijo (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <SidebarAdmin active={active} />
      </aside>

      {/* Drawer (mobile) */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar men&uacute;"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-ink/60"
          />
          <div className="absolute inset-y-0 left-0 w-64 shadow-xl">
            <SidebarAdmin active={active} onClose={() => setMenuOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-foreground transition-colors hover:bg-secondary lg:hidden"
              aria-label="Abrir men&uacute;"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </button>

            <label className="relative hidden max-w-md flex-1 items-center sm:flex">
              <Search
                className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground"
                strokeWidth={1.75}
              />
              <span className="sr-only">Buscar curso, alumno o certificado</span>
              <input
                type="search"
                placeholder="Buscar curso, alumno o certificado&hellip;"
                className="h-9 w-full rounded-sm border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>

            <div className="ml-auto flex items-center gap-2">
              <span className="mr-1 hidden items-center gap-2 md:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-valid" aria-hidden="true" />
                <span className="font-mono text-xs text-muted-foreground">
                  Sincronizado 10:42
                </span>
              </span>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Ayuda"
              >
                <HelpCircle className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Notificaciones"
              >
                <Bell className="h-5 w-5" strokeWidth={1.75} />
                <span
                  className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-warning ring-2 ring-card"
                  aria-hidden="true"
                />
              </button>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-ink font-mono text-xs font-semibold text-ink-foreground"
                aria-hidden="true"
              >
                MP
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  )
}
