import { Route, Routes } from "react-router-dom"
import { Layout } from "@/components/Layout"
import { Home } from "@/pages/Home"
import { IndependenciaFinanceira } from "@/pages/IndependenciaFinanceira"

/**
 * Árvore de rotas, sem o Router em volta — reaproveitada tanto pelo entry
 * point do navegador (App.tsx, com BrowserRouter) quanto pelo script de
 * prerender (scripts/prerender.ts, com StaticRouter).
 */
export function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/independencia-financeira" element={<IndependenciaFinanceira />} />
      </Routes>
    </Layout>
  )
}
