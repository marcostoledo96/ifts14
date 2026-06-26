"use client"

import { useState } from "react"
import { HeaderInstitucional } from "@/components/validacion/header-institucional"
import { FooterInstitucional } from "@/components/validacion/footer-institucional"
import { EstadoRevocada } from "@/components/validacion/estado-revocada"
import { EstadoNoEncontrada } from "@/components/validacion/estado-no-encontrada"
import { EstadoError } from "@/components/validacion/estado-error"

type Estado = "revocada" | "no-encontrada" | "error"

const opciones: { id: Estado; etiqueta: string }[] = [
  { id: "revocada", etiqueta: "Revocada" },
  { id: "no-encontrada", etiqueta: "No encontrada" },
  { id: "error", etiqueta: "Error t\u00e9cnico" },
]

export default function EstadosValidacionPage() {
  const [estado, setEstado] = useState<Estado>("revocada")

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <HeaderInstitucional />

      {/* Control de demostración (no forma parte del documento) */}
      <div className="border-b border-border bg-secondary">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-mono text-[11px] tracking-wide text-muted-foreground">
            VISTA DE ESTADOS &middot; /validar/:tokenCertificacion
          </p>
          <div
            className="inline-flex w-full overflow-hidden border border-border bg-card sm:w-auto"
            role="tablist"
            aria-label="Estados de validaci\u00f3n"
          >
            {opciones.map((o) => {
              const activo = estado === o.id
              return (
                <button
                  key={o.id}
                  type="button"
                  role="tab"
                  aria-selected={activo}
                  onClick={() => setEstado(o.id)}
                  className={`flex-1 whitespace-nowrap px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:flex-none ${
                    activo
                      ? "bg-ink text-ink-foreground"
                      : "bg-card text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {o.etiqueta}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {estado === "revocada" && <EstadoRevocada />}
        {estado === "no-encontrada" && <EstadoNoEncontrada />}
        {estado === "error" && <EstadoError />}
      </main>

      <FooterInstitucional />
    </div>
  )
}
