type Variante = "valido" | "revocado" | "sin-registro"

const config: Record<
  Variante,
  { color: string; centro: string; glifo: "check" | "cruz" | "guion" }
> = {
  valido: { color: "var(--valid)", centro: "V\u00c1LIDO", glifo: "check" },
  revocado: { color: "var(--destructive)", centro: "REVOCADO", glifo: "cruz" },
  "sin-registro": {
    color: "var(--muted-foreground)",
    centro: "SIN REGISTRO",
    glifo: "guion",
  },
}

/**
 * Sello circular de verificación. Motivo institucional compartido por los
 * tres estados: mismo trazado, cambia color central y leyenda.
 * Decorativo para lectores de pantalla: el estado se comunica por texto aparte.
 */
export function SelloOficial({ variante }: { variante: Variante }) {
  const c = config[variante]
  const arcoId = `sello-arco-${variante}`

  return (
    <svg
      width="112"
      height="112"
      viewBox="0 0 112 112"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Anillo exterior perforado */}
      <circle
        cx="56"
        cy="56"
        r="53"
        stroke={c.color}
        strokeWidth="1.5"
        strokeDasharray="2.5 3.5"
        opacity="0.9"
      />
      {/* Anillo interior sólido */}
      <circle cx="56" cy="56" r="45" stroke={c.color} strokeWidth="1" />
      {/* Texto circular institucional */}
      <defs>
        <path
          id={arcoId}
          d="M 56 20 a 36 36 0 1 1 -0.01 0"
          fill="none"
        />
      </defs>
      <text
        fontSize="6.4"
        letterSpacing="1.6"
        fill={c.color}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <textPath href={`#${arcoId}`} startOffset="0">
          INSTITUTO DE FORMACI&Oacute;N T&Eacute;CNICA SUPERIOR N.&deg; 14 &middot; GCBA &middot;
        </textPath>
      </text>
      {/* Glifo central */}
      {c.glifo === "check" && (
        <path
          d="M46 56.5l7 7 13-14"
          stroke={c.color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {c.glifo === "cruz" && (
        <path
          d="M48 48l16 16M64 48L48 64"
          stroke={c.color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
      {c.glifo === "guion" && (
        <path
          d="M46 56h20"
          stroke={c.color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
      {/* Leyenda de estado */}
      <text
        x="56"
        y={variante === "sin-registro" ? "80" : "79"}
        textAnchor="middle"
        fontSize={variante === "sin-registro" ? "6.2" : "7"}
        letterSpacing="1.4"
        fontWeight="600"
        fill={c.color}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {c.centro}
      </text>
    </svg>
  )
}
