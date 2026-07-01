import type { Metadata } from "next"
import { AdminShell } from "@/components/admin/admin-shell"
import { CursoDetalle } from "@/components/admin/curso-detalle"

export const metadata: Metadata = {
  title: "Detalle del curso · Bedelía",
  description:
    "Ficha del curso: estado, fechas de cursada y asistencias cargadas para el sistema de certificación del IFTS N.° 14.",
}

export default function CursoDetallePage() {
  return (
    <AdminShell active="Cursos">
      <CursoDetalle />
    </AdminShell>
  )
}
