import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { usuarioService, type Usuario, type UsuarioUpdate, type RolUsuario } from "@/services/usuarioService";
import { residenteService } from "@/services/residenteService"; // Necesitarás importar esto o buscar al residente de otra forma

interface EditUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  onSuccess: () => void;
}

export function EditUsuarioDialog({ open, onOpenChange, usuario, onSuccess }: EditUsuarioDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos de Usuario
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<RolUsuario>("RESIDENTE");
  const [password, setPassword] = useState(""); // Opcional para cambiar pass

  // Campos de Residente
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");
  const [viviendaNumero, setViviendaNumero] = useState("");
  const [esPropietario, setEsPropietario] = useState(false);
  
  // Para saber si cargamos datos de residente
  const [tienePerfilResidente, setTienePerfilResidente] = useState(false);

  useEffect(() => {
    if (open && usuario) {
      // 1. Cargar datos básicos
      setNombre(usuario.nombre);
      setApellido(usuario.apellido);
      setEmail(usuario.email);
      setRol(usuario.rol);
      setPassword(""); // Limpiar password
      setError(null);
      
      // 2. Intentar cargar datos extra del residente
      // Como el objeto 'usuario' de la lista quizás no tiene todos los campos del residente (rut, telefono)
      // a veces vienen anidados o hay que hacer un fetch extra. 
      // PERO, tu endpoint GET /usuarios ya hace join con residentes.
      // Vamos a asumir que 'usuario' NO tiene los campos planos, sino dentro de una lista 'residentes' si el backend los manda así.
      // O haremos un fetch rápido para asegurar datos frescos.
      
      fetchResidenteData(usuario.id);
    }
  }, [open, usuario]);

  const fetchResidenteData = async (userId: number) => {
    try {
      // OPCION A: Si tu backend GET /usuarios/{id} devuelve la estructura anidada
      // Podemos re-consultar el usuario para tener el detalle completo
      // O usar un servicio de busqueda de residentes.
      // Por simplicidad, asumiremos que si es residente, buscamos su info.
      
      // NOTA: Para que esto funcione fluido, el endpoint GET /usuarios debería devolver 
      // la data del residente aplanada o accesible. 
      // Como parche rápido: Buscamos en todos los residentes del condominio el que coincida con este usuario_id
      const residentes = await residenteService.getAll(); // Esto podría ser pesado si son muchos
      const residenteEncontrado = residentes.find(r => r.usuario_id === userId);

      if (residenteEncontrado) {
        setTienePerfilResidente(true);
        setRut(residenteEncontrado.rut);
        setTelefono(residenteEncontrado.telefono || "");
        setViviendaNumero(residenteEncontrado.vivienda_numero);
        setEsPropietario(residenteEncontrado.es_propietario);
      } else {
        setTienePerfilResidente(false);
        // Limpiar campos
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
        // @ts-ignore: Ajuste por discrepancia de nombres en interfaz vs backend
        payload.password = password; 
      }

      if (rol === "RESIDENTE" || tienePerfilResidente) {
        payload.rut = rut;
        payload.vivienda_numero = viviendaNumero;
        payload.telefono = telefono;
        payload.es_propietario = esPropietario;
      }

      await usuarioService.update(usuario.id, payload);
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