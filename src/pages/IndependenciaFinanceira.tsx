import { Simulador } from "@/components/Simulador"
import { PAGINAS } from "@/lib/paginas"
import { useSeo } from "@/lib/seo"

const PAGINA = PAGINAS.find((pagina) => pagina.caminho === "/independencia-financeira")!

export function IndependenciaFinanceira() {
  useSeo(PAGINA)

  return <Simulador />
}
