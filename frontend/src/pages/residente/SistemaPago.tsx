import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Loader2, CheckCircle, XCircle } from 'lucide-react';
import NavbarResidente from '@/components/NavbarResidente';
import { Link } from 'react-router-dom';
// 1. IMPORTACIONES NUEVAS PARA REGISTRO
import { useRegistroAutomatico } from "@/services/registroService";
import { authService } from "@/services/authService";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [pagos, setPagos] = useState<PagoDetalle[]>([]);
  const [residente, setResidente] = useState<ResidenteInfo | null>(null);
  const [selectedPagos, setSelectedPagos] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 2. INICIALIZAR EL HOOK DE REGISTRO
  const { registrar } = useRegistroAutomatico();
  const user = authService.getUser();

  // Simular ID de residente (en producción vendría de autenticación)
  const RESIDENTE_ID = 1;
  const API_URL = 'http://localhost:8000/api/v1';

  // Cargar pagos pendientes al montar el componente
  useEffect(() => {
    cargarPagosPendientes();
    verificarRetornoTransbank();
  }, []);

  const cargarPagosPendientes = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/transbank/pagos-pendientes/${RESIDENTE_ID}`);
      
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
    // Verificar si venimos de vuelta de Transbank
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
      
      // Obtenemos el ID del condominio del usuario actual para el log
      const condominioId = user?.condominio_id || user?.condominioId;
      
      if (data.success) {
        setPaymentStatus({
          success: true,
          message: 'Pago aprobado exitosamente',
          transaccion: data.numero_transaccion,
          monto: data.monto,
          autorizacion: data.codigo_autorizacion
        });

        // 3. REGISTRAR ÉXITO AUTOMÁTICAMENTE
        await registrar(
          'PAGO',
          `Pago Online Aprobado (Transbank). Monto: $${data.monto?.toLocaleString('es-CL')} - Transacción: ${data.numero_transaccion}`,
          {
            monto: data.monto,
            condominio_id: condominioId,
            datos_adicionales: { 
              metodo: 'WEBPAY', 
              autorizacion: data.codigo_autorizacion 
            }
          }
        );

      } else {
        setPaymentStatus({
          success: false,
          message: 'El pago fue rechazado',
          transaccion: data.numero_transaccion
        });

        // 3. REGISTRAR RECHAZO AUTOMÁTICAMENTE
        await registrar(
          'PAGO',
          `Pago Online Rechazado/Anulado (Transbank). Transacción: ${data.numero_transaccion || 'N/A'}`,
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
      // Limpiar URL
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

    try {
      setIsProcessing(true);
      
      // Obtener la URL actual para el return
      const returnUrl = `${window.location.origin}${window.location.pathname}`;
      
      const response = await fetch(`${API_URL}/transbank/iniciar-pago`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          residente_id: RESIDENTE_ID,
          pagos_ids: selectedPagos,
          email: residente?.email || 'ejemplo@email.com',
          return_url: returnUrl
        })
      });

      if (!response.ok) throw new Error('Error al iniciar pago');

      const data = await response.json();
      
      // Crear formulario para redireccionar a Transbank
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

  // Pantalla de confirmación de pago
  if (paymentStatus) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarResidente />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {paymentStatus.success ? (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Pago Exitoso!</h2>
                <p className="text-gray-600 mb-2">Tu pago ha sido procesado correctamente.</p>
                <div className="bg-gray-50 rounded-lg p-4 my-6 text-left">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-gray-500">Transacción:</div>
                    <div className="font-mono font-semibold">{paymentStatus.transaccion}</div>
                    <div className="text-gray-500">Monto:</div>
                    <div className="font-semibold">${paymentStatus.monto?.toLocaleString('es-CL')}</div>
                    {paymentStatus.autorizacion && (
                      <>
                        <div className="text-gray-500">Autorización:</div>
                        <div className="font-mono">{paymentStatus.autorizacion}</div>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-8">
                  Recibirás un correo de confirmación en {residente?.email}
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Pago Rechazado</h2>
                <p className="text-gray-600 mb-8">{paymentStatus.message}</p>
              </>
            )}
            
            <button
              onClick={() => {
                setPaymentStatus(null);
                cargarPagosPendientes();
              }}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Volver a pagos
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando pagos pendientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <NavbarResidente />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          to="/resumen" 
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Estado de cuenta
        </Link>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pago de cuenta</h1>
          <p className="text-gray-500 mt-1">Selecciona los pagos que deseas realizar</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {pagos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No tienes pagos pendientes</h2>
            <p className="text-gray-600">¡Estás al día con tus pagos!</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Payment Summary */}
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-2xl font-bold text-center mb-8">Costo total</h2>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-gray-900">
                  $ {calcularTotal().toLocaleString('es-CL')}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedPagos.length} de {pagos.length} pagos seleccionados
                </p>
              </div>

              <div className="space-y-3">
                {pagos.map((pago: PagoDetalle) => (
                  <button
                    key={pago.id}
                    onClick={() => togglePago(pago.id)}
                    className={`w-full rounded-full px-6 py-3 flex items-center justify-between transition-all ${
                      selectedPagos.includes(pago.id)
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="font-medium">{pago.concepto}</span>
                    <span className="font-bold">$ {pago.monto.toLocaleString('es-CL')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column - Transbank Info */}
            <div className="bg-white rounded-lg shadow p-8">
              <div className="text-center mb-8">
                <CreditCard className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Pago con Transbank
                </h2>
                <p className="text-gray-600">
                  Serás redirigido a la plataforma segura de Transbank para completar tu pago
                </p>
              </div>

              {/* Info sobre ambiente de prueba */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  🧪 Ambiente de Prueba
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  Este es un ambiente de integración. Usa estas tarjetas de prueba:
                </p>
                <div className="bg-white rounded p-3 text-sm space-y-2">
                  <div>
                    <div className="font-semibold">VISA (Aprobada):</div>
                    <div className="font-mono">4051 8856 0044 6623</div>
                  </div>
                  <div>
                    <div className="font-semibold">Mastercard (Rechazada):</div>
                    <div className="font-mono">5186 0595 5959 0568</div>
                  </div>
                  <div className="text-gray-600">
                    CVV: cualquiera | Fecha: cualquier fecha futura
                  </div>
                  <div className="text-gray-600">
                    Cuando aparece un formulario de autenticación con RUT y clave, se debe usar el RUT 11.111.111-1 y la clave 123.
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Conexión segura encriptada SSL
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Tus datos bancarios no son almacenados
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Confirmación instantánea por email
                  </p>
                </div>
              </div>

              <button
                onClick={iniciarPagoTransbank}
                disabled={isProcessing || selectedPagos.length === 0}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Redirigiendo a Transbank...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pagar con Transbank
                  </>
                )}
              </button>

              {/* Transbank Logo */}
              <div className="text-center mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-3">Powered by</p>
                <svg className="h-8 mx-auto" viewBox="0 0 200 50" fill="none">
                  <text x="10" y="30" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#E63946">
                    transbank
                  </text>
                  <text x="10" y="42" fontFamily="Arial, sans-serif" fontSize="7" fill="#666">
                    APOYANDO NEGOCIOS
                  </text>
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SistemaPago;