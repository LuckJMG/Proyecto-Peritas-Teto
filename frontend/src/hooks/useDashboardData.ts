import { useState, useEffect } from 'react';
import { pagoService, type Pago } from '../services/pagoService';
import { gastoComunService } from '../services/gastoComunService';
import { usuarioService } from '../services/usuarioService';

export const useDashboardData = () => {
  const [data, setData] = useState({
    ingresoTotal: 0,
    reservasCount: 0,
    usuariosActivos: 0,
    deudaTotal: 0,
    graficoData: [] as any[],
    pagosRecientes: [] as any[],
    loading: true
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [pagos, gastos, usuarios] = await Promise.all([
          pagoService.getAll(),
          gastoComunService.getAll(),
          usuarioService.getAll()
        ]);

        const listaPagos = Array.isArray(pagos) ? pagos : [];
        const listaGastos = Array.isArray(gastos) ? gastos : [];
        const listaUsuarios = Array.isArray(usuarios) ? usuarios : [];
        
        // 1. Calcular Ingreso Total
        const ingresoTotal = listaPagos
          .filter((p: Pago) => p.estado_pago === 'APROBADO')
          .reduce((acc: number, p: Pago) => acc + (Number(p.monto) || 0), 0);

        // 2. Calcular Deuda Total
        const deudaTotal = listaGastos
          .filter((g: any) => g.estado === 'NO_PAGADO' || g.estado === 'VENCIDO')
          .reduce((acc: number, g: any) => acc + (Number(g.monto) || 0), 0);

        // 3. Procesar Datos para el Gráfico
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
            total: graficoMap[index]
        }));

        // 4. Obtener Pagos Recientes
        const pagosRecientes = listaPagos
            .sort((a: Pago, b: Pago) => new Date(b.fecha_pago).getTime() - new Date(a.fecha_pago).getTime())
            .slice(0, 5)
            .map((p: Pago) => {
                const user = listaUsuarios.find((u: any) => u.id === p.residente_id);
                return {
                    nombre: user ? `${user.nombre} ${user.apellido}` : `Residente #${p.residente_id}`,
                    email: user?.email || 'Sin email',
                    monto: p.monto,
                    avatar: user?.nombre?.charAt(0) || '?'
                };
            });

        setData({
          ingresoTotal,
          reservasCount: 15,
          usuariosActivos: listaUsuarios.filter((u:any) => u.activo).length,
          deudaTotal,
          graficoData,
          pagosRecientes,
          loading: false
        });

      } catch (error) {
        console.error("Error cargando dashboard", error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    cargarDatos();
  }, []);

  return data;
};