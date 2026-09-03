import { Monitor, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Tema } from "@/lib/tema"

const OPCOES: Array<{ valor: Tema; rotulo: string; Icone: typeof Sun }> = [
  { valor: "sistema", rotulo: "Sistema", Icone: Monitor },
  { valor: "claro", rotulo: "Claro", Icone: Sun },
  { valor: "escuro", rotulo: "Escuro", Icone: Moon },
]

interface ThemeToggleProps {
  tema: Tema
  onChange: (tema: Tema) => void
}

export function ThemeToggle({ tema, onChange }: ThemeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      className="inline-flex shrink-0 items-center gap-0.5 rounded-lg border bg-muted/40 p-0.5"
    >
      {OPCOES.map(({ valor, rotulo, Icone }) => (
        <button
          key={valor}
          type="button"
          role="radio"
          aria-checked={tema === valor}
          aria-label={rotulo}
          title={rotulo}
          onClick={() => onChange(valor)}
          className={cn(
            "flex size-7 items-center justify-center rounded-md transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            tema === valor
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icone className="size-3.5" />
        </button>
      ))}
    </div>
  )
}
