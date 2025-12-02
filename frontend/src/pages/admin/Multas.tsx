import { useEffect, useState } from "react";
import { multaService, type Multa } from "@/services/multaService";
import { residenteService, type Residente } from "@/services/residenteService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { SidebarAdmin } from "@/components/SidebarAdmin";
// 1. IMPORTAR EL HOOK DE REGISTRO
import { useRegistroAutomatico } from "@/services/registroService";

// Constantes para MVP (Idealmente vendrían del contexto de autenticación)
const CURRENT_ADMIN_ID = 1;
const CURRENT_CONDOMINIO_ID = 1;

export default function AdminMultas() {
  const toInt = (val: number | undefined) => Math.round(Number(val ?? 0));
  const [multas, setMultas] = useState<Multa[]>([]);
  const [residentes, setResidentes] = useState<Residente[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // 2. INICIALIZAR EL HOOK
  const { registrar } = useRegistroAutomatico();

  // Form State
  const [newMulta, setNewMulta] = useState<Partial<Multa>>({
    tipo: "OTRO",
    condominio_id: CURRENT_CONDOMINIO_ID,
    creado_por: CURRENT_ADMIN_ID,
    estado: "PENDIENTE"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [multasData, residentesData] = await Promise.all([
        multaService.getAll(),
        residenteService.getAll()
      ]);
      setMultas(multasData);
      setResidentes(residentesData);
    } catch (error) {
      console.error("Error cargando datos", error);
    } finally {
      setLoading(false);
    }
  };

  const getNombreResidente = (id: number) => {
    const res = residentes.find(r => r.id === id);
    return res ? `${res.nombre} ${res.apellido} (Casa ${res.vivienda_numero})` : `ID: ${id}`;
  };

  const handleProcesarAutomaticas = async () => {
    if (!confirm("¿Generar multas automáticas para gastos vencidos?")) return;
    
    setProcessing(true);
    try {
      const res = await multaService.procesarAtrasos(CURRENT_ADMIN_ID);
      
      // 3. REGISTRO AUTOMÁTICO (Proceso masivo)
      await registrar(
        "MULTA",
        `Ejecución de multas automáticas: Se generaron ${res.multas_creadas} nuevas multas por atraso.`,
        {
            condominio_id: CURRENT_CONDOMINIO_ID
        }
      );

      alert(`Proceso completado. Se crearon ${res.multas_creadas} multas nuevas.`);
      const multasUpdated = await multaService.getAll();
      setMultas(multasUpdated);
    } catch (error) {
      alert("Error al procesar multas automáticas");
    } finally {
      setProcessing(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!newMulta.residente_id || !newMulta.monto || !newMulta.descripcion) {
        alert("Complete todos los campos obligatorios");
        return;
      }
      
      await multaService.create(newMulta as Multa);

      // 4. REGISTRO AUTOMÁTICO (Multa manual)
      const nombreResidente = getNombreResidente(newMulta.residente_id);
      await registrar(
        "MULTA",
        `Multa manual aplicada a ${nombreResidente}. Monto: $${newMulta.monto.toLocaleString()} - Motivo: ${newMulta.descripcion}`,
        {
            monto: newMulta.monto,
            condominio_id: CURRENT_CONDOMINIO_ID,
            datos_adicionales: { tipo_multa: newMulta.tipo }
        }
      );

      setIsCreateOpen(false);
      setNewMulta({
        tipo: "OTRO",
        condominio_id: CURRENT_CONDOMINIO_ID,
        creado_por: CURRENT_ADMIN_ID,
        estado: "PENDIENTE"
      });
      const multasUpdated = await multaService.getAll();
      setMultas(multasUpdated);
    } catch (error) {
      console.error(error);
      alert("Error al crear multa");
    }
  };

  const multasVisibles = multas.filter((m) => toInt(m.monto) > 0);

  return (
    <div className="flex flex-col h-screen w-full bg-[#F5F6F8] overflow-hidden font-sans">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <div className="h-full hidden md:block border-r border-gray-200/50">
          <SidebarAdmin className="h-full" />
        </div>

        <main className="flex-1 p-8 overflow-y-auto overflow-x-hidden">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Multas</h1>
                <p className="text-gray-500 mt-1">Administra las sanciones y cobros del condominio.</p>
              </div>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleProcesarAutomaticas}
                  disabled={processing}
                  className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                >
                  {processing ? "Procesando..." : "⚡ Generar Multas Automáticas"}
                </Button>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#8BC34A] hover:bg-[#7CB342] text-white shadow-sm">
                      Nueva Multa Manual
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] bg-white">
                    <DialogHeader>
                      <DialogTitle>Aplicar Multa Manual</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-5 py-4">
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-medium">Residente</Label>
                        <div className="col-span-3">
                          <Select 
                            onValueChange={(val) => setNewMulta({...newMulta, residente_id: parseInt(val)})}
                          >
                            <SelectTrigger className="bg-white border-gray-200">
                              <SelectValue placeholder="Seleccione residente..." />
                            </SelectTrigger>
                            <SelectContent>
                              {residentes.map((r) => (
                                <SelectItem key={r.id} value={r.id.toString()}>
                                  {r.nombre} {r.apellido} - {r.vivienda_numero}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-medium">Tipo</Label>
                        <div className="col-span-3">
                          <Select 
                            onValueChange={(val: any) => setNewMulta({...newMulta, tipo: val})}
                            defaultValue="OTRO"
                          >
                            <SelectTrigger className="bg-white border-gray-200">
                              <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="RETRASO_PAGO">Retraso Pago</SelectItem>
                              <SelectItem value="RUIDO">Ruido Molesto</SelectItem>
                              <SelectItem value="INFRAESTRUCTURA">Daño Infraestructura</SelectItem>
                              <SelectItem value="MASCOTA">Mascota</SelectItem>
                              <SelectItem value="OTRO">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-medium">Monto ($)</Label>
                        <Input 
                          type="number"
                          className="col-span-3 bg-white border-gray-200" 
                          placeholder="Ej: 15000"
                          onChange={(e) => setNewMulta({...newMulta, monto: parseFloat(e.target.value)})}
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-medium">Descripción</Label>
                        <Input 
                          className="col-span-3 bg-white border-gray-200" 
                          placeholder="Detalle de la infracción"
                          onChange={(e) => setNewMulta({...newMulta, descripcion: e.target.value})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreate} className="bg-[#8BC34A] hover:bg-[#7CB342] text-white">
                        Guardar Multa
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Residente</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Descripción</th>
                    <th className="px-6 py-4">Monto</th>
                    <th className="px-6 py-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={6} className="p-12 text-center text-gray-400">Cargando datos...</td></tr>
                  ) : multasVisibles.length === 0 ? (
                    <tr><td colSpan={6} className="p-12 text-center text-gray-400">No hay multas registradas</td></tr>
                  ) : multasVisibles.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-400 font-mono text-xs">#{m.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {getNombreResidente(m.residente_id)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-gray-100 rounded-md text-xs font-semibold text-gray-600 border border-gray-200">
                          {m.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]" title={m.descripcion}>
                        {m.descripcion}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        ${m.monto.toLocaleString('es-CL')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          m.estado === 'PENDIENTE' 
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {m.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
