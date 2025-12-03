import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorAlertProps {
  error: string | null;
  onClose: () => void;
}

export function ErrorAlert({ error, onClose }: ErrorAlertProps) {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-800">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="flex items-center justify-between mt-1">
        <span>{error}</span>
        <button 
          onClick={onClose}
          className="text-xs font-semibold underline hover:text-red-950"
        >
          Cerrar
        </button>
      </AlertDescription>
    </Alert>
  );
}
