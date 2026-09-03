import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { fmt1, fmtInt } from "@/lib/format"

export interface CampoControle {
  chave: string
  rotulo: string
  unidade: string
  min: number
  max: number
  step: number
  dica: string
}

export interface GrupoControle {
  titulo: string
  campos: CampoControle[]
}

export const GRUPOS_CONTROLE: GrupoControle[] = [
  {
    titulo: "Sua situação hoje",
    campos: [
      {
        chave: "percentualInvestidoInicial",
        rotulo: "Investimento inicial",
        unidade: "%",
        min: 10,
        max: 99,
        step: 1,
        dica: "% da receita mensal que você investe hoje; o restante é o que você consome.",
      },
      {
        chave: "patrimonioInicial",
        rotulo: "Patrimônio inicial",
        unidade: "×",
        min: 0,
        max: 60,
        step: 1,
        dica: "Quanto você já tem guardado, em vezes a receita mensal (ex.: 12× = um ano inteiro de receita guardado).",
      },
    ],
  },
  {
    titulo: "Premissas da simulação",
    campos: [
      {
        chave: "taxaRetornoAnual",
        rotulo: "Retorno bruto (a.a.)",
        unidade: "%",
        min: 0,
        max: 20,
        step: 0.5,
        dica: "Quanto os investimentos rendem por ano, antes de descontar a inflação.",
      },
      {
        chave: "inflacaoAnual",
        rotulo: "Inflação (a.a.)",
        unidade: "%",
        min: 0,
        max: 15,
        step: 0.5,
        dica: "Usada para descontar o retorno bruto e achar o retorno real (o que importa de verdade).",
      },
      {
        chave: "taxaRetirada",
        rotulo: "Taxa de retirada (a.a.)",
        unidade: "%",
        min: 1,
        max: 10,
        step: 0.25,
        dica: "Obrigatório: quanto do patrimônio você está disposto a retirar por ano para pagar as contas (ex.: a regra dos 4%). É essa taxa que converte patrimônio em renda passiva.",
      },
      {
        chave: "incrementoMarco",
        rotulo: "Incremento por marco",
        unidade: " p.p.",
        min: 0.5,
        max: 10,
        step: 0.5,
        dica: "De quanto em quanto o consumo liberado sobe a cada marco (ex.: 1 = de 20% para 21%).",
      },
    ],
  },
]

export type ValoresControle = Record<string, number>

interface ControlsProps {
  valores: ValoresControle
  onChange: (chave: string, valor: number) => void
}

export function Controls({ valores, onChange }: ControlsProps) {
  return (
    <div className="flex flex-col gap-6">
      {GRUPOS_CONTROLE.map((grupo) => (
        <div key={grupo.titulo}>
          <h3 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">{grupo.titulo}</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {grupo.campos.map((campo) => {
              const valor = valores[campo.chave]
              const valorFormatado = (campo.step < 1 ? fmt1(valor) : fmtInt(valor)) + campo.unidade
              return (
                <div key={campo.chave} className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between">
                    <Label htmlFor={`slider-${campo.chave}`} className="text-muted-foreground">
                      {campo.rotulo}
                    </Label>
                    <span className="text-sm font-semibold tabular-nums">{valorFormatado}</span>
                  </div>
                  <Slider
                    id={`slider-${campo.chave}`}
                    value={[valor]}
                    onValueChange={(v) => {
                      // Base UI normaliza o valor para número puro num slider de uma
                      // única alça (mesmo recebendo `value` como array — isso só
                      // controla quantas alças renderizar); só cai em array se, no
                      // futuro, este slider passar a ter múltiplas alças.
                      onChange(campo.chave, Array.isArray(v) ? v[0] : v)
                    }}
                    min={campo.min}
                    max={campo.max}
                    step={campo.step}
                    aria-label={campo.rotulo}
                  />
                  <p className="text-xs text-muted-foreground">{campo.dica}</p>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
