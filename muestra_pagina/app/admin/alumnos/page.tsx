import type { Metadata } from "next"
import { AdminShell } from "@/components/admin/admin-shell"
import { ListaAlumnos } from "@/components/admin/lista-alumnos"

export const metadata: Metadata = {
  title: "Alumnos | Gestión Académica IFTS N.° 14",
  description:
    "Registro académico de alumnos: búsqueda por nombre o DNI, trayectoria de cursada y certificaciones válidas.",
}

export default function AlumnosPage() {
  return (
    <AdminShell active="Alumnos">
      <ListaAlumnos />
    </AdminShell>
  )
}
