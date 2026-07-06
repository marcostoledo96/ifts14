import { AdminShell } from "@/components/admin/admin-shell"
import { EntregaManual } from "@/components/admin/entrega-manual"

export const metadata = {
  title: "Entrega manual de certificación · IFTS N.° 14",
  description:
    "Copiá el link público de validación y descargá el PDF para entregarlo al alumno por canal externo — Bedelía, IFTS N.° 14.",
}

export default async function EntregaManualPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <AdminShell active="Certificaciones">
      <EntregaManual id={id} />
    </AdminShell>
  )
}
