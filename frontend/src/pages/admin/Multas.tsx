import { useEffect, useState } from "react";
import { multaService, type Multa } from "@/services/multaService";
import { residenteService, type Residente } from "@/services/residenteService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { SidebarAdmin } from "@/components/SidebarAdmin";
import { useRegistroAutomatico } from "@/services/registroService";
import { Zap, Plus } from "lucide-react";

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

  // Inicializar el hook
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
      
      // Registro Automático (Proceso masivo)
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

      // Registro Automático (Multa manual)
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
    <div className="flex flex-col h-screen w-full bg-muted/40 font-sans">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <SidebarAdmin />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Multas</h1>
                <p className="text-muted-foreground mt-1">Administra las sanciones y cobros del condominio.</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={handleProcesarAutomaticas}
                  disabled={processing}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Zap className="h-4 w-4 text-yellow-500" />
                  {processing ? "Procesando..." : "Generar Automáticas"}
                </Button>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#99D050] hover:bg-[#88bf40] text-white gap-2 w-full sm:w-auto">
                      <Plus className="h-4 w-4" />
                      Nueva Multa
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Aplicar Multa Manual</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-medium">Residente</Label>
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
                        <Label className="text-right font-medium">Tipo</Label>
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
                        <Label className="text-right font-medium">Monto ($)</Label>
                        <Input 
                          type="number"
                          className="col-span-3" 
                          placeholder="Ej: 15000"
                          onChange={(e) => setNewMulta({...newMulta, monto: parseFloat(e.target.value)})}
                        />
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right font-medium">Descripción</Label>
                        <Input 
                          className="col-span-3" 
                          placeholder="Detalle de la infracción"
                          onChange={(e) => setNewMulta({...newMulta, descripcion: e.target.value})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreate} className="bg-[#99D050] hover:bg-[#88bf40] text-white">
                        Guardar Multa
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="rounded-md border bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead>Residente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            Cargando datos...
                        </TableCell>
                    </TableRow>
                  ) : multasVisibles.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            No hay multas registradas
                        </TableCell>
                    </TableRow>
                  ) : (
                    multasVisibles.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">#{m.id}</TableCell>
                      <TableCell className="font-medium">
                        {getNombreResidente(m.residente_id)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal text-xs">
                          {m.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate" title={m.descripcion}>
                        {m.descripcion}
                      </TableCell>
                      <TableCell className="font-bold">
                        ${m.monto.toLocaleString('es-CL')}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={m.estado === 'PENDIENTE' 
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200" 
                            : "bg-green-50 text-green-700 border-green-200"
                          }
                        >
                          {m.estado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )))}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
