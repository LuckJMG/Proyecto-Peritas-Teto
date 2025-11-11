import { BrowserRouter, Routes, Route } from "react-router-dom"
import ListaCondominios from "@/pages/super-admin/ListaCondominios"
import Login from "@/pages/auth/Login"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/condominios" element={<ListaCondominios />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}