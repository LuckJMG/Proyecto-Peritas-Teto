import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Usuario } from "@/services/usuarioService";

interface DeleteUsuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function DeleteUsuarioDialog({
  open,
  onOpenChange,
  usuario,
  onConfirm,
  isSubmitting,
}: DeleteUsuarioDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¿Eliminar usuario?</DialogTitle>
          <DialogDescription>
            Esta acción eliminará permanentemente al usuario{" "}
            <span className="font-bold text-gray-900">
              {usuario?.nombre} {usuario?.apellido}
            </span>
            .
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-0 mt-4">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full sm:w-1/2 font-semibold"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full sm:w-1/2 bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
