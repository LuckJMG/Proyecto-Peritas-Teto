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

// Constantes para MVP
const CURRENT_ADMIN_ID = 1;
const CURRENT_CONDOMINIO_ID = 1;

export default function AdminMultas() {
  const [multas, setMultas] = useState<Multa[]>([]);
  const [residentes, setResidentes] = useState<Residente[]>([]); // Lista para cruzar datos
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

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
      // Cargamos multas y residentes en paralelo
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

  // Helper para obtener nombre del residente
  const getNombreResidente = (id: number) => {
    const res = residentes.find(r => r.id === id);
    return res ? `${res.nombre} ${res.apellido} (Casa ${res.vivienda_numero})` : `ID: ${id}`;
  };

  const handleProcesarAutomaticas = async () => {
    if (!confirm("¿Generar multas automáticas para gastos vencidos?")) return;
    
    setProcessing(true);
    try {
      const res = await multaService.procesarAtrasos(CURRENT_ADMIN_ID);
      alert(`Proceso completado. Se crearon ${res.multas_creadas} multas nuevas.`);
      // Recargar solo multas
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
      setIsCreateOpen(false);
      // Reset form
      setNewMulta({
        tipo: "OTRO",
        condominio_id: CURRENT_CONDOMINIO_ID,
        creado_por: CURRENT_ADMIN_ID,
        estado: "PENDIENTE"
      });
      // Recargar
      const multasUpdated = await multaService.getAll();
      setMultas(multasUpdated);
    } catch (error) {
      console.error(error);
      alert("Error al crear multa");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Multas</h1>
          <p className="text-gray-500">Administra las sanciones y cobros del condominio.</p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={handleProcesarAutomaticas}
            disabled={processing}
          >
            {processing ? "Procesando..." : "⚡ Generar Multas Automáticas"}
          </Button>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#8BC34A] hover:bg-[#7CB342]">Nueva Multa Manual</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Aplicar Multa Manual</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                
                {/* Selector de Residente Mejorado */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Residente</Label>
                  <div className="col-span-3">
                    <Select 
                      onValueChange={(val) => setNewMulta({...newMulta, residente_id: parseInt(val)})}
                    >
                      <SelectTrigger>
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
                  <Label className="text-right">Tipo</Label>
                  <div className="col-span-3">
                    <Select 
                      onValueChange={(val: any) => setNewMulta({...newMulta, tipo: val})}
                      defaultValue="OTRO"
                    >
                      <SelectTrigger>
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
                  <Label className="text-right">Monto ($)</Label>
                  <Input 
                    type="number"
                    className="col-span-3" 
                    placeholder="Ej: 15000"
                    onChange={(e) => setNewMulta({...newMulta, monto: parseFloat(e.target.value)})}
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Descripción</Label>
                  <Input 
                    className="col-span-3" 
                    placeholder="Detalle de la infracción"
                    onChange={(e) => setNewMulta({...newMulta, descripcion: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>Guardar Multa</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b text-gray-700">
            <tr>
              <th className="px-6 py-3 font-semibold">ID</th>
              <th className="px-6 py-3 font-semibold">Residente</th>
              <th className="px-6 py-3 font-semibold">Tipo</th>
              <th className="px-6 py-3 font-semibold">Descripción</th>
              <th className="px-6 py-3 font-semibold">Monto</th>
              <th className="px-6 py-3 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Cargando datos...</td></tr>
            ) : multas.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No hay multas registradas</td></tr>
            ) : multas.map((m) => (
              <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-500">#{m.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {getNombreResidente(m.residente_id)}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                    {m.tipo}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]" title={m.descripcion}>
                  {m.descripcion}
                </td>
                <td className="px-6 py-4 font-bold text-red-600">
                  ${m.monto.toLocaleString('es-CL')}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
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
  );
}