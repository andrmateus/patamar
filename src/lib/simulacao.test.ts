import { describe, expect, it } from "vitest"
import {
  marcoIndependenciaFinanceira,
  marcoIndependenciaTotal,
  patrimonioNecessarioParaConsumo,
  retornoRealAnual,
  simular,
  tabelaMarcos,
  taxaRetornoRealMensal,
  type ParametrosSimulacao,
} from "./simulacao"

// Port 1:1 de tests/test_simulacao.py — mesmos 7 cenários, incluindo o caso
// que trava o bug de unidades que o protótipo anterior tinha (marco no mês
// exato do cruzamento).

describe("taxaRetornoRealMensal", () => {
  it("retorno nominal igual à inflação -> retorno real anual e mensal são zero", () => {
    expect(taxaRetornoRealMensal(0.1, 0.1)).toBeCloseTo(0, 10)
  })

  it("desconta a inflação do retorno nominal", () => {
    // 10% ao ano nominal, 4% de inflação -> retorno real mensal positivo e
    // menor que o retorno nominal mensal ingênuo (0.10/12)
    const taxaRealMensal = taxaRetornoRealMensal(0.1, 0.04)
    expect(taxaRealMensal).toBeGreaterThan(0)
    expect(taxaRealMensal).toBeLessThan(0.1 / 12)
  })
})

describe("retornoRealAnual", () => {
  it("retorno nominal igual à inflação -> retorno real é zero", () => {
    expect(retornoRealAnual(0.1, 0.1)).toBeCloseTo(0, 10)
  })

  it("retorno nominal abaixo da inflação -> retorno real negativo", () => {
    expect(retornoRealAnual(0.03, 0.06)).toBeLessThan(0)
  })
})

describe("patrimonioNecessarioParaConsumo", () => {
  it("bate com o patrimônio teórico do marco construído à mão", () => {
    // mesmo cenário de "marco atingido no mês exato do cruzamento": marco de
    // 60% com taxaRetirada=0.12 cruza em patrimonio=60 exatamente
    expect(patrimonioNecessarioParaConsumo(60, 0.12)).toBeCloseTo(60, 10)
  })

  it("escala linearmente com o percentual de consumo", () => {
    expect(patrimonioNecessarioParaConsumo(21, 0.04)).toBeCloseTo(63, 10)
    expect(patrimonioNecessarioParaConsumo(100, 0.04)).toBeCloseTo(300, 10)
  })
})

describe("simular", () => {
  it("sem marco, cresce linearmente", () => {
    // com taxaRetirada=0 a renda passiva nunca cobre um marco, então o
    // percentual investido fica constante e, com retorno real 0%, o
    // patrimônio cresce de forma puramente linear (aporte constante por mês)
    const params: ParametrosSimulacao = {
      percentualConsumoInicial: 20,
      taxaRetornoAnual: 0.05,
      inflacaoAnual: 0.05,
      taxaRetirada: 0,
      incrementoMarco: 1,
      patrimonioInicial: 0,
      mesesMax: 24,
    }
    const historico = simular(params)

    const aporteMensal = (100 - params.percentualConsumoInicial) / 100
    historico.forEach((linha) => {
      expect(linha.patrimonio).toBeCloseTo(linha.mes * aporteMensal, 10)
      expect(linha.percentualConsumo).toBe(20)
    })
    expect(marcoIndependenciaFinanceira(historico, params.percentualConsumoInicial)).toBeNull()
  })

  it("marco atingido no mês exato do cruzamento", () => {
    // cenário construído à mão: retorno real 0% (sem juros compostos), taxa
    // de retirada de 12% ao ano (1% ao mês do patrimônio) e consumo inicial
    // de 50% em incrementos de 10 pontos. Sem compostos, patrimonio(mes) =
    // 0.5 * mes até o marco, e a renda passiva cobre o marco de 60% quando
    // patrimonio * 0.01 >= 0.60, ou seja, patrimonio == 60, que ocorre
    // exatamente no mês 120 (0.5 * 120 = 60).
    const params: ParametrosSimulacao = {
      percentualConsumoInicial: 50,
      taxaRetornoAnual: 0,
      inflacaoAnual: 0,
      taxaRetirada: 0.12,
      incrementoMarco: 10,
      patrimonioInicial: 0,
      mesesMax: 125,
    }
    const historico = simular(params)
    const marcos = tabelaMarcos(historico)
    const primeiroMarco = marcos[0]

    // o patrimônio que aparece na linha do marco deve ser exatamente o
    // patrimônio que disparou a mudança de percentual (sem defasagem de um mês)
    expect(primeiroMarco.mes).toBe(120)
    expect(primeiroMarco.patrimonio).toBeCloseTo(60, 10)
    expect(primeiroMarco.percentualConsumo).toBeCloseTo(60, 10)
    expect(primeiroMarco.rendaPassivaMensal).toBeCloseTo(0.6, 10)

    // o mês anterior ainda não tinha patrimônio suficiente para o marco
    const mesAnterior = historico.find((linha) => linha.mes === 119)!
    expect(mesAnterior.percentualConsumo).toBeCloseTo(50, 10)
    expect((mesAnterior.patrimonio * params.taxaRetirada) / 12).toBeLessThan(0.6)
  })

  it("marco múltiplo com patrimônio inicial alto", () => {
    // se o patrimônio inicial já é suficiente para cobrir vários marcos de
    // uma vez, a simulação deve subir todos eles já no mês 0 (feedback loop
    // dentro do mesmo mês), não um por mês
    const params: ParametrosSimulacao = {
      percentualConsumoInicial: 20,
      taxaRetornoAnual: 0.1,
      inflacaoAnual: 0.04,
      taxaRetirada: 0.04,
      incrementoMarco: 1,
      patrimonioInicial: 100,
      mesesMax: 1,
    }
    const historico = simular(params)

    // renda passiva mensal = 100 * 0.04 / 12 = 0.3333..., cobre consumo até 33%
    expect(historico[0].percentualConsumo).toBeCloseTo(33, 10)
    expect(historico[0].percentualInvestido).toBeCloseTo(67, 10)
  })
})

describe("marcoIndependenciaFinanceira", () => {
  it("retorna null quando não atingido", () => {
    const params: ParametrosSimulacao = {
      percentualConsumoInicial: 20,
      taxaRetornoAnual: 0.05,
      inflacaoAnual: 0.05,
      taxaRetirada: 0,
      incrementoMarco: 1,
      patrimonioInicial: 0,
      mesesMax: 12,
    }
    const historico = simular(params)
    expect(marcoIndependenciaFinanceira(historico, params.percentualConsumoInicial)).toBeNull()
  })
})

describe("marcoIndependenciaTotal", () => {
  it("retorna a linha em que o consumo atinge 100%", () => {
    const params: ParametrosSimulacao = {
      percentualConsumoInicial: 50,
      taxaRetornoAnual: 0,
      inflacaoAnual: 0,
      taxaRetirada: 0.12,
      incrementoMarco: 10,
      patrimonioInicial: 0,
      mesesMax: 400,
    }
    const historico = simular(params)
    const marco100 = marcoIndependenciaTotal(historico)

    expect(marco100).not.toBeNull()
    expect(marco100!.percentualConsumo).toBeCloseTo(100, 10)
  })

  it("retorna null quando não atingido dentro do horizonte", () => {
    const params: ParametrosSimulacao = {
      percentualConsumoInicial: 20,
      taxaRetornoAnual: 0.05,
      inflacaoAnual: 0.05,
      taxaRetirada: 0,
      incrementoMarco: 1,
      patrimonioInicial: 0,
      mesesMax: 12,
    }
    const historico = simular(params)
    expect(marcoIndependenciaTotal(historico)).toBeNull()
  })
})

describe("tabelaMarcos", () => {
  it("uma linha por mudança", () => {
    const params: ParametrosSimulacao = {
      percentualConsumoInicial: 50,
      taxaRetornoAnual: 0,
      inflacaoAnual: 0,
      taxaRetirada: 0.12,
      incrementoMarco: 10,
      patrimonioInicial: 0,
      mesesMax: 125,
    }
    const historico = simular(params)
    const marcos = tabelaMarcos(historico)

    // cada linha da tabela deve corresponder a um aumento estrito do consumo
    for (let i = 1; i < marcos.length; i++) {
      expect(marcos[i].percentualConsumo).toBeGreaterThan(marcos[i - 1].percentualConsumo)
    }

    // e o valor deve bater com o registrado no histórico completo naquele mês
    marcos.forEach((linha) => {
      const linhaHistorico = historico.find((l) => l.mes === linha.mes)!
      expect(linha.percentualConsumo).toBeCloseTo(linhaHistorico.percentualConsumo, 10)
    })
  })
})
