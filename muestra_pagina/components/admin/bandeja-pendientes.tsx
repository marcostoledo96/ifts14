import { ChevronRight, CalendarX, MailWarning, SendHorizontal, RefreshCw } from "lucide-react"

const pendientes = [
  {
    label: "Cursos sin fechas asignadas",
    detalle: "No se puede emitir certificado sin fecha de finalización.",
    count: 3,
    icon: CalendarX,
    tone: "warning" as const,
  },
  {
    label: "Alumnos sin email registrado",
    detalle: "Sin canal de contacto registrado para la entrega manual.",
    count: 12,
    icon: MailWarning,
    tone: "warning" as const,
  },
  {
    label: "Certificaciones pendientes de entrega",
    detalle: "Emitidas y firmadas, aún no entregadas al alumno.",
    count: 5,
    icon: SendHorizontal,
    tone: "info" as const,
  },
  {
    label: "Requieren nueva entrega por modificación",
    detalle: "Datos editados luego de la emisión original.",
    count: 2,
    icon: RefreshCw,
    tone: "destructive" as const,
  },
]

const toneStyles = {
  warning: "bg-warning-soft text-[#8a6100]",
  info: "bg-accent text-tech-blue",
  destructive: "bg-destructive-soft text-destructive",
}

export function BandejaPendientes() {
  return (
    <section
      aria-labelledby="pendientes-titulo"
      className="overflow-hidden rounded-md border border-border bg-card"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 id="pendientes-titulo" className="text-sm font-semibold text-foreground">
          Pendientes de resolución
        </h2>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          22 tareas
        </span>
      </div>
      <ul className="divide-y divide-border">
        {pendientes.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.label}>
              <a
                href="#"
                className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-secondary/60"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm ${toneStyles[item.tone]}`}
                  aria-hidden="true"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                    <span className="shrink-0 rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-xs font-semibold tabular-nums text-secondary-foreground">
                      {item.count}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {item.detalle}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-tech-blue">
                  <span className="hidden sm:inline">Revisar</span>
                  <ChevronRight
                    className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
