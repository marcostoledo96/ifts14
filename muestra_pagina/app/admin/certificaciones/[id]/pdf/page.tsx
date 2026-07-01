import { AdminShell } from "@/components/admin/admin-shell"
import { VistaPreviaPdf } from "@/components/admin/vista-previa-pdf"

export const metadata = {
  title: "Vista previa PDF · IFTS N.° 14",
  description:
    "Vista previa horizontal del certificado complementario con QR y enlace de validación — IFTS N.° 14.",
}

export default async function VistaPreviaPdfPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <AdminShell active="Certificaciones">
      <VistaPreviaPdf id={id} />
    </AdminShell>
  )
}
