import { BrowserRouter, Routes, Route} from "react-router-dom";
import ListaCondominios from "@/pages/super-admin/ListaCondominios";
import ListaUsuarios from "@/pages/admin/ListaUsuarios";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/condominios" element={<ListaCondominios />} />
        <Route path="/usuarios" element={<ListaUsuarios />} />
      </Routes>
    </BrowserRouter>
  );
}
