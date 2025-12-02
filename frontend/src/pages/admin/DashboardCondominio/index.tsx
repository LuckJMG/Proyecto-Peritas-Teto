import { useState } from "react";
import { Link } from "react-router-dom";
import { Overview } from "./Overview";
import { HogaresMorosos } from "./HogaresMorosos";
import Navbar from "@/components/Navbar";
import { SidebarAdmin } from "@/components/SidebarAdmin";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  ChevronLeft,
  ChevronRight,
  Wallet,
  Loader2,
  Megaphone
} from "lucide-react";

export default function DashboardCondominio() {
  const [currentChart, setCurrentChart] = useState(0);
  const totalCharts = 3;
  
  // Conectar con datos reales del backend
  const dashboardData = useDashboardData();

  const handleNext = () => setCurrentChart((prev) => (prev + 1) % totalCharts);
  const handlePrev = () => setCurrentChart((prev) => (prev - 1 + totalCharts) % totalCharts);

  const greenColor = "#99D050"; 
  const cardStyle = `border border-gray-100 bg-white rounded-[20px] shadow-[0px_4px_10px_rgba(153,208,80,0.25)] transition-none`;

  // Función helper para formatear montos
  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(monto);
  };


  // Loading State
  if (dashboardData.loading) {
    return (
      <div className="flex flex-col h-screen w-full bg-[#F5F6F8]">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#99D050]" />
            <p className="text-gray-500 font-medium">Cargando datos del dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State (Mostrar datos de respaldo)
  if (dashboardData.error) {
    console.warn("Error en dashboard:", dashboardData.error);
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#F5F6F8] overflow-hidden font-sans">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <div className="h-full hidden md:block border-r border-gray-200/50">
          <SidebarAdmin className="h-full" />
        </div>

        <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden">
          <div className="flex h-full gap-6">
            
            {/* === COLUMNA IZQUIERDA === */}
            <div className="flex-[3] flex flex-col gap-6 h-full min-w-0">
              
              {/* FILA 1: KPIs SUPERIORES */}
              <div className="grid grid-cols-3 gap-6 h-[150px] shrink-0">
                <Card className={`${cardStyle} flex flex-col justify-center relative overflow-hidden`}>
                  <CardContent className="p-0 flex items-center gap-4 px-6 relative z-10">
                    <div className="h-20 w-20 rounded-full flex items-center justify-center shrink-0 bg-[#E4F4C8]">
                       <div className="bg-white p-3 rounded-full shadow-sm">
                         <DollarSign className="h-9 w-9" style={{ color: greenColor, fill: greenColor }} />
                       </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-500 mb-1">Ingreso Total</p>
                      <div className="text-4xl font-extrabold text-gray-800 tracking-tight">
                        {formatMonto(dashboardData.ingresoTotal)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`${cardStyle} flex flex-col justify-center items-center text-center`}>
                  <CardContent className="p-0">
                      <p className="text-sm font-bold text-gray-500 mb-2">Índice de Morosidad</p>
                      <div className="text-6xl font-extrabold text-gray-900 tracking-tight">
                        {dashboardData.morosidadPorcentaje}%
                      </div>
                  </CardContent>
                </Card>

                <Card className={`${cardStyle} flex flex-col justify-center items-center text-center`}>
                  <CardContent className="p-0">
                      <p className="text-sm font-bold text-gray-500 mb-2">Multas Registradas</p>
                      <div className="text-6xl font-extrabold text-gray-900 tracking-tight">
                        {dashboardData.multasRegistradas}
                      </div>
                  </CardContent>
                </Card>
              </div>

              {/* FILA 2: GRÁFICO */}
              <div className="flex items-center gap-4 flex-1 min-h-0">
                
                <Button 
                  onClick={handlePrev} 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full bg-white h-12 w-12 border border-gray-100 shadow-[0px_2px_5px_rgba(0,0,0,0.1)] text-gray-400 hover:text-[#99D050] shrink-0 active:scale-95 transition-transform"
                >
                  <ChevronLeft className="h-7 w-7" />
                </Button>

                <Card className={`${cardStyle} w-full h-full flex flex-col relative overflow-hidden`}>
                  {currentChart === 0 ? (
                    <>
                      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-8 shrink-0 z-10 bg-white">
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold" style={{ color: greenColor }}>Ingresos</span>
                            <span className="text-sm text-gray-400 font-medium hidden xl:block">
                              Gasto común + Renta + Servicios
                            </span>
                          </div>
                          <div className="flex gap-6 text-xs font-bold uppercase tracking-wide">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: greenColor }}></div> 
                              <span className="text-gray-600">Dinero Ingresado</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-[#E4F4C8]"></div> 
                              <span className="text-gray-400">Dinero estimado</span>
                            </div>
                          </div>
                      </CardHeader>
                      
                      <CardContent className="flex-1 w-full min-h-0 relative">
                        <div className="absolute inset-0 pb-2 pr-4 pl-0">
                          {dashboardData.graficoData.length > 0 ? (
                            <Overview data={dashboardData.graficoData} />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-gray-400">No hay datos disponibles</p>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <div className="flex justify-center items-center h-8 shrink-0 pb-2 z-10 bg-white">
                          {[0, 1, 2].map((idx) => (
                            <button 
                              key={idx}
                              onClick={() => setCurrentChart(idx)}
                              className={`rounded-full transition-all duration-300 mx-1.5 ${
                                currentChart === idx ? 'w-8 h-2.5' : 'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300'
                              }`}
                              style={{ backgroundColor: currentChart === idx ? greenColor : undefined }}
                            />
                          ))}
                      </div>
                    </>
                  ) : (
                    <CardContent className="flex flex-col items-center justify-center flex-1 w-full animate-in zoom-in-95 duration-300">
                        <div className="h-20 w-20 rounded-full bg-[#E4F4C8] flex items-center justify-center mb-4">
                            <Wallet className="h-10 w-10 text-[#99D050]" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-400">Gráfico {currentChart + 1}</h3>
                        <p className="text-gray-400 mt-2">Próximamente</p>
                        <div className="flex justify-center mt-8">
                           {[0, 1, 2].map((idx) => (
                             <button 
                               key={idx}
                               onClick={() => setCurrentChart(idx)}
                               className={`rounded-full transition-all duration-300 mx-1.5 ${
                                 currentChart === idx ? 'w-8 h-2.5' : 'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300'
                               }`}
                               style={{ backgroundColor: currentChart === idx ? greenColor : undefined }}
                             />
                           ))}
                        </div>
                    </CardContent>
                  )}
                </Card>

                <Button 
                  onClick={handleNext} 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full bg-white h-12 w-12 border border-gray-100 shadow-[0px_2px_5px_rgba(0,0,0,0.1)] text-gray-400 hover:text-[#99D050] shrink-0 active:scale-95 transition-transform"
                >
                  <ChevronRight className="h-7 w-7" />
                </Button>
              </div>

              {/* FILA 3: KPIs INFERIORES */}
              <div className="grid grid-cols-3 gap-6 h-[140px] shrink-0">
                <Card className={`${cardStyle} flex flex-col justify-center items-center text-center p-4`}>
                   <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Ingresos Reservas</p>
                   <div className="text-4xl font-extrabold mt-2 text-gray-900">
                     {formatMonto(dashboardData.ingresosReservas)}
                   </div>
                </Card>
                <Card className={`${cardStyle} flex flex-col justify-center items-center text-center p-4`}>
                   <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Residentes Activos</p>
                   <div className="text-4xl font-extrabold mt-2 text-gray-900">
                     {dashboardData.usuariosActivos}
                   </div>
                </Card>
                <Card className={`${cardStyle} flex flex-col justify-center items-center text-center p-4`}>
                   <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Reservas por confirmar</p>
                   <div className="text-5xl font-extrabold mt-2 text-gray-900">
                     {dashboardData.reservasPorConfirmar}
                   </div>
                </Card>
              </div>
            </div>

            {/* === COLUMNA DERECHA === */}
            <div className="flex-1 flex flex-col gap-6 min-w-[340px] max-w-[420px]">
              
              {/* AVISOS COMUNIDAD */}
              <Card className={`${cardStyle} flex-none`}>
                <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
                  <CardTitle className="text-lg font-bold text-gray-900">Avisos Comunidad</CardTitle>
                  <Link to="/admin/anuncios">
                    <Button 
                      size="sm" 
                      className="text-white font-bold h-7 rounded-md px-3 text-xs shadow-none active:scale-95 transition-transform" 
                      style={{ backgroundColor: greenColor }}
                    >
                      Ver más
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-5">
                  {dashboardData.anuncios.length > 0 ? (
                    dashboardData.anuncios.map((anuncio) => (
                      <div key={anuncio.id} className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-10 w-10 border-2 border-gray-100 shadow-sm shrink-0">
                            <AvatarImage src={anuncio.avatar} alt={anuncio.nombreAutor} />
                            <AvatarFallback className="bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 text-white font-bold text-xs">
                              {anuncio.nombreAutor.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 line-clamp-1">{anuncio.titulo}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{anuncio.nombreAutor} • {anuncio.fecha}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                        <Megaphone className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-gray-400 text-sm">No hay anuncios recientes</p>
                      <Link to="/admin/anuncios">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="mt-3 text-xs"
                        >
                          Crear primer anuncio
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* HOGARES MOROSOS */}
              <div className="flex-1 min-h-0">
                <HogaresMorosos 
                  customStyle={cardStyle} 
                  greenColor={greenColor}
                  data={dashboardData.hogaresMorosos}
                />
              </div>

              {/* DEUDA TOTAL */}
              <Card className={`${cardStyle} flex flex-col justify-center items-center text-center p-6 h-[140px] shrink-0 border-2 border-[#E4F4C8]`}>
                   <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Deuda Total de Impago</p>
                   <div className="text-4xl font-extrabold mt-2 text-gray-900 tracking-tight">
                     {formatMonto(dashboardData.deudaTotal)}
                   </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}