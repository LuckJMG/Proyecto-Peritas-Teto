import { useState } from "react";
import { ArrowLeft, Search, Download, ArrowUpDown, AlertCircle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavbarResidente from "@/components/NavbarResidente";
import { useDetalleCuenta } from "@/hooks/useDetalleCuenta";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DetalleGastoPage() {
  const navigate = useNavigate();
  const { movimientos, deudaTotal, loading, error } = useDetalleCuenta();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filtros y Ordenamiento Local
  const processedMovimientos = movimientos
    .filter((mov) => {
      const matchesSearch = mov.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "ALL" || mov.categoria === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      return sortOrder === "desc" 
        ? b.fecha.getTime() - a.fecha.getTime() 
        : a.fecha.getTime() - b.fecha.getTime();
    });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      <NavbarResidente />

      <main className="max-w-5xl mx-auto px-6 mt-8">
        
        {/* Navigation */}
        <div 
          onClick={() => navigate('/resumen')}
          className="flex items-center gap-2 text-gray-500 mb-6 cursor-pointer hover:text-gray-800 w-fit transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Volver al resumen</span>
        </div>

        {/* Resumen Card */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <FileText className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Detalle Financiero</h1>
                <p className="text-gray-500 text-sm">Historial de todos tus movimientos</p>
            </div>
          </div>
          
          <div className="text-right border-l pl-6 border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total a Pagar</p>
            <div className={`text-3xl font-bold ${deudaTotal > 0 ? "text-red-600" : "text-green-600"}`}>
              {deudaTotal > 0 ? formatCurrency(deudaTotal) : "$0"}
            </div>
            <p className={`text-xs font-semibold mt-1 ${deudaTotal > 0 ? "text-red-500" : "text-green-500"}`}>
              {deudaTotal > 0 ? "● Deuda Pendiente" : "● Al día"}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-end sm:items-center">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Input
                placeholder="Buscar (ej: Reserva Quincho)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas las categorías</SelectItem>
                <SelectItem value="GASTO_BASE">Gastos Comunes</SelectItem>
                <SelectItem value="RESERVA">Reservas</SelectItem>
                <SelectItem value="MULTA">Multas</SelectItem>
                <SelectItem value="PAGO">Pagos Realizados</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button 
                variant="outline" 
                className="gap-2 bg-white"
                onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
            >
                <ArrowUpDown className="w-4 h-4" /> 
                {sortOrder === "desc" ? "Más recientes" : "Más antiguos"}
            </Button>
            <Button variant="outline" className="gap-2 bg-white text-gray-600">
                <Download className="w-4 h-4" /> Exportar
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden rounded-xl">
          <CardContent className="p-0">
            {loading ? (
               <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
                 Cargando movimientos...
               </div>
            ) : error ? (
               <div className="p-8 text-center text-red-500 flex flex-col items-center gap-2">
                 <AlertCircle className="w-6 h-6" /> {error}
               </div>
            ) : processedMovimientos.length === 0 ? (
               <div className="p-12 text-center text-gray-400">
                 No se encontraron movimientos registrados.
               </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                    <tr>
                      <th className="px-6 py-4 w-[150px]">Fecha</th>
                      <th className="px-6 py-4">Descripción</th>
                      <th className="px-6 py-4 text-center w-[120px]">Categoría</th>
                      <th className="px-6 py-4 text-right w-[150px]">Monto</th>
                      <th className="px-6 py-4 text-center w-[120px]">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {processedMovimientos.map((mov) => (
                      <tr key={mov.id} className="hover:bg-gray-50/50 transition-colors bg-white">
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                          {mov.fecha.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{mov.descripcion}</span>
                            <span className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide font-mono">
                                REF: {mov.id}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge 
                            variant="secondary" 
                            className={`
                              ${mov.categoria === 'PAGO' ? 'bg-green-100 text-green-700' : 
                                mov.categoria === 'MULTA' ? 'bg-red-100 text-red-700' :
                                mov.categoria === 'RESERVA' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'}
                              border-0 font-medium px-2.5 py-0.5 text-xs
                            `}
                          >
                            {mov.categoria.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right font-medium whitespace-nowrap">
                          <span className={`flex items-center justify-end gap-1 ${mov.tipo === 'ABONO' ? 'text-green-600' : 'text-red-600'}`}>
                            {mov.tipo === 'ABONO' ? '+' : '-'} 
                            {formatCurrency(mov.monto)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          {mov.estado === 'PAGADO' || mov.estado === 'APROBADO' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> PAGADO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> {mov.estado}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
