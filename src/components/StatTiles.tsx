import type { ReactNode } from "react"
import { Info, TriangleAlert } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { fmt1, fmtInt, fmtPct } from "@/lib/format"
import {
  patrimonioNecessarioParaConsumo,
  type LinhaSimulacao,
  type ParametrosSimulacao,
} from "@/lib/simulacao"

const MESES_MAX = 600

interface StatTilesProps {
  historico: LinhaSimulacao[]
  marcoFi: LinhaSimulacao | null
  marco100: LinhaSimulacao | null
  params: ParametrosSimulacao
}

interface Tile {
  rotulo: string
  valor: string
  sub: string
  memoria: ReactNode
  atingido: boolean
}

function LinhaFormula({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">{children}</p>
}

export function StatTiles({ historico, marcoFi, marco100, params }: StatTilesProps) {
  const ultimo = historico[historico.length - 1]

  const tiles: Tile[] = []

  if (marcoFi) {
    const rendaPassivaPct = marcoFi.rendaPassivaMensal * 100
    tiles.push({
      rotulo: `Independência no seu padrão de vida atual (${fmtInt(params.percentualConsumoInicial)}% da receita)`,
      valor: `${fmt1(marcoFi.mes / 12)} anos`,
      sub: `${fmtInt(marcoFi.mes)} meses · patrimônio de ${fmt1(marcoFi.patrimonio)}× a receita mensal`,
      memoria: (
        <>
          <p>
            A renda passiva mensal é o patrimônio convertido pela taxa de retirada. Um marco de X% é liberado
            assim que essa renda cobre X% da receita mensal:
          </p>
          <LinhaFormula>renda passiva = patrimônio × taxa de retirada ÷ 12</LinhaFormula>
          <p>
            No mês {fmtInt(marcoFi.mes)} ({fmt1(marcoFi.mes / 12)} anos), o patrimônio acumulado é{" "}
            {fmt1(marcoFi.patrimonio)}×:
          </p>
          <LinhaFormula>
            {fmt1(marcoFi.patrimonio)} × {fmt1(params.taxaRetirada * 100)}% ÷ 12 = {fmt1(rendaPassivaPct)}% da
            receita mensal
          </LinhaFormula>
          <p>
            {fmt1(rendaPassivaPct)}% já cobre o marco de {fmt1(marcoFi.percentualConsumo)}%, então o consumo sobe
            de {fmtInt(params.percentualConsumoInicial)}% para {fmt1(marcoFi.percentualConsumo)}%.
          </p>
        </>
      ),
      atingido: true,
    })
  } else {
    tiles.push({
      rotulo: "Independência no seu padrão de vida atual",
      valor: "Não atingida",
      sub: `dentro do horizonte de ${MESES_MAX / 12} anos simulado`,
      memoria: (
        <p>
          A renda passiva (patrimônio × taxa de retirada ÷ 12) nunca alcançou{" "}
          {fmtInt(params.percentualConsumoInicial)}% da receita mensal dentro dos {MESES_MAX / 12} anos simulados.
        </p>
      ),
      atingido: false,
    })
  }

  if (marco100) {
    const patrimonioTeorico100 = patrimonioNecessarioParaConsumo(100, params.taxaRetirada)
    tiles.push({
      rotulo: "Independência financeira total atingida em",
      valor: `${fmt1(marco100.ano)} anos`,
      sub: `${fmtInt(marco100.mes)} meses · renda passiva cobre a receita mensal integral`,
      memoria: (
        <>
          <p>O marco de 100% é liberado quando a renda passiva cobre a receita mensal inteira, ou seja:</p>
          <LinhaFormula>patrimônio necessário = 100 ÷ 100 × 12 ÷ taxa de retirada</LinhaFormula>
          <LinhaFormula>
            = 12 ÷ {fmt1(params.taxaRetirada * 100)}% = {fmt1(patrimonioTeorico100)}×
          </LinhaFormula>
          <p>
            Esse é o mínimo teórico — a simulação só reage uma vez por mês, então o patrimônio real no marco (
            {fmt1(marco100.patrimonio)}×) fica um pouco acima dele.
          </p>
        </>
      ),
      atingido: true,
    })
  } else {
    tiles.push({
      rotulo: "Independência financeira total",
      valor: "Não atingida",
      sub: `renda passiva chega a cobrir ${fmtPct(ultimo.percentualConsumo)} da receita em ${MESES_MAX / 12} anos`,
      memoria: (
        <p>
          Faltou patrimônio para cobrir a receita mensal integral dentro do horizonte simulado: a renda passiva
          chegou a cobrir {fmtPct(ultimo.percentualConsumo)} da receita, com {fmt1(ultimo.patrimonio)}× de
          patrimônio.
        </p>
      ),
      atingido: false,
    })
  }

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {tiles.map((tile) => (
        <Card key={tile.rotulo} className={cn(!tile.atingido && "ring-destructive/40")}>
          <CardContent>
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-muted-foreground">{tile.rotulo}</p>
              <Popover>
                <PopoverTrigger
                  className="-mt-0.5 -mr-0.5 shrink-0 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={`Como "${tile.rotulo}" foi calculado`}
                >
                  <Info className="size-3.5" />
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 gap-2">
                  <PopoverTitle className="text-xs uppercase tracking-wide text-muted-foreground">
                    Memória de cálculo
                  </PopoverTitle>
                  <div className="flex flex-col gap-2 text-xs leading-relaxed text-foreground">{tile.memoria}</div>
                </PopoverContent>
              </Popover>
            </div>
            <p
              className={cn(
                "mt-1.5 flex items-center gap-1.5 text-xl leading-tight font-semibold tracking-tight",
                !tile.atingido && "text-destructive",
              )}
            >
              {!tile.atingido && <TriangleAlert className="size-4 shrink-0" />}
              {tile.valor}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{tile.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
