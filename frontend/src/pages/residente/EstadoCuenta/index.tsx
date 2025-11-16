import NavbarResidente from "@/components/NavbarResidente";
import ResumenGastoComun from "./ResumenGastoComun";
import ResumenMultas from "./ResumenMultas";
import TablonAnuncios from "./TablonAnuncios";

export default function EstadoCuentaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
		<NavbarResidente/>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
		<div className="pb-4">
		  <h1 className="font-['Inter'] font-medium text-xl pb-2">Estado de Cuenta</h1>
		  <p className="text-sm text-gray-500">Resumen de tu hogar</p>
		</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estado de Cuenta - 2 columnas */}
          <div className="lg:col-span-2 space-y-6">
			<ResumenGastoComun />
			<ResumenMultas />
          </div>

          {/* Avisos - 1 columna */}
          <div className="lg:col-span-1">
			<TablonAnuncios />
          </div>
        </div>
      </div>
    </div>
  );
}
