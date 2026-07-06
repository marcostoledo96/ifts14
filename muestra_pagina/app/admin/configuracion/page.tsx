import type { Metadata } from "next"
import { AdminShell } from "@/components/admin/admin-shell"
import { ConfiguracionInstitucional } from "@/components/admin/configuracion-institucional"

export const metadata: Metadata = {
  title: "Configuración institucional — Bedelía IFTS N.° 14",
  description:
    "Datos globales que se aplican a los certificados emitidos por el sistema: identidad, autoridades, firmas y validación pública.",
}

export default function ConfiguracionPage() {
  return (
    <AdminShell active="Configuración">
      <ConfiguracionInstitucional />
    </AdminShell>
  )
}
