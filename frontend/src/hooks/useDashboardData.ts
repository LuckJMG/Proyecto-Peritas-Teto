import { useState, useEffect } from 'react';
import { pagoService, type Pago, type EstadoPago } from '../services/pagoService';
import { gastoComunService } from '../services/gastoComunService';
import { usuarioService } from '../services/usuarioService';
import { multaService } from '../services/multaService';
import type { DateRange } from 'react-day-picker';

interface DashboardFilters {
  dateRange: DateRange | undefined;
  estadoPago: EstadoPago | 'TODOS';
}

export const useDashboardData = (filters: DashboardFilters) => {
  const [data, setData] = useState({
    ingresoTotal: 0,
    totalFacturado: 0,
    cantidadMultas: 0,
    indiceMorosidad: 0,
    usuariosActivos: 0,
    deudaTotal: 0,
    graficoData: [] as any[],
    transacciones: [] as any[], // Lista combinada para la tabla
    loading: true
  });

  useEffect(() => {
    const cargarDatos = async () => {
      // Evitamos setear loading si ya estamos cargando o si es un refresco rápido, 
      // pero para dashboard está bien mostrar carga.
      setData(prev => ({ ...prev, loading: true }));
      try {
        const fechaInicio = filters.dateRange?.from?.toISOString();
        const fechaFin = filters.dateRange?.to?.toISOString();

        // 1. Obtener Datos
        const [pagos, gastos, usuarios, multas] = await Promise.all([
          pagoService.getAll({ 
            estado_pago: filters.estadoPago,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin
          }),
          gastoComunService.getAll(),
          usuarioService.getAll(),
          multaService.getAll()
        ]);

        const listaPagos = Array.isArray(pagos) ? pagos : [];
        const listaGastos = Array.isArray(gastos) ? gastos : [];
        const listaUsuarios = Array.isArray(usuarios) ? usuarios : [];
        const listaMultas = Array.isArray(multas) ? multas : [];

        // --- FILTRADO EN CLIENTE PARA GASTOS Y MULTAS ---
        const start = filters.dateRange?.from ? new Date(filters.dateRange.from) : new Date(0);
        const end = filters.dateRange?.to ? new Date(filters.dateRange.to) : new Date(8640000000000000);

        const gastosFiltrados = listaGastos.filter((g: any) => {
          const fecha = new Date(g.fecha_emision);
          return fecha >= start && fecha <= end;
        });

        const multasFiltradas = listaMultas.filter((m: any) => {
            const fecha = new Date(m.fecha_emision || new Date()); 
            return fecha >= start && fecha <= end;
        });
        
        // 2. CÁLCULOS KPI

        // Total Recaudado (Pagos Aprobados en el periodo)
        const ingresoTotal = listaPagos
          .filter((p: Pago) => p.estado_pago === 'APROBADO')
          .reduce((acc: number, p: Pago) => acc + (Number(p.monto) || 0), 0);

        // Total Facturado (Gastos + Multas emitidas en el periodo)
        const totalFacturadoGastos = gastosFiltrados.reduce((acc: number, g: any) => acc + (Number(g.monto_total) || 0), 0);
        const totalFacturadoMultas = multasFiltradas.reduce((acc: number, m: any) => acc + (Number(m.monto) || 0), 0);
        const totalFacturado = totalFacturadoGastos + totalFacturadoMultas;

        // Cantidad de Multas
        const cantidadMultas = multasFiltradas.length;

        // Índice de Morosidad
        const gastosVencidos = gastosFiltrados.filter((g: any) => ['VENCIDO', 'MOROSO'].includes(g.estado)).length;
        const indiceMorosidad = gastosFiltrados.length > 0 
            ? Math.round((gastosVencidos / gastosFiltrados.length) * 100) 
            : 0;

        // Deuda Total Histórica
        const deudaTotal = listaGastos
          .filter((g: any) => g.estado === 'VENCIDO' || g.estado === 'MOROSO')
          .reduce((acc: number, g: any) => acc + (Number(g.monto) || 0), 0);


        // 3. DATOS PARA GRÁFICO
        const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const graficoMap = new Array(12).fill(0);
        
        listaPagos.forEach((p: Pago) => {
            if (p.estado_pago === 'APROBADO') {
                const fecha = new Date(p.fecha_pago);
                const mes = fecha.getMonth();
                if (!isNaN(mes)) {
                    graficoMap[mes] += Number(p.monto);
                }
            }
        });

        const graficoData = meses.map((name, index) => ({
            name,
            total: graficoMap[index],
            estimado: graficoMap[index] * 1.1 
        }));

        // 4. PREPARAR TABLA
        const transacciones = listaPagos.map((p: Pago) => {
            const user = listaUsuarios.find((u: any) => u.id === p.residente_id);
            return {
                id: p.id,
                fecha: p.fecha_pago,
                residente: user ? `${user.nombre} ${user.apellido}` : `Residente #${p.residente_id}`,
                concepto: p.tipo,
                monto: p.monto,
                estado: p.estado_pago
            };
        });

        transacciones.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

        setData({
          ingresoTotal,
          totalFacturado,
          cantidadMultas,
          indiceMorosidad,
          usuariosActivos: listaUsuarios.filter((u:any) => u.activo).length,
          deudaTotal,
          graficoData,
          transacciones,
          loading: false
        });

      } catch (error) {
        console.error("Error cargando dashboard", error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    cargarDatos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dateRange, filters.estadoPago]); // <--- CORRECCIÓN AQUÍ: Dependencias primitivas/estables

  return data;
};