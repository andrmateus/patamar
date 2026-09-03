const numeroUmaCasa = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const numeroInteiro = new Intl.NumberFormat("pt-BR")

export function fmt1(x: number): string {
  return numeroUmaCasa.format(x)
}

export function fmtInt(x: number): string {
  return numeroInteiro.format(x)
}

export function fmtPct(x: number): string {
  return `${fmt1(x)}%`
}
