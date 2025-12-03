import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { SidebarAdmin } from "@/components/SidebarAdmin";
import { alertaService, type Alerta } from "@/services/alertaService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Bell, CheckCircle, Clock, AlertTriangle, FileEdit, RefreshCw } from "lucide-react";
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
      fetchAlertas();
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
    <div className="flex flex-col h-screen w-full bg-muted/40 font-sans">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <SidebarAdmin />

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Centro de Alertas</h1>
            <Button onClick={fetchAlertas} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 text-gray-500">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary mb-4"></div>
              <span>Cargando alertas...</span>
            </div>
          ) : (
            <Tabs defaultValue="todas" className="w-full">
              <TabsList className="bg-white border mb-4">
                <TabsTrigger value="todas">Todas</TabsTrigger>
                <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
                <TabsTrigger value="resueltas">Resueltas</TabsTrigger>
              </TabsList>

              {["todas", "pendientes", "resueltas"].map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-4">
                  {alertas
                    .filter(a => tab === "todas" ? true : tab === "pendientes" ? a.estado === "PENDIENTE" : a.estado === "RESUELTO")
                    .map((alerta) => (
                    <Card key={alerta.id} className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-50 rounded-full border border-gray-100">
                            {getIcon(alerta.tipo)}
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold text-gray-900">{alerta.titulo}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1 capitalize">
                              {format(new Date(alerta.fecha_creacion), "dd MMMM yyyy HH:mm", { locale: es })}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant="outline"
                          className={alerta.estado === "PENDIENTE" 
                            ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-50" 
                            : "bg-green-50 text-green-700 border-green-200 hover:bg-green-50"
                          }
                        >
                          {alerta.estado}
                        </Badge>
                      </CardHeader>
                      
                      <CardContent className="pb-4 pt-0 pl-18">
                        <p className="text-sm text-gray-700 mb-4 leading-relaxed">{alerta.descripcion}</p>
                        
                        {alerta.estado === "RESUELTO" && (
                          <div className="bg-green-50/50 p-4 rounded-lg text-sm border border-green-100">
                            <p className="font-semibold text-green-800 flex items-center gap-2 mb-1">
                              <CheckCircle className="h-4 w-4"/> Resuelto:
                            </p>
                            <p className="text-green-700">{alerta.comentario_resolucion}</p>
                            <p className="text-xs text-green-600/70 mt-2 text-right">
                               {alerta.fecha_resolucion && format(new Date(alerta.fecha_resolucion), "dd/MM/yyyy HH:mm")}
                            </p>
                          </div>
                        )}

                        {alerta.estado === "PENDIENTE" && (
                          <div className="flex justify-end">
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700 text-white"
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
                  
                  {alertas.filter(a => tab === "todas" ? true : tab === "pendientes" ? a.estado === "PENDIENTE" : a.estado === "RESUELTO").length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <Bell className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No hay alertas registradas en esta categoría.</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </main>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Resolver Alerta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Indica cómo se solucionó esta alerta. Este comentario quedará registrado en el historial del sistema.
            </p>
            <Textarea 
              placeholder="Ej: Se contactó al residente y se acordó fecha de pago..." 
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
             <Button onClick={handleResolver} disabled={!comentario.trim()} className="bg-green-600 hover:bg-green-700 text-white">
               Confirmar Resolución
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
