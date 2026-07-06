import { BookPlus, CalendarCheck, BadgePlus, Link2, Upload } from "lucide-react"

const acciones = [
  {
    label: "Nueva certificación",
    desc: "Emitir certificado con QR",
    icon: BadgePlus,
    primary: true,
  },
  {
    label: "Nuevo curso",
    desc: "Alta de comisión y fechas",
    icon: BookPlus,
    primary: false,
  },
  {
    label: "Cargar asistencias",
    desc: "Registrar presentes por clase",
    icon: CalendarCheck,
    primary: false,
  },
  {
    label: "Entrega manual",
    desc: "Copiar link y descargar PDF",
    icon: Link2,
    primary: false,
  },
  {
    label: "Carga masiva",
    desc: "Importar padrón desde CSV",
    icon: Upload,
    primary: false,
  },
]

export function AccionesPrincipales() {
  return (
    <section aria-labelledby="acciones-titulo">
      <div className="mb-3 flex items-baseline justify-between">
        <h2
          id="acciones-titulo"
          className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground"
        >
          Acciones
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {acciones.map((accion) => {
          const Icon = accion.icon
          return (
            <button
              key={accion.label}
              type="button"
              className={`group flex flex-col items-start gap-3 rounded-md border p-4 text-left transition-all duration-150 ease-out active:scale-[0.98] ${
                accion.primary
                  ? "border-ink bg-ink text-ink-foreground hover:bg-ink/90"
                  : "border-border bg-card hover:border-tech-blue/50 hover:bg-accent/40"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-sm transition-transform duration-150 ease-out group-hover:-translate-y-0.5 ${
                  accion.primary
                    ? "bg-white/10 text-circuit"
                    : "bg-secondary text-tech-blue"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="space-y-0.5">
                <span className="block text-sm font-semibold leading-tight">
                  {accion.label}
                </span>
                <span
                  className={`block text-xs leading-snug ${
                    accion.primary ? "text-white/65" : "text-muted-foreground"
                  }`}
                >
                  {accion.desc}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
