// Roda com Node puro (sem bundler) depois do build — ver o script "build"
// em package.json. Gera, a partir de dist/index.html (o template que o
// `vite build` já produziu, com os <script>/<link> corretos), um
// dist/<rota>/index.html por página, com o HTML já renderizado
// (dist-ssr/entry-server.js) e as meta tags daquela página específicas —
// e também dist/sitemap.xml. Sem isso, crawlers que não executam
// JavaScript veriam só a casca vazia (<div id="root"></div>) em qualquer
// rota que não fosse "/".
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { render } from "../dist-ssr/entry-server.js"
import { PAGINAS, SITE_NOME, SITE_URL, type Pagina } from "../src/lib/paginas.ts"

const DIST = path.resolve(import.meta.dirname, "..", "dist")

function escaparAtributo(texto: string): string {
  return texto.replace(/&/g, "&amp;").replace(/"/g, "&quot;")
}

function substituirTag(html: string, regex: RegExp, novaTag: string): string {
  if (!regex.test(html)) {
    throw new Error(`prerender: tag não encontrada no template (${regex}) — dist/index.html mudou?`)
  }
  return html.replace(regex, novaTag)
}

function montarHtmlDaPagina(template: string, pagina: Pagina, marcacao: string): string {
  const tituloCompleto = pagina.caminho === "/" ? pagina.titulo : `${pagina.titulo} · ${SITE_NOME}`
  const descricao = escaparAtributo(pagina.descricao)
  const url = `${SITE_URL}${pagina.caminho}`
  const titulo = escaparAtributo(tituloCompleto)

  // dotAll ([\s\S] em vez de "." puro) porque o index.html tem atributos
  // quebrados em várias linhas (ex.: <meta\n name="description"\n content="...">).
  let html = template
  html = substituirTag(html, /<title>[\s\S]*?<\/title>/, `<title>${titulo}</title>`)
  html = substituirTag(
    html,
    /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/?>/,
    `<meta name="description" content="${descricao}" />`,
  )
  html = substituirTag(
    html,
    /<link\s+rel="canonical"\s+href="[\s\S]*?"\s*\/?>/,
    `<link rel="canonical" href="${url}" />`,
  )
  html = substituirTag(
    html,
    /<meta\s+property="og:title"\s+content="[\s\S]*?"\s*\/?>/,
    `<meta property="og:title" content="${titulo}" />`,
  )
  html = substituirTag(
    html,
    /<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/?>/,
    `<meta property="og:description" content="${descricao}" />`,
  )
  html = substituirTag(
    html,
    /<meta\s+property="og:url"\s+content="[\s\S]*?"\s*\/?>/,
    `<meta property="og:url" content="${url}" />`,
  )
  html = substituirTag(
    html,
    /<meta\s+name="twitter:title"\s+content="[\s\S]*?"\s*\/?>/,
    `<meta name="twitter:title" content="${titulo}" />`,
  )
  html = substituirTag(
    html,
    /<meta\s+name="twitter:description"\s+content="[\s\S]*?"\s*\/?>/,
    `<meta name="twitter:description" content="${descricao}" />`,
  )
  html = substituirTag(html, /<div id="root">[\s\S]*?<\/div>/, `<div id="root">${marcacao}</div>`)

  return html
}

function montarSitemap(): string {
  const urls = PAGINAS.map((pagina) => `  <url><loc>${SITE_URL}${pagina.caminho}</loc></url>`).join("\n")
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

async function main() {
  const template = await readFile(path.join(DIST, "index.html"), "utf-8")

  for (const pagina of PAGINAS) {
    const marcacao = render(pagina.caminho)
    const html = montarHtmlDaPagina(template, pagina, marcacao)
    const destino =
      pagina.caminho === "/"
        ? path.join(DIST, "index.html")
        : path.join(DIST, pagina.caminho.replace(/^\//, ""), "index.html")

    await mkdir(path.dirname(destino), { recursive: true })
    await writeFile(destino, html)
    console.log(`prerender: ${pagina.caminho} -> ${path.relative(DIST, destino)}`)
  }

  await writeFile(path.join(DIST, "sitemap.xml"), montarSitemap())
  console.log("prerender: sitemap.xml gerado")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
