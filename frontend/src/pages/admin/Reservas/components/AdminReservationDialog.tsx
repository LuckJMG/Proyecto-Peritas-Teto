// ... imports iguales ...
import { useState, useMemo } from "react";
import { Loader2, Calendar as CalendarIcon, Clock, Check, PartyPopper } from "lucide-react";
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
import { reservaService } from "@/services/reservaService";
import type { EspacioComun } from "@/services/espaciosComunesService";

interface AdminReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  espacios: EspacioComun[];
  // adminResidenteId YA NO ES NECESARIO AQUÍ
}

export function AdminReservationDialog({
  open,
  onOpenChange,
  onSuccess,
  espacios,
}: AdminReservationDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [espacioId, setEspacioId] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [cantidad, _] = useState("10");
  const [descripcion, setDescripcion] = useState("");

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
    // Ya no validamos residenteId aquí
    if (!espacioId || !date || !horaInicio || !horaFin) {
      setError("Por favor completa los campos obligatorios.");
      return;
    }
    if (horaFin <= horaInicio) {
      setError("La hora de fin debe ser posterior a la de inicio.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const dateStr = format(date, "yyyy-MM-dd");
      const fechaInicioNaive = `${dateStr}T${horaInicio}:00`;
      const fechaFinNaive = `${dateStr}T${horaFin}:00`;

      // Enviamos SIN residente_id, el backend lo resolverá
      await reservaService.create({
        residente_id: 0, // 0 o null para indicar "Backend, haz tu magia"
        espacio_comun_id: Number(espacioId),
        fecha_inicio: fechaInicioNaive,
        fecha_fin: fechaFinNaive,
        cantidad_personas: Number(cantidad),
        observaciones: descripcion,
        es_evento_comunidad: true,
      });

      setEspacioId("");
      setDate(undefined);
      setHoraInicio("");
      setHoraFin("");
      setDescripcion("");
      
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al crear el evento.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-white rounded-xl shadow-2xl border-0 p-0 overflow-hidden">
        {/* ... (Renderizado igual que antes) ... */}
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm">
                <PartyPopper className="w-5 h-5" />
              </div>
              Evento de Comunidad
            </DialogTitle>
            <DialogDescription className="text-blue-700 mt-1.5 text-base font-medium">
              Esta reserva será confirmada automáticamente y no tendrá costo.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>Espacio Común</Label>
            <Select value={espacioId} onValueChange={setEspacioId}>
              <SelectTrigger className="h-12 border-gray-200 bg-white shadow-sm">
                <SelectValue placeholder="Selecciona el lugar del evento..." />
              </SelectTrigger>
              <SelectContent>
                {espacios.map((espacio) => (
                  <SelectItem key={espacio.id} value={espacio.id.toString()}>
                    {espacio.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex flex-col">
            <Label>Fecha del Evento</Label>
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

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-500" /> Inicio</Label>
              <Select value={horaInicio} onValueChange={setHoraInicio}>
                <SelectTrigger className="h-12 border-gray-200 shadow-sm"><SelectValue placeholder="00:00" /></SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {timeSlots.map(t => <SelectItem key={`start-${t}`} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-500" /> Fin</Label>
              <Select value={horaFin} onValueChange={setHoraFin}>
                <SelectTrigger className="h-12 border-gray-200 shadow-sm"><SelectValue placeholder="00:00" /></SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {timeSlots.map(t => <SelectItem key={`end-${t}`} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descripción del Evento (Opcional)</Label>
            <Input 
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Reunión de la directiva, Celebración anual..."
              className="h-12 border-gray-200"
            />
          </div>
        </div>

        <DialogFooter className="bg-gray-50 px-6 py-4 flex-col sm:flex-row gap-3 sm:gap-2 border-t border-gray-100">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting} className="h-11">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-6 shadow-md font-semibold">
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Check className="mr-2 h-4 w-4" /> Crear Evento</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
