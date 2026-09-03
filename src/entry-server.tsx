import { renderToStaticMarkup } from "react-dom/server"
import { StaticRouter } from "react-router-dom"
import { AppRoutes } from "@/AppRoutes"

/**
 * Entry compilado à parte pelo Vite em modo SSR (ver script "build" em
 * package.json: `vite build --ssr`) — vira dist-ssr/entry-server.js, um
 * módulo Node comum (sem JSX/TS), importado por scripts/prerender.ts pra
 * gerar o HTML estático de cada rota.
 */
export function render(caminho: string): string {
  return renderToStaticMarkup(
    <StaticRouter location={caminho}>
      <AppRoutes />
    </StaticRouter>,
  )
}
