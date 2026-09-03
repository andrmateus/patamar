import { useEffect } from "react"
import { Simulador } from "@/components/Simulador"

export function IndependenciaFinanceira() {
  useEffect(() => {
    document.title = "Independência financeira · Calculadoras financeiras"
  }, [])

  return <Simulador />
}
