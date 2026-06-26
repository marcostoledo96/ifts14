import type { Metadata } from "next"
import { AdminShell } from "@/components/admin/admin-shell"
import { CursoEditor } from "@/components/admin/curso-editor"

export const metadata: Metadata = {
  title: "Editar curso — Bedelía IFTS N.° 14",
  description:
    "Editá los datos del curso y administrá sus fechas, base de las asistencias y certificaciones.",
}

export default function EditarCursoPage() {
  return (
    <AdminShell active="Cursos">
      <CursoEditor modo="editar" />
    </AdminShell>
  )
}
