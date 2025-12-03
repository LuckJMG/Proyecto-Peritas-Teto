import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, Search, Filter } from "lucide-react";
import NavbarResidente from "@/components/NavbarResidente";
import { MultaCard } from "./MultaCard";
import { MultaDetailDialog } from "./MultaDetailDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

import { multaService, type Multa } from "@/services/multaService";
import { authService } from "@/services/authService";
import { residenteService } from "@/services/residenteService";

export default function MultasResidente() {
  const [multas, setMultas] = useState<Multa[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  
  // Modal
  const [selectedMulta, setSelectedMulta] = useState<Multa | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const user = authService.getUser();
      
      if (user?.id) {
        // 1. Obtener ID del residente asociado al usuario
        const allResidentes = await residenteService.getAll();
        const miResidente = allResidentes.find((r: any) => r.usuario_id === user.id);

        if (miResidente) {
          // 2. Cargar multas del residente
          const data = await multaService.getAll(miResidente.id);
          // Ordenar por fecha (más recientes primero)
          const sorted = data.sort((a, b) => {
             const dateA = a.fecha_emision ? new Date(a.fecha_emision).getTime() : 0;
             const dateB = b.fecha_emision ? new Date(b.fecha_emision).getTime() : 0;
             return dateB - dateA;
          });
          setMultas(sorted);
        }
      }
    } catch (error) {
      console.error("Error al cargar multas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (multa: Multa) => {
    setSelectedMulta(multa);
    setDialogOpen(true);
  };

  // Lógica de filtrado
  const filteredMultas = multas.filter(m => {
    const matchesSearch = 
      m.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "ALL" || m.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <NavbarResidente />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              Mis Multas
            </h1>
            <p className="text-gray-500 mt-2 ml-1">
              Revisa el historial de infracciones y su estado de pago.
            </p>
          </div>
        </div>

        {/* Barra de Herramientas (Buscador y Filtro) */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar por motivo..." 
              className="pl-9 border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-[200px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-gray-200">
                <div className="flex items-center gap-2 text-gray-600">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Estado" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                <SelectItem value="PAGADA">Pagadas</SelectItem>
                <SelectItem value="CONDONADA">Condonadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-[#99D050]" />
          </div>
        ) : filteredMultas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Sin registros</h3>
            <p className="text-gray-500 mt-1">
              {searchTerm || statusFilter !== "ALL" 
                ? "No se encontraron multas con estos filtros." 
                : "¡Excelente! No tienes multas registradas en el sistema."}
            </p>
            {(searchTerm || statusFilter !== "ALL") && (
               <Button variant="link" onClick={() => {setSearchTerm(""); setStatusFilter("ALL")}} className="mt-2 text-[#99D050]">
                 Limpiar filtros
               </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMultas.map((multa) => (
              <MultaCard 
                key={multa.id} 
                multa={multa} 
                onClick={handleCardClick} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de Detalle */}
      <MultaDetailDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        multa={selectedMulta} 
      />
    </div>
  );
}
