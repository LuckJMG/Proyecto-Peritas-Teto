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
import type { Condominio } from "@/types/condominio.types";

interface DeleteDialogProps {
  open: boolean;
  condominio: Condominio | null;
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function DeleteDialog({ 
  open, 
  condominio, 
  submitting, 
  onOpenChange, 
  onConfirm 
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            ¿Deshabilitar condominio?
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 pt-2">
            ¿Estás seguro de que quieres deshabilitar "{condominio?.nombre}"?
            Esta acción marcará el condominio como inactivo.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col mt-4">
          <Button
            onClick={onConfirm}
            disabled={submitting}
            className="w-full bg-[#e05959] hover:bg-[#d04848] text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deshabilitando...
              </>
            ) : (
              'Deshabilitar'
            )}
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
