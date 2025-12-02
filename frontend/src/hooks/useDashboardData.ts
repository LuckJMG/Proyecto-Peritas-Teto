import { useState, useEffect } from 'react';
import { pagoService } from '../services/pagoService';
import { gastoComunService } from '../services/gastoComunService';
import { usuarioService } from '../services/usuarioService';
import { reservaService } from '../services/reservaService';
import { multaService } from '../services/multaService';
import { anuncioService } from '../services/anuncioService';
import { residenteService } from '../services/residenteService';
import { authService } from '../services/authService';

export interface HogarMoroso {
  nombre: string;
  vivienda: string;
  avatar: string;
  mesesAtraso: number;
  montoDeuda: number;
  residenteId: number;
}

export interface AnuncioComunidad {
  id: number;
  titulo: string;
  fecha: string;
  icono: string;
}

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
    hogaresMorosos: [] as HogarMoroso[],
    anuncios: [] as AnuncioComunidad[],
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
        const [pagos, gastos, usuarios, reservas, multas, anuncios, residentes] = await Promise.all([
          pagoService.getAll({ condominio_id: user.condominioId }).catch(() => []),
          gastoComunService.getAll().catch(() => []),
          usuarioService.getAll().catch(() => []),
          reservaService.getAll().catch(() => []),
          multaService.getAll().catch(() => []),
          anuncioService.getAll().catch(() => []),
          residenteService.getAll().catch(() => [])
        ]);

        // Filtrar por condominio del usuario
        const gastosCondo = gastos.filter((g: any) => g.condominio_id === user.condominioId);
        const usuariosCondo = usuarios.filter((u: any) => u.condominio_id === user.condominioId);
        const multasCondo = multas.filter((m: any) => m.condominio_id === user.condominioId);
        const anunciosCondo = anuncios.filter((a: any) => a.condominio_id === user.condominioId);

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

        // 4. MULTAS REGISTRADAS (del condominio)
        const multasRegistradas = multasCondo.length;

        // 5. INGRESOS POR RESERVAS
        const ingresosReservas = reservas
          .filter((r: any) => r.estado === 'CONFIRMADA' || r.estado === 'COMPLETADA')
          .reduce((acc: number, r: any) => acc + (Number(r.monto_pago) || 0), 0);

        // 6. RESERVAS POR CONFIRMAR
        const reservasPorConfirmar = reservas
          .filter((r: any) => r.estado === 'PENDIENTE_PAGO')
          .length;

        // 7. USUARIOS ACTIVOS
        const usuariosActivos = usuariosCondo.filter((u: any) => u.activo).length;

        // 8. DATOS PARA GRÁFICO (Ingresos por mes del año actual)
        const currentYear = new Date().getFullYear();
        const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const graficoMap = new Array(12).fill(0);
        const estimadoMap = new Array(12).fill(0);
        
        pagos.forEach((p: any) => {
          if (p.estado_pago === 'APROBADO') {
            const fecha = new Date(p.fecha_pago);
            if (fecha.getFullYear() === currentYear) {
              const mes = fecha.getMonth();
              graficoMap[mes] += Number(p.monto);
            }
          }
        });

        gastosCondo.forEach((g: any) => {
          if (g.anio === currentYear) {
            const mesIndex = g.mes - 1;
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

        // 10. HOGARES MOROSOS (Top 5 con mayor deuda)
        const morososMap = new Map<number, { deuda: number; gastos: any[] }>();
        
        gastosCondo
          .filter((g: any) => estadosDeuda.includes(g.estado))
          .forEach((g: any) => {
            const current = morososMap.get(g.residente_id) || { deuda: 0, gastos: [] };
            current.deuda += Number(g.monto_total);
            current.gastos.push(g);
            morososMap.set(g.residente_id, current);
          });

        const hogaresMorosos: HogarMoroso[] = Array.from(morososMap.entries())
          .map(([residenteId, data]) => {
            const residente = residentes.find((r: any) => r.id === residenteId);
            
            // Calcular meses de atraso (el gasto más antiguo)
            const gastosOrdenados = data.gastos.sort((a: any, b: any) => {
              const fechaA = new Date(a.fecha_vencimiento);
              const fechaB = new Date(b.fecha_vencimiento);
              return fechaA.getTime() - fechaB.getTime();
            });
            
            const gastoMasAntiguo = gastosOrdenados[0];
            const fechaVencimiento = new Date(gastoMasAntiguo.fecha_vencimiento);
            const hoy = new Date();
            const mesesAtraso = Math.max(1, Math.floor(
              (hoy.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24 * 30)
            ));

            return {
              nombre: residente 
                ? `${residente.nombre} ${residente.apellido}`
                : `Residente #${residenteId}`,
              vivienda: residente?.vivienda_numero || 'S/N',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${residenteId}`,
              mesesAtraso,
              montoDeuda: data.deuda,
              residenteId
            };
          })
          .sort((a, b) => b.montoDeuda - a.montoDeuda)
          .slice(0, 5);

        // 11. ANUNCIOS RECIENTES (Últimos 3 activos)
        const anunciosRecientes: AnuncioComunidad[] = anunciosCondo
          .filter((a: any) => a.activo)
          .sort((a: any, b: any) => {
            const fechaA = new Date(a.fecha_publicacion);
            const fechaB = new Date(b.fecha_publicacion);
            return fechaB.getTime() - fechaA.getTime();
          })
          .slice(0, 3)
          .map((a: any, index: number) => {
            // Iconos rotativos para variedad visual
            const iconos = ['🎉', '📢', '🏠', '⚠️', '✨', '🎊'];
            return {
              id: a.id,
              titulo: a.titulo,
              fecha: new Date(a.fecha_publicacion).toLocaleDateString('es-CL', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              }),
              icono: iconos[index % iconos.length]
            };
          });

        const reservasCount = reservas.length;

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
          hogaresMorosos,
          anuncios: anunciosRecientes,
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