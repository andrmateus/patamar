import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TooltipContentProps } from "recharts"
import { fmtPct } from "@/lib/format"
import type { LinhaSimulacao } from "@/lib/simulacao"

interface LinhaAnual extends LinhaSimulacao {
  anoNum: number
}

interface StackedBarChartProps {
  historico: LinhaSimulacao[]
}

function ConteudoTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const linha = payload[0].payload as LinhaAnual

  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-md">
      <p className="mb-1.5 text-muted-foreground">Ano {linha.anoNum}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-2 w-2 rounded-sm" style={{ background: "var(--chart-1)" }} />
          Investido
        </span>
        <span className="font-semibold tabular-nums">{fmtPct(linha.percentualInvestido)}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-2 w-2 rounded-sm" style={{ background: "var(--chart-2)" }} />
          Consumido
        </span>
        <span className="font-semibold tabular-nums">{fmtPct(linha.percentualConsumo)}</span>
      </div>
    </div>
  )
}

export function StackedBarChart({ historico }: StackedBarChartProps) {
  const anual: LinhaAnual[] = historico
    .filter((linha) => linha.mes % 12 === 0)
    .map((linha) => ({ ...linha, anoNum: Math.round(linha.mes / 12) }))

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--chart-1)" }} />
          Investido
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--chart-2)" }} />
          Consumido
        </span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <RechartsBarChart data={anual} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="anoNum"
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            tickFormatter={(v: number) => `${v}%`}
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            width={40}
          />
          <Tooltip content={ConteudoTooltip} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="percentualConsumo" stackId="a" fill="var(--chart-2)" isAnimationActive={false} />
          <Bar
            dataKey="percentualInvestido"
            stackId="a"
            fill="var(--chart-1)"
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
