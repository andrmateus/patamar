import { Download } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { usePwaInstall } from "@/lib/usePwaInstall"

export function InstalarApp() {
  const { mostrar, android, instalar } = usePwaInstall()

  if (!mostrar) return null

  if (android) {
    return (
      <button
        type="button"
        onClick={instalar}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
      >
        <Download className="size-3.5" />
        Instalar app
      </button>
    )
  }

  return (
    <Popover>
      <PopoverTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}>
        <Download className="size-3.5" />
        Instalar app
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 gap-2">
        <PopoverTitle className="text-xs uppercase tracking-wide text-muted-foreground">
          Instalar no iPhone/iPad
        </PopoverTitle>
        <p className="text-xs leading-relaxed text-foreground">
          Toque em <strong>Compartilhar</strong> na barra do Safari e depois em{" "}
          <strong>Adicionar à Tela de Início</strong>.
        </p>
      </PopoverContent>
    </Popover>
  )
}
