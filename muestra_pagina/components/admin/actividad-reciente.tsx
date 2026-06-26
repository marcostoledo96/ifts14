type Tipo = "emitida" | "asistencia" | "reenviado" | "revocada"

const tipoMeta: Record<Tipo, { label: string; cls: string }> = {
  emitida: { label: "CERT. EMITIDA", cls: "bg-valid-soft text-valid" },
  asistencia: { label: "ASISTENCIA", cls: "bg-accent text-tech-blue" },
  reenviado: { label: "REENVÍO", cls: "bg-warning-soft text-[#8a6100]" },
  revocada: { label: "REVOCADA", cls: "bg-destructive-soft text-destructive" },
}

const eventos: {
  hora: string
  id: string
  tipo: Tipo
  detalle: string
  autor: string
}[] = [
  {
    hora: "10:38",
    id: "EVT-9921",
    tipo: "emitida",
    detalle: "Certificado QR generado · Vega, Lucía M. (Desarrollo Web Full Stack)",
    autor: "SYS_AUTO",
  },
  {
    hora: "10:15",
    id: "EVT-9920",
    tipo: "asistencia",
    detalle: "Asistencia modificada · Introducción a IoT (Com. B, clase 12)",
    autor: "bedelia.mpereyra",
  },
  {
    hora: "09:50",
    id: "EVT-9919",
    tipo: "reenviado",
    detalle: "Certificado reenviado · Quiroga, Diego A. (cambio de email)",
    autor: "bedelia.mpereyra",
  },
  {
    hora: "09:12",
    id: "EVT-9918",
    tipo: "revocada",
    detalle: "Certificación revocada · Análisis de Datos 2024 (resolución interna)",
    autor: "coord.academica",
  },
]

export function ActividadReciente() {
  return (
    <section
      aria-labelledby="actividad-titulo"
      className="overflow-hidden rounded-md border border-border bg-card"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 id="actividad-titulo" className="text-sm font-semibold text-foreground">
          Actividad reciente
        </h2>
        <a href="#" className="text-xs font-medium text-tech-blue hover:underline">
          Ver registro completo
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="px-4 py-2.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                Hora
              </th>
              <th scope="col" className="px-4 py-2.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                ID
              </th>
              <th scope="col" className="px-4 py-2.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                Tipo
              </th>
              <th scope="col" className="px-4 py-2.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                Detalle
              </th>
              <th scope="col" className="px-4 py-2.5 text-right font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                Autor
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {eventos.map((evt) => {
              const meta = tipoMeta[evt.tipo]
              return (
                <tr key={evt.id} className="transition-colors hover:bg-secondary/50">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-sm tabular-nums text-foreground">
                    {evt.hora}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-tech-blue">
                    {evt.id}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-block rounded-sm px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide ${meta.cls}`}
                    >
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{evt.detalle}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                    {evt.autor}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
