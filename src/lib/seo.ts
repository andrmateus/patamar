import { useEffect } from "react"
import { SITE_NOME, SITE_URL, type Pagina } from "@/lib/paginas"

function upsertMeta(atributo: "name" | "property", chave: string, conteudo: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${atributo}="${chave}"]`)
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute(atributo, chave)
    document.head.appendChild(el)
  }
  el.setAttribute("content", conteudo)
}

function upsertCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement("link")
    el.setAttribute("rel", "canonical")
    document.head.appendChild(el)
  }
  el.setAttribute("href", href)
}

/**
 * Atualiza title, description, canonical e Open Graph/Twitter ao navegar
 * entre páginas (client-side, via React Router). O HTML gerado no build
 * (scripts/prerender.ts) já nasce com esses mesmos valores — este hook
 * cobre a navegação depois que o app já carregou.
 */
export function useSeo(pagina: Pagina) {
  useEffect(() => {
    const tituloCompleto = pagina.caminho === "/" ? pagina.titulo : `${pagina.titulo} · ${SITE_NOME}`
    const url = `${SITE_URL}${pagina.caminho}`

    document.title = tituloCompleto
    upsertMeta("name", "description", pagina.descricao)
    upsertCanonical(url)
    upsertMeta("property", "og:title", tituloCompleto)
    upsertMeta("property", "og:description", pagina.descricao)
    upsertMeta("property", "og:url", url)
    upsertMeta("property", "og:type", "website")
    upsertMeta("property", "og:site_name", SITE_NOME)
    upsertMeta("name", "twitter:card", "summary")
    upsertMeta("name", "twitter:title", tituloCompleto)
    upsertMeta("name", "twitter:description", pagina.descricao)
  }, [pagina])
}
