import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { pagoService, type Pago } from "@/services/pagoService";
import { Loader2, CreditCard, Receipt, AlertCircle, Plus, FileText } from "lucide-react";
import NavbarResidente from "@/components/NavbarResidente";
import { IngresarPagoDialog } from "./IngresarPagoDialog";
import { ComprobanteDialog } from "./ComprobanteDialog";

export default function HistorialPagos() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para los modales
  const [isRegistrarOpen, setIsRegistrarOpen] = useState(false);
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);

  const fetchPagos = async () => {
    try {
      setLoading(true);
      const user = authService.getUser();
      if (!user) return;

      const data = await pagoService.getByUsuario(user.id);
      // Ordenar por fecha descendente (lo más nuevo primero)
      data.sort((a, b) => new Date(b.fecha_pago).getTime() - new Date(a.fecha_pago).getTime());
      setPagos(data);
      setError(null);
    } catch (err) {
      setError("No se pudo cargar el historial de pagos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagos();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);
  };

  const getStatusColor = (estado?: string) => {
    if (!estado) return "bg-gray-100 text-gray-800 border-gray-200";
    
    switch (estado) {
      case "APROBADO":
      case "COMPLETADO": 
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDIENTE": 
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "RECHAZADO":
      case "FALLIDO":
      case "REVERSADO": 
        return "bg-red-100 text-red-800 border-red-200";
      default: 
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getMetodoIcon = (metodo: string) => {
    if (!metodo) return <CreditCard className="h-4 w-4 mr-2 text-gray-400" />;
    
    const m = metodo.toUpperCase();
    if (m.includes("WEBPAY") || m.includes("TARJETA")) {
      return <CreditCard className="h-4 w-4 mr-2 text-blue-600" />;
    } else if (m.includes("TRANSFERENCIA") || m.includes("KHIPU")) {
      return <Receipt className="h-4 w-4 mr-2 text-purple-600" />;
    } else {
      return <CreditCard className="h-4 w-4 mr-2 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarResidente />

      <div className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Header con Título y Botón de Acción */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Historial de Pagos</h1>
            <p className="text-gray-500 mt-2">Gestiona tus finanzas y reporta nuevos pagos.</p>
          </div>
          
          <Button 
            onClick={() => setIsRegistrarOpen(true)}
            className="bg-[#99D050] hover:bg-[#88bf40] text-white shadow-md transition-all hover:shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Informar Pago
          </Button>
        </div>

        <Card className="border-gray-200 shadow-sm overflow-hidden bg-white rounded-xl">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Transacciones Recientes</CardTitle>
                <CardDescription>Lista detallada de tus movimientos financieros</CardDescription>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pagado</span>
                <div className="text-2xl font-bold text-gray-900">
                  {/* Filtramos solo los aprobados para la suma */}
                  {formatCurrency(
                    pagos
                      .filter(p => p.estado_pago === 'APROBADO')
                      .reduce((sum, p) => sum + Number(p.monto), 0)
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-[#99D050]" />
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center h-64 text-center p-4">
                <AlertCircle className="h-10 w-10 text-red-400 mb-2" />
                <p className="text-gray-900 font-medium">{error}</p>
                <Button variant="link" onClick={fetchPagos} className="mt-2 text-[#99D050]">
                  Intentar nuevamente
                </Button>
              </div>
            ) : pagos.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <Receipt className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No hay pagos registrados</h3>
                <p className="text-gray-500 max-w-sm mx-auto mt-1">
                  Aún no has realizado ningún pago en la plataforma.
                </p>
                <Button 
                  onClick={() => setIsRegistrarOpen(true)}
                  variant="outline"
                  className="mt-4"
                >
                  Informar mi primer pago
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[180px]">Fecha</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead className="hidden md:table-cell">Método</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagos.map((pago) => (
                    <TableRow key={pago.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="font-medium text-gray-600">
                        {pago.fecha_pago ? (
                          <>
                            {format(new Date(pago.fecha_pago), "dd MMM, yyyy", { locale: es })}
                            <div className="text-xs text-gray-400 font-normal">
                              {format(new Date(pago.fecha_pago), "HH:mm")} hrs
                            </div>
                          </>
                        ) : "-"}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 capitalize">
                            {pago.tipo?.replace(/_/g, ' ').toLowerCase() || "Pago"}
                          </span>
                          {pago.detalle && (
                            <span className="text-xs text-gray-500 truncate max-w-[200px]" title={pago.detalle}>
                              {pago.detalle}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center text-sm text-gray-600">
                          {getMetodoIcon(pago.metodo_pago)}
                          <span className="capitalize">
                            {pago.metodo_pago?.toLowerCase() || "Otro"}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(pago.estado_pago)} border px-2.5 py-0.5`}
                        >
                          {/* Safe access to prevent crash */}
                          {pago.estado_pago ? pago.estado_pago.replace(/_/g, ' ').toLowerCase() : 'desconocido'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-right font-bold text-gray-900">
                        {formatCurrency(Number(pago.monto))}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-500 hover:text-[#99D050] hover:bg-green-50"
                          onClick={() => setSelectedPago(pago)}
                          title="Ver Comprobante"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* MODALES */}
        <IngresarPagoDialog 
          open={isRegistrarOpen} 
          onOpenChange={setIsRegistrarOpen} 
          onSuccess={fetchPagos} 
        />

        <ComprobanteDialog 
          open={!!selectedPago} 
          onOpenChange={(open) => !open && setSelectedPago(null)} 
          pago={selectedPago} 
        />
      </div>
    </div>
  );
}
