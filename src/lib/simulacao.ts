/**
 * Port 1:1 de src/simulacao.py (ver CLAUDE.md na raiz do projeto para a
 * mecânica completa). O consumo começa em `percentualConsumoInicial` da
 * receita mensal; conforme a renda passiva do patrimônio passa a cobrir
 * novos percentuais da receita mensal, o consumo sobe de patamar (em
 * incrementos de `incrementoMarco`) e o percentual investido cai
 * correspondentemente.
 *
 * Contrato de unidades — importante, é o que causou o bug do protótipo
 * anterior: `taxaRetornoAnual`, `inflacaoAnual` e `taxaRetirada` são
 * SEMPRE fração decimal aqui (0.10 = 10% ao ano), igual ao Python. Os
 * componentes de UI que usam sliders em "%" (0–100) são responsáveis por
 * dividir por 100 antes de montar um `ParametrosSimulacao` — a conversão
 * acontece uma única vez, no limite entre UI e lib (ver Simulador.tsx).
 * `percentualConsumoInicial`/`incrementoMarco`/`percentualConsumo` seguem a
 * escala 0–100 (pontos percentuais), também igual ao Python.
 */

export interface ParametrosSimulacao {
  /** % da receita mensal consumido hoje (0–100), ex.: 20.0 */
  percentualConsumoInicial: number
  /** fração decimal ao ano, ex.: 0.10 (10% a.a.) */
  taxaRetornoAnual: number
  /** fração decimal ao ano, ex.: 0.04 (4% a.a.) */
  inflacaoAnual: number
  /** fração decimal ao ano, ex.: 0.04 (regra dos 4%) */
  taxaRetirada: number
  /** pontos percentuais por marco, ex.: 1.0 */
  incrementoMarco: number
  /** patrimônio inicial, em vezes a receita mensal */
  patrimonioInicial: number
  /** limite de segurança em meses (padrão 600 = 50 anos) */
  mesesMax?: number
}

export interface LinhaSimulacao {
  mes: number
  ano: number
  /** em vezes a receita mensal */
  patrimonio: number
  /** 0–100 */
  percentualConsumo: number
  /** 0–100 */
  percentualInvestido: number
  /** fração da receita mensal */
  rendaPassivaMensal: number
}

const MESES_MAX_PADRAO = 600

/** Retorno real anual (fração decimal): retorno nominal descontado da inflação. */
export function retornoRealAnual(taxaRetornoAnual: number, inflacaoAnual: number): number {
  return (1 + taxaRetornoAnual) / (1 + inflacaoAnual) - 1
}

/** Converte retorno e inflação anuais (fração decimal) em taxa de retorno real mensal. */
export function taxaRetornoRealMensal(taxaRetornoAnual: number, inflacaoAnual: number): number {
  const taxaRealAnual = retornoRealAnual(taxaRetornoAnual, inflacaoAnual)
  return Math.pow(1 + taxaRealAnual, 1 / 12) - 1
}

/**
 * Simula a evolução do patrimônio e do percentual consumido/investido mês a mês.
 *
 * Retorna uma linha por mês contendo patrimônio (em vezes a receita mensal),
 * percentual consumido, percentual investido e renda passiva mensal (como
 * fração da receita mensal).
 *
 * Diferença intencional em relação a src/simulacao.py: a versão Python para
 * assim que o consumo atinge 100%; aqui a simulação continua até
 * `mesesMax`, para que o histórico completo (gráficos, tabela) cubra toda
 * a faixa de 0% a 100% de consumo liberado sem cortar a trajetória no
 * momento exato da independência total. Depois de 100%, o aporte é zero e
 * o patrimônio só compõe juros — quem usa `historico` para achar "o
 * momento em que 100% foi atingido" deve procurar a primeira linha com
 * `percentualConsumo >= 100` (ver `marcoIndependenciaFinanceira` /
 * `tabelaMarcos`), não a última.
 */
export function simular(params: ParametrosSimulacao): LinhaSimulacao[] {
  const mesesMax = params.mesesMax ?? MESES_MAX_PADRAO
  const taxaMensal = taxaRetornoRealMensal(params.taxaRetornoAnual, params.inflacaoAnual)

  let patrimonio = params.patrimonioInicial
  let percentualConsumo = params.percentualConsumoInicial

  const historico: LinhaSimulacao[] = []

  for (let mes = 0; mes <= mesesMax; mes++) {
    const rendaPassivaMensal = (patrimonio * params.taxaRetirada) / 12

    // sobe de patamar enquanto a renda passiva já cobrir o próximo marco
    while (percentualConsumo < 100) {
      const proximoMarco = Math.min(percentualConsumo + params.incrementoMarco, 100)
      const gastoProximoMarco = proximoMarco / 100
      if (rendaPassivaMensal >= gastoProximoMarco) {
        percentualConsumo = proximoMarco
      } else {
        break
      }
    }

    historico.push({
      mes,
      ano: mes / 12,
      patrimonio,
      percentualConsumo,
      percentualInvestido: 100 - percentualConsumo,
      rendaPassivaMensal,
    })

    const aporte = (100 - percentualConsumo) / 100
    patrimonio = patrimonio * (1 + taxaMensal) + aporte
  }

  return historico
}

/**
 * Patrimônio (em vezes a receita mensal) necessário para que a renda passiva cubra
 * um dado percentual de consumo, na taxa de retirada informada (fração
 * decimal). Derivada de `patrimonio * taxaRetirada / 12 >= percentualConsumo / 100`.
 *
 * É o valor "teórico" do cruzamento — a simulação só reage uma vez por mês,
 * então o patrimônio real registrado no marco costuma passar um pouco desse
 * mínimo (ver `simular`).
 */
export function patrimonioNecessarioParaConsumo(percentualConsumo: number, taxaRetirada: number): number {
  return (percentualConsumo / 100) * (12 / taxaRetirada)
}

/**
 * Mês em que o consumo sobe pela primeira vez acima do nível inicial.
 *
 * Esse é o marco de independência financeira "no nível de consumo atual":
 * a renda passiva passou a cobrir o que hoje é gasto.
 */
export function marcoIndependenciaFinanceira(
  historico: LinhaSimulacao[],
  percentualConsumoInicial: number,
): LinhaSimulacao | null {
  return historico.find((linha) => linha.percentualConsumo > percentualConsumoInicial) ?? null
}

/**
 * Mês em que a independência financeira total é atingida (renda passiva
 * cobre 100% da receita mensal). `null` se não atingida dentro do horizonte
 * simulado.
 */
export function marcoIndependenciaTotal(historico: LinhaSimulacao[]): LinhaSimulacao | null {
  return historico.find((linha) => linha.percentualConsumo >= 100) ?? null
}

/** Uma linha por marco de percentual de consumo atingido. */
export function tabelaMarcos(historico: LinhaSimulacao[]): LinhaSimulacao[] {
  const marcos: LinhaSimulacao[] = []
  for (let i = 1; i < historico.length; i++) {
    if (historico[i].percentualConsumo > historico[i - 1].percentualConsumo) {
      marcos.push(historico[i])
    }
  }
  return marcos
}
