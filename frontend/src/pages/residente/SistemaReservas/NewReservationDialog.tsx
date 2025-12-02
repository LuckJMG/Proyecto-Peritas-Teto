import { useState, useMemo, useEffect } from "react";
import { Loader2, Calendar as CalendarIcon, Users, Clock, Check, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { reservaService, type Reserva } from "@/services/reservaService";
import type { EspacioComun } from "@/services/espaciosComunesService";

// IMPORTAMOS EL HOOK DESDE TU SERVICIO EXISTENTE
import { useRegistroAutomatico } from "@/services/registroService";

interface NewReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  espacios: EspacioComun[];
  residenteId: number | null;
}

export function NewReservationDialog({
  open,
  onOpenChange,
  onSuccess,
  espacios,
  residenteId,
}: NewReservationDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializamos el hook de registro
  const { registrar } = useRegistroAutomatico();

  // Form States
  const [espacioId, setEspacioId] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [cantidad, setCantidad] = useState("1");

  // Estado para reservas existentes (para bloquear horarios)
  const [existingReservations, setExistingReservations] = useState<Reserva[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);

  // 1. Cargar reservas existentes cuando cambie el espacio o la fecha
  useEffect(() => {
    if (!espacioId || !date) {
        setExistingReservations([]);
        return;
    }

    const fetchConflicts = async () => {
        setIsLoadingReservations(true);
        try {
            const all = await reservaService.getAll();
            const selectedDateStr = format(date, "yyyy-MM-dd");
            const filtered = all.filter(r => 
                r.espacio_comun_id === Number(espacioId) &&
                r.fecha_reserva === selectedDateStr &&
                r.estado !== "CANCELADA"
            );
            setExistingReservations(filtered);
        } catch (err) {
            console.error("Error cargando disponibilidad", err);
        } finally {
            setIsLoadingReservations(false);
        }
    };

    fetchConflicts();
  }, [espacioId, date]);

  // 2. Helper para verificar si una hora está ocupada
  const isTimeOccupied = (timeStr: string) => {
    return existingReservations.some(r => {
        const start = r.hora_inicio.substring(0, 5); 
        const end = r.hora_fin.substring(0, 5);      
        return timeStr >= start && timeStr < end;
    });
  };

  // 3. Generar intervalos de 30 minutos
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let i = 0; i < 24 * 2; i++) {
      const totalMinutes = i * 30;
      const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
      const minutes = (totalMinutes % 60).toString().padStart(2, "0");
      slots.push(`${hours}:${minutes}`);
    }
    return slots;
  }, []);

  const handleSubmit = async () => {
    if (!residenteId) {
      setError("Error de sesión: No se identificó al residente.");
      return;
    }
    if (!espacioId || !date || !horaInicio || !horaFin || !cantidad) {
      setError("Por favor completa todos los campos.");
      return;
    }

    if (horaFin <= horaInicio) {
      setError("La hora de fin debe ser posterior a la de inicio.");
      return;
    }

    const conflict = existingReservations.some(r => {
        const rStart = r.hora_inicio.substring(0, 5);
        const rEnd = r.hora_fin.substring(0, 5);
        return horaInicio < rEnd && horaFin > rStart;
    });

    if (conflict) {
        setError("El horario seleccionado entra en conflicto con una reserva existente.");
        return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const dateStr = format(date, "yyyy-MM-dd");

      // CORRECCIÓN TIMEZONE: Enviar string "YYYY-MM-DDTHH:mm:ss" SIN la 'Z' ni offset.
      const fechaInicioNaive = `${dateStr}T${horaInicio}:00`;
      const fechaFinNaive = `${dateStr}T${horaFin}:00`;

      // 1. Crear Reserva
      await reservaService.create({
        residente_id: residenteId,
        espacio_comun_id: Number(espacioId),
        fecha_inicio: fechaInicioNaive,
        fecha_fin: fechaFinNaive,
        cantidad_personas: Number(cantidad),
      });

      // 2. Registrar Acción (LOG)
      // Buscamos el nombre del espacio para que el log sea legible
      const espacioNombre = espacios.find(e => e.id.toString() === espacioId)?.nombre || "Espacio Común";
      
      await registrar(
        "RESERVA",
        `Residente solicitó reserva en ${espacioNombre} para el día ${dateStr} (${horaInicio} - ${horaFin})`,
        {
            // Opcional: podrías pasar el condominio_id si lo tienes a mano en 'espacios' o context
        }
      );

      // Reset
      setEspacioId("");
      setDate(undefined);
      setHoraInicio("");
      setHoraFin("");
      setCantidad("1");
      setExistingReservations([]);

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al crear la reserva.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-white rounded-xl shadow-2xl border-0 p-0 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="bg-[#99D050] p-2 rounded-lg text-white shadow-sm">
                <CalendarIcon className="w-5 h-5" />
              </div>
              Nueva Reserva
            </DialogTitle>
            <DialogDescription className="text-gray-500 mt-1.5 text-base">
              Agenda tu espacio común favorito.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200 flex items-center animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 mr-2" /> {error}
            </div>
          )}

          {/* Selección de Espacio */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Espacio Común</Label>
            <Select value={espacioId} onValueChange={setEspacioId}>
              <SelectTrigger className="h-12 border-gray-200 bg-white shadow-sm hover:border-[#99D050] transition-colors focus:ring-[#99D050]">
                <SelectValue placeholder="Selecciona un espacio..." />
              </SelectTrigger>
              <SelectContent>
                {espacios.map((espacio) => (
                  <SelectItem key={espacio.id} value={espacio.id.toString()}>
                    <div className="flex items-center justify-between w-full min-w-[200px]">
                      <span className="font-medium text-gray-900">{espacio.nombre}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full ml-2">
                        {espacio.costo_por_hora ? `$${espacio.costo_por_hora.toLocaleString('es-CL')}/hr` : "Gratis"}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha */}
          <div className="space-y-2 flex flex-col">
            <Label className="text-sm font-semibold text-gray-700">Fecha del evento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "h-12 w-full pl-3 text-left font-normal border-gray-200 shadow-sm hover:bg-gray-50",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? (
                    <span className="text-gray-900 font-medium">
                        {format(date, "PPP", { locale: es })}
                    </span>
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  locale={es}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Horarios con Bloqueo de Ocupados */}
          <div className="grid grid-cols-2 gap-5 relative">
            {isLoadingReservations && (
                <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-[#99D050]" />
                </div>
            )}
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#99D050]" /> Inicio
              </Label>
              <Select value={horaInicio} onValueChange={setHoraInicio} disabled={!date || !espacioId}>
                <SelectTrigger className="h-12 border-gray-200 shadow-sm">
                  <SelectValue placeholder="00:00" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {timeSlots.map((time) => {
                    const occupied = isTimeOccupied(time);
                    return (
                        <SelectItem 
                            key={`start-${time}`} 
                            value={time}
                            disabled={occupied}
                            className={occupied ? "text-gray-300 line-through decoration-gray-300" : ""}
                        >
                        {time} {occupied && "(Ocupado)"}
                        </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-red-400" /> Fin
              </Label>
              <Select value={horaFin} onValueChange={setHoraFin} disabled={!date || !espacioId}>
                <SelectTrigger className="h-12 border-gray-200 shadow-sm">
                  <SelectValue placeholder="00:00" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {timeSlots.map((time) => (
                    <SelectItem key={`end-${time}`} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cantidad de Personas */}
          <div className="space-y-2">
            <Label htmlFor="personas" className="text-sm font-semibold text-gray-700">Asistentes estimados</Label>
            <div className="relative">
              <Input
                id="personas"
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="pl-10 h-12 border-gray-200 shadow-sm focus-visible:ring-[#99D050]"
              />
              <Users className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="bg-gray-50 px-6 py-4 flex-col sm:flex-row gap-3 sm:gap-2 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="h-11 border-gray-300 text-gray-700 hover:bg-gray-100 font-medium"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#99D050] hover:bg-[#88bf40] text-white h-11 px-6 rounded-md shadow-md transition-all active:scale-[0.98] font-semibold"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Confirmar Reserva
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
