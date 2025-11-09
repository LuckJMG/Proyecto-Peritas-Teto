import { BrowserRouter, Routes, Route } from "react-router-dom"
import ListaCondominios from "@/pages/super-admin/ListaCondominios"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/condominios" element={<ListaCondominios />} />
      </Routes>
    </BrowserRouter>
  )
}