import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export function ErrorDialog({ isOpen, onClose, message }: ErrorDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] border-l-8 border-l-red-500">
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="p-3 bg-red-50 rounded-full">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          
          <DialogHeader className="text-center sm:text-center w-full">
            <DialogTitle className="text-xl font-bold text-slate-800">
              ¡Ups! Algo salió mal
            </DialogTitle>
            <DialogDescription className="text-center text-slate-600 mt-2 font-medium">
              {message}
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="sm:justify-center w-full mt-2">
          <Button
            onClick={onClose}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold"
          >
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}