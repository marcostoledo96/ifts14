import type { Metadata } from "next"
import { AdminShell } from "@/components/admin/admin-shell"
import { ListaCursos } from "@/components/admin/lista-cursos"

export const metadata: Metadata = {
  title: "Cursos — Bedelía IFTS N.° 14",
  description:
    "Archivo académico: gestión de cursos, fechas de cursada, asistencias y certificaciones emitidas del Instituto de Formación Técnica Superior N.° 14.",
}

export default function CursosPage() {
  return (
    <AdminShell active="Cursos">
      <ListaCursos />
    </AdminShell>
  )
}
