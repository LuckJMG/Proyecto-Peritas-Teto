import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { alertaService, type Alerta } from "@/services/alertaService"; // CORRECCIÓN 1: 'type Alerta'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Bell, CheckCircle, Clock, AlertTriangle, FileEdit } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminAlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlerta, setSelectedAlerta] = useState<Alerta | null>(null);
  const [comentario, setComentario] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchAlertas = async () => {
    setLoading(true);
    try {
      const data = await alertaService.getAll();
      setAlertas(data);
    } catch (error) {
      console.error("Error fetching alertas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertas();
  }, []);

  const handleResolver = async () => {
    if (!selectedAlerta) return;
    try {
      await alertaService.resolver(selectedAlerta.id, comentario);
      setIsDialogOpen(false);
      setComentario("");
      fetchAlertas(); // Recargar lista
    } catch (error) {
      console.error("Error resolviendo alerta", error);
    }
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "MOROSIDAD": return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "MULTA": return <Clock className="h-5 w-5 text-orange-500" />;
      case "EDICION_GASTO": return <FileEdit className="h-5 w-5 text-blue-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F6F8] overflow-hidden font-sans">
      <div className="h-full hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Centro de Alertas</h1>
            <Button onClick={fetchAlertas} variant="outline" size="sm">Actualizar</Button>
          </div>

          {/* CORRECCIÓN 2: Uso de 'loading' para evitar error TS6133 */}
          {loading ? (
            <div className="flex justify-center items-center h-64 text-gray-500">
              Cargando alertas...
            </div>
          ) : (
            <Tabs defaultValue="todas" className="w-full">
              <TabsList>
                <TabsTrigger value="todas">Todas</TabsTrigger>
                <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
                <TabsTrigger value="resueltas">Resueltas</TabsTrigger>
              </TabsList>

              {["todas", "pendientes", "resueltas"].map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-4 space-y-4">
                  {alertas
                    .filter(a => tab === "todas" ? true : tab === "pendientes" ? a.estado === "PENDIENTE" : a.estado === "RESUELTO")
                    .map((alerta) => (
                    <Card key={alerta.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="flex flex-row items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          {getIcon(alerta.tipo)}
                          <div>
                            <CardTitle className="text-base">{alerta.titulo}</CardTitle>
                            <p className="text-xs text-gray-400">
                              {format(new Date(alerta.fecha_creacion), "dd MMMM yyyy HH:mm", { locale: es })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={alerta.estado === "PENDIENTE" ? "destructive" : "default"} className={alerta.estado === "PENDIENTE" ? "bg-red-100 text-red-800 hover:bg-red-200" : "bg-green-100 text-green-800 hover:bg-green-200"}>
                          {alerta.estado}
                        </Badge>
                      </CardHeader>
                      <CardContent className="py-2 pb-4">
                        <p className="text-sm text-gray-600 mb-3">{alerta.descripcion}</p>
                        
                        {alerta.estado === "RESUELTO" && (
                          <div className="bg-gray-50 p-3 rounded-md text-sm border">
                            <p className="font-semibold text-gray-700 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600"/> Resuelto:
                            </p>
                            <p className="text-gray-600 mt-1">{alerta.comentario_resolucion}</p>
                            <p className="text-xs text-gray-400 mt-2 text-right">
                               {alerta.fecha_resolucion && format(new Date(alerta.fecha_resolucion), "dd/MM/yyyy HH:mm")}
                            </p>
                          </div>
                        )}

                        {alerta.estado === "PENDIENTE" && (
                          <div className="flex justify-end">
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setSelectedAlerta(alerta);
                                setIsDialogOpen(true);
                              }}
                            >
                              Resolver / Comentar
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {alertas.length === 0 && <p className="text-center text-gray-500 mt-10">No hay alertas registradas.</p>}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </main>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolver Alerta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Indica cómo se solucionó esta alerta. Este comentario quedará en el historial.
            </p>
            <Textarea 
              placeholder="Ej: Se contactó al residente y se acordó fecha de pago..." 
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
             <Button onClick={handleResolver} disabled={!comentario.trim()}>Confirmar Resolución</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}