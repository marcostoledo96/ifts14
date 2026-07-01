import { AdminShell } from "@/components/admin/admin-shell"
import { ExpedienteCertificacion } from "@/components/admin/expediente-certificacion"

export const metadata = {
  title: "Expediente de certificación · IFTS N.° 14",
  description:
    "Detalle administrativo de un certificado emitido — Bedelía, IFTS N.° 14.",
}

export default async function ExpedienteCertificacionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <AdminShell active="Certificaciones">
      <ExpedienteCertificacion id={id} />
    </AdminShell>
  )
}
