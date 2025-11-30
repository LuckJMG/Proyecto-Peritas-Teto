import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavbarResidente from "@/components/NavbarResidente";

// --- Types & Interfaces ---
interface Reservation {
  id: string;
  type: 'Quincho' | 'Lavandería';
  timeRange: string;
  price: number;
}

interface DateGroup {
  date: string;
  items: Reservation[];
}

// --- Mock Data ---
const FUTURE_RESERVATIONS: DateGroup[] = [
  {
    date: '18 de Septiembre de 2025',
    items: [
      { id: '1', type: 'Quincho', timeRange: '11:00 - 18:00', price: 10000 }
    ]
  },
  {
    date: '1 de Septiembre de 2025',
    items: [
      { id: '2', type: 'Lavandería', timeRange: '11:00 - 13:00', price: 1200 }
    ]
  }
];

const PAST_RESERVATIONS: DateGroup[] = [
  {
    date: '13 de Agosto de 2025',
    items: [
      { id: '3', type: 'Lavandería', timeRange: '11:00 - 13:00', price: 1200 }
    ]
  },
  {
    date: '11 de Agosto de 2025',
    items: [
      { id: '4', type: 'Lavandería', timeRange: '11:00 - 13:00', price: 1200 },
      { id: '5', type: 'Lavandería', timeRange: '11:00 - 13:00', price: 1200 },
      { id: '6', type: 'Lavandería', timeRange: '11:00 - 13:00', price: 1200 }
    ]
  },
  {
    date: '2 de Agosto de 2025',
    items: [
      { id: '7', type: 'Lavandería', timeRange: '11:00 - 13:00', price: 1200 },
      { id: '8', type: 'Lavandería', timeRange: '11:00 - 13:00', price: 1200 }
    ]
  }
];

// --- Sub-components ---
const ReservationCard = ({ item }: { item: Reservation }) => (
  <div className="flex flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden h-[72px] transition-shadow hover:shadow-md">
    {/* Green Accent Bar */}
    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#99D050]" />
    
    <div className="ml-3 flex flex-col justify-center">
      <h3 className="text-lg font-medium text-gray-900">{item.type}</h3>
      <span className="text-sm text-gray-500 font-light">
        {item.timeRange}
      </span>
    </div>
    
    <div className="text-lg font-semibold text-gray-900">
      ${item.price.toLocaleString('es-CL')}
    </div>
  </div>
);

// --- Main Page Component ---
export default function ReservationsPage() {
  const navigate = useNavigate();

  const handleBackToAccount = () => {
    navigate('/estado');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans pb-10">
      
	<NavbarResidente/>

      <main className="max-w-7xl mx-auto px-6 mt-6">
        
        {/* Breadcrumb / Back Navigation */}
        <div 
          onClick={handleBackToAccount}
          className="flex items-center gap-2 text-gray-500 mb-4 cursor-pointer hover:text-gray-800 w-fit transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Estado de cuenta</span>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-8 w-fit min-w-[300px]">
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">
            Reservas
          </h1>
          <p className="text-gray-400 text-sm">
            Reservar espacios comunones o servicios
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Future Reservations (Wider) */}
          <section className="lg:col-span-7 flex flex-col gap-6 bg-white p-6 rounded-3xl shadow-sm h-fit">
            <h2 className="text-2xl font-semibold text-gray-900">
              Reservas futuras
            </h2>
            
            <button className="w-full bg-[#99D050] hover:bg-[#8bc040] text-white font-medium py-3 rounded-xl transition-colors shadow-sm cursor-pointer active:scale-[0.99] transform duration-100">
              Nueva Reserva
            </button>

            <div className="flex flex-col gap-6 mt-2">
              {FUTURE_RESERVATIONS.map((group, idx) => (
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
              ))}
            </div>
          </section>

          {/* Right Column: Past Reservations (Narrower) */}
          <section className="lg:col-span-5 flex flex-col gap-6 bg-white p-6 rounded-3xl shadow-sm h-fit">
            <h2 className="text-2xl font-semibold text-gray-900">
              Reservas pasadas
            </h2>
            
            <div className="flex flex-col gap-6 mt-2">
              {PAST_RESERVATIONS.map((group, idx) => (
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
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
