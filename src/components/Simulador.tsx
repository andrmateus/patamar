import { useMemo, useState } from "react"
import { TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Controls, type ValoresControle } from "@/components/Controls"
import { LineChart } from "@/components/LineChart"
import { MarcosTable } from "@/components/MarcosTable"
import { StackedBarChart } from "@/components/StackedBarChart"
import { StatTiles } from "@/components/StatTiles"
import { SummaryBar } from "@/components/SummaryBar"
import { fmt1 } from "@/lib/format"
import {
  marcoIndependenciaFinanceira,
  marcoIndependenciaTotal,
  retornoRealAnual,
  simular,
  tabelaMarcos,
  type ParametrosSimulacao,
} from "@/lib/simulacao"

const VALORES_PADRAO: ValoresControle = {
  percentualInvestidoInicial: 15,
  taxaRetornoAnual: 10,
  inflacaoAnual: 4,
  taxaRetirada: 4,
  incrementoMarco: 1,
  patrimonioInicial: 0,
}

export function Simulador() {
  const [valores, setValores] = useState<ValoresControle>(VALORES_PADRAO)

  const handleChange = (chave: string, valor: number) => {
    setValores((atual) => ({ ...atual, [chave]: valor }))
  }

  const handleReset = () => setValores(VALORES_PADRAO)

  // Contrato de unidades de lib/simulacao.ts: taxaRetornoAnual/inflacaoAnual/
  // taxaRetirada são fração decimal, e percentualConsumoInicial é o
  // consumo (não o investimento). Os sliders trabalham em "%", então essas
  // duas conversões acontecem uma única vez, aqui — é o ponto exato onde o
  // protótipo anterior tinha o bug de unidades (usava os valores de "%" crus).
  const params: ParametrosSimulacao = useMemo(
    () => ({
      percentualConsumoInicial: 100 - valores.percentualInvestidoInicial,
      taxaRetornoAnual: valores.taxaRetornoAnual / 100,
      inflacaoAnual: valores.inflacaoAnual / 100,
      taxaRetirada: valores.taxaRetirada / 100,
      incrementoMarco: valores.incrementoMarco,
      patrimonioInicial: valores.patrimonioInicial,
    }),
    [valores],
  )

  const historico = useMemo(() => simular(params), [params])
  const marcos = useMemo(() => tabelaMarcos(historico), [historico])
  const marcoFi = useMemo(
    () => marcoIndependenciaFinanceira(historico, params.percentualConsumoInicial),
    [historico, params.percentualConsumoInicial],
  )
  const marco100 = useMemo(() => marcoIndependenciaTotal(historico), [historico])
  const retornoReal = useMemo(
    () => retornoRealAnual(params.taxaRetornoAnual, params.inflacaoAnual),
    [params.taxaRetornoAnual, params.inflacaoAnual],
  )

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <header className="mb-7">
        <h1 className="text-xl font-semibold tracking-tight">Simulador de independência financeira</h1>
        <p className="mt-1.5 max-w-prose text-sm text-muted-foreground">
          Simule quando você pode parar de depender do trabalho. Você investe parte da receita mensal
          hoje; o resto, consome. Conforme o patrimônio investido cresce e passa a gerar renda passiva,
          uma fatia maior da receita fica livre para consumo — até você não precisar mais trabalhar.
          Patrimônio mostrado em vezes a receita mensal (ex.: 24× = dois anos inteiros de receita
          guardados).
        </p>
      </header>

      <SummaryBar marcoFi={marcoFi} marco100={marco100} params={params} />

      <Card className="mb-5">
        <CardHeader>
          <CardTitle>Parâmetros</CardTitle>
        </CardHeader>
        <CardContent>
          <Controls valores={valores} onChange={handleChange} />
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Restaurar padrão
            </Button>
          </div>
        </CardContent>
      </Card>

      {retornoReal <= 0 && (
        <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            Retorno real de {fmt1(retornoReal * 100)}% a.a.: o retorno bruto não supera a inflação, então o
            patrimônio investido não cresce em termos reais. Dificilmente algum marco será atingido dentro
            do horizonte simulado — ajuste o retorno bruto ou a inflação para um cenário viável.
          </p>
        </div>
      )}

      <div className="mb-5">
        <h2 className="mb-3 text-base font-medium">Resultados</h2>
        <StatTiles historico={historico} marcoFi={marcoFi} marco100={marco100} params={params} />
      </div>

      <Card className="mb-5">
        <CardHeader>
          <CardTitle>Evolução do patrimônio</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart historico={historico} marcoFi={marcoFi} />
        </CardContent>
      </Card>

      <Card className="mb-5">
        <CardHeader>
          <CardTitle>Percentual da receita mensal: consumido vs. investido</CardTitle>
        </CardHeader>
        <CardContent>
          <StackedBarChart historico={historico} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tabela de marcos atingidos</CardTitle>
        </CardHeader>
        <CardContent>
          <MarcosTable marcos={marcos} />
        </CardContent>
      </Card>
    </div>
  )
}
