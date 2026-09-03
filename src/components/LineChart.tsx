import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TooltipContentProps } from "recharts"
import { fmt1, fmtInt, fmtPct } from "@/lib/format"
import type { LinhaSimulacao } from "@/lib/simulacao"

interface LineChartProps {
  historico: LinhaSimulacao[]
  marcoFi: LinhaSimulacao | null
}

function ConteudoTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const linha = payload[0].payload as LinhaSimulacao

  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-md">
      <p className="mb-1.5 text-muted-foreground">Ano {fmt1(linha.ano)}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-2 w-2 rounded-sm" style={{ background: "var(--chart-1)" }} />
          Patrimônio
        </span>
        <span className="font-semibold tabular-nums">{fmt1(linha.patrimonio)}× a receita mensal</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Consumo</span>
        <span className="font-semibold tabular-nums">{fmtPct(linha.percentualConsumo)}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Renda passiva/mês</span>
        <span className="font-semibold tabular-nums">{fmt1(linha.rendaPassivaMensal * 100)}%</span>
      </div>
    </div>
  )
}

export function LineChart({ historico, marcoFi }: LineChartProps) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3.5 rounded-full" style={{ background: "var(--chart-1)" }} />
          Patrimônio
        </span>
        {marcoFi && (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-0.5 rounded-full" style={{ background: "var(--chart-3)" }} />
            Independência financeira
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <RechartsLineChart data={historico} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="ano"
            type="number"
            tickFormatter={(v: number) => `${Math.round(v)}a`}
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
          />
          <YAxis
            tickFormatter={(v: number) => fmtInt(Math.round(v))}
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={44}
            domain={[0, "dataMax"]}
          />
          <Tooltip content={ConteudoTooltip} cursor={{ stroke: "var(--border)" }} />
          <Line
            type="monotone"
            dataKey="patrimonio"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4.5, stroke: "var(--card)", strokeWidth: 2 }}
            isAnimationActive={false}
          />
          {marcoFi && (
            <>
              <ReferenceLine
                x={marcoFi.ano}
                stroke="var(--chart-3)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                ifOverflow="extendDomain"
              />
              <ReferenceDot
                x={marcoFi.ano}
                y={marcoFi.patrimonio}
                r={5.5}
                fill="var(--chart-3)"
                stroke="var(--card)"
                strokeWidth={2}
                ifOverflow="extendDomain"
              />
            </>
          )}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
