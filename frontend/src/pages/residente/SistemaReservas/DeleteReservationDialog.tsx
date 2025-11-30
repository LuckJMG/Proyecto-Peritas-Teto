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

interface DeleteReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteReservationDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteReservationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-xl shadow-lg border-0">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            ¿Cancelar reserva?
          </DialogTitle>
          <DialogDescription className="text-gray-500 mt-2">
            Esta acción no se puede deshacer. El espacio quedará disponible para otros residentes.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 flex gap-3 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="w-full sm:w-auto h-11 border-gray-200"
          >
            Volver
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white h-11 px-6 font-medium"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelando...
              </>
            ) : (
              "Sí, cancelar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
