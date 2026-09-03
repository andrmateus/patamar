import { useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Calculadora {
  titulo: string
  descricao: string
  rota: string
}

const CALCULADORAS: Calculadora[] = [
  {
    titulo: "Independência financeira",
    descricao:
      "Simule quando a renda passiva do seu patrimônio passa a cobrir o seu padrão de vida, mês a mês, até a independência total.",
    rota: "/independencia-financeira",
  },
]

export function Home() {
  useEffect(() => {
    document.title = "Calculadoras financeiras"
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-5 py-8">
      <header className="mb-7">
        <h1 className="text-xl font-semibold tracking-tight">Calculadoras financeiras</h1>
        <p className="mt-1.5 max-w-prose text-sm text-muted-foreground">
          Simuladores para planejar decisões financeiras. Escolha uma calculadora abaixo.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CALCULADORAS.map((calc) => (
          <Link key={calc.rota} to={calc.rota} className="block">
            <Card className="h-full transition-colors hover:bg-muted/40">
              <CardHeader>
                <CardTitle>{calc.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{calc.descricao}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
