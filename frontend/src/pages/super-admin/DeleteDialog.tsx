import { Loader2, AlertTriangle } from "lucide-react";
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-6 w-6" />
            <DialogTitle>¿Deshabilitar condominio?</DialogTitle>
          </div>
          <DialogDescription>
            ¿Estás seguro de que quieres deshabilitar <span className="font-medium text-foreground">"{condominio?.nombre}"</span>?
            <br />
            Esta acción marcará el condominio como inactivo y restringirá su acceso.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={submitting}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
