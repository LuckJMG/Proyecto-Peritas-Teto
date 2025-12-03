import NavbarResidente from "@/components/NavbarResidente";
import ResumenGastoComun from "./ResumenGastoComun";
import ResumenMultas from "./ResumenMultas";
import TablonAnuncios from "./TablonAnuncios";

export default function EstadoCuentaPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <NavbarResidente />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header de la Página */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Estado de Cuenta
            </h1>
            <p className="text-gray-500 mt-1">
              Resumen financiero de tu hogar
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ResumenGastoComun />
            <ResumenMultas />
          </div>

          <div className="lg:col-span-1 h-full">
            <TablonAnuncios />
          </div>
        </div>
      </div>
    </div>
  );
}
