import { useEffect, useState } from "react"

interface EventoAntesDeInstalar extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function ehIOS(): boolean {
  if (typeof navigator === "undefined") return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function ehStandalone(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/**
 * "Instalar app" só faz sentido em Android (via beforeinstallprompt, que só
 * dispara em navegadores Chromium que atendem os critérios de
 * instalabilidade — manifest + service worker, ver vite.config.ts) ou iOS
 * (sem prompt automático: o Safari não expõe esse evento, então o melhor
 * possível é detectar iOS e mostrar a instrução manual de "Adicionar à Tela
 * de Início"). Em desktop este hook nunca reporta `mostrar: true`.
 */
export function usePwaInstall() {
  const [eventoPrompt, setEventoPrompt] = useState<EventoAntesDeInstalar | null>(null)
  const [instalado, setInstalado] = useState(ehStandalone)

  useEffect(() => {
    function aoFicarDisponivel(evento: Event) {
      evento.preventDefault()
      setEventoPrompt(evento as EventoAntesDeInstalar)
    }
    function aoInstalar() {
      setInstalado(true)
      setEventoPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", aoFicarDisponivel)
    window.addEventListener("appinstalled", aoInstalar)
    return () => {
      window.removeEventListener("beforeinstallprompt", aoFicarDisponivel)
      window.removeEventListener("appinstalled", aoInstalar)
    }
  }, [])

  const android = eventoPrompt !== null && !instalado
  const ios = ehIOS() && !instalado

  async function instalar() {
    if (!eventoPrompt) return
    await eventoPrompt.prompt()
    const escolha = await eventoPrompt.userChoice
    if (escolha.outcome === "accepted") setEventoPrompt(null)
  }

  return { mostrar: android || ios, android, ios, instalar }
}
