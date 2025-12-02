import { useState, useEffect } from 'react';
import { pagoService } from '../services/pagoService';
import { gastoComunService } from '../services/gastoComunService';
import { usuarioService } from '../services/usuarioService';
import { reservaService } from '../services/reservaService';
import { authService } from '../services/authService';

export const useDashboardData = () => {
  const [data, setData] = useState({
    ingresoTotal: 0,
    reservasCount: 0,
    usuariosActivos: 0,
    deudaTotal: 0,
    morosidadPorcentaje: 0,
    multasRegistradas: 0,
    ingresosReservas: 0,
    reservasPorConfirmar: 0,
    graficoData: [] as any[],
    pagosRecientes: [] as any[],
    loading: true,
    error: null as string | null
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const user = authService.getUser();
        if (!user) {
          throw new Error("Usuario no autenticado");
        }

        // Cargar datos en paralelo
        const [pagos, gastos, usuarios, reservas] = await Promise.all([
          pagoService.getAll({ condominio_id: user.condominioId }).catch(() => []),
          gastoComunService.getAll().catch(() => []),
          usuarioService.getAll().catch(() => []),
          reservaService.getAll().catch(() => [])
        ]);

        // Filtrar por condominio del usuario
        const gastosCondo = gastos.filter((g: any) => g.condominio_id === user.condominioId);
        const usuariosCondo = usuarios.filter((u: any) => u.condominio_id === user.condominioId);
        const reservasCondo = reservas.filter(() => {
          return true;
        });

        // 1. INGRESO TOTAL (Pagos aprobados)
        const ingresoTotal = pagos
          .filter((p: any) => p.estado_pago === 'APROBADO')
          .reduce((acc: number, p: any) => acc + (Number(p.monto) || 0), 0);

        // 2. DEUDA TOTAL (Gastos pendientes/vencidos/morosos)
        const estadosDeuda = ['PENDIENTE', 'VENCIDO', 'MOROSO'];
        const deudaTotal = gastosCondo
          .filter((g: any) => estadosDeuda.includes(g.estado))
          .reduce((acc: number, g: any) => acc + (Number(g.monto_total) || 0), 0);

        // 3. ÍNDICE DE MOROSIDAD
        const totalGastos = gastosCondo.length;
        const gastosImpagos = gastosCondo.filter((g: any) => 
          estadosDeuda.includes(g.estado)
        ).length;
        const morosidadPorcentaje = totalGastos > 0 
          ? Math.round((gastosImpagos / totalGastos) * 100) 
          : 0;

        // 4. MULTAS REGISTRADAS (se obtiene del servicio de multas si está disponible)
        // Por ahora usamos un valor de ejemplo ya que no veo el endpoint en uso
        const multasRegistradas = 30; // TODO: Conectar con multaService.getAll()

        // 5. INGRESOS POR RESERVAS
        const ingresosReservas = reservasCondo
          .filter((r: any) => r.estado === 'CONFIRMADA' || r.estado === 'COMPLETADA')
          .reduce((acc: number, r: any) => acc + (Number(r.monto_pago) || 0), 0);

        // 6. RESERVAS POR CONFIRMAR
        const reservasPorConfirmar = reservasCondo
          .filter((r: any) => r.estado === 'PENDIENTE_PAGO')
          .length;

        // 7. USUARIOS ACTIVOS
        const usuariosActivos = usuariosCondo.filter((u: any) => u.activo).length;

        // 8. DATOS PARA GRÁFICO (Ingresos por mes del año actual)
        const currentYear = new Date().getFullYear();
        const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const graficoMap = new Array(12).fill(0);
        const estimadoMap = new Array(12).fill(0);
        
        // Calcular ingresos reales por mes
        pagos.forEach((p: any) => {
          if (p.estado_pago === 'APROBADO') {
            const fecha = new Date(p.fecha_pago);
            if (fecha.getFullYear() === currentYear) {
              const mes = fecha.getMonth();
              graficoMap[mes] += Number(p.monto);
            }
          }
        });

        // Calcular ingresos estimados (suma de gastos comunes emitidos por mes)
        gastosCondo.forEach((g: any) => {
          if (g.anio === currentYear) {
            const mesIndex = g.mes - 1; // mes viene como 1-12
            if (mesIndex >= 0 && mesIndex < 12) {
              estimadoMap[mesIndex] += Number(g.monto_total);
            }
          }
        });

        const graficoData = meses.map((name, index) => ({
          name,
          total: Math.round(graficoMap[index]),
          estimado: Math.round(estimadoMap[index])
        }));

        // 9. PAGOS RECIENTES (Últimos 5)
        const pagosRecientes = pagos
          .sort((a: any, b: any) => new Date(b.fecha_pago).getTime() - new Date(a.fecha_pago).getTime())
          .slice(0, 5)
          .map((p: any) => {
            const user = usuariosCondo.find((u: any) => u.id === p.residente_id);
            return {
              nombre: user ? `${user.nombre} ${user.apellido}` : `Residente #${p.residente_id}`,
              email: user?.email || 'Sin email',
              monto: Number(p.monto),
              avatar: user?.nombre?.charAt(0) || '?'
            };
          });

        // 10. CONTADOR DE RESERVAS (Total de reservas)
        const reservasCount = reservasCondo.length;

        setData({
          ingresoTotal: Math.round(ingresoTotal),
          reservasCount,
          usuariosActivos,
          deudaTotal: Math.round(deudaTotal),
          morosidadPorcentaje,
          multasRegistradas,
          ingresosReservas: Math.round(ingresosReservas),
          reservasPorConfirmar,
          graficoData,
          pagosRecientes,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error("Error cargando dashboard:", error);
        setData(prev => ({ 
          ...prev, 
          loading: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        }));
      }
    };

    cargarDatos();
    
    // Refresh cada 5 minutos
    const interval = setInterval(cargarDatos, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return data;
};
