import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { usuarioService, type UsuarioCreate, type RolUsuario } from "@/services/usuarioService";

interface AddUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddUsuarioDialog({ open, onOpenChange, onSuccess }: AddUsuarioDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos básicos de Usuario
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<RolUsuario>("RESIDENTE");
  
  // Campos específicos de Residente
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");
  const [viviendaNumero, setViviendaNumero] = useState("");
  const [esPropietario, setEsPropietario] = useState(false);

  // Obtener ID del condominio del usuario logueado
  const [adminCondominioId, setAdminCondominioId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (open) {
      // Resetear formulario al abrir
      setNombre("");
      setApellido("");
      setEmail("");
      setPassword("");
      setRol("RESIDENTE");
      setRut("");
      setTelefono("");
      setViviendaNumero("");
      setEsPropietario(false);
      setError(null);

      // Leer condominio del admin
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setAdminCondominioId(user.condominio_id);
      }
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: UsuarioCreate = {
        nombre,
        apellido,
        email,
        password_hash: password,
        rol,
        condominio_id: adminCondominioId,
        activo: true,
      };

      // Si es residente, adjuntamos los datos extra
      if (rol === "RESIDENTE") {
        if (!rut || !viviendaNumero) {
          throw new Error("Para crear un residente, el RUT y el N° Vivienda son obligatorios.");
        }
        payload.rut = rut;
        payload.vivienda_numero = viviendaNumero;
        payload.telefono = telefono;
        payload.es_propietario = esPropietario;
      }

      await usuarioService.create(payload);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {/* --- DATOS DE CUENTA DE USUARIO --- */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol">Rol</Label>
            <Select 
              value={rol} 
              onValueChange={(val) => setRol(val as RolUsuario)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RESIDENTE">Residente</SelectItem>
                <SelectItem value="CONSERJE">Conserje</SelectItem>
                <SelectItem value="DIRECTIVA">Directiva</SelectItem>
                <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* --- SECCIÓN EXTRA PARA RESIDENTES --- */}
          {rol === "RESIDENTE" && (
            <div className="space-y-4 border-t pt-4 mt-2 bg-gray-50 p-3 rounded-md border border-gray-200">
              <p className="text-sm font-semibold text-gray-700">Datos del Residente</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rut">RUT (Obligatorio)</Label>
                  <Input
                    id="rut"
                    placeholder="12.345.678-9"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vivienda">N° Vivienda (Obligatorio)</Label>
                  <Input
                    id="vivienda"
                    placeholder="Ej: A-101"
                    value={viviendaNumero}
                    onChange={(e) => setViviendaNumero(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  placeholder="+56 9 ..."
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="propietario" 
                  checked={esPropietario}
                  onCheckedChange={(checked) => setEsPropietario(checked as boolean)}
                />
                <Label htmlFor="propietario" className="text-sm font-normal cursor-pointer">
                  ¿Es propietario de la vivienda?
                </Label>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#99D050] hover:bg-[#86b846] text-white font-medium" disabled={loading}>
              {loading ? "Guardando..." : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
