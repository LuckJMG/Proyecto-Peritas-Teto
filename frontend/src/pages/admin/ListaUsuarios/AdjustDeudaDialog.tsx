import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { gastoComunService, type GastoComun } from "@/services/gastoComunService";
import { multaService, type Multa } from "@/services/multaService";
import type { Usuario } from "@/services/usuarioService";
import { registroService } from "@/services/registroService";

interface AdjustDeudaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
}

type TipoObjeto = "GASTO" | "MULTA" | "REVERTIR";
type EstadoAccion = "idle" | "loading" | "success" | "error";

type ItemLista = { tipo: "GASTO" | "MULTA"; id: number; label: string; monto: number };
type AjusteReciente = { registroId: number; detalle: string; tipo: "GASTO" | "MULTA"; objetoId: number };

export function AdjustDeudaDialog({ open, onOpenChange, usuario }: AdjustDeudaDialogProps) {
  const toInt = (val: number) => Math.round(Number(val));
  const fmt = (val: number) => String(toInt(val));

  const [tipo, setTipo] = useState<TipoObjeto>("GASTO");
  const [selectedTipo, setSelectedTipo] = useState<"GASTO" | "MULTA" | null>(null);
  const [objetoId, setObjetoId] = useState<number | null>(null);
  const [nuevoMonto, setNuevoMonto] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [esCondonacion, setEsCondonacion] = useState<boolean>(false);
  const [motivoReversion, setMotivoReversion] = useState<string>("");
  const [estado, setEstado] = useState<EstadoAccion>("idle");
  const [mensaje, setMensaje] = useState<string>("");
  const [multas, setMultas] = useState<Multa[]>([]);
  const [gastos, setGastos] = useState<GastoComun[]>([]);
  const [cargandoDeudas, setCargandoDeudas] = useState(false);
  const [errorDeudas, setErrorDeudas] = useState<string | null>(null);
  const [ajusteReciente, setAjusteReciente] = useState<AjusteReciente | null>(null);

  useEffect(() => {
    if (!open) {
      setTipo("GASTO");
      setSelectedTipo(null);
      setObjetoId(null);
      setNuevoMonto("");
      setMotivo("");
      setEsCondonacion(false);
      setMotivoReversion("");
      setEstado("idle");
      setMensaje("");
      setMultas([]);
      setGastos([]);
      setErrorDeudas(null);
      setAjusteReciente(null);
    }
  }, [open]);

  useEffect(() => {
    const cargarDeudas = async () => {
      if (!open || !usuario) return;
      const residenteId = (usuario as any).residente_id ?? usuario.id;
      if (!residenteId) {
        setErrorDeudas("No se pudo determinar el residente");
        return;
      }
      setCargandoDeudas(true);
      setErrorDeudas(null);
      try {
        const [m, g] = await Promise.all([
          multaService.getAll(residenteId),
          gastoComunService.getByResidente(residenteId),
        ]);
        setMultas(m);
        setGastos(g);
        await cargarAjusteRecienteGlobal(m, g);
      } catch (err: any) {
        setErrorDeudas(err?.message || "Error al cargar deudas");
      } finally {
        setCargandoDeudas(false);
      }
    };
    cargarDeudas();
  }, [open, usuario]);

  const currentUser = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  })();

  const usuarioId = currentUser?.id;

  const items: ItemLista[] = (() => {
    if (tipo === "GASTO") {
      return gastos
        .filter((g) => toInt(g.monto_total ?? 0) > 0)
        .map((g) => {
          const monto = toInt(g.monto_total ?? 0);
          return { tipo: "GASTO" as const, id: g.id, label: `Gasto #${g.id} - ${g.mes}/${g.anio} - $${fmt(monto)}`, monto };
        });
    }
    if (tipo === "MULTA") {
      return multas
        .filter((m) => toInt(m.monto ?? 0) > 0)
        .map((m) => {
          const monto = toInt(m.monto ?? 0);
          return { tipo: "MULTA" as const, id: m.id, label: `Multa #${m.id} - ${m.tipo} - $${fmt(monto)}`, monto };
        });
    }
    return [];
  })();

  const handleAjustar = async () => {
    if (!usuario) return;
    if (!usuarioId) {
      setEstado("error");
      setMensaje("No se pudo obtener el usuario actual");
      return;
    }

    if (tipo === "REVERTIR") {
      if (!ajusteReciente) {
        setEstado("error");
        setMensaje("No hay ajustes previos para revertir");
        return;
      }
      setEstado("loading");
      setMensaje("");
      try {
        const payload = { registro_id: ajusteReciente.registroId, motivo: motivoReversion || "Reversion de ultimo ajuste", usuario_id: usuarioId };
        if (ajusteReciente.tipo === "GASTO") {
          await gastoComunService.revertir(ajusteReciente.objetoId, payload);
        } else {
          await multaService.revertir(ajusteReciente.objetoId, payload);
        }
        setEstado("success");
        setMensaje("Reversion aplicada");
        await cargarAjusteRecienteGlobal(multas, gastos);
      } catch (err: any) {
        setEstado("error");
        setMensaje(err?.message || "Error al revertir");
      }
      return;
    }

    if (!objetoId || !selectedTipo) {
      setEstado("error");
      setMensaje("Selecciona un item de la lista");
      return;
    }
    if (!nuevoMonto || !motivo) {
      setEstado("error");
      setMensaje("Ingresa monto y motivo");
      return;
    }

    setEstado("loading");
    setMensaje("");
    try {
      const payload = {
        nuevo_monto: toInt(Number(nuevoMonto)),
        motivo,
        es_condonacion: esCondonacion,
        usuario_id: usuarioId,
      };
      if (selectedTipo === "GASTO") {
        await gastoComunService.ajustar(objetoId, payload);
      } else {
        await multaService.ajustar(objetoId, payload);
      }
      setEstado("success");
      setMensaje("Ajuste aplicado correctamente");
      await cargarAjusteRecienteGlobal(multas, gastos);
    } catch (err: any) {
      setEstado("error");
      setMensaje(err?.message || "Error al ajustar");
    }
  };

  const seleccionarObjeto = (item: ItemLista) => {
    setObjetoId(item.id);
    setSelectedTipo(item.tipo);
    setNuevoMonto(esCondonacion ? "0" : fmt(item.monto));
    setEstado("idle");
    setMensaje("");
  };

  const cargarAjusteRecienteGlobal = async (multasLista: Multa[], gastosLista: GastoComun[]) => {
    try {
      const registros = await registroService.getAll({ tipo_evento: "EDICION" });
      const gastoIds = new Set(gastosLista.map((g) => g.id));
      const multaIds = new Set(multasLista.map((m) => m.id));

      const match = registros
        .map((r) => {
          try {
            const meta = r.datos_adicionales ? JSON.parse(r.datos_adicionales) : {};
            return { r, meta };
          } catch {
            return { r, meta: {} };
          }
        })
        .filter(({ meta }) => {
          if (meta?.tipo_objeto === "GASTO" && gastoIds.has(meta.gasto_id)) return true;
          if (meta?.tipo_objeto === "MULTA" && multaIds.has(meta.multa_id)) return true;
          return false;
        })
        .sort((a, b) => new Date(b.r.fecha_creacion).getTime() - new Date(a.r.fecha_creacion).getTime())
        .map(({ r, meta }) => ({ r, meta }))[0];

      if (match) {
        const tipoObj: "GASTO" | "MULTA" = match.meta.tipo_objeto === "GASTO" ? "GASTO" : "MULTA";
        const objeto = tipoObj === "GASTO" ? match.meta.gasto_id : match.meta.multa_id;
        setAjusteReciente({ registroId: match.r.id, detalle: match.r.detalle || "", tipo: tipoObj, objetoId: objeto });
      } else {
        setAjusteReciente(null);
      }
    } catch (err) {
      console.warn("No se pudieron cargar ajustes previos", err);
      setAjusteReciente(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajustar deuda de {usuario ? `${usuario.nombre} ${usuario.apellido}` : ""}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Label>Tipo</Label>
              <Select
                value={tipo}
                onValueChange={(val) => {
                  setTipo(val as TipoObjeto);
                  setObjetoId(null);
                  setSelectedTipo(null);
                  setNuevoMonto("");
                  setMensaje("");
                  setEstado("idle");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GASTO">Gasto común</SelectItem>
                  <SelectItem value="MULTA">Multa</SelectItem>
                  <SelectItem value="REVERTIR">Revertir ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {tipo !== "REVERTIR" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <Label>Nuevo monto</Label>
                  <Input
                    value={nuevoMonto}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNuevoMonto(val ? fmt(Number(val)) : "");
                    }}
                    placeholder="Ej: 50000"
                    readOnly={esCondonacion}
                    className={esCondonacion ? "bg-gray-100" : ""}
                  />
                </div>
                <div className="flex items-end gap-2 pb-2">
                  <Checkbox
                    id="condonacion"
                    checked={esCondonacion}
                    onCheckedChange={(checked) => {
                      setEsCondonacion(checked as boolean);
                      setNuevoMonto(checked ? "0" : (nuevoMonto ? fmt(Number(nuevoMonto)) : ""));
                    }}
                  />
                  <Label htmlFor="condonacion" className="text-sm cursor-pointer">Condonación</Label>
                </div>
              </div>

              <div className="grid gap-1">
                <Label>Motivo</Label>
                <Input
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Explica el ajuste"
                />
              </div>
            </>
          )}

          {tipo === "REVERTIR" && (
            <div className="grid gap-1">
              <Label>Último ajuste</Label>
              {ajusteReciente ? (
                <div className="p-3 bg-gray-50 rounded border text-sm">
                  <p className="text-gray-700 font-medium">Registro #{ajusteReciente.registroId} - {ajusteReciente.detalle || "Detalle no disponible"}</p>
                  <p className="text-xs text-gray-500">Objeto: {ajusteReciente.tipo} #{ajusteReciente.objetoId}</p>
                </div>
              ) : (
                <p className="text-sm text-red-500">No hay ajustes previos para revertir.</p>
              )}
              <div className="grid gap-1 mt-2">
                <Label>Motivo reversión</Label>
                <Input
                  value={motivoReversion}
                  onChange={(e) => setMotivoReversion(e.target.value)}
                  placeholder="Explica la reversión"
                  disabled={!ajusteReciente}
                />
              </div>
            </div>
          )}

          {estado === "error" && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{mensaje}</p>
          )}
          {estado === "success" && (
            <p className="text-sm text-green-600 bg-green-50 p-2 rounded">{mensaje}</p>
          )}

          {tipo !== "REVERTIR" && (
            <>
              <div className="border-t pt-3 mt-2" />
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Selecciona un {tipo === "GASTO" ? "gasto común" : "multa"}
                </p>
                {errorDeudas && <p className="text-xs text-red-600 mb-2">{errorDeudas}</p>}
                {cargandoDeudas ? (
                  <p className="text-xs text-gray-500">Cargando deudas...</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-auto pr-1 custom-scrollbar">
                    {items.map((item) => (
                      <div
                        key={`${item.tipo}-${item.id}`}
                        className={`flex items-center justify-between rounded border px-3 py-2 text-xs transition-colors ${objetoId === item.id && selectedTipo === item.tipo ? "border-green-500 bg-green-50" : "hover:bg-gray-50"}`}
                      >
                        <div className="text-gray-700 font-medium">{item.label}</div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-green-600 hover:text-green-700 hover:bg-green-100"
                          onClick={() => seleccionarObjeto(item)}
                        >
                          Seleccionar
                        </Button>
                      </div>
                    ))}
                    {items.length === 0 && !errorDeudas && (
                      <p className="text-xs text-gray-500 text-center py-4">No hay deudas para este residente.</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex justify-between gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={estado === "loading"}>
            Cerrar
          </Button>
          <Button 
            onClick={handleAjustar} 
            disabled={estado === "loading" || (tipo === "REVERTIR" && !ajusteReciente)}
            className="bg-[#99D050] hover:bg-[#88bf40] text-white font-medium"
          >
            {tipo === "REVERTIR" ? "Aplicar reversión" : esCondonacion ? "Aplicar condonación" : "Aplicar ajuste"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
