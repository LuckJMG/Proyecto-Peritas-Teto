import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavbarResidente from "@/components/NavbarResidente";
import { authService, fetchWithAuth } from "@/services/authService";
import { reservaService } from "@/services/reservaService";
import { 
  espaciosComunesService
} from "@/services/espaciosComunesService";

// --- Types & Interfaces for View ---
interface ReservationView {
  id: string;
  type: string;        // Nombre del espacio
  timeRange: string;   // ej. 11:00 - 18:00
  price: number;
  rawDate: Date;
}

interface DateGroup {
  date: string;
  items: ReservationView[];
}

// --- Helper Components ---
const ReservationCard = ({ item }: { item: ReservationView }) => (
  <div className="flex flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden h-[72px] transition-shadow hover:shadow-md">
    {/* Green Accent Bar */}
    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#99D050]" />
    
    <div className="ml-3 flex flex-col justify-center">
      <h3 className="text-lg font-medium text-gray-900">{item.type}</h3>
      <span className="text-sm text-gray-500 font-light capitalize">
        {item.timeRange}
      </span>
    </div>
    
    <div className="text-lg font-semibold text-gray-900">
      ${item.price.toLocaleString('es-CL')}
    </div>
  </div>
);

// --- Main Component ---
export default function ReservationsPage() {
  const navigate = useNavigate();
  
  // States
  const [futureReservations, setFutureReservations] = useState<DateGroup[]>([]);
  const [pastReservations, setPastReservations] = useState<DateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleBackToAccount = () => {
    navigate('/estado');
  };

  // --- Data Fetching ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const currentUser = authService.getUser();
        if (!currentUser) {
            setError("Usuario no autenticado");
            setLoading(false);
            return;
        }

        // 1. Obtener Residentes para identificar el condominio_id del usuario
        const resResidentes = await fetchWithAuth('http://localhost:8000/api/v1/residentes');
        if (!resResidentes.ok) throw new Error("Error al cargar perfil de residente");
        
        const residentes = await resResidentes.json();
        const miResidente = residentes.find((r: any) => r.usuario_id === currentUser.id);

        if (!miResidente) {
          setError("No se encontró un perfil de residente asociado.");
          setLoading(false);
          return;
        }

        // 2. Cargar datos en paralelo:
        // - Reservas (Todas, luego filtramos)
        // - Espacios Comunes (Filtrados por condominio del residente)
        const [allReservas, espaciosDelCondominio] = await Promise.all([
          reservaService.getAll(),
          espaciosComunesService.getByCondominio(miResidente.condominio_id)
        ]);

        // 3. Filtrar reservas del residente actual
        const misReservas = allReservas.filter(r => r.residente_id === miResidente.id);

        // 4. Mapear datos
        const mappedReservations: ReservationView[] = misReservas.map(reserva => {
          const espacio = espaciosDelCondominio.find(e => e.id === reserva.espacio_comun_id);
          const fechaInicio = new Date(reserva.fecha_inicio);
          const fechaFin = new Date(reserva.fecha_fin);

          // Cálculo de precio basado en costo por hora
          let costoTotal = 0;
          if (espacio && espacio.costo_por_hora) {
            const diffMs = fechaFin.getTime() - fechaInicio.getTime();
            const diffHoras = diffMs / (1000 * 60 * 60);
            costoTotal = Math.round(diffHoras * espacio.costo_por_hora);
          }

          const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
          const timeRange = `${fechaInicio.toLocaleTimeString('es-CL', timeOptions)} - ${fechaFin.toLocaleTimeString('es-CL', timeOptions)}`;

          return {
            id: reserva.id.toString(),
            type: espacio ? espacio.nombre : 'Espacio no disponible',
            timeRange: timeRange,
            price: costoTotal,
            rawDate: fechaInicio
          };
        });

        // 5. Separar Futuras vs Pasadas
        const now = new Date();
        const future: ReservationView[] = [];
        const past: ReservationView[] = [];

        mappedReservations.forEach(r => {
          if (r.rawDate >= now) {
            future.push(r);
          } else {
            past.push(r);
          }
        });

        // 6. Agrupar por fecha
        const groupByDate = (items: ReservationView[], order: 'asc' | 'desc'): DateGroup[] => {
            items.sort((a, b) => order === 'asc' 
                ? a.rawDate.getTime() - b.rawDate.getTime() 
                : b.rawDate.getTime() - a.rawDate.getTime()
            );

            const groups: { [key: string]: ReservationView[] } = {};
            
            items.forEach(item => {
                const dateKey = item.rawDate.toLocaleDateString('es-CL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
                
                if (!groups[dateKey]) {
                    groups[dateKey] = [];
                }
                groups[dateKey].push(item);
            });

            return Object.keys(groups).map(date => ({
                date: date.charAt(0).toUpperCase() + date.slice(1),
                items: groups[date]
            }));
        };

        setFutureReservations(groupByDate(future, 'asc'));
        setPastReservations(groupByDate(past, 'desc'));

      } catch (err) {
        console.error(err);
        setError("Ocurrió un error al cargar tus reservas.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#99D050]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-10">
      <NavbarResidente/>

      <main className="max-w-7xl mx-auto px-6 mt-6">
        
        {/* Breadcrumb */}
        <div 
          onClick={handleBackToAccount}
          className="flex items-center gap-2 text-gray-500 mb-4 cursor-pointer hover:text-gray-800 w-fit transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Estado de cuenta</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-8 w-fit min-w-[300px]">
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">
            Reservas
          </h1>
          <p className="text-gray-400 text-sm">
            Tus reservas de espacios comunes
          </p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                {error}
            </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Futuras */}
          <section className="lg:col-span-7 flex flex-col gap-6 bg-white p-6 rounded-3xl shadow-sm h-fit">
            <h2 className="text-2xl font-semibold text-gray-900">
              Reservas futuras
            </h2>
            
            <button className="w-full bg-[#99D050] hover:bg-[#8bc040] text-white font-medium py-3 rounded-xl transition-colors shadow-sm cursor-pointer active:scale-[0.99] transform duration-100">
              Nueva Reserva
            </button>

            <div className="flex flex-col gap-6 mt-2">
              {futureReservations.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No tienes reservas próximas.</p>
              ) : (
                  futureReservations.map((group, idx) => (
                    <div key={idx} className="flex flex-col gap-3">
                      <h4 className="text-sm font-semibold text-gray-800 ml-1">
                        {group.date}
                      </h4>
                      <div className="flex flex-col gap-3">
                        {group.items.map((item) => (
                          <ReservationCard key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </section>

          {/* Pasadas */}
          <section className="lg:col-span-5 flex flex-col gap-6 bg-white p-6 rounded-3xl shadow-sm h-fit">
            <h2 className="text-2xl font-semibold text-gray-900">
              Reservas pasadas
            </h2>
            
            <div className="flex flex-col gap-6 mt-2">
              {pastReservations.length === 0 ? (
                   <p className="text-gray-400 text-center py-4">Sin historial.</p>
              ) : (
                  pastReservations.map((group, idx) => (
                    <div key={idx} className="flex flex-col gap-3">
                      <h4 className="text-sm font-semibold text-gray-800 ml-1">
                        {group.date}
                      </h4>
                      <div className="flex flex-col gap-3">
                        {group.items.map((item) => (
                          <ReservationCard key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
