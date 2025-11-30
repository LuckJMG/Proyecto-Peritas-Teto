// frontend/src/pages/residente/EstadoCuenta/index.tsx
import NavbarResidente from "@/components/NavbarResidente";
import ResumenGastoComun from "./ResumenGastoComun";
import ResumenMultas from "./ResumenMultas";
import TablonAnuncios from "./TablonAnuncios";


export default function EstadoCuentaPage() {

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarResidente />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header de la Página */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Estado de Cuenta
            </h1>
            <p className="text-gray-500 mt-1">
              Resumen de tu hogar
            </p>
          </div>
          
          <div className="flex gap-3">

          </div>
        </div>

        {/* Grid de contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <ResumenGastoComun />
            <ResumenMultas />
          </div>

          {/* Columna Derecha (1/3) */}
          <div className="lg:col-span-1">
            <TablonAnuncios />
          </div>
        </div>
      </div>
    </div>
  );
}