import { useState, useEffect } from "react";
import { reservaService, type Reserva } from "@/services/reservaService";
import { espaciosComunesService } from "@/services/espaciosComunesService";
import { authService, fetchWithAuth } from "@/services/authService";

// Interfaz extendida para la tabla
export interface ReservaAdminView extends Reserva {
  nombreResidente: string;
  nombreEspacio: string;
}

export function useReservasAdmin() {
  const [data, setData] = useState<ReservaAdminView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const user = authService.getUser();
      
      // Validar que el usuario tenga un condominio asociado
      // Nota: El backend envía 'condominio_id' (snake_case), aunque la interfaz TS diga camelCase
      const condominioId = user?.condominio_id || user?.condominioId;

      if (!condominioId) {
        throw new Error("No se encontró el condominio del administrador.");
      }
      
      // 1. Fetch Paralelo de entidades necesarias
      const [reservas, espacios] = await Promise.all([
        reservaService.getAll(),
        espaciosComunesService.getByCondominio(condominioId),
      ]);

      // 2. Fetch de Residentes (Usamos fetch directo ya que residentesService no tenía getAll filtrado)
      // Idealmente el backend debería soportar ?condominio_id=X aquí también
      const resResidentes = await fetchWithAuth("http://localhost:8000/api/v1/residentes");
      const residentes = await resResidentes.json();

      // 3. Unificar datos (Join)
      const joinedData: ReservaAdminView[] = reservas
        // Filtrar reservas que pertenezcan a los espacios de este condominio
        .filter(r => espacios.some(e => e.id === r.espacio_comun_id))
        .map((reserva) => {
          const espacio = espacios.find((e) => e.id === reserva.espacio_comun_id);
          const residente = residentes.find((r: any) => r.id === reserva.residente_id);

          return {
            ...reserva,
            nombreEspacio: espacio?.nombre || "Espacio no encontrado",
            nombreResidente: residente 
              ? `${residente.nombre} ${residente.apellido}` 
              : "Residente Desconocido",
          };
        });

      // Ordenar por fecha descendente (más recientes primero)
      joinedData.sort((a, b) => 
        new Date(b.fecha_reserva).getTime() - new Date(a.fecha_reserva).getTime()
      );

      setData(joinedData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al cargar las solicitudes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, reload: fetchData };
}
