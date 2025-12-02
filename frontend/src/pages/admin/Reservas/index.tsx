import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { SidebarAdmin } from "@/components/SidebarAdmin";
import { Loader2, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReservasAdmin } from "@/hooks/useReservasAdmin";
import { ReservasTable } from "./components/ReservasTable";
import { ReservasFilters } from "./components/ReservasFilters";
import { PendingRequests } from "./components/PendingRequests";
import { AdminReservationDialog } from "./components/AdminReservationDialog";
import { fetchWithAuth, authService } from "@/services/authService";
import { reservaService } from "@/services/reservaService";
import { espaciosComunesService, type EspacioComun } from "@/services/espaciosComunesService";

export default function ReservasPage() {
  const { data, loading, error, reload } = useReservasAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminEspacios, setAdminEspacios] = useState<EspacioComun[]>([]);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const user = authService.getUser();
        if (user?.condominio_id) {
            const espacios = await espaciosComunesService.getByCondominio(user.condominio_id);
            setAdminEspacios(espacios);
        }
      } catch (e) {
        console.error("Error cargando datos admin", e);
      }
    };
    loadAdminData();
  }, []);

  const filteredTableData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.nombreResidente.toLowerCase().includes(term) ||
      item.nombreEspacio.toLowerCase().includes(term);
    const matchesStatus =
      statusFilter === "ALL" || item.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = async (id: number, action: string) => {
    try {
      if (action === "DELETE") {
        await reservaService.delete(id);
      } else {
        const original = data.find((r) => r.id === id);
        if (!original) return;
        const payload = { ...original, estado: action };
        const res = await fetchWithAuth(
          `http://localhost:8000/api/v1/reservas/${id}`,
          { method: "PUT", body: JSON.stringify(payload) }
        );
        if (!res.ok) throw new Error("Error al actualizar estado");
      }
      await reload();
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al procesar la solicitud.");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">

        <div className="h-full hidden md:block border-r bg-white">
          <SidebarAdmin className="h-full" />
        </div>

        {/* MAIN: Contenido con Scroll propio */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">

          <div className="max-w-[1400px] mx-auto">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Gestión de Reservas
                </h1>
                <p className="text-gray-500 mt-1">
                  Administra las solicitudes y el historial de espacios comunes.
                </p>
              </div>

              <Button 
                onClick={() => setShowAdminDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all active:scale-[0.98]"
              >
                <CalendarPlus className="mr-2 h-4 w-4" />
                Nuevo Evento Comunidad
              </Button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#99D050]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Historial de Reservas</h2>
                    <ReservasFilters
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                      statusFilter={statusFilter}
                      onStatusFilterChange={setStatusFilter}
                    />
                    <ReservasTable
                      reservas={filteredTableData}
                      onUpdateStatus={handleAction}
                    />
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <div className="sticky top-6">
                    <PendingRequests 
                      reservas={data} 
                      onAction={(id, action) => handleAction(id, action)} 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <AdminReservationDialog 
        open={showAdminDialog}
        onOpenChange={setShowAdminDialog}
        onSuccess={reload}
        espacios={adminEspacios}
      />
    </div>
  );
}
