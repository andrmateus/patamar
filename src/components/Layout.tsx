import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { InstalarApp } from "@/components/InstalarApp"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useTema } from "@/lib/tema"

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [tema, setTema] = useTema()

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-20 h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-full max-w-4xl items-center justify-between px-5">
          <Link to="/" className="text-sm font-semibold tracking-tight hover:text-foreground/80">
            Patamar
          </Link>
          <div className="flex items-center gap-2">
            <InstalarApp />
            <ThemeToggle tema={tema} onChange={setTema} />
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
