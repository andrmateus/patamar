import { useEffect, useState } from "react"

export type Tema = "sistema" | "claro" | "escuro"

const CHAVE_ARMAZENAMENTO = "tema"

function lerTemaSalvo(): Tema {
  if (typeof window === "undefined") return "sistema"
  const salvo = window.localStorage.getItem(CHAVE_ARMAZENAMENTO)
  return salvo === "claro" || salvo === "escuro" ? salvo : "sistema"
}

/**
 * Estado do tema (claro/escuro/sistema), persistido em localStorage e
 * aplicado como classe .light/.dark em <html> — index.css usa essa classe
 * (ou a ausência dela, seguindo prefers-color-scheme) para escolher os
 * tokens de cor. Um script inline em index.html aplica a classe salva antes
 * do primeiro paint, então não há flash de tema errado no carregamento.
 */
export function useTema() {
  const [tema, setTema] = useState<Tema>(lerTemaSalvo)

  useEffect(() => {
    const raiz = document.documentElement
    raiz.classList.remove("light", "dark")
    if (tema === "claro") raiz.classList.add("light")
    else if (tema === "escuro") raiz.classList.add("dark")

    if (tema === "sistema") window.localStorage.removeItem(CHAVE_ARMAZENAMENTO)
    else window.localStorage.setItem(CHAVE_ARMAZENAMENTO, tema)
  }, [tema])

  return [tema, setTema] as const
}
