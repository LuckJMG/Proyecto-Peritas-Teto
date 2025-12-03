import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Loader2, CheckCircle, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import NavbarResidente from '@/components/NavbarResidente';
import { useNavigate } from 'react-router-dom';
import { useRegistroAutomatico } from "@/services/registroService";
import { authService } from "@/services/authService";
import { residenteService } from "@/services/residenteService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface PagoDetalle {
  id: number;
  concepto: string;
  monto: number;
  tipo: string;
  fecha: string;
}

interface ResidenteInfo {
  id: number;
  nombre: string;
  email: string;
  vivienda: string;
}

interface PagosPendientesResponse {
  pagos: PagoDetalle[];
  total: number;
  residente: ResidenteInfo;
}

interface PaymentStatus {
  success: boolean;
  message: string;
  transaccion?: string;
  monto?: number;
  autorizacion?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const SistemaPago = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [pagos, setPagos] = useState<PagoDetalle[]>([]);
  const [residente, setResidente] = useState<ResidenteInfo | null>(null);
  const [selectedPagos, setSelectedPagos] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para guardar el ID real del residente logueado
  const [residenteId, setResidenteId] = useState<number | null>(null);

  const { registrar } = useRegistroAutomatico();
  const user = authService.getUser();
  const API_URL = 'http://localhost:8000/api/v1';

  // Cargar datos al montar
  useEffect(() => {
    const initData = async () => {
      // 1. Verificar retorno de Transbank (prioridad por si viene de un pago)
      verificarRetornoTransbank();

      // 2. Obtener el ID del residente asociado al usuario actual
      if (user?.id) {
        try {
          const residentes = await residenteService.getAll();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const miResidente = residentes.find((r: any) => r.usuario_id === user.id);

          if (miResidente) {
            setResidenteId(miResidente.id);
            // 3. Cargar pagos usando el ID correcto
            await cargarPagosPendientes(miResidente.id);
          } else {
            setError('No se encontró un perfil de residente asociado a tu usuario.');
            setLoading(false);
          }
        } catch (err) {
          console.error("Error al identificar residente:", err);
          setError('Error al identificar tu perfil de residente.');
          setLoading(false);
        }
      }
    };

    initData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarPagosPendientes = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/transbank/pagos-pendientes/${id}`);
      
      if (!response.ok) throw new Error('Error al cargar pagos');
      
      const data: PagosPendientesResponse = await response.json();
      setPagos(data.pagos);
      setResidente(data.residente);
      
      // Seleccionar todos los pagos por defecto
      setSelectedPagos(data.pagos.map((p: PagoDetalle) => p.id));
    } catch (err) {
      setError('Error al cargar los pagos pendientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verificarRetornoTransbank = (): void => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token_ws');
    
    if (token) {
      confirmarPagoTransbank(token);
    }
  };

  const confirmarPagoTransbank = async (token: string): Promise<void> => {
    try {
      setIsProcessing(true);
      const response = await fetch(`${API_URL}/transbank/confirmar-pago?token_ws=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      const condominioId = user?.condominio_id || user?.condominioId;
      
      if (data.success) {
        setPaymentStatus({
          success: true,
          message: 'Pago aprobado exitosamente',
          transaccion: data.numero_transaccion,
          monto: data.monto,
          autorizacion: data.codigo_autorizacion
        });

        await registrar(
          'PAGO',
          `Pago Online Aprobado. Monto: $${data.monto?.toLocaleString('es-CL')} - Transacción: ${data.numero_transaccion}`,
          {
            monto: data.monto,
            condominio_id: condominioId,
            datos_adicionales: { metodo: 'WEBPAY', autorizacion: data.codigo_autorizacion }
          }
        );

      } else {
        setPaymentStatus({
          success: false,
          message: 'El pago fue rechazado',
          transaccion: data.numero_transaccion
        });

        await registrar(
          'PAGO',
          `Pago Online Rechazado. Transacción: ${data.numero_transaccion || 'N/A'}`,
          {
            condominio_id: condominioId,
            datos_adicionales: { metodo: 'WEBPAY', estado: 'RECHAZADO' }
          }
        );
      }
    } catch (err) {
      setPaymentStatus({
        success: false,
        message: 'Error al procesar el pago'
      });
      console.error(err);
    } finally {
      setIsProcessing(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const togglePago = (pagoId: number): void => {
    setSelectedPagos(prev => 
      prev.includes(pagoId)
        ? prev.filter(id => id !== pagoId)
        : [...prev, pagoId]
    );
  };

  const calcularTotal = (): number => {
    return pagos
      .filter(p => selectedPagos.includes(p.id))
      .reduce((sum, p) => sum + p.monto, 0);
  };

  const iniciarPagoTransbank = async (): Promise<void> => {
    if (selectedPagos.length === 0) {
      alert('Debes seleccionar al menos un pago');
      return;
    }
    
    if (!residenteId) {
      alert('Error: No se ha identificado el residente para el pago.');
      return;
    }

    try {
      setIsProcessing(true);
      const returnUrl = `${window.location.origin}${window.location.pathname}`;
      
      const response = await fetch(`${API_URL}/transbank/iniciar-pago`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          residente_id: residenteId,
          pagos_ids: selectedPagos,
          email: residente?.email || 'ejemplo@email.com',
          return_url: returnUrl
        })
      });

      if (!response.ok) throw new Error('Error al iniciar pago');

      const data = await response.json();
      
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.url;
      
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = 'token_ws';
      tokenInput.value = data.token;
      
      form.appendChild(tokenInput);
      document.body.appendChild(form);
      form.submit();
      
    } catch (err) {
      setError('Error al iniciar el pago con Transbank');
      console.error(err);
      setIsProcessing(false);
    }
  };

  // Pantalla de confirmación
  if (paymentStatus) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <NavbarResidente />
        <div className="max-w-2xl mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Card className="w-full shadow-lg border-0">
            <CardContent className="p-8 text-center">
              {paymentStatus.success ? (
                <>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in-50 duration-300">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h2>
                  <p className="text-gray-600 mb-8">Tu pago ha sido procesado correctamente.</p>
                  
                  <div className="bg-gray-50 rounded-xl p-6 my-6 text-left border border-gray-100">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-gray-500">Transacción:</div>
                      <div className="font-mono font-semibold text-gray-900">{paymentStatus.transaccion}</div>
                      <div className="text-gray-500">Monto:</div>
                      <div className="font-semibold text-gray-900">${paymentStatus.monto?.toLocaleString('es-CL')}</div>
                      {paymentStatus.autorizacion && (
                        <>
                          <div className="text-gray-500">Autorización:</div>
                          <div className="font-mono text-gray-900">{paymentStatus.autorizacion}</div>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-8">
                    Recibirás un correo de confirmación en <span className="font-medium text-gray-900">{residente?.email}</span>
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-12 h-12 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Pago Rechazado</h2>
                  <p className="text-gray-600 mb-8">{paymentStatus.message}</p>
                </>
              )}
              
              <Button
                onClick={() => {
                  setPaymentStatus(null);
                  if (residenteId) cargarPagosPendientes(residenteId);
                }}
                className="w-full sm:w-auto min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Volver a pagos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <NavbarResidente />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#99D050]" />
            <p className="text-gray-600 font-medium">Cargando pagos pendientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      <NavbarResidente />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="pl-0 hover:bg-transparent text-gray-500 hover:text-gray-900 mb-2"
            onClick={() => navigate('/resumen')}
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> 
            Volver al resumen
          </Button>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-gray-900">Pago de cuenta</h1>
            <p className="text-gray-500">Selecciona los pagos que deseas realizar</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {pagos.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No tienes pagos pendientes</h2>
              <p className="text-gray-500">¡Estás al día con tus gastos comunes!</p>
              <Button 
                className="mt-6 bg-[#99D050] hover:bg-[#88bf40] text-white"
                onClick={() => navigate('/resumen')}
              >
                Volver al inicio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Resumen de Costos */}
            <Card className="border border-gray-100 shadow-sm h-fit">
              <CardHeader>
                <CardTitle className="text-xl text-center">Selección de Pagos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-8 bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Total a Pagar</p>
                  <div className="text-4xl font-extrabold text-gray-900">
                    $ {calcularTotal().toLocaleString('es-CL')}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    <Badge variant="outline" className="bg-white">
                      {selectedPagos.length} seleccionados
                    </Badge>
                  </p>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {pagos.map((pago: PagoDetalle) => (
                    <div
                      key={pago.id}
                      onClick={() => togglePago(pago.id)}
                      className={`
                        w-full rounded-xl p-4 flex items-center justify-between cursor-pointer border transition-all duration-200
                        ${selectedPagos.includes(pago.id)
                          ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm'
                        }
                      `}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-sm">{pago.concepto}</span>
                        <span className={`text-xs ${selectedPagos.includes(pago.id) ? 'text-gray-400' : 'text-gray-500'}`}>
                          {pago.tipo}
                        </span>
                      </div>
                      <span className="font-bold whitespace-nowrap text-lg">
                        ${pago.monto.toLocaleString('es-CL')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Información Transbank */}
            <Card className="border border-gray-100 shadow-sm h-fit">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Pago con Transbank
                  </h2>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    Serás redirigido a la plataforma segura de Webpay Plus para completar tu transacción.
                  </p>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-8">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 text-sm mb-1">
                        Ambiente de Integración
                      </h3>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        Estás utilizando el modo de pruebas. Utiliza las tarjetas de crédito de prueba proporcionadas por Transbank.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={iniciarPagoTransbank}
                  disabled={isProcessing || selectedPagos.length === 0}
                  className="w-full bg-[#99D050] hover:bg-[#88bf40] text-white font-bold h-14 text-lg rounded-xl shadow-md shadow-[#99D050]/20 disabled:opacity-50 disabled:shadow-none"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Pagar con Webpay
                    </>
                  )}
                </Button>

                <div className="text-center mt-8 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest font-semibold">Procesado por</p>
                  <div className="flex justify-center items-center opacity-80 hover:opacity-100 transition-opacity">
                     <span className="font-bold text-xl text-[#d10046] tracking-tighter">transbank</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default SistemaPago;
