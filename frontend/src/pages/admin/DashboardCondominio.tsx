import { useState } from "react";
import { Link } from "react-router-dom";
import { Overview } from "@/components/dashboard/Overview";
import { HogaresMorosos } from "@/components/dashboard/HogaresMorosos";
import Navbar from "@/components/Navbar";
import { SidebarAdmin } from "@/components/SidebarAdmin";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  MoreHorizontal, 
  ChevronLeft,
  ChevronRight,
  Wallet
} from "lucide-react";

export default function DashboardCondominio() {
  const [currentChart, setCurrentChart] = useState(0);
  const totalCharts = 3; 

  const handleNext = () => setCurrentChart((prev) => (prev + 1) % totalCharts);
  const handlePrev = () => setCurrentChart((prev) => (prev - 1 + totalCharts) % totalCharts);

  const greenColor = "#99D050"; 
  
  // Estilo Sólido (Shadow Compacta)
  const cardStyle = `border border-gray-100 bg-white rounded-[20px] shadow-[0px_4px_10px_rgba(153,208,80,0.25)] transition-none`;

  return (
    // CAMBIO 1: flex-col en lugar de flex (por defecto row) para apilar Navbar sobre el resto
    <div className="flex flex-col h-screen w-full bg-[#F5F6F8] overflow-hidden font-sans">
      
      {/* NAVBAR: Ahora está arriba de todo, ocupando todo el ancho */}
      <Navbar />

      {/* CONTENEDOR INFERIOR: Este divide el espacio restante entre Sidebar y Main */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR: Ahora vive dentro de este contenedor inferior */}
        <div className="h-full hidden md:block border-r border-gray-200/50"> {/* Opcional: border-r para separar visualmente */}
          <SidebarAdmin className="h-full" />
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden"> 
          {/* Nota: agregué overflow-y-auto aquí para que el scroll sea solo en el contenido */}
          
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
                      <p className="text-sm font-bold text-gray-500 mb-1">Ingreso por renta</p>
                      <div className="text-5xl font-extrabold text-gray-800 tracking-tight">$800M</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`${cardStyle} flex flex-col justify-center items-center text-center`}>
                  <CardContent className="p-0">
                      <p className="text-sm font-bold text-gray-500 mb-2">Índice de Morosidad</p>
                      <div className="text-6xl font-extrabold text-gray-900 tracking-tight">30%</div>
                  </CardContent>
                </Card>

                <Card className={`${cardStyle} flex flex-col justify-center items-center text-center`}>
                  <CardContent className="p-0">
                      <p className="text-sm font-bold text-gray-500 mb-2">Multas Registradas</p>
                      <div className="text-6xl font-extrabold text-gray-900 tracking-tight">30</div>
                  </CardContent>
                </Card>
              </div>

              {/* FILA 2: GRÁFICO */}
              <div className="flex items-center gap-4 flex-1 min-h-0">
                
                <Button onClick={handlePrev} variant="ghost" size="icon" className="rounded-full bg-white h-12 w-12 border border-gray-100 shadow-[0px_2px_5px_rgba(0,0,0,0.1)] text-gray-400 hover:text-[#99D050] shrink-0 active:scale-95 transition-transform">
                  <ChevronLeft className="h-7 w-7" />
                </Button>

                <Card className={`${cardStyle} w-full h-full flex flex-col relative overflow-hidden`}>
                  {currentChart === 0 ? (
                    <>
                      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-8 shrink-0 z-10 bg-white">
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold" style={{ color: greenColor }}>Ingresos</span>
                            <span className="text-sm text-gray-400 font-medium hidden xl:block">Gasto común + Renta + Servicios</span>
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
                            <Overview /> 
                        </div>
                      </CardContent>

                      <div className="flex justify-center items-center h-8 shrink-0 pb-2 z-10 bg-white">
                          {[0, 1, 2].map((idx) => (
                            <button 
                              key={idx}
                              onClick={() => setCurrentChart(idx)}
                              className={`rounded-full transition-all duration-300 mx-1.5 ${currentChart === idx ? 'w-8 h-2.5' : 'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300'}`}
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
                               className={`rounded-full transition-all duration-300 mx-1.5 ${currentChart === idx ? 'w-8 h-2.5' : 'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300'}`}
                               style={{ backgroundColor: currentChart === idx ? greenColor : undefined }}
                             />
                           ))}
                        </div>
                    </CardContent>
                  )}
                </Card>

                <Button onClick={handleNext} variant="ghost" size="icon" className="rounded-full bg-white h-12 w-12 border border-gray-100 shadow-[0px_2px_5px_rgba(0,0,0,0.1)] text-gray-400 hover:text-[#99D050] shrink-0 active:scale-95 transition-transform">
                  <ChevronRight className="h-7 w-7" />
                </Button>
              </div>

              {/* FILA 3: KPIs INFERIORES */}
              <div className="grid grid-cols-3 gap-6 h-[140px] shrink-0">
                <Card className={`${cardStyle} flex flex-col justify-center items-center text-center p-4`}>
                   <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Ingresos Reservas</p>
                   <div className="text-4xl font-extrabold mt-2 text-gray-900">$341.820</div>
                </Card>
                <Card className={`${cardStyle} flex flex-col justify-center items-center text-center p-4`}>
                   <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Residentes</p>
                   <div className="text-4xl font-extrabold mt-2 text-gray-900">300.000</div>
                </Card>
                <Card className={`${cardStyle} flex flex-col justify-center items-center text-center p-4`}>
                   <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Reservas por confirmar</p>
                   <div className="text-5xl font-extrabold mt-2 text-gray-900">20</div>
                </Card>
              </div>
            </div>

            {/* === COLUMNA DERECHA === */}
            <div className="flex-1 flex flex-col gap-6 min-w-[340px] max-w-[420px]">
              <Card className={`${cardStyle} flex-none`}>
                <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
                  <CardTitle className="text-lg font-bold text-gray-900">Avisos Comunidad</CardTitle>
                  <Link to="/admin/anuncios">
                    <Button size="sm" className="text-white font-bold h-7 rounded-md px-3 text-xs shadow-none active:scale-95 transition-transform" style={{ backgroundColor: greenColor }}>
                      Ver más
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-5">
                   <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-lg border border-blue-100">🎉</div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">Fiestas Patrias</p>
                          <p className="text-xs text-gray-400 mt-0.5">Mañana 14:00 hrs</p>
                        </div>
                      </div>
                      <MoreHorizontal className="h-5 w-5 text-gray-300" />
                   </div>
                   <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-lg border border-red-100">
                             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="h-8 w-8" alt="icon" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">Lavadora 2 no funciona</p>
                          <p className="text-xs text-gray-400 mt-0.5">Por favor arreglar.</p>
                        </div>
                      </div>
                      <MoreHorizontal className="h-5 w-5 text-gray-300" />
                   </div>
                   <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center text-lg border border-orange-100">😎</div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">Piscina disponible</p>
                          <p className="text-xs text-gray-400 mt-0.5">¡Llegó el verano!</p>
                        </div>
                      </div>
                      <MoreHorizontal className="h-5 w-5 text-gray-300" />
                   </div>
                </CardContent>
              </Card>

              <div className="flex-1 min-h-0">
                <HogaresMorosos customStyle={cardStyle} greenColor={greenColor} />
              </div>

              <Card className={`${cardStyle} flex flex-col justify-center items-center text-center p-6 h-[140px] shrink-0 border-2 border-[#E4F4C8]`}>
                   <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Deuda Total de Impago</p>
                   <div className="text-4xl font-extrabold mt-2 text-gray-900 tracking-tight">$237.821.234</div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}