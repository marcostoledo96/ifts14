import type { Metadata } from "next"
import { AdminShell } from "@/components/admin/admin-shell"
import { CursoEditor } from "@/components/admin/curso-editor"

export const metadata: Metadata = {
  title: "Nuevo curso — Bedelía IFTS N.° 14",
  description:
    "Alta de un curso y carga de sus fechas, base de las asistencias y certificaciones.",
}

export default function NuevoCursoPage() {
  return (
    <AdminShell active="Cursos">
      <CursoEditor modo="nuevo" />
    </AdminShell>
  )
}
