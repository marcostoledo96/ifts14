import type { Metadata } from "next"
import { AdminShell } from "@/components/admin/admin-shell"
import { AlumnoDetalle } from "@/components/admin/alumno-detalle"

export const metadata: Metadata = {
  title: "Legajo del alumno · Bedelía",
  description:
    "Legajo académico del alumno: datos personales, cursos con asistencias presentes y estado de sus certificaciones en el IFTS N.° 14.",
}

export default function AlumnoDetallePage() {
  return (
    <AdminShell active="Alumnos">
      <AlumnoDetalle />
    </AdminShell>
  )
}
