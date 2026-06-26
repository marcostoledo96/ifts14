import type { Metadata } from "next"
import { AdminShell } from "@/components/admin/admin-shell"
import { AccionesPrincipales } from "@/components/admin/acciones-principales"
import { ResumenOperativo } from "@/components/admin/resumen-operativo"
import { BandejaPendientes } from "@/components/admin/bandeja-pendientes"
import { ActividadReciente } from "@/components/admin/actividad-reciente"

export const metadata: Metadata = {
  title: "Panel de certificaciones — Bedelía IFTS N.° 14",
  description:
    "Gestión de cursos, asistencias y certificados con QR del Instituto de Formación Técnica Superior N.° 14.",
}

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <div className="space-y-8">
        {/* Encabezado */}
        <div>
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Panel de certificaciones
          </h1>
          <p className="mt-1 text-pretty text-sm text-muted-foreground">
            Gesti&oacute;n de cursos, asistencias y certificados con QR.
          </p>
        </div>

        {/* Acciones principales — protagonistas */}
        <AccionesPrincipales />

        {/* Bandeja de trabajo: pendientes en foco */}
        <BandejaPendientes />

        {/* Registro de actividad */}
        <ActividadReciente />

        {/* Resumen operativo — contexto, sin protagonismo */}
        <div className="space-y-2">
          <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Resumen operativo
          </h2>
          <ResumenOperativo />
        </div>
      </div>
    </AdminShell>
  )
}
