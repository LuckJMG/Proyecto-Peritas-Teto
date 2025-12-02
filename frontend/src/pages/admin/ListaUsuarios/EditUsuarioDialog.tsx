import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { usuarioService, type Usuario, type UsuarioUpdate, type RolUsuario } from "@/services/usuarioService";
import { residenteService } from "@/services/residenteService";
// 1. IMPORTAR EL HOOK
import { useRegistroAutomatico } from "@/services/registroService";

interface EditUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  onSuccess: () => void;
}

export function EditUsuarioDialog({ open, onOpenChange, usuario, onSuccess }: EditUsuarioDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. INICIALIZAR EL HOOK
  const { registrar } = useRegistroAutomatico();

  // Campos de Usuario
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<RolUsuario>("RESIDENTE");
  const [password, setPassword] = useState(""); 

  // Campos de Residente
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");
  const [viviendaNumero, setViviendaNumero] = useState("");
  const [esPropietario, setEsPropietario] = useState(false);
  
  const [tienePerfilResidente, setTienePerfilResidente] = useState(false);

  useEffect(() => {
    if (open && usuario) {
      setNombre(usuario.nombre);
      setApellido(usuario.apellido);
      setEmail(usuario.email);
      setRol(usuario.rol);
      setPassword(""); 
      setError(null);
      
      fetchResidenteData(usuario.id);
    }
  }, [open, usuario]);

  const fetchResidenteData = async (userId: number) => {
    try {
      const residentes = await residenteService.getAll();
      const residenteEncontrado = residentes.find(r => r.usuario_id === userId);

      if (residenteEncontrado) {
        setTienePerfilResidente(true);
        setRut(residenteEncontrado.rut);
        setTelefono(residenteEncontrado.telefono || "");
        setViviendaNumero(residenteEncontrado.vivienda_numero);
        setEsPropietario(residenteEncontrado.es_propietario);
      } else {
        setTienePerfilResidente(false);
        setRut("");
        setTelefono("");
        setViviendaNumero("");
        setEsPropietario(false);
      }
    } catch (err) {
      console.error("Error cargando datos de residente", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;
    setError(null);
    setLoading(true);

    try {
      const payload: UsuarioUpdate = {
        nombre,
        apellido,
        email,
        rol,
      };

      if (password.trim()) {
        // @ts-ignore
        payload.password = password; 
      }

      if (rol === "RESIDENTE" || tienePerfilResidente) {
        payload.rut = rut;
        payload.vivienda_numero = viviendaNumero;
        payload.telefono = telefono;
        payload.es_propietario = esPropietario;
      }

      await usuarioService.update(usuario.id, payload);

      // 3. REGISTRO AUTOMÁTICO (Edición)
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};

      await registrar(
        "EDICION",
        `Admin actualizó el perfil de ${nombre} ${apellido} (Rol: ${rol}, Vivienda: ${viviendaNumero || "N/A"})`,
        {
            condominio_id: user.condominio_id
        }
      );

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Apellido</Label>
              <Input value={apellido} onChange={(e) => setApellido(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Contraseña (Dejar en blanco para mantener actual)</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
          </div>

          <div className="space-y-2">
            <Label>Rol</Label>
            <Select value={rol} onValueChange={(val) => setRol(val as RolUsuario)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="RESIDENTE">Residente</SelectItem>
                <SelectItem value="CONSERJE">Conserje</SelectItem>
                <SelectItem value="DIRECTIVA">Directiva</SelectItem>
                <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(rol === "RESIDENTE" || tienePerfilResidente) && (
            <div className="space-y-4 border-t pt-4 mt-2 bg-gray-50 p-3 rounded-md border border-gray-200">
              <p className="text-sm font-semibold text-gray-700">Datos del Residente</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>RUT</Label>
                  <Input value={rut} onChange={(e) => setRut(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>N° Vivienda</Label>
                  <Input value={viviendaNumero} onChange={(e) => setViviendaNumero(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="edit-propietario" checked={esPropietario} onCheckedChange={(c) => setEsPropietario(c as boolean)} />
                <Label htmlFor="edit-propietario" className="font-normal cursor-pointer">¿Es propietario?</Label>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="bg-[#99D050] hover:bg-[#86b846] text-black" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}