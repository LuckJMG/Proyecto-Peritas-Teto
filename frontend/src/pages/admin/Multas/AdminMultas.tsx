import { useEffect, useState } from "react";
import { multaService, type Multa } from "@/services/multaService"; // CORREGIDO AQUÍ
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

// NOTA: Para este MVP asumimos Admin ID = 1 y Condominio ID = 1.
const CURRENT_ADMIN_ID = 1;
const CURRENT_CONDOMINIO_ID = 1;

export default function AdminMultas() {
  const [multas, setMultas] = useState<Multa[]>([]);
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
    loadMultas();
  }, []);

  const loadMultas = async () => {
    try {
      const data = await multaService.getAll();
      setMultas(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcesarAutomaticas = async () => {
    if (!confirm("¿Está seguro de generar multas automáticas para los gastos comunes vencidos?")) return;
    
    setProcessing(true);
    try {
      const res = await multaService.procesarAtrasos(CURRENT_ADMIN_ID);
      alert(`Proceso completado. Se crearon ${res.multas_creadas} multas.`);
      loadMultas();
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
      setNewMulta({
        tipo: "OTRO",
        condominio_id: CURRENT_CONDOMINIO_ID,
        creado_por: CURRENT_ADMIN_ID,
        estado: "PENDIENTE"
      });
      loadMultas();
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aplicar Multa Manual</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">ID Residente</Label>
                  <Input 
                    type="number"
                    className="col-span-3" 
                    placeholder="Ej: 1"
                    onChange={(e) => setNewMulta({...newMulta, residente_id: parseInt(e.target.value)})}
                  />
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

      <div className="rounded-md border bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Residente ID</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Descripción</th>
              <th className="px-4 py-3 font-medium">Monto</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center">Cargando...</td></tr>
            ) : multas.map((m) => (
              <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">{m.id}</td>
                <td className="px-4 py-3">{m.residente_id}</td>
                <td className="px-4 py-3">{m.tipo}</td>
                <td className="px-4 py-3">{m.descripcion}</td>
                <td className="px-4 py-3 font-bold text-red-600">${m.monto}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    m.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
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