import { fmt1, fmtInt } from "@/lib/format"
import type { LinhaSimulacao, ParametrosSimulacao } from "@/lib/simulacao"

interface SummaryBarProps {
  marcoFi: LinhaSimulacao | null
  marco100: LinhaSimulacao | null
  params: ParametrosSimulacao
}

export function SummaryBar({ marcoFi, marco100, params }: SummaryBarProps) {
  return (
    <div className="sticky top-12 z-10 mb-5 flex flex-wrap items-center gap-x-6 gap-y-1 border-b bg-background/95 py-2.5 text-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <span className="flex items-baseline gap-1.5">
        <span className="text-muted-foreground">
          Independência no seu padrão atual ({fmtInt(params.percentualConsumoInicial)}%):
        </span>
        <span className="font-semibold tabular-nums">
          {marcoFi ? `${fmt1(marcoFi.mes / 12)} anos` : "Não atingida"}
        </span>
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="text-muted-foreground">Independência total:</span>
        <span className="font-semibold tabular-nums">
          {marco100 ? `${fmt1(marco100.ano)} anos` : "Não atingida"}
        </span>
      </span>
    </div>
  )
}
