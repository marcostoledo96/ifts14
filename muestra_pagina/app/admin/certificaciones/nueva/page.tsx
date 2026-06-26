import { AdminShell } from "@/components/admin/admin-shell"
import { NuevaCertificacionEditor } from "@/components/admin/nueva-certificacion-editor"

export const metadata = {
  title: "Nueva certificación · IFTS N.° 14",
  description:
    "Emisión de certificados complementarios — Bedelía, IFTS N.° 14.",
}

export default function NuevaCertificacionPage() {
  return (
    <AdminShell active="Certificaciones">
      <NuevaCertificacionEditor />
    </AdminShell>
  )
}
