const stats = [
  { label: "Cursos cargados", value: "38", tone: "default" as const },
  { label: "Alumnos registrados", value: "1.247", tone: "default" as const },
  { label: "Certificaciones emitidas", value: "892", tone: "valid" as const },
  { label: "Certificaciones revocadas", value: "6", tone: "destructive" as const },
]

export function ResumenOperativo() {
  return (
    <section
      aria-label="Resumen operativo"
      className="grid grid-cols-2 divide-border overflow-hidden rounded-md border border-border bg-card sm:grid-cols-4 sm:divide-x"
    >
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`flex flex-col gap-1 px-4 py-3.5 ${
            i < 2 ? "border-b border-border sm:border-b-0" : ""
          } ${i % 2 === 0 ? "border-r border-border sm:border-r-0" : ""}`}
        >
          <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
            {stat.label}
          </span>
          <span
            className={`font-mono text-2xl font-semibold tabular-nums leading-none ${
              stat.tone === "valid"
                ? "text-valid"
                : stat.tone === "destructive"
                  ? "text-destructive"
                  : "text-foreground"
            }`}
          >
            {stat.value}
          </span>
        </div>
      ))}
    </section>
  )
}
