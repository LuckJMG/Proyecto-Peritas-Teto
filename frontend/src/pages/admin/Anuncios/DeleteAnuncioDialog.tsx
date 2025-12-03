import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteAnuncioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}

export function DeleteAnuncioDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
}: DeleteAnuncioDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle className="text-xl font-semibold text-slate-900">
              ¿Eliminar este aviso?
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 mt-2">
              Esta acción no se puede deshacer. El aviso será eliminado permanentemente de la base de datos y dejará de ser visible para los residentes.
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="sm:justify-center gap-2 sm:gap-2 w-full">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            {loading ? "Eliminando..." : "Sí, eliminar aviso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
