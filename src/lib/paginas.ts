/**
 * Fonte única de metadados de rota — usada pela Home (lista de
 * calculadoras), pelo hook de SEO (título/descrição/OG por página) e pelo
 * script de prerender (scripts/prerender.ts, que gera dist/sitemap.xml e o
 * HTML estático de cada rota). Ao adicionar uma calculadora nova: criar a
 * página em src/pages/, registrar a rota em src/AppRoutes.tsx e adicionar
 * uma entrada aqui.
 */

export const SITE_URL = "https://patamar.vercel.app"
export const SITE_NOME = "Patamar"

export interface Pagina {
  caminho: string
  titulo: string
  descricao: string
  /** Aparece como card na Home. A própria Home tem `card: false`. */
  card: boolean
}

export const PAGINAS: Pagina[] = [
  {
    caminho: "/",
    titulo: SITE_NOME,
    descricao: "Simuladores para planejar decisões financeiras de longo prazo.",
    card: false,
  },
  {
    caminho: "/independencia-financeira",
    titulo: "Independência financeira",
    descricao:
      "Simule quando a renda passiva do seu patrimônio passa a cobrir o seu padrão de vida, mês a mês, até a independência total.",
    card: true,
  },
]
