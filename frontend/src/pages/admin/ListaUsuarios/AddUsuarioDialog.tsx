import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usuarioService, type RolUsuario, type UsuarioCreate } from "@/services/usuarioService";
import type { Condominio } from "@/services/condominioService";
import { useRegistroAutomatico } from "@/services/registroService";

interface AddUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  condominios: Condominio[];
}

const ROLES: RolUsuario[] = ["ADMINISTRADOR", "CONSERJE", "DIRECTIVA", "RESIDENTE"];

export function AddUsuarioDialog({
  open,
  onOpenChange,
  onSuccess,
  condominios,
}: AddUsuarioDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UsuarioCreate>({
    nombre: "",
    apellido: "",
    email: "",
    rol: "RESIDENTE",
    password_hash: "",
    condominio_id: undefined,
    activo: true,
  });

  const { registrar } = useRegistroAutomatico();

  const handleSubmit = async () => {
    if (
      !formData.nombre.trim() ||
      !formData.apellido.trim() ||
      !formData.email.trim() ||
      !formData.password_hash.trim()
    ) {
      setError("Completa todos los campos obligatorios");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await usuarioService.create(formData);
      
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        rol: "RESIDENTE",
        password_hash: "",
        condominio_id: undefined,
        activo: true,
      });

      registrar(
        "CREACION", 
        `Nuevo usuario registrado: ${formData.nombre} ${formData.apellido}`,
        { datos_adicionales: { email: formData.email, rol: formData.rol } }
      );

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError("Error al crear usuario");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir Residente</DialogTitle>
          <DialogDescription>
            Completa la información del nuevo residente
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>
        )}

        <div className="space-y-3 py-4">
          <Input
            placeholder="Nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          />
          <Input
            placeholder="Apellido"
            value={formData.apellido}
            onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
          />
          <Input
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={formData.password_hash}
            onChange={(e) => setFormData({ ...formData, password_hash: e.target.value })}
          />

          <select
            value={formData.rol}
            onChange={(e) => setFormData({ ...formData, rol: e.target.value as RolUsuario })}
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            {ROLES.map((rol) => (
              <option key={rol} value={rol}>
                {rol}
              </option>
            ))}
          </select>

          <select
            value={formData.condominio_id ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                condominio_id: e.target.value ? Number.parseInt(e.target.value) : undefined,
              })
            }
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            <option value="">Condominio (opcional)</option>
            {condominios.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-[#99D050] hover:bg-[#88bf40] text-white font-medium"
          >
            {submitting ? "Creando..." : "Crear Residente"}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full"
            disabled={submitting}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
