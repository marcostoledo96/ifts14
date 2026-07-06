import { AdminShell } from "@/components/admin/admin-shell"
import { RevocarCertificacion } from "@/components/admin/revocar-certificacion"

export const metadata = {
  title: "Revocar certificación · IFTS N.° 14",
  description:
    "Revocá una certificación con motivo obligatorio y registro de auditoría — Bedelía, IFTS N.° 14.",
}

export default async function RevocarCertificacionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <AdminShell active="Certificaciones">
      <RevocarCertificacion id={id} />
    </AdminShell>
  )
}
