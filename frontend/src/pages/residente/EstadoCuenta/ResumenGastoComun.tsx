import { Calendar } from "lucide-react";

export default function ResumenGastoComun() {
	return (
	<div className="flex-col items-center p-5 gap-7 left-5 top-0 bg-white border border-solid border-[#E9F5DB] [box-shadow:0px_4px_4px_#BBD386] rounded-[20px]">
	  <div className="mb-6">
		<div className="text-sm text-gray-500 mb-2">Agosto 2025</div>
		<div className="text-5xl font-['Lato'] font-light text-gray-900 mb-4">$ 45.000.000</div>
		<div className="flex items-center justify-between">
		  <span className="text-sm text-red-500">3 meses atrasado</span>
		  <div className="flex gap-2">
			<button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
			  Ver Detalle
			</button>
			<button className="px-4 py-2 bg-[#8BC34A] text-white rounded-lg hover:bg-[#7CB342] transition-colors text-sm font-medium">
			  Pagar Cuenta
			</button>
		  </div>
		</div>
	  </div>

	  <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
		<div>
			<p className="text-sm text-gray-600">
			  Último pago: <span className="font-medium">$43.000</span>
			</p>
			<p className="text-sm text-gray-600">
			  Fecha de pago: <span className="font-medium">20/08/2025</span>
			</p>
		</div>
		<button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
		  <Calendar className="w-4 h-4" />
		  Historial de pagos
		</button>
	  </div>
	</div>
	);
}

