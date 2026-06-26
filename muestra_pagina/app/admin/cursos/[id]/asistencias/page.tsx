import type { Metadata } from "next"
import { AdminShell } from "@/components/admin/admin-shell"
import { AsistenciasEditor } from "@/components/admin/asistencias-editor"

export const metadata: Metadata = {
  title: "Asistencias del curso · Bedelía",
  description:
    "Registro de presentes por fecha de cursada para el sistema de certificación del IFTS N.° 14.",
}

export default function AsistenciasPage() {
  return (
    <AdminShell active="Cursos">
      <AsistenciasEditor />
    </AdminShell>
  )
}
