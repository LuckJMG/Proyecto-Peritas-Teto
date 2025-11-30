import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavbarResidente from "@/components/NavbarResidente";
import { authService, fetchWithAuth } from "@/services/authService";
import { reservaService } from "@/services/reservaService";
import {
  espaciosComunesService,
  type EspacioComun,
} from "@/services/espaciosComunesService";

// Local Imports
import { NewReservationDialog } from "./NewReservationDialog";
import { DeleteReservationDialog } from "./DeleteReservationDialog";
import { ReservationsList } from "./ReservationsList";
import type { DateGroup, ReservationView } from "./types";

export default function SistemaReservasPage() {
  const navigate = useNavigate();

  // Data State
  const [futureReservations, setFutureReservations] = useState<DateGroup[]>([]);
  const [pastReservations, setPastReservations] = useState<DateGroup[]>([]);
  const [espacios, setEspacios] = useState<EspacioComun[]>([]);
  const [currentResidenteId, setCurrentResidenteId] = useState<number | null>(null);

  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewReservation, setShowNewReservation] = useState(false);
  
  // Delete State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBackToAccount = () => {
    navigate("/estado");
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getUser();
      if (!currentUser) {
        setError("Usuario no autenticado");
        return;
      }

      // 1. Obtener Perfil Residente
      const resResidentes = await fetchWithAuth("http://localhost:8000/api/v1/residentes");
      if (!resResidentes.ok) throw new Error("Error al cargar perfil");

      const residentes = await resResidentes.json();
      const miResidente = residentes.find((r: any) => r.usuario_id === currentUser.id);

      if (!miResidente) {
        setError("No se encontró un perfil de residente.");
        return;
      }

      setCurrentResidenteId(miResidente.id);

      // 2. Fetch Paralelo
      const [allReservas, espaciosDelCondominio] = await Promise.all([
        reservaService.getAll(),
        espaciosComunesService.getByCondominio(miResidente.condominio_id),
      ]);

      setEspacios(espaciosDelCondominio);

      // 3. Filtrar y Mapear
      const misReservas = allReservas.filter((r) => r.residente_id === miResidente.id);

      const mappedReservations: ReservationView[] = misReservas.map((reserva) => {
        const espacio = espaciosDelCondominio.find((e) => e.id === reserva.espacio_comun_id);
        
        const fechaInicio = new Date(`${reserva.fecha_reserva}T${reserva.hora_inicio}`);
        const fechaFin = new Date(`${reserva.fecha_reserva}T${reserva.hora_fin}`);

        let costoTotal = 0;
        const isValidDate = !isNaN(fechaInicio.getTime()) && !isNaN(fechaFin.getTime());

        if (espacio && espacio.costo_por_hora && isValidDate) {
          const diffMs = fechaFin.getTime() - fechaInicio.getTime();
          const diffHoras = diffMs / (1000 * 60 * 60);
          costoTotal = Math.round(diffHoras * espacio.costo_por_hora);
        }

        const timeOptions: Intl.DateTimeFormatOptions = {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        };

        const timeRange = isValidDate
          ? `${fechaInicio.toLocaleTimeString("es-CL", timeOptions)} - ${fechaFin.toLocaleTimeString("es-CL", timeOptions)}`
          : "Horario inválido";

        return {
          id: reserva.id.toString(),
          type: espacio ? espacio.nombre : "Espacio no disponible",
          timeRange,
          price: costoTotal,
          rawDate: isValidDate ? fechaInicio : new Date(0),
          status: reserva.estado // Pasamos el estado al view
        };
      });

      // 4. Agrupar
      const now = new Date();
      const future: ReservationView[] = [];
      const past: ReservationView[] = [];

      mappedReservations.forEach((r) => {
        if (r.rawDate.getTime() >= now.getTime()) future.push(r);
        else past.push(r);
      });

      const groupByDate = (items: ReservationView[], order: "asc" | "desc"): DateGroup[] => {
        items.sort((a, b) =>
          order === "asc"
            ? a.rawDate.getTime() - b.rawDate.getTime()
            : b.rawDate.getTime() - a.rawDate.getTime()
        );

        const groups: { [key: string]: ReservationView[] } = {};
        items.forEach((item) => {
          const dateKey = item.rawDate.toLocaleDateString("es-CL", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          if (!groups[dateKey]) groups[dateKey] = [];
          groups[dateKey].push(item);
        });

        return Object.keys(groups).map((date) => ({
          date: date.charAt(0).toUpperCase() + date.slice(1),
          items: groups[date],
        }));
      };

      setFutureReservations(groupByDate(future, "asc"));
      setPastReservations(groupByDate(past, "desc"));
    } catch (err) {
      console.error(err);
      setError("Error al cargar datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteClick = (id: string) => {
    setReservationToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!reservationToDelete) return;
    try {
      setIsDeleting(true);
      await reservaService.delete(Number(reservationToDelete));
      await loadData();
      setShowDeleteDialog(false);
      setReservationToDelete(null);
    } catch (err) {
      console.error("Error al eliminar reserva:", err);
      alert("No se pudo eliminar la reserva. Verifique que no esté pagada.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && !currentResidenteId) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#99D050]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-10">
      <NavbarResidente />

      <main className="max-w-7xl mx-auto px-6 mt-6">
        <div
          onClick={handleBackToAccount}
          className="flex items-center gap-2 text-gray-500 mb-4 cursor-pointer hover:text-gray-800 w-fit transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Estado de cuenta</span>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm mb-8 w-fit min-w-[300px]">
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">Reservas</h1>
          <p className="text-gray-400 text-sm">Tus reservas de espacios comunes</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-7 flex flex-col gap-6 bg-white p-6 rounded-3xl shadow-sm h-fit">
            <h2 className="text-2xl font-semibold text-gray-900">Reservas futuras</h2>
            <button
              onClick={() => setShowNewReservation(true)}
              className="w-full bg-[#99D050] hover:bg-[#8bc040] text-white font-medium py-3 rounded-xl transition-colors shadow-sm cursor-pointer active:scale-[0.99] transform duration-100"
            >
              Nueva Reserva
            </button>
            <ReservationsList
              groups={futureReservations}
              emptyMessage="No tienes reservas próximas."
              onDelete={handleDeleteClick}
            />
          </section>

          <section className="lg:col-span-5 flex flex-col gap-6 bg-white p-6 rounded-3xl shadow-sm h-fit">
            <h2 className="text-2xl font-semibold text-gray-900">Reservas pasadas</h2>
            <ReservationsList
              groups={pastReservations}
              emptyMessage="Sin historial."
            />
          </section>
        </div>
      </main>

      {/* Diálogos */}
      <NewReservationDialog
        open={showNewReservation}
        onOpenChange={setShowNewReservation}
        onSuccess={loadData}
        espacios={espacios}
        residenteId={currentResidenteId}
      />

      <DeleteReservationDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
