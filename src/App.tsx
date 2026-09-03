import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Layout } from "@/components/Layout"
import { Home } from "@/pages/Home"
import { IndependenciaFinanceira } from "@/pages/IndependenciaFinanceira"

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/independencia-financeira" element={<IndependenciaFinanceira />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
