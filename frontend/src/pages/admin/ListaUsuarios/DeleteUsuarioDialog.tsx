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
            <b>
              {usuario?.nombre} {usuario?.apellido}
            </b>
            .
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-between mt-6 w-full">
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-1/2 bg-[#e05959] hover:bg-[#d04848] text-white font-semibold h-12"
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
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-1/2 h-12 font-semibold"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
