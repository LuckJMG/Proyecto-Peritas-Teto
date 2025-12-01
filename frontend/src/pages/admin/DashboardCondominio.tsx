import { useState } from "react";
import { format } from "date-fns";
import { Overview } from "@/components/dashboard/Overview";
import { HogaresMorosos } from "@/components/dashboard/HogaresMorosos";
import Navbar from "@/components/Navbar";
import { SidebarAdmin } from "@/components/SidebarAdmin";
import { useDashboardData } from "@/hooks/useDashboardData";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table";
import { 
  DollarSign, 
  FileDown,
  Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DashboardCondominio() {
  // --- ESTADO DE FILTROS ---
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [estadoFilter, setEstadoFilter] = useState<string>("TODOS");

  // --- HOOK DE DATOS ---
  const { 
    ingresoTotal, 
    totalFacturado, 
    cantidadMultas, 
    indiceMorosidad, 
    transacciones,
    loading 
  } = useDashboardData({
    dateRange,
    estadoPago: estadoFilter as any
  });

  const greenColor = "#99D050"; 
  const cardStyle = `border border-gray-100 bg-white rounded-[20px] shadow-[0px_4px_10px_rgba(153,208,80,0.25)] transition-none`;

  // --- EXPORTAR A CSV ---
  const handleExport = () => {
    const headers = ["ID", "Fecha", "Residente", "Concepto", "Monto", "Estado"];
    const rows = transacciones.map(t => [
        t.id,
        format(new Date(t.fecha), 'yyyy-MM-dd HH:mm'),
        t.residente,
        t.concepto,
        t.monto,
        t.estado
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_financiero_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper para Badge de estado
  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'APROBADO': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pagado</Badge>;
          case 'PENDIENTE': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>;
          case 'RECHAZADO': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rechazado</Badge>;
          default: return <Badge variant="outline">{status}</Badge>;
      }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F5F6F8] overflow-hidden font-sans">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <div className="h-full hidden md:block border-r border-gray-200/50">
          <SidebarAdmin className="h-full" />
        </div>

        <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
          
          {/* --- BARRA DE FILTROS SUPERIOR (HU16) --- */}
          <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Reporte Financiero</h1>
            
            <div className="flex items-center gap-3">
              {/* Selector de Fecha */}
              <div className="bg-white rounded-md shadow-sm">
                 <div className="flex items-center border rounded-md px-3 py-2 bg-white gap-2">
                    <span className="text-sm text-gray-500">Desde:</span>
                    <input 
                        type="date" 
                        className="text-sm outline-none"
                        value={dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setDateRange((prev) => ({
                             from: e.target.value ? new Date(e.target.value) : prev?.from,
                             to: prev?.to 
                        }))}
                    />
                    <span className="text-sm text-gray-500">Hasta:</span>
                    <input 
                        type="date" 
                        className="text-sm outline-none"
                        value={dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                        onChange={(e) => setDateRange((prev) => ({
                             from: prev?.from,
                             to: e.target.value ? new Date(e.target.value) : prev?.to
                        }))}
                    />
                 </div>
              </div>

              {/* Selector de Estado */}
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="w-[180px] bg-white">
                  <Filter className="w-4 h-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los estados</SelectItem>
                  <SelectItem value="APROBADO">Pagado</SelectItem>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="RECHAZADO">Rechazado</SelectItem>
                </SelectContent>
              </Select>

              {/* Botón Exportar */}
              <Button 
                onClick={handleExport}
                className="bg-[#99D050] hover:bg-[#88c040] text-white font-bold shadow-md"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>

          <div className="flex h-full gap-6 flex-col xl:flex-row">
            {/* === COLUMNA IZQUIERDA === */}
            <div className="flex-[3] flex flex-col gap-6 h-full min-w-0">
              
              {/* FILA 1: KPIs SUPERIORES (CONECTADOS) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                <Card className={`${cardStyle} flex flex-col justify-center relative overflow-hidden h-[150px]`}>
                  <CardContent className="p-0 flex items-center gap-4 px-6 relative z-10">
                    <div className="h-20 w-20 rounded-full flex items-center justify-center shrink-0 bg-[#E4F4C8]">
                       <div className="bg-white p-3 rounded-full shadow-sm">
                         <DollarSign className="h-9 w-9" style={{ color: greenColor, fill: greenColor }} />
                       </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-500 mb-1">Recaudado (Pagos)</p>
                      <div className="text-3xl font-extrabold text-gray-800 tracking-tight">
                        ${ingresoTotal.toLocaleString('es-CL')}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        vs Facturado: ${totalFacturado.toLocaleString('es-CL')}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`${cardStyle} flex flex-col justify-center items-center text-center h-[150px]`}>
                  <CardContent className="p-0">
                      <p className="text-sm font-bold text-gray-500 mb-2">Índice de Morosidad</p>
                      <div className="text-5xl font-extrabold text-gray-900 tracking-tight">
                        {indiceMorosidad}%
                      </div>
                  </CardContent>
                </Card>

                <Card className={`${cardStyle} flex flex-col justify-center items-center text-center h-[150px]`}>
                  <CardContent className="p-0">
                      <p className="text-sm font-bold text-gray-500 mb-2">Multas del Periodo</p>
                      <div className="text-5xl font-extrabold text-gray-900 tracking-tight">
                        {cantidadMultas}
                      </div>
                  </CardContent>
                </Card>
              </div>

              {/* TABLA DE TRANSACCIONES (HU16 - Requisito Principal) */}
              <Card className="border border-gray-100 bg-white rounded-[20px] shadow-sm overflow-hidden flex-1">
                <CardHeader>
                    <CardTitle>Detalle de Transacciones</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-[400px] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Residente</TableHead>
                                    <TableHead>Concepto</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">Cargando datos...</TableCell>
                                    </TableRow>
                                ) : transacciones.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">No se encontraron transacciones en este periodo.</TableCell>
                                    </TableRow>
                                ) : (
                                    transacciones.map((t: any) => (
                                        <TableRow key={t.id}>
                                            <TableCell>{format(new Date(t.fecha), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell className="font-medium">{t.residente}</TableCell>
                                            <TableCell>{t.concepto}</TableCell>
                                            <TableCell className="text-right font-bold text-gray-700">
                                                ${Number(t.monto).toLocaleString('es-CL')}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {getStatusBadge(t.estado)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                            {/* TOTALES CALCULADOS (Requisito HU) */}
                            <TableFooter className="bg-gray-50">
                                <TableRow>
                                    <TableCell colSpan={3} className="font-bold text-right">Totales del Periodo:</TableCell>
                                    <TableCell className="text-right font-bold text-green-600 text-lg">
                                        ${ingresoTotal.toLocaleString('es-CL')} (Recaudado)
                                    </TableCell>
                                    <TableCell className="text-center text-xs text-gray-500">
                                        / ${totalFacturado.toLocaleString('es-CL')} (Facturado)
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </CardContent>
              </Card>

              {/* GRAFICO (Reutilizado pero conectado) */}
              <div className="h-[300px] w-full">
                  <Card className={`${cardStyle} h-full p-4`}>
                      <Overview /> 
                  </Card>
              </div>

            </div>

            {/* === COLUMNA DERECHA (Mantenemos widgets existentes) === */}
            <div className="flex-1 flex flex-col gap-6 min-w-[300px] max-w-[400px]">
              <div className="flex-1 min-h-0">
                <HogaresMorosos customStyle={cardStyle} greenColor={greenColor} />
              </div>

              <Card className={`${cardStyle} flex flex-col justify-center items-center text-center p-6 h-[140px] shrink-0 border-2 border-[#E4F4C8]`}>
                   <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Deuda Total de Impago</p>
                   <div className="text-4xl font-extrabold mt-2 text-gray-900 tracking-tight">
                       ${useDashboardData({ dateRange: undefined, estadoPago: 'TODOS' }).deudaTotal.toLocaleString('es-CL')}
                   </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}