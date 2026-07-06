import type { Metadata } from "next"
import { AdminShell } from "@/components/admin/admin-shell"
import { ListaCertificaciones } from "@/components/admin/lista-certificaciones"

export const metadata: Metadata = {
  title: "Certificaciones | Gestión Académica IFTS N.° 14",
  description:
    "Archivo documental de certificaciones: emisión, validez y entrega de credenciales académicas.",
}

export default function CertificacionesPage() {
  return (
    <AdminShell active="Certificaciones">
      <ListaCertificaciones />
    </AdminShell>
  )
}
